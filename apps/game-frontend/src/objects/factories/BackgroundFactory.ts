import Phaser from 'phaser';
import { BaseGameObjectFactory } from './GameObjectFactory';
import { logDebug, logInfo, logError } from '../../core/Logger';

/**
 * Factory for creating background objects
 */
export class BackgroundFactory extends BaseGameObjectFactory {
    readonly supportedTypes = ['background'];
    
    create(scene: Phaser.Scene, config: any): Phaser.GameObjects.GameObject | null {
        logDebug('BackgroundFactory', 'Creating background', { config }, 'create');
        
        const w = scene.scale.width;
        const h = scene.scale.height;
        
        logDebug('BackgroundFactory', 'Screen dimensions', { 
            screenWidth: w, 
            screenHeight: h 
        }, 'create');
        
        let obj: Phaser.GameObjects.GameObject;
        
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
            
            logDebug('BackgroundFactory', 'Texture found, creating background', { 
                textureKey: config.textureKey,
                textureExists: scene.textures.exists(config.textureKey)
            }, 'create');
            
            if (config.tile) {
                const ts = scene.add.tileSprite(0, 0, w, h, config.textureKey).setOrigin(0, 0);
                obj = ts;
            } else {
                const img = scene.add.image(0, 0, config.textureKey).setOrigin(0.5, 0.5);
                this.setupTextureFitting(scene, img, config);
                obj = img;
                
                // Add method to get background bounds
                (obj as any).getBackgroundBounds = () => {
                    const bounds = img.getBounds();
                    const originalWidth = img.getData('originalWidth') || bounds.width;
                    const originalHeight = img.getData('originalHeight') || bounds.height;
                    const finalWidth = img.getData('finalWidth') || bounds.width;
                    const finalHeight = img.getData('finalHeight') || bounds.height;
                    
                    logDebug('BackgroundFactory', 'Getting background bounds', {
                        bounds: bounds,
                        originalDimensions: { width: originalWidth, height: originalHeight },
                        finalDimensions: { width: finalWidth, height: finalHeight }
                    }, 'getBackgroundBounds');
                    
                    return {
                        left: bounds.x,
                        right: bounds.x + bounds.width,
                        top: bounds.y,
                        bottom: bounds.y + bounds.height,
                        width: bounds.width,
                        height: bounds.height,
                        centerX: bounds.x + bounds.width / 2,
                        centerY: bounds.y + bounds.height / 2,
                        // Store original dimensions for scaling calculations
                        originalWidth: originalWidth,
                        originalHeight: originalHeight,
                        finalWidth: finalWidth,
                        finalHeight: finalHeight
                    };
                };
            }
        } else {
            // Solid fill using a full-screen rectangle
            const g = scene.add.rectangle(0, 0, w, h, config.fill ?? 0x000000, config.fillAlpha ?? 1).setOrigin(0, 0);
            obj = g;
        }
        
        // Apply common properties
        this.applyCommonProperties(obj, config);
        
        // Always stay under everything else
        (obj as any).setDepth(typeof config.z === 'number' ? config.z : 0);
        
        // Setup responsive scaling
        this.setupResponsiveScaling(scene, obj, config);
        
        logDebug('BackgroundFactory', 'Background created successfully', { 
            obj,
            config: {
                textureKey: config.textureKey,
                fit: config.fit,
                tile: config.tile
            },
            dimensions: {
                screenWidth: w,
                screenHeight: h,
                originalWidth: config.textureKey ? (obj as any).getData('originalWidth') : 'N/A',
                originalHeight: config.textureKey ? (obj as any).getData('originalHeight') : 'N/A'
            }
        }, 'create');
        return obj;
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
