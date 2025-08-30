import type { ResponsiveConfig } from '../../../core/ResponsiveManager';

export const LevisR3Responsive: ResponsiveConfig = {
    groups: {
        bg: ['bg'],
        containers: ['effects-container', 'footer'],
        footer: ['footer', 'footer-bg', 'footer-text']
    },
    fallbackScale: { min: 0.3, max: 1.2 },
    profiles: [
        {
            name: 'xl', priority: 10, condition: { width: { min: 1440 }, aspect: { min: 1.4 } },
            canvas: { width: 1440, height: 810 }, // 16:9 aspect ratio
            layers: {
                containers: { scale: 0.56 } // 1440/2560 = 0.56
            }
        },
        {
            name: 'lg', priority: 20, condition: { width: { min: 1024, max: 1439 } },
            canvas: { width: 1200, height: 675 }, // 16:9 aspect ratio
            layers: {
                containers: { scale: 0.47 } // 1200/2560 = 0.47
            }
        },
        {
            name: 'md', priority: 30, condition: { width: { min: 768, max: 1023 } },
            canvas: { width: 900, height: 506 }, // 16:9 aspect ratio
            layers: {
                containers: { scale: 0.35 } // 900/2560 = 0.35
            }
        },
        {
            name: 'sm', priority: 40, condition: { width: { max: 767 } },
            canvas: { width: 720, height: 405 }, // 16:9 aspect ratio
            layers: {
                containers: { scale: 0.28 } // 720/2560 = 0.28
            }
        },
        {
            name: 'xs', priority: 50, condition: { width: { max: 360 } },
            canvas: { width: 360, height: 202 }, // 16:9 aspect ratio
            layers: {
                containers: { scale: 0.14 } // 360/2560 = 0.14
            }
        },
    ]
};
