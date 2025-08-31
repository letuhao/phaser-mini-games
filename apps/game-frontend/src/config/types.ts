// ============================================================================
// CONFIGURATION TYPE SYSTEM
// ============================================================================
// This file defines all configuration interfaces to eliminate 'any' types

// ============================================================================
// BASE CONFIGURATION INTERFACE
// ============================================================================

export interface IBaseConfiguration {
    id: string;
    type: string;
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scale?: number | { x: number; y: number };
    visible?: boolean;
    alpha?: number;
    angle?: number;
    z?: number;
    origin?: { x: number; y: number };
    interactive?: boolean;
    cursor?: string;
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

export interface ITweenConfig {
    target: { x?: number; y?: number; scale?: number; alpha?: number; angle?: number };
    duration: number;
    ease?: string;
    delay?: number;
    repeat?: number;
    yoyo?: boolean;
}

// ============================================================================
// SOUND CONFIGURATIONS
// ============================================================================

export interface ISoundConfig {
    volume?: number;
    loop?: boolean;
    rate?: number;
    detune?: number;
    seek?: number;
    fadeIn?: number;
    fadeOut?: number;
}

// ============================================================================
// POINTER & INPUT CONFIGURATIONS
// ============================================================================

export interface IPointerConfig {
    x: number;
    y: number;
    button?: number;
    id?: number;
    isTouch?: boolean;
}

// ============================================================================
// STYLE & VISUAL CONFIGURATIONS
// ============================================================================

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

// ============================================================================
// EFFECT SPECIFIC CONFIGURATIONS
// ============================================================================

export interface IEmbersConfig {
    particleCount?: number;
    spread?: number;
    speed?: number;
    lifetime?: number;
    gravity?: number;
    colors?: string[];
}

export interface IEffectOptions {
    duration?: number;
    intensity?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    easing?: string;
    repeat?: number;
    yoyo?: boolean;
}

// ============================================================================
// GAME OBJECT CONFIGURATIONS
// ============================================================================

export interface IGameObjectConfig extends IBaseConfiguration {
    hitBox?: {
        width: number;
        height: number;
        originCenter?: boolean;
    };
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

// ============================================================================
// ASSET CONFIGURATIONS
// ============================================================================

export interface IAssetConfig {
    key: string;
    type: 'image' | 'audio' | 'font' | 'atlas' | 'spritesheet' | 'json';
    url: string;
    preload?: boolean;
    config?: {
        // Atlas specific
        atlasURL?: string;
        imageURL?: string;
        format?: 'XML' | 'JSON';
        // Audio specific
        volume?: number;
        loop?: boolean;
        // Image specific
        frameWidth?: number;
        frameHeight?: number;
    };
}

// ============================================================================
// EVENT CONFIGURATIONS
// ============================================================================

export interface IEventConfig {
    event: string;
    data?: unknown;
    once?: boolean;
}

// ============================================================================
// RESOURCE CONFIGURATIONS
// ============================================================================

export interface IResourceConfig {
    key: string;
    type: string;
    source: string | URL | File;
    metadata?: Record<string, unknown>;
    options?: {
        cache?: boolean;
        priority?: number;
        timeout?: number;
    };
}

// ============================================================================
// GAME STATE CONFIGURATIONS
// ============================================================================

export interface IGameStateConfig {
    gameId: string;
    state: Record<string, unknown>;
    timestamp: number;
    version?: string;
}

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export interface IThemeConfig {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        border: string;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            small: string;
            medium: string;
            large: string;
            heading: string;
        };
        fontWeight: {
            normal: number;
            bold: number;
        };
    };
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    borderRadius: {
        small: number;
        medium: number;
        large: number;
    };
}
