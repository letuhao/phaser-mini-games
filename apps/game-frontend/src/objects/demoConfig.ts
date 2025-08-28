import { ObjectsConfig } from './types';

// Minimal demo with background at z=0, wheel area at z=10, pointer at z=20
export const DemoObjects: ObjectsConfig = [
    { id: 'bg', type: 'background', z: 0, fill: 0x07131d },

    // must exist and be named 'ground' if rain uses collideWith:'ground'
    { id: 'ground', type: 'ground', z: 2, x: 0, y: 0, width: 10, height: 10, alpha: 0 },

    // Water surface just above ground (appears near bottom)
    {
        id: 'water', type: 'water', z: 3, options: {
            height: 18,       // initial depth
            color: 0x2a7abf, alpha: 0.45,
            risePerHit: 0.6, maxRise: 20, decayPerSec: 4,
            ripple: { life: 650, color: 0x8fd0ff, alpha: 0.7, minRadius: 12, maxRadius: 70, lineWidth: 2 }
        }
    },

    {
        id: 'leaves',
        type: 'leaves',
        z: 2,
        options: {
            count: 30,  // legacy; max fallback if spawn.max not set
            spawn: {
                max: 30,
                startFilled: false,        // gradually fill
                intervalMin: 0.05,
                intervalMax: 0.20,
                initialDelayMin: 0.0,
                initialDelayMax: 0.5,
                jitterX: 24,
                jitterY: 40
            },
            physics: { mode: 'blend', kAir: 0.9, gravity: 30, terminalVy: 320 },
            wind: {
                mode: 'range',
                range: { from: { x: 80, y: 6 }, to: { x: 180, y: 28 } },
                sweep: { durMin: 1.2, durMax: 3.0, holdMin: 0.2, holdMax: 0.8, keepXMin: 50, jitterAmp: 10, jitterFreq: 1.1 }
            },
            flutter: { amp: 26, freq: 1.0 },
            size: { min: 12, max: 28 }
        }
    },

    // Sun (circle motion)
    {
        id: 'sun-body', type: 'sun', z: 39, options: {
            mode: 'circle',
            circle: { cx: 220, cy: 80, r: 120, angularSpeedDeg: 6, phaseDeg: -20, clockwise: true },
            radius: 20, color: 0xfff3c6, glow: { radius: 48, alpha: 0.65, color: 0xffe8aa },
            flicker: { amp: 0.03, freq: 0.25 }
        }
    },

    // Rays that follow the sun (from earlier)
    {
        id: 'sunrays', type: 'sunrays', z: 40, options: {
            source: { x: 0, y: 0 },
            motion: { mode: 'follow', sourceId: 'sun-body', rotateSpeedDeg: 0, jitter: { ampDeg: 0.8, freq: 0.12 } },
            occluders: ['ground', 'water'],
            gradient: {
                layers: 6, stops: [
                    { at: 0.0, color: 0xfffbf0, alpha: 0.9 },
                    { at: 0.5, color: 0xffe8b2, alpha: 0.7 },
                    { at: 1.0, color: 0xf4c677, alpha: 0.5 },
                ]
            }
        }
    },

    // Lens flare sourced from the sun
    {
        id: 'lens', type: 'lensflare', z: 55, options: {
            sourceId: 'sun-body',
            occluders: ['ground', 'water'],
            alpha: 0.9,
            distanceFalloff: 0.6
        }
    },

    // Rain (collide with water first, then ground fallback)
    {
        id: 'rain',
        type: 'rain',
        z: 100,
        options: {
            fallSpeedScale: 1, // 0.5 = half speed (gravity, velocities)
            spawn: {
                max: 100,
                startFilled: false,
                startBurst: 100,
                intervalMin: 0.004,
                intervalMax: 0.010,
                maxPerFrame: 30,
                multiplier: { min: 1, max: 1 },  // ← random batch each tick
                jitterX: 18,
                jitterY: 12,
            },
            // push hard left→right with a bit of range
            wind: {
                from: { x: 140, y: 12 },
                to: { x: 260, y: 26 },
                durMin: 0.7, durMax: 1.8,
                holdMin: 0.1, holdMax: 0.4,
                jitterAmp: 8, jitterFreq: 1.2,
                keepXMin: 120
            },
            gravityY: 1200,
            velocityY: { min: 700, max: 1000 },
            maxVelocityY: 1500,
            mass: { min: 0.8, max: 4.2 },
            size: { min: 6, max: 36 },
            thickness: { min: 1, max: 2 },
            stretch: { k: 2.2, min: 1.0, max: 2.6 },
            collideWithWater: 'water',
            collideWith: 'ground',
            splash: {
                enabled: true,
                particles: 10,
                speed: { min: 120, max: 260 },
                angle: { min: 78, max: 102 }, // strictly up
                lifespan: 200,
                gravityY: 0,
                tint: 0x88ccff,
                puddle: {
                    enabled: true,
                    life: 700,
                    color: 0x66aaff,
                    alpha: 0.3,
                    width: { min: 12, max: 72 },
                    thickness: 2,
                    maxActive: 120
                }
            }
        }
    },

    //A) Default (fixed), just a nicer gradient
    // {
    //     id: 'sun', type: 'sunrays', z: 40, options: {
    //         source: { x: 140, y: 90 },
    //         rays: 12, spreadDeg: 36, length: 1400,
    //         thickness: { min: 60, max: 160, profile: 'center-heavy' },
    //         gradient: {
    //             layers: 7, stops: [
    //                 { at: 0.00, color: 0xfff7da, alpha: 0.9 },
    //                 { at: 0.40, color: 0xffe7b3, alpha: 0.75 },
    //                 { at: 1.00, color: 0xf1c27d, alpha: 0.45 },
    //             ]
    //         },
    //         motion: { mode: 'fixed' },            // default
    //         dimming: { enabled: false }           // default
    //     }
    // },

    // {
    //     id: 'sun', type: 'sunrays', z: 40, options: {
    //         source: { x: 20, y: 20 },               // ignored when following
    //         rays: 20, spreadDeg: 45, length: 2000,
    //         thickness: { min: 50, max: 150, profile: 'center-heavy' },
    //         lengthJitter: 0.2,
    //         gradient: {
    //             layers: 6, stops: [
    //                 { at: 0.0, color: 0xfffbf0, alpha: 0.9 },
    //                 { at: 0.5, color: 0xffe8b2, alpha: 0.7 },
    //                 { at: 1.0, color: 0xf4c677, alpha: 0.5 },
    //             ]
    //         },
    //         motion: {
    //             mode: 'follow',
    //             sourceId: 'sun-body',               // ← the object we’ll add later
    //             offset: { x: 0, y: 0 },
    //             rotateSpeedDeg: 0,                  // rays don't rotate, they just follow
    //             jitter: { ampDeg: 0.8, freq: 0.12 } // tiny life-like shimmer
    //         },
    //         dimming: {
    //             enabled: true,
    //             base: 0.12, amp: 0.10, freq: 0.05, noise: 0.03
    //         },
    //         occluders: ['ground', 'water']
    //     }
    // }

    // {
    //     id: 'title',
    //     type: 'text',
    //     x: 24,
    //     y: 24,
    //     z: 5,
    //     text: 'Levi’s Lucky Spin',
    //     style: { fontSize: '24px', fontFamily: 'system-ui, sans-serif', color: '#ffffff' }
    // },
];
