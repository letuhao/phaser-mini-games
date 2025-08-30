// ============================================================================
// THEME CONFIGURATION SYSTEM
// ============================================================================
// This system provides consistent theming across all UI components
// Supports multiple themes, dark/light modes, and component-specific styling

export interface ColorPalette {
  // Primary colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Secondary colors
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Interactive colors
  interactive: {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    disabled: string;
  };
}

export interface Typography {
  // Font families
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  
  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  
  // Font weights
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  // Line heights
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Letter spacing
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface Spacing {
  // Base spacing unit (in pixels)
  base: number;
  
  // Spacing scale
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  
  // Component-specific spacing
  component: {
    padding: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    margin: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    gap: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
}

export interface Shadows {
  // Shadow levels
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  
  // Component-specific shadows
  component: {
    button: string;
    card: string;
    modal: string;
    tooltip: string;
  };
}

export interface BorderRadius {
  // Border radius values
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
  
  // Component-specific border radius
  component: {
    button: number;
    card: number;
    input: number;
    modal: number;
  };
}

export interface Transitions {
  // Transition durations
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  
  // Transition easing functions
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  
  // Component-specific transitions
  component: {
    button: {
      hover: number;
      click: number;
      focus: number;
    };
    modal: {
      open: number;
      close: number;
    };
    tooltip: {
      show: number;
      hide: number;
    };
  };
}

export interface ComponentTheme {
  // Button theme
  button: {
    primary: {
      background: string;
      text: string;
      border: string;
      hover: {
        background: string;
        text: string;
        border: string;
        transform: string;
      };
      active: {
        background: string;
        text: string;
        border: string;
        transform: string;
      };
      disabled: {
        background: string;
        text: string;
        border: string;
        opacity: number;
      };
    };
    secondary: {
      background: string;
      text: string;
      border: string;
      hover: {
        background: string;
        text: string;
        border: string;
        transform: string;
      };
      active: {
        background: string;
        text: string;
        border: string;
        transform: string;
      };
      disabled: {
        background: string;
        text: string;
        border: string;
        opacity: number;
      };
    };
    size: {
      sm: {
        padding: string;
        fontSize: string;
        borderRadius: number;
      };
      md: {
        padding: string;
        fontSize: string;
        borderRadius: number;
      };
      lg: {
        padding: string;
        fontSize: string;
        borderRadius: number;
      };
    };
  };
  
  // Text theme
  text: {
    heading: {
      h1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        color: string;
      };
      h2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        color: string;
      };
      h3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        color: string;
      };
    };
    body: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      color: string;
    };
    caption: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      color: string;
    };
  };
  
  // Container theme
  container: {
    background: string;
    border: string;
    borderRadius: number;
    padding: string;
    shadow: string;
  };
  
  // Input theme
  input: {
    background: string;
    border: string;
    text: string;
    placeholder: string;
    focus: {
      border: string;
      shadow: string;
    };
    disabled: {
      background: string;
      text: string;
      opacity: number;
    };
  };
}

export interface Theme {
  name: string;
  description: string;
  colorPalette: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  borderRadius: BorderRadius;
  transitions: Transitions;
  component: ComponentTheme;
}

// ============================================================================
// DEFAULT THEME (LevisR3 Style)
// ============================================================================
export const defaultTheme: Theme = {
  name: 'LevisR3 Default',
  description: 'Default theme for LevisR3 mini-games with modern, clean design',
  
  colorPalette: {
    primary: {
      main: '#1E40AF', // Blue
      light: '#3B82F6',
      dark: '#1E3A8A',
      contrast: '#FFFFFF'
    },
    secondary: {
      main: '#10B981', // Green
      light: '#34D399',
      dark: '#059669',
      contrast: '#FFFFFF'
    },
    background: {
      primary: '#0F172A', // Dark blue-gray
      secondary: '#1E293B',
      tertiary: '#334155',
      overlay: 'rgba(15, 23, 42, 0.8)'
    },
    surface: {
      primary: '#1E293B',
      secondary: '#334155',
      tertiary: '#475569',
      elevated: '#64748B'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      disabled: '#64748B',
      inverse: '#0F172A'
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    interactive: {
      hover: '#3B82F6',
      active: '#1E40AF',
      focus: '#60A5FA',
      disabled: '#64748B'
    },
    border: {
      primary: '#475569',
      secondary: '#64748B',
      focus: '#60A5FA',
      disabled: '#64748B'
    }
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      monospace: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em'
    }
  },
  
  spacing: {
    base: 4,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
    component: {
      padding: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24
      },
      margin: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      gap: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20
      }
    }
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    component: {
      button: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      tooltip: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
    component: {
      button: 8,
      card: 12,
      input: 8,
      modal: 16
    }
  },
  
  transitions: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    },
    component: {
      button: {
        hover: 150,
        click: 100,
        focus: 200
      },
      modal: {
        open: 300,
        close: 250
      },
      tooltip: {
        show: 200,
        hide: 150
      }
    }
  },
  
  component: {
    button: {
      primary: {
        background: '#1E40AF',
        text: '#FFFFFF',
        border: '#1E40AF',
        hover: {
          background: '#3B82F6',
          text: '#FFFFFF',
          border: '#3B82F6',
          transform: 'translateY(-1px)'
        },
        active: {
          background: '#1E3A8A',
          text: '#FFFFFF',
          border: '#1E3A8A',
          transform: 'translateY(0px)'
        },
        disabled: {
          background: '#64748B',
          text: '#94A3B8',
          border: '#64748B',
          opacity: 0.6
        }
      },
      secondary: {
        background: 'transparent',
        text: '#1E40AF',
        border: '#1E40AF',
        hover: {
          background: '#1E40AF',
          text: '#FFFFFF',
          border: '#1E40AF',
          transform: 'translateY(-1px)'
        },
        active: {
          background: '#1E3A8A',
          text: '#FFFFFF',
          border: '#1E3A8A',
          transform: 'translateY(0px)'
        },
        disabled: {
          background: 'transparent',
          text: '#64748B',
          border: '#64748B',
          opacity: 0.6
        }
      },
      size: {
        sm: {
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: 6
        },
        md: {
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: 8
        },
        lg: {
          padding: '16px 32px',
          fontSize: '1.125rem',
          borderRadius: 10
        }
      }
    },
    text: {
      heading: {
        h1: {
          fontSize: '2.25rem',
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#F8FAFC'
        },
        h2: {
          fontSize: '1.875rem',
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#F8FAFC'
        },
        h3: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
          color: '#F8FAFC'
        }
      },
      body: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: '#CBD5E1'
      },
      caption: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#94A3B8'
      }
    },
    container: {
      background: '#1E293B',
      border: '#475569',
      borderRadius: 12,
      padding: '16px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    input: {
      background: '#334155',
      border: '#475569',
      text: '#F8FAFC',
      placeholder: '#94A3B8',
      focus: {
        border: '#60A5FA',
        shadow: '0 0 0 3px rgba(96, 165, 250, 0.1)'
      },
      disabled: {
        background: '#475569',
        text: '#94A3B8',
        opacity: 0.6
      }
    }
  }
};

// ============================================================================
// THEME MANAGER
// ============================================================================
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme;
  private themes: Map<string, Theme>;
  private listeners: Set<(theme: Theme) => void>;
  
  private constructor() {
    this.currentTheme = defaultTheme;
    this.themes = new Map();
    this.listeners = new Set();
    
    // Register default theme
    this.registerTheme(defaultTheme);
  }
  
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }
  
  // Register a new theme
  public registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }
  
  // Get current theme
  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }
  
  // Get theme by name
  public getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }
  
  // Get all available themes
  public getAvailableThemes(): Theme[] {
    return Array.from(this.themes.values());
  }
  
  // Switch to a different theme
  public switchTheme(name: string): boolean {
    const theme = this.themes.get(name);
    if (theme) {
      this.currentTheme = theme;
      this.notifyListeners();
      return true;
    }
    return false;
  }
  
  // Subscribe to theme changes
  public subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Notify all listeners of theme change
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
  
  // Get theme value by path (e.g., 'colorPalette.primary.main')
  public getThemeValue(path: string): any {
    const keys = path.split('.');
    let value: any = this.currentTheme;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  // Create a custom theme by extending the current theme
  public createCustomTheme(overrides: Partial<Theme>): Theme {
    return {
      ...this.currentTheme,
      ...overrides,
      name: overrides.name || `${this.currentTheme.name} (Custom)`,
      description: overrides.description || `Custom version of ${this.currentTheme.name}`
    };
  }
}

// ============================================================================
// THEME UTILITIES
// ============================================================================
export const themeUtils = {
  // Convert hex color to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  // Get contrast color (black or white) for a given background color
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation - in production, use a more sophisticated algorithm
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },
  
  // Generate color variations
  generateColorVariations: (baseColor: string): {
    light: string;
    main: string;
    dark: string;
  } => {
    // Simple color variation generation
    // In production, use a color manipulation library
    return {
      light: baseColor, // Placeholder
      main: baseColor,
      dark: baseColor  // Placeholder
    };
  }
};

// Export default theme manager instance
export const themeManager = ThemeManager.getInstance();
