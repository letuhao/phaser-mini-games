import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Runtime Manager using the Runtime Pattern
 * Manages backend communication, runtime settings, and external integrations
 */
export class RuntimeManager {
    private settings: Map<string, any> = new Map();
    private apiEndpoints: Map<string, string> = new Map();
    private apiHeaders: Map<string, Record<string, string>> = new Map();
    private isActive: boolean = true;
    private baseUrl: string = '';
    private timeout: number = 30000; // 30 seconds
    private retryAttempts: number = 3;
    private retryDelay: number = 1000; // 1 second
    
    constructor() {
        logInfo('RuntimeManager', 'Initialized', {
            note: "Ready to manage runtime settings and backend communication"
        }, 'constructor');
        
        this.loadDefaultSettings();
    }
    
    /**
     * Load default runtime settings
     */
    private loadDefaultSettings(): void {
        // Default API settings
        this.settings.set('api.baseUrl', 'http://localhost:3000');
        this.settings.set('api.timeout', 30000);
        this.settings.set('api.retryAttempts', 3);
        this.settings.set('api.retryDelay', 1000);
        
        // Default game settings
        this.settings.set('game.debug', false);
        this.settings.set('game.logLevel', 'info');
        this.settings.set('game.autoSave', true);
        this.settings.set('game.autoSaveInterval', 30000);
        
        // Default UI settings
        this.settings.set('ui.theme', 'default');
        this.settings.set('ui.language', 'en');
        this.settings.set('ui.animations', true);
        
        // Default performance settings
        this.settings.set('performance.targetFPS', 60);
        this.settings.set('performance.vSync', true);
        this.settings.set('performance.antiAliasing', true);
        
        logDebug('RuntimeManager', 'Default settings loaded', {
            settingCount: this.settings.size
        }, 'loadDefaultSettings');
    }
    
    /**
     * Set a runtime setting
     */
    setSetting(key: string, value: any): void {
        if (!this.isActive) return;
        
        const oldValue = this.settings.get(key);
        this.settings.set(key, value);
        
        logDebug('RuntimeManager', 'Runtime setting updated', {
            key,
            oldValue,
            newValue: value
        }, 'setSetting');
        
        // Update related properties
        this.updateRelatedProperties(key, value);
    }
    
    /**
     * Get a runtime setting
     */
    getSetting(key: string, defaultValue?: any): any {
        const value = this.settings.get(key);
        
        if (value === undefined && defaultValue !== undefined) {
            return defaultValue;
        }
        
        return value;
    }
    
    /**
     * Update related properties when settings change
     */
    private updateRelatedProperties(key: string, value: any): void {
        switch (key) {
            case 'api.baseUrl':
                this.baseUrl = value;
                break;
            case 'api.timeout':
                this.timeout = value;
                break;
            case 'api.retryAttempts':
                this.retryAttempts = value;
                break;
            case 'api.retryDelay':
                this.retryDelay = value;
                break;
        }
    }
    
    /**
     * Register an API endpoint
     */
    registerEndpoint(name: string, url: string, headers?: Record<string, string>): void {
        this.apiEndpoints.set(name, url);
        
        if (headers) {
            this.apiHeaders.set(name, headers);
        }
        
        logDebug('RuntimeManager', 'API endpoint registered', {
            name,
            url,
            hasHeaders: !!headers
        }, 'registerEndpoint');
    }
    
    /**
     * Make an API request
     */
    async apiRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
        data?: any,
        customHeaders?: Record<string, string>
    ): Promise<any> {
        if (!this.isActive) {
            throw new Error('RuntimeManager is not active');
        }
        
        const url = this.apiEndpoints.get(endpoint);
        if (!url) {
            throw new Error(`API endpoint '${endpoint}' not found`);
        }
        
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        const headers = this.buildHeaders(endpoint, customHeaders);
        
        logDebug('RuntimeManager', 'Making API request', {
            endpoint,
            method,
            url: fullUrl,
            hasData: !!data
        }, 'apiRequest');
        
        try {
            const response = await this.makeRequest(fullUrl, method, data, headers);
            return response;
        } catch (error) {
            logError('RuntimeManager', 'API request failed', {
                endpoint,
                method,
                url: fullUrl,
                error
            }, 'apiRequest');
            throw error;
        }
    }
    
    /**
     * Build request headers
     */
    private buildHeaders(endpoint: string, customHeaders?: Record<string, string>): Record<string, string> {
        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Add endpoint-specific headers
        const endpointHeaders = this.apiHeaders.get(endpoint);
        if (endpointHeaders) {
            Object.assign(defaultHeaders, endpointHeaders);
        }
        
        // Add custom headers
        if (customHeaders) {
            Object.assign(defaultHeaders, customHeaders);
        }
        
        return defaultHeaders;
    }
    
    /**
     * Make HTTP request with retry logic
     */
    private async makeRequest(
        url: string,
        method: string,
        data?: any,
        headers?: Record<string, string>
    ): Promise<any> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const requestOptions: RequestInit = {
                    method,
                    headers,
                    signal: controller.signal
                };
                
                if (data && method !== 'GET') {
                    requestOptions.body = JSON.stringify(data);
                }
                
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
                
            } catch (error) {
                lastError = error as Error;
                
                if (attempt < this.retryAttempts) {
                    logWarn('RuntimeManager', 'API request failed, retrying', {
                        attempt,
                        maxAttempts: this.retryAttempts,
                        error: lastError.message
                    }, 'makeRequest');
                    
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw lastError || new Error('API request failed after all retry attempts');
    }
    
    /**
     * Delay utility
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get all runtime settings
     */
    getAllSettings(): Record<string, any> {
        return Object.fromEntries(this.settings);
    }
    
    /**
     * Load settings from external source (e.g., localStorage, backend)
     */
    async loadSettings(source: 'localStorage' | 'backend' | 'file'): Promise<boolean> {
        try {
            switch (source) {
                case 'localStorage':
                    return this.loadSettingsFromLocalStorage();
                case 'backend':
                    return await this.loadSettingsFromBackend();
                case 'file':
                    return this.loadSettingsFromFile();
                default:
                    throw new Error(`Unknown settings source: ${source}`);
            }
        } catch (error) {
            logError('RuntimeManager', 'Error loading settings', {
                source,
                error
            }, 'loadSettings');
            return false;
        }
    }
    
    /**
     * Load settings from localStorage
     */
    private loadSettingsFromLocalStorage(): boolean {
        try {
            const settingsData = localStorage.getItem('runtimeSettings');
            
            if (settingsData) {
                const parsedSettings = JSON.parse(settingsData);
                
                for (const [key, value] of Object.entries(parsedSettings)) {
                    this.settings.set(key, value);
                }
                
                logInfo('RuntimeManager', 'Settings loaded from localStorage', {
                    settingCount: Object.keys(parsedSettings).length
                }, 'loadSettingsFromLocalStorage');
                
                return true;
            }
            
            return false;
        } catch (error) {
            logError('RuntimeManager', 'Error loading settings from localStorage', {
                error
            }, 'loadSettingsFromLocalStorage');
            return false;
        }
    }
    
    /**
     * Load settings from backend
     */
    private async loadSettingsFromBackend(): Promise<boolean> {
        try {
            const response = await this.apiRequest('settings', 'GET');
            
            if (response && typeof response === 'object') {
                for (const [key, value] of Object.entries(response)) {
                    this.settings.set(key, value);
                }
                
                logInfo('RuntimeManager', 'Settings loaded from backend', {
                    settingCount: Object.keys(response).length
                }, 'loadSettingsFromBackend');
                
                return true;
            }
            
            return false;
        } catch (error) {
            logError('RuntimeManager', 'Error loading settings from backend', {
                error
            }, 'loadSettingsFromBackend');
            return false;
        }
    }
    
    /**
     * Load settings from file (placeholder for future implementation)
     */
    private loadSettingsFromFile(): boolean {
        // This would be implemented for file-based settings
        logWarn('RuntimeManager', 'File-based settings not implemented yet', {}, 'loadSettingsFromFile');
        return false;
    }
    
    /**
     * Save settings to external source
     */
    async saveSettings(destination: 'localStorage' | 'backend'): Promise<boolean> {
        try {
            switch (destination) {
                case 'localStorage':
                    return this.saveSettingsToLocalStorage();
                case 'backend':
                    return await this.saveSettingsToBackend();
                default:
                    throw new Error(`Unknown settings destination: ${destination}`);
            }
        } catch (error) {
            logError('RuntimeManager', 'Error saving settings', {
                destination,
                error
            }, 'saveSettings');
            return false;
        }
    }
    
    /**
     * Save settings to localStorage
     */
    private saveSettingsToLocalStorage(): boolean {
        try {
            const settingsData = Object.fromEntries(this.settings);
            localStorage.setItem('runtimeSettings', JSON.stringify(settingsData));
            
            logInfo('RuntimeManager', 'Settings saved to localStorage', {
                settingCount: this.settings.size
            }, 'saveSettingsToLocalStorage');
            
            return true;
        } catch (error) {
            logError('RuntimeManager', 'Error saving settings to localStorage', {
                error
            }, 'saveSettingsToLocalStorage');
            return false;
        }
    }
    
    /**
     * Save settings to backend
     */
    private async saveSettingsToBackend(): Promise<boolean> {
        try {
            const settingsData = Object.fromEntries(this.settings);
            await this.apiRequest('settings', 'POST', settingsData);
            
            logInfo('RuntimeManager', 'Settings saved to backend', {
                settingCount: this.settings.size
            }, 'saveSettingsToBackend');
            
            return true;
        } catch (error) {
            logError('RuntimeManager', 'Error saving settings to backend', {
                error
            }, 'saveSettingsToBackend');
            return false;
        }
    }
    
    /**
     * Get runtime manager statistics
     */
    getStats(): {
        totalSettings: number;
        totalEndpoints: number;
        totalHeaders: number;
        isActive: boolean;
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
    } {
        return {
            totalSettings: this.settings.size,
            totalEndpoints: this.apiEndpoints.size,
            totalHeaders: this.apiHeaders.size,
            isActive: this.isActive,
            baseUrl: this.baseUrl,
            timeout: this.timeout,
            retryAttempts: this.retryAttempts
        };
    }
    
    /**
     * Enable/disable runtime management
     */
    setActive(active: boolean): void {
        this.isActive = active;
        
        logInfo('RuntimeManager', 'Runtime management state changed', {
            active,
            note: active ? "Runtime management enabled" : "Runtime management disabled"
        }, 'setActive');
    }
    
    /**
     * Clear all settings and endpoints
     */
    clear(): void {
        logInfo('RuntimeManager', 'Clearing all runtime data', {
            settingCount: this.settings.size,
            endpointCount: this.apiEndpoints.size
        }, 'clear');
        
        this.settings.clear();
        this.apiEndpoints.clear();
        this.apiHeaders.clear();
        
        // Reload default settings
        this.loadDefaultSettings();
    }
    
    /**
     * Export settings as JSON
     */
    exportSettings(): string {
        try {
            const settingsData = Object.fromEntries(this.settings);
            return JSON.stringify(settingsData, null, 2);
        } catch (error) {
            logError('RuntimeManager', 'Error exporting settings', {
                error
            }, 'exportSettings');
            return '{}';
        }
    }
    
    /**
     * Import settings from JSON
     */
    importSettings(jsonString: string): boolean {
        try {
            const settingsData = JSON.parse(jsonString);
            
            // Clear existing settings
            this.settings.clear();
            
            // Import new settings
            for (const [key, value] of Object.entries(settingsData)) {
                this.settings.set(key, value);
            }
            
            // Update related properties
            for (const [key, value] of Object.entries(settingsData)) {
                this.updateRelatedProperties(key, value);
            }
            
            logInfo('RuntimeManager', 'Settings imported from JSON', {
                settingCount: Object.keys(settingsData).length
            }, 'importSettings');
            
            return true;
        } catch (error) {
            logError('RuntimeManager', 'Error importing settings', {
                error,
                jsonString
            }, 'importSettings');
            return false;
        }
    }
}
