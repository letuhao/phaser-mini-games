// ============================================================================
// LEVISR3 ASSETS CONFIGURATION
// ============================================================================
// This file manages all assets for the LevisR3 scene, including
// images, sounds, fonts, and other resources with theme integration

import { levisR3Theme, levisR3FooterTheme, levisR3EffectsTheme, levisR3EmbersTheme, levisR3WheelTheme } from './theme.levisR3';

// ============================================================================
// ASSET TYPES AND INTERFACES
// ============================================================================
export interface AssetConfig {
  key: string;
  type: 'image' | 'audio' | 'font' | 'json' | 'atlas' | 'spritesheet';
  url: string;
  config?: any;
  preload: boolean;
  theme?: string; // Theme variant for this asset
}

export interface ImageAssetConfig extends AssetConfig {
  type: 'image';
  config?: {
    frameWidth?: number;
    frameHeight?: number;
    startFrame?: number;
    endFrame?: number;
    margin?: number;
    spacing?: number;
  };
}

export interface AudioAssetConfig extends AssetConfig {
  type: 'audio';
  config?: {
    volume?: number;
    loop?: boolean;
    rate?: number;
    detune?: number;
  };
}

export interface FontAssetConfig extends AssetConfig {
  type: 'font';
  config?: {
    family?: string;
    weight?: string;
    style?: string;
  };
}

export interface AtlasAssetConfig extends AssetConfig {
  type: 'atlas';
  config: {
    atlasURL: string;
    imageURL: string;
    format?: 'XML' | 'JSON';
  };
}

export interface SpritesheetAssetConfig extends AssetConfig {
  type: 'spritesheet';
  config: {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
    margin?: number;
    spacing?: number;
  };
}

// ============================================================================
// LEVISR3 ASSETS CONFIGURATION
// ============================================================================

// Background assets
export const backgroundAssets: ImageAssetConfig[] = [
  {
    key: 'levisR3_BG',
    type: 'image',
    url: '/assets/backgrounds/levisR3_BG.png',
    preload: true,
    theme: 'background'
  }
];

// UI assets
export const uiAssets: ImageAssetConfig[] = [
  {
    key: 'footer',
    type: 'image',
    url: '/assets/icons/footer.svg',
    preload: true,
    theme: 'footer'
  },
  {
    key: 'button_bg',
    type: 'image',
    url: '/assets/textures/button_bg.png',
    preload: true,
    theme: 'button'
  },
  {
    key: 'button_hover',
    type: 'image',
    url: '/assets/textures/button_hover.png',
    preload: true,
    theme: 'button'
  },
  {
    key: 'button_active',
    type: 'image',
    url: '/assets/textures/button_active.png',
    preload: true,
    theme: 'button'
  }
];

// Social media icon assets
export const socialMediaAssets: ImageAssetConfig[] = [
  {
    key: 'facebook-icon',
    type: 'image',
    url: '/assets/icons/facebook-classic-icon.svg',
    preload: true,
    theme: 'social'
  },
  {
    key: 'instagram-icon',
    type: 'image',
    url: '/assets/icons/instagram-classic-icon.svg',
    preload: true,
    theme: 'social'
  },
  {
    key: 'youtube-icon',
    type: 'image',
    url: '/assets/icons/youtube-classic-icon.svg',
    preload: true,
    theme: 'social'
  },
  {
    key: 'zalo-icon',
    type: 'image',
    url: '/assets/icons/zalo-classic-icon.svg',
    preload: true,
    theme: 'social'
  },
  {
    key: 'tiktok-icon',
    type: 'image',
    url: '/assets/icons/tiktok-classic-icon.svg',
    preload: true,
    theme: 'social'
  }
];

// Effect assets
export const effectAssets: ImageAssetConfig[] = [
  {
    key: 'ember_particle',
    type: 'image',
    url: '/assets/effects/ember.png',
    preload: true,
    theme: 'effects'
  },
  {
    key: 'fire_particle',
    type: 'image',
    url: '/assets/effects/fire.png',
    preload: true,
    theme: 'effects'
  },
  {
    key: 'sparkle_particle',
    type: 'image',
    url: '/assets/effects/sparkle.png',
    preload: true,
    theme: 'effects'
  }
];

// Audio assets
export const audioAssets: AudioAssetConfig[] = [
  {
    key: 'button_hover_sound',
    type: 'audio',
    url: '/assets/audio/button_hover.mp3',
    preload: false,
    config: {
      volume: 0.3,
      loop: false
    }
  },
  {
    key: 'button_click_sound',
    type: 'audio',
    url: '/assets/audio/button_click.mp3',
    preload: false,
    config: {
      volume: 0.4,
      loop: false
    }
  },
  {
    key: 'wheel_spin_sound',
    type: 'audio',
    url: '/assets/audio/wheel_spin.mp3',
    preload: false,
    config: {
      volume: 0.5,
      loop: false
    }
  },
  {
    key: 'wheel_stop_sound',
    type: 'audio',
    url: '/assets/audio/wheel_stop.mp3',
    preload: false,
    config: {
      volume: 0.6,
      loop: false
    }
  },
  {
    key: 'background_music',
    type: 'audio',
    url: '/assets/audio/background_music.mp3',
    preload: false,
    config: {
      volume: 0.2,
      loop: true
    }
  }
];

// Font assets
export const fontAssets: FontAssetConfig[] = [
  {
    key: 'Inter',
    type: 'font',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    preload: true,
    config: {
      family: 'Inter',
      weight: '400'
    }
  },
  {
    key: 'Poppins',
    type: 'font',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
    preload: true,
    config: {
      family: 'Poppins',
      weight: '600'
    }
  }
];

// ============================================================================
// ASSET GROUPS FOR DIFFERENT SCENE STATES
// ============================================================================

// Assets needed for initial scene load
export const initialAssets: AssetConfig[] = [
  ...backgroundAssets,
  ...uiAssets,
  ...fontAssets
];

// Assets needed for interactive elements
export const interactiveAssets: AssetConfig[] = [
  ...socialMediaAssets,
  ...audioAssets
];

// Assets needed for effects
export const effectsAssets: AssetConfig[] = [
  ...effectAssets
];

// All assets combined
export const allLevisR3Assets: AssetConfig[] = [
  ...initialAssets,
  ...interactiveAssets,
  ...effectsAssets
];

// ============================================================================
// ASSET LOADING STRATEGIES
// ============================================================================

export const assetLoadingStrategies = {
  // Critical assets that must be loaded before scene starts
  critical: initialAssets.filter(asset => asset.preload),
  
  // Important assets that should be loaded soon after scene starts
  important: interactiveAssets.filter(asset => asset.preload),
  
  // Optional assets that can be loaded on demand
  optional: effectsAssets.filter(asset => !asset.preload),
  
  // Audio assets that should be loaded when user interacts
  audio: audioAssets.filter(asset => !asset.preload)
};

// ============================================================================
// ASSET VALIDATION AND ERROR HANDLING
// ============================================================================

export const assetValidation = {
  // Validate asset URLs
  validateAssetURL: (url: string): boolean => {
    try {
      new URL(url, window.location.origin);
      return true;
    } catch {
      return false;
    }
  },
  
  // Check if asset is accessible
  checkAssetAccessibility: async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  },
  
  // Get fallback asset for a given key
  getFallbackAsset: (key: string): AssetConfig | null => {
    // Define fallback assets for critical UI elements
    const fallbacks: Record<string, AssetConfig> = {
      'levisR3_BG': {
        key: 'fallback_bg',
        type: 'image',
        url: '/assets/images/fallback_bg.png',
        preload: true
      },
      'footer': {
        key: 'fallback_footer',
        type: 'image',
        url: '/assets/images/fallback_footer.png',
        preload: true
      }
    };
    
    return fallbacks[key] || null;
  }
};

// ============================================================================
// ASSET THEME INTEGRATION
// ============================================================================

export const assetThemeIntegration = {
  // Get theme-appropriate asset variant
  getThemedAsset: (baseKey: string, theme: string): AssetConfig | null => {
    const themedAssets: Record<string, Record<string, AssetConfig>> = {
      'button': {
        'dark': {
          key: `${baseKey}_dark`,
          type: 'image',
          url: `/assets/images/${baseKey}_dark.png`,
          preload: true,
          theme: 'dark'
        },
        'light': {
          key: `${baseKey}_light`,
          type: 'image',
          url: `/assets/images/${baseKey}_light.png`,
          preload: true,
          theme: 'light'
        }
      }
    };
    
    return themedAssets[baseKey]?.[theme] || null;
  },
  
  // Get asset colors that match current theme
  getAssetThemeColors: (assetKey: string): Record<string, string> => {
    const themeColors: Record<string, Record<string, string>> = {
      'button_bg': {
        primary: levisR3Theme.colorPalette.primary.main,
        secondary: levisR3Theme.colorPalette.secondary.main,
        background: levisR3Theme.colorPalette.background.primary
      },
      'footer': {
        background: levisR3FooterTheme.background,
        border: levisR3FooterTheme.border,
        text: levisR3FooterTheme.text.primary
      }
    };
    
    return themeColors[assetKey] || {};
  }
};

// ============================================================================
// ASSET PERFORMANCE OPTIMIZATION
// ============================================================================

export const assetPerformance = {
  // Asset loading priorities
  priorities: {
    critical: 1,    // Load first
    important: 2,   // Load second
    optional: 3,    // Load last
    audio: 4        // Load on demand
  },
  
  // Asset caching strategies
  caching: {
    images: 'cache-first',
    audio: 'network-first',
    fonts: 'cache-first',
    json: 'network-first'
  },
  
  // Asset compression settings
  compression: {
    images: {
      quality: 0.8,
      format: 'webp'
    },
    audio: {
      bitrate: 128,
      format: 'mp3'
    }
  }
};

// ============================================================================
// EXPORT ALL ASSET CONFIGURATIONS
// ============================================================================

export default {
  // Asset configurations
  backgroundAssets,
  uiAssets,
  socialMediaAssets,
  effectAssets,
  audioAssets,
  fontAssets,
  
  // Asset groups
  initialAssets,
  interactiveAssets,
  effectsAssets,
  allLevisR3Assets,
  
  // Loading strategies
  assetLoadingStrategies,
  
  // Validation and error handling
  assetValidation,
  
  // Theme integration
  assetThemeIntegration,
  
  // Performance optimization
  assetPerformance
};
