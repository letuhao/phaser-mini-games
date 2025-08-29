import { loadObjects } from '../objects/ObjectLoader';
import { LevisR3Objects } from '../config/objects.levisR3';
import { LevisR3Responsive } from '../config/responsive.levisR3';
import { ResponsiveManager } from '../core/ResponsiveManager';
import { ensureBasicTextures } from '../util/ensureBasicTextures';

export class LevisR3WheelScene extends Phaser.Scene {
    private objects!: Record<string, Phaser.GameObjects.GameObject>;
    private responsive!: ResponsiveManager;

    constructor() { super('LevisR3Wheel'); }

    preload() {
        // Load background image
        this.load.image('bg-16x9', 'assets/backgrounds/levisR3_BG.png');
    }

    create() {
        // 1) Make sure textures referenced by object config exist
        ensureBasicTextures(this);

        // 2) Build scene graph using ObjectLoader + config
        this.objects = loadObjects(this, LevisR3Objects);

        // 3) Hook responsive manager
        this.responsive = new ResponsiveManager(this, this.objects, LevisR3Responsive);
        const onResize = () => this.responsive.apply();
        this.scale.on('resize', onResize);
        onResize();
    }
}
