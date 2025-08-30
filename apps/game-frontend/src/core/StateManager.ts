import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * State Manager using the State Pattern
 * Manages game state, save/load functionality, and state persistence
 */
export class StateManager {
    private state: Map<string, any> = new Map();
    private subscribers: Map<string, Set<(state: any) => void>> = new Map();
    private isActive: boolean = true;
    private autoSave: boolean = true;
    private autoSaveInterval: number = 30000; // 30 seconds
    private autoSaveTimer: NodeJS.Timeout | null = null;
    
    constructor() {
        logInfo('StateManager', 'Initialized', {
            note: "Ready to manage game state and persistence"
        }, 'constructor');
        
        this.startAutoSave();
    }
    
    /**
     * Set a state value
     */
    setState(key: string, value: any): void {
        if (!this.isActive) return;
        
        const oldValue = this.state.get(key);
        this.state.set(key, value);
        
        // Notify subscribers
        this.notifySubscribers(key, value, oldValue);
        
        logDebug('StateManager', 'State updated', {
            key,
            oldValue,
            newValue: value
        }, 'setState');
    }
    
    /**
     * Get a state value
     */
    getState(key: string): any {
        return this.state.get(key);
    }
    
    /**
     * Get all state keys
     */
    getStateKeys(): string[] {
        return Array.from(this.state.keys());
    }
    
    /**
     * Check if a state key exists
     */
    hasState(key: string): boolean {
        return this.state.has(key);
    }
    
    /**
     * Delete a state value
     */
    deleteState(key: string): boolean {
        const deleted = this.state.delete(key);
        
        if (deleted) {
            // Remove subscribers for this key
            this.subscribers.delete(key);
            
            logDebug('StateManager', 'State deleted', {
                key
            }, 'deleteState');
        }
        
        return deleted;
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(key: string, callback: (state: any) => void): void {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        
        this.subscribers.get(key)!.add(callback);
        
        logDebug('StateManager', 'State subscriber added', {
            key,
            totalSubscribers: this.subscribers.get(key)!.size
        }, 'subscribe');
    }
    
    /**
     * Unsubscribe from state changes
     */
    unsubscribe(key: string, callback: (data: any) => void): boolean {
        const subscribers = this.subscribers.get(key);
        
        if (!subscribers) return false;
        
        const removed = subscribers.delete(callback);
        
        if (removed && subscribers.size === 0) {
            this.subscribers.delete(key);
        }
        
        if (removed) {
            logDebug('StateManager', 'State subscriber removed', {
                key,
                remainingSubscribers: subscribers.size
            }, 'unsubscribe');
        }
        
        return removed;
    }
    
    /**
     * Notify subscribers of state changes
     */
    private notifySubscribers(key: string, newValue: any, oldValue: any): void {
        const subscribers = this.subscribers.get(key);
        
        if (!subscribers) return;
        
        for (const callback of subscribers) {
            try {
                callback(newValue);
            } catch (error) {
                logError('StateManager', 'Error in state subscriber callback', {
                    key,
                    error
                }, 'notifySubscribers');
            }
        }
    }
    
    /**
     * Save state to localStorage
     */
    saveToLocalStorage(): void {
        try {
            const stateData = Object.fromEntries(this.state);
            localStorage.setItem('gameState', JSON.stringify(stateData));
            
            logInfo('StateManager', 'State saved to localStorage', {
                stateKeys: this.getStateKeys(),
                dataSize: JSON.stringify(stateData).length
            }, 'saveToLocalStorage');
        } catch (error) {
            logError('StateManager', 'Error saving state to localStorage', {
                error
            }, 'saveToLocalStorage');
        }
    }
    
    /**
     * Load state from localStorage
     */
    loadFromLocalStorage(): void {
        try {
            const stateData = localStorage.getItem('gameState');
            
            if (stateData) {
                const parsedState = JSON.parse(stateData);
                
                for (const [key, value] of Object.entries(parsedState)) {
                    this.state.set(key, value);
                }
                
                logInfo('StateManager', 'State loaded from localStorage', {
                    stateKeys: this.getStateKeys(),
                    dataSize: stateData.length
                }, 'loadFromLocalStorage');
            }
        } catch (error) {
            logError('StateManager', 'Error loading state from localStorage', {
                error
            }, 'loadFromLocalStorage');
        }
    }
    
    /**
     * Export state as JSON
     */
    exportState(): string {
        try {
            const stateData = Object.fromEntries(this.state);
            const jsonString = JSON.stringify(stateData, null, 2);
            
            logDebug('StateManager', 'State exported as JSON', {
                stateKeys: this.getStateKeys(),
                jsonSize: jsonString.length
            }, 'exportState');
            
            return jsonString;
        } catch (error) {
            logError('StateManager', 'Error exporting state', {
                error
            }, 'exportState');
            return '{}';
        }
    }
    
    /**
     * Import state from JSON
     */
    importState(jsonString: string): boolean {
        try {
            const stateData = JSON.parse(jsonString);
            
            // Clear existing state
            this.state.clear();
            
            // Import new state
            for (const [key, value] of Object.entries(stateData)) {
                this.state.set(key, value);
            }
            
            logInfo('StateManager', 'State imported from JSON', {
                stateKeys: this.getStateKeys(),
                jsonSize: jsonString.length
            }, 'importState');
            
            return true;
        } catch (error) {
            logError('StateManager', 'Error importing state', {
                error,
                jsonString
            }, 'importState');
            return false;
        }
    }
    
    /**
     * Start auto-save functionality
     */
    startAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        if (this.autoSave) {
            this.autoSaveTimer = setInterval(() => {
                this.saveToLocalStorage();
            }, this.autoSaveInterval);
            
            logDebug('StateManager', 'Auto-save started', {
                interval: this.autoSaveInterval
            }, 'startAutoSave');
        }
    }
    
    /**
     * Stop auto-save functionality
     */
    stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            
            logDebug('StateManager', 'Auto-save stopped', {}, 'stopAutoSave');
        }
    }
    
    /**
     * Set auto-save configuration
     */
    setAutoSave(enabled: boolean, interval?: number): void {
        this.autoSave = enabled;
        
        if (interval !== undefined) {
            this.autoSaveInterval = interval;
        }
        
        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        
        logInfo('StateManager', 'Auto-save configuration updated', {
            enabled: this.autoSave,
            interval: this.autoSaveInterval
        }, 'setAutoSave');
    }
    
    /**
     * Enable/disable state management
     */
    setActive(active: boolean): void {
        this.isActive = active;
        
        if (active) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        
        logInfo('StateManager', 'State management state changed', {
            active,
            note: active ? "State management enabled" : "State management disabled"
        }, 'setActive');
    }
    
    /**
     * Clear all state and subscribers
     */
    clear(): void {
        logInfo('StateManager', 'Clearing all state and subscribers', {
            stateCount: this.state.size,
            subscriberCount: this.subscribers.size
        }, 'clear');
        
        this.state.clear();
        this.subscribers.clear();
    }
    
    /**
     * Get state manager statistics
     */
    getStats(): {
        totalStates: number;
        totalSubscribers: number;
        isActive: boolean;
        autoSave: boolean;
        autoSaveInterval: number;
    } {
        let totalSubscribers = 0;
        
        for (const subscribers of this.subscribers.values()) {
            totalSubscribers += subscribers.size;
        }
        
        return {
            totalStates: this.state.size,
            totalSubscribers,
            isActive: this.isActive,
            autoSave: this.autoSave,
            autoSaveInterval: this.autoSaveInterval
        };
    }
    
    /**
     * Cleanup on destroy
     */
    destroy(): void {
        this.stopAutoSave();
        this.clear();
        
        logInfo('StateManager', 'State manager destroyed', {}, 'destroy');
    }
}
