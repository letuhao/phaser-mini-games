import Phaser from 'phaser';
import { WindField, WindOptions } from './Wind';

export type PhysicsMode = 'blend' | 'drag2';

export type PhysicsOptions = {
    mode?: PhysicsMode;     // default 'blend'
    kAir?: number;          // how fast v blends to wind (s^-1), 'blend' mode
    gravity?: number;       // px/s^2 (downwards)
    terminalVy?: number;    // vertical clamp (px/s)
    // 'drag2' extras (kept, but tuned tiny so pixels don't explode)
    airDensity?: number;
    dragCoeff?: number;
    liftCoeff?: number;
};

export type SpawnOptions = {
    max?: number;               // max concurrent leaves (default = options.count or 40)
    startFilled?: boolean;      // spawn all quickly at boot (staggered), default false
    intervalMin?: number;       // seconds between spawns (min)
    intervalMax?: number;       // seconds between spawns (max)
    initialDelayMin?: number;   // delay before first spawn (min)
    initialDelayMax?: number;   // delay before first spawn (max)
    jitterX?: number;           // extra ± jitter at spawn for x
    jitterY?: number;           // extra ± jitter at spawn for y (avoid same y)
    burstSize?: number;         // optional small burst size when startFilled=true
};

export type LeavesOptions = {
    count?: number;               // number of leaves alive
    spawnArea?: 'full' | 'top' | 'top-edge';
    textures?: string[];          // optional texture keys; if empty uses vector-drawn leaves
    size?: { min: number; max: number };  // display size range (px)
    spin?: { min: number; max: number };  // deg/s
    flutter?: { amp: number; freq: number }; // lateral flutter
    drag?: number;                // 0..1, velocity damping per second
    respawn?: boolean;            // recycle leaves when off-screen
    z?: number;                   // display depth
    wind?: WindOptions;           // wind field config
    physics?: PhysicsOptions;     // gravity physics (optional; experimental)
    spawn?: SpawnOptions;         // advanced spawn control (optional)
};

type Leaf = {
    s: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform &
    Phaser.GameObjects.Components.Origin & Phaser.GameObjects.Components.Alpha &
    Phaser.GameObjects.Components.ComputedSize;
    vx: number;
    vy: number;
    spin: number;      // deg/s
    flutterPhase: number;
    flutterFreq: number;
    flutterAmp: number;
    size: number;
    mass: number;   // kg-ish arbitrary units
    area: number;   // cross-section ~ size^2 scaling
};

export class AutumnLeaves {
    private scene: Phaser.Scene;
    private leaves: Leaf[] = [];
    private wind: WindField;
    private opts: Required<LeavesOptions>;
    private time = 0;
    private nextSpawnAt = 0;

    constructor(scene: Phaser.Scene, opts: LeavesOptions = {}) {
        this.scene = scene;
        const defaults = {
            count: 40,
            spawnArea: 'top-edge' as const,
            textures: [] as string[],
            size: { min: 10, max: 26 },
            spin: { min: -60, max: 60 },
            flutter: { amp: 35, freq: 1.2 },
            drag: 0.12,                   // legacy damping (kept for subtle smoothing)
            respawn: true,
            z: 2,
            wind: { base: 70, variance: 100, vertical: -18, gustSpeed: 0.35, heightInfluence: 0.3, seed: 2025 },
            physics: {
                mode: 'blend' as const,
                kAir: 1.0,            // how quickly we follow wind (1/s)
                gravity: 28,          // fall speed
                terminalVy: 320,      // max |vy|
                // drag2 params (only used if mode='drag2')
                airDensity: 0.0015,
                dragCoeff: 0.9,
                liftCoeff: 0.05
            } satisfies PhysicsOptions,
            spawn: {
                max: (opts.count ?? 40),
                startFilled: false,
                intervalMin: 0.06,
                intervalMax: 0.28,
                initialDelayMin: 0.0,
                initialDelayMax: 0.6,
                jitterX: 24,
                jitterY: 32,
                burstSize: 8,
            } as SpawnOptions
        };

        const o = opts ?? {};

        this.opts = {
            count: o.count ?? defaults.count,
            spawnArea: (o.spawnArea ?? defaults.spawnArea),
            textures: o.textures ?? defaults.textures,

            size: { min: o.size?.min ?? defaults.size.min, max: o.size?.max ?? defaults.size.max },
            spin: { min: o.spin?.min ?? defaults.spin.min, max: o.spin?.max ?? defaults.spin.max },
            flutter: { amp: o.flutter?.amp ?? defaults.flutter.amp, freq: o.flutter?.freq ?? defaults.flutter.freq },

            // legacy damping (kept)
            drag: o.drag ?? defaults.drag,
            respawn: o.respawn ?? defaults.respawn,
            z: o.z ?? defaults.z,

            wind: {
                base: o.wind?.base ?? defaults.wind.base,
                variance: o.wind?.variance ?? defaults.wind.variance,
                vertical: o.wind?.vertical ?? defaults.wind.vertical,
                gustSpeed: o.wind?.gustSpeed ?? defaults.wind.gustSpeed,
                heightInfluence: o.wind?.heightInfluence ?? defaults.wind.heightInfluence,
                seed: o.wind?.seed ?? defaults.wind.seed
            },

            physics: {
                gravity: o.physics?.gravity ?? (o as any).gravity ?? defaults.physics.gravity, // keep legacy gravity if passed
                airDensity: o.physics?.airDensity ?? defaults.physics.airDensity,
                dragCoeff: o.physics?.dragCoeff ?? defaults.physics.dragCoeff,
                liftCoeff: o.physics?.liftCoeff ?? defaults.physics.liftCoeff,
                terminalVy: o.physics?.terminalVy ?? defaults.physics.terminalVy
            },

            spawn: {
                max: o.spawn?.max ?? defaults.spawn.max,
                startFilled: o.spawn?.startFilled ?? defaults.spawn.startFilled,
                intervalMin: o.spawn?.intervalMin ?? defaults.spawn.intervalMin,
                intervalMax: o.spawn?.intervalMax ?? defaults.spawn.intervalMax,
                initialDelayMin: o.spawn?.initialDelayMin ?? defaults.spawn.initialDelayMin,
                initialDelayMax: o.spawn?.initialDelayMax ?? defaults.spawn.initialDelayMax,
                jitterX: o.spawn?.jitterX ?? defaults.spawn.jitterX,
                jitterY: o.spawn?.jitterY ?? defaults.spawn.jitterY,
                burstSize: o.spawn?.burstSize ?? defaults.spawn.burstSize,
            }
        } as const;

        this.wind = new WindField(this.opts.wind);
        this.spawnInitial();
        this.scene.events.on('update', this.update, this);
        this.scene.scale.on('resize', () => this.onResize());
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        for (const l of this.leaves) l.s.destroy();
        this.leaves.length = 0;
    }

    private spawnInitial() {
        const max = this.opts.spawn.max ?? this.opts.count;
        // Start empty (preferred) or do a small burst
        if (this.opts.spawn.startFilled) {
            const burst = Math.min(this.opts.spawn.burstSize ?? 8, max);
            for (let i = 0; i < burst; i++) {
                this.leaves.push(this.makeLeaf(this.randomSpawnX(), this.randomSpawnY(true)));
            }
        }
        // schedule the first timed spawn
        this.time = 0;
        this.nextSpawnAt = this.rnd(
            this.opts.spawn.initialDelayMin ?? 0,
            this.opts.spawn.initialDelayMax ?? 0.5
        );
    }

    private onResize() {
        // no-op; leaves naturally continue with new bounds
    }

    private rnd(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    private randomSpawnX() {
        const w = this.scene.scale.width;
        const jx = (this.opts.spawn.jitterX ?? 0) * (Math.random() * 2 - 1);
        return this.rnd(-w * 0.05, w * 1.05) + jx; // slight overhang + jitter
    }

    private randomSpawnY(initial = false) {
        const h = this.scene.scale.height;
        const jy = (this.opts.spawn.jitterY ?? 0) * (Math.random() * 2 - 1);
        switch (this.opts.spawnArea) {
            case 'full': return initial ? this.rnd(0, h) + jy : -20 + jy;
            case 'top': return initial ? this.rnd(0, h * 0.3) + jy : -20 + jy;
            case 'top-edge':
            default: return -20 + jy;
        }
    }

    private makeVectorLeaf(size: number, tint: number) {
        // Simple stylized leaf using a triangle/quad Bezier-ish shape
        const g = this.scene.add.graphics();
        g.fillStyle(tint, 1);
        g.slice(0, 0, size, Phaser.Math.DegToRad(-30), Phaser.Math.DegToRad(210), false).fillPath();
        g.lineStyle(1, 0x000000, 0.25).strokeCircle(0, 0, size * 0.5);
        return g;
    }

    private makeSpriteLeaf(key: string, size: number, tint?: number) {
        const img = this.scene.add.image(0, 0, key);
        img.setDisplaySize(size, size);
        if (tint !== undefined) img.setTint(tint);
        return img;
    }

    private makeLeaf(x: number, y: number): Leaf {
        const size = Math.round(this.rnd(this.opts.size.min, this.opts.size.max));
        const spin = this.rnd(this.opts.spin.min, this.opts.spin.max);
        const flutterAmp = this.opts.flutter.amp * this.rnd(0.6, 1.2);
        const flutterFreq = this.opts.flutter.freq * this.rnd(0.8, 1.4);
        const flutterPhase = Math.random() * Math.PI * 2;

        // Basic mass/area scaling by size (tweak multipliers to taste)
        const area = (size * size) * 0.6;       // ~px^2
        const mass = Math.max(0.6, size * 0.05); // arbitrary units; bigger = heavier

        let obj: any;
        if (this.opts.textures.length > 0) {
            // pick a texture; optionally tint to get a few colors
            const key = this.opts.textures[Math.floor(Math.random() * this.opts.textures.length)];
            const palettes = [0xC67D2B, 0x9F3D27, 0xD9A441, 0x7A4A2C, 0xB85C38];
            obj = this.makeSpriteLeaf(key, size, palettes[Math.floor(Math.random() * palettes.length)]);
        } else {
            const palettes = [0xC67D2B, 0x9F3D27, 0xD9A441, 0x7A4A2C, 0xB85C38];
            obj = this.makeVectorLeaf(size, palettes[Math.floor(Math.random() * palettes.length)]);
        }

        obj.setPosition(x, y);
        obj.setAlpha(this.rnd(0.85, 1));
        obj.setDepth(this.opts.z);

        // Small random initial velocity to avoid uniform motion
        const vx = this.rnd(-20, 20);
        const vy = this.rnd(10, 30);

        return { s: obj, vx: vx, vy: vy, spin, flutterPhase, flutterFreq, flutterAmp, size, mass, area };
    }

    private respawnLeaf(l: Leaf) {
        const x = this.randomSpawnX();
        const y = this.randomSpawnY();
        l.s.setPosition(x, y);
        l.vx = this.rnd(-15, 15);
        l.vy = this.rnd(10, 30);
        l.spin = this.rnd(this.opts.spin.min, this.opts.spin.max);
        l.flutterAmp = this.opts.flutter.amp * this.rnd(0.6, 1.2);
        l.flutterFreq = this.opts.flutter.freq * this.rnd(0.8, 1.4);
        l.flutterPhase = Math.random() * Math.PI * 2;
        l.s.setAlpha(this.rnd(0.85, 1));
        // randomize size a bit
        const size = Math.round(this.rnd(this.opts.size.min, this.opts.size.max));
        // update mass/area on respawn:
        l.area = (size * size) * 0.6;
        l.mass = Math.max(0.6, size * 0.05);
        l.size = size;
        if ((l.s as any).setDisplaySize) (l.s as any).setDisplaySize(size, size);
    }

    update(_time: number, _delta: number) {
        const dt = Math.min(0.05, this.scene.game.loop.delta / 1000);

        // --- spawn scheduler ---
        this.time += dt;
        const max = this.opts.spawn.max ?? this.opts.count;
        while (this.leaves.length < max && this.time >= this.nextSpawnAt) {
            // spawn one leaf
            this.leaves.push(this.makeLeaf(this.randomSpawnX(), this.randomSpawnY(false)));
            // schedule next spawn
            const gap = this.rnd(
                this.opts.spawn.intervalMin ?? 0.06,
                this.opts.spawn.intervalMax ?? 0.28
            );
            this.nextSpawnAt = this.time + gap;
        }

        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        this.wind.update(dt);

        const { mode, kAir, gravity, terminalVy, airDensity, dragCoeff, liftCoeff } = this.opts.physics;

        for (const l of this.leaves) {
            const o = l.s as any;
            const x = o.x as number;
            const y = o.y as number;

            const W = this.wind.sample(x, y, h);

            if (mode === 'blend' || !mode) {
                // Pull velocity toward the wind smoothly, then add gravity
                const k = kAir ?? 1.0;       // s^-1
                l.vx += (W.x - l.vx) * k * dt;
                l.vy += (W.y - l.vy) * (k * 0.6) * dt;  // slightly softer vertically
                l.vy += (gravity ?? 28) * dt;
            } else {
                // Quadratic drag mode (tuned tiny so pixels don’t explode)
                const vrx = W.x - l.vx;
                const vry = W.y - l.vy;
                const vr2 = vrx * vrx + vry * vry;
                const vr = Math.sqrt(vr2) + 1e-6;

                const rho = airDensity ?? 0.0015;   // tiny because px units
                const Cd = dragCoeff ?? 0.9;
                const Cl = liftCoeff ?? 0.05;

                // area/mass already on leaf; tiny constant via small rho
                const Fd = 0.5 * rho * Cd * l.area * vr2;
                const Fl = 0.5 * rho * Cl * l.area * vr2;

                const ax = (Fd * (vrx / vr) + Fl * (-vry / vr)) / l.mass;
                const ay = (Fd * (vry / vr) + Fl * (vrx / vr)) / l.mass + (gravity ?? 28);

                l.vx += ax * dt;
                l.vy += ay * dt;
            }

            // Flutter micro wobble (light)
            l.flutterPhase += l.flutterFreq * dt * 2 * Math.PI;
            l.vx += Math.sin(l.flutterPhase) * (l.flutterAmp * 0.04);

            // Terminal vertical
            const tVy = terminalVy ?? 320;
            if (l.vy > tVy) l.vy = tVy;
            if (l.vy < -tVy) l.vy = -tVy;

            // Integrate position
            o.x = x + l.vx * dt;
            o.y = y + l.vy * dt;

            if (o.rotation !== undefined) o.rotation += Phaser.Math.DegToRad(l.spin) * dt;

            // Recycle
            const margin = Math.max(40, l.size * 2);
            if (o.y > h + margin || o.x < -margin || o.x > w + margin) this.respawnLeaf(l);
        }
    }

}
