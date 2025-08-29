// apps/game-frontend/src/effects/Fireflies.ts
import Phaser from 'phaser';

type Opts = { count?: number; area?: { w: number; h: number }; speed?: number; };

export class Fireflies {
    public readonly root: Phaser.GameObjects.Container;
    private sprites: Phaser.GameObjects.Image[] = [];
    private seeds: number[] = [];
    private speed: number;
    private area: { w: number; h: number };

    constructor(private scene: Phaser.Scene, opts: Opts = {}) {
        this.root = scene.add.container(0, 0).setName('fireflies');
        const count = opts.count ?? 24;
        this.area = opts.area ?? { w: 1200, h: 800 };
        this.speed = opts.speed ?? 10;

        // tiny glow texture
        const key = 'fx-firefly';
        if (!scene.textures.exists(key)) {
            const g = scene.add.graphics({ x: 0, y: 0 });
            g.fillStyle(0xffffff, 1).fillCircle(8, 8, 3);
            g.generateTexture(key, 16, 16); g.destroy();
        }

        for (let i = 0; i < count; i++) {
            const sp = scene.add.image(
                Phaser.Math.Between(-this.area.w / 2, this.area.w / 2),
                Phaser.Math.Between(-this.area.h / 2, this.area.h / 2),
                key
            ).setTint(0xfff3b1).setAlpha(0.85);
            sp.setBlendMode(Phaser.BlendModes.ADD);
            this.root.add(sp);
            this.sprites.push(sp);
            this.seeds.push(Math.random() * 1000);

            scene.tweens.add({
                targets: sp, alpha: { from: 0.4, to: 1.0 }, duration: 1200 + Math.random() * 1200,
                yoyo: true, repeat: -1
            });
        }

        scene.events.on('update', this.update, this);
    }

    private update(_t: number, dt: number) {
        const d = (dt / 1000) * this.speed;
        for (let i = 0; i < this.sprites.length; i++) {
            const s = this.sprites[i];
            const seed = this.seeds[i];
            s.x += Math.sin(seed + s.y * 0.015) * d * 6;
            s.y += Math.cos(seed + s.x * 0.01) * d * 2;

            // wrap
            if (s.x < -this.area.w / 2) s.x += this.area.w;
            if (s.x > this.area.w / 2) s.x -= this.area.w;
            if (s.y < -this.area.h / 2) s.y += this.area.h;
            if (s.y > this.area.h / 2) s.y -= this.area.h;
        }
    }

    setBudget(n: number) {
        const target = Phaser.Math.Clamp(Math.floor(n / 8), 8, 80);
        // show/hide but keep objects (no churn)
        for (let i = 0; i < this.sprites.length; i++) this.sprites[i].setVisible(i < target);
    }
}
