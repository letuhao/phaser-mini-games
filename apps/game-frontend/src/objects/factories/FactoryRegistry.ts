import Phaser from 'phaser';
import { SceneObject } from '../types';
import { IGameObjectFactory } from './GameObjectFactory';
import { BackgroundFactory } from './BackgroundFactory';
import { EffectFactory } from './EffectFactory';
import { ButtonFactory } from './ButtonFactory';
import { ContainerFactory } from './ContainerFactory';
import { SimpleObjectFactory } from './SimpleObjectFactory';
import { SpawnAreaFactory } from './SpawnAreaFactory';
import { logInfo, logDebug, logWarn, logError } from '../../core/Logger';

/**
 * Registry for managing all game object factories
 * Implements the Registry pattern for factory management
 */
export class FactoryRegistry {
    private factories: Map<string, IGameObjectFactory> = new Map();
    
    constructor() {
        this.registerDefaultFactories();
    }
    
    /**
     * Register a factory for specific object types
     */
    registerFactory(factory: IGameObjectFactory): void {
        for (const type of factory.supportedTypes) {
            this.factories.set(type, factory);
            logDebug('FactoryRegistry', 'Registered factory', { 
                type, 
                factoryName: factory.constructor.name 
            }, 'registerFactory');
        }
    }
    
    /**
     * Get factory for a specific object type
     */
    getFactory(type: string): IGameObjectFactory | null {
        return this.factories.get(type) || null;
    }
    
    /**
     * Check if a factory exists for a specific type
     */
    hasFactory(type: string): boolean {
        return this.factories.has(type);
    }
    
    /**
     * Get all registered factory types
     */
    getRegisteredTypes(): string[] {
        return Array.from(this.factories.keys());
    }
    
    /**
     * Create a game object using the appropriate factory
     */
    createObject(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        const type = config.type;
        logDebug('FactoryRegistry', 'Creating object', { 
            type: type, 
            id: config.id,
            availableFactories: Array.from(this.factories.keys()),
            factoryNames: Array.from(this.factories.values()).map(factory => factory.constructor.name)
        }, 'createObject');
        
        const factory = this.factories.get(type);
        if (!factory) {
            logError('FactoryRegistry', 'No factory found for type', { 
                type: type, 
                id: config.id,
                availableTypes: Array.from(this.factories.keys())
            }, 'createObject');
            return null;
        }
        
        logDebug('FactoryRegistry', 'Factory found', { 
            type: type, 
            id: config.id,
            factoryName: factory.constructor.name,
            factorySupportedTypes: (factory as any).supportedTypes
        }, 'createObject');
        
        try {
            const obj = factory.create(scene, config);
            if (obj) {
                logDebug('FactoryRegistry', 'Object created successfully', { 
                    type: type, 
                    id: config.id,
                    factoryName: factory.constructor.name,
                    objectType: obj.constructor.name
                }, 'createObject');
            } else {
                logWarn('FactoryRegistry', 'Factory returned null', { 
                    type: type, 
                    id: config.id,
                    factoryName: factory.constructor.name
                }, 'createObject');
            }
            return obj;
        } catch (error) {
            logError('FactoryRegistry', 'Error creating object', { 
                type: type, 
                id: config.id,
                factoryName: factory.constructor.name,
                error: error
            }, 'createObject');
            return null;
        }
    }
    
    /**
     * Register the default set of factories
     */
    private registerDefaultFactories(): void {
        logInfo('FactoryRegistry', 'Registering default factories', undefined, 'registerDefaultFactories');
        
        this.registerFactory(new BackgroundFactory());
        this.registerFactory(new EffectFactory());
        this.registerFactory(new ButtonFactory());
        this.registerFactory(new ContainerFactory());
        this.registerFactory(new SimpleObjectFactory());
        this.registerFactory(new SpawnAreaFactory());
        
        logInfo('FactoryRegistry', 'Default factories registered', { 
            types: this.getRegisteredTypes() 
        }, 'registerDefaultFactories');
    }
}
