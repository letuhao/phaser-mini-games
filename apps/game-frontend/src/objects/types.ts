export type ObjectKind =
    | 'background'
    | 'image'
    | 'sprite'
    | 'tileSprite'
    | 'rect'
    | 'text'
    | 'leaves'
    | 'ground'
    | 'rain'
    | 'water'
    | 'sunrays'
    | 'sun'
    | 'lensflare'
    | 'container';

export type RectHitArea = { kind: 'rect'; width: number; height: number; originCenter?: boolean };

export type BaseObject = {
    id?: string;
    type: ObjectKind;
    x?: number;
    y?: number;
    z?: number;          // display depth (Phaser's z-order)
    origin?: number | { x: number; y: number };
    angle?: number;
    alpha?: number;
    scale?: number | { x: number; y: number };
    visible?: boolean;
    props?: Record<string, any>;
};

export interface ContainerObject extends BaseObject {
    type: 'container';
    children?: BaseObject[];  // allow nested visuals
    hitArea?: RectHitArea;    // 👈 optional group-level input from config
    interactive?: boolean;    // quick flag: enable interaction if hitArea provided
    cursor?: 'pointer' | 'default';
}

export type BackgroundObject = BaseObject & {
    type: 'background';
    // Either a solid fill or a texture
    fill?: number;              // 0xRRGGBB
    fillAlpha?: number;         // 0..1
    textureKey?: string;        // if provided, will stretch to canvas
    tile?: boolean;             // use TileSprite if true
    /** How to fit the texture into the canvas (when textureKey provided). Default: 'stretch' */
    fit?: 'stretch' | 'contain' | 'cover';
};

export type ImageObject = BaseObject & {
    type: 'image';
    key: string;
    frame?: string | number;
};

export type SpriteObject = BaseObject & {
    type: 'sprite';
    key: string;
    frame?: string | number;
    anim?: string;              // optional animation key to play
    loop?: boolean;
};

export type TileSpriteObject = BaseObject & {
    type: 'tileSprite';
    key: string;
    width?: number;
    height?: number;
    tileScale?: number | { x: number; y: number };
    scroll?: { x?: number; y?: number }; // for simple parallax scrolling
};

export type RectObject = BaseObject & {
    type: 'rect';
    width: number;
    height: number;
    fill: number;               // 0xRRGGBB
    fillAlpha?: number;
    radius?: number;            // rounded rectangle
    stroke?: { color: number; width?: number; alpha?: number };
};

export type TextObject = BaseObject & {
    type: 'text';
    text: string;
    style?: Phaser.Types.GameObjects.Text.TextStyle;
};

export type LeavesObject = BaseObject & {
    type: 'leaves';
    options?: import('../effects/AutumnLeaves').LeavesOptions;
};

export type GroundObject = BaseObject & {
    type: 'ground';
    width: number;
    height: number;
    color?: number;
    alpha?: number;
    immovable?: boolean; // arcade static by default
};

export type RainObject = BaseObject & {
    type: 'rain';
    options?: import('../effects/Rain').RainOptions;
};

export type WaterSurfaceObject = BaseObject & {
    type: 'water';
    width?: number;                // defaults to scene width
    options?: import('../effects/WaterSurface').WaterSurfaceOptions;
};

export type SunRaysObject = BaseObject & {
    type: 'sunrays';
    options?: import('../effects/SunRays').SunRaysOptions;
};

// --- SUN ---
export type SunObject = BaseObject & {
    type: 'sun';
    /** If you omit x/y on the object, it will use options.static at runtime. */
    options?: {
        radius?: number;          // main disc radius
        color?: number;           // main disc color
        alpha?: number;           // main disc alpha
        glow?: { radius?: number; alpha?: number; color?: number }; // additive halo

        // Motion
        mode?: 'static' | 'linear' | 'circle';

        // NEW: pin sun to a screen corner (overrides mode if set)
        pinTo?: { corner: 'tl' | 'tr' | 'bl' | 'br'; offsetX?: number; offsetY?: number };

        static?: { x: number; y: number }; // used when mode:'static'

        linear?: {
            from: { x: number; y: number };
            to: { x: number; y: number };
            duration?: number; // ms
            yoyo?: boolean;
            repeat?: -1 | number;
            ease?: string;     // Phaser ease name
        };

        circle?: {
            cx: number; cy: number; r: number;
            angularSpeedDeg?: number; // deg/s (+ clockwise)
            phaseDeg?: number;        // start angle
            clockwise?: boolean;
        };

        flicker?: { amp?: number; freq?: number }; // subtle brightness flicker

        // NEW: animated AURA ring
        aura?: {
            enabled?: boolean;
            rate?: number;                   // spawns/sec
            life?: { min: number; max: number };
            radius?: { min: number; max: number }; // base outer radius (px), ~around glow
            thickness?: { min: number; max: number };
            edges?: { min: number; max: number };   // polygon vertices
            jitter?: number;                 // 0..1 radial wobble
            color?: number;
            alpha?: { min: number; max: number };
            rotDegPerSec?: { min: number; max: number };
            blend?: 'add' | 'screen';
        };

        // NEW: surface speckle
        spackle?: {
            enabled?: boolean;
            rate?: number;
            maxAlive?: number;
            size?: { min: number; max: number };
            life?: { min: number; max: number };
            brightenChance?: number;
            brightColor?: number;
            darkColor?: number;
            alpha?: { min: number; max: number };
            textureKey?: string;

            // NEW:
            autoCenter?: boolean;                 // default true
            contentOffset?: { x: number; y: number }; // manual px override (after scaling)
            clampToDisk?: boolean;                // default true (cap to 2*radius)
            textureKeys?: string[];               // if you want a pool of textures
        };
    };
};

export type LensFlareObject = BaseObject & {
    type: 'lensflare';
    options?: import('../effects/LensFlare').LensFlareOptions & { sourceId?: string };
};

export type SceneObject =
    | BackgroundObject
    | ImageObject
    | SpriteObject
    | TileSpriteObject
    | RectObject
    | TextObject
    | LeavesObject
    | GroundObject
    | RainObject
    | WaterSurfaceObject
    | SunRaysObject
    | SunObject
    | LensFlareObject
    | ContainerObject
    ;

export type ObjectsConfig = SceneObject[];
