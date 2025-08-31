// ============================================================================
// BASE GAME OBJECT - Foundation for All Game Objects
// ============================================================================
// This class provides common functionality for all game objects
// Implements core interfaces: IGameObject, IScalable, IPositionable, IVisible, IBounds

import { 
    IGameObject, 
    IScalable, 
    IPositionable, 
    IVisible, 
    IBounds,
    BaseObjectConfig 
} from './types';
import { logDebug, logInfo } from '../core/Logger';

export abstract class BaseGameObject implements IGameObject, IScalable, IPositionable, IVisible {
    // Core properties
    public id: string;
    public type: string;
    public name: string;
    public scene: Phaser.Scene;
    
    // Position properties
    public x: number = 0;
    public y: number = 0;
    
    // Size properties
    public width: number = 0;
    public height: number = 0;
    
    // Scale properties
    public scale: number = 1;
    
    // State properties
    public isActive: boolean = true;
    
    // Visibility properties
    public visible: boolean = true;
    
    // Phaser game object reference
    protected phaserObject: Phaser.GameObjects.GameObject | null = null;
    
    constructor(config: BaseObjectConfig, scene: Phaser.Scene) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.id; // Use id as name
        this.scene = scene;
        
        if (config.x !== undefined) this.x = config.x;
        if (config.y !== undefined) this.y = config.y;
        if (config.width !== undefined) this.width = config.width;
        if (config.height !== undefined) this.height = config.height;
        if (config.visible !== undefined) this.visible = config.visible;
        if (config.scale !== undefined) {
            if (typeof config.scale === 'number') {
                this.scale = config.scale;
            } else {
                this.scale = config.scale.x; // Use x scale as default
            }
        }
    }
    
    // ============================================================================
    // IGameObject Implementation
    // ============================================================================
    
    public destroy(): void {
        if (this.phaserObject) {
            this.phaserObject.destroy();
            this.phaserObject = null;
        }
        
        this.isActive = false;
        this.visible = false;
        
        logDebug('BaseGameObject', 'Object destroyed', { id: this.id, name: this.name }, 'destroy');
    }
    
    // ============================================================================
    // IScalable Implementation
    // ============================================================================
    
    public resize(scale: number, bounds?: IBounds): void {
        this.scale = scale;
        
        if (bounds) {
            this.x = bounds.x;
            this.y = bounds.y;
            this.width = bounds.width;
            this.height = bounds.height;
        }
        
        // Apply scale to Phaser object if available
        if (this.phaserObject && 'setScale' in this.phaserObject) {
            (this.phaserObject as any).setScale(scale);
        }
        
        logDebug('BaseGameObject', 'Object resized', { 
            id: this.id, 
            name: this.name,
            scale, 
            newBounds: bounds 
        }, 'resize');
    }
    
    public setScale(scale: number): void {
        this.resize(scale);
    }
    
    public getScale(): number {
        return this.scale;
    }
    
    // ============================================================================
    // IPositionable Implementation
    // ============================================================================
    
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        
        // Apply position to Phaser object if available
        if (this.phaserObject && 'setPosition' in this.phaserObject) {
            (this.phaserObject as any).setPosition(x, y);
        }
        
        logDebug('BaseGameObject', 'Position set', { id: this.id, name: this.name, x, y }, 'setPosition');
    }
    
    public getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
    
    public setX(x: number): void {
        this.setPosition(x, this.y);
    }
    
    public setY(y: number): void {
        this.setPosition(this.x, y);
    }
    
    // ============================================================================
    // IVisible Implementation
    // ============================================================================
    
    public setVisible(visible: boolean): void {
        this.visible = visible;
        
        // Apply visibility to Phaser object if available
        if (this.phaserObject && 'setVisible' in this.phaserObject) {
            (this.phaserObject as any).setVisible(visible);
        }
        
        logDebug('BaseGameObject', 'Visibility set', { id: this.id, name: this.name, visible }, 'setVisible');
    }
    
    public show(): void {
        this.setVisible(true);
    }
    
    public hide(): void {
        this.setVisible(false);
    }
    
    // ============================================================================
    // IBounds Implementation
    // ============================================================================
    
    public getBounds(): IBounds {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            centerX: this.x + (this.width / 2),
            centerY: this.y + (this.height / 2)
        };
    }
    
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        
        // Apply size to Phaser object if available
        if (this.phaserObject && 'setSize' in this.phaserObject) {
            (this.phaserObject as any).setSize(width, height);
        }
        
        logDebug('BaseGameObject', 'Size set', { 
            id: this.id, 
            name: this.name, 
            width, 
            height 
        }, 'setSize');
    }
    
    // ============================================================================
    // Phaser Integration
    // ============================================================================
    
    public setPhaserObject(phaserObject: Phaser.GameObjects.GameObject): void {
        this.phaserObject = phaserObject;
        logDebug('BaseGameObject', 'Phaser object assigned', {
            id: this.id,
            name: this.name,
            phaserType: phaserObject.type
        }, 'setPhaserObject');
    }
    
    public getPhaserObject(): Phaser.GameObjects.GameObject | null {
        return this.phaserObject;
    }
    
    // ============================================================================
    // State Management
    // ============================================================================
    
    public setActive(active: boolean): void {
        this.isActive = active;
        
        // Apply active state to Phaser object if available
        if (this.phaserObject && 'setActive' in this.phaserObject) {
            (this.phaserObject as any).setActive(active);
        }
        
        logDebug('BaseGameObject', 'Active state set', { 
            id: this.id, 
            name: this.name, 
            active 
        }, 'setActive');
    }
    
    // ============================================================================
    // Utility Methods
    // ============================================================================
    
    public isVisible(): boolean {
        return this.visible;
    }
    
    public intersects(other: IBounds): boolean {
        return !(this.x + this.width < other.x || 
                other.x + other.width < this.x || 
                this.y + this.height < other.y || 
                other.y + other.height < this.y);
    }
    
    public containsPoint(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    // ============================================================================
    // Abstract Methods (to be implemented by subclasses)
    // ============================================================================
    
    public abstract create(scene: Phaser.Scene): Phaser.GameObjects.GameObject;
    public abstract update(time: number, delta: number): void;
}
