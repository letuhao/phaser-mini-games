import type { ObjectsConfig } from '../objects/types';

// Single deepest background object. It stretches to the canvas size.
export const LevisR3Objects: ObjectsConfig = [
    {
        type: 'background',
        id: 'bg',
        z: 0,
        // Use the loaded 16:9 background image
        textureKey: 'bg-16x9',
        tile: false,
        fit: 'contain', // center the image and preserve aspect ratio
    },
];
