import Phaser from 'phaser';
import {
    ObjectsConfig,
    SceneObject,
    BackgroundObject,
    ImageObject,
    SpriteObject,
    TileSpriteObject,
    RectObject,
    TextObject,
    LeavesObject,
    GroundObject,
    RainObject,
    WaterSurfaceObject,
    SunRaysObject,
    SunObject,
    LensFlareObject,
    ButtonObject,
    EffectObject,
} from './types';
import { GroupNode } from '../core/GroupNode';
import { AutumnLeaves } from '../effects/AutumnLeaves';
import { RainSystem } from '../effects/Rain';
import { WaterSurface } from '../effects/WaterSurface';
import { SunRays } from '../effects/SunRays';
import { SunBody } from '../effects/Sun';
import { LensFlare, LensFlareOptions } from '../effects/LensFlare';
import { Embers } from '../effects/Embers';
import { UIButton } from '../ui/Button';
import { logInfo, logDebug, logError, logWarn } from '../core/Logger';

function applyCommon(o: Phaser.GameObjects.GameObject, cfg: SceneObject) {
    // @ts-ignore - setDepth exists on DisplayObject
    if (typeof cfg.z === 'number') (o as any).setDepth(cfg.z);
    // @ts-ignore - setAlpha exists on many DisplayObjects
    if (typeof cfg.alpha === 'number') (o as any).setAlpha(cfg.alpha);
    // @ts-ignore - angle
    if (typeof cfg.angle === 'number') (o as any).setAngle(cfg.angle);
    // scale
    if (typeof cfg.scale === 'number') {
        // @ts-ignore
        (o as any).setScale(cfg.scale);
    } else if (cfg.scale && typeof cfg.scale === 'object') {
        // @ts-ignore
        (o as any).setScale(cfg.scale.x ?? 1, cfg.scale.y ?? 1);
    }
    // origin
    if (typeof cfg.origin === 'number') {
        // @ts-ignore
        (o as any).setOrigin(cfg.origin);
    } else if (cfg.origin && typeof cfg.origin === 'object') {
        // @ts-ignore
        (o as any).setOrigin(cfg.origin.x ?? 0.5, cfg.origin.y ?? 0.5);
    }
    // visibility
    if (typeof cfg.visible === 'boolean') {
        // @ts-ignore
        (o as any).setVisible(cfg.visible);
    }
    // id → setName for debugging/lookup
    if (cfg.id) (o as any).setName(cfg.id);
}

function createBackground(scene: Phaser.Scene, cfg: BackgroundObject) {
    const w = scene.scale.width;
    const h = scene.scale.height;

    let o: Phaser.GameObjects.GameObject;

    if (cfg.textureKey) {
        if (cfg.tile) {
            const ts = scene.add.tileSprite(0, 0, w, h, cfg.textureKey).setOrigin(0, 0);
            o = ts;
            // optional: animate scroll (parallax)
            // scene.events.on('update', () => {
            //   ts.tilePositionX += 0.1;
            // });
        } else {
            const img = scene.add.image(0, 0, cfg.textureKey).setOrigin(0.5, 0.5);
            const applyFit = () => {
                const cw = scene.scale.width;
                const ch = scene.scale.height;
                const txw = img.texture.getSourceImage().width;
                const txh = img.texture.getSourceImage().height;
                const scaleX = cw / txw;
                const scaleY = ch / txh;
                const fit = (cfg.fit ?? 'stretch');
                let s = 1;
                if (fit === 'contain') s = Math.min(scaleX, scaleY);
                else if (fit === 'cover') s = Math.max(scaleX, scaleY);
                else s = 1; // 'stretch' uses setDisplaySize below

                if (fit === 'stretch') {
                    img.setDisplaySize(cw, ch);
                } else {
                    img.setScale(s);
                }
                img.setPosition(cw / 2, ch / 2);
            };
            applyFit();
            scene.scale.on('resize', applyFit);
            
            o = img;
            
            // Add method to get background bounds
            (o as any).getBackgroundBounds = () => {
                const bounds = img.getBounds();
                return {
                    left: bounds.x,
                    right: bounds.x + bounds.width,
                    top: bounds.y,
                    bottom: bounds.y + bounds.height,
                    width: bounds.width,
                    height: bounds.height,
                    centerX: bounds.x + bounds.width / 2,
                    centerY: bounds.y + bounds.height / 2
                };
            };
        }
    } else {
        // Solid fill using a full-screen rectangle
        const g = scene.add.rectangle(0, 0, w, h, cfg.fill ?? 0x000000, cfg.fillAlpha ?? 1).setOrigin(0, 0);
        o = g;
    }

    // Always stay under everything else
    (o as any).setDepth(typeof cfg.z === 'number' ? cfg.z : 0);

    // Auto-resize for non-fit and non-image cases
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
        const { width, height } = gameSize;
        if (o instanceof Phaser.GameObjects.Rectangle) {
            o.setSize(width, height);
            o.setDisplaySize(width, height);
        } else if (o instanceof Phaser.GameObjects.TileSprite) {
            o.width = width;
            o.height = height;
        }
    });

    return o;
}

function createImage(scene: Phaser.Scene, cfg: ImageObject) {
    const img = scene.add.image(cfg.x ?? 0, cfg.y ?? 0, cfg.key, cfg.frame);
    applyCommon(img, cfg);
    return img;
}

function createSprite(scene: Phaser.Scene, cfg: SpriteObject) {
    const spr = scene.add.sprite(cfg.x ?? 0, cfg.y ?? 0, cfg.key, cfg.frame);
    applyCommon(spr, cfg);
    if (cfg.anim) spr.play({ key: cfg.anim, repeat: cfg.loop ? -1 : 0 });
    return spr;
}

function createTileSprite(scene: Phaser.Scene, cfg: TileSpriteObject) {
    const width = cfg.width ?? scene.scale.width;
    const height = cfg.height ?? scene.scale.height;
    const ts = scene.add.tileSprite(cfg.x ?? 0, cfg.y ?? 0, width, height, cfg.key);
    ts.setOrigin(0.5, 0.5);
    applyCommon(ts, cfg);
    if (typeof cfg.tileScale === 'number') {
        ts.setTileScale(cfg.tileScale);
    } else if (cfg.tileScale) {
        ts.setTileScale(cfg.tileScale.x ?? 1, cfg.tileScale.y ?? 1);
    }
    if (cfg.scroll) {
        scene.events.on('update', () => {
            ts.tilePositionX += cfg.scroll?.x ?? 0;
            ts.tilePositionY += cfg.scroll?.y ?? 0;
        });
    }
    return ts;
}

function createRect(scene: Phaser.Scene, cfg: RectObject) {
    const r = scene.add.rectangle(cfg.x ?? 0, cfg.y ?? 0, cfg.width, cfg.height, cfg.fill, cfg.fillAlpha ?? 1);
    if (cfg.radius) r.setStrokeStyle(0); // rounded handled via graphics typically; keep simple
    if (cfg.stroke) r.setStrokeStyle(cfg.stroke.width ?? 2, cfg.stroke.color, cfg.stroke.alpha ?? 1);
    applyCommon(r, cfg);
    return r;
}

function createText(scene: Phaser.Scene, cfg: TextObject) {
    const t = scene.add.text(cfg.x ?? 0, cfg.y ?? 0, cfg.text, cfg.style);
    applyCommon(t, cfg);
    return t;
}

function createButton(scene: Phaser.Scene, cfg: ButtonObject) {
    logDebug('ObjectLoader', 'Creating button', { id: cfg.id, config: cfg }, 'createButton');
    
    try {
        // Create UIButton with the configuration
        // IMPORTANT: Pass x,y coordinates to prevent UIButton from positioning at (0,0) initially
        const button = new UIButton(scene, {
            x: cfg.x ?? 0,           // Pass x coordinate to prevent positioning at (0,0)
            y: cfg.y ?? 0,           // Pass y coordinate to prevent positioning at (0,0)
            width: cfg.width,
            height: cfg.height,
            shape: cfg.shape,
            displayMode: cfg.displayMode,
            text: cfg.text,
            icon: cfg.icon,
            backgroundColor: cfg.backgroundColor,
            borderColor: cfg.borderColor,
            textColor: cfg.textColor?.toString() || '#000000',
            iconColor: cfg.iconColor,
            fontSize: cfg.fontSize,
            fontFamily: cfg.fontFamily,
            
            // Background image support - ADDED THESE PROPERTIES
            backgroundImage: cfg.backgroundImage,
            backgroundImageScale: cfg.backgroundImageScale,
            backgroundImageOrigin: cfg.backgroundImageOrigin,
            
            hoverScale: cfg.hoverScale,
            clickScale: cfg.clickScale,
            hoverTint: cfg.hoverTint,
            clickTint: cfg.clickTint,
            hoverSound: cfg.hoverSound,
            clickSound: cfg.clickSound,
            onClick: typeof cfg.onClick === 'string' 
                ? () => { window.open(cfg.onClick as string, '_blank'); }
                : (cfg.onClick || (() => {})),
        });
        
        logDebug('ObjectLoader', 'Button created successfully', { id: cfg.id, button }, 'createButton');
        
        // Apply common properties
        applyCommon(button.root, cfg);
        
        logDebug('ObjectLoader', 'Button properties applied', { id: cfg.id, buttonRoot: button.root }, 'createButton');
        
        // Return the button root for compatibility with the object system
        return button.root;
    } catch (error) {
        logError('ObjectLoader', 'Error creating button', { id: cfg.id, error }, 'createButton');
        throw error;
    }
}

function createEffect(scene: Phaser.Scene, cfg: EffectObject) {
    logDebug('ObjectLoader', 'Creating effect', { id: cfg.id, effectType: cfg.effectType, config: cfg }, 'createEffect');
    
    try {
        let effect: any = null;
        
        switch (cfg.effectType) {
            case 'embers': {
                const opts = {
                    count: cfg.count ?? 28,
                    spawnArea: cfg.spawnArea ?? { x: 0, y: 0, width: 1000, height: 600 },
                    baseY: cfg.baseY ?? 600, // Legacy support
                    budget: cfg.budget,
                    debugSpawnArea: cfg.debugSpawnArea ?? false,
                    
                    // Enhanced customization options
                    scale: cfg.embers?.scale,
                    colors: cfg.embers?.colors,
                    colorBlend: cfg.embers?.colorBlend,
                    rise: cfg.embers?.rise,
                    duration: cfg.embers?.duration,
                    sway: cfg.embers?.sway,
                    alpha: cfg.embers?.alpha,
                    blendMode: cfg.embers?.blendMode,
                    gravity: cfg.embers?.gravity,
                    wind: cfg.embers?.wind,
                    texture: cfg.embers?.texture,
                    
                    // Container bounds will be set after creation via updateContainerBounds
                };
                logDebug('ObjectLoader', 'Creating Embers with enhanced options', opts, 'createEffect');
                effect = new Embers(scene, opts);
                logDebug('ObjectLoader', 'Embers instance created', { effect }, 'createEffect');
                break;
            }
            // Add more effect types here as needed
            default:
                logWarn('ObjectLoader', 'Unknown effect type', { effectType: cfg.effectType, id: cfg.id }, 'createEffect');
                return null;
        }
        
        if (effect) {
            logDebug('ObjectLoader', 'Effect created, setting budget and applying properties', undefined, 'createEffect');
            
            // Don't set budget here - let the effect handle it when container bounds are set
            // This prevents embers from spawning at wrong positions before bounds are known
            logDebug('ObjectLoader', 'Budget will be set when container bounds are provided', undefined, 'createEffect');
            
            // Apply common properties
            logDebug('ObjectLoader', 'Applying common properties', undefined, 'createEffect');
            applyCommon(effect.root, cfg);
            
            // Store the effect instance for later access
            (effect.root as any).__embers = effect;
            logDebug('ObjectLoader', 'Stored __embers reference', { __embers: (effect.root as any).__embers }, 'createEffect');
            
            logDebug('ObjectLoader', 'Effect created successfully', { id: cfg.id, effect }, 'createEffect');
            return effect.root;
        }
        
        logWarn('ObjectLoader', 'No effect was created', undefined, 'createEffect');
        return null;
    } catch (error) {
        logError('ObjectLoader', 'Error creating effect', { id: cfg.id, error }, 'createEffect');
        throw error;
    }
}

function createGround(scene: Phaser.Scene, cfg: GroundObject) {
    const rect = scene.add.rectangle(cfg.x ?? 0, cfg.y ?? 0, cfg.width, cfg.height,
        cfg.color ?? 0x000000, cfg.alpha ?? 0)
        .setOrigin(0, 0)
        .setDepth(cfg.z ?? 0);

    // 🔑 give it a name so children.getByName('ground') works
    if (cfg.id) rect.setName(cfg.id);

    // static physics body
    scene.physics.add.existing(rect, true);
    (rect.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    return rect;
}

function createRain(
    scene: Phaser.Scene,
    cfg: RainObject,
    findById: (id: string) => any
) {
    const depth = cfg.z ?? 3;
    const opts = cfg.options ?? {};

    // Create the system (defaults + logic live inside Rain.ts now)
    const sys = new RainSystem(scene, opts as any, depth, (id: string) => findById(id));

    // Return a tiny invisible holder so it's registered with an id/depth if needed
    const dummy = scene.add.rectangle(0, 0, 1, 1, 0, 0).setVisible(false).setDepth(depth);
    if (cfg.id) dummy.setName(cfg.id);
    (dummy as any).__rain = sys;
    return dummy;
}

function createWater(scene: Phaser.Scene, cfg: WaterSurfaceObject) {
    const depth = cfg.z ?? 2;
    const ws = new WaterSurface(scene, cfg.options, depth);

    // a visible rectangle is already returned by the class; we still keep a holder for registry
    const holder = scene.add.rectangle(0, 0, 1, 1, 0, 0).setVisible(false).setDepth(depth);
    if (cfg.id) holder.setName(cfg.id);
    (holder as any).__water = ws;
    return holder;
}

function createSunRays(scene: Phaser.Scene, cfg: SunRaysObject) {
    const sys = new SunRays(scene, cfg.options, cfg.z ?? 50);
    const holder = scene.add.rectangle(0, 0, 1, 1, 0, 0).setVisible(false).setDepth(cfg.z ?? 50);
    if (cfg.id) holder.setName(cfg.id);
    (holder as any).__sunrays = sys;
    return holder;
}

function createSun(scene: Phaser.Scene, cfg: SunObject) {
    const depth = cfg.z ?? 39;
    const sys = new SunBody(scene, cfg.options, depth);
    const holder = scene.add.container(0, 0).setDepth(depth);
    if (cfg.id) holder.setName(cfg.id);
    // expose for others (SunRays follow, LensFlare source)
    (holder as any).getCenter = () => sys.getCenter();
    (holder as any).__sun = sys;
    // also position holder at sun for name lookup center
    holder.setPosition(sys.getCenter().x, sys.getCenter().y);
    // keep holder synced
    scene.events.on('update', () => {
        const c = sys.getCenter(); holder.setPosition(c.x, c.y);
    });
    return holder;
}

function createLensFlare(scene: Phaser.Scene, cfg: LensFlareObject) {
    const depth = cfg.z ?? 55;

    // ⬅️ ensure we always pass a concrete LensFlareOptions
    const opts: LensFlareOptions = {
        sourceId: 'sun-body',          // sensible default
        ...(cfg.options ?? {}),        // merge user options if provided
    };

            if (!opts.sourceId) {
            logWarn('ObjectLoader', 'options.sourceId missing; using "sun-body"', { options: opts }, 'createLensFlare');
            opts.sourceId = 'sun-body';
        }

    const sys = new LensFlare(scene, opts, depth);
    const holder = scene.add.container(0, 0).setDepth(depth);
    if (cfg.id) holder.setName(cfg.id);
    (holder as any).__lensflare = sys;
    return holder;
}

export function loadObjects(scene: Phaser.Scene, list: ObjectsConfig) {
    logInfo('ObjectLoader', 'Starting to load objects', { itemCount: list.length }, 'loadObjects');
    
    // sort by z so z=0 background is created first (optional; setDepth also ensures order)
    const sorted = [...list].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
    const made: Record<string, Phaser.GameObjects.GameObject> = {};

    for (const item of sorted) {
        logDebug('ObjectLoader', 'Processing item', { type: item.type, id: item.id, item }, 'loadObjects');
        let obj: Phaser.GameObjects.GameObject | null = null;
        switch (item.type) {
            case 'container': {
                const c = new GroupNode(scene, item.x ?? 0, item.y ?? 0, item.id);
                const sc = (item as any).scale;
                if (typeof sc === 'number') {
                    c.setScale(sc);
                } else if (sc && typeof sc.x === 'number' && typeof sc.y === 'number') {
                    c.setScale(sc.x, sc.y);
                }
                if (item.z != null) c.setDepth(item.z);
                if (typeof item.visible === 'boolean') c.setVisible(item.visible);

                // Hit area from config (optional)
                const anyItem = item as any;
                const ha = anyItem.hitArea as { kind?: string; width?: number; height?: number; originCenter?: boolean } | undefined;

                if (ha?.kind === 'rect' && typeof ha.width === 'number' && typeof ha.height === 'number') {
                    c.setHitRect(ha.width, ha.height, ha.originCenter ?? true);
                    if (anyItem.interactive) c.setInteractive();
                    if (anyItem.cursor === 'pointer') c.setCursor('pointer');
                } else if (anyItem.interactive) {
                    // fallback: if interactive but no rect provided, use current size if set
                    if (!c.input?.hitArea && c.width && c.height) c.setHitRect(c.width, c.height, true);
                    c.setInteractive();
                    if (anyItem.cursor === 'pointer') c.setCursor('pointer');
                }

                // Optional: build simple visual children (safe: no physics/FX here)
                const children = anyItem.children as any[] | undefined;
                if (children?.length) {
                    logDebug('ObjectLoader', 'Container has children', { childCount: children.length }, 'loadObjects');
                    for (const child of children) {
                        logDebug('ObjectLoader', 'Processing child', { type: child.type, id: child.id }, 'loadObjects');
                        let ch: Phaser.GameObjects.GameObject | null = null;
                                                 switch (child.type) {
                             case 'image': ch = createImage(scene, child); break;
                             case 'sprite': ch = createSprite(scene, child); break;
                             case 'tileSprite': ch = createTileSprite(scene, child); break;
                             case 'rect': ch = createRect(scene, child); break;
                             case 'text': ch = createText(scene, child); break;
                             case 'button': ch = createButton(scene, child as ButtonObject); break;
                             case 'effect': ch = createEffect(scene, child as EffectObject); break;
                             default: 
                                 logWarn('ObjectLoader', 'Unknown child type', { type: child.type, id: child.id }, 'loadObjects');
                                 ch = null; // avoid physics/FX inside container by default
                         }
                        if (ch) {
                            logDebug('ObjectLoader', 'Child created successfully', { type: child.type, id: child.id, child: ch }, 'loadObjects');
                            (ch as any).setPosition?.(child.x ?? 0, child.y ?? 0);
                            c.add(ch);
                            if (child.id) made[child.id] = ch;
                        } else {
                            logWarn('ObjectLoader', 'Failed to create child', { type: child.type, id: child.id }, 'loadObjects');
                        }
                    }
                }

                obj = c;
                break;
            }
            case 'background':
                obj = createBackground(scene, item);
                break;
            case 'image':
                obj = createImage(scene, item);
                break;
            case 'sprite':
                obj = createSprite(scene, item);
                break;
            case 'tileSprite':
                obj = createTileSprite(scene, item);
                break;
            case 'rect':
                obj = createRect(scene, item);
                break;
            case 'text':
                obj = createText(scene, item);
                break;
            case 'button':
                logDebug('ObjectLoader', 'Found button case for', { id: item.id }, 'loadObjects');
                obj = createButton(scene, item as ButtonObject);
                logDebug('ObjectLoader', 'Button object created', { id: item.id, obj }, 'loadObjects');
                break;
            case 'leaves': {
                const lo = item as LeavesObject;
                const leaves = new AutumnLeaves(scene, { z: lo.z ?? 2, ...(lo.options ?? {}) });
                // Track via a proxy GameObject to keep the return shape consistent
                // (or store leaves instance somewhere else if you prefer)
                const dummy = scene.add.rectangle(0, 0, 1, 1, 0, 0).setVisible(false).setDepth(lo.z ?? 2);
                (dummy as any).__leaves = leaves;
                obj = dummy;
                break;
            }
            case 'ground':
                obj = createGround(scene, item as GroundObject);
                break;
            case 'rain':
                obj = createRain(scene, item as RainObject, (id: string) => scene.children.getByName(id));
                break;
            case 'water':
                obj = createWater(scene, item as WaterSurfaceObject);
                break;
            case 'sunrays':
                obj = createSunRays(scene, item as SunRaysObject);
                break;
            case 'sun':
                obj = createSun(scene, item as SunObject);
                break;
            case 'lensflare':
                obj = createLensFlare(scene, item as LensFlareObject);
                break;
            case 'effect':
                logDebug('ObjectLoader', 'Found effect case for', { id: item.id, item }, 'loadObjects');
                obj = createEffect(scene, item as EffectObject);
                logDebug('ObjectLoader', 'Effect object created', { id: item.id, obj }, 'loadObjects');
                break;

            default:
                logWarn('ObjectLoader', 'Unknown type', { type: (item as any).type }, 'loadObjects');
        }
        if (obj && item.id) {
            made[item.id] = obj;
            logDebug('ObjectLoader', 'Stored object in made', { id: item.id, obj }, 'loadObjects');
        } else if (item.id) {
            logWarn('ObjectLoader', 'Failed to create or store object', { id: item.id, type: item.type }, 'loadObjects');
        }
    }

    logInfo('ObjectLoader', 'Final objects created', { objectKeys: Object.keys(made), objectCount: Object.keys(made).length }, 'loadObjects');
    logDebug('ObjectLoader', 'Made object details', made, 'loadObjects');
    return made;
}
