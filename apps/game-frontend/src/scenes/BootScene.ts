import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() { }

  create() {
    // create a tiny 2×2 white texture called 'px'
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
    g.generateTexture('px', 2, 2);
    g.destroy();

    this.scene.start('Wheel');
  }
}
