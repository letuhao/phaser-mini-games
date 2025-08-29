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
            // 1) fixed top-left
            pinTo: { corner: 'tl', offsetX: 28, offsetY: 24 },

            radius: 24, color: 0xfff3c6, glow: { radius: 56, alpha: 0.65, color: 0xffe8aa },
            flicker: { amp: 0.03, freq: 0.25 },

            // 2) animated aura with irregular edges
            aura: {
                enabled: true,
                rate: 0.6,
                life: { min: 900, max: 1600 },
                radius: { min: 1.08, max: 1.5 }, // × glow.radius
                thickness: { min: 10, max: 18 },
                edges: { min: 16, max: 44 },
                jitter: 0.25,
                color: 0xffdfbb,
                alpha: { min: 0.18, max: 0.3 },
                rotDegPerSec: { min: -8, max: 8 },
                blend: 'add'
            },

            // 3) surface speckle (procedural, no texture needed)
            spackle: {
                enabled: true,
                rate: 4,
                maxAlive: 80,
                size: { min: 10, max: 26 },
                life: { min: 600, max: 1200 },
                brightenChance: 1,
                brightColor: 0xfffbe0,
                alpha: { min: 0.55, max: 0.85 },
                textureKey: 'sun-speckle1',
                autoCenter: true,
                clampToDisk: true
            }
        }
    },

    // Rays that follow the sun (from earlier)
    // {
    //     id: 'sunrays', type: 'sunrays', z: 40, options: {
    //         source: { x: 0, y: 0 },
    //         motion: { mode: 'follow', sourceId: 'sun-body', rotateSpeedDeg: 0, jitter: { ampDeg: 0.8, freq: 0.12 } },
    //         occluders: ['ground', 'water'],
    //         gradient: {
    //             layers: 6, stops: [
    //                 { at: 0.0, color: 0xfffbf0, alpha: 0.9 },
    //                 { at: 0.5, color: 0xffe8b2, alpha: 0.7 },
    //                 { at: 1.0, color: 0xf4c677, alpha: 0.5 },
    //             ]
    //         }
    //     }
    // },

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
