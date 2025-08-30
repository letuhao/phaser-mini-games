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
    
    // Enhanced customization options
    scale?: { min?: number; max?: number };           // Size customization
    colors?: number[];                                // Array of hex colors for embers
    colorBlend?: boolean;                             // Whether to blend between colors
    rise?: { min?: number; max?: number };            // Rise distance customization
    duration?: { min?: number; max?: number };        // Animation duration customization
    sway?: { min?: number; max?: number };            // Horizontal sway customization
    alpha?: { min?: number; max?: number };           // Alpha transparency customization
    blendMode?: 'add' | 'screen' | 'multiply' | 'normal'; // Blend mode for embers
    gravity?: number;                                 // Gravity effect (negative = upward drift)
    wind?: number;                                    // Wind effect (positive = rightward drift)
    texture?: {                                       // Texture customization
        key?: string;                                 // Custom texture key
        size?: number;                                // Texture size (px)
        shape?: 'circle' | 'square' | 'star' | 'diamond'; // Texture shape
    };
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
    
    // Enhanced customization properties
    private scaleRange: { min: number; max: number };
    private colors: number[];
    private colorBlend: boolean;
    private riseRange: { min: number; max: number };
    private durationRange: { min: number; max: number };
    private swayRange: { min: number; max: number };
    private alphaRange: { min: number; max: number };
    private blendMode: Phaser.BlendModes;
    private gravity: number;
    private wind: number;
    private textureConfig: { key: string; size: number; shape: string };
    private margin: number = 50; // Default margin, will be updated from spawn area config

    constructor(scene: Phaser.Scene, opts: Opts = {}) {
        const pool = opts.count ?? 28;
        this.spawnArea = opts.spawnArea ?? { x: 0, y: 0, width: 1000, height: 600 };
        this.baseY = opts.baseY ?? 600; // Legacy support
        this.containerBounds = opts.containerBounds;
        this.initialBudget = opts.budget ?? 12; // Store initial budget for later use
        this.debugSpawnArea = opts.debugSpawnArea ?? false;
        
        // Initialize enhanced customization properties with defaults
        this.scaleRange = {
            min: opts.scale?.min ?? 0.6,
            max: opts.scale?.max ?? 1.0
        };
        this.colors = opts.colors ?? [0xffb15e, 0xff8c42, 0xff6b35]; // Default warm ember colors
        this.colorBlend = opts.colorBlend ?? false;
        this.riseRange = {
            min: opts.rise?.min ?? 140,
            max: opts.rise?.max ?? 280
        };
        this.durationRange = {
            min: opts.duration?.min ?? 1500,
            max: opts.duration?.max ?? 2600
        };
        this.swayRange = {
            min: opts.sway?.min ?? -30,
            max: opts.sway?.max ?? 30
        };
        this.alphaRange = {
            min: opts.alpha?.min ?? 0.55,
            max: opts.alpha?.max ?? 0.9
        };
        this.blendMode = this.getBlendMode(opts.blendMode ?? 'add');
        this.gravity = opts.gravity ?? 0;
        this.wind = opts.wind ?? 0;
        this.textureConfig = {
            key: opts.texture?.key ?? 'fx-ember',
            size: opts.texture?.size ?? 12,
            shape: opts.texture?.shape ?? 'circle'
        };
        
        logInfo('Embers', 'Constructor called with options', {
            pool,
            spawnArea: this.spawnArea,
            baseY: this.baseY,
            initialBudget: this.initialBudget,
            containerBounds: this.containerBounds,
            customization: {
                scale: this.scaleRange,
                colors: this.colors,
                colorBlend: this.colorBlend,
                rise: this.riseRange,
                duration: this.durationRange,
                sway: this.swayRange,
                alpha: this.alphaRange,
                blendMode: opts.blendMode,
                gravity: this.gravity,
                wind: this.wind,
                texture: this.textureConfig
            },
            note: "Embers instance created, waiting for container bounds to be set"
        }, 'constructor');

        // ensure texture exists with custom shape and size
        const key = this.textureConfig.key;
        if (!scene.textures.exists(key)) {
            logDebug('Embers', 'Creating custom ember texture', { 
                key, 
                size: this.textureConfig.size, 
                shape: this.textureConfig.shape 
            }, 'constructor');
            
            const g = scene.add.graphics();
            const center = this.textureConfig.size / 2;
            const radius = this.textureConfig.size / 4;
            
            g.fillStyle(0xffffff, 1);
            
            switch (this.textureConfig.shape) {
                case 'circle':
                    g.fillCircle(center, center, radius);
                    break;
                case 'square':
                    g.fillRect(center - radius, center - radius, radius * 2, radius * 2);
                    break;
                case 'star':
                    this.drawStar(g, center, center, radius, 5);
                    break;
                case 'diamond':
                    g.fillTriangle(
                        center, center - radius,           // top
                        center - radius, center,           // left
                        center + radius, center            // right
                    );
                    break;
                default:
                    g.fillCircle(center, center, radius);
            }
            
            g.generateTexture(key, this.textureConfig.size, this.textureConfig.size);
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
                .setBlendMode(this.blendMode)
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

    /** Convert blend mode string to Phaser blend mode */
    private getBlendMode(mode: string): Phaser.BlendModes {
        switch (mode) {
            case 'add': return Phaser.BlendModes.ADD;
            case 'screen': return Phaser.BlendModes.SCREEN;
            case 'multiply': return Phaser.BlendModes.MULTIPLY;
            case 'normal': return Phaser.BlendModes.NORMAL;
            default: return Phaser.BlendModes.ADD;
        }
    }

    /** Draw a star shape using graphics */
    private drawStar(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, points: number) {
        const angleStep = (Math.PI * 2) / points;
        const innerRadius = radius * 0.5;
        
        g.beginPath();
        g.moveTo(x + radius, y);
        
        for (let i = 1; i <= points * 2; i++) {
            const angle = i * angleStep / 2;
            const r = i % 2 === 0 ? radius : innerRadius;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            g.lineTo(px, py);
        }
        
        g.closePath();
        g.fillPath();
    }

    /** Update container bounds for constraint checking */
    updateContainerBounds(bounds: { left: number; top: number; width: number; height: number }) {
        const wasFirstTime = !this.containerBounds;
        this.containerBounds = bounds;
        
        logInfo('Embers', 'Container bounds updated', { 
            bounds, 
            wasFirstTime,
            previousBounds: this.containerBounds,
            note: "Container bounds received from ResponsiveManager"
        }, 'updateContainerBounds');
        
        // Look for spawn area containers within the parent container
        this.findSpawnAreaContainers();
        
        // Update debug rectangle position if it exists
        if (this.debugRect && this.debugSpawnArea) {
            // The spawn area is already scaled by findSpawnAreaContainers()
            // Just position the debug rectangle at the center of the scaled spawn area
            const debugX = this.spawnArea.x + this.spawnArea.width / 2;
            const debugY = this.spawnArea.y + this.spawnArea.height / 2;
            
            this.debugRect.setPosition(debugX, debugY);
            this.debugRect.setSize(this.spawnArea.width, this.spawnArea.height);
            
            logDebug('Embers', 'Debug rectangle updated to spawn area position', { 
                spawnArea: this.spawnArea,
                debugPosition: { x: debugX, y: debugY },
                note: "Debug rectangle shows the scaled spawn area position"
            }, 'updateContainerBounds');
        }
        
        // If this is the first time bounds are set, start the embers with the configured budget
        if (wasFirstTime) {
            const budget = Math.min(this.sprites.length, this.initialBudget);
            logInfo('Embers', 'First time bounds set, starting embers with budget', { 
                budget, 
                configured: this.initialBudget,
                containerBounds: bounds,
                spawnArea: this.spawnArea,
                note: "Embers will now start spawning within the container bounds"
            }, 'updateContainerBounds');
            this.setBudget(budget);
        } else {
            logDebug('Embers', 'Container bounds updated (not first time)', {
                bounds,
                previousBounds: this.containerBounds,
                note: "Bounds updated during resize, embers continue with existing budget"
            }, 'updateContainerBounds');
        }
    }
    
    /**
     * Find spawn area containers within the parent container
     */
    private findSpawnAreaContainers() {
        if (!this.containerBounds) return;
        
        // Look for spawn area containers in the parent container
        const parentContainer = this.root.scene.children.getByName('effects-container') as Phaser.GameObjects.Container;
        if (!parentContainer || !parentContainer.list) return;
        
        for (const child of parentContainer.list) {
            if (child && (child as any).__spawnAreaConfig && (child as any).__spawnAreaConfig.effectType === 'embers') {
                const spawnAreaConfig = (child as any).__spawnAreaConfig;
                
                logInfo('Embers', 'Found spawn area container', {
                    spawnAreaId: child.name,
                    config: spawnAreaConfig,
                    note: "Using spawn area container for positioning instead of hardcoded spawnArea"
                }, 'findSpawnAreaContainers');
                
                // The spawn area container is positioned by ResponsiveManager using dock/align
                // We just need to get its current position and size after positioning
                const spawnAreaContainer = child as Phaser.GameObjects.Container;
                
                // Get the spawn area's current position and size (already positioned by ResponsiveManager)
                this.spawnArea = {
                    x: spawnAreaContainer.x,
                    y: spawnAreaContainer.y,
                    width: spawnAreaContainer.width,
                    height: spawnAreaContainer.height
                };
                
                // Update margin from spawn area config
                this.margin = spawnAreaConfig.margin || 50;
                
                logInfo('Embers', 'Using spawn area container position from ResponsiveManager', {
                    spawnAreaContainer: {
                        name: spawnAreaContainer.name,
                        x: spawnAreaContainer.x,
                        y: spawnAreaContainer.y,
                        width: spawnAreaContainer.width,
                        height: spawnAreaContainer.height
                    },
                    finalSpawnArea: this.spawnArea,
                    margin: this.margin,
                    note: "Spawn area positioned by ResponsiveManager dock/align system"
                }, 'findSpawnAreaContainers');
                
                break; // Found the spawn area, no need to continue
            }
        }
    }

    /** Get current container bounds for debugging */
    getContainerBounds() {
        return this.containerBounds;
    }
    
    /** Get current spawn area information for debugging */
    getSpawnAreaInfo() {
        if (!this.containerBounds) {
            return {
                hasContainerBounds: false,
                note: "Container bounds not set yet"
            };
        }
        
        const scaleX = this.containerBounds.width / 2560;
        const scaleY = this.containerBounds.height / 1440;
        
        return {
            hasContainerBounds: true,
            originalSpawnArea: this.spawnArea,
            scaleFactors: { scaleX, scaleY },
            scaledSpawnArea: {
                x: this.spawnArea.x * scaleX,
                y: this.spawnArea.y * scaleY,
                width: this.spawnArea.width * scaleX,
                height: this.spawnArea.height * scaleY
            },
            containerBounds: this.containerBounds,
            note: "Spawn area is scaled to match container size for responsive behavior"
        };
    }
    
    /** Manually start embers for testing purposes */
    manualStart() {
        logInfo('Embers', 'Manual start requested', {
            currentActive: this.activeCount,
            totalSprites: this.sprites.length,
            containerBounds: this.containerBounds,
            spawnArea: this.spawnArea,
            note: "Manually starting embers for testing"
        }, 'manualStart');
        
        if (this.containerBounds) {
            this.setBudget(this.initialBudget);
        } else {
            logWarn('Embers', 'Cannot start embers - no container bounds', {
                note: "Container bounds must be set before embers can start"
            }, 'manualStart');
        }
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
                count: clamped - this.activeCount,
                currentActive: this.activeCount,
                targetActive: clamped,
                totalSprites: this.sprites.length,
                containerBounds: this.containerBounds,
                spawnArea: this.spawnArea,
                note: "New embers will be activated and positioned within the scaled spawn area"
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
        logDebug('Embers', 'Activating ember sprite', {
            sprite: sp,
            spriteIndex: this.sprites.indexOf(sp),
            currentActive: this.activeCount,
            containerBounds: this.containerBounds,
            spawnArea: this.spawnArea,
            note: "This ember will be positioned and animated within the scaled spawn area"
        }, 'activate');
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
            // The spawnArea coordinates are already scaled by findSpawnAreaContainers()
            // No need to scale them again here
            
            // Spawn within the already-scaled spawn area
            x = Phaser.Math.Between(this.spawnArea.x + this.margin, this.spawnArea.x + this.spawnArea.width - this.margin);
            y = Phaser.Math.Between(this.spawnArea.y + this.margin, this.spawnArea.y + this.spawnArea.height - this.margin);
            
            logDebug('Embers', 'Using scaled spawn area positioning', {
                containerBounds: this.containerBounds,
                spawnArea: this.spawnArea,
                calculatedPos: { x, y },
                margin: this.margin,
                spawnAreaWithMargin: {
                    minX: this.spawnArea.x + this.margin,
                    maxX: this.spawnArea.x + this.spawnArea.width - this.margin,
                    minY: this.spawnArea.y + this.margin,
                    maxY: this.spawnArea.y + this.spawnArea.height - this.margin
                },
                note: "Spawn area coordinates are already scaled by findSpawnAreaContainers"
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

        const scaleStart = Phaser.Math.FloatBetween(this.scaleRange.min, this.scaleRange.max);
        const scaleEnd = scaleStart * 0.25;
        const alphaStart = Phaser.Math.FloatBetween(this.alphaRange.min, this.alphaRange.max);
        const rise = Phaser.Math.Between(this.riseRange.min, this.riseRange.max);
        const dur = Phaser.Math.Between(this.durationRange.min, this.durationRange.max);
        const swayX = Phaser.Math.Between(this.swayRange.min, this.swayRange.max);

        // Select color from the colors array
        const colorIndex = this.colorBlend 
            ? Math.floor(Math.random() * this.colors.length)
            : 0;
        const selectedColor = this.colors[colorIndex];
        
        sp.setPosition(x, y)
            .setScale(scaleStart)
            .setAlpha(alphaStart)
            .setTint(selectedColor);

        // Calculate final positions with physics effects
        const finalY = y - rise + (this.gravity * dur / 1000); // Gravity effect over time
        const finalX = x + swayX + (this.wind * dur / 1000);  // Wind effect over time

        logDebug('Embers', 'Ember positioned and styled', {
            position: { x, y },
            scale: { start: scaleStart, end: scaleEnd, range: this.scaleRange },
            alpha: { start: alphaStart, range: this.alphaRange },
            rise: { value: rise, range: this.riseRange },
            duration: { value: dur, range: this.durationRange },
            sway: { value: swayX, range: this.swayRange },
            color: { selected: selectedColor, available: this.colors, blending: this.colorBlend },
            physics: { gravity: this.gravity, wind: this.wind },
            finalPosition: { x: finalX, y: finalY }
        }, 'resetAndTween');
        
        // Enhanced tween with physics: Y rise + X sway + scale/alpha fade + physics
        scene.tweens.add({
            targets: sp,
            y: finalY,
            x: finalX,
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
