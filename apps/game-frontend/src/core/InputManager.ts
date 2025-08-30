import { logInfo, logDebug, logWarn, logError } from './Logger';

/**
 * Input Manager using the Input Pattern
 * Centralized input handling for keyboard, mouse, touch, and gamepad
 */
export class InputManager {
    private keyHandlers: Map<string, Set<() => void>> = new Map();
    private mouseHandlers: Map<string, Set<(x: number, y: number) => void>> = new Map();
    private touchHandlers: Map<string, Set<(x: number, y: number) => void>> = new Map();
    private gamepadHandlers: Map<string, Set<(data: any) => void>> = new Map();
    private isActive: boolean = true;
    private scene: Phaser.Scene | null = null;
    
    constructor() {
        logInfo('InputManager', 'Initialized', {
            note: "Ready to manage input handling for all input types"
        }, 'constructor');
    }
    
    /**
     * Initialize input manager with a Phaser scene
     */
    initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        this.setupPhaserInput();
        
        logInfo('InputManager', 'Input manager initialized with scene', {
            sceneKey: scene.scene.key
        }, 'initialize');
    }
    
    /**
     * Setup Phaser input events
     */
    private setupPhaserInput(): void {
        if (!this.scene) return;
        
        // Keyboard events
        this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.handleKeyDown(event.code);
        });
        
        this.scene.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
            this.handleKeyUp(event.code);
        });
        
        // Mouse events
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleMouseDown(pointer.x, pointer.y);
        });
        
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.handleMouseUp(pointer.x, pointer.y);
        });
        
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.handleMouseMove(pointer.x, pointer.y);
        });
        
        // Touch events - using pointer ID to detect touch
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Touch events typically have pointer ID > 0
            if (pointer.id > 0) {
                this.handleTouchStart(pointer.x, pointer.y);
            }
        });
        
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.id > 0) {
                this.handleTouchEnd(pointer.x, pointer.y);
            }
        });
        
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.id > 0) {
                this.handleTouchMove(pointer.x, pointer.y);
            }
        });
        
        logDebug('InputManager', 'Phaser input events configured', {}, 'setupPhaserInput');
    }
    
    /**
     * Register a keyboard handler
     */
    onKeyDown(key: string, callback: () => void): void {
        if (!this.keyHandlers.has(key)) {
            this.keyHandlers.set(key, new Set());
        }
        
        this.keyHandlers.get(key)!.add(callback);
        
        logDebug('InputManager', 'Key down handler registered', {
            key,
            totalHandlers: this.keyHandlers.get(key)!.size
        }, 'onKeyDown');
    }
    
    /**
     * Register a keyboard handler for key up
     */
    onKeyUp(key: string, callback: () => void): void {
        const keyUpKey = `${key}_up`;
        
        if (!this.keyHandlers.has(keyUpKey)) {
            this.keyHandlers.set(keyUpKey, new Set());
        }
        
        this.keyHandlers.get(keyUpKey)!.add(callback);
        
        logDebug('InputManager', 'Key up handler registered', {
            key,
            totalHandlers: this.keyHandlers.get(keyUpKey)!.size
        }, 'onKeyUp');
    }
    
    /**
     * Register a mouse click handler
     */
    onMouseClick(callback: (x: number, y: number) => void): void {
        if (!this.mouseHandlers.has('click')) {
            this.mouseHandlers.set('click', new Set());
        }
        
        this.mouseHandlers.get('click')!.add(callback);
        
        logDebug('InputManager', 'Mouse click handler registered', {
            totalHandlers: this.mouseHandlers.get('click')!.size
        }, 'onMouseClick');
    }
    
    /**
     * Register a mouse move handler
     */
    onMouseMove(callback: (x: number, y: number) => void): void {
        if (!this.mouseHandlers.has('move')) {
            this.mouseHandlers.set('move', new Set());
        }
        
        this.mouseHandlers.get('move')!.add(callback);
        
        logDebug('InputManager', 'Mouse move handler registered', {
            totalHandlers: this.mouseHandlers.get('move')!.size
        }, 'onMouseMove');
    }
    
    /**
     * Register a touch handler
     */
    onTouch(callback: (x: number, y: number) => void): void {
        if (!this.touchHandlers.has('touch')) {
            this.touchHandlers.set('touch', new Set());
        }
        
        this.touchHandlers.get('touch')!.add(callback);
        
        logDebug('InputManager', 'Touch handler registered', {
            totalHandlers: this.touchHandlers.get('touch')!.size
        }, 'onTouch');
    }
    
    /**
     * Register a gamepad handler
     */
    onGamepad(event: string, callback: (data: any) => void): void {
        if (!this.gamepadHandlers.has(event)) {
            this.gamepadHandlers.set(event, new Set());
        }
        
        this.gamepadHandlers.get(event)!.add(callback);
        
        logDebug('InputManager', 'Gamepad handler registered', {
            event,
            totalHandlers: this.gamepadHandlers.get(event)!.size
        }, 'onGamepad');
    }
    
    /**
     * Remove a keyboard handler
     */
    offKeyDown(key: string, callback: () => void): boolean {
        const handlers = this.keyHandlers.get(key);
        
        if (!handlers) return false;
        
        const removed = handlers.delete(callback);
        
        if (removed && handlers.size === 0) {
            this.keyHandlers.delete(key);
        }
        
        return removed;
    }
    
    /**
     * Remove a mouse handler
     */
    offMouse(event: string, callback: (x: number, y: number) => void): boolean {
        const handlers = this.mouseHandlers.get(event);
        
        if (!handlers) return false;
        
        const removed = handlers.delete(callback);
        
        if (removed && handlers.size === 0) {
            this.mouseHandlers.delete(event);
        }
        
        return removed;
    }
    
    /**
     * Remove a touch handler
     */
    offTouch(callback: (x: number, y: number) => void): boolean {
        const handlers = this.touchHandlers.get('touch');
        
        if (!handlers) return false;
        
        const removed = handlers.delete(callback);
        
        if (removed && handlers.size === 0) {
            this.touchHandlers.delete('touch');
        }
        
        return removed;
    }
    
    /**
     * Remove a gamepad handler
     */
    offGamepad(event: string, callback: (data: any) => void): boolean {
        const handlers = this.gamepadHandlers.get(event);
        
        if (!handlers) return false;
        
        const removed = handlers.delete(callback);
        
        if (removed && handlers.size === 0) {
            this.gamepadHandlers.delete(event);
        }
        
        return removed;
    }
    
    /**
     * Handle key down events
     */
    private handleKeyDown(keyCode: string): void {
        if (!this.isActive) return;
        
        const handlers = this.keyHandlers.get(keyCode);
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback();
                } catch (error) {
                    logError('InputManager', 'Error in key down handler', {
                        keyCode,
                        error
                    }, 'handleKeyDown');
                }
            }
        }
        
        logDebug('InputManager', 'Key down handled', {
            keyCode,
            handlerCount: handlers?.size || 0
        }, 'handleKeyDown');
    }
    
    /**
     * Handle key up events
     */
    private handleKeyUp(keyCode: string): void {
        if (!this.isActive) return;
        
        const keyUpKey = `${keyCode}_up`;
        const handlers = this.keyHandlers.get(keyUpKey);
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback();
                } catch (error) {
                    logError('InputManager', 'Error in key up handler', {
                        keyCode,
                        error
                    }, 'handleKeyUp');
                }
            }
        }
    }
    
    /**
     * Handle mouse down events
     */
    private handleMouseDown(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.mouseHandlers.get('down');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in mouse down handler', {
                        x,
                        y,
                        error
                    }, 'handleMouseDown');
                }
            }
        }
    }
    
    /**
     * Handle mouse up events
     */
    private handleMouseUp(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.mouseHandlers.get('up');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in mouse up handler', {
                        x,
                        y,
                        error
                    }, 'handleMouseUp');
                }
            }
        }
        
        // Also trigger click event
        this.handleMouseClick(x, y);
    }
    
    /**
     * Handle mouse move events
     */
    private handleMouseMove(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.mouseHandlers.get('move');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in mouse move handler', {
                        x,
                        y,
                        error
                    }, 'handleMouseMove');
                }
            }
        }
    }
    
    /**
     * Handle mouse click events
     */
    private handleMouseClick(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.mouseHandlers.get('click');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in mouse click handler', {
                        x,
                        y,
                        error
                    }, 'handleMouseClick');
                }
            }
        }
    }
    
    /**
     * Handle touch start events
     */
    private handleTouchStart(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.touchHandlers.get('start');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in touch start handler', {
                        x,
                        y,
                        error
                    }, 'handleTouchStart');
                }
            }
        }
        
        // Also trigger general touch event
        this.handleTouch(x, y);
    }
    
    /**
     * Handle touch end events
     */
    private handleTouchEnd(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.touchHandlers.get('end');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in touch end handler', {
                        x,
                        y,
                        error
                    }, 'handleTouchEnd');
                }
            }
        }
    }
    
    /**
     * Handle touch move events
     */
    private handleTouchMove(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.touchHandlers.get('move');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in touch move handler', {
                        x,
                        y,
                        error
                    }, 'handleTouchMove');
                }
            }
        }
    }
    
    /**
     * Handle general touch events
     */
    private handleTouch(x: number, y: number): void {
        if (!this.isActive) return;
        
        const handlers = this.touchHandlers.get('touch');
        
        if (handlers) {
            for (const callback of handlers) {
                try {
                    callback(x, y);
                } catch (error) {
                    logError('InputManager', 'Error in touch handler', {
                        x,
                        y,
                        error
                    }, 'handleTouch');
                }
            }
        }
    }
    
    /**
     * Enable/disable input handling
     */
    setActive(active: boolean): void {
        this.isActive = active;
        
        logInfo('InputManager', 'Input handling state changed', {
            active,
            note: active ? "Input handling enabled" : "Input handling disabled"
        }, 'setActive');
    }
    
    /**
     * Get input manager statistics
     */
    getStats(): {
        totalKeyHandlers: number;
        totalMouseHandlers: number;
        totalTouchHandlers: number;
        totalGamepadHandlers: number;
        isActive: boolean;
    } {
        let totalKeyHandlers = 0;
        let totalMouseHandlers = 0;
        let totalTouchHandlers = 0;
        let totalGamepadHandlers = 0;
        
        for (const handlers of this.keyHandlers.values()) {
            totalKeyHandlers += handlers.size;
        }
        
        for (const handlers of this.mouseHandlers.values()) {
            totalMouseHandlers += handlers.size;
        }
        
        for (const handlers of this.touchHandlers.values()) {
            totalTouchHandlers += handlers.size;
        }
        
        for (const handlers of this.gamepadHandlers.values()) {
            totalGamepadHandlers += handlers.size;
        }
        
        return {
            totalKeyHandlers,
            totalMouseHandlers,
            totalTouchHandlers,
            totalGamepadHandlers,
            isActive: this.isActive
        };
    }
    
    /**
     * Clear all input handlers
     */
    clear(): void {
        logInfo('InputManager', 'Clearing all input handlers', {
            keyHandlers: this.keyHandlers.size,
            mouseHandlers: this.mouseHandlers.size,
            touchHandlers: this.touchHandlers.size,
            gamepadHandlers: this.gamepadHandlers.size
        }, 'clear');
        
        this.keyHandlers.clear();
        this.mouseHandlers.clear();
        this.touchHandlers.clear();
        this.gamepadHandlers.clear();
    }
}
