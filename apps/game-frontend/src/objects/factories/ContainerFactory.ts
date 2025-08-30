import Phaser from 'phaser';
import { GroupNode } from '../../core/GroupNode';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { SpawnAreaFactory } from './SpawnAreaFactory';
import { logInfo, logDebug, logWarn, logError } from '../../core/Logger';
import { Embers } from '../../effects/Embers';
import { UIButton } from '../../ui/Button';

/**
 * Factory for creating container objects
 */
export class ContainerFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['container'];
    
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        logInfo('ContainerFactory', 'Creating container', { 
            id: config.id, 
            config: config,
            hasChildren: !!config.children,
            childrenCount: config.children?.length || 0,
            dock: config.dock,
            anchor: config.anchor
        }, 'create');
        
        const container = new GroupNode(scene, config.x ?? 0, config.y ?? 0, config.id);
        
        // Apply scale if specified
        const scale = (config as any).scale;
        if (typeof scale === 'number') {
            container.setScale(scale);
        } else if (scale && typeof scale.x === 'number' && typeof scale.y === 'number') {
            container.setScale(scale.x, scale.y);
        }
        
        // Apply common properties
        this.applyCommonProperties(container, config);
        
        // Auto-position container if dock/anchor specified
        // DISABLED: ResponsiveManager now handles all container positioning
        // this.autoPositionContainer(container, config, scene);
        
        // Setup hit area from config (optional)
        this.setupHitArea(container, config);
        
        // Create children if specified
        if (config.children?.length) {
            logInfo('ContainerFactory', 'About to create children', { 
                containerId: config.id,
                childrenCount: config.children.length,
                children: config.children 
            }, 'create');
            this.createChildren(container, config.children, scene);
        } else {
            logInfo('ContainerFactory', 'No children to create', { 
                containerId: config.id,
                hasChildren: !!config.children,
                childrenLength: config.children?.length 
            }, 'create');
        }
        
        logInfo('ContainerFactory', 'Container created successfully', { 
            id: config.id, 
            container: container,
            finalChildrenCount: (container as any).list?.length || 0,
            finalPosition: { x: container.x, y: container.y }
        }, 'create');
        return container;
    }
    
    /**
     * Auto-position container based on dock and anchor properties
     * Now properly integrated with responsive background scaling system
     */
    private autoPositionContainer(container: GroupNode, config: any, scene: Phaser.Scene): void {
        const dock = config.dock;
        const anchor = config.anchor;
        
        logInfo('ContainerFactory', 'Starting auto-positioning', {
            id: config.id,
            dock: dock,
            anchor: anchor,
            configX: config.x,
            configY: config.y,
            configWidth: config.width,
            configHeight: config.height
        }, 'autoPositionContainer');
        
        if (!dock && !anchor) {
            logDebug('ContainerFactory', 'No dock/anchor specified, using config coordinates', {
                id: config.id,
                x: config.x,
                y: config.y
            }, 'autoPositionContainer');
            return;
        }
        
        // Get container dimensions from config or use defaults
        const containerWidth = config.width || container.width || 2560;
        const containerHeight = config.height || container.height || 80;
        
        // Get screen dimensions
        const screenWidth = scene.scale.width;
        const screenHeight = scene.scale.height;
        
        logInfo('ContainerFactory', 'Container and screen dimensions', {
            id: config.id,
            containerWidth: containerWidth,
            containerHeight: containerHeight,
            screenWidth: screenWidth,
            screenHeight: screenHeight
        }, 'autoPositionContainer');
        
        // Try to get background bounds for responsive positioning
        let bgBounds = null;
        try {
            // Access background through scene context - this is a custom property set by LevisR3WheelScene
            const background = (scene as any).objects?.['bg'] as any;
            if (background && background.getBackgroundBounds) {
                bgBounds = background.getBackgroundBounds();
                logInfo('ContainerFactory', 'Background bounds retrieved', {
                    id: config.id,
                    bgBounds: bgBounds
                }, 'autoPositionContainer');
            } else {
                logWarn('ContainerFactory', 'Background not found or missing getBackgroundBounds', {
                    id: config.id,
                    backgroundExists: !!background,
                    hasGetBackgroundBounds: !!(background && background.getBackgroundBounds)
                }, 'autoPositionContainer');
            }
        } catch (error) {
            logWarn('ContainerFactory', 'Could not get background bounds', { 
                id: config.id,
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error)
            }, 'autoPositionContainer');
        }
        
        let newX = config.x ?? 0;
        let newY = config.y ?? 0;
        
        if (bgBounds) {
            // Use responsive background bounds for positioning
            logInfo('ContainerFactory', 'Using responsive background bounds for positioning', {
                id: config.id,
                bgBounds: bgBounds,
                containerDimensions: { width: containerWidth, height: containerHeight }
            }, 'autoPositionContainer');
            
            // Handle dock positioning with background bounds
            if (dock) {
                switch (dock) {
                    case 'top':
                        newY = bgBounds.top;
                        break;
                    case 'bottom':
                        newY = bgBounds.bottom - containerHeight;
                        break;
                    case 'left':
                        newX = bgBounds.left;
                        break;
                    case 'right':
                        newX = bgBounds.right - containerWidth;
                        break;
                    case 'center':
                        newX = bgBounds.left + (bgBounds.width - containerWidth) / 2;
                        newY = bgBounds.top + (bgBounds.height - containerHeight) / 2;
                        break;
                }
            }
            
            // Handle anchor positioning with background bounds
            if (anchor) {
                if (anchor.includes('left')) {
                    newX = bgBounds.left;
                } else if (anchor.includes('right')) {
                    newX = bgBounds.right - containerWidth;
                } else if (anchor.includes('center')) {
                    newX = bgBounds.left + (bgBounds.width - containerWidth) / 2;
                }
                
                if (anchor.includes('top')) {
                    newY = bgBounds.top;
                } else if (anchor.includes('bottom')) {
                    newY = bgBounds.bottom - containerHeight;
                } else if (anchor.includes('center')) {
                    newY = bgBounds.top + (bgBounds.height - containerHeight) / 2;
                }
            }
            
            // Apply scaling to match background
            const originalWidth = bgBounds.originalWidth || bgBounds.width;
            const originalHeight = bgBounds.originalHeight || bgBounds.height;
            const scaleX = bgBounds.width / originalWidth;
            const scaleY = bgBounds.height / originalHeight;
            const uniformScale = Math.min(scaleX, scaleY); // Use the smaller scale to maintain aspect ratio
            
            logInfo('ContainerFactory', 'Applying background-based scaling', {
                id: config.id,
                originalDimensions: { width: originalWidth, height: originalHeight },
                currentDimensions: { width: bgBounds.width, height: bgBounds.height },
                scaleX: scaleX,
                scaleY: scaleY,
                uniformScale: uniformScale
            }, 'autoPositionContainer');
            
            container.setScale(uniformScale);
            
        } else {
            // Fallback to screen dimensions if no background bounds available
            logWarn('ContainerFactory', 'No background bounds available, using screen dimensions fallback', {
                id: config.id,
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                containerWidth: containerWidth,
                containerHeight: containerHeight
            }, 'autoPositionContainer');
            
            // Handle dock positioning with screen dimensions
            if (dock) {
                switch (dock) {
                    case 'top':
                        newY = 0;
                        break;
                    case 'bottom':
                        newY = screenHeight - containerHeight;
                        break;
                    case 'left':
                        newX = 0;
                        break;
                    case 'right':
                        newX = screenWidth - containerWidth;
                        break;
                    case 'center':
                        newX = (screenWidth - containerWidth) / 2;
                        newY = (screenHeight - containerHeight) / 2;
                        break;
                }
            }
            
            // Handle anchor positioning with screen dimensions
            if (anchor) {
                if (anchor.includes('left')) {
                    newX = 0;
                } else if (anchor.includes('right')) {
                    newX = screenWidth - containerWidth;
                } else if (anchor.includes('center')) {
                    newX = (screenWidth - containerWidth) / 2;
                }
                
                if (anchor.includes('top')) {
                    newY = 0;
                } else if (anchor.includes('bottom')) {
                    newY = screenHeight - containerHeight;
                } else if (anchor.includes('center')) {
                    newY = (screenHeight - containerHeight) / 2;
                }
            }
        }
        
        // Apply the calculated position
        container.setPosition(newX, newY);
        
        logInfo('ContainerFactory', 'Container auto-positioned successfully', {
            id: config.id,
            dock: dock,
            anchor: anchor,
            containerDimensions: { width: containerWidth, height: containerHeight },
            calculatedPosition: { x: newX, y: newY },
            backgroundBounds: bgBounds,
            usingResponsivePositioning: !!bgBounds,
            screenDimensions: { width: screenWidth, height: screenHeight },
            finalContainerState: {
                x: container.x,
                y: container.y,
                scaleX: container.scaleX,
                scaleY: container.scaleY
            }
        }, 'autoPositionContainer');
    }
    
    private setupHitArea(container: GroupNode, config: any): void {
        const hitArea = (config as any).hitArea as { kind?: string; width?: number; height?: number; originCenter?: boolean } | undefined;
        
        if (hitArea?.kind === 'rect' && typeof hitArea.width === 'number' && typeof hitArea.height === 'number') {
            container.setHitRect(hitArea.width, hitArea.height, hitArea.originCenter ?? true);
            if ((config as any).interactive) container.setInteractive();
            if ((config as any).cursor === 'pointer') container.setCursor('pointer');
        } else if ((config as any).interactive) {
            // fallback: if interactive but no rect provided, use current size if set
            if (!container.input?.hitArea && container.width && container.height) {
                container.setHitRect(container.width, container.height, true);
            }
            container.setInteractive();
            if ((config as any).cursor === 'pointer') container.setCursor('pointer');
        }
    }
    
    private createChildren(container: GroupNode, children: any[], scene: Phaser.Scene): void {
        logInfo('ContainerFactory', 'Container has children', { 
            childCount: children.length, 
            containerId: container.name,
            children: children 
        }, 'createChildren');
        
        for (const child of children) {
            logInfo('ContainerFactory', 'Processing child', { 
                type: child.type, 
                id: child.id,
                child: child 
            }, 'createChildren');
            
            // Create child using the factory registry
            const childObj = this.createChild(scene, child);
            
            if (childObj) {
                logInfo('ContainerFactory', 'Child created successfully', { 
                    type: child.type, 
                    id: child.id, 
                    child: childObj,
                    childPosition: { x: child.x, y: child.y }
                }, 'createChildren');
                
                // Set position if specified - children should be positioned relative to container
                if (child.x !== undefined || child.y !== undefined) {
                    // Children coordinates are relative to container, so we don't need to add container position
                    (childObj as any).setPosition(child.x ?? 0, child.y ?? 0);
                    logInfo('ContainerFactory', 'Child position set', { 
                        id: child.id, 
                        position: { x: child.x ?? 0, y: child.y ?? 0 },
                        containerPosition: { x: container.x, y: container.y },
                        absolutePosition: { x: container.x + (child.x ?? 0), y: container.y + (child.y ?? 0) }
                    }, 'createChildren');
                }
                
                container.add(childObj);
                logInfo('ContainerFactory', 'Child added to container', { 
                    id: child.id, 
                    containerId: container.name,
                    containerChildrenCount: (container as any).list?.length 
                }, 'createChildren');
            } else {
                logWarn('ContainerFactory', 'Failed to create child', { 
                    type: child.type, 
                    id: child.id,
                    child: child 
                }, 'createChildren');
            }
        }
        
        logInfo('ContainerFactory', 'All children processed', { 
            containerId: container.name,
            totalChildrenCreated: (container as any).list?.length,
            expectedChildren: children.length
        }, 'createChildren');
    }
    
    private createChild(scene: Phaser.Scene, child: any): Phaser.GameObjects.GameObject | null {
        // Create child based on its type
        switch (child.type) {
            case 'rect':
                return this.createRect(scene, child);
            case 'text':
                return this.createText(scene, child);
            case 'effect':
                return this.createEffect(scene, child);
            case 'spawn-area':
                return this.createSpawnArea(scene, child);
            case 'image':
                return this.createImage(scene, child);
            case 'sprite':
                return this.createSprite(scene, child);
            case 'tileSprite':
                return this.createTileSprite(scene, child);
            case 'button':
                return this.createButton(scene, child);
            default:
                logWarn('ContainerFactory', 'Unknown child type', { type: child.type, id: child.id }, 'createChild');
                return null;
        }
    }
    
    private createRect(scene: Phaser.Scene, config: any): Phaser.GameObjects.Rectangle {
        const r = scene.add.rectangle(config.x ?? 0, config.y ?? 0, config.width, config.height, config.fill, config.fillAlpha ?? 1);
        if (config.radius) (r as any).setStrokeStyle(0);
        if (config.stroke) (r as any).setStrokeStyle(config.stroke.width ?? 2, config.stroke.color, config.stroke.alpha ?? 1);
        this.applyCommonProperties(r, config);
        return r;
    }
    
    private createText(scene: Phaser.Scene, config: any): Phaser.GameObjects.Text {
        const t = scene.add.text(config.x ?? 0, config.y ?? 0, config.text, config.style);
        this.applyCommonProperties(t, config);
        return t;
    }
    
    private createEffect(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        // For effects, we need to create them using the EffectFactory logic
        if (config.effectType === 'embers') {
            try {
                const opts = {
                    count: config.count ?? 28,
                    spawnArea: config.spawnArea ?? { x: 0, y: 0, width: 1000, height: 600 },
                    baseY: config.baseY ?? 600,
                    budget: config.budget,
                    debugSpawnArea: config.debugSpawnArea ?? false,
                    scale: config.embers?.scale,
                    colors: config.embers?.colors,
                    colorBlend: config.embers?.colorBlend,
                    rise: config.embers?.rise,
                    duration: config.embers?.duration,
                    sway: config.embers?.sway,
                    alpha: config.embers?.alpha,
                    blendMode: config.embers?.blendMode,
                    gravity: config.embers?.gravity,
                    wind: config.embers?.wind,
                    texture: config.embers?.texture,
                };
                
                const effect = new Embers(scene, opts);
                this.applyCommonProperties(effect.root, config);
                (effect.root as any).__embers = effect;
                logDebug('ContainerFactory', 'Embers effect created successfully', { 
                    id: config.id, 
                    effect,
                    effectType: effect.constructor.name,
                    effectRoot: effect.root,
                    effectRootType: effect.root.constructor.name,
                    hasEmbersRef: !!(effect.root as any).__embers,
                    note: "Embers reference stored for ResponsiveManager to access"
                }, 'createEffect');
                return effect.root;
            } catch (error) {
                logWarn('ContainerFactory', 'Error creating embers effect', { id: config.id, error }, 'createEffect');
                return null;
            }
        }
        return null;
    }
    
    private createSpawnArea(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        try {
            logDebug('ContainerFactory', 'Creating spawn area child', { 
                id: config.id, 
                config: config,
                parentContainer: 'effects-container'
            }, 'createSpawnArea');
            
            // Use SpawnAreaFactory to create the spawn area
            logDebug('ContainerFactory', 'Instantiating SpawnAreaFactory', { 
                id: config.id,
                note: "About to create SpawnAreaFactory instance"
            }, 'createSpawnArea');
            
            const spawnAreaFactory = new SpawnAreaFactory();
            
            logDebug('ContainerFactory', 'SpawnAreaFactory instantiated', { 
                id: config.id,
                factoryType: spawnAreaFactory.constructor.name,
                supportedTypes: spawnAreaFactory.supportedTypes,
                note: "SpawnAreaFactory created successfully"
            }, 'createSpawnArea');
            
            logDebug('ContainerFactory', 'Calling SpawnAreaFactory.create()', { 
                id: config.id,
                sceneType: scene.constructor.name,
                configType: config.type,
                configKeys: Object.keys(config),
                note: "About to call spawnAreaFactory.create()"
            }, 'createSpawnArea');
            
            const spawnArea = spawnAreaFactory.create(scene, config);
            
            logDebug('ContainerFactory', 'SpawnAreaFactory.create() returned', { 
                id: config.id,
                result: spawnArea,
                resultType: spawnArea ? spawnArea.constructor.name : 'null',
                note: "SpawnAreaFactory.create() completed"
            }, 'createSpawnArea');
            
            if (spawnArea) {
                logInfo('ContainerFactory', 'Spawn area created successfully', { 
                    id: config.id, 
                    spawnArea,
                    spawnAreaType: spawnArea.constructor.name,
                    spawnAreaName: spawnArea.name,
                    spawnAreaPosition: { x: (spawnArea as any).x, y: (spawnArea as any).y },
                    spawnAreaScale: { x: (spawnArea as any).scaleX, y: (spawnArea as any).scaleY },
                    spawnAreaOrigin: { x: (spawnArea as any).originX, y: (spawnArea as any).originY },
                    note: "Spawn area created and will be added to parent container"
                }, 'createSpawnArea');
                return spawnArea;
            } else {
                logWarn('ContainerFactory', 'SpawnAreaFactory returned null', { id: config.id }, 'createSpawnArea');
                return null;
            }
        } catch (error) {
            logError('ContainerFactory', 'Error creating spawn area', { id: config.id, error }, 'createSpawnArea');
            return null;
        }
    }

    private createImage(scene: Phaser.Scene, config: any): Phaser.GameObjects.Image {
        const img = scene.add.image(config.x ?? 0, config.y ?? 0, config.key, config.frame);
        this.applyCommonProperties(img, config);
        return img;
    }
    
    private createSprite(scene: Phaser.Scene, config: any): Phaser.GameObjects.Sprite {
        const spr = scene.add.sprite(config.x ?? 0, config.y ?? 0, config.key, config.frame);
        this.applyCommonProperties(spr, config);
        if (config.anim) spr.play({ key: config.anim, repeat: config.loop ? -1 : 0 });
        return spr;
    }
    
    private createTileSprite(scene: Phaser.Scene, config: any): Phaser.GameObjects.TileSprite {
        const width = config.width ?? scene.scale.width;
        const height = config.height ?? scene.scale.height;
        const ts = scene.add.tileSprite(config.x ?? 0, config.y ?? 0, width, height, config.key);
        ts.setOrigin(0.5, 0.5);
        this.applyCommonProperties(ts, config);
        
        if (typeof config.tileScale === 'number') {
            ts.setTileScale(config.tileScale);
        } else if (config.tileScale) {
            ts.setTileScale(config.tileScale.x ?? 1, config.tileScale.y ?? 1);
        }
        
        if (config.scroll) {
            scene.events.on('update', () => {
                ts.tilePositionX += config.scroll?.x ?? 0;
                ts.tilePositionY += config.scroll?.y ?? 0;
            });
        }
        
        return ts;
    }
    
    private createButton(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        // For buttons, we need to create them using the ButtonFactory logic
        try {
            const button = new UIButton(scene, {
                x: config.x ?? 0,
                y: config.y ?? 0,
                width: config.width,
                height: config.height,
                shape: config.shape,
                displayMode: config.displayMode,
                text: config.text,
                icon: config.icon,
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
                textColor: config.textColor?.toString() || '#000000',
                iconColor: config.iconColor,
                fontSize: config.fontSize,
                fontFamily: config.fontFamily,
                backgroundImage: config.backgroundImage,
                backgroundImageScale: config.backgroundImageScale,
                backgroundImageOrigin: config.backgroundImageOrigin,
                hoverScale: config.hoverScale,
                clickScale: config.clickScale,
                hoverTint: config.hoverTint,
                clickTint: config.clickTint,
                hoverSound: config.hoverSound,
                clickSound: config.clickSound,
                onClick: typeof config.onClick === 'string' 
                    ? () => { window.open(config.onClick as string, '_blank'); }
                    : (config.onClick || (() => {})),
            });
            
            this.applyCommonProperties(button.root, config);
            logDebug('ContainerFactory', 'Button created successfully', { id: config.id, button }, 'createButton');
            return button.root;
        } catch (error) {
            logWarn('ContainerFactory', 'Error creating button', { id: config.id, error }, 'createButton');
            return null;
        }
    }
}
