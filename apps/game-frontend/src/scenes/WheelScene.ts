import Phaser from 'phaser';
import { loadObjects } from '../objects/ObjectLoader';
import { DemoObjects } from '../objects/demoConfig';

export class WheelScene extends Phaser.Scene {
  private objects!: ReturnType<typeof loadObjects>;

  constructor() { super('Wheel'); }

  preload() {
    // TODO: replace with real assets
    // this.load.image('bgTexture', '/public/bg.jpg');
    this.load.image('wheel', 'wheel.png');      // put placeholder in /public or adjust path
    this.load.image('pointer', 'pointer.png');
  }

  create() {
    const made = loadObjects(this, DemoObjects);

    // size ground to canvas bottom
    const ground = this.children.getByName('ground') as Phaser.GameObjects.Rectangle;
    if (ground) {
      const body = ground.body as Phaser.Physics.Arcade.StaticBody;
      const resizeGround = () => {
        const h = this.scale.height;
        ground.setPosition(0, h - 12);          // bottom
        ground.setDisplaySize(this.scale.width, 12);
        ground.setSize(this.scale.width, 12);   // collider
        body.updateFromGameObject();
      };
      resizeGround();
      this.scale.on('resize', resizeGround);

      // DEBUG: make it faintly visible
      ground.setFillStyle(0x00ff00, 0.2);
    }
  }
}
