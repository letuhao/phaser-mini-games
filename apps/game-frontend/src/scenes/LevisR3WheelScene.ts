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

        // Load classic social media icons
        this.load.svg('facebook-icon', 'assets/icons/facebook-classic-icon.svg');
        this.load.svg('instagram-icon', 'assets/icons/instagram-classic-icon.svg');
        this.load.svg('youtube-icon', 'assets/icons/youtube-classic-icon.svg');
        this.load.svg('zalo-icon', 'assets/icons/zalo-classic-icon.svg');
        this.load.svg('tiktok-icon', 'assets/icons/tiktok-classic-icon.svg');
    }

    create() {
        console.log('[Scene] Starting scene creation...');
        
        // 1) Make sure textures referenced by object config exist
        ensureBasicTextures(this);

        // 2) Build scene graph using ObjectLoader + config
        console.log('[Scene] Loading objects from config...');
        this.objects = loadObjects(this, LevisR3Objects);
        console.log('[Scene] Objects loaded:', Object.keys(this.objects));
        console.log('[Scene] Footer object:', this.objects['footer']);
        
        // 3) Hook responsive manager
        this.responsive = new ResponsiveManager(this, this.objects, LevisR3Responsive);
        const onResize = () => this.responsive.apply();
        this.scale.on('resize', onResize);
        onResize();

        // 4) Position footer at the bottom of background image
        this.positionFooter();
        
        // 5) Ensure footer text quality
        this.ensureFooterTextQuality();
        
        console.log('[Scene] Scene creation completed');
    }

    private positionFooter() {
        console.log('[Scene] Positioning footer...');
        const background = this.objects['bg'] as any;
        const footer = this.objects['footer'] as Phaser.GameObjects.Container;
        
        console.log('[Scene] Background object:', background);
        console.log('[Scene] Footer object:', footer);
        console.log('[Scene] Background has getBackgroundBounds:', !!background?.getBackgroundBounds);
        
        if (!background?.getBackgroundBounds || !footer) {
            console.warn('[Scene] Cannot position footer - missing background bounds or footer');
            return;
        }
        
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
