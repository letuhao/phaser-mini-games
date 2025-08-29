import { LogLevel, LoggerConfig, DEFAULT_LOGGER_CONFIG, isObjectLoggingEnabled, getObjectLogLevel } from './LoggerConfig';

export class Logger {
    private static instance: Logger;
    private config: LoggerConfig;
    
    private constructor(config?: Partial<LoggerConfig>) {
        this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    }
    
    /**
     * Get singleton instance of Logger
     */
    public static getInstance(config?: Partial<LoggerConfig>): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    
    /**
     * Update logger configuration
     */
    public updateConfig(newConfig: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Check if logging is enabled for a specific object and level
     */
    private shouldLog(objectName: string, level: LogLevel): boolean {
        // Check global level first
        if (level > this.config.globalLevel) {
            return false;
        }
        
        // Check if object logging is enabled
        if (!isObjectLoggingEnabled(objectName)) {
            return false;
        }
        
        // Check object-specific level
        const objectLevel = getObjectLogLevel(objectName);
        return level <= objectLevel;
    }
    
    /**
     * Format log message with optional object data
     */
    private formatMessage(objectName: string, level: LogLevel, message: string, data?: any, methodName?: string): string {
        const parts: string[] = [];
        
        // Add timestamp
        if (this.config.formatOptions.showTimestamp) {
            const timestamp = new Date().toISOString();
            parts.push(`[${timestamp}]`);
        }
        
        // Add log level
        if (this.config.formatOptions.showLogLevel) {
            const levelName = LogLevel[level];
            parts.push(`[${levelName}]`);
        }
        
        // Add object name
        if (this.config.formatOptions.showObjectName) {
            parts.push(`[${objectName}]`);
        }
        
        // Add method name if provided
        if (methodName) {
            parts.push(`[${methodName}]`);
        }
        
        // Add message
        parts.push(message);
        
        // Add data if provided
        if (data !== undefined) {
            if (this.config.formatOptions.useJsonStringify) {
                try {
                    parts.push(JSON.stringify(data, null, 2));
                } catch (error) {
                    parts.push(`[Data serialization error: ${error}]`);
                }
            } else {
                parts.push(String(data));
            }
        }
        
        return parts.join(' ');
    }
    
    /**
     * Get console color for log level
     */
    private getConsoleColor(level: LogLevel): string {
        if (!this.config.console.colors) return '';
        
        switch (level) {
            case LogLevel.ERROR: return 'color: #ff0000; font-weight: bold;';
            case LogLevel.WARN: return 'color: #ffa500; font-weight: bold;';
            case LogLevel.INFO: return 'color: #0000ff;';
            case LogLevel.DEBUG: return 'color: #008000;';
            case LogLevel.TRACE: return 'color: #808080;';
            default: return '';
        }
    }
    
    /**
     * Output log to console
     */
    private outputToConsole(formattedMessage: string, level: LogLevel): void {
        if (!this.config.console.enabled) return;
    
        const color = this.getConsoleColor(level);
        
        if (color) {
            console.log(`%c${formattedMessage}`, color);
        } else {
            console.log(formattedMessage);
        }
    }
    
        /**
     * Log error message
     */
    public error(objectName: string, message: string, data?: any, methodName?: string): void {
        if (this.shouldLog(objectName, LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(objectName, LogLevel.ERROR, message, data, methodName);
            this.outputToConsole(formattedMessage, LogLevel.ERROR);
        }
    }

    /**
     * Log warning message
     */
    public warn(objectName: string, message: string, data?: any, methodName?: string): void {
        if (this.shouldLog(objectName, LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(objectName, LogLevel.WARN, message, data, methodName);
            this.outputToConsole(formattedMessage, LogLevel.WARN);
        }
    }

    /**
     * Log info message
     */
    public info(objectName: string, message: string, data?: any, methodName?: string): void {
        if (this.shouldLog(objectName, LogLevel.INFO)) {
            const formattedMessage = this.formatMessage(objectName, LogLevel.INFO, message, data, methodName);
            this.outputToConsole(formattedMessage, LogLevel.INFO);
        }
    }

    /**
     * Log debug message
     */
    public debug(objectName: string, message: string, data?: any, methodName?: string): void {
        if (this.shouldLog(objectName, LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(objectName, LogLevel.DEBUG, message, data, methodName);
            this.outputToConsole(formattedMessage, LogLevel.DEBUG);
        }
    }

    /**
     * Log trace message
     */
    public trace(objectName: string, message: string, data?: any, methodName?: string): void {
        if (this.shouldLog(objectName, LogLevel.TRACE)) {
            const formattedMessage = this.formatMessage(objectName, LogLevel.TRACE, message, data, methodName);
            this.outputToConsole(formattedMessage, LogLevel.TRACE);
        }
    }

    /**
     * Convenience method for logging with current timestamp
     */
    public log(objectName: string, message: string, data?: any, methodName?: string): void {
        this.info(objectName, message, data, methodName);
    }
    
    /**
     * Get current configuration
     */
    public getConfig(): LoggerConfig {
        return { ...this.config };
    }
    
    /**
     * Enable/disable logging for specific object
     */
    public setObjectEnabled(objectName: string, enabled: boolean): void {
        const objectConfig = this.config.objects.find(obj => obj.name === objectName);
        if (objectConfig) {
            objectConfig.enabled = enabled;
        }
    }
    
    /**
     * Set log level for specific object
     */
    public setObjectLevel(objectName: string, level: LogLevel): void {
        const objectConfig = this.config.objects.find(obj => obj.name === objectName);
        if (objectConfig) {
            objectConfig.level = level;
        }
    }
    
    /**
     * Set global log level
     */
    public setGlobalLevel(level: LogLevel): void {
        this.config.globalLevel = level;
    }
    
    /**
     * Toggle JSON stringify formatting
     */
    public setUseJsonStringify(useJson: boolean): void {
        this.config.formatOptions.useJsonStringify = useJson;
    }
    
    /**
     * Toggle console colors
     */
    public setConsoleColors(enabled: boolean): void {
        this.config.console.colors = enabled;
    }
}

// Export convenience functions for easy usage
export const logger = Logger.getInstance();

// Export convenience methods for direct usage
export const logError = (objectName: string, message: string, data?: any, methodName?: string) => logger.error(objectName, message, data, methodName);
export const logWarn = (objectName: string, message: string, data?: any, methodName?: string) => logger.warn(objectName, message, data, methodName);
export const logInfo = (objectName: string, message: string, data?: any, methodName?: string) => logger.info(objectName, message, data, methodName);
export const logDebug = (objectName: string, message: string, data?: any, methodName?: string) => logger.debug(objectName, message, data, methodName);
export const logTrace = (objectName: string, message: string, data?: any, methodName?: string) => logger.trace(objectName, message, data, methodName);
export const log = (objectName: string, message: string, data?: any, methodName?: string) => logger.log(objectName, message, data, methodName);
