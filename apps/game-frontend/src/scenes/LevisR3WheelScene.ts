import { loadObjects } from '../objects/ObjectLoader';
import { LevisR3Objects } from '../config/objects.levisR3';
import { LevisR3Responsive } from '../config/responsive.levisR3';
import { ResponsiveManager } from '../core/ResponsiveManager';
import { ensureBasicTextures } from '../util/ensureBasicTextures';
import { logInfo, logDebug, logError, logWarn } from '../core/Logger';

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
        logInfo('LevisR3WheelScene', 'Starting scene creation', undefined, 'create');
        
        // 1) Make sure textures referenced by object config exist
        ensureBasicTextures(this);

        // 2) Build scene graph using ObjectLoader + config
        logDebug('LevisR3WheelScene', 'Loading objects from config', undefined, 'create');
        this.objects = loadObjects(this, LevisR3Objects);
        logInfo('LevisR3WheelScene', 'Objects loaded', { 
            objectKeys: Object.keys(this.objects),
            objectCount: Object.keys(this.objects).length
        }, 'create');
        logDebug('LevisR3WheelScene', 'Key objects loaded', {
            footer: !!this.objects['footer'],
            effectsContainer: !!this.objects['effects-container'],
            embersEffect: !!this.objects['embers-effect']
        }, 'create');
        
        // 3) Hook responsive manager
        this.responsive = new ResponsiveManager(this, this.objects, LevisR3Responsive);
        const onResize = () => this.responsive.apply();
        this.scale.on('resize', onResize);
        onResize();

        // 4) Position footer at the bottom of background image
        this.positionFooter();
        
        // 5) Position and size effects container based on background image
        this.positionEffectsContainer();
        
        // 6) Ensure footer text quality
        this.ensureFooterTextQuality();
        
        logInfo('LevisR3WheelScene', 'Scene creation completed', undefined, 'create');
    }

    private positionFooter() {
        logDebug('LevisR3WheelScene', 'Positioning footer', undefined, 'positionFooter');
        const background = this.objects['bg'] as any;
        const footer = this.objects['footer'] as Phaser.GameObjects.Container;
        
        logDebug('LevisR3WheelScene', 'Footer positioning objects', {
            background: !!background,
            footer: !!footer,
            hasGetBackgroundBounds: !!background?.getBackgroundBounds
        }, 'positionFooter');
        
        if (!background?.getBackgroundBounds || !footer) {
            logWarn('LevisR3WheelScene', 'Cannot position footer - missing background bounds or footer', undefined, 'positionFooter');
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
                logDebug('LevisR3WheelScene', 'Footer scaling applied', {
                    backgroundWidth: bgBounds.width,
                    backgroundHeight: bgBounds.height,
                    footerScale: scaleX,
                    footerWidth: footerConfig.baseWidth * scaleX,
                    footerHeight: footerConfig.baseHeight * scaleX,
                    textSize: footerConfig.textSize * scaleX,
                    uniformScale: scaleX === scaleY ? '✅' : '❌'
                }, 'positionFooter');
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

    private positionEffectsContainer() {
        logDebug('LevisR3WheelScene', 'Positioning effects container', undefined, 'positionEffectsContainer');
        const background = this.objects['bg'] as any;
        const effectsContainer = this.objects['effects-container'] as Phaser.GameObjects.Container;
        
        logDebug('LevisR3WheelScene', 'Effects container positioning objects', {
            background: !!background,
            effectsContainer: !!effectsContainer,
            hasGetBackgroundBounds: !!background?.getBackgroundBounds
        }, 'positionEffectsContainer');
        
        if (!background?.getBackgroundBounds || !effectsContainer) {
            logWarn('LevisR3WheelScene', 'Cannot position effects container - missing background bounds or effects container', undefined, 'positionEffectsContainer');
            return;
        }
        
        const updateEffectsContainerPosition = () => {
            const bgBounds = background.getBackgroundBounds();
            if (!bgBounds) return;
            
            // FOLLOW THE SAME LOGIC AS FOOTER: Use scaled background bounds
            // Position effects container at the SAME position as the background image
            effectsContainer.setPosition(bgBounds.left, bgBounds.top);
            
            // Apply the SAME scaling as the background to maintain proportions
            // Calculate scale factor based on background width ratio
            const scaleX = bgBounds.width / 2560;  // 2560 is original background width
            const scaleY = bgBounds.height / 1440; // 1440 is original background height
            
            // Apply uniform scaling to prevent distortion
            effectsContainer.setScale(scaleX, scaleX); // Use scaleX for both to maintain aspect ratio
            
            // Update embers effect with container bounds if it exists
            const embersEffect = this.objects['embers-effect'] as any;
            logDebug('LevisR3WheelScene', 'Looking for embers effect', {
                embersEffect: !!embersEffect,
                hasEmbers: !!(embersEffect && embersEffect.__embers),
                hasUpdateMethod: !!(embersEffect && embersEffect.__embers && embersEffect.__embers.updateContainerBounds)
            }, 'positionEffectsContainer');
            
            if (embersEffect && embersEffect.__embers && embersEffect.__embers.updateContainerBounds) {
                logDebug('LevisR3WheelScene', 'Updating embers container bounds', {
                    left: bgBounds.left,
                    top: bgBounds.top,
                    width: bgBounds.width,
                    height: bgBounds.height
                }, 'positionEffectsContainer');
                embersEffect.__embers.updateContainerBounds({
                    left: bgBounds.left,        // Use scaled background bounds (same as container)
                    top: bgBounds.top,          // Use scaled background bounds (same as container)
                    width: bgBounds.width,      // Use scaled background width
                    height: bgBounds.height     // Use scaled background height
                });
            } else {
                logWarn('LevisR3WheelScene', 'Cannot update embers bounds - missing effect or method', undefined, 'positionEffectsContainer');
            }
            
            logDebug('LevisR3WheelScene', 'Effects container positioned', {
                screenSize: { width: this.scale.width, height: this.scale.height },
                scaledBackgroundBounds: { left: bgBounds.left, top: bgBounds.top, width: bgBounds.width, height: bgBounds.height },
                calculatedScale: { x: scaleX, y: scaleX },
                actualContainerPosition: { x: effectsContainer.x, y: effectsContainer.y },
                actualContainerScale: effectsContainer.scale
            }, 'positionEffectsContainer');
        };
        
        // Initial positioning
        updateEffectsContainerPosition();
        
        // Update on resize
        this.scale.on('resize', updateEffectsContainerPosition);
    }


    private ensureFooterTextQuality() {
        const footer = this.objects['footer'] as Phaser.GameObjects.Container;
        const footerText = this.objects['footer-text'] as Phaser.GameObjects.Text;
        
        if (!footer || !footerText) return;
        
        // Ensure text maintains quality by preventing additional scaling
        footerText.setScale(1, 1); // Reset any individual text scaling
        
        // Force text to re-render with quality settings
        footerText.updateText();
        
        logDebug('LevisR3WheelScene', 'Footer text quality ensured', {
            textScale: footerText.scale,
            containerScale: footer.scale,
            textBounds: footerText.getBounds()
        }, 'ensureFooterTextQuality');
    }
}
