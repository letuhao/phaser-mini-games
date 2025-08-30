import Phaser from 'phaser';
import { ObjectsConfig, SceneObject } from './types';
import { FactoryRegistry } from './factories/FactoryRegistry';
import { logInfo, logDebug, logError, logWarn } from '../core/Logger';

/**
 * Game Object Loader using Factory Pattern
 * Follows SOLID principles and design patterns
 */
export class ObjectLoader {
    private factoryRegistry: FactoryRegistry;
    
    constructor() {
        this.factoryRegistry = new FactoryRegistry();
    }
    
    /**
     * Load objects from configuration using the factory registry
     */
    loadObjects(scene: Phaser.Scene, list: ObjectsConfig): Record<string, Phaser.GameObjects.GameObject> {
        logInfo('ObjectLoader', 'Starting to load objects', { itemCount: list.length }, 'loadObjects');
        
        // Sort by z-order for proper layering
        const sorted = [...list].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
        const made: Record<string, Phaser.GameObjects.GameObject> = {};
        
        for (const item of sorted) {
            logDebug('ObjectLoader', 'Processing item', { 
                type: item.type, 
                id: item.id, 
                item 
            }, 'loadObjects');
            
            const obj = this.createObject(scene, item);
            if (obj && item.id) {
                made[item.id] = obj;
                logDebug('ObjectLoader', 'Stored object in made', { id: item.id, obj }, 'loadObjects');
            } else if (item.id) {
                logWarn('ObjectLoader', 'Failed to create or store object', { 
                    id: item.id, 
                    type: item.type 
                }, 'loadObjects');
            }
        }
        
        logInfo('ObjectLoader', 'Final objects created', { 
            objectKeys: Object.keys(made), 
            objectCount: Object.keys(made).length 
        }, 'loadObjects');
        
        logDebug('ObjectLoader', 'Made object details', made, 'loadObjects');
        return made;
    }
    
    /**
     * Create a single object using the factory registry
     */
    private createObject(scene: Phaser.Scene, config: SceneObject): Phaser.GameObjects.GameObject | null {
        try {
            const obj = this.factoryRegistry.createObject(scene, config);
            
            if (obj) {
                logDebug('ObjectLoader', 'Object created successfully', { 
                    type: config.type, 
                    id: config.id,
                    obj 
                }, 'createObject');
            }
            
            return obj;
        } catch (error) {
            logError('ObjectLoader', 'Error creating object', { 
                type: config.type, 
                id: config.id, 
                error 
            }, 'createObject');
            return null;
        }
    }
    
    /**
     * Get the factory registry for external access
     */
    getFactoryRegistry(): FactoryRegistry {
        return this.factoryRegistry;
    }
}
