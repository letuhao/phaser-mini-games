import Phaser from 'phaser';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { logDebug } from '../../core/Logger';

/**
 * Factory for creating simple game objects
 */
export class SimpleObjectFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['image', 'sprite', 'tileSprite', 'rect', 'text'];
    
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        logDebug('SimpleObjectFactory', 'Creating simple object', { type: config.type, id: config.id }, 'create');
        
        let obj: Phaser.GameObjects.GameObject | null = null;
        
        switch (config.type) {
            case 'image':
                obj = this.createImage(scene, config);
                break;
            case 'sprite':
                obj = this.createSprite(scene, config);
                break;
            case 'tileSprite':
                obj = this.createTileSprite(scene, config);
                break;
            case 'rect':
                obj = this.createRect(scene, config);
                break;
            case 'text':
                obj = this.createText(scene, config);
                break;
            default:
                return null;
        }
        
        if (obj) {
            this.applyCommonProperties(obj, config);
        }
        
        return obj;
    }
    
    private createImage(scene: Phaser.Scene, config: any): Phaser.GameObjects.Image {
        const img = scene.add.image(config.x ?? 0, config.y ?? 0, config.key, config.frame);
        return img;
    }
    
    private createSprite(scene: Phaser.Scene, config: any): Phaser.GameObjects.Sprite {
        const spr = scene.add.sprite(config.x ?? 0, config.y ?? 0, config.key, config.frame);
        if (config.anim) spr.play({ key: config.anim, repeat: config.loop ? -1 : 0 });
        return spr;
    }
    
    private createTileSprite(scene: Phaser.Scene, config: any): Phaser.GameObjects.TileSprite {
        const width = config.width ?? scene.scale.width;
        const height = config.height ?? scene.scale.height;
        const ts = scene.add.tileSprite(config.x ?? 0, config.y ?? 0, width, height, config.key);
        ts.setOrigin(0.5, 0.5);
        
        if (typeof config.tileScale === 'number') {
            ts.setTileScale(config.tileScale);
        } else if (config.tileScale) {
            ts.setTileScale(config.tileScale.x ?? 1, config.tileScale.y ?? 1);
        }
        
        if (config.scroll) {
            scene.events.on('update', () => {
                ts.tilePositionX += config.scroll?.x ?? 0;
                ts.tilePositionY += config.scroll?.y ?? 0;
            });
        }
        
        return ts;
    }
    
    private createRect(scene: Phaser.Scene, config: any): Phaser.GameObjects.Rectangle {
        const r = scene.add.rectangle(config.x ?? 0, config.y ?? 0, config.width, config.height, config.fill, config.fillAlpha ?? 1);
        if (config.radius) (r as any).setStrokeStyle(0); // rounded handled via graphics typically; keep simple
        if (config.stroke) (r as any).setStrokeStyle(config.stroke.width ?? 2, config.stroke.color, config.stroke.alpha ?? 1);
        return r;
    }
    
    private createText(scene: Phaser.Scene, config: any): Phaser.GameObjects.Text {
        const t = scene.add.text(config.x ?? 0, config.y ?? 0, config.text, config.style);
        return t;
    }
}
