// apps/game-frontend/src/effects/Wind.ts

export type WindMode = 'noise' | 'range';

export type WindOptions = {
    // === common ===
    mode?: WindMode;           // 'noise' (default) or 'range'
    heightInfluence?: number;  // 0..1, faster aloft
    seed?: number;

    // === noise mode (legacy, still supported) ===
    base?: number;             // px/s baseline (→ +x is left→right)
    variance?: number;         // amplitude for gusts
    vertical?: number;         // +y is downward
    gustSpeed?: number;        // how fast noise evolves (0.1..2)

    // === range mode (new) ===
    range?: {
        from: { x: number; y: number }; // lower bound vector
        to: { x: number; y: number }; // upper bound vector
    };
    sweep?: {
        durMin?: number;         // seconds to sweep between targets (min)
        durMax?: number;         // seconds to sweep (max)
        holdMin?: number;        // seconds to hold at target (min)
        holdMax?: number;        // seconds to hold (max)
        keepXMin?: number;       // keep x >= this (forces left→right)
        jitterAmp?: number;      // small random ripple (px/s)
        jitterFreq?: number;     // Hz
        easing?: 'linear' | 'smooth'; // interpolation
    };
};

// ---------- tiny RNG + smooth noise (for legacy/noise mode) ----------
function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function rnd() {
        t += 0x6D2B79F5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}
function smoothNoise(rand: () => number) {
    const lattice = Array.from({ length: 256 }, () => rand() * 2 - 1);
    return (t: number) => {
        const i = Math.floor(t) & 255;
        const f = t - Math.floor(t);
        const a = lattice[i];
        const b = lattice[(i + 1) & 255];
        const u = f * f * (3 - 2 * f); // smoothstep
        return a * (1 - u) + b * u;
    };
}

// ---------- main ----------
export class WindField {
    // noise mode
    private nx!: (t: number) => number;
    private ny!: (t: number) => number;
    private t = 0;

    // range mode state
    private cur = { x: 0, y: 0 };
    private start = { x: 0, y: 0 };
    private target = { x: 0, y: 0 };
    private sweepTime = 0;     // elapsed within current sweep
    private sweepDur = 1.5;    // sweep duration
    private holding = 0;       // remaining hold time

    constructor(private opts: WindOptions = {}) {
        const mode = opts.mode ?? 'noise';

        if (mode === 'noise') {
            const rnd = mulberry32(opts.seed ?? 1337);
            this.nx = smoothNoise(rnd);
            this.ny = smoothNoise(rnd);
        } else {
            // range defaults
            const from = opts.range?.from ?? { x: 60, y: 8 };
            const to = opts.range?.to ?? { x: 180, y: 40 };
            const keepX = opts.sweep?.keepXMin ?? 40;

            // initialize current & target
            const sameX = from.x === to.x;
            const sameY = from.y === to.y;

            const clampX = (v: number) => Math.max(keepX, v);

            this.cur.x = clampX(from.x);
            this.cur.y = from.y;
            this.start = { ...this.cur };
            this.target = {
                x: clampX(sameX ? from.x : randRange(from.x, to.x)),
                y: sameY ? from.y : randRange(from.y, to.y),
            };
            this.sweepDur = randRange(opts.sweep?.durMin ?? 1.2, opts.sweep?.durMax ?? 3.0);
            this.holding = 0; // start sweeping immediately
        }

        function randRange(a: number, b: number) {
            const lo = Math.min(a, b), hi = Math.max(a, b);
            return lo + Math.random() * (hi - lo);
        }
    }

    update(dt: number) {
        const mode = this.opts.mode ?? 'noise';
        const hInf = clamp01(this.opts.heightInfluence ?? 0.35);

        if (mode === 'noise') {
            const g = this.opts.gustSpeed ?? 0.4;
            this.t += dt * g;
            // nothing else to track here
        } else {
            // range sweep evolution
            if (this.holding > 0) {
                this.holding -= dt;
                if (this.holding <= 0) this.beginNewSweep();
                return;
            }

            this.sweepTime += dt;
            const k = clamp01(this.sweepTime / Math.max(0.0001, this.sweepDur));
            const eased = (this.opts.sweep?.easing ?? 'smooth') === 'smooth'
                ? smoothstep(k)
                : k;

            this.cur.x = lerp(this.start.x, this.target.x, eased);
            this.cur.y = lerp(this.start.y, this.target.y, eased);

            if (k >= 1) {
                // reached target → hold, then choose a new target
                this.holding = randRange(this.opts.sweep?.holdMin ?? 0.2, this.opts.sweep?.holdMax ?? 1.0);
                if (this.holding <= 0) this.beginNewSweep();
            }
        }

        // helper: cap 0..1
        function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
        function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
        function smoothstep(t: number) { return t * t * (3 - 2 * t); }
        function randRange(a: number, b: number) {
            const lo = Math.min(a, b), hi = Math.max(a, b);
            return lo + Math.random() * (hi - lo);
        }
    }

    private beginNewSweep() {
        const from = this.opts.range?.from ?? { x: 60, y: 8 };
        const to = this.opts.range?.to ?? { x: 180, y: 40 };
        const keepX = this.opts.sweep?.keepXMin ?? 40;

        const sameX = from.x === to.x;
        const sameY = from.y === to.y;

        const clampX = (v: number) => Math.max(keepX, v);

        this.start = { ...this.cur };
        this.target = {
            x: clampX(sameX ? from.x : randRange(from.x, to.x)),
            y: sameY ? from.y : randRange(from.y, to.y),
        };
        this.sweepDur = randRange(this.opts.sweep?.durMin ?? 1.2, this.opts.sweep?.durMax ?? 3.0);
        this.sweepTime = 0;

        function randRange(a: number, b: number) {
            const lo = Math.min(a, b), hi = Math.max(a, b);
            return lo + Math.random() * (hi - lo);
        }
    }

    // Sample wind at (x,y) | returns px/s vector
    sample(x: number, y: number, sceneH: number) {
        const mode = this.opts.mode ?? 'noise';
        const hInf = clamp01(this.opts.heightInfluence ?? 0.35);
        const hFactor = 1 + hInf * ((sceneH - y) / sceneH - 0.5); // ~[-0.35,+0.35]

        if (mode === 'noise') {
            // legacy noise-based wind (with correct +y downward)
            const base = this.opts.base ?? 60;
            const varr = this.opts.variance ?? 80;
            const vyBias = this.opts.vertical ?? 0;

            const n1 = this.nx(this.t + x * 0.001);
            const n2 = this.nx(this.t * 0.7 + y * 0.0013);
            const n3 = this.ny(this.t * 0.9 + x * 0.0007);
            const n4 = this.ny(this.t + y * 0.0011);

            const gustX = (n1 * 0.6 + n2 * 0.4) * varr;
            const gustY = (n3 * 0.6 + n4 * 0.4) * (varr * 0.25);

            const windX = (base + gustX) * hFactor;
            const windY = (vyBias + gustY * 0.5) * (0.5 + 0.5 * hFactor);
            return { x: windX, y: windY };
        } else {
            // range mode: current vector + small jitter
            const jAmp = this.opts.sweep?.jitterAmp ?? 8;
            const jFreq = this.opts.sweep?.jitterFreq ?? 1.0;
            const t = performance.now() / 1000;

            const jx = Math.sin(t * 2 * Math.PI * jFreq) * jAmp;
            const jy = Math.cos(t * 2 * Math.PI * (jFreq * 0.8)) * (jAmp * 0.35);

            return {
                x: (this.cur.x + jx) * hFactor,
                y: (this.cur.y + jy) * (0.5 + 0.5 * hFactor),
            };
        }

        function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
    }
}
