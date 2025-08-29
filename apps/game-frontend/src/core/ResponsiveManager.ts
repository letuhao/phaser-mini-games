// apps/game-frontend/src/core/ResponsiveManager.ts
import Phaser from 'phaser';

export type Range = { min?: number; max?: number };
export type RespCondition = { width?: Range; height?: Range; aspect?: Range; dpr?: Range; };
export type Transform = { scale?: number; x?: number; y?: number; visible?: boolean; maxParticles?: number; };
export type Profile = {
    name: string; priority?: number;
    condition: RespCondition;
    canvas?: { width: number; height: number };
    layers: Record<string, Transform>;
};
export type ResponsiveConfig = {
    profiles: Profile[];
    groups: Record<string, string[]>; // layer -> object id list
    fallbackScale?: { min: number; max: number };
};

type ObjMap = Record<string, Phaser.GameObjects.GameObject>;

export class ResponsiveManager {
    private current?: Profile;
    private applying = false;

    constructor(private scene: Phaser.Scene, private objects: ObjMap, private cfg: ResponsiveConfig) { }

    apply = () => {
        if (this.applying) return;            // 🔒 prevent recursive entry
        this.applying = true;
        try {
            const vw = (this.scene.scale.parent as HTMLDivElement)?.clientWidth || window.innerWidth;
            const vh = (this.scene.scale.parent as HTMLDivElement)?.clientHeight || window.innerHeight;
            const aspect = vw / Math.max(1, vh);
            const dpr = window.devicePixelRatio || 1;

            const next = this.pick({ vw, vh, aspect, dpr });

            // ✅ only resize if actually different to avoid triggering resize events unnecessarily
            if (next?.canvas) {
                const cw = next.canvas.width, ch = next.canvas.height;
                if (cw !== this.scene.scale.width || ch !== this.scene.scale.height) {
                    this.scene.scale.resize(cw, ch);
                }
            }

            if (!this.current || this.current.name !== next?.name) {
                next ? this.applyLayerSet(next) : this.fallbackScale(vw, vh);
                this.current = next;
            } else if (next) {
                this.applyLayerSet(next);
            }
        } finally {
            this.applying = false;              // 🔓 release
        }
    };

    private pick(s: { vw: number; vh: number; aspect: number; dpr: number }): Profile | undefined {
        const inR = (r?: Range, v?: number) => !r || ((r.min == null || v! >= r.min) && (r.max == null || v! <= r.max));
        return [...this.cfg.profiles].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
            .find(p => inR(p.condition.width, s.vw) && inR(p.condition.height, s.vh) && inR(p.condition.aspect, s.aspect) && inR(p.condition.dpr, s.dpr));
    }

    private applyLayerSet(p: Profile) {
        for (const [layer, t] of Object.entries(p.layers)) {
            const ids = this.cfg.groups[layer] || [];
            for (const id of ids) {
                const go = this.objects[id]; if (!go) continue;
                if (t.visible != null) (go as any).setVisible?.(t.visible);
                if (typeof t.x === 'number') (go as any).x = t.x;
                if (typeof t.y === 'number') (go as any).y = t.y;
                if (typeof t.scale === 'number') (go as any).setScale?.(t.scale);

                const body = (go as any).body;
                if (body && body instanceof Phaser.Physics.Arcade.StaticBody) body.updateFromGameObject();
            }
            if (t.maxParticles != null) this.scene.events.emit('FX_SET_MAX_PARTICLES', t.maxParticles);
        }
    }

    private fallbackScale(vw: number, vh: number) {
        const cw = this.scene.scale.width, ch = this.scene.scale.height;
        const s = Math.min(vw / cw, vh / ch);
        const k = Math.max(this.cfg.fallbackScale?.min ?? 0.5, Math.min(this.cfg.fallbackScale?.max ?? 1.2, s));
        const ids = new Set(Object.values(this.cfg.groups).flat());
        const all = ids.size ? [...ids] : Object.keys(this.objects);
        for (const id of all) {
            // Skip footer objects to prevent text distortion
            if (id === 'footer' || id === 'footer-bg' || id === 'footer-text') continue;
            
            const go = this.objects[id];
            (go as any).setScale?.(k);
            const body = (go as any).body;
            if (body && body instanceof Phaser.Physics.Arcade.StaticBody) body.updateFromGameObject();
        }
    }
}
