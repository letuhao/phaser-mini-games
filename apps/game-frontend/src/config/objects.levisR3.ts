import type { ObjectsConfig, RectObject, TextObject } from '../objects/types';

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
                    fontSize: '20px', // Text size - adjust this to change text height
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
        ]
    },
];
