// apps/game-frontend/src/ui/Button.ts
import Phaser from 'phaser';

type ButtonOpts = {
    text: string;
    width: number;
    height: number;
    onClick: () => void | Promise<void>;
    radius?: number;
};

export class UIButton {
    public readonly root: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Image;
    private label: Phaser.GameObjects.Text;
    private enabled = true;

    constructor(scene: Phaser.Scene, opts: ButtonOpts) {
        this.root = scene.add.container(0, 0).setName('ui-button');

        const key = 'ui-btn-bg';
        if (!scene.textures.exists(key)) {
            const w = 320, h = 120, r = 24;
            const g = scene.add.graphics({ x: 0, y: 0 });
            g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, w, h, r);
            g.lineStyle(4, 0x7c0b0b).strokeRoundedRect(0, 0, w, h, r);
            g.generateTexture(key, w, h); g.destroy();
        }

        this.bg = scene.add.image(0, 0, key).setDisplaySize(opts.width, opts.height).setOrigin(0.5);
        this.bg.setTint(0xffffff);
        this.label = scene.add.text(0, 1, opts.text, {
            fontFamily: 'Arial',
            fontSize: Math.round(opts.height * 0.38) + 'px',
            color: '#a31313',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.root.add([this.bg, this.label]);
        this.root.setSize(opts.width, opts.height);
        this.root.setInteractive(new Phaser.Geom.Rectangle(-opts.width / 2, -opts.height / 2, opts.width, opts.height), Phaser.Geom.Rectangle.Contains);

        // hover effects
        this.root.on('pointerover', () => { if (this.enabled) scene.tweens.add({ targets: this.root, scale: 1.06, duration: 120 }); });
        this.root.on('pointerout', () => scene.tweens.add({ targets: this.root, scale: 1.00, duration: 120 }));
        this.root.on('pointerdown', () => { if (this.enabled) scene.tweens.add({ targets: this.root, scale: 0.97, duration: 80 }); });
        this.root.on('pointerup', async () => {
            if (!this.enabled) return;
            scene.tweens.add({ targets: this.root, scale: 1.06, duration: 80 });
            try { await opts.onClick(); } catch { /* swallow */ }
        });
    }

    setEnabled(v: boolean) {
        this.enabled = v;
        this.root.disableInteractive();
        if (v) this.root.setInteractive();
        this.bg.setTint(v ? 0xffffff : 0xcccccc);
        this.label.setColor(v ? '#a31313' : '#888888');
    }
}
