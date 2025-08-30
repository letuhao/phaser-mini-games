import Phaser from 'phaser';
import { ObjectLoader } from '../objects/ObjectLoader';
import { ResponsiveManager } from '../core/ResponsiveManager';
import { logInfo, logDebug, logWarn, logError } from '../core/Logger';
import { GroupNode } from '../core/GroupNode';
import { UIButton } from '../ui/Button';
import { LevisR3Objects } from '../config/scenes/levisR3/objects.levisR3';
import { LevisR3Responsive } from '../config/scenes/levisR3/responsive.levisR3';
import { AssetLoader } from '../core/AssetLoader';
import { initialAssets, allLevisR3Assets } from '../config/scenes/levisR3/assets.levisR3.config';

export class LevisR3WheelScene extends Phaser.Scene {
    private objects: Record<string, Phaser.GameObjects.GameObject> = {};
    private objectLoader: ObjectLoader;
    private responsiveManager: ResponsiveManager | null = null;
    private assetLoader: AssetLoader | null = null;
    
    constructor() {
        super({ key: 'LevisR3WheelScene' });
        
        this.objectLoader = new ObjectLoader();
        
        logInfo('LevisR3WheelScene', 'Constructor - LevisR3Objects:', LevisR3Objects, 'constructor');
        logInfo('LevisR3WheelScene', 'Constructor - config type:', typeof LevisR3Objects, 'constructor');
        logInfo('LevisR3WheelScene', 'Constructor - config length:', LevisR3Objects?.length, 'constructor');
    }
    
    preload() {
        logInfo('LevisR3WheelScene', 'Starting preload', undefined, 'preload');
        
        // Initialize asset loader
        this.assetLoader = new AssetLoader(this);
        
        // Load assets from configuration instead of manual loading
        logInfo('LevisR3WheelScene', 'Loading assets from configuration', {
            initialAssetsCount: initialAssets.length,
            totalAssetsCount: allLevisR3Assets.length,
            note: "Using centralized asset configuration system"
        }, 'preload');
        
        // Load initial assets (critical assets that must be loaded before scene starts)
        for (const asset of initialAssets) {
            if (asset.preload) {
                logDebug('LevisR3WheelScene', 'Queuing asset for loading', {
                    key: asset.key,
                    type: asset.type,
                    url: asset.url
                }, 'preload');
                
                // Queue the asset for loading using Phaser's loader
                this.queueAssetForLoading(asset);
            }
        }
        
        logInfo('LevisR3WheelScene', 'Preload completed', {
            queuedAssets: initialAssets.filter(a => a.preload).map(a => a.key),
            note: "Assets queued for loading using configuration system"
        }, 'preload');
    }
    
    /**
     * Queue an asset for loading using Phaser's loader system
     */
    private queueAssetForLoading(asset: any): void {
        try {
            switch (asset.type) {
                case 'image':
                    if (asset.url.endsWith('.svg')) {
                        this.load.svg(asset.key, asset.url);
                    } else {
                        this.load.image(asset.key, asset.url);
                    }
                    break;
                case 'audio':
                    this.load.audio(asset.key, asset.url);
                    break;
                case 'atlas':
                    if (asset.config?.dataURL && asset.config?.textureURL) {
                        this.load.atlas(asset.key, asset.config.textureURL, asset.config.dataURL);
                    } else {
                        this.load.atlas(asset.key, asset.url);
                    }
                    break;
                case 'spritesheet':
                    if (asset.config?.frameWidth && asset.config?.frameHeight) {
                        this.load.spritesheet(asset.key, asset.url, {
                            frameWidth: asset.config.frameWidth,
                            frameHeight: asset.config.frameHeight,
                            spacing: asset.config.spacing,
                            margin: asset.config.margin
                        });
                    } else {
                        this.load.spritesheet(asset.key, asset.url);
                    }
                    break;
                case 'json':
                    this.load.json(asset.key, asset.url);
                    break;
                default:
                    logWarn('LevisR3WheelScene', 'Unknown asset type', {
                        key: asset.key,
                        type: asset.type
                    }, 'queueAssetForLoading');
            }
            
            logDebug('LevisR3WheelScene', 'Asset queued successfully', {
                key: asset.key,
                type: asset.type,
                url: asset.url
            }, 'queueAssetForLoading');
            
        } catch (error) {
            logError('LevisR3WheelScene', 'Error queuing asset', {
                key: asset.key,
                type: asset.type,
                url: asset.url,
                error
            }, 'queueAssetForLoading');
        }
    }
    
    create() {
        logInfo('LevisR3WheelScene', 'Starting scene creation', undefined, 'create');
        
        // Debug: Check configuration
        const config = this.getObjectsConfig();
        logInfo('LevisR3WheelScene', 'Configuration loaded', { 
            configLength: config.length,
            configType: typeof config,
            isArray: Array.isArray(config),
            firstItem: config[0]
        }, 'create');
        
        // Load objects using the new ObjectLoader
        this.objects = this.objectLoader.loadObjects(this, config);
        
        logInfo('LevisR3WheelScene', 'Objects loaded', { 
            objectKeys: Object.keys(this.objects),
            objectCount: Object.keys(this.objects).length,
            objects: this.objects
        }, 'create');
        
        // Setup responsive scaling
        this.setupResponsiveScaling();
        
        logInfo('LevisR3WheelScene', 'Scene creation completed', undefined, 'create');
        
        // Expose debugging methods to global scope for testing
        this.exposeDebugMethods();
    }
    
    /**
     * Expose debugging methods to global scope for testing
     */
    private exposeDebugMethods() {
        // Make the scene accessible globally for debugging
        (window as any).levisR3Scene = this;
        
        // Add a method to test embers
        (window as any).testEmbers = () => {
            if (this.responsiveManager) {
                const embersInstances = this.responsiveManager.getEmbersInstances();
                logInfo('LevisR3WheelScene', 'Testing embers instances', {
                    count: embersInstances.length,
                    instances: embersInstances
                }, 'exposeDebugMethods');
                
                // Try to manually start embers for testing
                embersInstances.forEach(({ containerName, embers }) => {
                    logInfo('LevisR3WheelScene', 'Attempting to start embers', {
                        containerName,
                        hasEmbers: !!embers,
                        embersType: embers?.constructor?.name
                    }, 'exposeDebugMethods');
                    
                    if (embers && embers.manualStart) {
                        embers.manualStart();
                    }
                });
                
                return embersInstances;
            } else {
                logWarn('LevisR3WheelScene', 'ResponsiveManager not available', undefined, 'exposeDebugMethods');
                return null;
            }
        };
        
        logInfo('LevisR3WheelScene', 'Debug methods exposed to global scope', {
            globalScene: 'window.levisR3Scene',
            testEmbers: 'window.testEmbers()',
            note: "Use these in browser console for debugging"
        }, 'exposeDebugMethods');
    }
    
    private getObjectsConfig() {
        logInfo('LevisR3WheelScene', 'Getting objects config', { 
            LevisR3Objects: LevisR3Objects,
            type: typeof LevisR3Objects,
            length: LevisR3Objects?.length
        }, 'getObjectsConfig');
        
        // Use the real configuration instead of test config
        return LevisR3Objects;
    }
    
    private setupResponsiveScaling() {
        // Initialize responsive manager
        this.responsiveManager = new ResponsiveManager(this);
        
        // Apply responsive scaling after objects are loaded
        this.responsiveManager.apply();
        
        // Register ResponsiveManager to handle resize events
        this.scale.on('resize', () => {
            logInfo('LevisR3WheelScene', 'Resize event triggered, calling ResponsiveManager', {
                newWidth: this.scale.width,
                newHeight: this.scale.height
            }, 'setupResponsiveScaling');
            
            if (this.responsiveManager) {
                this.responsiveManager.apply();
            }
        });
    }
    
    /**
     * Get container configuration for ResponsiveManager
     * This allows ResponsiveManager to position containers based on their dock/anchor properties
     */
    getContainerConfig(containerName: string): any {
        const config = LevisR3Objects.find((obj: any) => obj.id === containerName);
        return config;
    }
}
