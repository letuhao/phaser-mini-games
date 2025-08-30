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

export abstract class BaseGameObject implements IGameObject, IScalable, IPositionable, IVisible, IBounds {
    // Core properties
    public readonly id: string;
    public readonly type: string;
    public readonly name: string;
    
    // Scene reference (required by IGameObject)
    public scene: Phaser.Scene;
    
    // Phaser game object reference
    protected phaserObject: Phaser.GameObjects.GameObject | null = null;
    
    // State tracking
    protected isActive: boolean = true;
    protected isScalable: boolean = true;
    
    // Position and size (public as required by interfaces)
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;
    protected scale: number = 1;
    
    // Visible property (required by IVisible interface)
    public visible: boolean = true;
    
    // Configuration
    protected config: BaseObjectConfig;
    
    constructor(config: BaseObjectConfig, scene: Phaser.Scene) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.id; // Use id as name since config.name doesn't exist
        this.scene = scene;
        this.config = config;
        
        // Initialize position and size from config
        if (config.x !== undefined) this.x = config.x;
        if (config.y !== undefined) this.y = config.y;
        if (config.width !== undefined) this.width = config.width;
        if (config.height !== undefined) this.height = config.height;
        
        if (config.scale !== undefined) {
            if (typeof config.scale === 'number') {
                this.scale = config.scale;
            } else {
                this.scale = config.scale.x; // Use x scale as default
            }
        }
        
        logDebug('BaseGameObject', `Created ${this.type} object: ${this.name}`, {
            id: this.id,
            type: this.type,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            scale: this.scale
        }, 'constructor');
    }
    
    // ============================================================================
    // IGameObject Implementation
    // ============================================================================
    
    public getId(): string {
        return this.id;
    }
    
    public getType(): string {
        return this.type;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public getConfig(): BaseObjectConfig {
        return this.config;
    }
    
    public isObjectActive(): boolean {
        return this.isActive;
    }
    
    public setObjectActive(active: boolean): void {
        this.isActive = active;
        if (this.phaserObject) {
            this.phaserObject.setActive(active);
        }
        logDebug('BaseGameObject', `Set object active: ${active}`, {
            id: this.id,
            name: this.name,
            active
        }, 'setObjectActive');
    }
    
    // ============================================================================
    // IScalable Implementation
    // ============================================================================
    
    public resize(scale: number, bounds?: { x: number; y: number; width: number; height: number }): void {
        if (!this.isScalable) {
            logDebug('BaseGameObject', 'Object is not scalable, skipping resize', {
                id: this.id,
                name: this.name,
                scale
            }, 'resize');
            return;
        }
        
        const oldScale = this.scale;
        this.scale = scale;
        
        // Apply scale to Phaser object if available
        if (this.phaserObject && 'setScale' in this.phaserObject) {
            (this.phaserObject as any).setScale(scale);
        }
        
        // Update size if bounds provided
        if (bounds) {
            this.width = bounds.width;
            this.height = bounds.height;
        }
        
        logDebug('BaseGameObject', 'Object resized', {
            id: this.id,
            name: this.name,
            oldScale,
            newScale: this.scale,
            size: { width: this.width, height: this.height }
        }, 'resize');
    }
    
    public getScale(): number {
        return this.scale;
    }
    
    public setScale(scale: number): void {
        this.resize(scale);
    }
    
    public isScalableObject(): boolean {
        return this.isScalable;
    }
    
    public setScalable(scalable: boolean): void {
        this.isScalable = scalable;
        logDebug('BaseGameObject', `Set scalable: ${scalable}`, {
            id: this.id,
            name: this.name,
            scalable
        }, 'setScalable');
    }
    
    // ============================================================================
    // IPositionable Implementation
    // ============================================================================
    
    public getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
    
    public setPosition(x: number, y: number): void {
        const oldPosition = { x: this.x, y: this.y };
        this.x = x;
        this.y = y;
        
        // Apply position to Phaser object if available
        if (this.phaserObject && 'setPosition' in this.phaserObject) {
            (this.phaserObject as any).setPosition(x, y);
        }
        
        logDebug('BaseGameObject', 'Position updated', {
            id: this.id,
            name: this.name,
            oldPosition,
            newPosition: { x, y }
        }, 'setPosition');
    }
    
    public getX(): number {
        return this.x;
    }
    
    public getY(): number {
        return this.y;
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
    
    public isObjectVisible(): boolean {
        return this.visible;
    }
    
    public setObjectVisible(visible: boolean): void {
        this.visible = visible;
        if (this.phaserObject && 'setVisible' in this.phaserObject) {
            (this.phaserObject as any).setVisible(visible);
        }
        logDebug('BaseGameObject', `Set object visible: ${visible}`, {
            id: this.id,
            name: this.name,
            visible
        }, 'setObjectVisible');
    }
    
    public setVisible(visible: boolean): void {
        this.visible = visible;
        if (this.phaserObject && 'setVisible' in this.phaserObject) {
            (this.phaserObject as any).setVisible(visible);
        }
        logDebug('BaseGameObject', `Set object visible: ${visible}`, {
            id: this.id,
            name: this.name,
            visible
        }, 'setVisible');
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
    
    public getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    public getWidth(): number {
        return this.width;
    }
    
    public getHeight(): number {
        return this.height;
    }
    
    public setSize(width: number, height: number): void {
        const oldSize = { width: this.width, height: this.height };
        this.width = width;
        this.height = height;
        
        // Apply size to Phaser object if available
        if (this.phaserObject && 'setSize' in this.phaserObject) {
            (this.phaserObject as any).setSize(width, height);
        }
        
        logDebug('BaseGameObject', 'Size updated', {
            id: this.id,
            name: this.name,
            oldSize,
            newSize: { width, height }
        }, 'setSize');
    }
    
    public containsPoint(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    public intersects(other: IBounds): boolean {
        return !(this.x + this.width < other.x ||
                other.x + other.width < this.x ||
                this.y + this.height < other.y ||
                other.y + other.height < this.y);
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
    // Utility Methods
    // ============================================================================
    
    public destroy(): void {
        if (this.phaserObject) {
            this.phaserObject.destroy();
            this.phaserObject = null;
        }
        
        this.isActive = false;
        this.visible = false;
        
        logInfo('BaseGameObject', 'Object destroyed', {
            id: this.id,
            name: this.name
        }, 'destroy');
    }
    
    public getStatus(): {
        id: string;
        name: string;
        type: string;
        isActive: boolean;
        isVisible: boolean;
        isScalable: boolean;
        position: { x: number; y: number };
        size: { width: number; height: number };
        scale: number;
        hasPhaserObject: boolean;
    } {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            isActive: this.isActive,
            isVisible: this.visible,
            isScalable: this.isScalable,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            scale: this.scale,
            hasPhaserObject: this.phaserObject !== null
        };
    }
    
    // ============================================================================
    // Abstract Methods (to be implemented by subclasses)
    // ============================================================================
    
    public abstract create(scene: Phaser.Scene): Phaser.GameObjects.GameObject;
    public abstract update(time: number, delta: number): void;
}
