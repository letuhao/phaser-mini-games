import Phaser from 'phaser';
import type { SunObject } from '../objects/types';

type Opts = NonNullable<SunObject['options']>;

function R(o?: Opts) {
    const d: Required<Opts> = {
        radius: 18,
        color: 0xfff3c6,
        alpha: 1,
        glow: { radius: 42, alpha: 0.6, color: 0xffe8aa },

        mode: 'static',
        static: { x: 120, y: 80 },
        linear: {
            from: { x: 80, y: 80 }, to: { x: 260, y: 60 },
            duration: 18000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        },
        circle: { cx: 160, cy: 100, r: 120, angularSpeedDeg: 6, phaseDeg: -20, clockwise: true },

        flicker: { amp: 0.05, freq: 0.35 },
    };
    if (!o) return d;
    return {
        radius: o.radius ?? d.radius,
        color: o.color ?? d.color,
        alpha: o.alpha ?? d.alpha,
        glow: {
            radius: o.glow?.radius ?? d.glow.radius,
            alpha: o.glow?.alpha ?? d.glow.alpha,
            color: o.glow?.color ?? d.glow.color,
        },

        mode: o.mode ?? d.mode,
        static: o.static ?? d.static,
        linear: {
            from: o.linear?.from ?? d.linear.from,
            to: o.linear?.to ?? d.linear.to,
            duration: o.linear?.duration ?? d.linear.duration,
            yoyo: o.linear?.yoyo ?? d.linear.yoyo,
            repeat: (o.linear?.repeat ?? d.linear.repeat) as any,
            ease: o.linear?.ease ?? d.linear.ease,
        },
        circle: {
            cx: o.circle?.cx ?? d.circle.cx,
            cy: o.circle?.cy ?? d.circle.cy,
            r: o.circle?.r ?? d.circle.r,
            angularSpeedDeg: o.circle?.angularSpeedDeg ?? d.circle.angularSpeedDeg,
            phaseDeg: o.circle?.phaseDeg ?? d.circle.phaseDeg,
            clockwise: o.circle?.clockwise ?? d.circle.clockwise,
        },

        flicker: {
            amp: o.flicker?.amp ?? d.flicker.amp,
            freq: o.flicker?.freq ?? d.flicker.freq,
        }
    };
}

function ensureTexture(scene: Phaser.Scene, key: string, radius: number, color: number, alpha: number, ring = false) {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    const steps = ring ? 24 : 32;
    for (let i = steps; i >= 1; i--) {
        const t = i / steps;
        const a = alpha * (ring ? t * 0.7 : t);
        g.fillStyle(color, a);
        const r = radius * t * (ring ? 1 : 1);
        g.fillCircle(radius, radius, r);
        if (ring && i === steps) {
            // hollow center for ring look
            g.fillStyle(color, 0);
            g.fillCircle(radius, radius, radius * 0.6);
        }
    }
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
}

export class SunBody {
    private opts: ReturnType<typeof R>;
    private depth: number;

    private container!: Phaser.GameObjects.Container;
    private disk!: Phaser.GameObjects.Image;
    private halo!: Phaser.GameObjects.Image;

    private t = 0;
    private theta = 0; // for circle mode

    constructor(private scene: Phaser.Scene, options: Opts | undefined, depth = 39) {
        this.opts = R(options);
        this.depth = depth;

        // textures
        ensureTexture(scene, '__sun_disk', this.opts.radius, this.opts.color, this.opts.alpha, false);
        ensureTexture(scene, '__sun_glow', this.opts.glow.radius ?? 0, this.opts.glow.color ?? 0, this.opts.glow.alpha ?? 0, false);

        this.container = this.scene.add.container(0, 0).setDepth(this.depth);
        this.halo = this.scene.add.image(0, 0, '__sun_glow').setBlendMode(Phaser.BlendModes.ADD);
        this.disk = this.scene.add.image(0, 0, '__sun_disk');
        this.container.add([this.halo, this.disk]);

        // initial position
        const p = this.initialPos();
        this.container.setPosition(p.x, p.y);

        if (this.opts.mode === 'linear') {
            // tween the container automatically
            const lin = this.opts.linear;
            this.container.setPosition(lin.from.x, lin.from.y);
            this.scene.tweens.add({
                targets: this.container,
                x: lin.to.x, y: lin.to.y,
                duration: lin.duration,
                yoyo: lin.yoyo,
                repeat: lin.repeat as any,
                ease: lin.ease
            });
        } else if (this.opts.mode === 'circle') {
            this.theta = Phaser.Math.DegToRad(this.opts.circle.phaseDeg ?? 0);
        }

        this.scene.events.on('update', this.update, this);
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        this.container.destroy();
    }

    private initialPos() {
        if (this.opts.mode === 'static') return this.opts.static;
        if (this.opts.mode === 'linear') return this.opts.linear.from;
        if (this.opts.mode === 'circle') {
            const c = this.opts.circle;
            return {
                x: c.cx + Math.cos(Phaser.Math.DegToRad(c.phaseDeg ?? 0)) * c.r,
                y: c.cy + Math.sin(Phaser.Math.DegToRad(c.phaseDeg ?? 0)) * c.r
            };
        }
        return { x: 120, y: 80 };
    }

    update(_time: number, deltaMs: number) {
        this.t += deltaMs / 1000;

        // circle motion
        if (this.opts.mode === 'circle') {
            const c = this.opts.circle;
            const dir = (c.clockwise ? 1 : -1);
            this.theta += dir * Phaser.Math.DegToRad(c.angularSpeedDeg ?? 0) * (deltaMs / 1000);
            const x = c.cx + Math.cos(this.theta) * c.r;
            const y = c.cy + Math.sin(this.theta) * c.r;
            this.container.setPosition(x, y);
        }

        // subtle flicker
        const f = this.opts.flicker ?? { amp: 0, freq: 0 };
        if (f.amp ?? 0 > 0) {
            const aMul = 1 + Math.sin(this.t * ((f.freq ?? 0) * Math.PI * 2)) * (f.amp ?? 0);
            this.disk.setScale(aMul);
            this.halo.setScale(aMul * 1.02);
        }
    }

    /** For other systems to follow/collide with etc. */
    getGameObject() { return this.container; }
    getCenter() { return new Phaser.Math.Vector2(this.container.x, this.container.y); }
}
