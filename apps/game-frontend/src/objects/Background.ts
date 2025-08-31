// ============================================================================
// BACKGROUND - Game Object Background with Container Capabilities
// ============================================================================
// This class extends Container to make backgrounds containers
// Provides special background image positioning and container management

import { Container } from './Container';
import { 
    IBackgroundObject, 
    BackgroundObjectConfig,
    IBackgroundBounds,
    IBounds
} from './types';
import { logDebug, logInfo, logWarn, logError } from '../core/Logger';

export class Background extends Container implements IBackgroundObject {
    // Background-specific properties
    public textureKey?: string;
    private backgroundFitMode: 'contain' | 'cover' | 'fill' = 'contain';
    public tile: boolean = false;
    
    // Background image reference
    private backgroundImage: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite | null = null;
    
    // Container bounds (the area where children can be positioned)
    private containerBounds: IBounds | null = null;
    
    constructor(config: BackgroundObjectConfig, scene: Phaser.Scene) {
        // Convert BackgroundObjectConfig to ContainerObjectConfig for parent constructor
        const containerConfig = {
            ...config,
            type: 'container' as const
        };
        super(containerConfig, scene);
        
        // Initialize background-specific properties
        if (config.textureKey) this.textureKey = config.textureKey;
        if (config.fit) this.backgroundFitMode = config.fit;
        if (config.tile !== undefined) this.tile = config.tile;
        
        logDebug('Background', 'Background container initialized', {
            id: this.id,
            name: this.name,
            textureKey: this.textureKey,
            fitMode: this.backgroundFitMode,
            tile: this.tile,
            note: "Background now extends Container for child management"
        }, 'constructor');
    }
    
    // ============================================================================
    // IBackgroundObject Implementation
    // ============================================================================
    
    public setTexture(key: string): void {
        this.textureKey = key;
        if (this.backgroundImage && 'setTexture' in this.backgroundImage) {
            (this.backgroundImage as any).setTexture(key);
            this.updateContainerBounds();
        }
        logDebug('Background', 'Texture updated', { key }, 'setTexture');
    }
    
    public setFitMode(mode: 'contain' | 'cover' | 'fill'): void {
        this.backgroundFitMode = mode;
        this.updateContainerBounds();
        logDebug('Background', 'Fit mode updated', { mode }, 'setFitMode');
    }
    
    public setTile(tile: boolean): void {
        this.tile = tile;
        logDebug('Background', 'Tile mode updated', { tile }, 'setTile');
    }
    
    // ============================================================================
    // BACKGROUND IMAGE MANAGEMENT
    // ============================================================================
    
    /**
     * Set the background image and update container bounds
     */
    public setBackgroundImage(image: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite): void {
        this.backgroundImage = image;
        this.updateContainerBounds();
        
        logDebug('Background', 'Background image set', {
            imageType: image.constructor.name,
            imageBounds: image.getBounds(),
            containerId: this.id
        }, 'setBackgroundImage');
    }
    
    /**
     * Update container bounds based on background image position and size
     * This is crucial for proper child positioning
     */
    private updateContainerBounds(): void {
        if (!this.backgroundImage) {
            logWarn('Background', 'No background image to calculate bounds', {
                containerId: this.id
            }, 'updateContainerBounds');
            return;
        }
        
        const imageBounds = this.backgroundImage.getBounds();
        
        // The container bounds should match the background image bounds
        // This ensures children are positioned relative to the visible background
        this.containerBounds = {
            x: imageBounds.x,
            y: imageBounds.y,
            width: imageBounds.width,
            height: imageBounds.height,
            left: imageBounds.x,
            right: imageBounds.x + imageBounds.width,
            top: imageBounds.y,
            bottom: imageBounds.y + imageBounds.height,
            centerX: imageBounds.x + (imageBounds.width / 2),
            centerY: imageBounds.y + (imageBounds.height / 2)
        };
        
        logDebug('Background', 'Container bounds updated', {
            containerId: this.id,
            imageBounds: imageBounds,
            containerBounds: this.containerBounds,
            note: "Container bounds now match background image bounds"
        }, 'updateContainerBounds');
    }
    
    // ============================================================================
    // BOUNDS MANAGEMENT
    // ============================================================================
    
    /**
     * Get the background image bounds (the actual image dimensions and position)
     */
    public getImageBounds(): IBounds {
        if (!this.backgroundImage) {
            logWarn('Background', 'No background image available', {
                containerId: this.id
            }, 'getImageBounds');
            // Create a complete IBounds object from container bounds
            const containerBounds = this.getBounds();
            return {
                x: containerBounds.x,
                y: containerBounds.y,
                width: containerBounds.width,
                height: containerBounds.height,
                left: containerBounds.x,
                right: containerBounds.x + containerBounds.width,
                top: containerBounds.y,
                bottom: containerBounds.y + containerBounds.height,
                centerX: containerBounds.x + (containerBounds.width / 2),
                centerY: containerBounds.y + (containerBounds.height / 2)
            };
        }
        
        const bounds = this.backgroundImage.getBounds();
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            left: bounds.x,
            right: bounds.x + bounds.width,
            top: bounds.y,
            bottom: bounds.y + bounds.height,
            centerX: bounds.x + (bounds.width / 2),
            centerY: bounds.y + (bounds.height / 2)
        };
    }
    
    /**
     * Get the container bounds (where children can be positioned)
     * This should match the background image bounds for proper child positioning
     */
    public getContainerBounds(): IBounds {
        if (this.containerBounds) {
            return this.containerBounds;
        }
        
        // Fallback to image bounds or container bounds
        return this.getImageBounds();
    }
    
    /**
     * Get the background bounds with detailed information
     * This provides both image and container information
     */
    public getBackgroundBounds(): IBackgroundBounds {
        const imageBounds = this.getImageBounds();
        const containerBounds = this.getContainerBounds();
        
        // Get original dimensions from image data if available
        const originalWidth = this.backgroundImage?.getData('originalWidth') || imageBounds.width;
        const originalHeight = this.backgroundImage?.getData('originalHeight') || imageBounds.height;
        const finalWidth = this.backgroundImage?.getData('finalWidth') || imageBounds.width;
        const finalHeight = this.backgroundImage?.getData('finalHeight') || imageBounds.height;
        
        const bounds: IBackgroundBounds = {
            // Image bounds (actual display)
            x: imageBounds.x,
            y: imageBounds.y,
            width: imageBounds.width,
            height: imageBounds.height,
            left: imageBounds.left,
            right: imageBounds.right,
            top: imageBounds.top,
            bottom: imageBounds.bottom,
            centerX: imageBounds.centerX,
            centerY: imageBounds.centerY,
            
            // Container bounds (where children can be positioned)
            containerLeft: containerBounds.left,
            containerRight: containerBounds.right,
            containerTop: containerBounds.top,
            containerBottom: containerBounds.bottom,
            containerWidth: containerBounds.width,
            containerHeight: containerBounds.height,
            containerCenterX: containerBounds.centerX,
            containerCenterY: containerBounds.centerY,
            
            // Original and final dimensions
            originalWidth: originalWidth,
            originalHeight: originalHeight,
            finalWidth: finalWidth,
            finalHeight: finalHeight,
            
            // Background properties
            fitMode: this.backgroundFitMode,
            tile: this.tile,
            textureKey: this.textureKey
        };
        
        logDebug('Background', 'Getting background bounds', {
            containerId: this.id,
            bounds: bounds,
            note: "Provides both image and container bounds for proper positioning"
        }, 'getBackgroundBounds');
        
        return bounds;
    }
    
    // ============================================================================
    // OVERRIDE CONTAINER METHODS FOR BACKGROUND
    // ============================================================================
    
    /**
     * Override getDockableArea to use background image bounds
     * This ensures children are positioned relative to the visible background
     */
    public override getDockableArea(): IBounds {
        // Use background image bounds for dockable area
        const bounds = this.getImageBounds();
        
        logDebug('Background', 'Getting dockable area (background-specific)', {
            containerId: this.id,
            containerName: this.name,
            bounds: bounds,
            dock: this.dock,
            anchor: this.anchor,
            origin: this.origin,
            note: "Dockable area matches background image bounds"
        }, 'getDockableArea');
        
        return bounds;
    }
    
    /**
     * Override getChildPosition to consider background image bounds
     * This ensures children are positioned correctly within the background
     */
    public override getChildPosition(childWidth: number, childHeight: number, childDock?: string, childAnchor?: string): { x: number; y: number } {
        // Use background image bounds for child positioning
        const bounds = this.getImageBounds();
        const dock = childDock || this.dock;
        const anchor = childAnchor || this.anchor;
        
        let x = bounds.centerX;
        let y = bounds.centerY;
        
        // Apply dock positioning relative to background image
        if (dock) {
            switch (dock) {
                case 'top':
                    y = bounds.top + (childHeight / 2);
                    break;
                case 'bottom':
                    y = bounds.bottom - (childHeight / 2);
                    break;
                case 'left':
                    x = bounds.left + (childWidth / 2);
                    break;
                case 'right':
                    x = bounds.right - (childWidth / 2);
                    break;
                case 'center':
                    // Already set to center
                    break;
            }
        }
        
        // Apply anchor positioning relative to background image
        if (anchor) {
            switch (anchor) {
                case 'top-left':
                    x = bounds.left + (childWidth / 2);
                    y = bounds.top + (childHeight / 2);
                    break;
                case 'top-center':
                    x = bounds.centerX;
                    y = bounds.top + (childHeight / 2);
                    break;
                case 'top-right':
                    x = bounds.right - (childWidth / 2);
                    y = bounds.top + (childHeight / 2);
                    break;
                case 'center-left':
                    x = bounds.left + (childWidth / 2);
                    y = bounds.centerY;
                    break;
                case 'center':
                    x = bounds.centerX;
                    y = bounds.centerY;
                    break;
                case 'center-right':
                    x = bounds.right - (childWidth / 2);
                    y = bounds.centerY;
                    break;
                case 'bottom-left':
                    x = bounds.left + (childWidth / 2);
                    y = bounds.bottom - (childHeight / 2);
                    break;
                case 'bottom-center':
                    x = bounds.centerX;
                    y = bounds.bottom - (childHeight / 2);
                    break;
                case 'bottom-right':
                    x = bounds.right - (childWidth / 2);
                    y = bounds.bottom - (childHeight / 2);
                    break;
            }
        }
        
        logDebug('Background', 'Calculated child position (background-specific)', {
            containerId: this.id,
            childDimensions: { width: childWidth, height: childHeight },
            dock: dock,
            anchor: anchor,
            calculatedPosition: { x, y },
            backgroundBounds: bounds,
            note: "Child positioned relative to background image bounds"
        }, 'getChildPosition');
        
        return { x, y };
    }
}
