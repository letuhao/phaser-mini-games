// ============================================================================
// LEVIS R3 SCENE CONFIGURATION INDEX
// ============================================================================
// This file provides a single entry point for all LevisR3 scene configurations
// Including objects, responsive design, and assets

// Scene Configuration
export * from './objects.levisR3';
export * from './responsive.levisR3';
export * from './assets.levisR3.config';

// Scene Metadata
export interface LevisR3SceneConfig {
    name: string;
    version: string;
    description: string;
    type: 'mini-game';
    category: 'wheel-spin';
    difficulty: 'easy';
    estimatedPlayTime: number; // in seconds
    maxPlayers: number;
    tags: string[];
}

export const LEVIS_R3_SCENE_METADATA: LevisR3SceneConfig = {
    name: 'Levis R3 Lucky Wheel',
    version: '1.0.0',
    description: 'A classic wheel spinning mini-game with Levis branding and social media integration',
    type: 'mini-game',
    category: 'wheel-spin',
    difficulty: 'easy',
    estimatedPlayTime: 60,
    maxPlayers: 1,
    tags: ['wheel', 'spin', 'luck', 'levis', 'branded', 'social-media']
};

// Scene Requirements
export interface LevisR3SceneRequirements {
    minScreenWidth: number;
    minScreenHeight: number;
    requiredAssets: string[];
    optionalAssets: string[];
    supportedBrowsers: string[];
    requiredFeatures: string[];
}

export const LEVIS_R3_SCENE_REQUIREMENTS: LevisR3SceneRequirements = {
    minScreenWidth: 320,
    minScreenHeight: 480,
    requiredAssets: [
        'levisR3-bg',
        'footer-svg',
        'facebook-icon',
        'instagram-icon',
        'youtube-icon',
        'zalo-icon',
        'tiktok-icon'
    ],
    optionalAssets: [
        'wheel-base',
        'wheel-pointer',
        'wheel-segments',
        'ember-particle',
        'sparkle-particle',
        'smoke-particle',
        'wheel-spin-sound',
        'wheel-stop-sound',
        'button-click-sound',
        'background-music'
    ],
    supportedBrowsers: [
        'Chrome 90+',
        'Firefox 88+',
        'Safari 14+',
        'Edge 90+'
    ],
    requiredFeatures: [
        'Canvas API',
        'WebGL',
        'Audio API',
        'Touch Events',
        'Local Storage'
    ]
};

// Scene Performance Settings
export interface LevisR3ScenePerformance {
    targetFPS: number;
    maxParticles: number;
    maxEffects: number;
    enableVSync: boolean;
    enableAntiAliasing: boolean;
    textureQuality: 'low' | 'medium' | 'high';
    audioQuality: 'low' | 'medium' | 'high';
}

export const LEVIS_R3_SCENE_PERFORMANCE: LevisR3ScenePerformance = {
    targetFPS: 60,
    maxParticles: 500,
    maxEffects: 10,
    enableVSync: true,
    enableAntiAliasing: true,
    textureQuality: 'high',
    audioQuality: 'medium'
};

// Scene Accessibility Settings
export interface LevisR3SceneAccessibility {
    enableHighContrast: boolean;
    enableLargeText: boolean;
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    enableSoundCues: boolean;
    enableVisualCues: boolean;
}

export const LEVIS_R3_SCENE_ACCESSIBILITY: LevisR3SceneAccessibility = {
    enableHighContrast: true,
    enableLargeText: true,
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableSoundCues: true,
    enableVisualCues: true
};

// Scene Localization
export interface LevisR3SceneLocalization {
    defaultLanguage: string;
    supportedLanguages: string[];
    fallbackLanguage: string;
    enableAutoLanguage: boolean;
}

export const LEVIS_R3_SCENE_LOCALIZATION: LevisR3SceneLocalization = {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'vi', 'zh', 'ja', 'ko'],
    fallbackLanguage: 'en',
    enableAutoLanguage: true
};

// Complete Scene Configuration
export interface LevisR3CompleteConfig {
    metadata: LevisR3SceneConfig;
    requirements: LevisR3SceneRequirements;
    performance: LevisR3ScenePerformance;
    accessibility: LevisR3SceneAccessibility;
    localization: LevisR3SceneLocalization;
}

export const LEVIS_R3_COMPLETE_CONFIG: LevisR3CompleteConfig = {
    metadata: LEVIS_R3_SCENE_METADATA,
    requirements: LEVIS_R3_SCENE_REQUIREMENTS,
    performance: LEVIS_R3_SCENE_PERFORMANCE,
    accessibility: LEVIS_R3_SCENE_ACCESSIBILITY,
    localization: LEVIS_R3_SCENE_LOCALIZATION
};

// Scene Validation
export function validateLevisR3SceneConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate metadata
    if (!LEVIS_R3_SCENE_METADATA.name || LEVIS_R3_SCENE_METADATA.name.trim() === '') {
        errors.push('Scene name is required');
    }
    
    if (!LEVIS_R3_SCENE_METADATA.version || LEVIS_R3_SCENE_METADATA.version.trim() === '') {
        errors.push('Scene version is required');
    }
    
    if (LEVIS_R3_SCENE_METADATA.estimatedPlayTime < 10 || LEVIS_R3_SCENE_METADATA.estimatedPlayTime > 3600) {
        warnings.push('Estimated play time should be between 10 seconds and 1 hour');
    }
    
    // Validate requirements
    if (LEVIS_R3_SCENE_REQUIREMENTS.minScreenWidth < 200) {
        warnings.push('Minimum screen width is very low, may cause display issues');
    }
    
    if (LEVIS_R3_SCENE_REQUIREMENTS.minScreenHeight < 300) {
        warnings.push('Minimum screen height is very low, may cause display issues');
    }
    
    if (LEVIS_R3_SCENE_REQUIREMENTS.requiredAssets.length === 0) {
        errors.push('At least one required asset must be specified');
    }
    
    // Validate performance
    if (LEVIS_R3_SCENE_PERFORMANCE.targetFPS < 30 || LEVIS_R3_SCENE_PERFORMANCE.targetFPS > 144) {
        warnings.push('Target FPS should be between 30 and 144');
    }
    
    if (LEVIS_R3_SCENE_PERFORMANCE.maxParticles > 2000) {
        warnings.push('High particle count may impact performance on low-end devices');
    }
    
    // Validate localization
    if (LEVIS_R3_SCENE_LOCALIZATION.supportedLanguages.length === 0) {
        errors.push('At least one supported language must be specified');
    }
    
    if (!LEVIS_R3_SCENE_LOCALIZATION.supportedLanguages.includes(LEVIS_R3_SCENE_LOCALIZATION.defaultLanguage)) {
        errors.push('Default language must be in supported languages list');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

// Scene Statistics
export function getLevisR3SceneStats(): {
    totalAssets: number;
    requiredAssets: number;
    optionalAssets: number;
    supportedLanguages: number;
    estimatedSize: number; // in KB
} {
    const { requiredAssets, optionalAssets } = LEVIS_R3_SCENE_REQUIREMENTS;
    const { supportedLanguages } = LEVIS_R3_SCENE_LOCALIZATION;
    
    // Rough size estimation (this would be more accurate with actual asset sizes)
    const estimatedSize = (requiredAssets.length * 50) + (optionalAssets.length * 30);
    
    return {
        totalAssets: requiredAssets.length + optionalAssets.length,
        requiredAssets: requiredAssets.length,
        optionalAssets: optionalAssets.length,
        supportedLanguages: supportedLanguages.length,
        estimatedSize
    };
}
