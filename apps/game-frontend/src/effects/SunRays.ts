import Phaser from 'phaser';

export type SunRaysOptions = {
    source: { x: number; y: number };

    // ✨ visual
    rays?: number;                 // how many rays
    spreadDeg?: number;            // total angular spread
    length?: number;               // px
    thickness?: {
        min: number;                 // far-end width min (px)
        max: number;                 // far-end width max (px)
        /** shape along the fan: center looks thicker feels more natural */
        profile?: 'flat' | 'center-heavy' | 'edge-heavy';
    };
    /** randomize ray length a bit (0..1 => 0%..100% of length) */
    lengthJitter?: number;

    // 🎨 gradient along each ray (0 at sun → 1 at far end)
    gradient?: {
        layers?: number;             // layered fills per ray (default 6)
        stops: Array<{ at: number; color: number; alpha?: number }>; // at in [0..1]
    };

    // 🎛️ motion
    animate?: {
        enabled?: boolean;           // default: false (fixed)
        rotateSpeedDeg?: number;     // deg/sec (small = gentle)
        pulseAmp?: number;           // extra alpha ± amount
        pulseFreq?: number;          // Hz
        sizeJitterAmp?: number;      // px, wobble thickness
        sizeJitterFreq?: number;     // Hz
    };

    // global tint/alpha (kept for convenience)
    color?: number;                // fallback if no gradient provided
    alpha?: number;

    // occlusion
    occluders?: string[];          // list of ids whose bounds block the rays
    refreshMaskMs?: number;        // rebuild mask every N ms
};

type Resolved = Required<SunRaysOptions>;

function R(o?: SunRaysOptions): Resolved {
    const d: Resolved = {
        source: { x: 200, y: 120 },

        rays: 12,
        spreadDeg: 40,
        length: 900,
        thickness: { min: 40, max: 140, profile: 'center-heavy' },
        lengthJitter: 0.15,

        // fixed by default (no rotation/pulse unless you turn it on)
        animate: {
            enabled: false,
            rotateSpeedDeg: 4,
            pulseAmp: 0.15,
            pulseFreq: 0.6,
            sizeJitterAmp: 14,
            sizeJitterFreq: 0.2,
        },

        // if no gradient, we’ll fallback to color+alpha
        gradient: {
            layers: 6,
            stops: [
                { at: 0.00, color: 0xfff3c6, alpha: 0.80 },
                { at: 0.35, color: 0xffe3a1, alpha: 0.70 },
                { at: 0.70, color: 0xf4c677, alpha: 0.55 },
                { at: 1.00, color: 0xe0a85b, alpha: 0.40 },
            ],
        },

        color: 0xffe3a1,
        alpha: 0.65,

        occluders: [],
        refreshMaskMs: 120,
    };

    if (!o) return d;

    // merge + sensible defaults
    return {
        source: o.source ?? d.source,

        rays: o.rays ?? d.rays,
        spreadDeg: o.spreadDeg ?? d.spreadDeg,
        length: o.length ?? d.length,
        thickness: {
            min: o.thickness?.min ?? d.thickness.min,
            max: o.thickness?.max ?? d.thickness.max,
            profile: o.thickness?.profile ?? d.thickness.profile,
        },
        lengthJitter: o.lengthJitter ?? d.lengthJitter,

        animate: {
            enabled: o.animate?.enabled ?? d.animate.enabled,
            rotateSpeedDeg: o.animate?.rotateSpeedDeg ?? d.animate.rotateSpeedDeg,
            pulseAmp: o.animate?.pulseAmp ?? d.animate.pulseAmp,
            pulseFreq: o.animate?.pulseFreq ?? d.animate.pulseFreq,
            sizeJitterAmp: o.animate?.sizeJitterAmp ?? d.animate.sizeJitterAmp,
            sizeJitterFreq: o.animate?.sizeJitterFreq ?? d.animate.sizeJitterFreq,
        },

        gradient: (o.gradient
            ? {
                layers: o.gradient.layers ?? d.gradient.layers,
                stops: (o.gradient.stops ?? d.gradient.stops).slice().sort((a, b) => a.at - b.at),
            }
            : d.gradient),

        color: o.color ?? d.color,
        alpha: o.alpha ?? d.alpha,

        occluders: o.occluders ?? d.occluders,
        refreshMaskMs: o.refreshMaskMs ?? d.refreshMaskMs,
    };
}

// ——— helpers ———
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function fract(x: number) { return x - Math.floor(x); }
function seededRand(seed: number) { return fract(Math.sin(seed * 12.9898) * 43758.5453); }
function lerpColor(c0: number, c1: number, t: number) {
    const r0 = (c0 >> 16) & 0xff, g0 = (c0 >> 8) & 0xff, b0 = c0 & 0xff;
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r = (r0 + (r1 - r0) * t) & 0xff;
    const g = (g0 + (g1 - g0) * t) & 0xff;
    const b = (b0 + (b1 - b0) * t) & 0xff;
    return (r << 16) | (g << 8) | b;
}
function sampleGradient(stops: { at: number; color: number; alpha?: number }[], u: number) {
    if (!stops.length) return { color: 0xffffff, alpha: 1 };
    u = clamp01(u);
    if (u <= stops[0].at) return { color: stops[0].color, alpha: stops[0].alpha ?? 1 };
    if (u >= stops[stops.length - 1].at) {
        const s = stops[stops.length - 1];
        return { color: s.color, alpha: s.alpha ?? 1 };
    }
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i], b = stops[i + 1];
        if (u >= a.at && u <= b.at) {
            const t = (u - a.at) / (b.at - a.at || 1e-6);
            return {
                color: lerpColor(a.color, b.color, t),
                alpha: lerp(a.alpha ?? 1, b.alpha ?? 1, t),
            };
        }
    }
    return { color: stops[0].color, alpha: stops[0].alpha ?? 1 };
}

export class SunRays {
    private opts: Resolved;
    private depth: number;

    private rt!: Phaser.GameObjects.RenderTexture;
    private gfx!: Phaser.GameObjects.Graphics;
    private maskRT!: Phaser.GameObjects.RenderTexture;
    private mask!: Phaser.Display.Masks.BitmapMask;

    private t = 0;
    private lastMaskAt = 0;

    // per-ray seeds for stable randomness (size/length)
    private seeds: number[] = [];
    private lastRayCount = 0;

    constructor(private scene: Phaser.Scene, options: SunRaysOptions | undefined, depth = 50) {
        this.opts = R(options);
        this.depth = depth;

        const { width, height } = this.scene.scale;

        this.rt = this.scene.add.renderTexture(0, 0, width, height).setOrigin(0).setDepth(this.depth);
        this.rt.setBlendMode(Phaser.BlendModes.ADD);
        this.gfx = this.scene.add.graphics();

        this.maskRT = this.scene.add.renderTexture(0, 0, width, height).setOrigin(0).setVisible(false);
        this.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.maskRT);
        this.mask.invertAlpha = true;
        this.rt.setMask(this.mask);

        this.ensureSeeds();
        this.scene.events.on('update', this.update, this);
        this.scene.scale.on('resize', this.onResize, this);

        this.rebuildMask();
        this.redrawBeams(0, 0); // initial
        this.rt.setAlpha(this.opts.alpha); // fixed alpha by default
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        this.scene.scale.off('resize', this.onResize, this);
        this.rt.destroy(); this.maskRT.destroy(); this.gfx.destroy();
    }

    private ensureSeeds() {
        if (this.seeds.length !== this.opts.rays) {
            this.seeds = Array.from({ length: this.opts.rays }, (_, i) => seededRand(i + 1));
            this.lastRayCount = this.opts.rays;
        }
    }

    private onResize() {
        const { width, height } = this.scene.scale;
        this.rt.setSize(width, height).setPosition(0, 0);
        this.maskRT.setSize(width, height).setPosition(0, 0);
        this.rebuildMask();
        this.redrawBeams(0, this.t);
    }

    private rebuildMask() {
        const { width, height } = this.scene.scale;
        this.maskRT.clear();
        this.maskRT.fill(0x000000, 1, 0, 0, width, height);

        const drawRect = (r: Phaser.Geom.Rectangle) => {
            const g = this.scene.add.graphics();
            g.fillStyle(0xffffff, 1).fillRect(r.x, r.y, r.width, r.height);
            this.maskRT.draw(g); g.destroy();
        };

        for (const id of this.opts.occluders) {
            const go = this.scene.children.getByName(id) as any;
            if (!go) continue;
            const b = go.getBounds?.();
            if (b) drawRect(b);
            else if (go.body && typeof go.body.left === 'number') {
                drawRect(new Phaser.Geom.Rectangle(go.body.left, go.body.top, go.body.width, go.body.height));
            }
        }
        this.lastMaskAt = performance.now();
    }

    // profile weighting for thickness by ray index (center heavier looks nice)
    private profileWeight(i: number, n: number) {
        if (n <= 1) return 1;
        const t = i / (n - 1); // 0..1 across the fan
        switch (this.opts.thickness.profile) {
            case 'center-heavy': return 0.6 + 0.8 * (1 - Math.abs(t - 0.5) * 2); // peak center
            case 'edge-heavy': return 0.6 + 0.8 * Math.abs(t - 0.5) * 2;       // thicker edges
            default: return 1;
        }
    }

    private redrawBeams(rotDeg: number, timeSec: number) {
        const { width, height } = this.scene.scale;
        this.rt.clear();
        this.gfx.clear();

        const src = this.opts.source;
        const centerRad = Phaser.Math.DegToRad(rotDeg);
        const halfSpread = Phaser.Math.DegToRad(this.opts.spreadDeg / 2);
        const start = centerRad - halfSpread;
        const end = centerRad + halfSpread;

        const rays = Math.max(1, this.opts.rays);
        const L = Math.max(2, this.opts.gradient.layers ?? 6);
        const stops = this.opts.gradient.stops;
        const lj = clamp01(this.opts.lengthJitter);

        // draw wedges
        for (let i = 0; i < rays; i++) {
            const tFan = rays > 1 ? i / (rays - 1) : 0.5;
            const ang = Phaser.Math.Linear(start, end, tFan);

            // base far-end thickness
            const base = Phaser.Math.Between(this.opts.thickness.min, this.opts.thickness.max);
            const prof = this.profileWeight(i, rays);

            // gentle size wobble (if animate enabled)
            const sjA = this.opts.animate.sizeJitterAmp ?? 0;
            const sjF = this.opts.animate.sizeJitterFreq ?? 0;
            const wobble = (this.opts.animate.enabled && sjA > 0)
                ? (Math.sin((timeSec + i * 0.37) * (sjF * Math.PI * 2)) * sjA)
                : 0;

            const farWidth = Math.max(2, base * prof + wobble);

            // per-ray length jitter
            const seed = this.seeds[i] || 0.5;
            const len = this.opts.length * (1 - lj * (seed - 0.5) * 2);

            const far = new Phaser.Math.Vector2(
                src.x + Math.cos(ang) * len,
                src.y + Math.sin(ang) * len
            );
            const n = new Phaser.Math.Vector2(-Math.sin(ang), Math.cos(ang));
            const p0 = new Phaser.Math.Vector2(src.x, src.y);
            const p1 = far.clone().add(n.clone().scale(farWidth * 0.5));
            const p2 = far.clone().add(n.clone().scale(-farWidth * 0.5));

            // layered gradient along the ray (near→far)
            for (let k = 0; k < L; k++) {
                const u = (k + 1) / L; // 0..1 from source to far
                const gcol = stops?.length ? sampleGradient(stops, u) : { color: this.opts.color, alpha: 1 };
                const layerAlpha = (this.opts.alpha * (gcol.alpha ?? 1)) / L;

                // shrink far end gradually per layer to fake a soft gradient
                const tL = (k + 1) / (L + 2);
                const f1 = far.clone().lerp(p1, tL);
                const f2 = far.clone().lerp(p2, tL);

                this.gfx.fillStyle(gcol.color, layerAlpha);
                this.gfx.beginPath();
                this.gfx.moveTo(p0.x, p0.y);
                this.gfx.lineTo(f1.x, f1.y);
                this.gfx.lineTo(f2.x, f2.y);
                this.gfx.closePath();
                this.gfx.fillPath();
            }
        }

        this.rt.draw(this.gfx);
    }

    update(_time: number, deltaMs: number) {
        this.t += deltaMs / 1000;

        // refresh occlusion (water level etc.)
        if (performance.now() - this.lastMaskAt > this.opts.refreshMaskMs) {
            this.rebuildMask();
        }

        this.ensureSeeds();

        if (this.opts.animate.enabled) {
            // gentle rotation
            const rot = (this.t * (this.opts.animate.rotateSpeedDeg ?? 0)) % 360;
            this.redrawBeams(rot, this.t);

            // alpha pulse
            const a = this.opts.alpha
                + Math.sin(this.t * ((this.opts.animate.pulseFreq ?? 0) * Math.PI * 2)) * (this.opts.animate.pulseAmp ?? 0);
            this.rt.setAlpha(Phaser.Math.Clamp(a, 0, 1));
        } else {
            // fixed: only rebuild on demand (resize already handled)
            // nothing per-frame except mask refresh above
        }
    }
}