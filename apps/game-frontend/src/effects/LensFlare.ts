import Phaser from 'phaser';

// --- LENS FLARE ---
export type LensFlareOptions = {
    /** Which object to follow (usually the sun id). Required. */
    sourceId: string;

    // Elements along the sun→screen-center line
    elements?: Array<{
        offset: number;         // position along line, 0=center, 1=opposite of sun
        size: number;           // px (diameter)
        texture?: 'dot' | 'ring';
        color?: number;
        alpha?: number;
    }>;

    // Global tuning
    alpha?: number;           // overall alpha multiplier
    tint?: number;            // optional global tint
    occluders?: string[];     // reduce alpha if any rect blocks the line
    distanceFalloff?: number; // 0..1, how much to dim far-offscreen suns (default 0.6)
};

type Resolved = Required<LensFlareOptions>;

function R(o: LensFlareOptions): Resolved {
    const d: Resolved = {
        sourceId: o.sourceId, // required

        elements: [
            { offset: -0.35, size: 28, texture: 'dot', color: 0xffe8aa, alpha: 0.55 },
            { offset: 0.18, size: 14, texture: 'ring', color: 0xfff3c6, alpha: 0.45 },
            { offset: 0.42, size: 36, texture: 'dot', color: 0xf8d48a, alpha: 0.35 },
            { offset: 0.75, size: 22, texture: 'ring', color: 0xffe3a1, alpha: 0.40 },
            { offset: 1.00, size: 64, texture: 'dot', color: 0xf1c27d, alpha: 0.30 },
            { offset: 1.35, size: 16, texture: 'ring', color: 0xffe8aa, alpha: 0.35 },
        ],

        alpha: 1,
        tint: 0xffffff,
        occluders: [],
        distanceFalloff: 0.6,
    };
    return {
        sourceId: d.sourceId,
        elements: (o.elements ?? d.elements),
        alpha: o.alpha ?? d.alpha,
        tint: o.tint ?? d.tint,
        occluders: o.occluders ?? d.occluders,
        distanceFalloff: o.distanceFalloff ?? d.distanceFalloff,
    };
}

function ensureTex(scene: Phaser.Scene, key: string, size: number, ring = false, color = 0xffffff) {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    const r = size / 2;
    const steps = ring ? 18 : 22;
    for (let i = steps; i >= 1; i--) {
        const t = i / steps;
        g.fillStyle(color, ring ? t * 0.8 : t);
        g.fillCircle(r, r, r * t);
        if (ring && i === steps) {
            g.fillStyle(color, 0);
            g.fillCircle(r, r, r * 0.6);
        }
    }
    g.generateTexture(key, size, size);
    g.destroy();
}

export class LensFlare {
    private opts: Resolved;
    private depth: number;

    private container!: Phaser.GameObjects.Container;
    private sprites: Phaser.GameObjects.Image[] = [];

    constructor(private scene: Phaser.Scene, options: LensFlareOptions, depth = 55) {
        this.opts = R(options);
        this.depth = depth;

        this.container = this.scene.add.container(0, 0).setDepth(this.depth);

        // build elements
        for (let i = 0; i < this.opts.elements.length; i++) {
            const el = this.opts.elements[i];
            const key = `__flare_${el.texture}_${Math.round(el.size)}`;
            ensureTex(this.scene, key, Math.max(8, Math.round(el.size)), el.texture === 'ring', el.color ?? 0xffffff);
            const img = this.scene.add.image(0, 0, key)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setTint(el.color ?? 0xffffff)
                .setAlpha(el.alpha ?? 1);
            this.container.add(img);
            this.sprites.push(img);
        }

        this.scene.events.on('update', this.update, this);
        this.scene.scale.on('resize', this.onResize, this);
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        this.scene.scale.off('resize', this.onResize, this);
        this.container.destroy();
    }

    private onResize() {
        // nothing needed; positions are recomputed every frame
    }

    private findSource() {
        return this.scene.children.getByName(this.opts.sourceId) as any;
    }

    private occlusionFactor(sx: number, sy: number, ex: number, ey: number) {
        if (!this.opts.occluders.length) return 1;
        const line = new Phaser.Geom.Line(sx, sy, ex, ey);
        for (const id of this.opts.occluders) {
            const go = this.scene.children.getByName(id) as any;
            if (!go) continue;
            const r = go.getBounds?.() ??
                (go.body ? new Phaser.Geom.Rectangle(go.body.left, go.body.top, go.body.width, go.body.height) : null);
            if (r && Phaser.Geom.Intersects.LineToRectangle(line, r)) {
                return 0.35; // dim when blocked by any occluder
            }
        }
        return 1;
    }

    update(_time: number, _delta: number) {
        const srcGO = this.findSource();
        if (!srcGO) {
            this.container.setVisible(false); return;
        }
        this.container.setVisible(true);

        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const cx = w / 2, cy = h / 2;

        const sx = srcGO.getCenter ? srcGO.getCenter().x : (srcGO.x ?? 0);
        const sy = srcGO.getCenter ? srcGO.getCenter().y : (srcGO.y ?? 0);

        const vx = cx - sx, vy = cy - sy;       // vector sun→center
        const dist = Math.hypot(vx, vy);
        const dx = dist > 0 ? vx / dist : 0;
        const dy = dist > 0 ? vy / dist : 0;

        // distance falloff (when sun is far offscreen, dim the whole flare)
        const maxd = Math.hypot(cx, cy); // half-diagonal approx
        const fall = Phaser.Math.Clamp(1 - (dist / maxd) * (this.opts.distanceFalloff), 0, 1);

        for (let i = 0; i < this.sprites.length; i++) {
            const el = this.opts.elements[i];
            const spr = this.sprites[i];

            // position along the line through the center
            const t = el.offset;
            const ex = cx + dx * dist * t;
            const ey = cy + dy * dist * t;

            spr.setPosition(ex, ey);
            spr.setAlpha((el.alpha ?? 1) * this.opts.alpha * fall * this.occlusionFactor(sx, sy, ex, ey));
            spr.setTint(el.color ?? this.opts.tint);
            spr.setDepth(this.depth);
        }
    }
}
