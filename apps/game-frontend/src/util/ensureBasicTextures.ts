import Phaser from 'phaser';

export function ensureBasicTextures(scene: Phaser.Scene) {
    if (!scene.textures.exists('bg-red')) {
        const g = scene.add.graphics({ x: 0, y: 0 });
        g.fillStyle(0x8a0e0e, 1).fillRect(0, 0, 1920, 1080);
        g.generateTexture('bg-red', 1920, 1080); g.destroy();
    }
    if (!scene.textures.exists('ui-btn-bg')) {
        const w = 320, h = 120, r = 24;
        const g = scene.add.graphics({ x: 0, y: 0 });
        g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, w, h, r);
        g.lineStyle(4, 0x7c0b0b).strokeRoundedRect(0, 0, w, h, r);
        g.generateTexture('ui-btn-bg', w, h); g.destroy();
    }
    if (!scene.textures.exists('fx-star5')) {
        const g = scene.add.graphics({ x: 0, y: 0 });
        const R = 36, r = 16, cx = R + 4, cy = R + 4;
        g.fillStyle(0xffffff, 1);
        for (let i = 0; i < 5; i++) {
            const a = (i * 72 - 90) * Phaser.Math.DEG_TO_RAD;
            const b = a + 36 * Phaser.Math.DEG_TO_RAD;
            if (i === 0) g.beginPath().moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            g.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r);
            const a2 = ((i + 1) * 72 - 90) * Phaser.Math.DEG_TO_RAD;
            g.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
        }
        g.closePath().fillPath();
        g.generateTexture('fx-star5', (R + 6) * 2, (R + 6) * 2); g.destroy();
    }
    if (!scene.textures.exists('fx-firefly')) {
        const g = scene.add.graphics({ x: 0, y: 0 });
        g.fillStyle(0xffffff, 1).fillCircle(8, 8, 3);
        g.generateTexture('fx-firefly', 16, 16); g.destroy();
    }
    if (!scene.textures.exists('fx-ember')) {
        const g = scene.add.graphics({ x: 0, y: 0 });
        g.fillStyle(0xffffff, 1).fillCircle(6, 6, 3);
        g.generateTexture('fx-ember', 12, 12); g.destroy();
    }
}
