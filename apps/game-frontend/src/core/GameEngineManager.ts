import { ResponsiveManager } from './ResponsiveManager';
import { CollisionManager } from './CollisionManager';
import { AudioManager } from './AudioManager';
import { MotionManager } from './MotionManager';
import { EventManager } from './EventManager';
import { StateManager } from './StateManager';
import { ResourceManager } from './ResourceManager';
import { InputManager } from './InputManager';
import { RuntimeManager } from './RuntimeManager';
import { EffectManager } from '../effects/EffectManager';
import { ButtonManager } from '../ui/ButtonManager';
import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Game Engine Manager - The Central Orchestrator
 * Manages all specialized managers and provides a unified interface
 * for game object management, collision, audio, motion, and effects
 */
export class GameEngineManager {
    private responsiveManager: ResponsiveManager;
    private collisionManager: CollisionManager;
    private audioManager: AudioManager;
    private motionManager: MotionManager;
    private eventManager: EventManager;
    private stateManager: StateManager;
    private resourceManager: ResourceManager;
    private inputManager: InputManager;
    private runtimeManager: RuntimeManager;
    private effectManager: EffectManager;
    private buttonManager: ButtonManager;
    
    private isActive: boolean = true;
    private updateCallbacks: Set<(deltaTime: number) => void> = new Set();
    
    constructor(scene: Phaser.Scene) {
        logInfo('GameEngineManager', 'Initializing game engine', {
            sceneName: scene.scene.key,
            note: "Creating all specialized managers"
        }, 'constructor');
        
        // Initialize all specialized managers
        this.responsiveManager = new ResponsiveManager(scene);
        this.collisionManager = new CollisionManager();
        this.audioManager = new AudioManager();
        this.motionManager = new MotionManager();
        this.eventManager = new EventManager();
        this.stateManager = new StateManager();
        this.resourceManager = new ResourceManager();
        this.inputManager = new InputManager();
        this.runtimeManager = new RuntimeManager();
        this.effectManager = new EffectManager();
        this.buttonManager = new ButtonManager();
        
        // Initialize input manager with scene
        this.inputManager.initialize(scene);
        
        logInfo('GameEngineManager', 'Game engine initialized successfully', {
            managers: [
                'ResponsiveManager',
                'CollisionManager', 
                'AudioManager',
                'MotionManager',
                'EventManager',
                'StateManager',
                'ResourceManager',
                'InputManager',
                'RuntimeManager',
                'EffectManager',
                'ButtonManager'
            ]
        }, 'constructor');
    }
    
    /**
     * Get the responsive manager
     */
    getResponsiveManager(): ResponsiveManager {
        return this.responsiveManager;
    }
    
    /**
     * Get the collision manager
     */
    getCollisionManager(): CollisionManager {
        return this.collisionManager;
    }
    
    /**
     * Get the audio manager
     */
    getAudioManager(): AudioManager {
        return this.audioManager;
    }
    
    /**
     * Get the motion manager
     */
    getMotionManager(): MotionManager {
        return this.motionManager;
    }
    
    /**
     * Get the event manager
     */
    getEventManager(): EventManager {
        return this.eventManager;
    }
    
    /**
     * Get the state manager
     */
    getStateManager(): StateManager {
        return this.stateManager;
    }
    
    /**
     * Get the resource manager
     */
    getResourceManager(): ResourceManager {
        return this.resourceManager;
    }
    
    /**
     * Get the input manager
     */
    getInputManager(): InputManager {
        return this.inputManager;
    }
    
    /**
     * Get the runtime manager
     */
    getRuntimeManager(): RuntimeManager {
        return this.runtimeManager;
    }
    
    /**
     * Get the effect manager
     */
    getEffectManager(): EffectManager {
        return this.effectManager;
    }
    
    /**
     * Get the button manager
     */
    getButtonManager(): ButtonManager {
        return this.buttonManager;
    }
    
    /**
     * Register an update callback (called each frame)
     */
    registerUpdateCallback(callback: (deltaTime: number) => void): void {
        this.updateCallbacks.add(callback);
        
        logDebug('GameEngineManager', 'Update callback registered', {
            totalCallbacks: this.updateCallbacks.size
        }, 'registerUpdateCallback');
    }
    
    /**
     * Unregister an update callback
     */
    unregisterUpdateCallback(callback: (deltaTime: number) => void): boolean {
        const removed = this.updateCallbacks.delete(callback);
        
        if (removed) {
            logDebug('GameEngineManager', 'Update callback unregistered', {
                remainingCallbacks: this.updateCallbacks.size
            }, 'unregisterUpdateCallback');
        }
        
        return removed;
    }
    
    /**
     * Main update method - called each frame
     */
    update(deltaTime: number): void {
        if (!this.isActive) return;
        
        try {
            // Update all managers
            this.collisionManager.update();
            this.effectManager.updateEffects(deltaTime);
            
            // Call all registered update callbacks
            for (const callback of this.updateCallbacks) {
                try {
                    callback(deltaTime);
                } catch (error) {
                    logError('GameEngineManager', 'Error in update callback', {
                        error
                    }, 'update');
                }
            }
        } catch (error) {
            logError('GameEngineManager', 'Error in main update loop', {
                error
            }, 'update');
        }
    }
    
    /**
     * Apply responsive scaling
     */
    applyResponsiveScaling(): void {
        try {
            this.responsiveManager.apply();
        } catch (error) {
            logError('GameEngineManager', 'Error applying responsive scaling', {
                error
            }, 'applyResponsiveScaling');
        }
    }
    
    /**
     * Pause all game systems
     */
    pause(): void {
        this.isActive = false;
        
        // Pause all managers
        this.collisionManager.setActive(false);
        this.motionManager.setActive(false);
        this.inputManager.setActive(false);
        this.audioManager.stopAllSounds();
        this.motionManager.stopAll();
        
        logInfo('GameEngineManager', 'Game engine paused', {
            note: "All systems paused"
        }, 'pause');
    }
    
    /**
     * Resume all game systems
     */
    resume(): void {
        this.isActive = true;
        
        // Resume all managers
        this.collisionManager.setActive(true);
        this.motionManager.setActive(true);
        this.inputManager.setActive(true);
        
        logInfo('GameEngineManager', 'Game engine resumed', {
            note: "All systems resumed"
        }, 'resume');
    }
    
    /**
     * Stop all game systems
     */
    stop(): void {
        this.isActive = false;
        
        // Stop all managers
        this.collisionManager.clear();
        this.audioManager.clear();
        this.motionManager.clear();
        this.eventManager.clear();
        this.stateManager.clear();
        this.resourceManager.clear();
        this.inputManager.clear();
        this.runtimeManager.clear();
        this.effectManager.destroyAllEffects();
        this.buttonManager.clearCommandHistory();
        
        logInfo('GameEngineManager', 'Game engine stopped', {
            note: "All systems stopped and cleared"
        }, 'stop');
    }
    
    /**
     * Get comprehensive game engine statistics
     */
    getStats(): {
        isActive: boolean;
        responsive: { observerCount: number };
        collision: { totalObjects: number; totalGroups: number; isActive: boolean };
        audio: { totalSounds: number; totalAudioObjects: number; totalGroups: number; globalVolume: number; globalMute: boolean };
        motion: { totalMotionObjects: number; totalAnimatableObjects: number; totalTweenableObjects: number; totalGroups: number; isActive: boolean };
        events: { totalEvents: number; totalOnceEvents: number; totalListeners: number; isActive: boolean };
        state: { totalStates: number; totalSubscribers: number; isActive: boolean; autoSave: boolean; autoSaveInterval: number };
        resources: { totalResources: number; totalTypes: number; currentMemoryUsage: number; maxMemoryUsage: number; memoryUsagePercentage: number; isActive: boolean };
        input: { totalKeyHandlers: number; totalMouseHandlers: number; totalTouchHandlers: number; totalGamepadHandlers: number; isActive: boolean };
        runtime: { totalSettings: number; totalEndpoints: number; totalHeaders: number; isActive: boolean; baseUrl: string; timeout: number; retryAttempts: number };
        effects: { activeEffectCount: number; registeredEffectTypes: string[] };
        buttons: { buttonCount: number; commandHistorySize: number };
        updateCallbacks: number;
    } {
        return {
            isActive: this.isActive,
            responsive: {
                observerCount: this.responsiveManager.getObserverCount()
            },
            collision: this.collisionManager.getStats(),
            audio: this.audioManager.getStats(),
            motion: this.motionManager.getStats(),
            events: this.eventManager.getStats(),
            state: this.stateManager.getStats(),
            resources: this.resourceManager.getStats(),
            input: this.inputManager.getStats(),
            runtime: this.runtimeManager.getStats(),
            effects: {
                activeEffectCount: this.effectManager.getActiveEffectCount(),
                registeredEffectTypes: this.effectManager.getRegisteredEffectTypes()
            },
            buttons: {
                buttonCount: this.buttonManager.getButtonCount(),
                commandHistorySize: this.buttonManager.getCommandHistory().length
            },
            updateCallbacks: this.updateCallbacks.size
        };
    }
    
    /**
     * Get a summary of all registered objects
     */
    getObjectSummary(): {
        responsive: string[];
        collision: string[];
        audio: string[];
        motion: string[];
        events: string[];
        state: string[];
        resources: string[];
        input: string[];
        runtime: string[];
        effects: string[];
        buttons: string[];
    } {
        return {
            responsive: this.responsiveManager.getObservers().map(obs => obs.getObserverId()),
            collision: this.collisionManager.getCollisionGroups(),
            audio: this.audioManager.getSoundGroups(),
            motion: this.motionManager.getMotionGroups(),
            events: this.eventManager.getEventNames(),
            state: this.stateManager.getStateKeys(),
            resources: this.resourceManager.getResourceTypes(),
            input: ['keyboard', 'mouse', 'touch', 'gamepad'], // Input types
            runtime: ['settings', 'endpoints'], // Runtime categories
            effects: this.effectManager.getRegisteredEffectTypes(),
            buttons: this.buttonManager.getRegisteredButtonIds()
        };
    }
    
    /**
     * Reset all managers to initial state
     */
    reset(): void {
        logInfo('GameEngineManager', 'Resetting game engine', {
            note: "All managers will be reset to initial state"
        }, 'reset');
        
        // Reset all managers
        this.responsiveManager.clearObservers();
        this.collisionManager.clear();
        this.audioManager.clear();
        this.motionManager.clear();
        this.eventManager.clear();
        this.stateManager.clear();
        this.resourceManager.clear();
        this.inputManager.clear();
        this.runtimeManager.clear();
        this.effectManager.destroyAllEffects();
        this.buttonManager.clearCommandHistory();
        
        // Clear update callbacks
        this.updateCallbacks.clear();
        
        // Reset state
        this.isActive = true;
        
        logInfo('GameEngineManager', 'Game engine reset completed', {
            note: "All managers reset to initial state"
        }, 'reset');
    }
    
    /**
     * Get debug information for troubleshooting
     */
    getDebugInfo(): {
        managerStatus: Record<string, boolean>;
        objectCounts: Record<string, number>;
        errorLog: string[];
    } {
        const stats = this.getStats();
        
        return {
            managerStatus: {
                responsive: stats.responsive.observerCount > 0,
                collision: stats.collision.isActive,
                audio: stats.audio.totalSounds > 0 || stats.audio.totalAudioObjects > 0,
                motion: stats.motion.isActive,
                events: stats.events.isActive,
                state: stats.state.isActive,
                resources: stats.resources.isActive,
                input: stats.input.isActive,
                runtime: stats.runtime.isActive,
                effects: stats.effects.activeEffectCount > 0,
                buttons: stats.buttons.buttonCount > 0
            },
            objectCounts: {
                responsiveObservers: stats.responsive.observerCount,
                collisionObjects: stats.collision.totalObjects,
                audioObjects: stats.audio.totalSounds + stats.audio.totalAudioObjects,
                motionObjects: stats.motion.totalMotionObjects + stats.motion.totalAnimatableObjects,
                eventListeners: stats.events.totalListeners,
                stateSubscribers: stats.state.totalSubscribers,
                resourceObjects: stats.resources.totalResources,
                inputHandlers: stats.input.totalKeyHandlers + stats.input.totalMouseHandlers + stats.input.totalTouchHandlers + stats.input.totalGamepadHandlers,
                runtimeSettings: stats.runtime.totalSettings,
                activeEffects: stats.effects.activeEffectCount,
                registeredButtons: stats.buttons.buttonCount
            },
            errorLog: [] // Could be extended to capture actual error logs
        };
    }
}
