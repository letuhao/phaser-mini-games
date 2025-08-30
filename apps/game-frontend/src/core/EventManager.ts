import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Event Manager using the Event Pattern
 * Provides centralized event system for loose coupling between game systems
 */
export class EventManager {
    private events: Map<string, Set<(data?: any) => void>> = new Map();
    private onceEvents: Map<string, Set<(data?: any) => void>> = new Map();
    private isActive: boolean = true;
    
    constructor() {
        logInfo('EventManager', 'Initialized', {
            note: "Ready to manage events for loose coupling between systems"
        }, 'constructor');
    }
    
    /**
     * Emit an event to all registered listeners
     */
    emit(event: string, data?: any): void {
        if (!this.isActive) return;
        
        const listeners = this.events.get(event);
        const onceListeners = this.onceEvents.get(event);
        
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback(data);
                } catch (error) {
                    logError('EventManager', 'Error in event callback', {
                        event,
                        error
                    }, 'emit');
                }
            }
        }
        
        if (onceListeners) {
            for (const callback of onceListeners) {
                try {
                    callback(data);
                } catch (error) {
                    logError('EventManager', 'Error in once event callback', {
                        event,
                        error
                    }, 'emit');
                }
            }
            // Clear once listeners after execution
            this.onceEvents.delete(event);
        }
        
        logDebug('EventManager', 'Event emitted', {
            event,
            data,
            listenerCount: (listeners?.size || 0) + (onceListeners?.size || 0)
        }, 'emit');
    }
    
    /**
     * Register a listener for an event
     */
    on(event: string, callback: (data?: any) => void): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        
        this.events.get(event)!.add(callback);
        
        logDebug('EventManager', 'Event listener registered', {
            event,
            totalListeners: this.events.get(event)!.size
        }, 'on');
    }
    
    /**
     * Register a listener that will be called only once
     */
    once(event: string, callback: (data?: any) => void): void {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, new Set());
        }
        
        this.onceEvents.get(event)!.add(callback);
        
        logDebug('EventManager', 'Once event listener registered', {
            event,
            totalOnceListeners: this.onceEvents.get(event)!.size
        }, 'once');
    }
    
    /**
     * Remove a listener from an event
     */
    off(event: string, callback: (data?: any) => void): boolean {
        const listeners = this.events.get(event);
        const onceListeners = this.onceEvents.get(event);
        
        let removed = false;
        
        if (listeners && listeners.has(callback)) {
            listeners.delete(callback);
            removed = true;
            
            if (listeners.size === 0) {
                this.events.delete(event);
            }
        }
        
        if (onceListeners && onceListeners.has(callback)) {
            onceListeners.delete(callback);
            removed = true;
            
            if (onceListeners.size === 0) {
                this.onceEvents.delete(event);
            }
        }
        
        if (removed) {
            logDebug('EventManager', 'Event listener removed', {
                event,
                remainingListeners: (listeners?.size || 0) + (onceListeners?.size || 0)
            }, 'off');
        }
        
        return removed;
    }
    
    /**
     * Remove all listeners for a specific event
     */
    removeAllListeners(event: string): boolean {
        const listenersRemoved = this.events.delete(event);
        const onceListenersRemoved = this.onceEvents.delete(event);
        
        if (listenersRemoved || onceListenersRemoved) {
            logDebug('EventManager', 'All listeners removed for event', {
                event
            }, 'removeAllListeners');
        }
        
        return listenersRemoved || onceListenersRemoved;
    }
    
    /**
     * Get the number of listeners for an event
     */
    getListenerCount(event: string): number {
        const listeners = this.events.get(event);
        const onceListeners = this.onceEvents.get(event);
        
        return (listeners?.size || 0) + (onceListeners?.size || 0);
    }
    
    /**
     * Get all registered event names
     */
    getEventNames(): string[] {
        const allEvents = new Set<string>();
        
        for (const event of this.events.keys()) {
            allEvents.add(event);
        }
        
        for (const event of this.onceEvents.keys()) {
            allEvents.add(event);
        }
        
        return Array.from(allEvents);
    }
    
    /**
     * Enable/disable event emission
     */
    setActive(active: boolean): void {
        this.isActive = active;
        logInfo('EventManager', 'Event emission state changed', {
            active,
            note: active ? "Event emission enabled" : "Event emission disabled"
        }, 'setActive');
    }
    
    /**
     * Clear all events and listeners
     */
    clear(): void {
        logInfo('EventManager', 'Clearing all events and listeners', {
            eventCount: this.events.size,
            onceEventCount: this.onceEvents.size
        }, 'clear');
        
        this.events.clear();
        this.onceEvents.clear();
    }
    
    /**
     * Get event manager statistics
     */
    getStats(): {
        totalEvents: number;
        totalOnceEvents: number;
        totalListeners: number;
        isActive: boolean;
    } {
        let totalListeners = 0;
        
        for (const listeners of this.events.values()) {
            totalListeners += listeners.size;
        }
        
        for (const listeners of this.onceEvents.values()) {
            totalListeners += listeners.size;
        }
        
        return {
            totalEvents: this.events.size,
            totalOnceEvents: this.onceEvents.size,
            totalListeners,
            isActive: this.isActive
        };
    }
}
