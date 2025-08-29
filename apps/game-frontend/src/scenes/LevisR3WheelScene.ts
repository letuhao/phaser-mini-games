import { loadObjects } from '../objects/ObjectLoader';
import { LevisR3Objects } from '../config/objects.levisR3';
import { LevisR3Responsive } from '../config/responsive.levisR3';
import { ResponsiveManager } from '../core/ResponsiveManager';
import { ensureBasicTextures } from '../util/ensureBasicTextures';

export class LevisR3WheelScene extends Phaser.Scene {
    private objects!: Record<string, Phaser.GameObjects.GameObject>;
    private responsive!: ResponsiveManager;

    constructor() { super('LevisR3Wheel'); }

    preload() {
        // Load background image
        this.load.image('bg-16x9', 'assets/backgrounds/levisR3_BG.png');
    }

    create() {
        // 1) Make sure textures referenced by object config exist
        ensureBasicTextures(this);

        // 2) Build scene graph using ObjectLoader + config
        this.objects = loadObjects(this, LevisR3Objects);

        // 3) Hook responsive manager
        this.responsive = new ResponsiveManager(this, this.objects, LevisR3Responsive);
        const onResize = () => this.responsive.apply();
        this.scale.on('resize', onResize);
        onResize();

        // 4) Position footer at the bottom of background image
        this.positionFooter();
        
        // 5) Ensure footer text quality
        this.ensureFooterTextQuality();
    }

    private positionFooter() {
        const background = this.objects['bg'] as any;
        const footer = this.objects['footer'] as Phaser.GameObjects.Container;
        
        if (!background?.getBackgroundBounds || !footer) return;
        
        const updateFooterPosition = () => {
            const bgBounds = background.getBackgroundBounds();
            if (!bgBounds) return;
            
            // Position footer at bottom left of background image
            footer.setPosition(bgBounds.left, bgBounds.bottom);
            
            // Auto-scale footer based on background width and AppConfig settings
            const { footer: footerConfig } = (window as any).AppConfig || {};
            if (footerConfig?.autoScale) {
                const scaleX = bgBounds.width / footerConfig.baseWidth;
                const scaleY = scaleX; // Use uniform scaling to prevent text distortion
                footer.setScale(scaleX, scaleY);
                
                // Log current dimensions for debugging
                console.log('Footer scaling:', {
                    backgroundWidth: bgBounds.width,
                    backgroundHeight: bgBounds.height,
                    footerScale: scaleX,
                    footerWidth: footerConfig.baseWidth * scaleX,
                    footerHeight: footerConfig.baseHeight * scaleX,
                    textSize: footerConfig.textSize * scaleX,
                    uniformScale: scaleX === scaleY ? '✅' : '❌'
                });
            } else {
                // Fallback to manual scaling
                const scaleX = bgBounds.width / 2560;
                footer.setScale(scaleX, scaleX); // Uniform scaling
            }
        };
        
        // Initial positioning
        updateFooterPosition();
        
        // Update on resize
        this.scale.on('resize', updateFooterPosition);
    }

    private ensureFooterTextQuality() {
        const footer = this.objects['footer'] as Phaser.GameObjects.Container;
        const footerText = this.objects['footer-text'] as Phaser.GameObjects.Text;
        
        if (!footer || !footerText) return;
        
        // Ensure text maintains quality by preventing additional scaling
        footerText.setScale(1, 1); // Reset any individual text scaling
        
        // Force text to re-render with quality settings
        footerText.updateText();
        
        console.log('Footer text quality ensured:', {
            textScale: footerText.scale,
            containerScale: footer.scale,
            textBounds: footerText.getBounds()
        });
    }
}
