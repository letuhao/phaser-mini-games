import Phaser from 'phaser';

/**
 * Interface for game object factories
 * Each factory handles a specific type of game object
 */
export interface IGameObjectFactory {
    /**
     * Check if this factory can create objects of the given type
     */
    canCreate(type: string): boolean;
    
    /**
     * Create a game object from configuration
     */
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null;
    
    /**
     * Array of object types this factory supports
     */
    supportedTypes: string[];
}

/**
 * Base class for game object factories
 * Provides common functionality and property application
 */
export abstract class BaseGameObjectFactory implements IGameObjectFactory {
    abstract readonly supportedTypes: string[];
    
    abstract create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null;
    
    canCreate(type: string): boolean {
        return this.supportedTypes.includes(type);
    }
    
    /**
     * Apply common properties to a game object
     */
    protected applyCommonProperties(obj: Phaser.GameObjects.GameObject, config: any): void {
        // Apply position first (critical for containers and positioning)
        if (config.x !== undefined || config.y !== undefined) {
            const currentX = (obj as any).x ?? 0;
            const currentY = (obj as any).y ?? 0;
            const newX = config.x !== undefined ? config.x : currentX;
            const newY = config.y !== undefined ? config.y : currentY;
            (obj as any).setPosition(newX, newY);
        }
        
        if (config.z !== undefined) (obj as any).setDepth(config.z);
        if (config.alpha !== undefined) (obj as any).setAlpha(config.alpha);
        if (config.angle !== undefined) (obj as any).setAngle(config.angle);
        if (config.scale !== undefined) {
            if (typeof config.scale === 'number') {
                (obj as any).setScale(config.scale);
            } else if (config.scale.x !== undefined || config.scale.y !== undefined) {
                (obj as any).setScale(config.scale.x ?? 1, config.scale.y ?? 1);
            }
        }
        if (config.origin !== undefined) {
            if (typeof config.origin === 'number') {
                (obj as any).setOrigin(config.origin);
            } else if (config.origin.x !== undefined || config.origin.y !== undefined) {
                (obj as any).setOrigin(config.origin.x ?? 0.5, config.origin.y ?? 0.5);
            }
        }
        if (config.visible !== undefined) (obj as any).setVisible(config.visible);
        if (config.id) (obj as any).setName(config.id);
    }
}
