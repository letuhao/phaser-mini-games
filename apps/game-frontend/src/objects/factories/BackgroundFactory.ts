import Phaser from 'phaser';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { Background } from '../Background';
import { BackgroundObjectConfig } from '../types';
import { logDebug, logInfo, logError } from '../../core/Logger';

/**
 * Factory for creating background objects
 */
export class BackgroundFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['background'];
    
    create(scene: Phaser.Scene, config: BackgroundObjectConfig): Phaser.GameObjects.GameObject | null {
        logDebug('BackgroundFactory', 'Creating background container', { config }, 'create');
        
        const w = scene.scale.width;
        const h = scene.scale.height;
        
        logDebug('BackgroundFactory', 'Screen dimensions', { 
            screenWidth: w, 
            screenHeight: h 
        }, 'create');
        
        // Create the Background container instance
        const backgroundContainer = new Background(config, scene);
        
        let phaserObject: Phaser.GameObjects.GameObject;
        
        if (config.textureKey) {
            // Check if texture exists
            if (!scene.textures.exists(config.textureKey)) {
                logError('BackgroundFactory', 'Texture not found', { 
                    textureKey: config.textureKey,
                    availableTextures: Object.keys(scene.textures.list),
                    note: 'Make sure the texture is loaded in the scene preload method'
                }, 'create');
                return null;
            }
            
            logDebug('BackgroundFactory', 'Texture found, creating background image', { 
                textureKey: config.textureKey,
                textureExists: scene.textures.exists(config.textureKey)
            }, 'create');
            
            if (config.tile) {
                const ts = scene.add.tileSprite(0, 0, w, h, config.textureKey).setOrigin(0, 0);
                phaserObject = ts;
            } else {
                const img = scene.add.image(0, 0, config.textureKey).setOrigin(0.5, 0.5);
                this.setupTextureFitting(scene, img, config);
                phaserObject = img;
                
                // Store original and final dimensions for scaling calculations
                img.setData('originalWidth', img.width);
                img.setData('originalHeight', img.height);
                img.setData('finalWidth', img.width);
                img.setData('finalHeight', img.height);
            }
        } else {
            // Solid fill using a full-screen rectangle
            const g = scene.add.rectangle(0, 0, w, h, config.fill ?? 0x000000, config.fillAlpha ?? 1).setOrigin(0, 0);
            phaserObject = g;
        }
        
        // Set the background image in the container
        backgroundContainer.setBackgroundImage(phaserObject as any);
        
        // Apply common properties
        this.applyCommonProperties(phaserObject, config);
        
        // Always stay under everything else
        (phaserObject as any).setDepth(typeof config.z === 'number' ? config.z : 0);
        
        // Setup responsive scaling
        this.setupResponsiveScaling(scene, phaserObject, config);
        
        logDebug('BackgroundFactory', 'Background container created successfully', { 
            backgroundContainer: backgroundContainer,
            phaserObject: phaserObject,
            config: {
                textureKey: config.textureKey,
                fit: config.fit,
                tile: config.tile
            },
            note: "Background now extends Container for child management"
        }, 'create');
        
        return phaserObject;
    }
    
    private setupTextureFitting(scene: Phaser.Scene, img: Phaser.GameObjects.Image, config: any): void {
        const applyFit = () => {
            const cw = scene.scale.width;
            const ch = scene.scale.height;
            const txw = img.texture.getSourceImage().width;
            const txh = img.texture.getSourceImage().height;
            
            // Store original dimensions for bounds calculation
            img.setData('originalWidth', txw);
            img.setData('originalHeight', txh);
            
            const scaleX = cw / txw;
            const scaleY = ch / txh;
            const fit = (config.fit ?? 'contain');
            let s = 1;
            let finalWidth = txw;
            let finalHeight = txh;
            
            if (fit === 'contain') {
                // Scale to fit within screen while maintaining aspect ratio
                s = Math.min(scaleX, scaleY);
                finalWidth = txw * s;
                finalHeight = txh * s;
            } else if (fit === 'cover') {
                // Scale to cover screen while maintaining aspect ratio
                s = Math.max(scaleX, scaleY);
                finalWidth = txw * s;
                finalHeight = txh * s;
            } else {
                // 'stretch' - stretch to exactly match screen dimensions
                finalWidth = cw;
                finalHeight = ch;
            }
            
            if (fit === 'stretch') {
                img.setDisplaySize(cw, ch);
            } else {
                img.setScale(s);
            }
            
            // Center the image
            img.setPosition(cw / 2, ch / 2);
            
            // Store final dimensions for bounds calculation
            img.setData('finalWidth', finalWidth);
            img.setData('finalHeight', finalHeight);
            
            logDebug('BackgroundFactory', 'Background scaling applied', {
                fit: fit,
                originalDimensions: { width: txw, height: txh },
                finalDimensions: { width: finalWidth, height: finalHeight },
                scale: s,
                screenDimensions: { width: cw, height: ch }
            }, 'setupTextureFitting');
        };
        
        applyFit();
        scene.scale.on('resize', applyFit);
    }
    
    private setupResponsiveScaling(scene: Phaser.Scene, obj: Phaser.GameObjects.GameObject, config: any): void {
        // Auto-resize for non-fit and non-image cases
        scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const { width, height } = gameSize;
            if (obj instanceof Phaser.GameObjects.Rectangle) {
                obj.setSize(width, height);
                obj.setDisplaySize(width, height);
            } else if (obj instanceof Phaser.GameObjects.TileSprite) {
                obj.width = width;
                obj.height = height;
            }
        });
    }
}
