import { SpawnAreaObjectConfig } from '../types';
import { IGameObjectFactory } from './GameObjectFactory';
import { logInfo, logDebug, logWarn, logError } from '../../core/Logger';

export class SpawnAreaFactory implements IGameObjectFactory {
    /**
     * Array of object types this factory supports
     */
    readonly supportedTypes: string[] = ['spawn-area'];
    
    /**
     * Check if this factory can create objects of the given type
     */
    canCreate(type: string): boolean {
        return this.supportedTypes.includes(type);
    }
    
    create(scene: Phaser.Scene, config: SpawnAreaObjectConfig): Phaser.GameObjects.GameObject | null {
        logDebug('SpawnAreaFactory', 'Creating spawn area', { id: config.id, config }, 'create');
        
        try {
            // Log the exact config being received
            logDebug('SpawnAreaFactory', 'Config validation', {
                id: config.id,
                width: config.width,
                height: config.height,
                widthType: typeof config.width,
                heightType: typeof config.height,
                configKeys: Object.keys(config),
                configType: config.type,
                note: "Validating spawn area configuration"
            }, 'create');
            
            // Validate required properties
            if (!config.width || !config.height) {
                logError('SpawnAreaFactory', 'Missing required width or height', { 
                    id: config.id, 
                    width: config.width, 
                    height: config.height,
                    widthTruthy: !!config.width,
                    heightTruthy: !!config.height
                }, 'create');
                return null;
            }
            
            logDebug('SpawnAreaFactory', 'Validation passed, creating container', {
                id: config.id,
                width: config.width,
                height: config.height,
                note: "Width and height validation successful"
            }, 'create');
            
            // Step-by-step logging to identify where error occurs
            logDebug('SpawnAreaFactory', 'Step 1: About to create container', {
                id: config.id,
                x: config.x ?? 0,
                y: config.y ?? 0,
                note: "Creating Phaser container"
            }, 'create');
            
            // Create a container for the spawn area
            const container = scene.add.container(config.x ?? 0, config.y ?? 0);
            
            logDebug('SpawnAreaFactory', 'Step 2: Container created, setting properties', {
                id: config.id,
                containerType: container.constructor.name,
                containerName: container.name,
                note: "Container created successfully, now setting properties"
            }, 'create');
            
            // Set container properties
            if (config.id) container.name = config.id;
            if (config.z !== undefined) container.setDepth(config.z);
            if (config.alpha !== undefined) container.setAlpha(config.alpha);
            if (config.visible !== undefined) container.setVisible(config.visible);
            
            logDebug('SpawnAreaFactory', 'Step 3: Basic properties set, handling scale', {
                id: config.id,
                hasScale: !!config.scale,
                scaleType: typeof config.scale,
                note: "Basic properties set, now handling scale"
            }, 'create');
            
            if (config.scale) {
                if (typeof config.scale === 'number') {
                    container.setScale(config.scale, config.scale);
                } else {
                    container.setScale(config.scale.x, config.scale.y);
                }
            }
            
            logDebug('SpawnAreaFactory', 'Step 4: Scale set, handling origin', {
                id: config.id,
                hasOrigin: !!config.origin,
                originType: typeof config.origin,
                note: "Scale set, now handling origin"
            }, 'create');
            
            if (config.origin) {
                // Note: Phaser containers have read-only origin properties
                // For spawn areas, the origin is not essential for functionality
                // The positioning will be handled by the ResponsiveManager based on dock/anchor
                logDebug('SpawnAreaFactory', 'Origin config provided but not set (containers have read-only origin)', {
                    id: config.id,
                    origin: config.origin,
                    note: "Origin not set - containers have read-only origin properties. Positioning handled by ResponsiveManager."
                }, 'create');
            }
            
            logDebug('SpawnAreaFactory', 'Step 5: Origin set, handling debug rectangle', {
                id: config.id,
                hasFill: config.fill !== undefined,
                fillValue: config.fill,
                note: "Origin set, now handling debug rectangle"
            }, 'create');
            
            // Add debug visualization if fill color is specified
            if (config.fill !== undefined) {
                const debugRect = scene.add.rectangle(
                    config.width / 2,
                    config.height / 2,
                    config.width,
                    config.height,
                    config.fill,
                    config.alpha ?? 0.3
                );
                container.add(debugRect);
                
                logDebug('SpawnAreaFactory', 'Added debug rectangle', {
                    id: config.id,
                    fill: config.fill,
                    alpha: config.alpha ?? 0.3,
                    size: { width: config.width, height: config.height }
                }, 'create');
            }
            
            logDebug('SpawnAreaFactory', 'Step 6: Debug rectangle added, setting config', {
                id: config.id,
                note: "Debug rectangle added, now setting spawn area config"
            }, 'create');
            
            // Store spawn area configuration for effects to access
            (container as any).__spawnAreaConfig = {
                effectType: config.effectType,
                margin: config.margin ?? 50,
                density: config.density ?? 1,
                dock: config.dock,
                anchor: config.anchor,
                followBackground: config.followBackground,
                width: config.width,
                height: config.height
            };
            
            logDebug('SpawnAreaFactory', 'Step 7: Config stored, returning container', {
                id: config.id,
                note: "Spawn area config stored, returning container"
            }, 'create');
            
            logInfo('SpawnAreaFactory', 'Spawn area created successfully', {
                id: config.id,
                container: {
                    name: container.name,
                    type: container.constructor.name,
                    position: { x: container.x, y: container.y },
                    size: { width: config.width, height: config.height }
                },
                config: (container as any).__spawnAreaConfig
            }, 'create');
            
            return container;
            
        } catch (error) {
            // Enhanced error logging to capture more details
            const errorDetails = {
                id: config.id,
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
                errorType: error?.constructor?.name || typeof error,
                config: config,
                note: "Detailed error information for debugging"
            };
            
            logError('SpawnAreaFactory', 'Error creating spawn area', errorDetails, 'create');
            console.error('🔍 SpawnAreaFactory Error Details:', errorDetails); // Additional console logging
            return null;
        }
    }
}
