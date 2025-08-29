// apps/game-frontend/src/ui/GrowText.ts
import Phaser from 'phaser';

type Opts = { text: string; style?: Phaser.Types.GameObjects.Text.TextStyle; };
export class GrowText {
    public readonly root: Phaser.GameObjects.Container;
    private t: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, opts: Opts) {
        this.t = scene.add.text(0, 0, opts.text, opts.style).setOrigin(0.5);
        this.root = scene.add.container(0, 0, [this.t]).setName('grow-text');

        // slow pulse
        scene.tweens.add({
            targets: this.root,
            scale: { from: 0.98, to: 1.02 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }

    setText(s: string) { this.t.setText(s); }
}
