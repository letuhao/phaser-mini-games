import Phaser from 'phaser';

type Opts = {
    count?: number;                  // how many embers in the pool
    area?: { w: number; h: number }; // horizontal spread and vertical spawn band height
    baseY?: number;                  // bottom line where embers start rising from
};

/**
 * Ember effect without Phaser particles:
 * Uses a pool of Images, additive blend, and tweens to float upward then recycle.
 */
export class Embers {
    public readonly root: Phaser.GameObjects.Container;
    private sprites: Phaser.GameObjects.Image[] = [];
    private activeCount = 0;
    private areaW: number;
    private baseY: number;

    constructor(scene: Phaser.Scene, opts: Opts = {}) {
        const pool = opts.count ?? 28;
        this.areaW = opts.area?.w ?? 1000;
        this.baseY = opts.baseY ?? 600;

        // ensure a small round texture exists
        const key = 'fx-ember';
        if (!scene.textures.exists(key)) {
            const g = scene.add.graphics();
            g.fillStyle(0xffffff, 1).fillCircle(6, 6, 3);
            g.generateTexture(key, 12, 12);
            g.destroy();
        }

        this.root = scene.add.container(0, 0).setName('embers');

        // build pool
        for (let i = 0; i < pool; i++) {
            const sp = scene.add.image(0, 0, key)
                .setBlendMode(Phaser.BlendModes.ADD)
                .setVisible(false);
            this.root.add(sp);
            this.sprites.push(sp);
        }

        // start with a modest budget
        this.setBudget(Math.min(pool, 12));
    }

    /** Adjust how many embers are active. */
    setBudget(n: number) {
        const clamped = Phaser.Math.Clamp(n, 0, this.sprites.length);
        if (clamped === this.activeCount) return;

        // Activate more
        for (let i = this.activeCount; i < clamped; i++) {
            this.activate(this.sprites[i]);
        }
        // Deactivate extras
        for (let i = clamped; i < this.activeCount; i++) {
            this.deactivate(this.sprites[i]);
        }
        this.activeCount = clamped;
    }

    // ---- internals ----
    private activate(sp: Phaser.GameObjects.Image) {
        sp.setVisible(true);
        this.resetAndTween(sp);
    }

    private deactivate(sp: Phaser.GameObjects.Image) {
        sp.setVisible(false);
        sp.removeAllListeners(); // stop tweens callbacks if any
        (sp.scene.tweens as any).killTweensOf?.(sp);
    }

    private resetAndTween(sp: Phaser.GameObjects.Image) {
        const scene = sp.scene;

        // spawn at random X within band, slight negative/positive Y jitter below base line
        const x = Phaser.Math.Between(-this.areaW / 2, this.areaW / 2);
        const jitter = Phaser.Math.Between(0, 40);
        const y = this.baseY + jitter;

        const scaleStart = Phaser.Math.FloatBetween(0.6, 1.0);
        const scaleEnd = scaleStart * 0.25;
        const alphaStart = Phaser.Math.FloatBetween(0.55, 0.9);
        const rise = Phaser.Math.Between(140, 280);
        const dur = Phaser.Math.Between(1500, 2600);
        const swayX = Phaser.Math.Between(-30, 30);

        sp.setPosition(x, y)
            .setScale(scaleStart)
            .setAlpha(alphaStart)
            .setTint(0xffb15e);

        // two tweens: Y rise + slight X sway + scale/alpha fade
        scene.tweens.add({
            targets: sp,
            y: y - rise,
            x: x + swayX,
            scale: scaleEnd,
            alpha: 0,
            ease: 'Cubic.easeOut',
            duration: dur,
            onComplete: () => {
                // recycle only if still supposed to be active
                if (sp.visible) this.resetAndTween(sp);
            }
        });
    }
}
