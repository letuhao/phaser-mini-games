/**
 * Module Resolver - Centralized Import Management
 * Provides clean, maintainable import paths for the entire application
 * This prevents import path issues and makes refactoring easier
 */

// ============================================================================
// CORE MODULES
// ============================================================================
export * from './Logger';
export * from './ResponsiveManager';
export * from './CollisionManager';
export * from './AudioManager';
export * from './MotionManager';
export * from './EventManager';
export * from './StateManager';
export * from './ResourceManager';
export * from './InputManager';
export * from './RuntimeManager';
export * from './GameEngineManager';

// ============================================================================
// UI MODULES
// ============================================================================
export * from '../ui/ICommand';
export * from '../ui/ButtonManager';

// ============================================================================
// EFFECTS MODULES
// ============================================================================
export * from '../effects/IEffectStrategy';
export * from '../effects/EffectManager';

// ============================================================================
// OBJECTS MODULES
// ============================================================================
export * from '../objects/types';
export * from '../objects/BaseGameObject';
export * from '../objects/Container';
export * from '../objects/Button';
export * from '../objects/Text';
export * from '../objects/ObjectFactory';
export * from '../objects/ObjectLoader';
export * from '../objects/factories/SpawnAreaFactory';

// ============================================================================
// SCENES MODULES
// ============================================================================
export * from '../scenes/WheelScene';
export * from '../scenes/LevisR3WheelScene';

// ============================================================================
// UTILITY MODULES
// ============================================================================
// PhaserUtils removed - file doesn't exist

// ============================================================================
// CONFIGURATION MODULES
// ============================================================================
export * from '../config/index';
export * from '../config/scenes/levisR3';
export * from '../config/theme';
export * from '../config/scenes/levisR3/theme.levisR3';
export * from '../config/scenes/levisR3/assets.levisR3.config';

// ============================================================================
// TYPE RE-EXPORTS FOR CONVENIENCE
// ============================================================================
export type {
    // Core interfaces
    IGameObject,
    IScalable,
    IPositionable,
    IVisible,
    IBounds,
    IContainer,
    
    // Game engine interfaces
    IHitBox,
    ICollision,
    IPhysics,
    IMotion,
    IAnimatable,
    ITweenable,
    ISound,
    IAudio,
    IUpdateable,
    IInteractable,
    IDamageable,
    
    // UI interfaces
    IUIObject,
    IButtonObject,
    ITextObject,
    
    // Effect interfaces
    IEffectObject,
    IParticleEffect,
    ISpawnArea,
    
    // Object interfaces
    IImageObject,
    ISpriteObject,
    ITileSpriteObject,
    IRectObject,
    IBackgroundObject
} from '../objects/types';

export type {
    // Configuration interfaces
    GameConfig,
    PerformanceConfig,
    AudioConfig,
    InputConfig,
    NetworkConfig,
    IConfigManager
} from '../config';

// ============================================================================
// CONSTANT RE-EXPORTS
// ============================================================================
export {
    // Configuration constants
    DEFAULT_GAME_CONFIG,
    DEFAULT_PERFORMANCE_CONFIG,
    DEFAULT_AUDIO_CONFIG,
    DEFAULT_INPUT_CONFIG,
    DEFAULT_NETWORK_CONFIG,
    
    // Configuration events
    CONFIG_EVENTS,
    
    // Validation functions
    validateGameConfig,
    validatePerformanceConfig,
    validateAudioConfig
} from '../config';

// ============================================================================
// FACTORY RE-EXPORTS
// ============================================================================
export {
    // Factory classes
    SpawnAreaFactory
} from '../objects/factories/SpawnAreaFactory';

// ============================================================================
// MANAGER RE-EXPORTS
// ============================================================================
// Manager classes are exported individually to avoid circular imports
export { EventManager } from './EventManager';
export { StateManager } from './StateManager';
export { ResourceManager } from './ResourceManager';
export { InputManager } from './InputManager';
export { RuntimeManager } from './RuntimeManager';
export { ConfigManager } from './ConfigManager';
export { GameRegistry } from './GameRegistry';

// ============================================================================
// UTILITY RE-EXPORTS
// ============================================================================
export {
    // Utility functions
    logInfo,
    logDebug,
    logWarn,
    logError
} from './Logger';
