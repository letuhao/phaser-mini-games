// apps/game-frontend/src/effects/StarGrow.ts
import Phaser from 'phaser';

type Opts = {
    count?: number;
    positions?: { x: number; y: number }[];
    tint?: number;
    minScale?: number; maxScale?: number;
    periodMs?: number;
};

export class StarGrow {
    public readonly root: Phaser.GameObjects.Container;
    private stars: Phaser.GameObjects.Image[] = [];

    constructor(scene: Phaser.Scene, opts: Opts = {}) {
        this.root = scene.add.container(0, 0).setName('stars-grow');

        // generate star texture
        const key = 'fx-star5';
        if (!scene.textures.exists(key)) {
            const g = scene.add.graphics({ x: 0, y: 0 });
            g.clear();
            g.fillStyle(0xffffff, 1);
            const R = 36, r = 16, cx = R + 4, cy = R + 4;
            for (let i = 0; i < 5; i++) {
                const a = (i * 72 - 90) * Phaser.Math.DEG_TO_RAD;
                const b = a + 36 * Phaser.Math.DEG_TO_RAD;
                if (i === 0) g.beginPath().moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
                g.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r);
                const a2 = ((i + 1) * 72 - 90) * Phaser.Math.DEG_TO_RAD;
                g.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
            }
            g.closePath().fillPath();
            g.generateTexture(key, (R + 6) * 2, (R + 6) * 2); g.destroy();
        }

        const count = opts.count ?? 4;
        const positions = opts.positions ?? Array.from({ length: count }, (_, i) => ({ x: -400 + i * 200, y: -260 + i * 60 }));
        const tint = opts.tint ?? 0xfff2b8;
        const minS = opts.minScale ?? 0.7, maxS = opts.maxScale ?? 1.2;
        const period = opts.periodMs ?? 1600;

        for (let i = 0; i < count; i++) {
            const p = positions[i % positions.length];
            const s = scene.add.image(p.x, p.y, key).setTint(tint).setScale(minS).setAlpha(0.9);
            s.setBlendMode(Phaser.BlendModes.SCREEN);
            this.root.add(s);
            this.stars.push(s);

            scene.tweens.add({
                targets: s,
                scale: { from: minS, to: maxS },
                duration: period + i * 140,
                yoyo: true, repeat: -1,
                ease: 'Sine.inOut'
            });
        }
    }

    setBudget(n: number) {
        const vis = Phaser.Math.Clamp(Math.floor(n / 60), 2, this.stars.length);
        this.stars.forEach((s, i) => s.setVisible(i < vis));
    }
}
