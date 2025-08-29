import { loadObjects } from '../objects/ObjectLoader';
import { LevisR3Objects } from '../config/objects.levisR3';
import { LevisR3Responsive } from '../config/responsive.levisR3';
import { ResponsiveManager } from '../core/ResponsiveManager';
import { ensureBasicTextures } from '../util/ensureBasicTextures';
import { Fireflies } from '../effects/Fireflies';
import { Embers } from '../effects/Embers';
import { StarGrow } from '../effects/StarGrow';
import { UIButton } from '../ui/Button';
import { GrowText } from '../ui/GrowText';

export class LevisR3WheelScene extends Phaser.Scene {
    private objects!: Record<string, Phaser.GameObjects.GameObject>;
    private responsive!: ResponsiveManager;

    constructor() { super('LevisR3Wheel'); }

    preload() {
        // Load assets
        this.load.image('bg-16x9', 'assets/backgrounds/levisR3_BG.png');
        // The textures below are generated at runtime.
    }

    create() {
        // 1) Make sure textures referenced by object config exist
        ensureBasicTextures(this);

        // 2) Build scene graph using YOUR ObjectLoader + our new config
        this.objects = loadObjects(this, LevisR3Objects);

        // 3) Add effects INTO the loaded containers (re-using their IDs)
        const fxBack = this.objects['fx-back'] as Phaser.GameObjects.Container;
        const fxFront = this.objects['fx-front'] as Phaser.GameObjects.Container;

        const fireflies = new Fireflies(this, { count: 36, area: { w: 1600, h: 900 }, speed: 12 });
        fxBack.add(fireflies.root);

        const embers = new Embers(this, { count: 28, area: { w: 1200, h: 500 }, baseY: 700 });
        fxFront.add(embers.root);
        this.events.on('FX_SET_MAX_PARTICLES', (n: number) => embers.setBudget(n));

        const stars = new StarGrow(this, {
            count: 5,
            positions: [{ x: -520, y: 220 }, { x: -380, y: 420 }, { x: 540, y: -120 }, { x: 620, y: 120 }, { x: 420, y: 360 }],
            tint: 0xffe6a1, minScale: 0.6, maxScale: 1.15, periodMs: 1800
        });
        fxFront.add(stars.root);

        // 4) Build the wheel inside 'wheel-root' (kept as before)
        const wheelRoot = this.objects['wheel-root'] as Phaser.GameObjects.Container;
        this.buildWheelInto(wheelRoot);

        // 5) Upgrade UI: replace placeholder title with GrowText and create buttons
        const ui = this.objects['ui'] as Phaser.GameObjects.Container;
        const title = new GrowText(this, {
            text: 'HAPPY MID AUTUMN FESTIVAL',
            style: { fontFamily: 'Arial', fontSize: '56px', color: '#FFE8C9', fontStyle: 'bold' }
        });
        title.root.setPosition(-520, -260).setName('title'); // same id reserved in objects
        // Remove text placeholder (if any) and add animated one
        (this.objects['title'] as Phaser.GameObjects.Text)?.destroy();
        ui.add(title.root);
        this.objects['title'] = title.root;

        const btnSpin = new UIButton(this, {
            text: 'QUAY', width: 220, height: 80,
            onClick: async () => { /* hook to backend then spin */ await this.startSpin(); }
        });
        btnSpin.root.setPosition(0, 280).setName('btn-spin');
        ui.add(btnSpin.root); this.objects['btn-spin'] = btnSpin.root;

        const btnRules = new UIButton(this, { text: 'THỂ LỆ', width: 180, height: 60, onClick: () => this.showRules() });
        btnRules.root.setPosition(-240, 360).setName('btn-rules');
        ui.add(btnRules.root); this.objects['btn-rules'] = btnRules.root;

        const btnTerms = new UIButton(this, { text: 'ĐIỀU KIỆN VOUCHER', width: 280, height: 60, onClick: () => this.showTerms() });
        btnTerms.root.setPosition(240, 360).setName('btn-terms');
        ui.add(btnTerms.root); this.objects['btn-terms'] = btnTerms.root;

        // 6) Hook responsive manager (targets the same IDs)
        this.responsive = new ResponsiveManager(this, this.objects, LevisR3Responsive);
        const onResize = () => this.responsive.apply();
        this.scale.on('resize', onResize);
        onResize();

        // Optional: FX budgets via responsive
        this.events.on('FX_SET_MAX_PARTICLES', (n: number) => {
            fireflies.setBudget(n);
            embers.setBudget(n);
            stars.setBudget(Math.max(3, Math.min(8, Math.floor(n / 50))));
        });
    }

    private buildWheelInto(root: Phaser.GameObjects.Container) {
        const R = 250, slices = 8;
        const g = this.add.graphics().setName('wheel-graphics');
        for (let i = 0; i < slices; i++) {
            const start = (i / slices) * Phaser.Math.PI2;
            const end = ((i + 1) / slices) * Phaser.Math.PI2;
            const color = i % 2 === 0 ? 0xb70000 : 0xffefcf;
            g.fillStyle(color, 1);
            g.slice(0, 0, R, start, end, false).fillPath();
        }
        g.lineStyle(16, 0xffffff, 1).strokeCircle(0, 0, R + 8);
        root.add(g);

        const labels = ['NÓN LEVI’S', 'E-VOUCHER', 'TÚI LEVI’S', 'GỐI CỔ', 'E-VOUCHER', 'TÚI TOTE', 'E-VOUCHER', 'CHÚC BẠN MAY MẮN'];
        for (let i = 0; i < slices; i++) {
            const mid = ((i + 0.5) / slices) * Phaser.Math.PI2;
            const tx = this.add.text(Math.cos(mid) * R * 0.6, Math.sin(mid) * R * 0.6, labels[i], {
                fontFamily: 'Arial', fontSize: '20px', color: i % 2 ? '#b70000' : '#7a0000'
            }).setOrigin(0.5);
            root.add(tx);
        }

        const pointer = this.add.triangle(0, -(R + 30), 0, 0, 30, 60, -30, 60, 0xffe6a1).setStrokeStyle(4, 0x6b3b00);
        root.add(pointer);

        // rotate the whole root on spin
        this.objects['wheel-spin-node'] = root;
    }

    private async startSpin() {
        const { angle, durationMs } = await this.fakeBackendSpin();
        const node = this.objects['wheel-spin-node'] as Phaser.GameObjects.Container;
        this.tweens.add({
            targets: node,
            angle: node.angle + angle + 1080,
            duration: durationMs,
            ease: 'Cubic.easeOut',
            onComplete: () => this.showResult('KẾT QUẢ', 'Xin chúc mừng!')
        });
    }

    private async fakeBackendSpin() {
        const slices = 8;
        const target = Phaser.Math.Between(0, slices - 1);
        const sliceAngle = 360 / slices;
        const needleOffset = -90;
        const node = this.objects['wheel-spin-node'] as Phaser.GameObjects.Container;
        const angle = (sliceAngle * target) - node.angle - needleOffset;
        return { angle, durationMs: 2600 + Phaser.Math.Between(0, 600) };
    }

    private showRules() { this.showResult('THỂ LỆ', '• 1 lượt / hóa đơn hợp lệ\n• Không cộng dồn CTKM khác\n• ...'); }
    private showTerms() { this.showResult('ĐIỀU KIỆN VOUCHER', '• Áp dụng tại cửa hàng chỉ định\n• Không quy đổi tiền mặt\n• ...'); }

    private showResult(title: string, body: string) {
        const modal = this.objects['modal'] as Phaser.GameObjects.Container;
        modal.removeAll(true);

        const w = 520, h = 300;
        const panel = this.add.graphics();
        panel.fillStyle(0x1b0d0d, 0.94).fillRoundedRect(-w / 2, -h / 2, w, h, 18)
            .lineStyle(2, 0xffe6a1).strokeRoundedRect(-w / 2, -h / 2, w, h, 18);

        const titleTxt = this.add.text(0, -h / 2 + 32, title, { fontSize: '28px', color: '#FFE6A1', fontStyle: 'bold' }).setOrigin(0.5, 0);
        const bodyTxt = this.add.text(0, -h / 2 + 80, body, { fontSize: '18px', color: '#fff' }).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(w - 60);

        const close = new UIButton(this, { text: 'ĐÓNG', width: 120, height: 44, onClick: () => { modal.setVisible(false); } });
        close.root.setPosition(0, h / 2 - 40);

        modal.add(this.add.container(0, 0, [panel, titleTxt, bodyTxt, close.root]).setName('modal-root').setDepth(9999));
        modal.setVisible(true);
    }
}
