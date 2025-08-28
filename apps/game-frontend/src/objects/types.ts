export type BaseObject = {
    id?: string;
    type: 'background' | 'image' | 'sprite' | 'tileSprite' | 'rect' | 'text' | 'leaves' | 'ground' | 'rain' | 'water' | 'sunrays';
    x?: number;
    y?: number;
    z?: number;          // display depth (Phaser's z-order)
    origin?: number | { x: number; y: number };
    angle?: number;
    alpha?: number;
    scale?: number | { x: number; y: number };
    visible?: boolean;
};

export type BackgroundObject = BaseObject & {
    type: 'background';
    // Either a solid fill or a texture
    fill?: number;              // 0xRRGGBB
    fillAlpha?: number;         // 0..1
    textureKey?: string;        // if provided, will stretch to canvas
    tile?: boolean;             // use TileSprite if true
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
    ;

export type ObjectsConfig = SceneObject[];
