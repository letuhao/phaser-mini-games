// apps/game-frontend/src/appConfig.ts
export type CanvasMode = 'fixed' | 'fit-parent' | 'fit-window';

export const AppConfig = {
  canvas: {
    mode: 'fixed' as CanvasMode,
    width: 1280,
    height: 720,
    maxDevicePixelRatio: 1.5,
    background: '#06121b',      // old default bg (ignored when transparent is true)
    aspect: 1280 / 720,
    transparent: true,          // ← enable transparent canvas
  },
  allowQueryOverride: true,     // supports ?transparent=1 (see below)
};
