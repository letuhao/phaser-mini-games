import { IHitBox, ICollision, IGameObject, IBounds } from '../objects/types';
import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Collision Manager using the Collision Pattern
 * Manages collision detection and response between game objects
 */
export class CollisionManager {
    private collidableObjects: Map<string, IHitBox & ICollision> = new Map();
    private collisionGroups: Map<string, Set<string>> = new Map();
    private isActive: boolean = true;
    
    constructor() {
        logInfo('CollisionManager', 'Initialized', {
            note: "Ready to manage collision detection and response"
        }, 'constructor');
    }
    
    /**
     * Register an object for collision detection
     */
    registerObject(id: string, object: IHitBox & ICollision, group?: string): void {
        this.collidableObjects.set(id, object);
        
        if (group) {
            if (!this.collisionGroups.has(group)) {
                this.collisionGroups.set(group, new Set());
            }
            this.collisionGroups.get(group)!.add(id);
        }
        
        logDebug('CollisionManager', 'Object registered for collision', {
            objectId: id,
            group: group || 'default',
            totalObjects: this.collidableObjects.size
        }, 'registerObject');
    }
    
    /**
     * Unregister an object from collision detection
     */
    unregisterObject(id: string): boolean {
        const removed = this.collidableObjects.delete(id);
        
        // Remove from all groups
        for (const [group, objects] of this.collisionGroups) {
            objects.delete(id);
            if (objects.size === 0) {
                this.collisionGroups.delete(group);
            }
        }
        
        if (removed) {
            logDebug('CollisionManager', 'Object unregistered from collision', {
                objectId: id,
                remainingObjects: this.collidableObjects.size
            }, 'unregisterObject');
        }
        
        return removed;
    }
    
    /**
     * Add an object to a collision group
     */
    addToGroup(objectId: string, group: string): boolean {
        const object = this.collidableObjects.get(objectId);
        if (!object) {
            logWarn('CollisionManager', 'Object not found for group assignment', {
                objectId,
                group
            }, 'addToGroup');
            return false;
        }
        
        if (!this.collisionGroups.has(group)) {
            this.collisionGroups.set(group, new Set());
        }
        
        this.collisionGroups.get(group)!.add(objectId);
        
        logDebug('CollisionManager', 'Object added to collision group', {
            objectId,
            group,
            groupSize: this.collisionGroups.get(group)!.size
        }, 'addToGroup');
        
        return true;
    }
    
    /**
     * Remove an object from a collision group
     */
    removeFromGroup(objectId: string, group: string): boolean {
        const groupSet = this.collisionGroups.get(group);
        if (!groupSet) {
            return false;
        }
        
        const removed = groupSet.delete(objectId);
        
        if (groupSet.size === 0) {
            this.collisionGroups.delete(group);
        }
        
        if (removed) {
            logDebug('CollisionManager', 'Object removed from collision group', {
                objectId,
                group
            }, 'removeFromGroup');
        }
        
        return removed;
    }
    
    /**
     * Check collision between two objects
     */
    checkCollision(obj1: IHitBox, obj2: IHitBox): boolean {
        if (!obj1 || !obj2) return false;
        
        const bounds1 = obj1.getCollisionBounds();
        const bounds2 = obj2.getCollisionBounds();
        
        return this.isBoundsColliding(bounds1, bounds2);
    }
    
    /**
     * Check if two bounds are colliding
     */
    private isBoundsColliding(bounds1: IBounds, bounds2: IBounds): boolean {
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
    
    /**
     * Update collision detection (called each frame)
     */
    update(): void {
        if (!this.isActive) return;
        
        const objectIds = Array.from(this.collidableObjects.keys());
        
        // Check collisions between all registered objects
        for (let i = 0; i < objectIds.length; i++) {
            for (let j = i + 1; j < objectIds.length; j++) {
                const obj1 = this.collidableObjects.get(objectIds[i]);
                const obj2 = this.collidableObjects.get(objectIds[j]);
                
                if (obj1 && obj2 && obj1.isCollisionEnabled && obj2.isCollisionEnabled) {
                    if (this.checkCollision(obj1, obj2)) {
                        this.handleCollision(obj1, obj2);
                    }
                }
            }
        }
    }
    
    /**
     * Handle collision between two objects
     */
    private handleCollision(obj1: IHitBox & ICollision, obj2: IHitBox & ICollision): void {
        try {
            // Notify both objects of the collision
            obj1.onCollisionEnter(obj2 as any);
            obj2.onCollisionEnter(obj1 as any);
            
            logDebug('CollisionManager', 'Collision detected', {
                object1: 'collision_object_1',
                object2: 'collision_object_2'
            }, 'handleCollision');
        } catch (error) {
            logError('CollisionManager', 'Error handling collision', {
                object1: 'collision_object_1',
                object2: 'collision_object_2',
                error
            }, 'handleCollision');
        }
    }
    
    /**
     * Check collision between specific groups
     */
    checkGroupCollision(group1: string, group2: string): void {
        const group1Objects = this.collisionGroups.get(group1);
        const group2Objects = this.collisionGroups.get(group2);
        
        if (!group1Objects || !group2Objects) {
            return;
        }
        
        for (const obj1Id of group1Objects) {
            for (const obj2Id of group2Objects) {
                if (obj1Id === obj2Id) continue;
                
                const obj1 = this.collidableObjects.get(obj1Id);
                const obj2 = this.collidableObjects.get(obj2Id);
                
                if (obj1 && obj2 && obj1.isCollisionEnabled && obj2.isCollisionEnabled) {
                    if (this.checkCollision(obj1, obj2)) {
                        this.handleCollision(obj1, obj2);
                    }
                }
            }
        }
    }
    
    /**
     * Get all objects in a collision group
     */
    getGroupObjects(group: string): string[] {
        const groupSet = this.collisionGroups.get(group);
        return groupSet ? Array.from(groupSet) : [];
    }
    
    /**
     * Get all collision groups
     */
    getCollisionGroups(): string[] {
        return Array.from(this.collisionGroups.keys());
    }
    
    /**
     * Enable/disable collision detection
     */
    setActive(active: boolean): void {
        this.isActive = active;
        logInfo('CollisionManager', 'Collision detection state changed', {
            active,
            note: active ? "Collision detection enabled" : "Collision detection disabled"
        }, 'setActive');
    }
    
    /**
     * Get collision statistics
     */
    getStats(): {
        totalObjects: number;
        totalGroups: number;
        isActive: boolean;
    } {
        return {
            totalObjects: this.collidableObjects.size,
            totalGroups: this.collisionGroups.size,
            isActive: this.isActive
        };
    }
    
    /**
     * Clear all registered objects and groups
     */
    clear(): void {
        logInfo('CollisionManager', 'Clearing all collision data', {
            objectCount: this.collidableObjects.size,
            groupCount: this.collisionGroups.size
        }, 'clear');
        
        this.collidableObjects.clear();
        this.collisionGroups.clear();
    }
}
