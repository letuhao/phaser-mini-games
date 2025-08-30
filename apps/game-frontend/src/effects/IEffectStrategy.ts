import { IEffectObject, IBounds } from '../objects/types';

/**
 * Strategy pattern interface for effect creation and management
 * Each effect type implements this interface to provide consistent behavior
 */
export interface IEffectStrategy {
    /**
     * Create an effect object from configuration
     */
    createEffect(scene: Phaser.Scene, config: any): IEffectObject;
    
    /**
     * Update the effect (called each frame)
     */
    updateEffect(effect: IEffectObject, deltaTime: number): void;
    
    /**
     * Clean up the effect
     */
    destroyEffect(effect: IEffectObject): void;
    
    /**
     * Check if this strategy can handle the given effect type
     */
    canHandle(effectType: string): boolean;
    
    /**
     * Get the effect types this strategy supports
     */
    supportedTypes: string[];
}

/**
 * Base class for effect strategies providing common functionality
 */
export abstract class BaseEffectStrategy implements IEffectStrategy {
    abstract readonly supportedTypes: string[];
    
    canHandle(effectType: string): boolean {
        return this.supportedTypes.includes(effectType);
    }
    
    abstract createEffect(scene: Phaser.Scene, config: any): IEffectObject;
    
    updateEffect(effect: IEffectObject, deltaTime: number): void {
        // Default implementation - override in subclasses if needed
    }
    
    destroyEffect(effect: IEffectObject): void {
        if (effect) {
            effect.destroy();
        }
    }
    
    /**
     * Apply common properties to effect objects
     */
    protected applyCommonProperties(effect: IEffectObject, config: any): void {
        // Note: IEffectObject doesn't have setPosition/setVisible methods
        // These will be handled by the concrete effect implementations
        if (config.x !== undefined || config.y !== undefined) {
            // Position will be set by the effect's constructor or specific methods
        }
        
        if (config.visible !== undefined) {
            // Visibility will be set by the effect's constructor or specific methods
        }
    }
}
