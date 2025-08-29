import Phaser from 'phaser';
import { logInfo, logDebug, logError, logWarn } from '../core/Logger';

/**
 * Ember effect without Phaser particles:
 * Uses a pool of Images, additive blend, and tweens to float upward then recycle.
 * 
 * LOGGING: This class uses the centralized logger system for better debugging control.
 * - INFO level: Important lifecycle events (constructor, first-time bounds set)
 * - DEBUG level: Detailed debugging information (spawn positions, sprite states)
 * - ERROR level: Error conditions (if any occur)
 * 
 * To control logging: import { logger } from '../core/Logger' and use:
 * - logger.setObjectEnabled('Embers', false) to disable all Embers logging
 * - logger.setObjectLevel('Embers', LogLevel.INFO) to reduce verbosity
 */

type Opts = {
    count?: number;                  // how many embers in the pool
    spawnArea?: { x: number; y: number; width: number; height: number }; // exact spawn rectangle within container
    baseY?: number;                  // bottom line where embers start rising from (legacy, use spawnArea instead)
    budget?: number;                 // how many embers are active at once
    containerBounds?: { left: number; top: number; width: number; height: number }; // container bounds for constraint checking
    debugSpawnArea?: boolean;        // show spawn area rectangle for debugging
};

/**
 * Ember effect without Phaser particles:
 * Uses a pool of Images, additive blend, and tweens to float upward then recycle.
 */
export class Embers {
    public readonly root: Phaser.GameObjects.Container;
    private sprites: Phaser.GameObjects.Image[] = [];
    private activeCount = 0;
    private spawnArea: { x: number; y: number; width: number; height: number };
    private baseY: number;
    private initialBudget: number;
    private containerBounds?: { left: number; top: number; width: number; height: number };
    private debugSpawnArea: boolean;
    private debugRect?: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, opts: Opts = {}) {
        const pool = opts.count ?? 28;
        this.spawnArea = opts.spawnArea ?? { x: 0, y: 0, width: 1000, height: 600 };
        this.baseY = opts.baseY ?? 600; // Legacy support
        this.containerBounds = opts.containerBounds;
        this.initialBudget = opts.budget ?? 12; // Store initial budget for later use
        this.debugSpawnArea = opts.debugSpawnArea ?? false;
        
        logInfo('Embers', 'Constructor called with options', {
            pool,
            spawnArea: this.spawnArea,
            baseY: this.baseY,
            initialBudget: this.initialBudget,
            containerBounds: this.containerBounds
        }, 'constructor');

        // ensure a small round texture exists
        const key = 'fx-ember';
        if (!scene.textures.exists(key)) {
            logDebug('Embers', 'Creating ember texture', { key }, 'constructor');
            const g = scene.add.graphics();
            g.fillStyle(0xffffff, 1).fillCircle(6, 6, 3);
            g.generateTexture(key, 12, 12);
            g.destroy();
        } else {
            logDebug('Embers', 'Ember texture already exists', { key }, 'constructor');
        }

        this.root = scene.add.container(0, 0).setName('embers');
        logDebug('Embers', 'Root container created', this.root, 'constructor');

        // Create debug spawn area rectangle if enabled
        if (this.debugSpawnArea) {
            this.debugRect = scene.add.rectangle(
                0, // Start at container origin (0,0)
                0, // Start at container origin (0,0)
                this.spawnArea.width,
                this.spawnArea.height,
                0xff0000, // Red color for spawn area
                0.3 // Semi-transparent
            ).setOrigin(0.5, 0.5);
            this.root.add(this.debugRect);
            logDebug('Embers', 'Debug spawn area rectangle created at container origin', {
                x: 0,
                y: 0,
                width: this.spawnArea.width,
                height: this.spawnArea.height
            }, 'constructor');
        }

                // build pool
        logDebug('Embers', 'Building ember pool', { pool, emberCount: pool }, 'constructor');
        for (let i = 0; i < pool; i++) {
            const sp = scene.add.image(0, 0, key)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setVisible(false);
            this.root.add(sp);
            this.sprites.push(sp);
        }
        logDebug('Embers', 'Pool built successfully', { spritesCount: this.sprites.length }, 'constructor');
        
        // Don't start embers until container bounds are set
        // This prevents them from spawning at wrong positions initially
        logDebug('Embers', 'Waiting for container bounds before starting embers', undefined, 'constructor');
        this.activeCount = 0;
    }

    /** Update container bounds for constraint checking */
    updateContainerBounds(bounds: { left: number; top: number; width: number; height: number }) {
        const wasFirstTime = !this.containerBounds;
        this.containerBounds = bounds;
        logDebug('Embers', 'Container bounds updated', { bounds, wasFirstTime }, 'updateContainerBounds');
        
        // Update debug rectangle position if it exists
        if (this.debugRect && this.debugSpawnArea) {
            // Position debug rectangle at the spawn area location
            // Since the debug rectangle is a child of the root container, we need to position it
            // relative to the container's origin, not the screen coordinates
            const debugX = this.spawnArea.x + this.spawnArea.width / 2;
            const debugY = this.spawnArea.y + this.spawnArea.height / 2;
            this.debugRect.setPosition(debugX, debugY);
            logDebug('Embers', 'Debug rectangle updated to container-relative position', { x: debugX, y: debugY }, 'updateContainerBounds');
        }
        
        // If this is the first time bounds are set, start the embers with the configured budget
        if (wasFirstTime) {
            const budget = Math.min(this.sprites.length, this.initialBudget);
            logInfo('Embers', 'First time bounds set, starting embers with budget', { 
                budget, 
                configured: this.initialBudget 
            }, 'updateContainerBounds');
            this.setBudget(budget);
        }
    }

    /** Get current container bounds for debugging */
    getContainerBounds() {
        return this.containerBounds;
    }

    /** Adjust how many embers are active. */
    setBudget(n: number) {
        const clamped = Phaser.Math.Clamp(n, 0, this.sprites.length);
        logDebug('Embers', 'setBudget called', { 
            requested: n, 
            clamped, 
            currentActive: this.activeCount, 
            totalSprites: this.sprites.length 
        }, 'setBudget');
        
        if (clamped === this.activeCount) {
            logDebug('Embers', 'Budget unchanged, returning early', undefined, 'setBudget');
            return;
        }

        // Activate more
        if (clamped > this.activeCount) {
            logDebug('Embers', 'Activating more embers', { 
                count: clamped - this.activeCount 
            }, 'setBudget');
            for (let i = this.activeCount; i < clamped; i++) {
                this.activate(this.sprites[i]);
            }
        }
        // Deactivate extras
        if (clamped < this.activeCount) {
            logDebug('Embers', 'Deactivating embers', { 
                count: this.activeCount - clamped 
            }, 'setBudget');
            for (let i = clamped; i < this.activeCount; i++) {
                this.deactivate(this.sprites[i]);
            }
        }
        
        this.activeCount = clamped;
        logDebug('Embers', 'Budget updated', { activeCount: this.activeCount }, 'setBudget');
    }

    // ---- internals ----
    private activate(sp: Phaser.GameObjects.Image) {
        logDebug('Embers', 'Activating ember sprite', sp, 'activate');
        sp.setVisible(true);
        this.resetAndTween(sp);
    }

    private deactivate(sp: Phaser.GameObjects.Image) {
        logDebug('Embers', 'Deactivating ember sprite', sp, 'deactivate');
        sp.setVisible(false);
        sp.removeAllListeners(); // stop tweens callbacks if any
        (sp.scene.tweens as any).killTweensOf?.(sp);
    }

    private resetAndTween(sp: Phaser.GameObjects.Image) {
        const scene = sp.scene;
        logDebug('Embers', 'resetAndTween called for sprite', sp, 'resetAndTween');

        // Calculate spawn position within container bounds
        let x: number;
        let y: number;
        
        if (this.containerBounds) {
            // Use spawnArea for precise positioning within container
            const margin = 50;
            
            // FIXED: Calculate spawn area relative to background image bounds
            // The spawnArea coordinates are relative to the background image's (0,0) origin
            // Since the container is positioned at the background image's screen position,
            // we only need the spawnArea offset, not the full containerBounds.left
            // REMOVED: containerBounds.left was redundant and caused double offset issues
            const spawnX = this.spawnArea.x;  // Relative to background image left edge
            const spawnY = this.spawnArea.y;  // Relative to background image top edge
            
            // FIXED: Use the configured spawnArea dimensions directly
            // This ensures embers spawn in the exact area specified, not limited by container size
            // BEFORE: Math.min(this.spawnArea.width, this.containerBounds.width - 2 * margin) - WRONG!
            // AFTER: this.spawnArea.width - CORRECT!
            const spawnWidth = this.spawnArea.width;
            const spawnHeight = this.spawnArea.height;
            
            // Spawn within the specified spawn area
            x = Phaser.Math.Between(spawnX + margin, spawnX + spawnWidth - margin);
            y = Phaser.Math.Between(spawnY + margin, spawnY + spawnHeight - margin);
            
            logDebug('Embers', 'Using simplified spawn area positioning', {
                containerBounds: this.containerBounds,
                spawnArea: this.spawnArea,
                calculatedPos: { x, y },
                margin,
                spawnAreaRelative: {
                    x: spawnX,
                    y: spawnY,
                    width: spawnWidth,
                    height: spawnHeight
                },
                spawnAreaWithMargin: {
                    minX: spawnX + margin,
                    maxX: spawnX + spawnWidth - margin,
                    minY: spawnY + margin,
                    maxY: spawnY + spawnHeight - margin
                },
                containerInfo: {
                    containerWidth: this.containerBounds.width,
                    containerHeight: this.containerBounds.height,
                    spawnAreaWidth: this.spawnArea.width,
                    spawnAreaHeight: this.spawnArea.height,
                    margin: margin,
                    note: "Using full spawnArea dimensions, not limited by container size"
                },
                // Simplified X positioning debug info
                xPositioning: {
                    spawnAreaLeft: spawnX,
                    spawnAreaRight: spawnX + spawnWidth,
                    spawnRange: `${spawnX + margin} to ${spawnX + spawnWidth - margin}`,
                    finalX: x,
                    isWithinBounds: (x >= spawnX + margin) && (x <= spawnX + spawnWidth - margin)
                },
                // NEW: Simplified coordinate system explanation
                coordinateSystem: {
                    spawnAreaConfig: `x:${this.spawnArea.x}, y:${this.spawnArea.y}`,
                    explanation: "spawnArea coordinates are relative to background image (0,0) origin, no container offset needed"
                }
            }, 'resetAndTween');
        } else {
            // Fallback to spawnArea-based positioning
            x = Phaser.Math.Between(this.spawnArea.x, this.spawnArea.x + this.spawnArea.width);
            y = Phaser.Math.Between(this.spawnArea.y, this.spawnArea.y + this.spawnArea.height);
            
            logDebug('Embers', 'Using fallback positioning', {
                spawnArea: this.spawnArea,
                calculatedPos: { x, y }
            }, 'resetAndTween');
        }

        const scaleStart = Phaser.Math.FloatBetween(0.6, 1.0);
        const scaleEnd = scaleStart * 0.25;
        const alphaStart = Phaser.Math.FloatBetween(0.55, 0.9);
        const rise = Phaser.Math.Between(140, 280);
        const dur = Phaser.Math.Between(1500, 2600);
        const swayX = Phaser.Math.Between(-30, 30);

        sp.setPosition(x, y)
            .setScale(scaleStart)
            .setAlpha(alphaStart)
            .setTint(0xffb15e);

        logDebug('Embers', 'Ember positioned and styled', {
            position: { x, y },
            scale: { start: scaleStart, end: scaleEnd },
            alpha: alphaStart,
            rise, dur, swayX
        }, 'resetAndTween');

        // two tweens: Y rise + slight X sway + scale/alpha fade
        scene.tweens.add({
            targets: sp,
            y: y - rise,
            x: x + swayX,
            scale: scaleEnd,
            alpha: 0,
            ease: 'Cubic.easeOut',
            duration: dur,
                            onComplete: () => {
                    logDebug('Embers', 'Tween completed for sprite', sp, 'resetAndTween');
                    // recycle only if still supposed to be active
                    if (sp.visible) {
                        logDebug('Embers', 'Recycling ember sprite', sp, 'resetAndTween');
                        this.resetAndTween(sp);
                    } else {
                        logDebug('Embers', 'Sprite not visible, not recycling', sp, 'resetAndTween');
                    }
                }
            });
            
            logDebug('Embers', 'Tween created for ember', sp, 'resetAndTween');
    }
}
