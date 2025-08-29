// apps/game-frontend/src/appConfig.ts
export type CanvasMode = 'fixed' | 'fit-parent' | 'fit-window';

export const AppConfig = {
  canvas: {
    mode: 'fit-parent' as CanvasMode,
    width: 1280,
    height: 720,
    maxDevicePixelRatio: 3.0, // Increased from 2.0 for better text quality
    background: '#06121b',      // old default bg (ignored when transparent is true)
    aspect: 1280 / 720,
    transparent: true,          // ← enable transparent canvas
  },
  text: {
    antialias: true,
    fontSmoothing: true,
    crispEdges: false, // Disable for smooth text
  },
  footer: {
    // Auto-scaling settings for footer
    autoScale: true,           // Enable automatic scaling
    baseWidth: 2560,           // Base width (matches background)
    baseHeight: 80,            // Base height (can be adjusted)
    textSize: 20,              // Base text size in pixels
    textPadding: 20,           // Padding from edges
    minHeight: 40,             // Minimum height
    maxHeight: 120,            // Maximum height
    // Height calculation: baseHeight = textSize + (textPadding * 2)
    // Current: 80 = 20 + (20 * 2) = 80px ✅
    
    // Utility function to calculate perfect height
    calculateHeight: (textSize: number, padding: number = 20) => {
      return Math.max(40, Math.min(120, textSize + (padding * 2)));
    }
  },
  allowQueryOverride: true,     // supports ?transparent=1 (see below)
};
