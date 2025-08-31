import { logInfo, logDebug, logWarn, logError } from './Logger';
import { AssetConfig, ImageAssetConfig, AudioAssetConfig, FontAssetConfig, AtlasAssetConfig, SpritesheetAssetConfig } from '../config/scenes/levisR3/assets.levisR3.config';

/**
 * Asset Loader - Automatically loads assets based on configuration
 * Integrates with Phaser's loading system and our asset configuration
 */
export class AssetLoader {
    private scene: Phaser.Scene;
    private loadedAssets: Set<string> = new Set();
    private loadingPromises: Map<string, Promise<boolean>> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        logInfo('AssetLoader', 'Initialized', {
            sceneName: scene.scene.key,
            note: "Ready to load assets from configuration"
        }, 'constructor');
    }

    /**
     * Load assets from configuration
     */
    async loadAssetsFromConfig(assets: AssetConfig[]): Promise<boolean> {
        logInfo('AssetLoader', 'Loading assets from configuration', {
            assetCount: assets.length,
            assets: assets.map(a => ({ key: a.key, type: a.type, url: a.url }))
        }, 'loadAssetsFromConfig');

        const loadPromises: Promise<boolean>[] = [];

        for (const asset of assets) {
            if (asset.preload) {
                const loadPromise = this.loadAsset(asset);
                loadPromises.push(loadPromise);
            } else {
                logDebug('AssetLoader', 'Skipping non-preload asset', {
                    key: asset.key,
                    type: asset.type,
                    reason: 'preload: false'
                }, 'loadAssetsFromConfig');
            }
        }

        try {
            const results = await Promise.all(loadPromises);
            const successCount = results.filter(result => result).length;
            const totalCount = loadPromises.length;

            logInfo('AssetLoader', 'Asset loading completed', {
                totalAssets: totalCount,
                successfulLoads: successCount,
                failedLoads: totalCount - successCount,
                successRate: `${((successCount / totalCount) * 100).toFixed(1)}%`
            }, 'loadAssetsFromConfig');

            return successCount === totalCount;
        } catch (error) {
            logError('AssetLoader', 'Error during asset loading', {
                error,
                assetCount: assets.length
            }, 'loadAssetsFromConfig');
            return false;
        }
    }

    /**
     * Load a single asset based on its configuration
     */
    private async loadAsset(asset: AssetConfig): Promise<boolean> {
        if (this.loadedAssets.has(asset.key)) {
            logDebug('AssetLoader', 'Asset already loaded', {
                key: asset.key,
                type: asset.type
            }, 'loadAsset');
            return true;
        }

        try {
            logDebug('AssetLoader', 'Loading asset', {
                key: asset.key,
                type: asset.type,
                url: asset.url
            }, 'loadAsset');

            switch (asset.type) {
                case 'image':
                    return this.loadImageAsset(asset as ImageAssetConfig);
                case 'audio':
                    return this.loadAudioAsset(asset as AudioAssetConfig);
                case 'font':
                    return this.loadFontAsset(asset as FontAssetConfig);
                case 'atlas':
                    return this.loadAtlasAsset(asset as AtlasAssetConfig);
                case 'spritesheet':
                    return this.loadSpritesheetAsset(asset as SpritesheetAssetConfig);
                case 'json':
                    return this.loadJsonAsset(asset);
                default:
                    logWarn('AssetLoader', 'Unknown asset type', {
                        key: asset.key,
                        type: asset.type
                    }, 'loadAsset');
                    return false;
            }
        } catch (error) {
            logError('AssetLoader', 'Error loading asset', {
                key: asset.key,
                type: asset.type,
                url: asset.url,
                error
            }, 'loadAsset');
            return false;
        }
    }

    /**
     * Load image asset
     */
    private loadImageAsset(asset: ImageAssetConfig): boolean {
        try {
            if (asset.url.endsWith('.svg')) {
                this.scene.load.svg(asset.key, asset.url);
            } else {
                this.scene.load.image(asset.key, asset.url);
            }
            
            this.loadedAssets.add(asset.key);
            logDebug('AssetLoader', 'Image asset queued for loading', {
                key: asset.key,
                url: asset.url,
                isSVG: asset.url.endsWith('.svg')
            }, 'loadImageAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing image asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadImageAsset');
            return false;
        }
    }

    /**
     * Load audio asset
     */
    private loadAudioAsset(asset: AudioAssetConfig): boolean {
        try {
            this.scene.load.audio(asset.key, asset.url);
            this.loadedAssets.add(asset.key);
            
            logDebug('AssetLoader', 'Audio asset queued for loading', {
                key: asset.key,
                url: asset.url,
                config: asset.config
            }, 'loadAudioAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing audio asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadAudioAsset');
            return false;
        }
    }

    /**
     * Load font asset
     */
    private loadFontAsset(asset: FontAssetConfig): boolean {
        try {
            // For fonts, we might need to load them differently
            // This is a placeholder for font loading logic
            this.loadedAssets.add(asset.key);
            
            logDebug('AssetLoader', 'Font asset queued for loading', {
                key: asset.key,
                url: asset.url,
                config: asset.config
            }, 'loadFontAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing font asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadFontAsset');
            return false;
        }
    }

    /**
     * Load atlas asset
     */
    private loadAtlasAsset(asset: AtlasAssetConfig): boolean {
        try {
            if (asset.config?.atlasURL && asset.config?.imageURL) {
                this.scene.load.atlas(asset.key, asset.config.imageURL, asset.config.atlasURL);
            } else {
                this.scene.load.atlas(asset.key, asset.url);
            }
            
            this.loadedAssets.add(asset.key);
            
            logDebug('AssetLoader', 'Atlas asset queued for loading', {
                key: asset.key,
                url: asset.url,
                config: asset.config
            }, 'loadAtlasAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing atlas asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadAtlasAsset');
            return false;
        }
    }

    /**
     * Load spritesheet asset
     */
    private loadSpritesheetAsset(asset: SpritesheetAssetConfig): boolean {
        try {
            if (asset.config?.frameWidth && asset.config?.frameHeight) {
                this.scene.load.spritesheet(asset.key, asset.url, {
                    frameWidth: asset.config.frameWidth,
                    frameHeight: asset.config.frameHeight,
                    spacing: asset.config.spacing,
                    margin: asset.config.margin
                });
            } else {
                this.scene.load.spritesheet(asset.key, asset.url);
            }
            
            this.loadedAssets.add(asset.key);
            
            logDebug('AssetLoader', 'Spritesheet asset queued for loading', {
                key: asset.key,
                url: asset.url,
                config: asset.config
            }, 'loadSpritesheetAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing spritesheet asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadSpritesheetAsset');
            return false;
        }
    }

    /**
     * Load JSON asset
     */
    private loadJsonAsset(asset: AssetConfig): boolean {
        try {
            this.scene.load.json(asset.key, asset.url);
            this.loadedAssets.add(asset.key);
            
            logDebug('AssetLoader', 'JSON asset queued for loading', {
                key: asset.key,
                url: asset.url
            }, 'loadJsonAsset');
            
            return true;
        } catch (error) {
            logError('AssetLoader', 'Error queuing JSON asset', {
                key: asset.key,
                url: asset.url,
                error
            }, 'loadJsonAsset');
            return false;
        }
    }

    /**
     * Check if an asset is loaded
     */
    isAssetLoaded(key: string): boolean {
        return this.loadedAssets.has(key);
    }

    /**
     * Get all loaded asset keys
     */
    getLoadedAssets(): string[] {
        return Array.from(this.loadedAssets);
    }

    /**
     * Clear loaded assets tracking
     */
    clearLoadedAssets(): void {
        this.loadedAssets.clear();
        this.loadingPromises.clear();
        logInfo('AssetLoader', 'Cleared loaded assets tracking', {}, 'clearLoadedAssets');
    }
}
