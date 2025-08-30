import Phaser from 'phaser';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { Embers } from '../../effects/Embers';
import { logDebug, logWarn, logError } from '../../core/Logger';

/**
 * Factory for creating effect objects
 */
export class EffectFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['effect'];
    
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        logDebug('EffectFactory', 'Creating effect', { id: config.id, effectType: config.effectType, config }, 'create');
        
        try {
            let effect: any = null;
            
            switch (config.effectType) {
                case 'embers': {
                    const opts = {
                        count: config.count ?? 28,
                        spawnArea: config.spawnArea ?? { x: 0, y: 0, width: 1000, height: 600 },
                        baseY: config.baseY ?? 600, // Legacy support
                        budget: config.budget,
                        debugSpawnArea: config.debugSpawnArea ?? false,
                        
                        // Enhanced customization options
                        scale: config.embers?.scale,
                        colors: config.embers?.colors,
                        colorBlend: config.embers?.colorBlend,
                        rise: config.embers?.rise,
                        duration: config.embers?.duration,
                        sway: config.embers?.sway,
                        alpha: config.embers?.alpha,
                        blendMode: config.embers?.blendMode,
                        gravity: config.embers?.gravity,
                        wind: config.embers?.wind,
                        texture: config.embers?.texture,
                        
                        // Container bounds will be set after creation via updateContainerBounds
                    };
                    logDebug('EffectFactory', 'Creating Embers with enhanced options', opts, 'create');
                    effect = new Embers(scene, opts);
                    logDebug('EffectFactory', 'Embers instance created', { effect }, 'create');
                    break;
                }
                // Add more effect types here as needed
                default:
                    logWarn('EffectFactory', 'Unknown effect type', { effectType: config.effectType, id: config.id }, 'create');
                    return null;
            }
            
            if (effect) {
                logDebug('EffectFactory', 'Effect created, applying properties', undefined, 'create');
                
                // Don't set budget here - let the effect handle it when container bounds are set
                // This prevents embers from spawning at wrong positions before bounds are known
                logDebug('EffectFactory', 'Budget will be set when container bounds are provided', undefined, 'create');
                
                // Apply common properties
                logDebug('EffectFactory', 'Applying common properties', undefined, 'create');
                this.applyCommonProperties(effect.root, config);
                
                // Store the effect instance for later access
                (effect.root as any).__embers = effect;
                logDebug('EffectFactory', 'Stored __embers reference', { 
                    __embers: (effect.root as any).__embers,
                    effectType: effect.constructor.name,
                    effectRoot: effect.root,
                    effectRootType: effect.root.constructor.name,
                    note: "Embers reference stored for ResponsiveManager to access"
                }, 'create');
                
                logDebug('EffectFactory', 'Effect created successfully', { id: config.id, effect }, 'create');
                return effect.root;
            }
            
            logWarn('EffectFactory', 'No effect was created', undefined, 'create');
            return null;
        } catch (error) {
            logError('EffectFactory', 'Error creating effect', { id: config.id, error }, 'create');
            return null;
        }
    }
}
