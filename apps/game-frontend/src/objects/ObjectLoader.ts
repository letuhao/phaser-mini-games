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
} from './types';
import { AutumnLeaves } from '../effects/AutumnLeaves';
import { RainSystem } from '../effects/Rain';
import { WaterSurface } from '../effects/WaterSurface';
import { SunRays } from '../effects/SunRays';

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
            const img = scene.add.image(0, 0, cfg.textureKey).setOrigin(0, 0);
            img.setDisplaySize(w, h);
            o = img;
        }
    } else {
        // Solid fill using a full-screen rectangle
        const g = scene.add.rectangle(0, 0, w, h, cfg.fill ?? 0x000000, cfg.fillAlpha ?? 1).setOrigin(0, 0);
        o = g;
    }

    // Always stay under everything else
    (o as any).setDepth(typeof cfg.z === 'number' ? cfg.z : 0);

    // Auto-resize
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
        const { width, height } = gameSize;
        if ((o as any).setDisplaySize) {
            (o as any).setDisplaySize(width, height);
        } else if (o instanceof Phaser.GameObjects.Rectangle) {
            o.setSize(width, height);
            o.setDisplaySize(width, height);
        } else if (o instanceof Phaser.GameObjects.TileSprite) {
            o.width = width;
            o.height = height;
        } else if (o instanceof Phaser.GameObjects.Image) {
            o.setDisplaySize(width, height);
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

export function loadObjects(scene: Phaser.Scene, list: ObjectsConfig) {
    // sort by z so z=0 background is created first (optional; setDepth also ensures order)
    const sorted = [...list].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
    const made: Record<string, Phaser.GameObjects.GameObject> = {};

    for (const item of sorted) {
        let obj: Phaser.GameObjects.GameObject | null = null;
        switch (item.type) {
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

            default:
                console.warn('[ObjectLoader] Unknown type', (item as any).type);
        }
        if (obj && item.id) made[item.id] = obj;
    }

    return made;
}
