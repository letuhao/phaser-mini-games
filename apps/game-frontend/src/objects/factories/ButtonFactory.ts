import Phaser from 'phaser';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { UIButton } from '../../ui/Button';
import { logDebug, logError } from '../../core/Logger';

/**
 * Factory for creating button objects
 */
export class ButtonFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['button'];
    
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        logDebug('ButtonFactory', 'Creating button', { id: config.id, config }, 'create');
        
        try {
            // Create UIButton with the configuration
            const button = new UIButton(scene, {
                x: config.x ?? 0,
                y: config.y ?? 0,
                width: config.width,
                height: config.height,
                shape: config.shape,
                displayMode: config.displayMode,
                text: config.text,
                icon: config.icon,
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
                textColor: config.textColor?.toString() || '#000000',
                iconColor: config.iconColor,
                fontSize: config.fontSize,
                fontFamily: config.fontFamily,
                
                // Background image support
                backgroundImage: config.backgroundImage,
                backgroundImageScale: config.backgroundImageScale,
                backgroundImageOrigin: config.backgroundImageOrigin,
                
                hoverScale: config.hoverScale,
                clickScale: config.clickScale,
                hoverTint: config.hoverTint,
                clickTint: config.clickTint,
                hoverSound: config.hoverSound,
                clickSound: config.clickSound,
                onClick: typeof config.onClick === 'string' 
                    ? () => { window.open(config.onClick as string, '_blank'); }
                    : (config.onClick || (() => {})),
            });
            
            logDebug('ButtonFactory', 'Button created successfully', { id: config.id, button }, 'create');
            
            // Apply common properties
            this.applyCommonProperties(button.root, config);
            
            logDebug('ButtonFactory', 'Button properties applied', { id: config.id, buttonRoot: button.root }, 'create');
            
            // Return the button root for compatibility with the object system
            return button.root;
        } catch (error) {
            logError('ButtonFactory', 'Error creating button', { id: config.id, error }, 'create');
            throw error;
        }
    }
}
