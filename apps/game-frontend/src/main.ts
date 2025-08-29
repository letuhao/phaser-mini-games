import Phaser from 'phaser';
import { AppConfig, CanvasMode } from './appConfig';
import { LevisR3WheelScene } from './scenes/LevisR3WheelScene';

type Size = { width: number; height: number };

function clampDpr(maxDpr: number) {
    // limit DPR for perf/pixel density
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    (window as any).devicePixelRatio = dpr;
}

function readQueryOverrides() {
    if (!AppConfig.allowQueryOverride) return;
    const p = new URLSearchParams(location.search);
    const m = p.get('mode') as CanvasMode | null;
    const w = Number(p.get('w'));
    const h = Number(p.get('h'));
    const t = p.get('transparent');                 // ← "?transparent=1"
    if (m) AppConfig.canvas.mode = m;
    if (!Number.isNaN(w) && w > 0) AppConfig.canvas.width = w;
    if (!Number.isNaN(h) && h > 0) AppConfig.canvas.height = h;
    if (t === '1' || t === 'true') AppConfig.canvas.transparent = true;
}

function computeFitWindow(aspect: number): Size {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const current = vw / vh;
    if (current > aspect) {
        // window is wider -> height bound
        return { width: Math.round(vh * aspect), height: vh };
    } else {
        // window is taller -> width bound
        return { width: vw, height: Math.round(vw / aspect) };
    }
}

function applyCanvasWrapSize(mode: CanvasMode): Size {
    const wrap = document.getElementById('canvas-wrap') as HTMLDivElement;
    const { width, height, aspect } = AppConfig.canvas;

    let final: Size = { width, height };

    if (mode === 'fixed') {
        wrap.style.width = `${width}px`;
        wrap.style.height = `${height}px`;
    } else if (mode === 'fit-parent') {
        // In fit-parent, you can size #canvas-wrap via CSS. If not set, fallback to fixed values.
        const rect = wrap.getBoundingClientRect();
        final = {
            width: Math.round(rect.width || width),
            height: Math.round(rect.height || height),
        };
        // If no explicit CSS size was given, ensure something visible:
        if (!rect.width || !rect.height) {
            wrap.style.width = `${width}px`;
            wrap.style.height = `${height}px`;
        }
    } else if (mode === 'fit-window') {
        final = computeFitWindow(aspect);
        wrap.style.width = `${final.width}px`;
        wrap.style.height = `${final.height}px`;
    }

    return final;
}

let game: Phaser.Game | null = null;

function makeGame(size: { width: number; height: number }) {
    const mode = AppConfig.canvas.mode;

    const scaleConfig =
        mode === 'fixed'
            ? { mode: Phaser.Scale.NONE, width: size.width, height: size.height }
            : { mode: Phaser.Scale.RESIZE };

    const cfg: Phaser.Types.Core.GameConfig = {
        type: Phaser.WEBGL,                           // WEBGL supports alpha nicely
        parent: 'canvas-wrap',
        scale: scaleConfig as any,
        // only set backgroundColor when not transparent
        backgroundColor: AppConfig.canvas.transparent ? undefined : AppConfig.canvas.background,
        render: {
            transparent: AppConfig.canvas.transparent,  // ← the key bit
            premultipliedAlpha: false,                  // safer blending for UI over videos/images
            antialias: true,
            powerPreference: 'high-performance',
            // clearBeforeRender: true, // default; keep if you see smearing artifacts
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 }, // global gravity (rain overrides per-drop if needed)
                debug: false
            }
        },
        scene: [LevisR3WheelScene],
    };
    return new Phaser.Game(cfg);
}

function boot() {
    clampDpr(AppConfig.canvas.maxDevicePixelRatio);
    readQueryOverrides();

    // Minimal DOM: no extra labels/controls present

    const size = applyCanvasWrapSize(AppConfig.canvas.mode);
    game = makeGame(size);

    // Handle window resize when in fit-window or fit-parent
    window.addEventListener('resize', () => {
        if (!game) return;
        const mode = AppConfig.canvas.mode;
        if (mode === 'fit-window' || mode === 'fit-parent') {
            const newSize = applyCanvasWrapSize(mode);
            game.scale.resize(newSize.width, newSize.height);
        }
    });

    // No dev controls; sizing is governed by AppConfig mode and #canvas-wrap CSS
}

boot();

// Optional: expose for iframe host to resize from outside
// parent.postMessage({ type: 'setCanvas', width: 720, height: 1280 }, '*');
(window as any).MiniGames = {
    setCanvasSize: (width: number, height: number) => {
        const wrap = document.getElementById('canvas-wrap') as HTMLDivElement;
        wrap.style.width = `${width}px`;
        wrap.style.height = `${height}px`;
        game?.scale.resize(width, height);
    },
    setMode: (mode: CanvasMode) => {
        AppConfig.canvas.mode = mode;
        const size = applyCanvasWrapSize(mode);
        game?.scale.resize(size.width, size.height);
    }
};
