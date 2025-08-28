// apps/game-frontend/src/effects/Rain.ts
import Phaser from 'phaser';

type Drop = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

export type RainOptions = {
    spawn?: {
        max?: number;
        startFilled?: boolean;
        startBurst?: number;
        intervalMin?: number;
        intervalMax?: number;
        initialDelayMin?: number;
        initialDelayMax?: number;
        jitterX?: number;
        jitterY?: number;
        maxPerFrame?: number;
        /** how many drops to create per spawn tick (default 10) */
        multiplier?: number | { min: number; max: number }; // was: number
    };
    /** scale 0..1 to slow falling globally; 0.5 = 50% speed */
    fallSpeedScale?: number;
    size?: { min: number; max: number };
    thickness?: { min: number; max: number };
    mass?: { min: number; max: number };
    gravityY?: number;
    velocityY?: { min: number; max: number };
    maxVelocityY?: number;
    stretch?: { k: number; min?: number; max?: number };
    wind?: {
        from: { x: number; y: number };
        to: { x: number; y: number };
        durMin?: number; durMax?: number;
        holdMin?: number; holdMax?: number;
        jitterAmp?: number; jitterFreq?: number;
        keepXMin?: number;
    };
    collideWithWater?: string; // e.g. 'water' (NEW)
    collideWith?: string; // e.g. 'ground'
    splash?: {
        enabled?: boolean;
        particles?: number;
        speed?: { min: number; max: number };
        angle?: { min: number; max: number };
        lifespan?: number;
        gravityY?: number;
        tint?: number;
        /** raise splash/puddle this many pixels above ground top */
        offsetAbove?: number;              // ← add this (default 4)
        puddle?: {
            enabled?: boolean;
            life?: number;
            color?: number;
            alpha?: number;
            width?: { min: number; max: number };
            thickness?: number;
            maxActive?: number;
        };
    };
};

type SpawnOpts = {
    max: number;
    startFilled: boolean;
    startBurst: number;
    intervalMin: number;
    intervalMax: number;
    initialDelayMin: number;
    initialDelayMax: number;
    jitterX: number;
    jitterY: number;
    maxPerFrame: number;
    multiplier: { min: number; max: number };
};

type WindOpts = {
    from: { x: number; y: number };
    to: { x: number; y: number };
    durMin: number; durMax: number;
    holdMin: number; holdMax: number;
    jitterAmp: number; jitterFreq: number;
    keepXMin: number;
};

type SplashPuddleOpts = {
    enabled: boolean;
    life: number;
    color: number;
    alpha: number;
    width: { min: number; max: number };
    thickness: number;
    maxActive: number;
};

type SplashOpts = {
    enabled: boolean;
    particles: number;
    speed: { min: number; max: number };
    angle: { min: number; max: number };
    lifespan: number;
    gravityY: number;
    tint: number;
    puddle: SplashPuddleOpts;
    offsetAbove: number;
};

type ResolvedRainOptions = {
    spawn: SpawnOpts;
    size: { min: number; max: number };
    thickness: { min: number; max: number };
    mass: { min: number; max: number };
    gravityY: number;
    velocityY: { min: number; max: number };
    maxVelocityY: number;
    stretch: { k: number; min: number; max: number };
    wind: WindOpts;
    collideWith?: string;
    splash: SplashOpts;
    fallSpeedScale: number;
};

function resolveOptions(o: RainOptions | undefined): ResolvedRainOptions {
    const d: ResolvedRainOptions = {
        spawn: {
            max: 500,
            startFilled: true,
            startBurst: 250,
            intervalMin: 0.004,
            intervalMax: 0.012,
            initialDelayMin: 0,
            initialDelayMax: 0.08,
            jitterX: 18,
            jitterY: 12,
            maxPerFrame: 64,
            multiplier: { min: 1, max: 10 },   // default behaves like fixed 10
        },
        fallSpeedScale: 0.5,
        size: { min: 12, max: 26 },
        thickness: { min: 1, max: 2 },
        mass: { min: 1.8, max: 4.2 },
        gravityY: 1900,
        velocityY: { min: 400, max: 750 },
        maxVelocityY: 1100,
        stretch: { k: 2.2, min: 1.0, max: 2.6 },
        wind: {
            from: { x: 120, y: 12 },
            to: { x: 220, y: 26 },
            durMin: 0.8, durMax: 2.0,
            holdMin: 0.1, holdMax: 0.5,
            jitterAmp: 8, jitterFreq: 1.2,
            keepXMin: 80
        },
        collideWith: 'ground',
        splash: {
            enabled: true,
            particles: 10,
            speed: { min: 100, max: 260 },
            angle: { min: 260, max: 280 },
            lifespan: 160,
            gravityY: 0,
            tint: 0x88ccff,
            offsetAbove: 4,                 // ← default lift
            puddle: {
                enabled: true,
                life: 700,
                color: 0x66aaff,
                alpha: 0.5,
                width: { min: 24, max: 64 },
                thickness: 2,
                maxActive: 100
            }
        }
    };

    if (!o) return d;

    return {
        spawn: {
            ...d.spawn, ...(o.spawn ?? {}),
            // normalize to {min,max}
            multiplier: typeof o.spawn?.multiplier === 'number'
                ? { min: o.spawn.multiplier, max: o.spawn.multiplier }
                : (o.spawn?.multiplier
                    ? {
                        min: Math.max(1, Math.floor(o.spawn.multiplier.min)),
                        max: Math.max(1, Math.floor(o.spawn.multiplier.max))
                    }
                    : d.spawn.multiplier)
        },
        fallSpeedScale: o.fallSpeedScale ?? d.fallSpeedScale,
        size: { ...d.size, ...(o.size ?? {}) },
        thickness: { ...d.thickness, ...(o.thickness ?? {}) },
        mass: { ...d.mass, ...(o.mass ?? {}) },
        gravityY: o.gravityY ?? d.gravityY,
        velocityY: { ...d.velocityY, ...(o.velocityY ?? {}) },
        maxVelocityY: o.maxVelocityY ?? d.maxVelocityY,
        stretch: { ...d.stretch, ...(o.stretch ?? {}) },
        wind: { ...d.wind, ...(o.wind ?? {}) },
        collideWith: o.collideWith ?? d.collideWith,
        splash: {
            ...d.splash,
            ...(o.splash ?? {}),
            puddle: { ...d.splash.puddle, ...(o.splash?.puddle ?? {}) }
        }
    };
}

export class RainSystem {
    private opts: ResolvedRainOptions;
    private depth: number;
    private findById?: (id: string) => any;

    private drops: Drop[] = [];
    private time = 0;
    private nextSpawnAt = 0;

    // wind sweep state
    private curWind = { x: 120, y: 16 };
    private startWind = { x: 120, y: 16 };
    private targetWind = { x: 160, y: 22 };
    private sweepT = 0;
    private sweepDur = 1.5;
    private holdLeft = 0;

    private activePuddles: Phaser.GameObjects.Graphics[] = [];
    private groundObj: any | null = null;
    // kill Y for off-screen recycle or fallback ground hit
    private killY: number = Infinity;

    private waterObj: any | null = null;
    private waterApi: any | null = null;
    private waterKillY: number = Infinity;

    private waterColliderGO: any | null = null;

    private dbg = { enabled: false, every: 0.1 }; // update every 0.1s
    private dbgGfx!: Phaser.GameObjects.Graphics;
    private dbgText!: Phaser.GameObjects.Text;
    private dbgAccum = 0;
    private dbgSampleIndex = 0; // which drop to track

    constructor(
        private scene: Phaser.Scene,
        options: RainOptions | undefined,
        depth = 3,
        findById?: (id: string) => any
    ) {
        this.opts = resolveOptions(options);
        this.depth = depth;
        this.findById = findById;

        // resolve ground once (object or name)
        if (this.opts.collideWith && this.findById) {
            this.groundObj = this.findById(this.opts.collideWith);
        }

        // Apply global fall speed scaling (affects gravity & vertical velocities)
        const fs = this.opts.fallSpeedScale; // e.g., 0.5 for 50%
        this.opts.gravityY = this.opts.gravityY * fs;
        this.opts.maxVelocityY = this.opts.maxVelocityY * fs;
        this.opts.velocityY = {
            min: this.opts.velocityY.min * fs,
            max: this.opts.velocityY.max * fs
        };

        // first sweep
        this.resetWind(true);

        // schedule
        this.time = 0;
        this.nextSpawnAt = this.rand(this.opts.spawn.initialDelayMin, this.opts.spawn.initialDelayMax);

        if (this.opts.spawn.startFilled) {
            const burst = Math.min(this.opts.spawn.startBurst, this.opts.spawn.max);
            for (let i = 0; i < burst; i++) this.spawnOne(true);
        }

        this.scene.events.on('update', this.update, this);

        if (this.findById && (this.opts as any).collideWithWater) {
            this.waterObj = this.findById((this.opts as any).collideWithWater);
            this.waterApi = this.waterObj ? (this.waterObj as any).__water : null;
            this.waterColliderGO = this.waterApi?.getGameObject?.() ?? this.waterObj; // ⬅️ use the rect if available
        }
        this.refreshKillY();
        this.refreshWaterKillY();
        this.scene.scale.on('resize', this.refreshWaterKillY, this);

        if (this.dbg.enabled) {
            this.dbgGfx = this.scene.add.graphics().setDepth(10000);
            this.dbgText = this.scene.add.text(8, 8, '', {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#00ff99'
            }).setScrollFactor(0).setDepth(10000);
        }
    }

    public setDebug(on: boolean) {
        this.dbg.enabled = on;
        this.dbgGfx?.setVisible(on);
        this.dbgText?.setVisible(on);
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        this.drops.forEach(d => d.destroy());
        this.activePuddles.forEach(g => g.destroy());
        this.activePuddles.length = 0;
    }

    // ---------- Wind ----------
    private resetWind(init = false) {
        const w = this.opts.wind;
        const from = w.from, to = w.to, keepX = w.keepXMin;

        const sameX = from.x === to.x;
        const sameY = from.y === to.y;

        if (init) {
            this.curWind.x = Math.max(keepX, from.x);
            this.curWind.y = from.y;
        }

        this.startWind = { ...this.curWind };
        this.targetWind = {
            x: Math.max(keepX, sameX ? from.x : this.rand(from.x, to.x)),
            y: sameY ? from.y : this.rand(from.y, to.y)
        };

        this.sweepDur = this.rand(this.opts.wind.durMin, this.opts.wind.durMax);
        this.sweepT = 0;
        this.holdLeft = 0;
    }

    private updateWind(dt: number) {
        if (this.holdLeft > 0) {
            this.holdLeft -= dt;
            if (this.holdLeft <= 0) this.resetWind();
            return;
        }
        this.sweepT += dt;
        const k = this.clamp(this.sweepT / Math.max(0.0001, this.sweepDur), 0, 1);
        const ease = k * k * (3 - 2 * k);
        this.curWind.x = this.startWind.x + (this.targetWind.x - this.startWind.x) * ease;
        this.curWind.y = this.startWind.y + (this.targetWind.y - this.startWind.y) * ease;

        if (k >= 1) {
            this.holdLeft = this.rand(this.opts.wind.holdMin, this.opts.wind.holdMax);
            if (this.holdLeft <= 0) this.resetWind();
        }

        // add jitter
        const t = performance.now() / 1000;
        this.curWind.x += Math.sin(t * (this.opts.wind.jitterFreq)) * this.opts.wind.jitterAmp;
        this.curWind.y += Math.cos(t * (this.opts.wind.jitterFreq) * 0.8) * this.opts.wind.jitterAmp * 0.35;

        // enforce left→right
        this.curWind.x = Math.max(this.opts.wind.keepXMin, this.curWind.x);
    }

    // ---------- Spawning ----------
    private spawnOne(initial = false) {
        const { width, height } = this.scene.scale;
        const jx = this.opts.spawn.jitterX, jy = this.opts.spawn.jitterY;

        const x = this.rand(-width * 0.05, width * 1.05) + this.rand(-jx, jx);
        const y = (initial ? this.rand(0, height * 0.3) : -20) + this.rand(-jy, jy);

        const thick = this.randi(this.opts.thickness.min, this.opts.thickness.max);
        const len = this.randi(this.opts.size.min, this.opts.size.max);
        const mass = this.rand(this.opts.mass.min, this.opts.mass.max);

        const drop = this.scene.physics.add.image(x, y, 'px') as Drop;
        drop.setDisplaySize(thick, len);
        drop.setOrigin(0.5, 0.5);
        drop.setBlendMode(Phaser.BlendModes.ADD);
        drop.setTint(0x8ecbff);
        drop.setDepth(this.depth);

        drop.setGravityY(this.opts.gravityY);                  // <— Arcade applies this every tick
        const v0 = this.rand(this.opts.velocityY.min, this.opts.velocityY.max);
        drop.setVelocityY(Math.max(0, v0));  // downward (canvas y+)
        drop.setMaxVelocity(this.curWind.x * 2, this.opts.maxVelocityY); // <— clamp vy
        drop.setBounce(0).setDamping(true).setDrag(0, 0).setMass(mass);

        if (this.dbg.enabled && this.drops.length <= 3) {
            const b = drop.body as Phaser.Physics.Arcade.Body;
            console.debug('[RAIN] spawn', {
                x: drop.x, y: drop.y,
                gY: this.opts.gravityY,
                vY0: b.velocity.y
            });
        }

        // collider with ground (inside RainSystem — we have the drop here)
        if (this.waterColliderGO) {
            this.scene.physics.add.collider(
                drop,
                this.waterColliderGO as any,
                (_drop: any, water: any) => this.hitWater(drop, water)
            );
        }

        if (this.waterObj) {
            this.scene.physics.add.collider(
                drop,
                this.waterObj as any,
                (_drop: any, water: any) => this.hitWater(drop, water)
            );
        }

        if (this.groundObj) {
            this.scene.physics.add.collider(
                drop,
                this.groundObj as any,
                (_drop: any, ground: any) => this.hitGround(drop, ground)
            );
        }

        this.applyStretch(drop);
        this.drops.push(drop);
    }

    private refreshKillY() {
        const g = this.groundObj;
        if (!g) { this.killY = this.scene.scale.height + 999; return; }

        // prefer physics body .top
        const body = (g as any).body as Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | undefined;
        if (body && typeof (body as any).top === 'number') { this.killY = (body as any).top + 1; return; }

        // then bounds
        const boundsTop = (g as any).getBounds?.().top;
        if (typeof boundsTop === 'number') { this.killY = boundsTop + 1; return; }

        // fallback
        this.killY = (typeof (g as any).y === 'number' ? (g as any).y : this.scene.scale.height - 10) + 1;
    }

    private hitGround(d: Drop, groundGO?: any) {
        const gy =
            groundGO?.body?.top ??
            groundGO?.getBounds?.().top ??
            groundGO?.y ?? d.y;

        const lift = this.opts.splash.offsetAbove ?? 4; // 3–5 px is ideal
        const impactY = gy - lift;

        this.spawnSplash(d.x, impactY);
        d.destroy();
        const ix = this.drops.indexOf(d);
        if (ix >= 0) this.drops.splice(ix, 1);
    }

    private refreshWaterKillY() {
        const wGO = this.waterColliderGO ?? this.waterObj;
        if (!wGO) { this.waterKillY = Infinity; return; }

        // prefer WaterSurface API (tracks rising/decay)
        const apiTop = this.waterApi?.getTopY?.();
        if (typeof apiTop === 'number') { this.waterKillY = apiTop + 1; return; }

        const body = (wGO as any).body as Phaser.Physics.Arcade.StaticBody | undefined;
        if (body && typeof (body as any).top === 'number') { this.waterKillY = (body as any).top + 1; return; }

        const boundsTop = (wGO as any).getBounds?.().top;
        this.waterKillY = (typeof boundsTop === 'number' ? boundsTop : this.scene.scale.height - 10) + 1;
    }

    private hitWater(d: Drop, waterGO?: any) {
        // top of water, lifted slightly
        const top = this.waterApi?.getTopY?.()
            ?? waterGO?.body?.top
            ?? waterGO?.getBounds?.().top
            ?? waterGO?.y
            ?? d.y;

        const lift = (this.opts as any).splash?.offsetAbove ?? 4;
        const y = top - lift;

        // tell water to bump & ripple (handled by WaterSurface)
        this.waterApi?.bumpAt?.(d.x);

        // no jet/puddle particles here; the surface handles visuals
        d.destroy();
        const ix = this.drops.indexOf(d);
        if (ix >= 0) this.drops.splice(ix, 1);
    }

    private spawnSplash(x: number, y: number) {
        const sp = this.opts.splash;
        if (!sp.enabled) return;

        // Derive ranges so Y is always UP (negative), X is small sideways fan-out.
        const sMin = sp.speed.min;           // e.g., 100
        const sMax = sp.speed.max;           // e.g., 260
        const xFan = Math.max(30, sMax * 0.4);

        const emitter = this.scene.add.particles(0, 0, 'px', {
            frequency: -1,                     // paused; we trigger once
            quantity: 1,
            // 🔒 Ensure UPWARD motion only:
            speedX: { min: -xFan, max: xFan }, // small sideways spread
            speedY: { min: -sMax, max: -sMin },// always negative (UP)
            lifespan: sp.lifespan,             // short life so they vanish quickly
            gravityY: 0,                       // no falling back down
            scale: { start: 0.9, end: 0 },
            tint: sp.tint,
            alpha: { start: 1, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
        });

        (emitter as any).emitParticleAt(x, y, sp.particles);
        this.scene.time.delayedCall(sp.lifespan + 100, () => emitter.destroy());

        // --- Puddle stays on ground and fades ---
        const pd = sp.puddle;
        if (pd.enabled) {
            if (this.activePuddles.length >= pd.maxActive) {
                const oldest = this.activePuddles.shift(); oldest?.destroy();
            }
            const g = this.scene.add.graphics().setDepth(this.depth);
            g.setPosition(x, y);
            g.fillStyle(pd.color, pd.alpha);
            const baseW = 8;
            const thick = Math.max(1, pd.thickness);
            g.fillEllipse(0, 0, baseW, thick);
            g.setScale(0.25, 1);
            this.activePuddles.push(g);

            const targetW = this.rand(pd.width.min, pd.width.max);
            const scaleX = targetW / baseW;

            this.scene.tweens.add({
                targets: g,
                scaleX,
                alpha: 0,
                duration: pd.life,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    const i = this.activePuddles.indexOf(g);
                    if (i >= 0) this.activePuddles.splice(i, 1);
                    g.destroy();
                }
            });
        }
    }

    // ---------- Frame update ----------
    update(_time: number, _delta: number) {
        const dt = Math.min(0.05, this.scene.game.loop.delta / 1000);

        // 🔧 Always refresh (ground may be resized/moved; water level changes over time)
        this.refreshKillY();
        this.refreshWaterKillY();

        // wind
        this.updateWind(dt);

        // spawn scheduler (burst catch-up)
        this.time += dt;
        const max = this.opts.spawn.max;
        const maxPerFrame = this.opts.spawn.maxPerFrame;
        let spawnedThisFrame = 0;

        while (
            this.drops.length < max &&
            this.time >= this.nextSpawnAt &&
            spawnedThisFrame < maxPerFrame
        ) {
            // pick a random batch size for THIS tick
            const m = this.opts.spawn.multiplier;
            const batch = this.randi(m.min, m.max);      // inclusive

            // respect caps
            const room = Math.min(
                max - this.drops.length,
                maxPerFrame - spawnedThisFrame
            );
            const toSpawn = Math.min(Math.max(1, batch), room);

            for (let i = 0; i < toSpawn; i++) this.spawnOne(false);
            spawnedThisFrame += toSpawn;

            // advance schedule so we can catch up multiple ticks in one frame
            this.nextSpawnAt += this.rand(this.opts.spawn.intervalMin, this.opts.spawn.intervalMax);
        }

        // steer to wind + stretch
        const kFollow = 3.5;
        for (const d of this.drops) {
            const body = d.body as Phaser.Physics.Arcade.Body;
            const vx = body.velocity.x + (this.curWind.x - body.velocity.x) * kFollow * dt;
            d.setVelocityX(vx);

            // optional small vertical wind bias; not the “fall” itself
            const vy = Math.min(this.opts.maxVelocityY,
                body.velocity.y + this.curWind.y * 0.25 * dt);
            d.setVelocityY(vy);

            if (this.dbg.enabled) {
                this.dbgAccum += dt;
                if (this.dbgAccum >= this.dbg.every) {
                    this.dbgAccum = 0;
                    this.dbgGfx.clear();

                    const s = this.drops[this.dbgSampleIndex];
                    const w = this.scene.scale.width, h = this.scene.scale.height;

                    // draw kill lines
                    this.dbgGfx.lineStyle(1, 0xff3333, 0.8); // ground
                    this.dbgGfx.strokeLineShape(new Phaser.Geom.Line(0, this.killY, w, this.killY));
                    this.dbgGfx.lineStyle(1, 0x3399ff, 0.8); // water
                    this.dbgGfx.strokeLineShape(new Phaser.Geom.Line(0, this.waterKillY, w, this.waterKillY));

                    if (s) {
                        const b = s.body as Phaser.Physics.Arcade.Body;
                        // velocity vector
                        this.dbgGfx.lineStyle(2, 0x00ff99, 1);
                        this.dbgGfx.strokeLineShape(
                            new Phaser.Geom.Line(s.x, s.y, s.x + b.velocity.x * 0.05, s.y + b.velocity.y * 0.05)
                        );

                        this.dbgText.setText(
                            `drops: ${this.drops.length}/${this.opts.spawn.max}\n` +
                            `pos: ${s.x.toFixed(1)}, ${s.y.toFixed(1)}\n` +
                            `vel: ${b.velocity.x.toFixed(1)}, ${b.velocity.y.toFixed(1)}\n` +
                            `gravityY: ${this.opts.gravityY}\n` +
                            `wind: ${this.curWind.x.toFixed(1)}, ${this.curWind.y.toFixed(1)}\n` +
                            `killY: g=${this.killY.toFixed(1)} w=${this.waterKillY.toFixed(1)}`
                        );
                    } else {
                        this.dbgText.setText(
                            `drops: ${this.drops.length}/${this.opts.spawn.max}\n(no sample yet)`
                        );
                    }
                }
            }

            this.applyStretch(d);

            // recycle if off-screen
            // after you update velocities & stretch, before off-screen recycle:
            const w = this.scene.scale.width, h = this.scene.scale.height;

            // Fallback for tunneling — WATER first (it's above ground)
            if (this.waterObj && d.active && d.y >= this.waterKillY) {
                this.hitWater(d, this.waterObj);
                continue;
            }

            // Then the existing GROUND kill line (you already have this):
            if (this.groundObj && d.active && d.y >= this.killY) {
                this.hitGround(d, this.groundObj);
                continue;
            }

            if (d.y > h + 40 || d.x < -40 || d.x > w + 40) {
                d.destroy();
                const ix = this.drops.indexOf(d);
                if (ix >= 0) this.drops.splice(ix, 1);
            }
        }
    }

    // ---------- Helpers ----------
    private applyStretch(d: Drop) {
        const body = d.body as Phaser.Physics.Arcade.Body;
        const v = Math.abs(body.velocity.y);
        const s = 1 + this.opts.stretch.k * (v / this.opts.maxVelocityY);
        const scaleY = this.clamp(s, this.opts.stretch.min, this.opts.stretch.max);
        const scaleX = this.clamp(1 / Math.sqrt(scaleY), 0.5, 1.0);
        const ang = Math.atan2(body.velocity.y, body.velocity.x);
        d.setRotation(ang + Math.PI / 2);
        d.setScale(scaleX, scaleY);
    }

    private rand(a: number, b: number) { const lo = Math.min(a, b), hi = Math.max(a, b); return lo + Math.random() * (hi - lo); }
    private randi(a: number, b: number) { return Math.round(this.rand(a, b)); }
    private clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
}
