import { logInfo, logDebug, logWarn, logError } from '../core/Logger';
import {
    IConfigManager,
    GameConfig,
    PerformanceConfig,
    AudioConfig,
    InputConfig,
    NetworkConfig,
    DEFAULT_GAME_CONFIG,
    DEFAULT_PERFORMANCE_CONFIG,
    DEFAULT_AUDIO_CONFIG,
    DEFAULT_INPUT_CONFIG,
    DEFAULT_NETWORK_CONFIG,
    validateGameConfig,
    validatePerformanceConfig,
    validateAudioConfig,
    CONFIG_EVENTS,
    ConfigEventType
} from './index';

/**
 * Configuration Manager - Centralized Configuration Management
 * Integrates with RuntimeManager for backend synchronization
 * Provides validation, persistence, and event emission
 */
export class ConfigManager implements IConfigManager {
    private gameConfig: GameConfig;
    private performanceConfig: PerformanceConfig;
    private audioConfig: AudioConfig;
    private inputConfig: InputConfig;
    private networkConfig: NetworkConfig;
    
    private eventEmitter: any; // Will be set by RuntimeManager
    private isInitialized: boolean = false;
    
    constructor() {
        // Initialize with defaults
        this.gameConfig = { ...DEFAULT_GAME_CONFIG };
        this.performanceConfig = { ...DEFAULT_PERFORMANCE_CONFIG };
        this.audioConfig = { ...DEFAULT_AUDIO_CONFIG };
        this.inputConfig = { ...DEFAULT_INPUT_CONFIG };
        this.networkConfig = { ...DEFAULT_NETWORK_CONFIG };
        
        logInfo('ConfigManager', 'Initialized with default configurations', {
            gameConfig: this.gameConfig,
            performanceConfig: this.performanceConfig,
            audioConfig: this.audioConfig,
            inputConfig: this.inputConfig,
            networkConfig: this.networkConfig
        }, 'constructor');
    }
    
    /**
     * Initialize with event emitter from RuntimeManager
     */
    initialize(eventEmitter: any): void {
        this.eventEmitter = eventEmitter;
        this.isInitialized = true;
        
        logInfo('ConfigManager', 'Initialized with event emitter', {
            hasEventEmitter: !!this.eventEmitter
        }, 'initialize');
    }
    
    /**
     * Emit configuration events
     */
    private emitEvent(event: ConfigEventType, data?: any): void {
        if (this.eventEmitter && this.isInitialized) {
            this.eventEmitter.emit(event, data);
        }
    }
    
    // Game Configuration
    getGameConfig(): GameConfig {
        return { ...this.gameConfig };
    }
    
    updateGameConfig(config: Partial<GameConfig>): void {
        const oldConfig = { ...this.gameConfig };
        this.gameConfig = validateGameConfig(config);
        
        logDebug('ConfigManager', 'Game configuration updated', {
            oldConfig,
            newConfig: this.gameConfig,
            changes: config
        }, 'updateGameConfig');
        
        this.emitEvent(CONFIG_EVENTS.GAME_CONFIG_UPDATED, {
            oldConfig,
            newConfig: this.gameConfig
        });
    }
    
    // Performance Configuration
    getPerformanceConfig(): PerformanceConfig {
        return { ...this.performanceConfig };
    }
    
    updatePerformanceConfig(config: Partial<PerformanceConfig>): void {
        const oldConfig = { ...this.performanceConfig };
        this.performanceConfig = validatePerformanceConfig(config);
        
        logDebug('ConfigManager', 'Performance configuration updated', {
            oldConfig,
            newConfig: this.performanceConfig,
            changes: config
        }, 'updatePerformanceConfig');
        
        this.emitEvent(CONFIG_EVENTS.PERFORMANCE_CONFIG_UPDATED, {
            oldConfig,
            newConfig: this.performanceConfig
        });
    }
    
    // Audio Configuration
    getAudioConfig(): AudioConfig {
        return { ...this.audioConfig };
    }
    
    updateAudioConfig(config: Partial<AudioConfig>): void {
        const oldConfig = { ...this.audioConfig };
        this.audioConfig = validateAudioConfig(config);
        
        logDebug('ConfigManager', 'Audio configuration updated', {
            oldConfig,
            newConfig: this.audioConfig,
            changes: config
        }, 'updateAudioConfig');
        
        this.emitEvent(CONFIG_EVENTS.AUDIO_CONFIG_UPDATED, {
            oldConfig,
            newConfig: this.audioConfig
        });
    }
    
    // Input Configuration
    getInputConfig(): InputConfig {
        return { ...this.inputConfig };
    }
    
    updateInputConfig(config: Partial<InputConfig>): void {
        const oldConfig = { ...this.inputConfig };
        this.inputConfig = { ...this.inputConfig, ...config };
        
        logDebug('ConfigManager', 'Input configuration updated', {
            oldConfig,
            newConfig: this.inputConfig,
            changes: config
        }, 'updateInputConfig');
        
        this.emitEvent(CONFIG_EVENTS.INPUT_CONFIG_UPDATED, {
            oldConfig,
            newConfig: this.inputConfig
        });
    }
    
    // Network Configuration
    getNetworkConfig(): NetworkConfig {
        return { ...this.networkConfig };
    }
    
    updateNetworkConfig(config: Partial<NetworkConfig>): void {
        const oldConfig = { ...this.networkConfig };
        this.networkConfig = { ...this.networkConfig, ...config };
        
        logDebug('ConfigManager', 'Network configuration updated', {
            oldConfig,
            newConfig: this.networkConfig,
            changes: config
        }, 'updateNetworkConfig');
        
        this.emitEvent(CONFIG_EVENTS.NETWORK_CONFIG_UPDATED, {
            oldConfig,
            newConfig: this.networkConfig
        });
    }
    
    // Configuration Persistence
    async saveConfigs(): Promise<boolean> {
        try {
            const configs = {
                game: this.gameConfig,
                performance: this.performanceConfig,
                audio: this.audioConfig,
                input: this.inputConfig,
                network: this.networkConfig,
                timestamp: Date.now()
            };
            
            // Save to localStorage
            localStorage.setItem('gameConfigs', JSON.stringify(configs));
            
            logInfo('ConfigManager', 'Configurations saved to localStorage', {
                configs,
                timestamp: configs.timestamp
            }, 'saveConfigs');
            
            this.emitEvent(CONFIG_EVENTS.CONFIGS_SAVED, configs);
            return true;
        } catch (error) {
            logError('ConfigManager', 'Error saving configurations', {
                error
            }, 'saveConfigs');
            return false;
        }
    }
    
    async loadConfigs(): Promise<boolean> {
        try {
            const configsData = localStorage.getItem('gameConfigs');
            
            if (configsData) {
                const configs = JSON.parse(configsData);
                
                // Load and validate each configuration
                if (configs.game) {
                    this.gameConfig = validateGameConfig(configs.game);
                }
                
                if (configs.performance) {
                    this.performanceConfig = validatePerformanceConfig(configs.performance);
                }
                
                if (configs.audio) {
                    this.audioConfig = validateAudioConfig(configs.audio);
                }
                
                if (configs.input) {
                    this.inputConfig = { ...this.inputConfig, ...configs.input };
                }
                
                if (configs.network) {
                    this.networkConfig = { ...this.networkConfig, ...configs.network };
                }
                
                logInfo('ConfigManager', 'Configurations loaded from localStorage', {
                    configs,
                    timestamp: configs.timestamp
                }, 'loadConfigs');
                
                this.emitEvent(CONFIG_EVENTS.CONFIGS_LOADED, configs);
                return true;
            }
            
            return false;
        } catch (error) {
            logError('ConfigManager', 'Error loading configurations', {
                error
            }, 'loadConfigs');
            return false;
        }
    }
    
    resetToDefaults(): void {
        const oldConfigs = {
            game: { ...this.gameConfig },
            performance: { ...this.performanceConfig },
            audio: { ...this.audioConfig },
            input: { ...this.inputConfig },
            network: { ...this.networkConfig }
        };
        
        // Reset to defaults
        this.gameConfig = { ...DEFAULT_GAME_CONFIG };
        this.performanceConfig = { ...DEFAULT_PERFORMANCE_CONFIG };
        this.audioConfig = { ...DEFAULT_AUDIO_CONFIG };
        this.inputConfig = { ...DEFAULT_INPUT_CONFIG };
        this.networkConfig = { ...DEFAULT_NETWORK_CONFIG };
        
        logInfo('ConfigManager', 'Configurations reset to defaults', {
            oldConfigs,
            newConfigs: {
                game: this.gameConfig,
                performance: this.performanceConfig,
                audio: this.audioConfig,
                input: this.inputConfig,
                network: this.networkConfig
            }
        }, 'resetToDefaults');
        
        this.emitEvent(CONFIG_EVENTS.CONFIGS_RESET, {
            oldConfigs,
            newConfigs: {
                game: this.gameConfig,
                performance: this.performanceConfig,
                audio: this.audioConfig,
                input: this.inputConfig,
                network: this.networkConfig
            }
        });
    }
    
    // Utility Methods
    getAllConfigs(): {
        game: GameConfig;
        performance: PerformanceConfig;
        audio: AudioConfig;
        input: InputConfig;
        network: NetworkConfig;
    } {
        return {
            game: this.getGameConfig(),
            performance: this.getPerformanceConfig(),
            audio: this.getAudioConfig(),
            input: this.getInputConfig(),
            network: this.getNetworkConfig()
        };
    }
    
    exportConfigs(): string {
        try {
            const configs = this.getAllConfigs();
            return JSON.stringify(configs, null, 2);
        } catch (error) {
            logError('ConfigManager', 'Error exporting configurations', {
                error
            }, 'exportConfigs');
            return '{}';
        }
    }
    
    importConfigs(jsonString: string): boolean {
        try {
            const configs = JSON.parse(jsonString);
            
            if (configs.game) {
                this.updateGameConfig(configs.game);
            }
            
            if (configs.performance) {
                this.updatePerformanceConfig(configs.performance);
            }
            
            if (configs.audio) {
                this.updateAudioConfig(configs.audio);
            }
            
            if (configs.input) {
                this.updateInputConfig(configs.input);
            }
            
            if (configs.network) {
                this.updateNetworkConfig(configs.network);
            }
            
            logInfo('ConfigManager', 'Configurations imported from JSON', {
                configs
            }, 'importConfigs');
            
            return true;
        } catch (error) {
            logError('ConfigManager', 'Error importing configurations', {
                error,
                jsonString
            }, 'importConfigs');
            return false;
        }
    }
    
    // Configuration Validation
    validateAllConfigs(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Validate game config
        if (!this.gameConfig.name || this.gameConfig.name.trim() === '') {
            errors.push('Game name is required');
        }
        
        if (!this.gameConfig.version || this.gameConfig.version.trim() === '') {
            errors.push('Game version is required');
        }
        
        // Validate performance config
        if (this.performanceConfig.targetFPS < 30 || this.performanceConfig.targetFPS > 144) {
            warnings.push('Target FPS should be between 30 and 144');
        }
        
        if (this.performanceConfig.maxParticles > 5000) {
            warnings.push('High particle count may impact performance');
        }
        
        // Validate audio config
        if (this.audioConfig.masterVolume > 1.0) {
            errors.push('Master volume cannot exceed 1.0');
        }
        
        if (this.audioConfig.musicVolume > 1.0) {
            errors.push('Music volume cannot exceed 1.0');
        }
        
        if (this.audioConfig.sfxVolume > 1.0) {
            errors.push('SFX volume cannot exceed 1.0');
        }
        
        // Validate input config
        if (!this.inputConfig.enableKeyboard && !this.inputConfig.enableMouse && 
            !this.inputConfig.enableTouch && !this.inputConfig.enableGamepad) {
            warnings.push('At least one input method should be enabled');
        }
        
        // Validate network config
        if (this.networkConfig.enableMultiplayer && !this.networkConfig.serverUrl) {
            errors.push('Server URL is required when multiplayer is enabled');
        }
        
        if (this.networkConfig.reconnectAttempts < 1 || this.networkConfig.reconnectAttempts > 10) {
            warnings.push('Reconnect attempts should be between 1 and 10');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
