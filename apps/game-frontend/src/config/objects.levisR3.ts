import type { ObjectsConfig } from '../objects/types';

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
];
