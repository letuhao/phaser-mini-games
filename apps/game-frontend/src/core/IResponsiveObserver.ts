import { IBounds } from '../objects/types';

/**
 * Observer pattern interface for responsive design
 * Objects that need to respond to screen resizes implement this interface
 */
export interface IResponsiveObserver {
    /**
     * Called when the screen resizes or responsive scaling is applied
     */
    onResize(scale: number, bounds: IBounds): void;
    
    /**
     * Get the unique identifier for this observer
     */
    getObserverId(): string;
}

/**
 * Subject interface for the observer pattern
 * ResponsiveManager implements this to notify observers of changes
 */
export interface IResponsiveSubject {
    /**
     * Attach an observer to receive resize notifications
     */
    attach(observer: IResponsiveObserver): void;
    
    /**
     * Detach an observer from resize notifications
     */
    detach(observer: IResponsiveObserver): void;
    
    /**
     * Notify all observers of a resize event
     */
    notify(scale: number, bounds: IBounds): void;
    
    /**
     * Get the current number of attached observers
     */
    getObserverCount(): number;
}

/**
 * Base class for objects that need responsive behavior
 * Implements IResponsiveObserver with common functionality
 */
export abstract class ResponsiveObject implements IResponsiveObserver {
    protected id: string;
    protected scene: Phaser.Scene;
    
    constructor(id: string, scene: Phaser.Scene) {
        this.id = id;
        this.scene = scene;
    }
    
    getObserverId(): string {
        return this.id;
    }
    
    /**
     * Default resize implementation - override in subclasses
     */
    onResize(scale: number, bounds: IBounds): void {
        // Default implementation - subclasses should override
        console.log(`Default resize for ${this.id} with scale ${scale}`);
    }
    
    /**
     * Helper method to calculate scaled dimensions
     */
    protected calculateScaledDimensions(originalWidth: number, originalHeight: number, scale: number): { width: number; height: number } {
        return {
            width: originalWidth * scale,
            height: originalHeight * scale
        };
    }
    
    /**
     * Helper method to calculate scaled position
     */
    protected calculateScaledPosition(originalX: number, originalY: number, scale: number, bounds: IBounds): { x: number; y: number } {
        return {
            x: bounds.x + (originalX * scale),
            y: bounds.y + (originalY * scale)
        };
    }
}
