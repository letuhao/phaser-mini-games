// apps/game-frontend/src/config/responsive.autumn.ts
import type { ResponsiveConfig } from '../core/ResponsiveManager';

const groups = {
    bg: ['bg'],
    wheel: ['wheel-root'],              // (placeholder for your future wheel container)
    ui: ['btn-spin', 'btn-rules', 'btn-terms'],
    modal: ['modal-root'],
    fx: ['sun-body', 'sun-rays', 'lensflare', 'leaves', 'rain', 'water', 'ground'],
    brand: ['logo', 'decor-left', 'decor-right']
};

export const AutumnResponsive: ResponsiveConfig = {
    groups,
    fallbackScale: { min: 0.5, max: 1.1 },
    profiles: [
        {
            name: 'xl', priority: 10, condition: { width: { min: 1440 }, aspect: { min: 1.4 } },
            canvas: { width: 1440, height: 810 }, layers: { wheel: { x: 1020, y: 410, scale: 1 }, ui: { scale: 1 }, fx: { maxParticles: 500 } }
        },
        {
            name: 'lg', priority: 20, condition: { width: { min: 1024, max: 1439 } },
            canvas: { width: 1200, height: 675 }, layers: { wheel: { x: 860, y: 360, scale: 0.92 }, ui: { scale: 0.95 }, fx: { maxParticles: 320 } }
        },
        {
            name: 'md', priority: 30, condition: { width: { min: 768, max: 1023 } },
            canvas: { width: 900, height: 1600 }, layers: { wheel: { x: 450, y: 900, scale: 0.78 }, ui: { scale: 1.05 }, fx: { maxParticles: 220 } }
        },
        {
            name: 'sm', priority: 40, condition: { width: { max: 767 }, aspect: { max: 0.75 } },
            canvas: { width: 720, height: 1280 }, layers: { wheel: { x: 360, y: 720, scale: 0.68 }, ui: { scale: 1.1 }, fx: { maxParticles: 150 } }
        },
        {
            name: 'xs', priority: 50, condition: { width: { max: 360 } },
            canvas: { width: 360, height: 640 }, layers: { wheel: { x: 180, y: 360, scale: 0.58 }, ui: { scale: 1.15 }, fx: { maxParticles: 90 }, brand: { visible: false } }
        },
    ]
};
