import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Resource Manager using the Resource Pattern
 * Manages game assets, textures, sounds, and other resources
 */
export class ResourceManager {
    private resources: Map<string, any> = new Map();
    private resourceTypes: Map<string, string> = new Map();
    private resourceMetadata: Map<string, any> = new Map();
    private isActive: boolean = true;
    private maxMemoryUsage: number = 100 * 1024 * 1024; // 100MB default
    private currentMemoryUsage: number = 0;
    
    constructor() {
        logInfo('ResourceManager', 'Initialized', {
            note: "Ready to manage game assets and resources",
            maxMemoryUsage: this.maxMemoryUsage
        }, 'constructor');
    }
    
    /**
     * Load a resource
     */
    async loadResource(key: string, type: string, source: any, metadata?: any): Promise<boolean> {
        if (!this.isActive) return false;
        
        try {
            // Check if resource already exists
            if (this.resources.has(key)) {
                logWarn('ResourceManager', 'Resource already exists', {
                    key,
                    type,
                    note: "Will be replaced"
                }, 'loadResource');
                
                this.unloadResource(key);
            }
            
            // Store the resource
            this.resources.set(key, source);
            this.resourceTypes.set(key, type);
            
            if (metadata) {
                this.resourceMetadata.set(key, metadata);
            }
            
            // Calculate memory usage (rough estimate)
            this.updateMemoryUsage(key, source);
            
            logInfo('ResourceManager', 'Resource loaded successfully', {
                key,
                type,
                metadata,
                currentMemoryUsage: this.currentMemoryUsage
            }, 'loadResource');
            
            return true;
        } catch (error) {
            logError('ResourceManager', 'Error loading resource', {
                key,
                type,
                source,
                error
            }, 'loadResource');
            return false;
        }
    }
    
    /**
     * Get a resource by key
     */
    getResource(key: string): any {
        const resource = this.resources.get(key);
        
        if (!resource) {
            logWarn('ResourceManager', 'Resource not found', {
                key,
                availableResources: Array.from(this.resources.keys())
            }, 'getResource');
        }
        
        return resource;
    }
    
    /**
     * Get resource type
     */
    getResourceType(key: string): string | null {
        return this.resourceTypes.get(key) || null;
    }
    
    /**
     * Get resource metadata
     */
    getResourceMetadata(key: string): any {
        return this.resourceMetadata.get(key);
    }
    
    /**
     * Check if resource exists
     */
    hasResource(key: string): boolean {
        return this.resources.has(key);
    }
    
    /**
     * Unload a resource
     */
    unloadResource(key: string): boolean {
        const resource = this.resources.get(key);
        
        if (!resource) return false;
        
        try {
            // Clean up resource based on type
            this.cleanupResource(key, resource);
            
            // Remove from maps
            this.resources.delete(key);
            this.resourceTypes.delete(key);
            this.resourceMetadata.delete(key);
            
            // Update memory usage
            this.updateMemoryUsage(key, null);
            
            logDebug('ResourceManager', 'Resource unloaded', {
                key,
                currentMemoryUsage: this.currentMemoryUsage
            }, 'unloadResource');
            
            return true;
        } catch (error) {
            logError('ResourceManager', 'Error unloading resource', {
                key,
                error
            }, 'unloadResource');
            return false;
        }
    }
    
    /**
     * Clean up resource based on type
     */
    private cleanupResource(key: string, resource: any): void {
        const type = this.resourceTypes.get(key);
        
        if (!type) return;
        
        try {
            switch (type) {
                case 'texture':
                    if (resource.destroy) {
                        resource.destroy();
                    }
                    break;
                case 'sound':
                    if (resource.destroy) {
                        resource.destroy();
                    }
                    break;
                case 'animation':
                    if (resource.destroy) {
                        resource.destroy();
                    }
                    break;
                case 'json':
                    // JSON objects don't need cleanup
                    break;
                default:
                    // Generic cleanup
                    if (resource.destroy) {
                        resource.destroy();
                    }
                    break;
            }
        } catch (error) {
            logWarn('ResourceManager', 'Error during resource cleanup', {
                key,
                type,
                error
            }, 'cleanupResource');
        }
    }
    
    /**
     * Update memory usage tracking
     */
    private updateMemoryUsage(key: string, resource: any): void {
        if (resource === null) {
            // Resource being unloaded
            const metadata = this.resourceMetadata.get(key);
            if (metadata && metadata.memoryUsage) {
                this.currentMemoryUsage -= metadata.memoryUsage;
            }
        } else {
            // Resource being loaded
            const estimatedSize = this.estimateResourceSize(resource);
            this.currentMemoryUsage += estimatedSize;
            
            // Update metadata
            const metadata = this.resourceMetadata.get(key) || {};
            metadata.memoryUsage = estimatedSize;
            this.resourceMetadata.set(key, metadata);
        }
        
        // Ensure memory usage doesn't go negative
        this.currentMemoryUsage = Math.max(0, this.currentMemoryUsage);
    }
    
    /**
     * Estimate resource size in bytes
     */
    private estimateResourceSize(resource: any): number {
        if (typeof resource === 'string') {
            return resource.length * 2; // UTF-16 characters
        }
        
        if (typeof resource === 'number') {
            return 8; // 64-bit number
        }
        
        if (typeof resource === 'boolean') {
            return 1;
        }
        
        if (resource instanceof ArrayBuffer) {
            return resource.byteLength;
        }
        
        if (resource instanceof ImageData) {
            return resource.data.length;
        }
        
        if (resource instanceof HTMLImageElement) {
            return resource.width * resource.height * 4; // RGBA
        }
        
        if (resource instanceof HTMLCanvasElement) {
            return resource.width * resource.height * 4; // RGBA
        }
        
        // Default estimate
        return 1024; // 1KB default
    }
    
    /**
     * Get all resources of a specific type
     */
    getResourcesByType(type: string): string[] {
        const resources: string[] = [];
        
        for (const [key, resourceType] of this.resourceTypes) {
            if (resourceType === type) {
                resources.push(key);
            }
        }
        
        return resources;
    }
    
    /**
     * Get all resource types
     */
    getResourceTypes(): string[] {
        return Array.from(new Set(this.resourceTypes.values()));
    }
    
    /**
     * Set maximum memory usage
     */
    setMaxMemoryUsage(maxBytes: number): void {
        this.maxMemoryUsage = maxBytes;
        
        logInfo('ResourceManager', 'Max memory usage updated', {
            maxMemoryUsage: this.maxMemoryUsage
        }, 'setMaxMemoryUsage');
        
        // Check if we need to free memory
        this.checkMemoryUsage();
    }
    
    /**
     * Check memory usage and free resources if needed
     */
    private checkMemoryUsage(): void {
        if (this.currentMemoryUsage > this.maxMemoryUsage) {
            logWarn('ResourceManager', 'Memory usage exceeded limit', {
                current: this.currentMemoryUsage,
                max: this.maxMemoryUsage,
                note: "Will attempt to free memory"
            }, 'checkMemoryUsage');
            
            this.freeMemory();
        }
    }
    
    /**
     * Free memory by unloading least recently used resources
     */
    private freeMemory(): void {
        const resources = Array.from(this.resources.keys());
        
        // Simple strategy: unload resources until we're under the limit
        for (const key of resources) {
            if (this.currentMemoryUsage <= this.maxMemoryUsage) {
                break;
            }
            
            this.unloadResource(key);
        }
        
        logInfo('ResourceManager', 'Memory freed', {
            currentMemoryUsage: this.currentMemoryUsage,
            maxMemoryUsage: this.maxMemoryUsage
        }, 'freeMemory');
    }
    
    /**
     * Get resource statistics
     */
    getStats(): {
        totalResources: number;
        totalTypes: number;
        currentMemoryUsage: number;
        maxMemoryUsage: number;
        memoryUsagePercentage: number;
        isActive: boolean;
    } {
        const memoryUsagePercentage = (this.currentMemoryUsage / this.maxMemoryUsage) * 100;
        
        return {
            totalResources: this.resources.size,
            totalTypes: this.getResourceTypes().length,
            currentMemoryUsage: this.currentMemoryUsage,
            maxMemoryUsage: this.maxMemoryUsage,
            memoryUsagePercentage,
            isActive: this.isActive
        };
    }
    
    /**
     * Enable/disable resource management
     */
    setActive(active: boolean): void {
        this.isActive = active;
        
        logInfo('ResourceManager', 'Resource management state changed', {
            active,
            note: active ? "Resource management enabled" : "Resource management disabled"
        }, 'setActive');
    }
    
    /**
     * Clear all resources
     */
    clear(): void {
        logInfo('ResourceManager', 'Clearing all resources', {
            resourceCount: this.resources.size
        }, 'clear');
        
        const resources = Array.from(this.resources.keys());
        
        for (const key of resources) {
            this.unloadResource(key);
        }
        
        this.currentMemoryUsage = 0;
    }
    
    /**
     * Get resource summary
     */
    getResourceSummary(): {
        byType: Record<string, number>;
        totalMemory: number;
        largestResources: Array<{ key: string; size: number; type: string }>;
    } {
        const byType: Record<string, number> = {};
        let totalMemory = 0;
        const resourceSizes: Array<{ key: string; size: number; type: string }> = [];
        
        for (const [key, type] of this.resourceTypes) {
            const metadata = this.resourceMetadata.get(key);
            const size = metadata?.memoryUsage || 0;
            
            byType[type] = (byType[type] || 0) + 1;
            totalMemory += size;
            
            resourceSizes.push({ key, size, type });
        }
        
        // Sort by size (largest first)
        resourceSizes.sort((a, b) => b.size - a.size);
        
        return {
            byType,
            totalMemory,
            largestResources: resourceSizes.slice(0, 10) // Top 10 largest
        };
    }
}
