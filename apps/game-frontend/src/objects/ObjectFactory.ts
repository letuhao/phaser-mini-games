// ============================================================================
// OBJECT FACTORY - Factory for Creating Game Objects
// ============================================================================
// This factory creates different types of game objects based on configuration
// Uses the Factory Pattern for object creation

import { logInfo, logDebug, logWarn, logError } from '../core/Logger';
import { BaseGameObject } from './BaseGameObject';
import { Container } from './Container';
import { Button } from './Button';
import { Text } from './Text';
import { 
    BaseObjectConfig, 
    ContainerObjectConfig, 
    ButtonObjectConfig, 
    TextObjectConfig,
    ObjectKind 
} from './types';

export class ObjectFactory {
    private static instance: ObjectFactory;
    
    private constructor() {
        logInfo('ObjectFactory', 'Object factory initialized', {}, 'constructor');
    }
    
    public static getInstance(): ObjectFactory {
        if (!ObjectFactory.instance) {
            ObjectFactory.instance = new ObjectFactory();
        }
        return ObjectFactory.instance;
    }
    
    /**
     * Create a game object based on configuration
     */
    public createObject(config: BaseObjectConfig, scene: Phaser.Scene): BaseGameObject | null {
        try {
            logDebug('ObjectFactory', 'Creating game object', {
                type: config.type,
                id: config.id
            }, 'createObject');
            
            switch (config.type) {
                case 'container':
                    return this.createContainer(config as ContainerObjectConfig, scene);
                    
                case 'button':
                    return this.createButton(config as ButtonObjectConfig, scene);
                    
                case 'text':
                    return this.createText(config as TextObjectConfig, scene);
                    
                default:
                    logWarn('ObjectFactory', `Unknown object type: ${config.type}`, {
                        type: config.type,
                        id: config.id
                    }, 'createObject');
                    return null;
            }
        } catch (error) {
            logError('ObjectFactory', 'Error creating game object', {
                type: config.type,
                id: config.id,
                error: error instanceof Error ? error.message : String(error)
            }, 'createObject');
            return null;
        }
    }
    
    /**
     * Create a container object
     */
    private createContainer(config: ContainerObjectConfig, scene: Phaser.Scene): Container {
        logDebug('ObjectFactory', 'Creating container object', {
            id: config.id,
            type: config.type
        }, 'createContainer');
        
        return new Container(config, scene);
    }
    
    /**
     * Create a button object
     */
    private createButton(config: ButtonObjectConfig, scene: Phaser.Scene): Button {
        logDebug('ObjectFactory', 'Creating button object', {
            id: config.id,
            type: config.type,
            text: config.text
        }, 'createButton');
        
        return new Button(config, scene);
    }
    
    /**
     * Create a text object
     */
    private createText(config: TextObjectConfig, scene: Phaser.Scene): Text {
        logDebug('ObjectFactory', 'Creating text object', {
            id: config.id,
            type: config.type,
            text: config.text
        }, 'createText');
        
        return new Text(config, scene);
    }
    
    /**
     * Get supported object types
     */
    public getSupportedTypes(): ObjectKind[] {
        return ['container', 'button', 'text'];
    }
    
    /**
     * Check if object type is supported
     */
    public isTypeSupported(type: string): boolean {
        return this.getSupportedTypes().includes(type as ObjectKind);
    }
    
    /**
     * Get factory statistics
     */
    public getStats(): {
        supportedTypes: ObjectKind[];
        totalSupportedTypes: number;
        isActive: boolean;
    } {
        return {
            supportedTypes: this.getSupportedTypes(),
            totalSupportedTypes: this.getSupportedTypes().length,
            isActive: true
        };
    }
}
