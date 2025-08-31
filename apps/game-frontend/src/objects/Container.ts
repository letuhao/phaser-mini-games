// ============================================================================
// CONTAINER - Game Object Container with Children Management
// ============================================================================
// This class implements IContainer interface for managing child objects
// Provides hierarchical structure and responsive behavior

import { BaseGameObject } from './BaseGameObject';
import { 
    IContainer, 
    ContainerObjectConfig,
    IGameObject,
    IScalable,
    IBounds
} from './types';
import { logDebug, logInfo } from '../core/Logger';

export class Container extends BaseGameObject implements IContainer {
    // Container-specific properties
    public children: IGameObject[] = [];
    public dock: 'top' | 'bottom' | 'left' | 'right' | 'center' | null = null;
    public anchor: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null = null;
    private followBackground: boolean = false;
    public origin: { x: number; y: number } = { x: 0.5, y: 0.5 };
    
    // Container name
    public name: string;
    
    // Phaser container reference
    private phaserContainer: Phaser.GameObjects.Container | null = null;
    
    // Scene reference (required by IGameObject)
    public scene: Phaser.Scene;
    
    // Visible property (required by IVisible interface)
    public visible: boolean = true;
    
    constructor(config: ContainerObjectConfig, scene: Phaser.Scene) {
        super(config, scene);
        this.scene = scene;
        this.name = config.id; // Use id as name
        
        // Initialize container-specific properties
        if (config.dock) this.dock = config.dock;
        if (config.anchor) this.anchor = config.anchor;
        if (config.followBackground !== undefined) this.followBackground = config.followBackground;
        if (config.origin) this.origin = config.origin;
        
        logDebug('Container', `Container initialized with ${config.children?.length || 0} children`, {
            id: this.id,
            name: this.name,
            dock: this.dock,
            anchor: this.anchor,
            followBackground: this.followBackground,
            origin: this.origin
        }, 'constructor');
    }
    
    // ============================================================================
    // IContainer Implementation
    // ============================================================================
    
    public getChildren(): IGameObject[] {
        return [...this.children];
    }
    
    public addChild(child: IGameObject): void {
        if (!this.children.find(c => c.id === child.id)) {
            this.children.push(child);
            
            // Add to Phaser container if available
            if (this.phaserContainer && 'getPhaserObject' in child) {
                const phaserObj = (child as BaseGameObject).getPhaserObject();
                if (phaserObj) {
                    this.phaserContainer.add(phaserObj);
                }
            }
            
            logDebug('Container', 'Child added to container', {
                containerId: this.id,
                containerName: this.name,
                childId: child.id,
                childName: 'name' in child ? (child as BaseGameObject).name : 'unknown',
                totalChildren: this.children.length
            }, 'addChild');
        }
    }
    
    public removeChild(child: IGameObject): void {
        const index = this.children.findIndex(c => c.id === child.id);
        if (index !== -1) {
            // Remove from Phaser container if available
            if (this.phaserContainer && 'getPhaserObject' in child) {
                const phaserObj = (child as BaseGameObject).getPhaserObject();
                if (phaserObj) {
                    this.phaserContainer.remove(phaserObj);
                }
            }
            
            this.children.splice(index, 1);
            
            logDebug('Container', 'Child removed from container', {
                containerId: this.id,
                containerName: this.name,
                childId: child.id,
                totalChildren: this.children.length
            }, 'removeChild');
        }
    }
    
    public getChildAt(index: number): IGameObject | null {
        return this.children[index] || null;
    }
    
    public getChild(childId: string): IGameObject | null {
        return this.children.find(c => c.id === childId) || null;
    }
    
    public hasChild(childId: string): boolean {
        return this.children.some(c => c.id === childId);
    }
    
    public clearChildren(): void {
        // Remove all children from Phaser container
        if (this.phaserContainer) {
            this.children.forEach(child => {
                if ('getPhaserObject' in child) {
                    const phaserObj = (child as BaseGameObject).getPhaserObject();
                    if (phaserObj) {
                        this.phaserContainer!.remove(phaserObj);
                    }
                }
            });
        }
        
        const childCount = this.children.length;
        this.children = [];
        
        logDebug('Container', 'All children cleared from container', {
            containerId: this.id,
            containerName: this.name,
            removedCount: childCount
        }, 'clearChildren');
    }
    
    public getChildCount(): number {
        return this.children.length;
    }
    
    // ============================================================================
    // IVisible Implementation
    // ============================================================================
    
    public setVisible(visible: boolean): void {
        this.visible = visible;
        if (this.phaserContainer) {
            this.phaserContainer.setVisible(visible);
        }
        logDebug('Container', `Set container visible: ${visible}`, {
            id: this.id,
            name: this.name,
            visible
        }, 'setVisible');
    }
    
    // ============================================================================
    // Container-Specific Properties
    // ============================================================================
    
    public getDock(): 'top' | 'bottom' | 'left' | 'right' | 'center' | null {
        return this.dock;
    }
    
    public setDock(dock: 'top' | 'bottom' | 'left' | 'right' | 'center' | null): void {
        this.dock = dock;
        logDebug('Container', 'Dock position updated', {
            id: this.id,
            name: this.name,
            dock
        }, 'setDock');
    }
    
    public getAnchor(): 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null {
        return this.anchor;
    }
    
    public setAnchor(anchor: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null): void {
        this.anchor = anchor;
        logDebug('Container', 'Anchor position updated', {
            id: this.id,
            name: this.name,
            anchor
        }, 'setAnchor');
    }
    
    public getFollowBackground(): boolean {
        return this.followBackground;
    }
    
    public setFollowBackground(follow: boolean): void {
        this.followBackground = follow;
        logDebug('Container', 'Follow background setting updated', {
            id: this.id,
            name: this.name,
            follow
        }, 'setFollowBackground');
    }
    
    public getOrigin(): { x: number; y: number } {
        return { ...this.origin };
    }
    
    public setOrigin(x: number, y: number): void {
        this.origin = { x, y };
        // Note: In Phaser 3.9, Container origin cannot be changed after creation
        // The origin values are used in positioning calculations instead
        logDebug('Container', 'Origin updated (stored for positioning calculations)', {
            id: this.id,
            name: this.name,
            origin: { x, y },
            note: "Origin affects positioning calculations, not Phaser Container properties"
        }, 'setOrigin');
    }
    
    // ============================================================================
    // Enhanced Resize for Container Hierarchy
    // ============================================================================
    
    /**
     * Resize the container and all its children
     */
    public resize(scale: number, bounds?: IBounds): void {
        super.resize(scale, bounds);
        
        // Resize all children
        for (const child of this.children) {
            if (child && 'resize' in child) {
                (child as IScalable).resize(scale, bounds);
            }
        }
        
        logDebug('Container', 'Container and children resized', {
            containerId: this.id,
            containerName: this.name,
            scale,
            bounds,
            childrenCount: this.children.length
        }, 'resize');
    }
    
    // ============================================================================
    // Container Positioning Logic
    // ============================================================================
    
    public calculatePosition(screenBounds: { x: number; y: number; width: number; height: number }, backgroundBounds?: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
        let targetBounds = screenBounds;
        
        // Use background bounds if following background
        if (this.followBackground && backgroundBounds) {
            targetBounds = backgroundBounds;
        }
        
        let x = this.x;
        let y = this.y;
        
        // Apply dock positioning
        if (this.dock) {
            switch (this.dock) {
                case 'top':
                    y = targetBounds.y;
                    break;
                case 'bottom':
                    y = targetBounds.y + targetBounds.height - this.width;
                    break;
                case 'left':
                    x = targetBounds.x;
                    break;
                case 'right':
                    x = targetBounds.x + targetBounds.width - this.width;
                    break;
                case 'center':
                    x = targetBounds.x + (targetBounds.width - this.width) / 2;
                    y = targetBounds.y + (targetBounds.height - this.height) / 2;
                    break;
            }
        }
        
        // Apply anchor positioning
        if (this.anchor) {
            const [vertical, horizontal] = this.anchor.split('-');
            
            if (horizontal === 'left') {
                x = targetBounds.x;
            } else if (horizontal === 'center') {
                x = targetBounds.x + (targetBounds.width - this.width) / 2;
            } else if (horizontal === 'right') {
                x = targetBounds.x + targetBounds.width - this.width;
            }
            
            if (vertical === 'top') {
                y = targetBounds.y;
            } else if (vertical === 'center') {
                y = targetBounds.y + (targetBounds.height - this.height) / 2;
            } else if (vertical === 'bottom') {
                y = targetBounds.y + targetBounds.height - this.height;
            }
        }
        
        logDebug('Container', 'Position calculated', {
            id: this.id,
            name: this.name,
            dock: this.dock,
            anchor: this.anchor,
            followBackground: this.followBackground,
            originalPosition: { x: this.x, y: this.y },
            calculatedPosition: { x, y },
            targetBounds
        }, 'calculatePosition');
        
        return { x, y };
    }
    
    // ============================================================================
    // Phaser Integration
    // ============================================================================
    
    public override create(scene: Phaser.Scene): Phaser.GameObjects.Container {
        // Create Phaser container
        this.phaserContainer = scene.add.container(this.x, this.y);
        
        // In Phaser 3.9, Container origin is set during creation
        // We need to adjust the position to account for the origin
        if (this.origin.x !== 0.5 || this.origin.y !== 0.5) {
            const offsetX = (0.5 - this.origin.x) * this.width;
            const offsetY = (0.5 - this.origin.y) * this.height;
            this.phaserContainer.setPosition(this.x + offsetX, this.y + offsetY);
        }
        
        // Set size
        if (this.width > 0 && this.height > 0) {
            this.phaserContainer.setSize(this.width, this.height);
        }
        
        // Set scale
        this.phaserContainer.setScale(this.scale);
        
        // Set visibility
        this.phaserContainer.setVisible(this.visible);
        
        // Set active state
        this.phaserContainer.setActive(this.isActive);
        
        // Assign to base class
        this.setPhaserObject(this.phaserContainer);
        
        logInfo('Container', 'Phaser container created', {
            id: this.id,
            name: this.name,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            scale: this.scale,
            origin: this.origin,
            note: "Origin applied through position adjustment in Phaser 3.9"
        }, 'create');
        
        return this.phaserContainer;
    }
    
    public override update(time: number, delta: number): void {
        // Update all children
        this.children.forEach(child => {
            if ('update' in child) {
                (child as BaseGameObject).update(time, delta);
            }
        });
    }
    
    // ============================================================================
    // Container-Specific Methods
    // ============================================================================
    
    public getPhaserContainer(): Phaser.GameObjects.Container | null {
        return this.phaserContainer;
    }
    
    public setContainerSize(width: number, height: number): void {
        this.setSize(width, height);
        if (this.phaserContainer) {
            this.phaserContainer.setSize(width, height);
        }
    }
    
    public getContainerStatus(): {
        id: string;
        name: string;
        childCount: number;
        dock: string | null;
        anchor: string | null;
        followBackground: boolean;
        origin: { x: number; y: number };
        bounds: { x: number; y: number; width: number; height: number };
        scale: number;
        isActive: boolean;
        isVisible: boolean;
        hasPhaserContainer: boolean;
    } {
        return {
            id: this.id,
            name: this.name,
            childCount: this.children.length,
            dock: this.dock,
            anchor: this.anchor,
            followBackground: this.followBackground,
            origin: this.origin,
            bounds: this.getBounds(),
            scale: this.scale,
            isActive: this.isActive,
            isVisible: this.visible,
            hasPhaserContainer: this.phaserContainer !== null
        };
    }
    
    // ============================================================================
    // DOCKABLE AREA MANAGEMENT
    // ============================================================================
    
    /**
     * Check if this container has a dockable area
     * Dockable area = container's position + size + origin
     */
    public hasDockableArea(): boolean {
        return this.dock !== null || this.anchor !== null;
    }
    
    /**
     * Get the dockable area bounds of this container
     * This represents the area where children can be positioned
     */
    public getDockableArea(): IBounds {
        const bounds = this.getBounds();
        
        logDebug('Container', 'Getting dockable area', {
            containerId: this.id,
            containerName: this.name,
            bounds: bounds,
            dock: this.dock,
            anchor: this.anchor,
            origin: this.origin
        }, 'getDockableArea');
        
        return bounds;
    }
    
    /**
     * Get the dockable area with padding/margin
     * Useful for positioning children with some spacing from container edges
     */
    public getDockableAreaWithMargin(margin: number = 0): IBounds {
        const bounds = this.getDockableArea();
        
        return {
            x: bounds.x + margin,
            y: bounds.y + margin,
            width: bounds.width - (margin * 2),
            height: bounds.height - (margin * 2),
            left: bounds.left + margin,
            right: bounds.right - margin,
            top: bounds.top + margin,
            bottom: bounds.bottom - margin,
            centerX: bounds.centerX,
            centerY: bounds.centerY
        };
    }
    
    /**
     * Check if a point is within the dockable area
     */
    public isPointInDockableArea(x: number, y: number): boolean {
        const bounds = this.getDockableArea();
        
        return x >= bounds.left && 
               x <= bounds.right && 
               y >= bounds.top && 
               y <= bounds.bottom;
    }
    
    /**
     * Get the recommended position for a child based on dock/anchor
     * This helps position children within the container's dockable area
     */
    public getChildPosition(childWidth: number, childHeight: number, childDock?: string, childAnchor?: string): { x: number; y: number } {
        const bounds = this.getDockableArea();
        const dock = childDock || this.dock;
        const anchor = childAnchor || this.anchor;
        
        let x = bounds.centerX;
        let y = bounds.centerY;
        
        // Apply dock positioning
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
        
        // Apply anchor positioning
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
        
        logDebug('Container', 'Calculated child position', {
            containerId: this.id,
            childDimensions: { width: childWidth, height: childHeight },
            dock: dock,
            anchor: anchor,
            calculatedPosition: { x, y },
            containerBounds: bounds
        }, 'getChildPosition');
        
        return { x, y };
    }
    
    // ============================================================================
    // Cleanup
    // ============================================================================
    
    public override destroy(): void {
        // Destroy all children first
        this.children.forEach(child => {
            if ('destroy' in child) {
                (child as BaseGameObject).destroy();
            }
        });
        
        // Clear children array
        this.children = [];
        
        // Destroy Phaser container
        if (this.phaserContainer) {
            this.phaserContainer.destroy();
            this.phaserContainer = null;
        }
        
        // Call parent destroy
        super.destroy();
        
        logInfo('Container', 'Container and all children destroyed', {
            id: this.id,
            name: this.name
        }, 'destroy');
    }
}
