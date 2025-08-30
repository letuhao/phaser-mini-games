import { IEffectStrategy } from './IEffectStrategy';
import { IEffectObject } from '../objects/types';
import { logInfo, logDebug, logWarn, logError } from '../core/Logger';

/**
 * Effect Manager using Strategy Pattern
 * Manages different effect types through strategies
 */
export class EffectManager {
    private strategies: Map<string, IEffectStrategy> = new Map();
    private activeEffects: Map<string, IEffectObject> = new Map();
    
    constructor() {
        logInfo('EffectManager', 'Initialized', {
            note: "Ready to manage effects using strategy pattern"
        }, 'constructor');
    }
    
    /**
     * Register an effect strategy
     */
    registerStrategy(effectType: string, strategy: IEffectStrategy): void {
        this.strategies.set(effectType, strategy);
        logInfo('EffectManager', 'Strategy registered', {
            effectType,
            strategyName: strategy.constructor.name,
            supportedTypes: strategy.supportedTypes
        }, 'registerStrategy');
    }
    
    /**
     * Get a strategy for a specific effect type
     */
    getStrategy(effectType: string): IEffectStrategy | null {
        return this.strategies.get(effectType) || null;
    }
    
    /**
     * Check if a strategy exists for the given effect type
     */
    hasStrategy(effectType: string): boolean {
        return this.strategies.has(effectType);
    }
    
    /**
     * Get all registered effect types
     */
    getRegisteredEffectTypes(): string[] {
        return Array.from(this.strategies.keys());
    }
    
    /**
     * Create an effect using the appropriate strategy
     */
    createEffect(effectType: string, scene: Phaser.Scene, config: any): IEffectObject | null {
        const strategy = this.getStrategy(effectType);
        
        if (!strategy) {
            logError('EffectManager', 'No strategy found for effect type', {
                effectType,
                availableTypes: this.getRegisteredEffectTypes(),
                config
            }, 'createEffect');
            return null;
        }
        
        try {
            logDebug('EffectManager', 'Creating effect using strategy', {
                effectType,
                strategyName: strategy.constructor.name,
                config
            }, 'createEffect');
            
            const effect = strategy.createEffect(scene, config);
            
            if (effect) {
                // Store the active effect
                this.activeEffects.set(effect.id, effect);
                
                logInfo('EffectManager', 'Effect created successfully', {
                    effectType,
                    effectId: effect.id,
                    strategyName: strategy.constructor.name
                }, 'createEffect');
                
                return effect;
            } else {
                logWarn('EffectManager', 'Strategy returned null effect', {
                    effectType,
                    strategyName: strategy.constructor.name,
                    config
                }, 'createEffect');
                return null;
            }
        } catch (error) {
            logError('EffectManager', 'Error creating effect', {
                effectType,
                strategyName: strategy.constructor.name,
                error,
                config
            }, 'createEffect');
            return null;
        }
    }
    
    /**
     * Update all active effects
     */
    updateEffects(deltaTime: number): void {
        for (const [id, effect] of this.activeEffects) {
            try {
                const effectType = effect.type;
                const strategy = this.getStrategy(effectType);
                
                if (strategy) {
                    strategy.updateEffect(effect, deltaTime);
                }
            } catch (error) {
                logError('EffectManager', 'Error updating effect', {
                    effectId: id,
                    error
                }, 'updateEffects');
            }
        }
    }
    
    /**
     * Stop and destroy an effect
     */
    destroyEffect(effectId: string): boolean {
        const effect = this.activeEffects.get(effectId);
        
        if (!effect) {
            logWarn('EffectManager', 'Effect not found for destruction', {
                effectId,
                activeEffects: Array.from(this.activeEffects.keys())
            }, 'destroyEffect');
            return false;
        }
        
        try {
            const effectType = effect.type;
            const strategy = this.getStrategy(effectType);
            
            if (strategy) {
                strategy.destroyEffect(effect);
            }
            
            this.activeEffects.delete(effectId);
            
            logInfo('EffectManager', 'Effect destroyed successfully', {
                effectId,
                effectType,
                remainingEffects: this.activeEffects.size
            }, 'destroyEffect');
            
            return true;
        } catch (error) {
            logError('EffectManager', 'Error destroying effect', {
                effectId,
                error
            }, 'destroyEffect');
            return false;
        }
    }
    
    /**
     * Stop and destroy all effects
     */
    destroyAllEffects(): void {
        logInfo('EffectManager', 'Destroying all effects', {
            effectCount: this.activeEffects.size
        }, 'destroyAllEffects');
        
        for (const [id, effect] of this.activeEffects) {
            try {
                const effectType = effect.type;
                const strategy = this.getStrategy(effectType);
                
                if (strategy) {
                    strategy.destroyEffect(effect);
                }
            } catch (error) {
                logError('EffectManager', 'Error destroying effect during cleanup', {
                    effectId: id,
                    error
                }, 'destroyAllEffects');
            }
        }
        
        this.activeEffects.clear();
        
        logInfo('EffectManager', 'All effects destroyed', {
            remainingEffects: this.activeEffects.size
        }, 'destroyAllEffects');
    }
    
    /**
     * Get all active effects
     */
    getActiveEffects(): Map<string, IEffectObject> {
        return new Map(this.activeEffects);
    }
    
    /**
     * Get the count of active effects
     */
    getActiveEffectCount(): number {
        return this.activeEffects.size;
    }
    
    /**
     * Check if an effect is active
     */
    isEffectActive(effectId: string): boolean {
        return this.activeEffects.has(effectId);
    }
    
    /**
     * Get effect by ID
     */
    getEffect(effectId: string): IEffectObject | null {
        return this.activeEffects.get(effectId) || null;
    }
}
