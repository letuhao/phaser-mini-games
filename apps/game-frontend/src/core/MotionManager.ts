import { IMotion, IAnimatable, ITweenable, IGameObject } from '../objects/types';
import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Motion Manager using the Motion Pattern
 * Manages movement, animation, and tweening for game objects
 */
export class MotionManager {
    private motionObjects: Map<string, IMotion> = new Map();
    private animatableObjects: Map<string, IAnimatable> = new Map();
    private tweenableObjects: Map<string, ITweenable> = new Map();
    private motionGroups: Map<string, Set<string>> = new Map();
    private isActive: boolean = true;
    
    constructor() {
        logInfo('MotionManager', 'Initialized', {
            note: "Ready to manage motion, animation, and tweening"
        }, 'constructor');
    }
    
    /**
     * Register an object for motion management
     */
    registerMotionObject(id: string, object: IMotion, group?: string): void {
        this.motionObjects.set(id, object);
        
        if (group) {
            if (!this.motionGroups.has(group)) {
                this.motionGroups.set(group, new Set());
            }
            this.motionGroups.get(group)!.add(id);
        }
        
        logDebug('MotionManager', 'Motion object registered', {
            objectId: id,
            group: group || 'default',
            totalMotionObjects: this.motionObjects.size
        }, 'registerMotionObject');
    }
    
    /**
     * Register an object for animation management
     */
    registerAnimatableObject(id: string, object: IAnimatable): void {
        this.animatableObjects.set(id, object);
        
        logDebug('MotionManager', 'Animatable object registered', {
            objectId: id,
            totalAnimatableObjects: this.animatableObjects.size
        }, 'registerAnimatableObject');
    }
    
    /**
     * Register an object for tweening
     */
    registerTweenableObject(id: string, object: ITweenable): void {
        this.tweenableObjects.set(id, object);
        
        logDebug('MotionManager', 'Tweenable object registered', {
            objectId: id,
            totalTweenableObjects: this.tweenableObjects.size
        }, 'registerTweenableObject');
    }
    
    /**
     * Unregister a motion object
     */
    unregisterMotionObject(id: string): boolean {
        const removed = this.motionObjects.delete(id);
        
        // Remove from all groups
        for (const [group, objects] of this.motionGroups) {
            objects.delete(id);
            if (objects.size === 0) {
                this.motionGroups.delete(group);
            }
        }
        
        if (removed) {
            logDebug('MotionManager', 'Motion object unregistered', {
                objectId: id,
                remainingMotionObjects: this.motionObjects.size
            }, 'unregisterMotionObject');
        }
        
        return removed;
    }
    
    /**
     * Unregister an animatable object
     */
    unregisterAnimatableObject(id: string): boolean {
        const removed = this.animatableObjects.delete(id);
        
        if (removed) {
            logDebug('MotionManager', 'Animatable object unregistered', {
                objectId: id,
                remainingAnimatableObjects: this.animatableObjects.size
            }, 'unregisterAnimatableObject');
        }
        
        return removed;
    }
    
    /**
     * Unregister a tweenable object
     */
    unregisterTweenableObject(id: string): boolean {
        const removed = this.tweenableObjects.delete(id);
        
        if (removed) {
            logDebug('MotionManager', 'Tweenable object unregistered', {
                objectId: id,
                remainingTweenableObjects: this.tweenableObjects.size
            }, 'unregisterTweenableObject');
        }
        
        return removed;
    }
    
    /**
     * Move an object to a specific position
     */
    moveObjectTo(id: string, x: number, y: number, duration?: number): boolean {
        const object = this.motionObjects.get(id);
        
        if (!object) {
            logWarn('MotionManager', 'Motion object not found', {
                objectId: id,
                availableObjects: Array.from(this.motionObjects.keys())
            }, 'moveObjectTo');
            return false;
        }
        
        try {
            object.moveTo(x, y, duration);
            
            logDebug('MotionManager', 'Object moved to position', {
                objectId: id,
                x,
                y,
                duration
            }, 'moveObjectTo');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error moving object', {
                objectId: id,
                x,
                y,
                duration,
                error
            }, 'moveObjectTo');
            return false;
        }
    }
    
    /**
     * Move an object by a delta amount
     */
    moveObjectBy(id: string, dx: number, dy: number, duration?: number): boolean {
        const object = this.motionObjects.get(id);
        
        if (!object) {
            return false;
        }
        
        try {
            object.moveBy(dx, dy, duration);
            
            logDebug('MotionManager', 'Object moved by delta', {
                objectId: id,
                dx,
                dy,
                duration
            }, 'moveObjectBy');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error moving object by delta', {
                objectId: id,
                dx,
                dy,
                duration,
                error
            }, 'moveObjectBy');
            return false;
        }
    }
    
    /**
     * Rotate an object to a specific angle
     */
    rotateObjectTo(id: string, angle: number, duration?: number): boolean {
        const object = this.motionObjects.get(id);
        
        if (!object) {
            return false;
        }
        
        try {
            object.rotateTo(angle, duration);
            
            logDebug('MotionManager', 'Object rotated to angle', {
                objectId: id,
                angle,
                duration
            }, 'rotateObjectTo');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error rotating object', {
                objectId: id,
                angle,
                duration,
                error
            }, 'rotateObjectTo');
            return false;
        }
    }
    
    /**
     * Scale an object to a specific scale
     */
    scaleObjectTo(id: string, scale: number, duration?: number): boolean {
        const object = this.motionObjects.get(id);
        
        if (!object) {
            return false;
        }
        
        try {
            object.scaleTo(scale, duration);
            
            logDebug('MotionManager', 'Object scaled to value', {
                objectId: id,
                scale,
                duration
            }, 'scaleObjectTo');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error scaling object', {
                objectId: id,
                scale,
                duration,
                error
            }, 'scaleObjectTo');
            return false;
        }
    }
    
    /**
     * Stop motion for an object
     */
    stopObjectMotion(id: string): boolean {
        const object = this.motionObjects.get(id);
        
        if (!object) {
            return false;
        }
        
        try {
            object.stopMotion();
            
            logDebug('MotionManager', 'Object motion stopped', {
                objectId: id
            }, 'stopObjectMotion');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error stopping object motion', {
                objectId: id,
                error
            }, 'stopObjectMotion');
            return false;
        }
    }
    
    /**
     * Play animation on an object
     */
    playAnimation(id: string, key: string, config?: any): boolean {
        const object = this.animatableObjects.get(id);
        
        if (!object) {
            logWarn('MotionManager', 'Animatable object not found', {
                objectId: id,
                animationKey: key,
                availableObjects: Array.from(this.animatableObjects.keys())
            }, 'playAnimation');
            return false;
        }
        
        try {
            object.playAnimation(key, config);
            
            logDebug('MotionManager', 'Animation played', {
                objectId: id,
                animationKey: key,
                config
            }, 'playAnimation');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error playing animation', {
                objectId: id,
                animationKey: key,
                config,
                error
            }, 'playAnimation');
            return false;
        }
    }
    
    /**
     * Stop animation on an object
     */
    stopAnimation(id: string): boolean {
        const object = this.animatableObjects.get(id);
        
        if (!object) {
            return false;
        }
        
        try {
            object.stopAnimation();
            
            logDebug('MotionManager', 'Animation stopped', {
                objectId: id
            }, 'stopAnimation');
            
            return true;
        } catch (error) {
            logError('MotionManager', 'Error stopping animation', {
                objectId: id,
                error
            }, 'stopAnimation');
            return false;
        }
    }
    
    /**
     * Stop all motion and animations
     */
    stopAll(): void {
        logInfo('MotionManager', 'Stopping all motion and animations', {
            motionCount: this.motionObjects.size,
            animationCount: this.animatableObjects.size
        }, 'stopAll');
        
        // Stop all motion
        for (const [id, object] of this.motionObjects) {
            try {
                object.stopMotion();
            } catch (error) {
                logError('MotionManager', 'Error stopping motion', {
                    objectId: id,
                    error
                }, 'stopAll');
            }
        }
        
        // Stop all animations
        for (const [id, object] of this.animatableObjects) {
            try {
                object.stopAnimation();
            } catch (error) {
                logError('MotionManager', 'Error stopping animation', {
                    objectId: id,
                    error
                }, 'stopAll');
            }
        }
    }
    
    /**
     * Move all objects in a group to a position
     */
    moveGroupTo(group: string, x: number, y: number, duration?: number): void {
        const groupObjects = this.motionGroups.get(group);
        
        if (!groupObjects) {
            logWarn('MotionManager', 'Motion group not found', {
                group,
                availableGroups: Array.from(this.motionGroups.keys())
            }, 'moveGroupTo');
            return;
        }
        
        logInfo('MotionManager', 'Moving group to position', {
            group,
            x,
            y,
            duration,
            objectCount: groupObjects.size
        }, 'moveGroupTo');
        
        for (const objectId of groupObjects) {
            this.moveObjectTo(objectId, x, y, duration);
        }
    }
    
    /**
     * Get motion object by ID
     */
    getMotionObject(id: string): IMotion | null {
        return this.motionObjects.get(id) || null;
    }
    
    /**
     * Get animatable object by ID
     */
    getAnimatableObject(id: string): IAnimatable | null {
        return this.animatableObjects.get(id) || null;
    }
    
    /**
     * Get tweenable object by ID
     */
    getTweenableObject(id: string): ITweenable | null {
        return this.tweenableObjects.get(id) || null;
    }
    
    /**
     * Get all motion groups
     */
    getMotionGroups(): string[] {
        return Array.from(this.motionGroups.keys());
    }
    
    /**
     * Get objects in a motion group
     */
    getGroupObjects(group: string): string[] {
        const groupObjects = this.motionGroups.get(group);
        return groupObjects ? Array.from(groupObjects) : [];
    }
    
    /**
     * Enable/disable motion management
     */
    setActive(active: boolean): void {
        this.isActive = active;
        logInfo('MotionManager', 'Motion management state changed', {
            active,
            note: active ? "Motion management enabled" : "Motion management disabled"
        }, 'setActive');
    }
    
    /**
     * Get motion statistics
     */
    getStats(): {
        totalMotionObjects: number;
        totalAnimatableObjects: number;
        totalTweenableObjects: number;
        totalGroups: number;
        isActive: boolean;
    } {
        return {
            totalMotionObjects: this.motionObjects.size,
            totalAnimatableObjects: this.animatableObjects.size,
            totalTweenableObjects: this.tweenableObjects.size,
            totalGroups: this.motionGroups.size,
            isActive: this.isActive
        };
    }
    
    /**
     * Clear all registered objects and groups
     */
    clear(): void {
        logInfo('MotionManager', 'Clearing all motion data', {
            motionCount: this.motionObjects.size,
            animationCount: this.animatableObjects.size,
            tweenCount: this.tweenableObjects.size,
            groupCount: this.motionGroups.size
        }, 'clear');
        
        this.motionObjects.clear();
        this.animatableObjects.clear();
        this.tweenableObjects.clear();
        this.motionGroups.clear();
    }
}
