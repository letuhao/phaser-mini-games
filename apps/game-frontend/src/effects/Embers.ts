import Phaser from 'phaser';

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
        
        console.log('[Embers] Constructor called with options:', {
            pool,
            spawnArea: this.spawnArea,
            baseY: this.baseY,
            initialBudget: this.initialBudget,
            containerBounds: this.containerBounds
        });

        // ensure a small round texture exists
        const key = 'fx-ember';
        if (!scene.textures.exists(key)) {
            console.log('[Embers] Creating ember texture:', key);
            const g = scene.add.graphics();
            g.fillStyle(0xffffff, 1).fillCircle(6, 6, 3);
            g.generateTexture(key, 12, 12);
            g.destroy();
        } else {
            console.log('[Embers] Ember texture already exists:', key);
        }

        this.root = scene.add.container(0, 0).setName('embers');
        console.log('[Embers] Root container created:', this.root);

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
            console.log('[Embers] Debug spawn area rectangle created at container origin:', {
                x: 0,
                y: 0,
                width: this.spawnArea.width,
                height: this.spawnArea.height
            });
        }

        // build pool
        console.log('[Embers] Building ember pool with', pool, 'embers');
        for (let i = 0; i < pool; i++) {
            const sp = scene.add.image(0, 0, key)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setVisible(false);
            this.root.add(sp);
            this.sprites.push(sp);
        }
        console.log('[Embers] Pool built successfully. Sprites count:', this.sprites.length);

        // Don't start embers until container bounds are set
        // This prevents them from spawning at wrong positions initially
        console.log('[Embers] Waiting for container bounds before starting embers');
        this.activeCount = 0;
    }

    /** Update container bounds for constraint checking */
    updateContainerBounds(bounds: { left: number; top: number; width: number; height: number }) {
        const wasFirstTime = !this.containerBounds;
        this.containerBounds = bounds;
        console.log('[Embers] Container bounds updated:', bounds, 'wasFirstTime:', wasFirstTime);
        
        // Update debug rectangle position if it exists
        if (this.debugRect && this.debugSpawnArea) {
            // Position debug rectangle at the spawn area location
            // Since the debug rectangle is a child of the root container, we need to position it
            // relative to the container's origin, not the screen coordinates
            const debugX = this.spawnArea.x + this.spawnArea.width / 2;
            const debugY = this.spawnArea.y + this.spawnArea.height / 2;
            this.debugRect.setPosition(debugX, debugY);
            console.log('[Embers] Debug rectangle updated to container-relative position:', { x: debugX, y: debugY });
        }
        
        // If this is the first time bounds are set, start the embers with the configured budget
        if (wasFirstTime) {
            const budget = Math.min(this.sprites.length, this.initialBudget);
            console.log('[Embers] First time bounds set, starting embers with budget:', budget, '(configured:', this.initialBudget, ')');
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
        console.log('[Embers] setBudget called:', { requested: n, clamped, currentActive: this.activeCount, totalSprites: this.sprites.length });
        
        if (clamped === this.activeCount) {
            console.log('[Embers] Budget unchanged, returning early');
            return;
        }

        // Activate more
        if (clamped > this.activeCount) {
            console.log('[Embers] Activating', clamped - this.activeCount, 'more embers');
            for (let i = this.activeCount; i < clamped; i++) {
                this.activate(this.sprites[i]);
            }
        }
        // Deactivate extras
        if (clamped < this.activeCount) {
            console.log('[Embers] Deactivating', this.activeCount - clamped, 'embers');
            for (let i = clamped; i < this.activeCount; i++) {
                this.deactivate(this.sprites[i]);
            }
        }
        
        this.activeCount = clamped;
        console.log('[Embers] Budget updated. Active count now:', this.activeCount);
    }

    // ---- internals ----
    private activate(sp: Phaser.GameObjects.Image) {
        console.log('[Embers] Activating ember sprite:', sp);
        sp.setVisible(true);
        this.resetAndTween(sp);
    }

    private deactivate(sp: Phaser.GameObjects.Image) {
        console.log('[Embers] Deactivating ember sprite:', sp);
        sp.setVisible(false);
        sp.removeAllListeners(); // stop tweens callbacks if any
        (sp.scene.tweens as any).killTweensOf?.(sp);
    }

    private resetAndTween(sp: Phaser.GameObjects.Image) {
        const scene = sp.scene;
        console.log('[Embers] resetAndTween called for sprite:', sp);

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
            
            console.log('[Embers] Using simplified spawn area positioning:', {
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
            });
        } else {
            // Fallback to spawnArea-based positioning
            x = Phaser.Math.Between(this.spawnArea.x, this.spawnArea.x + this.spawnArea.width);
            y = Phaser.Math.Between(this.spawnArea.y, this.spawnArea.y + this.spawnArea.height);
            
            console.log('[Embers] Using fallback positioning:', {
                spawnArea: this.spawnArea,
                calculatedPos: { x, y }
            });
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

        console.log('[Embers] Ember positioned and styled:', {
            position: { x, y },
            scale: { start: scaleStart, end: scaleEnd },
            alpha: alphaStart,
            rise, dur, swayX
        });

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
                console.log('[Embers] Tween completed for sprite:', sp);
                // recycle only if still supposed to be active
                if (sp.visible) {
                    console.log('[Embers] Recycling ember sprite:', sp);
                    this.resetAndTween(sp);
                } else {
                    console.log('[Embers] Sprite not visible, not recycling:', sp);
                }
            }
        });
        
        console.log('[Embers] Tween created for ember:', sp);
    }
}
