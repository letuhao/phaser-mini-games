import type { ResponsiveConfig } from '../core/ResponsiveManager';

export const LevisR3Responsive: ResponsiveConfig = {
    groups: {
        bg: ['bg']
    },
    fallbackScale: { min: 0.5, max: 1.1 },
    profiles: [
        {
            name: 'xl', priority: 10, condition: { width: { min: 1440 }, aspect: { min: 1.4 } },
            canvas: { width: 1440, height: 810 }, // 16:9 aspect ratio
            layers: {}
        },
        {
            name: 'lg', priority: 20, condition: { width: { min: 1024, max: 1439 } },
            canvas: { width: 1200, height: 675 }, // 16:9 aspect ratio
            layers: {}
        },
        {
            name: 'md', priority: 30, condition: { width: { min: 768, max: 1023 } },
            canvas: { width: 900, height: 506 }, // 16:9 aspect ratio (was 1600, causing distortion)
            layers: {}
        },
        {
            name: 'sm', priority: 40, condition: { width: { max: 767 }, aspect: { max: 0.75 } },
            canvas: { width: 720, height: 405 }, // 16:9 aspect ratio (was 1280, causing distortion)
            layers: {}
        },
        {
            name: 'xs', priority: 50, condition: { width: { max: 360 } },
            canvas: { width: 360, height: 202 }, // 16:9 aspect ratio (was 640, causing distortion)
            layers: {}
        },
    ]
};
