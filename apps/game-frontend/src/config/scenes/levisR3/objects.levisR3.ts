import type { ObjectsConfig, IRectObject, ITextObject, IButtonObject, ISpawnArea, IEffectObject } from '../../../objects/types';

// Single background object that scales with the canvas while maintaining 16:9 aspect ratio
import { logInfo } from '../../../core/Logger';

export const LevisR3Objects: ObjectsConfig = [
    {
        type: 'background',
        id: 'bg',
        z: 0,
        textureKey: 'levisR3_BG', // Use the actual texture key from assets
        tile: false,
        fit: 'contain' // This will maintain aspect ratio
    },
    {
        type: 'container',
        id: 'effects-container',
        z: 100,
        dock: 'center',
        anchor: 'center',
        width: 2560, // Base width - will be scaled by ResponsiveManager
        height: 1440, // Base height - will be scaled by ResponsiveManager
        followBackground: true,
        children: [
            {
                type: 'rect',
                id: 'effects-debug-border',
                x: 0,
                y: 0,
                width: 2560,
                height: 1440,
                fill: 0x00ff00,
                alpha: 0.3,
                origin: { x: 0, y: 0 }
            },
            // Spawn area as child container - will be positioned by ResponsiveManager recursively
            {
                type: 'spawn-area',
                id: 'embers-spawn-area',
                effectType: 'embers',
                dock: 'bottom',
                anchor: 'bottom-center',
                width: 2560,
                height: 440,
                followBackground: true,
                margin: 50,
                density: 1,
                fill: 0xff0000,
                alpha: 0.3,
                origin: { x: 0.5, y: 1 },
                children: [
                    {
                        type: 'effect',
                        id: 'embers-effect',
                        effectType: 'embers',
                        x: 0,
                        y: 0,
                        count: 50,
                        budget: 50,
                        debugSpawnArea: true,
                        embers: {
                            scale: { min: 0.4, max: 2 },
                            colors: [0xffd4de, 0xffb3c2, 0xff9bb5, 0xff8080, 0xffa000],
                            colorBlend: true,
                            rise: { min: 120, max: 320 },
                            duration: { min: 1200, max: 3000 },
                            sway: { min: -40, max: 40 },
                            alpha: { min: 0.6, max: 0.95 },
                            blendMode: 'add',
                            gravity: -0.5,
                            wind: 0.2,
                            texture: {
                                key: 'fx-ember',
                                size: 16,
                                shape: 'circle'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        type: 'container',
        id: 'footer',
        z: 200,
        dock: 'bottom',
        anchor: 'bottom-center',
        width: 2560, // Base width - will be scaled by ResponsiveManager
        height: 80, // Base height - will be scaled by ResponsiveManager
        followBackground: true,
        children: [
            {
                type: 'rect',
                id: 'footer-bg',
                x: 0,
                y: 0,
                width: 2560,
                height: 80,
                fill: 0x54a8a8,
                origin: { x: 0, y: 0 }
            },
            {
                type: 'text',
                id: 'footer-text',
                x: 250,
                y: 40,
                text: '© COPYRIGHT 2024 - ACFC Công Ty TNHH Thời Trang & Mỹ Phẩm Âu Châu.',
                style: {
                    fontFamily: 'Inter, Helvetica, sans-serif',
                    fontSize: '24px',
                    color: '#D5D6DA',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    stroke: 'none',
                    shadow: {
                        offsetX: 0,
                        offsetY: 0,
                        color: 'transparent',
                        blur: 0
                    }
                },
                origin: { x: 0, y: 0.5 }
            },
            {
                type: 'button',
                id: 'facebook-btn',
                x: 2000,
                y: 40,
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0x1877f2,
                borderColor: 0xffffff,
                hoverScale: 1.2,
                clickScale: 0.9,
                hoverTint: 0xd6d6d6,
                clickTint: 0xa5a5a5,
                backgroundImage: 'facebook-icon',
                backgroundImageScale: 'fit',
                backgroundImageOrigin: { x: 0.5, y: 0.5 }
            },
            {
                type: 'button',
                id: 'instagram-btn',
                x: 2070,
                y: 40,
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0xe4405f,
                borderColor: 0xffffff,
                hoverScale: 1.2,
                clickScale: 0.9,
                hoverTint: 0xd63384,
                clickTint: 0x8b2d9b,
                backgroundImage: 'instagram-icon',
                backgroundImageScale: 'fit',
                backgroundImageOrigin: { x: 0.5, y: 0.5 }
            },
            {
                type: 'button',
                id: 'youtube-btn',
                x: 2140,
                y: 40,
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0xff0000,
                borderColor: 0xffffff,
                hoverScale: 1.2,
                clickScale: 0.9,
                hoverTint: 0xdc3545,
                clickTint: 0x8b2d9b,
                backgroundImage: 'youtube-icon',
                backgroundImageScale: 'fit',
                backgroundImageOrigin: { x: 0.5, y: 0.5 }
            },
            {
                type: 'button',
                id: 'zalo-btn',
                x: 2210,
                y: 40,
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0x0068ff,
                borderColor: 0xffffff,
                hoverScale: 1.2,
                clickScale: 0.9,
                hoverTint: 0x56b6ff,
                clickTint: 0x44a6ff,
                backgroundImage: 'zalo-icon',
                backgroundImageScale: 'fit',
                backgroundImageOrigin: { x: 0.5, y: 0.5 }
            },
            {
                type: 'button',
                id: 'tiktok-btn',
                x: 2280,
                y: 40,
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0x000000,
                borderColor: 0xffffff,
                hoverScale: 1.2,
                clickScale: 0.9,
                hoverTint: 0x1a1a1a,
                clickTint: 0x333333,
                backgroundImage: 'tiktok-icon',
                backgroundImageScale: 'fit',
                backgroundImageOrigin: { x: 0.5, y: 0.5 }
            }
        ]
    }
];
