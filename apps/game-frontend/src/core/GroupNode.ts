// apps/game-frontend/src/core/GroupNode.ts
export class GroupNode extends Phaser.GameObjects.Container {
    private _named: Record<string, Phaser.GameObjects.GameObject> = {};

    constructor(scene: Phaser.Scene, x = 0, y = 0, name?: string) {
        super(scene, x, y);
        if (name) this.setName(name);
        scene.add.existing(this);
    }

    addNamed(id: string, go: Phaser.GameObjects.GameObject) {
        this._named[id] = go;
        go.setName?.(id);
        this.add(go);
        return go;
    }

    getNamed<T extends Phaser.GameObjects.GameObject = Phaser.GameObjects.GameObject>(id: string) {
        return this._named[id] as T | undefined;
    }

    /** Define a rectangular hit area for group-level input. */
    setHitRect(w: number, h: number, originCenter = true) {
        this.setSize(w, h);
        const rect = originCenter
            ? new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h)
            : new Phaser.Geom.Rectangle(0, 0, w, h);
        this.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
        return this;
    }

    /** Show/hide everything quickly. */
    setVisibleDeep(v: boolean) {
        this.iterate((ch: any) => ch?.setVisible?.(v));
        this.setVisible(v);
        return this;
    }

    /** Move the group; optionally update Arcade StaticBody children. */
    moveBy(dx: number, dy: number, updateBodies = false) {
        this.x += dx;
        this.y += dy;
        if (updateBodies) {
            this.iterate((ch: any) => {
                const body = ch?.body;
                if (body?.updateFromGameObject) body.updateFromGameObject();
                else if (body?.position) { body.position.x += dx; body.position.y += dy; }
            });
        }
        return this;
    }

    fadeIn(duration = 200) {
        this.alpha = 0; this.setVisible(true);
        this.scene.tweens.add({ targets: this, alpha: 1, duration, ease: 'Quad.Out' });
        return this;
    }
    
    fadeOut(duration = 200) {
        this.scene.tweens.add({
            targets: this, alpha: 0, duration, ease: 'Quad.In',
            onComplete: () => this.setVisible(false)
        });
        return this;
    }

    setCursor(cursor: string) {
        this.on('pointerover', () => this.scene.input.setDefaultCursor(cursor));
        this.on('pointerout', () => this.scene.input.setDefaultCursor('default'));
        return this;
    }
}
