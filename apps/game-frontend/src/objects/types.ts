// Core interfaces following SOLID principles
export interface IGameObject {
    id: string;
    type: string;
    scene: Phaser.Scene;
    destroy(): void;
}

export interface IScalable {
    resize(scale: number, bounds?: IBounds): void;
}

export interface IPositionable {
    setPosition(x: number, y: number): void;
    getPosition(): { x: number; y: number };
    x: number;
    y: number;
}

export interface IVisible {
    visible: boolean;
    setVisible(visible: boolean): void;
}

export interface IBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    centerX: number;
    centerY: number;
}

// Extended bounds interface for background objects with scaling information
export interface IBackgroundBounds extends IBounds {
    originalWidth: number;
    originalHeight: number;
    finalWidth: number;
    finalHeight: number;
    
    // Container bounds (Phaser Container that follows image)
    containerLeft: number;
    containerRight: number;
    containerTop: number;
    containerBottom: number;
    containerWidth: number;
    containerHeight: number;
    containerCenterX: number;
    containerCenterY: number;
    
    // Background properties
    fitMode?: 'contain' | 'cover' | 'fill';
    tile?: boolean;
    textureKey?: string;
}

// Collision & Physics interfaces
export interface IHitBox {
    getHitBox(): IBounds;
    setHitBox(bounds: IBounds): void;
    isCollidingWith(other: IHitBox): boolean;
    getCollisionBounds(): IBounds;
}

export interface ICollision {
    onCollisionEnter(other: IGameObject): void;
    onCollisionStay(other: IGameObject): void;
    onCollisionExit(other: IGameObject): void;
    isCollisionEnabled: boolean;
    setCollisionEnabled(enabled: boolean): void;
}

export interface IPhysics {
    velocity: { x: number; y: number };
    acceleration: { x: number; y: number };
    mass: number;
    friction: number;
    gravity: number;
    setVelocity(x: number, y: number): void;
    setAcceleration(x: number, y: number): void;
    applyForce(force: { x: number; y: number }): void;
    updatePhysics(deltaTime: number): void;
}

// Motion & Animation interfaces
export interface IMotion {
    moveTo(x: number, y: number, duration?: number): void;
    moveBy(dx: number, dy: number, duration?: number): void;
    rotateTo(angle: number, duration?: number): void;
    rotateBy(deltaAngle: number, duration?: number): void;
    scaleTo(scale: number, duration?: number): void;
    scaleBy(deltaScale: number, duration?: number): void;
    stopMotion(): void;
    isMoving: boolean;
}

// ============================================================================
// ANIMATION & TWEEN CONFIGURATIONS
// ============================================================================

export interface IAnimationConfig {
    key: string;
    frameRate?: number;
    repeat?: number;
    yoyo?: boolean;
    duration?: number;
}

export interface ITweenTarget {
    x?: number;
    y?: number;
    scale?: number;
    alpha?: number;
    angle?: number;
}

export interface ISoundConfig {
    volume?: number;
    loop?: boolean;
    rate?: number;
    detune?: number;
    seek?: number;
    fadeIn?: number;
    fadeOut?: number;
}

export interface IPointerData {
    x: number;
    y: number;
    button?: number;
    id?: number;
    isTouch?: boolean;
}

// ============================================================================
// GAME OBJECT INTERFACES
// ============================================================================

export interface IAnimatable {
    playAnimation(key: string, config?: IAnimationConfig): void;
    stopAnimation(): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    setAnimationSpeed(speed: number): void;
    getCurrentAnimation(): string | null;
    isPlaying: boolean;
    isPaused: boolean;
}

export interface ITweenable {
    tweenTo(target: ITweenTarget, duration: number, ease?: string): void;
    tweenBy(delta: ITweenTarget, duration: number, ease?: string): void;
    stopTween(): void;
    isTweening: boolean;
}

// Audio & Sound interfaces
export interface ISound {
    playSound(key: string, config?: ISoundConfig): void;
    stopSound(): void;
    pauseSound(): void;
    resumeSound(): void;
    setVolume(volume: number): void;
    setLoop(loop: boolean): void;
    isPlaying: boolean;
    isPaused: boolean;
}

export interface IAudio {
    volume: number;
    mute: boolean;
    setVolume(volume: number): void;
    setMute(mute: boolean): void;
    fadeIn(duration: number): void;
    fadeOut(duration: number): void;
}

// Game Logic interfaces
export interface IUpdateable {
    update(deltaTime: number): void;
    isActive: boolean;
    setActive(active: boolean): void;
}

export interface IInteractable {
    onPointerDown(pointer: IPointerData): void;
    onPointerUp(pointer: IPointerData): void;
    onPointerOver(pointer: IPointerData): void;
    onPointerOut(pointer: IPointerData): void;
    onPointerMove(pointer: IPointerData): void;
    isInteractive: boolean;
    setInteractive(interactive: boolean): void;
}

export interface IDamageable {
    health: number;
    maxHealth: number;
    isAlive: boolean;
    takeDamage(amount: number): void;
    heal(amount: number): void;
    onDeath(): void;
    onDamage(amount: number): void;
}

// Container interfaces
export interface IContainer extends IGameObject, IScalable, IPositionable, IVisible {
    children: IGameObject[];
    addChild(child: IGameObject): void;
    removeChild(child: IGameObject): void;
    getChildAt(index: number): IGameObject | null;
    getChildCount(): number;
}

// UI interfaces
export interface IUIObject extends IGameObject, IScalable, IPositionable, IVisible, IInteractable {
    enable(): void;
    disable(): void;
    isEnabled: boolean;
}

export interface IButtonObject extends IUIObject, ISound {
    onClick: () => void;
    setEnabled(enabled: boolean): void;
    setText(text: string): void;
    setIcon(iconKey: string): void;
    setBackgroundColor(color: number): void;
    setBorderColor(color: number): void;
}

export interface ITextObject extends IUIObject {
    setText(text: string): void;
    setFontSize(size: string): void;
    setColor(color: string): void;
    text: string;
}

// Effect interfaces
export interface IEffectObject extends IGameObject, IScalable, IUpdateable {
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    isActive: boolean;
    isPaused: boolean;
}

export interface IParticleEffect extends IEffectObject, IUpdateable {
    setSpawnArea(area: IBounds): void;
    setParticleCount(count: number): void;
    setBudget(budget: number): void;
}

// Spawn area interfaces
export interface ISpawnArea extends IContainer, IUpdateable {
    effectType: string;
    margin: number;
    density: number;
    setEffectType(effectType: string): void;
    setMargin(margin: number): void;
    setDensity(density: number): void;
}

// Image and sprite interfaces
export interface IImageObject extends IGameObject, IScalable, IPositionable, IVisible, IHitBox {
    setTexture(key: string): void;
    setScale(scale: number): void;
    setAlpha(alpha: number): void;
    textureKey: string;
}

export interface ISpriteObject extends IImageObject, IAnimatable {
    setFrame(frameKey: string): void;
    frameKey?: string;
}

export interface ITileSpriteObject extends IImageObject {
    setTilePosition(x: number, y: number): void;
}

// Rectangle interface
export interface IRectObject extends IGameObject, IScalable, IPositionable, IVisible, IHitBox {
    setSize(width: number, height: number): void;
    setFillColor(color: number): void;
    setBorderColor(color: number): void;
    setAlpha(alpha: number): void;
    width: number;
    height: number;
    fillColor?: number;
    borderColor?: number;
}

// Background interface
export interface IBackgroundObject extends IGameObject, IScalable, IPositionable, IVisible, IContainer {
    setTexture(key: string): void;
    setFitMode(mode: 'contain' | 'cover' | 'fill'): void;
    setTile(tile: boolean): void;
    textureKey?: string;
    fitMode?: 'contain' | 'cover' | 'fill';
    tile?: boolean;
    
    // Container-specific methods for backgrounds
    getBackgroundBounds(): IBackgroundBounds;
    getImageBounds(): IBounds;
    getContainerBounds(): IBounds;
}

// Object types that can be created
export type ObjectKind = 
    | 'background' 
    | 'container' 
    | 'effect' 
    | 'button' 
    | 'image' 
    | 'sprite' 
    | 'tileSprite' 
    | 'rect' 
    | 'text' 
    | 'spawn-area'
    | 'leaves'
    | 'ground'
    | 'rain'
    | 'water'
    | 'sunrays'
    | 'sun'
    | 'lensflare';

// Configuration types (for data, not game objects)
export interface IStyleConfig {
    color?: string | number;
    backgroundColor?: string | number;
    borderColor?: string | number;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number | { top: number; right: number; bottom: number; left: number };
    margin?: number | { top: number; right: number; bottom: number; left: number };
    fontFamily?: string;
    fontSize?: string | number;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
}

export interface BaseObjectConfig {
    type: ObjectKind;
    id: string;
    z?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: number;
    alpha?: number;
    visible?: boolean;
    scale?: number | { x: number; y: number };
    origin?: { x: number; y: number };
    effectType?: string;
    text?: string;
    shape?: string;
    count?: number;
    budget?: number;
    debugSpawnArea?: boolean;
    margin?: number;
    density?: number;
    backgroundColor?: number;
    borderColor?: number;
    hoverScale?: number;
    clickScale?: number;
    hoverTint?: number;
    clickTint?: number;
    backgroundImage?: string;
    backgroundImageScale?: string;
    backgroundImageOrigin?: { x: number; y: number };
    onClick?: () => void;
    style?: IStyleConfig;
    embers?: Record<string, unknown>;
    dock?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    anchor?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    followBackground?: boolean;
    displayMode?: 'text' | 'icon' | 'both';
    children?: BaseObjectConfig[];
    
    // New game engine properties
    hitBox?: IBounds;
    collision?: boolean;
    physics?: {
        mass?: number;
        friction?: number;
        gravity?: number;
    };
    motion?: {
        velocity?: { x: number; y: number };
        acceleration?: { x: number; y: number };
    };
    sound?: {
        key?: string;
        volume?: number;
        loop?: boolean;
    };
    animation?: {
        key?: string;
        speed?: number;
        loop?: boolean;
    };
    interaction?: boolean;
    health?: number;
    maxHealth?: number;
}

// Specialized configuration interfaces
export interface BackgroundObjectConfig extends BaseObjectConfig {
    type: 'background';
    textureKey?: string;
    tile?: boolean;
    fit?: 'contain' | 'cover' | 'fill';
    fill?: number;
    fillAlpha?: number;
}

export interface ContainerObjectConfig extends BaseObjectConfig {
    type: 'container';
}

export interface EffectObjectConfig extends BaseObjectConfig {
    type: 'effect';
    embers?: {
        scale?: { min: number; max: number };
        colors?: number[];
        colorBlend?: boolean;
        rise?: { min: number; max: number };
        duration?: { min: number; max: number };
        sway?: { min: number; max: number };
        alpha?: { min: number; max: number };
        blendMode?: string;
        gravity?: number;
        wind?: number;
        texture?: {
            key?: string;
            size?: number;
            shape?: 'circle' | 'square' | 'star' | 'diamond';
        };
    };
}

export interface SpawnAreaObjectConfig extends BaseObjectConfig {
    type: 'spawn-area';
}

export interface ButtonObjectConfig extends BaseObjectConfig {
    type: 'button';
}

export interface TextObjectConfig extends BaseObjectConfig {
    type: 'text';
}

export interface RectObjectConfig extends BaseObjectConfig {
    type: 'rect';
}

export interface ImageObjectConfig extends BaseObjectConfig {
    type: 'image';
    textureKey: string;
}

export interface SpriteObjectConfig extends BaseObjectConfig {
    type: 'sprite';
    textureKey: string;
    frameKey?: string;
}

export interface TileSpriteObjectConfig extends BaseObjectConfig {
    type: 'tileSprite';
    textureKey: string;
}

// Additional configuration types for backward compatibility
export interface LeavesObjectConfig extends BaseObjectConfig {
    type: 'leaves';
    options?: Record<string, unknown>;
}

export interface GroundObjectConfig extends BaseObjectConfig {
    type: 'ground';
}

export interface RainObjectConfig extends BaseObjectConfig {
    type: 'rain';
    options?: Record<string, unknown>;
}

export interface WaterSurfaceObjectConfig extends BaseObjectConfig {
    type: 'water';
    options?: Record<string, unknown>;
}

export interface SunRaysObjectConfig extends BaseObjectConfig {
    type: 'sunrays';
    options?: Record<string, unknown>;
}

export interface SunObjectConfig extends BaseObjectConfig {
    type: 'sun';
    options?: Record<string, unknown>;
}

export interface LensFlareObjectConfig extends BaseObjectConfig {
    type: 'lensflare';
    options?: Record<string, unknown>;
}

// Union type for all configuration objects
export type ObjectsConfig = Array<
    | BackgroundObjectConfig
    | ContainerObjectConfig
    | EffectObjectConfig
    | ButtonObjectConfig
    | ImageObjectConfig
    | SpriteObjectConfig
    | TileSpriteObjectConfig
    | RectObjectConfig
    | TextObjectConfig
    | SpawnAreaObjectConfig
    | LeavesObjectConfig
    | GroundObjectConfig
    | RainObjectConfig
    | WaterSurfaceObjectConfig
    | SunRaysObjectConfig
    | SunObjectConfig
    | LensFlareObjectConfig
>;

// Legacy type for backward compatibility
export type SceneObject = ObjectsConfig[number];
