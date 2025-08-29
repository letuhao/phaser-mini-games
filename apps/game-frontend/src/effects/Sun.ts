import Phaser from 'phaser';
import type { SunObject } from '../objects/types';
import { logDebug } from '../core/Logger';

type Opts = NonNullable<SunObject['options']>;

function R(o?: Opts) {
    const d: Required<Opts> = {
        radius: 18,
        color: 0xfff3c6,
        alpha: 1,
        glow: { radius: 42, alpha: 0.6, color: 0xffe8aa },

        // NEW: pin (disabled by default)
        pinTo: undefined as any,  // { corner:'tl', offsetX:16, offsetY:16 } to enable

        mode: 'static',
        static: { x: 120, y: 80 },
        linear: {
            from: { x: 80, y: 80 }, to: { x: 260, y: 60 },
            duration: 18000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        },
        circle: { cx: 160, cy: 100, r: 120, angularSpeedDeg: 6, phaseDeg: -20, clockwise: true },

        flicker: { amp: 0.05, freq: 0.35 },

        // NEW: aura defaults (subtle)
        aura: {
            enabled: false,
            rate: 0.4,
            life: { min: 600, max: 1400 },
            radius: { min: 1.1, max: 1.25 },       // as multipliers of glow.radius
            thickness: { min: 8, max: 18 },
            edges: { min: 14, max: 22 },
            jitter: 0.22,
            color: 0xfff0bb,
            alpha: { min: 0.18, max: 0.35 },
            rotDegPerSec: { min: -12, max: 12 },
            blend: 'add'
        },

        // NEW: spackle defaults (visible but gentle)
        spackle: {
            enabled: false,
            rate: 1.2,
            maxAlive: 28,
            size: { min: 4, max: 16 },
            life: { min: 700, max: 1800 },
            brightenChance: 0.55,
            brightColor: 0xfff7cc,
            darkColor: 0x000000,
            alpha: { min: 0.25, max: 0.6 },
            textureKey: undefined,
            autoCenter: true,
            clampToDisk: true
        }
    };
    if (!o) return d;
    return {
        radius: o.radius ?? d.radius,
        color: o.color ?? d.color,
        alpha: o.alpha ?? d.alpha,
        glow: {
            radius: o.glow?.radius ?? d.glow.radius,
            alpha: o.glow?.alpha ?? d.glow.alpha,
            color: o.glow?.color ?? d.glow.color,
        },

        pinTo: o.pinTo ?? d.pinTo,

        mode: o.mode ?? d.mode,
        static: o.static ?? d.static,
        linear: {
            from: o.linear?.from ?? d.linear.from,
            to: o.linear?.to ?? d.linear.to,
            duration: o.linear?.duration ?? d.linear.duration,
            yoyo: o.linear?.yoyo ?? d.linear.yoyo,
            repeat: (o.linear?.repeat ?? d.linear.repeat) as any,
            ease: o.linear?.ease ?? d.linear.ease,
        },
        circle: {
            cx: o.circle?.cx ?? d.circle.cx,
            cy: o.circle?.cy ?? d.circle.cy,
            r: o.circle?.r ?? d.circle.r,
            angularSpeedDeg: o.circle?.angularSpeedDeg ?? d.circle.angularSpeedDeg,
            phaseDeg: o.circle?.phaseDeg ?? d.circle.phaseDeg,
            clockwise: o.circle?.clockwise ?? d.circle.clockwise,
        },

        flicker: {
            amp: o.flicker?.amp ?? d.flicker.amp,
            freq: o.flicker?.freq ?? d.flicker.freq,
        },

        aura: { ...d.aura, ...(o.aura ?? {}) },
        spackle: { ...d.spackle, ...(o.spackle ?? {}) }
    };
}

function ensureTexture(scene: Phaser.Scene, key: string, radius: number, color: number, alpha: number, ring = false) {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    const steps = ring ? 24 : 32;
    for (let i = steps; i >= 1; i--) {
        const t = i / steps;
        const a = alpha * (ring ? t * 0.7 : t);
        g.fillStyle(color, a);
        const r = radius * t * (ring ? 1 : 1);
        g.fillCircle(radius, radius, r);
        if (ring && i === steps) {
            // hollow center for ring look
            g.fillStyle(color, 0);
            g.fillCircle(radius, radius, radius * 0.6);
        }
    }
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
}

export class SunBody {
    private opts: ReturnType<typeof R>;
    private depth: number;

    private container!: Phaser.GameObjects.Container;
    private disk!: Phaser.GameObjects.Image;
    private halo!: Phaser.GameObjects.Image;

    private t = 0;
    private theta = 0; // for circle mode

    private auraLayer!: Phaser.GameObjects.Container;
    private spackleLayer!: Phaser.GameObjects.Container;
    private spackleMask!: Phaser.Display.Masks.BitmapMask;
    private auraAcc = 0;
    private spackleAcc = 0;
    private aliveSpots = 0;

    private texOffsetCache: Record<string, { oxNorm: number; oyNorm: number }> = {};

    private dbg = { enabled: false, lastClear: 0 }; // set to false to silence
    private dbgGfx!: Phaser.GameObjects.Graphics;
    private dbgText!: Phaser.GameObjects.Text;
    private dbgCount = 0;

    constructor(private scene: Phaser.Scene, options: Opts | undefined, depth = 39) {
        this.opts = R(options);
        this.depth = depth;

        // textures
        ensureTexture(scene, '__sun_disk', this.opts.radius, this.opts.color, this.opts.alpha, false);
        ensureTexture(scene, '__sun_glow', this.opts.glow.radius ?? 0, this.opts.glow.color ?? 0, this.opts.glow.alpha ?? 0, false);

        this.container = this.scene.add.container(0, 0).setDepth(this.depth);
        this.halo = this.scene.add.image(0, 0, '__sun_glow').setBlendMode(Phaser.BlendModes.ADD);
        this.disk = this.scene.add.image(0, 0, '__sun_disk');
        //this.container.add([this.halo, this.disk]);

        // layer order: halo (outer) → aura (edge wisps) → disk → spackle (on top of disk)
        this.auraLayer = this.scene.add.container(0, 0);
        this.spackleLayer = this.scene.add.container(0, 0);
        this.container.add([this.halo, this.auraLayer, this.disk, this.spackleLayer]);

        // mask spackle to the sun disk
        this.spackleMask = this.disk.createBitmapMask();
        this.spackleLayer.setMask(this.spackleMask);

        // pin-to-corner reacts to resize
        this.scene.scale.on('resize', () => this.applyPin());
        this.applyPin();

        // initial position
        const p = this.initialPos();
        this.container.setPosition(p.x, p.y);

        if (this.opts.mode === 'linear') {
            // tween the container automatically
            const lin = this.opts.linear;
            this.container.setPosition(lin.from.x, lin.from.y);
            this.scene.tweens.add({
                targets: this.container,
                x: lin.to.x, y: lin.to.y,
                duration: lin.duration,
                yoyo: lin.yoyo,
                repeat: lin.repeat as any,
                ease: lin.ease
            });
        } else if (this.opts.mode === 'circle') {
            this.theta = Phaser.Math.DegToRad(this.opts.circle.phaseDeg ?? 0);
        }

        this.scene.events.on('update', this.update, this);

        this.dbgGfx = this.scene.add.graphics().setDepth(this.depth + 10);
        this.dbgText = this.scene.add.text(8, 8, '', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffeb99'
        }).setScrollFactor(0).setDepth(9999);
    }

    destroy() {
        this.scene.events.off('update', this.update, this);
        this.container.destroy();
    }

    private debugSpot(spot: Phaser.GameObjects.Image, info: { size: number; fw: number; fh: number; brighten: boolean }) {
        if (!this.dbg.enabled) return;

        // clear old strokes every ~0.5s to avoid clutter
        const now = performance.now();
        if (now - this.dbg.lastClear > 500) {
            this.dbgGfx.clear();
            this.dbg.lastClear = now;
        }

        // world position of the spot
        const wx = this.container.x + spot.x;
        const wy = this.container.y + spot.y;

        // draw a small cross + circle of the display radius
        const radius = (spot.displayWidth / 2);
        const color = info.brighten ? 0x00ff88 : 0xff6688;
        this.dbgGfx.lineStyle(1, color, 1);
        this.dbgGfx.strokeCircle(wx, wy, Math.max(4, radius));
        this.dbgGfx.strokeLineShape(new Phaser.Geom.Line(wx - 6, wy, wx + 6, wy));
        this.dbgGfx.strokeLineShape(new Phaser.Geom.Line(wx, wy - 6, wx, wy + 6));

        // HUD text
        this.dbgCount++;
        this.dbgText.setText(
            `SUN·SPACKLE DEBUG
            spawns: ${this.dbgCount}
            spot@(${wx.toFixed(1)}, ${wy.toFixed(1)})
            size req: ${info.size}px  disp: ${spot.displayWidth.toFixed(1)}px
            frame: ${info.fw}×${info.fh}  scale: ${spot.scaleX.toFixed(2)}`
        );

        // console line (for deeper digging)
        // eslint-disable-next-line no-console
        logDebug('Sun', 'spackle', {
            world: { x: wx, y: wy },
            local: { x: spot.x, y: spot.y },
            requestSize: info.size,
            display: { w: spot.displayWidth, h: spot.displayHeight },
            frame: { w: info.fw, h: info.fh },
            scale: { x: spot.scaleX, y: spot.scaleY },
            brighten: info.brighten
        });
    }

    private applyPin() {
        const p = this.opts.pinTo;
        if (!p) return;
        const w = this.scene.scale.width, h = this.scene.scale.height;
        const offX = p.offsetX ?? 16, offY = p.offsetY ?? 16;
        let x = offX, y = offY;
        if (p.corner.includes('r')) x = w - offX;
        if (p.corner.includes('b')) y = h - offY;
        this.container.setPosition(x, y);
    }

    private initialPos() {
        if (this.opts.mode === 'static') return this.opts.static;
        if (this.opts.mode === 'linear') return this.opts.linear.from;
        if (this.opts.mode === 'circle') {
            const c = this.opts.circle;
            return {
                x: c.cx + Math.cos(Phaser.Math.DegToRad(c.phaseDeg ?? 0)) * c.r,
                y: c.cy + Math.sin(Phaser.Math.DegToRad(c.phaseDeg ?? 0)) * c.r
            };
        }
        return { x: 120, y: 80 };
    }

    private spawnAura() {
        if (!this.opts.aura.enabled) return;
        const A = this.opts.aura;
        const life = Phaser.Math.Between(A.life?.min ?? 0, A.life?.max ?? 0);
        const edges = Phaser.Math.Between(A.edges?.min ?? 0, A.edges?.max ?? 0);
        const outerR = (this.opts.glow.radius ?? 0) * Phaser.Math.FloatBetween(A.radius?.min ?? 0, A.radius?.max ?? 0);
        const thick = Phaser.Math.Between(A.thickness?.min ?? 0, A.thickness?.max ?? 0);
        const innerR = Math.max(2, outerR - thick);
        const jitter = Phaser.Math.Clamp(A.jitter ?? 0, 0, 1);
        const col = A.color;
        const alpha0 = Phaser.Math.FloatBetween(A.alpha?.min ?? 0, A.alpha?.max ?? 0);
        const rotSpd = Phaser.Math.FloatBetween(A.rotDegPerSec?.min ?? 0, A.rotDegPerSec?.max ?? 0);

        const g = this.scene.add.graphics().setBlendMode(A.blend === 'screen' ? Phaser.BlendModes.SCREEN : Phaser.BlendModes.ADD);
        g.setAlpha(alpha0);

        const draw = (t: number) => {
            g.clear();
            g.fillStyle(col ?? 0, g.alpha);
            g.beginPath();
            // outer ring
            for (let i = 0; i <= edges; i++) {
                const u = i / edges;
                const ang = u * Math.PI * 2;
                const jr = 1 + (Math.sin((u + t) * Math.PI * 4 + i) * 0.5 + Math.cos((u - t) * Math.PI * 3)) * 0.2 * jitter;
                const r = outerR * jr;
                const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
                if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            // inner ring (reverse)
            for (let i = edges; i >= 0; i--) {
                const u = i / edges;
                const ang = u * Math.PI * 2;
                const jr = 1 + (Math.sin((u - t) * Math.PI * 4 + i * 0.7) * 0.5) * 0.15 * jitter;
                const r = innerR * jr;
                const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
                g.lineTo(x, y);
            }
            g.closePath();
            g.fillPath();
        };
        draw(0);

        const holder = this.scene.add.container(0, 0, [g]);
        this.auraLayer.add(holder);

        // animate: slow rotate + fade/scale out
        this.scene.tweens.add({
            targets: holder,
            angle: `+=${rotSpd * (life / 1000)}`,
            duration: life,
            ease: 'Linear'
        });
        this.scene.tweens.add({
            targets: g,
            alpha: 0,
            scaleX: 1.06,
            scaleY: 1.06,
            duration: life,
            ease: 'Quad.easeOut',
            onUpdate: (tw, tgo: any) => {
                // wiggle edges over time
                const t = (tw.progress);
                draw(t);
            },
            onComplete: () => holder.destroy()
        });
    }

    private getTextureNormalizedOffset(key: string) {
        if (this.texOffsetCache[key]) return this.texOffsetCache[key];

        const tex = this.scene.textures.get(key);
        if (!tex) return { oxNorm: 0, oyNorm: 0 };

        // get the source image and scan alpha
        const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        const w = src.width, h = src.height;
        if (!w || !h) return { oxNorm: 0, oyNorm: 0 };

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(src, 0, 0);

        const data = ctx.getImageData(0, 0, w, h).data;
        let minX = w, minY = h, maxX = 0, maxY = 0, found = false;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const a = data[(y * w + x) * 4 + 3];
                if (a > 16) { // threshold
                    found = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        let oxNorm = 0, oyNorm = 0;
        if (found) {
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            // normalized offset so 0.5 is the frame center
            oxNorm = 0.5 - (cx / w);
            oyNorm = 0.5 - (cy / h);
        }

        const off = { oxNorm, oyNorm };
        this.texOffsetCache[key] = off;
        return off;
    }

    private spawnSpackle() {
        const S = this.opts.spackle;
        if (!S?.enabled) return;
        if (this.aliveSpots >= (S.maxAlive ?? 20)) return;

        // ----- pick size (optionally clamp to disk) -----
        const reqSize = Phaser.Math.Between(S.size?.min ?? 0, S.size?.max ?? 0);
        const maxSize = (S.clampToDisk ?? true) ? Math.max(2, this.opts.radius * 2 - 2) : Number.POSITIVE_INFINITY;
        const size = Math.min(reqSize, maxSize);

        const life = Phaser.Math.Between(S.life?.min ?? 0, S.life?.max ?? 0);
        const brighten = Math.random() < (S.brightenChance ?? 0.5);

        // choose a texture (pool or single)
        const keys: string[] | undefined = (S as any).textureKeys;
        const key = keys?.length ? keys[Math.floor(Math.random() * keys.length)] : S.textureKey;

        // create image
        let spot: Phaser.GameObjects.Image;
        if (key && this.scene.textures.exists(key)) {
            spot = this.scene.add.image(0, 0, key).setOrigin(0.5);
        } else {
            spot = this.makeProceduralSpot(size, brighten); // already centered
        }

        // scale by frame so 'size' is the final display diameter
        const fw = spot.frame?.realWidth ?? spot.frame?.width ?? spot.width;
        const fh = spot.frame?.realHeight ?? spot.frame?.height ?? spot.height;
        spot.setScale(size / Math.max(1, fw), size / Math.max(1, fh));

        // visual
        spot
            .setBlendMode(brighten ? Phaser.BlendModes.ADD : Phaser.BlendModes.MULTIPLY)
            .setTint(brighten ? (S.brightColor ?? 0xfff7cc) : (S.darkColor ?? 0x000000))
            .setAlpha(Phaser.Math.FloatBetween(S.alpha?.min ?? 0, S.alpha?.max ?? 0));

        // ----- random position INSIDE disk (local space) -----
        const R = this.opts.radius * 0.98;
        const r = R * Math.sqrt(Math.random());
        const ang = Math.random() * Math.PI * 2;
        let localX = r * Math.cos(ang);
        let localY = r * Math.sin(ang);

        // ----- auto-center PNG content so the *visible* blob is centered -----
        if (key && (S.autoCenter ?? true)) {
            const { oxNorm, oyNorm } = this.getTextureNormalizedOffset(key);
            // convert normalized offset to display pixels
            localX += (oxNorm * size);
            localY += (oyNorm * size);
        }

        // optional manual fine-tune
        if (S.contentOffset) {
            localX += S.contentOffset.x;
            localY += S.contentOffset.y;
        }

        spot.setPosition(localX, localY);

        // add + mask
        this.spackleLayer.add(spot);
        this.aliveSpots++;

        this.scene.tweens.add({
            targets: spot,
            alpha: 0,
            duration: life,
            ease: 'Sine.easeInOut',
            onComplete: () => { spot.destroy(); this.aliveSpots--; }
        });

        // (keep your debug call if you want)
        this.debugSpot?.(spot, { size, fw, fh, brighten });
    }


    private makeProceduralSpot(size: number, brighten: boolean) {
        const g = this.scene.add.graphics();
        const steps = 6 + Math.floor(Math.random() * 10);
        const r0 = size * (brighten ? 0.7 : 1);
        const cx = size, cy = size; // center draw in positive coords

        g.fillStyle(0xffffff, 1);
        g.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps, ang = t * Math.PI * 2;
            const jr = 1 + (Math.sin(i * 1.7) + Math.cos(i * 2.1)) * 0.12;
            const rr = r0 * jr;
            const x = cx + Math.cos(ang) * rr;
            const y = cy + Math.sin(ang) * rr;
            if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fillPath();

        const key = `__spot_${Math.floor(r0)}_${brighten ? 'b' : 'd'}_${Math.floor(Math.random() * 1e6)}`;
        g.generateTexture(key, size * 2, size * 2);
        g.destroy();
        return this.scene.add.image(0, 0, key).setOrigin(0.5);
    }

    update(_time: number, deltaMs: number) {
        this.t += deltaMs / 1000;

        // pin takes precedence over other motion
        if (this.opts.pinTo) {
            this.applyPin();
        } else if (this.opts.mode === 'circle') {
            const c = this.opts.circle;
            const dir = (c.clockwise ? 1 : -1);
            this.theta += dir * Phaser.Math.DegToRad(c.angularSpeedDeg ?? 0) * (deltaMs / 1000);
            const x = c.cx + Math.cos(this.theta) * c.r;
            const y = c.cy + Math.sin(this.theta) * c.r;
            this.container.setPosition(x, y);
        }

        // subtle flicker (keep your code)
        const f = this.opts.flicker;
        if ((f.amp ?? 0) > 0) {
            const aMul = 1 + Math.sin(this.t * ((f.freq ?? 0) * Math.PI * 2)) * (f.amp ?? 0);
            this.disk.setScale(aMul);
            this.halo.setScale(aMul * 1.02);
        }

        // spawn aura
        if (this.opts.aura.enabled) {
            this.auraAcc += deltaMs / 1000;
            const interval = 1 / Math.max(0.0001, this.opts.aura.rate ?? 0);
            while (this.auraAcc >= interval) {
                this.auraAcc -= interval;
                this.spawnAura();
            }
        }

        // SPAWN: accumulator-driven
        if (this.opts.spackle?.enabled) {
            this.spackleAcc += deltaMs / 1000;
            const interval = 1 / Math.max(0.0001, this.opts.spackle?.rate ?? 0);
            while (this.spackleAcc >= interval) {
                this.spackleAcc -= interval;
                this.spawnSpackle();
            }
        }
    }

    /** For other systems to follow/collide with etc. */
    getGameObject() { return this.container; }
    getCenter() { return new Phaser.Math.Vector2(this.container.x, this.container.y); }
}
