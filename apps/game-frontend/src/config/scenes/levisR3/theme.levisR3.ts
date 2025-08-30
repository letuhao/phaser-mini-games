// ============================================================================
// LEVISR3 SCENE THEME CONFIGURATION
// ============================================================================
// This file contains theme configurations specific to the LevisR3 scene
// It extends the default theme with scene-specific colors, spacing, and styling

import { Theme, defaultTheme } from '../../theme';

// ============================================================================
// LEVISR3 SCENE THEME
// ============================================================================
export const levisR3Theme: Theme = {
  ...defaultTheme,
  name: 'LevisR3 Scene Theme',
  description: 'Specialized theme for LevisR3 wheel scene with gaming aesthetics',
  
  colorPalette: {
    ...defaultTheme.colorPalette,
    // Override with LevisR3-specific colors
    primary: {
      main: '#FF6B35', // Vibrant orange (LevisR3 brand color)
      light: '#FF8A65',
      dark: '#E55A2B',
      contrast: '#FFFFFF'
    },
    secondary: {
      main: '#4ECDC4', // Teal accent
      light: '#81C784',
      dark: '#26A69A',
      contrast: '#FFFFFF'
    },
    background: {
      primary: '#1A1A2E', // Dark navy (gaming aesthetic)
      secondary: '#16213E',
      tertiary: '#0F3460',
      overlay: 'rgba(26, 26, 46, 0.9)'
    },
    surface: {
      primary: '#16213E',
      secondary: '#0F3460',
      tertiary: '#533483',
      elevated: '#E94560'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E8E8E8',
      disabled: '#888888',
      inverse: '#1A1A2E'
    },
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    interactive: {
      hover: '#FF8A65',
      active: '#E55A2B',
      focus: '#FFB74D',
      disabled: '#888888'
    },
    border: {
      primary: '#533483',
      secondary: '#E94560',
      focus: '#FFB74D',
      disabled: '#888888'
    }
  },
  
  component: {
    ...defaultTheme.component,
    button: {
      ...defaultTheme.component.button,
      primary: {
        background: '#FF6B35',
        text: '#FFFFFF',
        border: '#FF6B35',
        hover: {
          background: '#FF8A65',
          text: '#FFFFFF',
          border: '#FF8A65',
          transform: 'scale(1.05) translateY(-2px)'
        },
        active: {
          background: '#E55A2B',
          text: '#FFFFFF',
          border: '#E55A2B',
          transform: 'scale(0.95) translateY(0px)'
        },
        disabled: {
          background: '#888888',
          text: '#CCCCCC',
          border: '#888888',
          opacity: 0.6
        }
      },
      secondary: {
        background: 'transparent',
        text: '#FF6B35',
        border: '#FF6B35',
        hover: {
          background: '#FF6B35',
          text: '#FFFFFF',
          border: '#FF6B35',
          transform: 'scale(1.05) translateY(-2px)'
        },
        active: {
          background: '#E55A2B',
          text: '#FFFFFF',
          border: '#E55A2B',
          transform: 'scale(0.95) translateY(0px)'
        },
        disabled: {
          background: 'transparent',
          text: '#888888',
          border: '#888888',
          opacity: 0.6
        }
      },
      size: {
        sm: {
          padding: '10px 20px',
          fontSize: '0.9rem',
          borderRadius: 8
        },
        md: {
          padding: '14px 28px',
          fontSize: '1.1rem',
          borderRadius: 10
        },
        lg: {
          padding: '18px 36px',
          fontSize: '1.3rem',
          borderRadius: 12
        }
      }
    },
    text: {
      ...defaultTheme.component.text,
      heading: {
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.1,
          color: '#FFFFFF'
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.2,
          color: '#FFFFFF'
        },
        h3: {
          fontSize: '1.6rem',
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#E8E8E8'
        }
      },
      body: {
        fontSize: '1.1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: '#E8E8E8'
      },
      caption: {
        fontSize: '0.9rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#CCCCCC'
      }
    },
    container: {
      background: '#16213E',
      border: '#533483',
      borderRadius: 15,
      padding: '20px',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }
  }
};

// ============================================================================
// LEVISR3 SCENE-SPECIFIC THEME SECTIONS
// ============================================================================

// Footer theme configuration
export const levisR3FooterTheme = {
  background: '#0F3460',
  border: '#533483',
  borderRadius: 20,
  padding: '24px',
  shadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
  text: {
    primary: '#FFFFFF',
    secondary: '#E8E8E8',
    social: '#FF6B35'
  },
  socialButtons: {
    background: 'transparent',
    border: '#533483',
    hover: {
      background: '#FF6B35',
      border: '#FF6B35',
      transform: 'scale(1.1)'
    },
    active: {
      background: '#E55A2B',
      border: '#E55A2B',
      transform: 'scale(0.95)'
    }
  }
};

// Effects container theme
export const levisR3EffectsTheme = {
  background: 'transparent',
  border: '2px dashed #533483',
  borderRadius: 0,
  padding: '0px',
  shadow: 'none',
  overlay: {
    background: 'rgba(26, 26, 46, 0.1)',
    border: '1px solid #533483'
  }
};

// Embers effect theme
export const levisR3EmbersTheme = {
  colors: ['#FF6B35', '#FF8A65', '#E55A2B', '#FFB74D'],
  blendMode: 'ADD',
  scale: {
    min: 0.3,
    max: 0.8
  },
  rise: {
    min: 50,
    max: 150
  },
  duration: {
    min: 2000,
    max: 4000
  },
  sway: {
    min: 10,
    max: 30
  },
  alpha: {
    min: 0.6,
    max: 1.0
  },
  gravity: 0.5,
  wind: 0.2
};

// Wheel scene specific theme
export const levisR3WheelTheme = {
  background: {
    primary: '#1A1A2E',
    secondary: '#16213E',
    overlay: 'rgba(26, 26, 46, 0.8)'
  },
  wheel: {
    background: '#0F3460',
    border: '#533483',
    center: '#FF6B35',
    segments: {
      primary: '#4ECDC4',
      secondary: '#81C784',
      accent: '#E94560'
    }
  },
  pointer: {
    color: '#FF6B35',
    shadow: '0 0 20px rgba(255, 107, 53, 0.6)'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E8E8E8',
    accent: '#FF6B35'
  }
};

// ============================================================================
// THEME REGISTRATION
// ============================================================================
export const registerLevisR3Themes = () => {
  // This function can be called to register all LevisR3 themes
  // with the global theme manager
  return {
    levisR3Theme,
    levisR3FooterTheme,
    levisR3EffectsTheme,
    levisR3EmbersTheme,
    levisR3WheelTheme
  };
};

// ============================================================================
// THEME UTILITIES FOR LEVISR3
// ============================================================================
export const levisR3ThemeUtils = {
  // Get theme value with fallback to default theme
  getThemeValue: (path: string, fallback?: any): any => {
    try {
      const keys = path.split('.');
      let value: any = levisR3Theme;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return fallback;
        }
      }
      
      return value;
    } catch {
      return fallback;
    }
  },
  
  // Get color with opacity
  getColorWithOpacity: (colorPath: string, opacity: number = 1): string => {
    const color = levisR3ThemeUtils.getThemeValue(colorPath);
    if (color && typeof color === 'string') {
      if (color.startsWith('#')) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color;
    }
    return `rgba(255, 107, 53, ${opacity})`; // Default fallback
  },
  
  // Get responsive spacing
  getResponsiveSpacing: (baseSpacing: number, scale: number = 1): number => {
    return Math.round(baseSpacing * scale);
  },
  
  // Get component-specific theme
  getComponentTheme: (componentName: string): any => {
    const componentTheme = levisR3Theme.component[componentName as keyof typeof levisR3Theme.component];
    return componentTheme || {};
  }
};
