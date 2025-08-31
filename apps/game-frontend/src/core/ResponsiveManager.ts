import { logDebug, logInfo, logWarn, logError } from './Logger';
import { IBounds, IBackgroundBounds } from '../objects/types';
import { IResponsiveObserver, IResponsiveSubject } from './IResponsiveObserver';

// Legacy types for backward compatibility
export type Range = { min?: number; max?: number };
export type RespCondition = { width?: Range; height?: Range; aspect?: Range; dpr?: Range; };
export type Transform = { scale?: number; x?: number; y?: number; visible?: boolean; maxParticles?: number; };
export type Profile = {
    name: string; priority?: number;
    condition: RespCondition;
    canvas?: { width: number; height: number };
    layers: Record<string, Transform>;
};
export type ResponsiveConfig = {
    profiles: Profile[];
    groups: Record<string, string[]>; // layer -> object id list
    fallbackScale?: { min: number; max: number };
};

/**
 * ResponsiveManager handles responsive scaling and positioning of game objects
 * using the Observer pattern for clean, decoupled responsive behavior
 */
export class ResponsiveManager implements IResponsiveSubject {
    private scene: Phaser.Scene;
    private observers: IResponsiveObserver[] = [];
    private backgroundBounds: IBackgroundBounds | null = null;
    private lastScale: number = 1;
    private lastBounds: IBounds | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        logInfo('ResponsiveManager', 'Initialized', {
            sceneName: scene.scene.key,
            note: "Ready to handle responsive scaling using Observer pattern"
        }, 'constructor');
    }

    /**
     * Attach an observer to receive resize notifications
     */
    attach(observer: IResponsiveObserver): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
            logDebug('ResponsiveManager', 'Observer attached', {
                observerId: observer.getObserverId(),
                totalObservers: this.observers.length
            }, 'attach');
        }
    }

    /**
     * Detach an observer from resize notifications
     */
    detach(observer: IResponsiveObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            logDebug('ResponsiveManager', 'Observer detached', {
                observerId: observer.getObserverId(),
                totalObservers: this.observers.length
            }, 'detach');
        }
    }

    /**
     * Notify all observers of a resize event
     */
    notify(scale: number, bounds: IBounds): void {
        logDebug('ResponsiveManager', 'Notifying observers', {
            scale,
            bounds,
            observerCount: this.observers.length
        }, 'notify');

        this.observers.forEach(observer => {
            try {
                observer.onResize(scale, bounds);
            } catch (error) {
                logError('ResponsiveManager', 'Error notifying observer', {
                    observerId: observer.getObserverId(),
                    error
                }, 'notify');
            }
        });
    }

    /**
     * Get the current number of attached observers
     */
    getObserverCount(): number {
        return this.observers.length;
    }

    /**
     * Get background bounds for positioning calculations
     */
    getBackgroundBounds(): IBackgroundBounds | null {
        if (!this.backgroundBounds) {
            const bg = this.scene.children.getByName('bg');
            logDebug('ResponsiveManager', 'Looking for background object', {
                found: !!bg,
                bgName: bg?.name,
                bgType: bg?.constructor?.name,
                hasGetBackgroundBounds: !!(bg && (bg as any).getBackgroundBounds)
            }, 'getBackgroundBounds');
            
            if (bg && (bg as any).getBackgroundBounds) {
                // Use the background object's own getBackgroundBounds method
                this.backgroundBounds = (bg as any).getBackgroundBounds();
                logDebug('ResponsiveManager', 'Background bounds retrieved from object', {
                    bounds: this.backgroundBounds
                }, 'getBackgroundBounds');
            } else if (bg) {
                // Fallback to basic bounds if getBackgroundBounds is not available
                const x = (bg as any).x;
                const y = (bg as any).y;
                const width = (bg as any).displayWidth;
                const height = (bg as any).displayHeight;
                
                logDebug('ResponsiveManager', 'Using fallback bounds calculation', {
                    x, y, width, height
                }, 'getBackgroundBounds');
                
                this.backgroundBounds = {
                    x, y, width, height,
                    left: x,
                    right: x + width,
                    top: y,
                    bottom: y + height,
                    centerX: x + width / 2,
                    centerY: y + height / 2,
                    originalWidth: width,
                    originalHeight: height,
                    finalWidth: width,
                    finalHeight: height,
                    // Container bounds (same as image bounds for now)
                    containerLeft: x,
                    containerRight: x + width,
                    containerTop: y,
                    containerBottom: y + height,
                    containerWidth: width,
                    containerHeight: height,
                    containerCenterX: x + width / 2,
                    containerCenterY: y + height / 2
                };
            } else {
                logWarn('ResponsiveManager', 'No background object found', {
                    sceneChildren: this.scene.children.list.map(child => ({
                        name: child.name,
                        type: child.constructor?.name
                    }))
                }, 'getBackgroundBounds');
            }
        }
        return this.backgroundBounds;
    }

    /**
     * Apply responsive scaling to all registered observers
     * This is the main method called when the screen resizes
     */
    apply(): void {
        logInfo('ResponsiveManager', 'Applying responsive scaling', {
            observerCount: this.observers.length,
            screenDimensions: { width: this.scene.scale.width, height: this.scene.scale.height },
            note: "Will notify all observers using Observer pattern"
        }, 'apply');

        // Get background bounds for scaling calculations
        const bgBounds = this.getBackgroundBounds();
        if (!bgBounds) {
            logWarn('ResponsiveManager', 'No background bounds available', {
                note: "Cannot calculate scaling without background bounds"
            }, 'apply');
            return;
        }

        // Calculate scale factor based on background image
        const originalWidth = bgBounds.originalWidth || bgBounds.width;
        const originalHeight = bgBounds.originalHeight || bgBounds.height;
        const scaleX = bgBounds.width / originalWidth;
        const scaleY = bgBounds.height / originalHeight;
        const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

        logDebug('ResponsiveManager', 'Calculated scale factor', {
            backgroundBounds: bgBounds,
            originalDimensions: { width: originalWidth, height: originalHeight },
            currentDimensions: { width: bgBounds.width, height: bgBounds.height },
            scaleFactors: { scaleX, scaleY, finalScale: scale },
            note: "Using uniform scaling to maintain aspect ratio"
        }, 'apply');

        // Check if we need to notify observers (scale or bounds changed)
        if (this.lastScale !== scale || this.lastBounds !== bgBounds) {
            this.lastScale = scale;
            this.lastBounds = bgBounds;
            
            // Notify all observers using the observer pattern
            this.notify(scale, bgBounds);
            
            logInfo('ResponsiveManager', 'Responsive scaling applied successfully', {
                scale: scale,
                observerCount: this.observers.length,
                note: "All observers have been notified of the resize event"
            }, 'apply');
        } else {
            logDebug('ResponsiveManager', 'No changes detected', {
                scale: scale,
                note: "Scale and bounds unchanged, no notifications sent"
            }, 'apply');
        }
    }

    /**
     * Get embers instances for debugging
     */
    getEmbersInstances(): any[] {
        const instances: any[] = [];
        
        // Look for embers effects in the scene
        this.scene.children.each((child: any) => {
            if (child && child.name && child.name.includes('embers')) {
                instances.push(child);
            }
        });
        
        logInfo('ResponsiveManager', 'Found embers instances', {
            count: instances.length,
            instances: instances.map(inst => inst.name),
            note: "These can be used for manual testing"
        }, 'getEmbersInstances');
        
        return instances;
    }

    /**
     * Get all registered observers
     */
    getObservers(): IResponsiveObserver[] {
        return [...this.observers];
    }

    /**
     * Clear all observers
     */
    clearObservers(): void {
        logInfo('ResponsiveManager', 'Clearing all observers', {
            observerCount: this.observers.length
        }, 'clearObservers');
        
        this.observers = [];
    }

    /**
     * Get current scale factor
     */
    getCurrentScale(): number {
        return this.lastScale;
    }

    /**
     * Get current bounds
     */
    getCurrentBounds(): IBounds | null {
        return this.lastBounds;
    }

    /**
     * Debug method to log current background scaling information
     */
    debugBackgroundScaling(): void {
        const bgBounds = this.getBackgroundBounds();
        if (bgBounds) {
            logInfo('ResponsiveManager', 'Background Scaling Debug Info', {
                currentBounds: {
                    x: bgBounds.x,
                    y: bgBounds.y,
                    width: bgBounds.width,
                    height: bgBounds.height
                },
                originalDimensions: {
                    width: bgBounds.originalWidth,
                    height: bgBounds.originalHeight
                },
                finalDimensions: {
                    width: bgBounds.finalWidth,
                    height: bgBounds.finalHeight
                },
                calculatedScale: {
                    scaleX: bgBounds.width / bgBounds.originalWidth,
                    scaleY: bgBounds.height / bgBounds.originalHeight,
                    uniformScale: Math.min(bgBounds.width / bgBounds.originalWidth, bgBounds.height / bgBounds.originalHeight)
                },
                screenDimensions: {
                    width: this.scene.scale.width,
                    height: this.scene.scale.height
                }
            }, 'debugBackgroundScaling');
        } else {
            logWarn('ResponsiveManager', 'No background bounds available for debugging', {}, 'debugBackgroundScaling');
        }
    }
}
