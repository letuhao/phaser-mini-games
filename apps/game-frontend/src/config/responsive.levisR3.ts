import type { ResponsiveConfig } from '../core/ResponsiveManager';

export const LevisR3Responsive: ResponsiveConfig = {
    groups: {
        bg: ['bg', 'bg-img'],
        'fx-back': ['fx-back'],
        'fx-front': ['fx-front'],
        wheel: ['wheel-root'],
        ui: ['ui', 'title', 'btn-spin', 'btn-rules', 'btn-terms'],
        modal: ['modal', 'modal-root'],
        brand: ['brand', 'logo']
    },
    fallbackScale: { min: 0.5, max: 1.1 },
    profiles: [
        {
            name: 'xl', priority: 10, condition: { width: { min: 1440 }, aspect: { min: 1.4 } },
            canvas: { width: 1440, height: 810 },
            layers: {
                wheel: { x: 420, y: 0, scale: 1.0 },
                ui: { x: -420, y: 60, scale: 1.0 },
                'fx-back': { maxParticles: 500 }, 'fx-front': { maxParticles: 500 }
            }
        },
        {
            name: 'lg', priority: 20, condition: { width: { min: 1024, max: 1439 } },
            canvas: { width: 1200, height: 675 },
            layers: {
                wheel: { x: 350, y: 0, scale: 0.92 },
                ui: { x: -380, y: 80, scale: 0.96 },
                'fx-back': { maxParticles: 320 }, 'fx-front': { maxParticles: 320 }
            }
        },
        {
            name: 'md', priority: 30, condition: { width: { min: 768, max: 1023 } },
            canvas: { width: 900, height: 1600 },
            layers: {
                wheel: { x: 0, y: 140, scale: 0.85 },
                ui: { x: 0, y: -520, scale: 1.05 },
                'fx-back': { maxParticles: 220 }, 'fx-front': { maxParticles: 220 }
            }
        },
        {
            name: 'sm', priority: 40, condition: { width: { max: 767 }, aspect: { max: 0.75 } },
            canvas: { width: 720, height: 1280 },
            layers: {
                wheel: { x: 0, y: 80, scale: 0.72 },
                ui: { x: 0, y: -460, scale: 1.1 },
                'fx-back': { maxParticles: 150 }, 'fx-front': { maxParticles: 150 }
            }
        },
        {
            name: 'xs', priority: 50, condition: { width: { max: 360 } },
            canvas: { width: 360, height: 640 },
            layers: {
                wheel: { x: 0, y: 40, scale: 0.58 },
                ui: { x: 0, y: -230, scale: 1.15 },
                brand: { visible: false },
                'fx-back': { maxParticles: 90 }, 'fx-front': { maxParticles: 90 }
            }
        },
    ]
};
