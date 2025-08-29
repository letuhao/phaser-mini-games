// apps/game-frontend/src/ui/Button.ts
import Phaser from 'phaser';

export type ButtonShape = 'rectangle' | 'circle';
export type ButtonDisplayMode = 'text' | 'icon' | 'both';

export interface ButtonOpts {
    // Basic properties
    text?: string;
    icon?: string; // texture key for icon
    displayMode?: ButtonDisplayMode;
    width: number;
    height: number;
    shape?: ButtonShape;
    
    // Styling
    backgroundColor?: number;
    borderColor?: number;
    textColor?: string;
    iconColor?: number;
    fontSize?: string;
    fontFamily?: string;
    
    // Background image support
    backgroundImage?: string; // texture key for background image
    backgroundImageScale?: 'fit' | 'fill' | 'stretch'; // how to scale the background image
    backgroundImageOrigin?: { x: number; y: number }; // center position of background image (0-1)
    
    // Effects
    hoverScale?: number;
    clickScale?: number;
    hoverTint?: number;
    clickTint?: number;
    
    // Sound effects
    hoverSound?: string;
    clickSound?: string;
    
    // Behavior
    onClick: () => void | Promise<void>;
    enabled?: boolean;
    
    // Position
    x?: number;
    y?: number;
}

export class UIButton {
    public readonly root: Phaser.GameObjects.Container;
    private opts: ButtonOpts;
    private backgroundGraphics?: Phaser.GameObjects.Graphics;
    private backgroundImage?: Phaser.GameObjects.Image;
    private textObj?: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, opts: ButtonOpts) {
        this.opts = opts;
        
        // Create container at the specified position
        this.root = scene.add.container(opts.x || 0, opts.y || 0);
        
        // Create background (circle or with image)
        console.log('[Button] Constructor - backgroundImage:', opts.backgroundImage);
        console.log('[Button] Constructor - texture exists:', opts.backgroundImage ? scene.textures.exists(opts.backgroundImage) : 'no image');
        
        if (opts.backgroundImage && scene.textures.exists(opts.backgroundImage)) {
            console.log('[Button] Creating background with image');
            this.createBackgroundWithImage(scene);
        } else {
            console.log('[Button] Creating simple circle background');
            this.createSimpleCircle(scene);
        }
        
        // Add text if specified
        if (opts.text) {
            this.createSimpleText(scene);
        }
        
        // Setup interactions with hover and click effects
        this.setupInteractions(scene);
    }
    
    private createSimpleCircle(scene: Phaser.Scene) {
        const { width, height, backgroundColor, borderColor } = this.opts;
        const radius = Math.min(width, height) / 2;
        
        // Create a simple circle using graphics
        const graphics = scene.add.graphics();
        graphics.fillStyle(backgroundColor || 0xffffff, 1);
        graphics.fillCircle(0, 0, radius);
        
        if (borderColor) {
            graphics.lineStyle(2, borderColor, 1);
            graphics.strokeCircle(0, 0, radius);
        }
        
        this.root.add(graphics);
    }
    
    private createSimpleText(scene: Phaser.Scene) {
        const { text, textColor, fontSize, fontFamily } = this.opts;
        
        if (!text) return;
        
        this.textObj = scene.add.text(0, 0, text, {
            fontFamily: fontFamily || 'Arial',
            fontSize: fontSize || '16px',
            color: textColor || '#000000'
        }).setOrigin(0.5);
        
        this.root.add(this.textObj);
    }
    
    private createBackgroundWithImage(scene: Phaser.Scene) {
        const { width, height, backgroundImage, backgroundImageScale, backgroundImageOrigin } = this.opts;
        
        if (!backgroundImage) return;
        
        console.log('[Button] Creating background with image:', backgroundImage);
        console.log('[Button] Texture exists:', scene.textures.exists(backgroundImage));
        
        // Check if texture exists and has valid dimensions
        if (!scene.textures.exists(backgroundImage)) {
            console.warn('[Button] Texture not found:', backgroundImage);
            return;
        }
        
        try {
            // Create background image
            this.backgroundImage = scene.add.image(0, 0, backgroundImage);
            
            // Check if image was created successfully
            if (!this.backgroundImage || !this.backgroundImage.texture) {
                console.error('[Button] Failed to create image for texture:', backgroundImage);
                return;
            }
            
            console.log('[Button] Image created successfully:', {
                texture: backgroundImage,
                width: this.backgroundImage.width,
                height: this.backgroundImage.height,
                displayWidth: this.backgroundImage.displayWidth,
                displayHeight: this.backgroundImage.displayHeight
            });
            
            // Set origin based on config or default to center
            const origin = backgroundImageOrigin || { x: 0.5, y: 0.5 };
            this.backgroundImage.setOrigin(origin.x, origin.y);
            
            // Scale image based on button size and scale mode
            const scaleMode = backgroundImageScale || 'fit';
            if (scaleMode === 'fit') {
                // Scale to fit within button bounds while maintaining aspect ratio
                const imgWidth = this.backgroundImage.width;
                const imgHeight = this.backgroundImage.height;
                const scaleX = width / imgWidth;
                const scaleY = height / imgHeight;
                const scale = Math.min(scaleX, scaleY);
                this.backgroundImage.setScale(scale);
                console.log('[Button] Scaled with fit mode:', { scale, imgWidth, imgHeight, buttonWidth: width, buttonHeight: height });
            } else if (scaleMode === 'fill') {
                // Scale to fill button bounds while maintaining aspect ratio
                const imgWidth = this.backgroundImage.width;
                const imgHeight = this.backgroundImage.height;
                const scaleX = width / imgWidth;
                const scaleY = height / imgHeight;
                const scale = Math.max(scaleX, scaleY);
                this.backgroundImage.setScale(scale);
                console.log('[Button] Scaled with fill mode:', { scale, imgWidth, imgHeight, buttonWidth: width, buttonHeight: height });
            } else if (scaleMode === 'stretch') {
                // Stretch to exactly match button bounds
                this.backgroundImage.setDisplaySize(width, height);
                console.log('[Button] Scaled with stretch mode:', { buttonWidth: width, buttonHeight: height });
            }
            
            this.root.add(this.backgroundImage);
            console.log('[Button] Background image added to button successfully');
            
        } catch (error) {
            console.error('[Button] Error creating background image:', error);
            // Fallback to solid color background
            this.createSimpleCircle(scene);
        }
    }
    
    private setupInteractions(scene: Phaser.Scene) {
        const { width, height, shape, hoverScale, clickScale, hoverTint, clickTint, onClick } = this.opts;
        
        // Set interactive area based on shape
        if (shape === 'circle') {
            this.root.setInteractive(new Phaser.Geom.Circle(0, 0, Math.min(width, height) / 2), Phaser.Geom.Circle.Contains);
        } else {
            this.root.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);
        }
        
        // Hover effects
        this.root.on('pointerover', () => {
            // Scale effect
            if (hoverScale) {
                scene.tweens.add({
                    targets: this.root,
                    scale: hoverScale,
                    duration: 150,
                    ease: 'Power2'
                });
            }
            
            // Tint effect
            if (hoverTint) {
                if (this.backgroundImage) {
                    this.backgroundImage.setTint(hoverTint);
                }
                // Note: Graphics objects don't support tinting, so we skip them
            }
            
            // Play hover sound
            this.playSound(this.opts.hoverSound);
        });
        
        this.root.on('pointerout', () => {
            // Reset scale
            scene.tweens.add({
                targets: this.root,
                scale: 1.0,
                duration: 150,
                ease: 'Power2'
            });
            
            // Reset tint
            if (this.backgroundImage) {
                this.backgroundImage.clearTint();
            }
            // Note: Graphics objects don't support tinting, so we skip them
        });
        
        // Click effects
        this.root.on('pointerdown', () => {
            // Scale down effect
            if (clickScale) {
                scene.tweens.add({
                    targets: this.root,
                    scale: clickScale,
                    duration: 100,
                    ease: 'Power2'
                });
            }
            
            // Tint effect
            if (clickTint) {
                if (this.backgroundImage) {
                    this.backgroundImage.setTint(clickTint);
                }
                // Note: Graphics objects don't support tinting, so we skip them
            }
        });
        
        this.root.on('pointerup', async () => {
            // Scale up effect
            if (hoverScale) {
                scene.tweens.add({
                    targets: this.root,
                    scale: hoverScale,
                    duration: 100,
                    ease: 'Power2'
                });
            } else {
                // Reset to normal scale
                scene.tweens.add({
                    targets: this.root,
                    scale: 1.0,
                    duration: 100,
                    ease: 'Power2'
                });
            }
            
            // Play click sound
            this.playSound(this.opts.clickSound);
            
            // Execute click handler
            try {
                await onClick();
            } catch (error) {
                console.error('Button click error:', error);
            }
        });
    }
    
    private playSound(soundKey?: string) {
        if (!soundKey) return;
        
        try {
            const soundManager = this.root.scene.sound;
            if ('exists' in soundManager && typeof soundManager.exists === 'function') {
                if (soundManager.exists(soundKey)) {
                    soundManager.play(soundKey);
                }
            }
        } catch (error) {
            // Silently skip if sound can't be played
        }
    }
}
