import type { ObjectsConfig, RectObject, TextObject, ButtonObject } from '../objects/types';

// Single background object that scales with the canvas while maintaining 16:9 aspect ratio
export const LevisR3Objects: ObjectsConfig = [
    {
        type: 'background',
        id: 'bg',
        z: 0,
        // Use the loaded 16:9 background image
        textureKey: 'bg-16x9',
        tile: false,
        fit: 'contain', // This ensures the image maintains aspect ratio and centers on screen
    },
    {
        type: 'container',
        id: 'effects-container',
        z: 100, // Above background, below footer
        x: 0,
        y: 0,
        // Container will be positioned and sized dynamically based on background image bounds
        // This allows effects to be positioned relative to the background image
        children: [
            // Example effects - you can add more or modify these
            {
                type: 'rect',
                id: 'effects-debug-border',
                x: 0,
                y: 0,
                width: 2560,  // Base width - will auto-scale with background (same as footer)
                height: 1440,  // Base height - will auto-scale with background
                fill: 0x00ff00, // Green border for debugging (set alpha to 0 to hide)
                alpha: 0.0,     // More visible for debugging - you can set this to 0 when done
                origin: { x: 0, y: 0 }, // Top-left aligned
            } as RectObject,
            // Ember effect - spawns within container bounds
            {
                type: 'effect',
                id: 'embers-effect',
                effectType: 'embers',
                x: 0,           // Relative to container (0 = left edge)
                y: 0,           // Relative to container (0 = top edge)
                // Ember configuration - NEW spawnArea system for precise positioning
                // FIXED: Now using proper background-relative coordinates
                // spawnArea coordinates are relative to the background image's (0,0) origin
                // This ensures proper scaling across different screen sizes
                // x: 0 = left edge of background image, y: 0 = top edge of background image
                count: 50,      // Number of embers in the pool
                spawnArea: { 
                    x: 0,              // Start from left edge of background image (0 = left edge)
                    y: 1200,          // 200px from bottom (1440 - 200 = 1240)
                    width: 2560,      // Full background image width
                    height: 500       // 200px tall spawn area at bottom
                },
                budget: 50,     // How many embers are active at once
                debugSpawnArea: false, // Show red rectangle for spawn area debugging - will help identify X position issues
            } as any, // Type assertion for now
            // Add more effects here:
            // - Fireflies effect
            // - StarGrow effect
            // - AutumnLeaves effect
            // - Rain effect
            // - Wind effect
            // - LensFlare effect
            // - WaterSurface effect
        ]
    },
    {
        type: 'container',
        id: 'footer',
        z: 200, // Above background
        x: 0,
        y: 0,
        children: [
            {
                type: 'rect',
                id: 'footer-bg',
                x: 0,
                y: 0,
                width: 2560,  // Base width - will auto-scale with background
                height: 80,    // Base height - adjust this to change footer height
                fill: 0x550008, // Same color as SVG
                origin: { x: 0, y: 1 }, // Left-aligned, bottom-aligned
            } as RectObject,
            {
                type: 'text',
                id: 'footer-text',
                x: 250,        // Left padding - adjust for text positioning
                y: -40,        // Vertical centering: -height/2 for center alignment
                text: '© COPYRIGHT 2024 - ACFC Công Ty TNHH Thời Trang & Mỹ Phẩm Âu Châu.',
                style: { 
                    fontFamily: 'Inter, Helvetica, sans-serif', // Better font fallbacks
                    fontSize: '24px', // Text size - adjust this to change text height
                    color: '#D5D6DA',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    stroke: 'none', // No stroke for clean text
                    shadow: {
                        offsetX: 0,
                        offsetY: 0,
                        color: 'transparent',
                        blur: 0
                    }
                },
                origin: { x: 0, y: 0.5 }, // Left-aligned, vertically centered
            } as TextObject,
            // Facebook button with icon and hover effects
            {
                type: 'button',
                id: 'facebook-btn',
                x: 2000,       // Position on the right side of footer
                y: -40,        // Vertically centered in footer
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',      // Icon mode for social media
                backgroundColor: 0x1877f2, // Facebook blue background
                borderColor: 0xffffff,    // White border
                
                // Enhanced effects
                hoverScale: 1.2,          // Scale up on hover
                clickScale: 0.9,          // Scale down on click
                hoverTint: 0x0d6efd,      // Darker blue on hover
                clickTint: 0x0a58ca,      // Even darker blue on click
                
                // Background image support - Facebook icon
                backgroundImage: 'facebook-icon',
                backgroundImageScale: 'fit',      // Scale to fit within button
                backgroundImageOrigin: { x: 0.5, y: 0.5 }, // Center position
                
                // Click action - open Facebook
                onClick: () => { 
                    console.log('Facebook button clicked!');
                    window.open('https://www.facebook.com', '_blank');
                },
            } as ButtonObject,
            // Instagram button with icon and hover effects
            {
                type: 'button',
                id: 'instagram-btn',
                x: 2070,       // Position next to Facebook button
                y: -40,        // Vertically centered in footer
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',      // Icon mode for social media
                backgroundColor: 0xe4405f, // Instagram pink background
                borderColor: 0xffffff,    // White border
                
                // Enhanced effects
                hoverScale: 1.2,          // Scale up on hover
                clickScale: 0.9,          // Scale down on click
                hoverTint: 0xd63384,      // Darker pink on hover
                clickTint: 0xb02a37,      // Even darker pink on click
                
                // Background image support - Instagram icon
                backgroundImage: 'instagram-icon',
                backgroundImageScale: 'fit',      // Scale to fit within button (now works properly with 50x50 SVG)
                backgroundImageOrigin: { x: 0.5, y: 0.5 }, // Center position
                
                // Click action - open Instagram
                onClick: () => { 
                    console.log('Instagram button clicked!');
                    window.open('https://www.instagram.com', '_blank');
                },
            } as ButtonObject,
            // YouTube button with icon and hover effects
            {
                type: 'button',
                id: 'youtube-btn',
                x: 2140,       // Position next to Instagram button
                y: -40,        // Vertically centered in footer
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',      // Icon mode for social media
                backgroundColor: 0xff0000, // YouTube red background
                borderColor: 0xffffff,    // White border
                
                // Enhanced effects
                hoverScale: 1.2,          // Scale up on hover
                clickScale: 0.9,          // Scale down on click
                hoverTint: 0xdc3545,      // Darker red on hover
                clickTint: 0xb02a37,      // Even darker red on click
                
                // Background image support - YouTube icon
                backgroundImage: 'youtube-icon',
                backgroundImageScale: 'fit',      // Scale to fit within button
                backgroundImageOrigin: { x: 0.5, y: 0.5 }, // Center position
                
                // Click action - open YouTube
                onClick: () => { 
                    console.log('YouTube button clicked!');
                    window.open('https://www.youtube.com', '_blank');
                },
            } as ButtonObject,
            // Zalo button with icon and hover effects
            {
                type: 'button',
                id: 'zalo-btn',
                x: 2210,       // Position next to YouTube button
                y: -40,        // Vertically centered in footer
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',      // Icon mode for social media
                backgroundColor: 0x0068ff, // Zalo blue background
                borderColor: 0xffffff,    // White border
                
                // Enhanced effects
                hoverScale: 1.2,          // Scale up on hover
                clickScale: 0.9,          // Scale down on click
                hoverTint: 0x0056d6,      // Darker blue on hover
                clickTint: 0x0044b3,      // Even darker blue on click
                
                // Background image support - Zalo icon
                backgroundImage: 'zalo-icon',
                backgroundImageScale: 'fit',      // Scale to fit within button
                backgroundImageOrigin: { x: 0.5, y: 0.5 }, // Center position
                
                // Click action - open Zalo
                onClick: () => { 
                    console.log('Zalo button clicked!');
                    window.open('https://zalo.me', '_blank');
                },
            } as ButtonObject,
            // TikTok button with icon and hover effects
            {
                type: 'button',
                id: 'tiktok-btn',
                x: 2280,       // Position next to Zalo button
                y: -40,        // Vertically centered in footer
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',      // Icon mode for social media
                backgroundColor: 0x000000, // TikTok black background
                borderColor: 0xffffff,    // White border
                
                // Enhanced effects
                hoverScale: 1.2,          // Scale up on hover
                clickScale: 0.9,          // Scale down on click
                hoverTint: 0x1a1a1a,      // Lighter black on hover
                clickTint: 0x333333,      // Even lighter black on click
                
                // Background image support - TikTok icon
                backgroundImage: 'tiktok-icon',
                backgroundImageScale: 'fit',      // Scale to fit within button
                backgroundImageOrigin: { x: 0.5, y: 0.5 }, // Center position
                
                // Click action - open TikTok
                onClick: () => { 
                    console.log('TikTok button clicked!');
                    window.open('https://www.tiktok.com', '_blank');
                },
            } as ButtonObject,
        ]
    },
];
