import Phaser from 'phaser';

export type WaterSurfaceOptions = {
  height?: number;               // initial height in px (from bottom)
  color?: number;                // fill color
  alpha?: number;                // fill alpha
  risePerHit?: number;           // how much height increases per drop (px)
  maxRise?: number;              // cap on extra height (px)
  decayPerSec?: number;          // how fast the extra height decays (px/s)
  ripple?: {
    life?: number;               // ms
    color?: number;
    alpha?: number;
    minRadius?: number;          // px
    maxRadius?: number;          // px
    lineWidth?: number;          // px
  };
};

type Resolved = Required<WaterSurfaceOptions>;

function resolve(o?: WaterSurfaceOptions): Resolved {
  const d: Resolved = {
    height: 18,
    color: 0x2a7abf,
    alpha: 0.45,
    risePerHit: 0.6,
    maxRise: 20,
    decayPerSec: 4,
    ripple: {
      life: 650,
      color: 0x8fd0ff,
      alpha: 0.7,
      minRadius: 12,
      maxRadius: 70,
      lineWidth: 2,
    }
  };
  if (!o) return d;
  return {
    height: o.height ?? d.height,
    color: o.color ?? d.color,
    alpha: o.alpha ?? d.alpha,
    risePerHit: o.risePerHit ?? d.risePerHit,
    maxRise: o.maxRise ?? d.maxRise,
    decayPerSec: o.decayPerSec ?? d.decayPerSec,
    ripple: {
      life: o.ripple?.life ?? d.ripple.life,
      color: o.ripple?.color ?? d.ripple.color,
      alpha: o.ripple?.alpha ?? d.ripple.alpha,
      minRadius: o.ripple?.minRadius ?? d.ripple.minRadius,
      maxRadius: o.ripple?.maxRadius ?? d.ripple.maxRadius,
      lineWidth: o.ripple?.lineWidth ?? d.ripple.lineWidth,
    }
  };
}

/** Thin class that owns a filled rectangle (with static arcade body) and ripple rings. */
export class WaterSurface {
  private opts: Resolved;
  private rect: Phaser.GameObjects.Rectangle;
  private body: Phaser.Physics.Arcade.StaticBody;
  private baseH: number;
  private extraH = 0; // rises on hits, decays over time
  private depth: number;
  private ripples: Phaser.GameObjects.Graphics[] = [];

  constructor(private scene: Phaser.Scene, options: WaterSurfaceOptions | undefined, depth = 2) {
    this.opts = resolve(options);
    this.depth = depth;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    this.baseH = this.opts.height;
    const totalH = this.baseH + this.extraH;

    this.rect = this.scene.add
      .rectangle(0, h - totalH, w, totalH, this.opts.color, this.opts.alpha)
      .setOrigin(0, 0)
      .setDepth(this.depth);

    this.scene.physics.add.existing(this.rect, true);
    this.body = this.rect.body as Phaser.Physics.Arcade.StaticBody;
    this.body.updateFromGameObject();

    this.scene.events.on('update', this.update, this);
    this.scene.scale.on('resize', this.resize, this);
  }

  destroy() {
    this.scene.events.off('update', this.update, this);
    this.scene.scale.off('resize', this.resize, this);
    this.ripples.forEach(r => r.destroy());
    this.rect.destroy();
  }

  getGameObject() { return this.rect; } 

  private resize() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const totalH = this.baseH + this.extraH;

    this.rect.setPosition(0, h - totalH);
    this.rect.setSize(w, totalH);
    this.rect.setDisplaySize(w, totalH);
    this.body.updateFromGameObject();
  }

  /** Called when a raindrop hits at x. Raises water a bit and spawns a ripple. */
  bumpAt(x: number) {
    // raise (clamped)
    this.extraH = Math.min(this.extraH + this.opts.risePerHit, this.opts.maxRise);
    this.resize();

    // ripple ring
    const topY = this.getTopY();
    const g = this.scene.add.graphics().setDepth(this.depth + 1);
    g.lineStyle(this.opts.ripple.lineWidth ?? 0, this.opts.ripple.color ?? 0, this.opts.ripple.alpha);
    g.strokeCircle(x, topY, this.opts.ripple.minRadius ?? 0);
    this.ripples.push(g);

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: this.opts.ripple.life,
      ease: 'Quad.easeOut',
      onUpdate: (tween, target: any) => {
        const t = tween.progress; // 0..1
        const r = Phaser.Math.Linear(this.opts.ripple.minRadius ?? 0, this.opts.ripple.maxRadius ?? 0, t);
        (target as Phaser.GameObjects.Graphics).clear();
        (target as Phaser.GameObjects.Graphics).lineStyle(this.opts.ripple.lineWidth ?? 0, this.opts.ripple.color ?? 0, (1 - t) * (this.opts.ripple.alpha ?? 0));
        (target as Phaser.GameObjects.Graphics).strokeCircle(x, topY, r);
      },
      onComplete: () => {
        const i = this.ripples.indexOf(g);
        if (i >= 0) this.ripples.splice(i, 1);
        g.destroy();
      }
    });
  }

  /** Current top Y (world coords). */
  getTopY() {
    return this.rect.getBounds().top;
  }

  /** Arcade static body (for collider wiring). */
  getBody() {
    return this.body;
  }

  update(_time: number, deltaMs: number) {
    // decay extra height smoothly
    if (this.extraH > 0) {
      const dec = this.opts.decayPerSec * (deltaMs / 1000);
      const newExtra = Math.max(0, this.extraH - dec);
      if (newExtra !== this.extraH) {
        this.extraH = newExtra;
        this.resize();
      }
    }
  }
}
