// ============================================================================
// CONFIGURATION INDEX - Centralized Configuration Management
// ============================================================================
// This file provides a single entry point for all configuration imports
// This ensures clean, maintainable imports across the entire application

// Logger Configuration
export * from './LoggerConfig';

// Game Object Configurations
export * from './scenes/levisR3'; // LevisR3 scene configuration
export * from './demoConfig';

// Responsive Design Configurations
export * from './responsive.autumn';

// Configuration Types and Interfaces
export interface GameConfig {
    name: string;
    version: string;
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface PerformanceConfig {
    targetFPS: number;
    vSync: boolean;
    antiAliasing: boolean;
    maxParticles: number;
    maxEffects: number;
}

export interface AudioConfig {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    enable3DAudio: boolean;
}

export interface InputConfig {
    enableKeyboard: boolean;
    enableMouse: boolean;
    enableTouch: boolean;
    enableGamepad: boolean;
    keyBindings: Record<string, string>;
}

export interface NetworkConfig {
    enableMultiplayer: boolean;
    serverUrl: string;
    reconnectAttempts: number;
    heartbeatInterval: number;
}

// Default Configuration
export const DEFAULT_GAME_CONFIG: GameConfig = {
    name: 'Phaser Mini Games',
    version: '1.0.0',
    debug: false,
    logLevel: 'info'
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
    targetFPS: 60,
    vSync: true,
    antiAliasing: true,
    maxParticles: 1000,
    maxEffects: 100
};

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
    masterVolume: 1.0,
    musicVolume: 0.8,
    sfxVolume: 0.9,
    enable3DAudio: false
};

export const DEFAULT_INPUT_CONFIG: InputConfig = {
    enableKeyboard: true,
    enableMouse: true,
    enableTouch: true,
    enableGamepad: false,
    keyBindings: {
        'moveUp': 'KeyW',
        'moveDown': 'KeyS',
        'moveLeft': 'KeyA',
        'moveRight': 'KeyD',
        'jump': 'Space',
        'action': 'KeyE'
    }
};

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
    enableMultiplayer: false,
    serverUrl: 'ws://localhost:8080',
    reconnectAttempts: 3,
    heartbeatInterval: 30000
};

// Configuration Manager Interface
export interface IConfigManager {
    getGameConfig(): GameConfig;
    getPerformanceConfig(): PerformanceConfig;
    getAudioConfig(): AudioConfig;
    getInputConfig(): InputConfig;
    getNetworkConfig(): NetworkConfig;
    
    updateGameConfig(config: Partial<GameConfig>): void;
    updatePerformanceConfig(config: Partial<PerformanceConfig>): void;
    updateAudioConfig(config: Partial<AudioConfig>): void;
    updateInputConfig(config: Partial<InputConfig>): void;
    updateNetworkConfig(config: Partial<NetworkConfig>): void;
    
    saveConfigs(): Promise<boolean>;
    loadConfigs(): Promise<boolean>;
    resetToDefaults(): void;
}

// Configuration Validation
export function validateGameConfig(config: Partial<GameConfig>): GameConfig {
    return {
        ...DEFAULT_GAME_CONFIG,
        ...config,
        logLevel: config.logLevel && ['debug', 'info', 'warn', 'error'].includes(config.logLevel) 
            ? config.logLevel 
            : DEFAULT_GAME_CONFIG.logLevel
    };
}

export function validatePerformanceConfig(config: Partial<PerformanceConfig>): PerformanceConfig {
    return {
        ...DEFAULT_PERFORMANCE_CONFIG,
        ...config,
        targetFPS: config.targetFPS && config.targetFPS > 0 && config.targetFPS <= 144 
            ? config.targetFPS 
            : DEFAULT_PERFORMANCE_CONFIG.targetFPS,
        maxParticles: config.maxParticles && config.maxParticles > 0 && config.maxParticles <= 10000
            ? config.maxParticles
            : DEFAULT_PERFORMANCE_CONFIG.maxParticles,
        maxEffects: config.maxEffects && config.maxEffects > 0 && config.maxEffects <= 1000
            ? config.maxEffects
            : DEFAULT_PERFORMANCE_CONFIG.maxEffects
    };
}

export function validateAudioConfig(config: Partial<AudioConfig>): AudioConfig {
    return {
        ...DEFAULT_AUDIO_CONFIG,
        ...config,
        masterVolume: config.masterVolume !== undefined && config.masterVolume >= 0 && config.masterVolume <= 1
            ? config.masterVolume
            : DEFAULT_AUDIO_CONFIG.masterVolume,
        musicVolume: config.musicVolume !== undefined && config.musicVolume >= 0 && config.musicVolume <= 1
            ? config.musicVolume
            : DEFAULT_AUDIO_CONFIG.musicVolume,
        sfxVolume: config.sfxVolume !== undefined && config.sfxVolume >= 0 && config.sfxVolume <= 1
            ? config.sfxVolume
            : DEFAULT_AUDIO_CONFIG.sfxVolume
    };
}

// Configuration Events
export const CONFIG_EVENTS = {
    GAME_CONFIG_UPDATED: 'gameConfig:updated',
    PERFORMANCE_CONFIG_UPDATED: 'performanceConfig:updated',
    AUDIO_CONFIG_UPDATED: 'audioConfig:updated',
    INPUT_CONFIG_UPDATED: 'inputConfig:updated',
    NETWORK_CONFIG_UPDATED: 'networkConfig:updated',
    CONFIGS_SAVED: 'configs:saved',
    CONFIGS_LOADED: 'configs:loaded',
    CONFIGS_RESET: 'configs:reset'
} as const;

export type ConfigEventType = typeof CONFIG_EVENTS[keyof typeof CONFIG_EVENTS];
