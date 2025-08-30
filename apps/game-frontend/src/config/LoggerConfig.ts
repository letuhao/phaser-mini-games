export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    TRACE = 4
}

export interface LoggerObjectConfig {
    name: string;
    level: LogLevel;
    enabled: boolean;
}

export interface LoggerConfig {
    // Global log level
    globalLevel: LogLevel;
    
    // Object-specific configurations
    objects: LoggerObjectConfig[];
    
    // Formatting options
    formatOptions: {
        useJsonStringify: boolean;  // Use JSON.stringify for objects (default: true)
        showTimestamp: boolean;     // Show timestamp in logs
        showLogLevel: boolean;      // Show log level in logs
        showObjectName: boolean;    // Show object name in logs
    };
    
    // Console options
    console: {
        enabled: boolean;           // Enable console logging
        colors: boolean;            // Enable colored console output
    };
    
    // File logging options (for future use)
    file: {
        enabled: boolean;           // Enable file logging
        path: string;               // Log file path
        maxSize: number;            // Max file size in MB
        maxFiles: number;           // Max number of log files
    };
}

// Default configuration
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
    globalLevel: LogLevel.INFO,
    
    objects: [
        // Core systems
        { name: 'ResponsiveManager', level: LogLevel.DEBUG, enabled: true },
        { name: 'GroupNode', level: LogLevel.INFO, enabled: true },
        
        // Effects
        { name: 'Embers', level: LogLevel.DEBUG, enabled: true },
        { name: 'Fireflies', level: LogLevel.INFO, enabled: false },
        { name: 'StarGrow', level: LogLevel.INFO, enabled: false },
        { name: 'AutumnLeaves', level: LogLevel.INFO, enabled: false },
        { name: 'Rain', level: LogLevel.INFO, enabled: false },
        { name: 'Wind', level: LogLevel.INFO, enabled: false },
        { name: 'LensFlare', level: LogLevel.INFO, enabled: false },
        { name: 'WaterSurface', level: LogLevel.INFO, enabled: false },
        
        // UI components
        { name: 'Button', level: LogLevel.INFO, enabled: true },
        { name: 'GrowText', level: LogLevel.INFO, enabled: false },
        
        // Scenes
        { name: 'LevisR3WheelScene', level: LogLevel.INFO, enabled: true },
        { name: 'WheelScene', level: LogLevel.INFO, enabled: false },
        { name: 'BootScene', level: LogLevel.INFO, enabled: false },
        
        // Object loading
        { name: 'ObjectLoader', level: LogLevel.INFO, enabled: true },
        
        // Factory system
        { name: 'FactoryRegistry', level: LogLevel.DEBUG, enabled: true },
        { name: 'ContainerFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'BackgroundFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'ButtonFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'EffectFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'SimpleObjectFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'SpawnAreaFactory', level: LogLevel.DEBUG, enabled: true },
        
        // Individual factory classes (in case they have different names)
        { name: 'GameObjectFactory', level: LogLevel.DEBUG, enabled: true },
        { name: 'BaseGameObjectFactory', level: LogLevel.DEBUG, enabled: true },
        
        // Generic categories for new objects
        { name: 'Background', level: LogLevel.INFO, enabled: false },
        { name: 'Container', level: LogLevel.INFO, enabled: false },
        { name: 'Text', level: LogLevel.INFO, enabled: false },
        { name: 'Rect', level: LogLevel.INFO, enabled: false },
    ],
    
    formatOptions: {
        useJsonStringify: true,     // Default: use JSON.stringify for objects
        showTimestamp: true,        // Show timestamp
        showLogLevel: true,         // Show log level
        showObjectName: true,       // Show object name
    },
    
    console: {
        enabled: true,              // Enable console logging
        colors: true,               // Enable colored console output
    },
    
    file: {
        enabled: false,             // Disable file logging by default
        path: './logs/game.log',
        maxSize: 10,                // 10MB max file size
        maxFiles: 5,                // Keep 5 log files
    }
};

// Helper function to get object config
export function getObjectConfig(objectName: string): LoggerObjectConfig | undefined {
    return DEFAULT_LOGGER_CONFIG.objects.find(obj => obj.name === objectName);
}

// Helper function to check if object logging is enabled
export function isObjectLoggingEnabled(objectName: string): boolean {
    const config = getObjectConfig(objectName);
    return config?.enabled ?? false;
}

// Helper function to get object log level
export function getObjectLogLevel(objectName: string): LogLevel {
    const config = getObjectConfig(objectName);
    return config?.level ?? DEFAULT_LOGGER_CONFIG.globalLevel;
}
