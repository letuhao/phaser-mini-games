// ============================================================================
// BUTTON - Interactive Button Game Object
// ============================================================================
// This class implements IButtonObject interface for interactive UI buttons
// Provides click handling, hover effects, and sound integration

import { BaseGameObject } from './BaseGameObject';
import { ButtonObjectConfig } from './types';
import { logDebug, logInfo } from '../core/Logger';
import { themeManager } from '../config/theme';

export class Button extends BaseGameObject {
    // Button-specific properties
    private text: string = '';
    private iconKey: string = '';
    private backgroundColor: number = 0x4a90e2;
    private borderColor: number = 0xffffff;
    private isEnabled: boolean = true;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isHovered: boolean = false;
    private isPressed: boolean = false;
    private onClick: () => void = () => {};
    
    // Sound properties
    private soundKey: string = '';
    private volume: number = 1.0;
    private loop: boolean = false;
    
    // Phaser button reference
    private phaserButton: Phaser.GameObjects.Container | null = null;
    private backgroundRect: Phaser.GameObjects.Rectangle | null = null;
    private buttonText: Phaser.GameObjects.Text | null = null;
    private buttonIcon: Phaser.GameObjects.Image | null = null;
    
    // Hover and click effects
    private hoverScale: number = 1.05;
    private clickScale: number = 0.95;
    private hoverTint: number = 0xcccccc;
    private clickTint: number = 0x999999;
    
    constructor(config: ButtonObjectConfig, scene: Phaser.Scene) {
        super(config, scene);
        this.scene = scene;
        
        // Extract button-specific properties from config
        if (config.text) this.text = config.text;
        if ('iconKey' in config && config.iconKey) this.iconKey = config.iconKey as string;
        if (config.backgroundColor) this.backgroundColor = config.backgroundColor;
        if (config.borderColor) this.borderColor = config.borderColor;
        if (config.hoverScale) this.hoverScale = config.hoverScale;
        if (config.clickScale) this.clickScale = config.clickScale;
        if (config.hoverTint) this.hoverTint = config.hoverTint;
        if (config.clickTint) this.clickTint = config.clickTint;
        if (config.onClick) this.onClick = config.onClick;
        
        logDebug('Button', 'Button created', {
            id: this.id,
            name: this.name,
            text: this.text,
            iconKey: this.iconKey,
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor
        }, 'constructor');
    }
    
    public override create(scene: Phaser.Scene): Phaser.GameObjects.Container {
        // Get current theme for logging
        const currentTheme = themeManager.getCurrentTheme();
        
        // Create Phaser container for the button
        this.phaserButton = scene.add.container(this.x, this.y);
        
        // Create background rectangle
        this.backgroundRect = scene.add.rectangle(0, 0, this.width, this.height, this.backgroundColor);
        this.backgroundRect.setStrokeStyle(2, this.borderColor);
        
        // Create text if provided
        if (this.text) {
            this.buttonText = scene.add.text(0, 0, this.text, {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            });
            this.buttonText.setOrigin(0.5);
        }
        
        // Create icon if provided
        if (this.iconKey && scene.textures.exists(this.iconKey)) {
            this.buttonIcon = scene.add.image(0, 0, this.iconKey);
            this.buttonIcon.setDisplaySize(32, 32);
            this.buttonIcon.setOrigin(0.5);
        }
        
        // Add all elements to the button container
        this.phaserButton.add([this.backgroundRect]);
        if (this.buttonText) this.phaserButton.add(this.buttonText);
        if (this.buttonIcon) this.phaserButton.add(this.buttonIcon);
        
        // Set up interaction
        this.phaserButton.setSize(this.width, this.height);
        this.phaserButton.setInteractive();
        this.setupInteraction();
        
        // Set initial state
        this.phaserButton.setVisible(this.visible);
        this.phaserButton.setActive(this.isActive);
        this.setInteractive(this.isEnabled);
        
        // Assign to base class
        this.setPhaserObject(this.phaserButton);
        
        logInfo('Button', 'Phaser button created with theme', {
            id: this.id,
            name: this.name,
            theme: currentTheme.name,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            text: this.text,
            iconKey: this.iconKey,
            enabled: this.isEnabled
        }, 'create');
        
        return this.phaserButton;
    }
    
    public override update(time: number, delta: number): void {
        // Button-specific update logic can be added here
        // For now, just implement the abstract method
    }
    
    // ============================================================================
    // IUIObject Implementation
    // ============================================================================
    
    public enable(): void {
        this.isEnabled = true;
        this.setInteractive(true);
        logDebug('Button', 'Button enabled', {
            id: this.id,
            name: this.name
        }, 'enable');
    }
    
    public disable(): void {
        this.isEnabled = false;
        this.setInteractive(false);
        logDebug('Button', 'Button disabled', {
            id: this.id,
            name: this.name
        }, 'disable');
    }
    
    public get isEnabledObject(): boolean {
        return this.isEnabled;
    }
    
    // ============================================================================
    // IButtonObject Implementation
    // ============================================================================
    
    public setEnabled(enabled: boolean): void {
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }
    
    public setText(text: string): void {
        this.text = text;
        if (this.buttonText) {
            this.buttonText.setText(text);
        }
        logDebug('Button', 'Button text updated', {
            id: this.id,
            name: this.name,
            text
        }, 'setText');
    }
    
    public setIcon(iconKey: string): void {
        this.iconKey = iconKey;
        if (this.buttonIcon && this.scene.textures.exists(iconKey)) {
            this.buttonIcon.setTexture(iconKey);
        }
        logDebug('Button', 'Button icon updated', {
            id: this.id,
            name: this.name,
            iconKey
        }, 'setIcon');
    }
    
    public setBackgroundColor(color: number): void {
        this.backgroundColor = color;
        if (this.backgroundRect) {
            this.backgroundRect.setFillStyle(color);
        }
        logDebug('Button', 'Button background color updated', {
            id: this.id,
            name: this.name,
            color: color.toString(16)
        }, 'setBackgroundColor');
    }
    
    public setBorderColor(color: number): void {
        this.borderColor = color;
        if (this.backgroundRect) {
            this.backgroundRect.setStrokeStyle(2, color);
        }
        logDebug('Button', 'Button border color updated', {
            id: this.id,
            name: this.name,
            color: color.toString(16)
        }, 'setBorderColor');
    }
    
    // ============================================================================
    // ISound Implementation
    // ============================================================================
    
    public playSound(key: string, config?: any): void {
        this.soundKey = key;
        if (config) {
            this.volume = config.volume || this.volume;
            this.loop = config.loop || this.loop;
        }
        
        // TODO: Fix sound implementation
        // if (this.scene.sound.get(key)) {
        //     this.scene.sound.play(key, { volume: this.volume, loop: this.loop });
        //     this.isPlaying = true;
        //     this.isPaused = false;
        // }
        
        logDebug('Button', 'Button sound played', {
            id: this.id,
            name: this.name,
            soundKey: key,
            volume: this.volume,
            loop: this.loop
        }, 'playSound');
    }
    
    public stopSound(): void {
        // TODO: Fix sound implementation
        // if (this.soundKey && this.scene.sound.get(this.soundKey)) {
        //     this.scene.sound.stopAll();
        //     this.isPlaying = false;
        //     this.isPaused = false;
        // }
        
        logDebug('Button', 'Button sound stopped', {
            id: this.id,
            name: this.name,
            soundKey: this.soundKey
        }, 'stopSound');
    }
    
    public pauseSound(): void {
        // TODO: Fix sound implementation
        // if (this.soundKey && this.scene.sound.get(this.soundKey)) {
        //     this.scene.sound.pauseAll();
        //     this.isPlaying = false;
        //     this.isPaused = true;
        // }
        
        logDebug('Button', 'Button sound paused', {
            id: this.id,
            name: this.name,
            soundKey: this.soundKey
        }, 'pauseSound');
    }
    
    public resumeSound(): void {
        // TODO: Fix sound implementation
        // if (this.soundKey && this.scene.sound.get(this.soundKey)) {
        //     this.scene.sound.resumeAll();
        //     this.isPlaying = true;
        //     this.isPaused = false;
        // }
        
        logDebug('Button', 'Button sound resumed', {
            id: this.id,
            name: this.name,
            soundKey: this.soundKey
        }, 'resumeSound');
    }
    
    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        logDebug('Button', 'Button sound volume updated', {
            id: this.id,
            name: this.name,
            volume: this.volume
        }, 'setVolume');
    }
    
    public setLoop(loop: boolean): void {
        this.loop = loop;
        logDebug('Button', 'Button sound loop updated', {
            id: this.id,
            name: this.name,
            loop
        }, 'setLoop');
    }
    
    public get isSoundPlaying(): boolean {
        return this.isPlaying;
    }
    
    public get isSoundPaused(): boolean {
        return this.isPaused;
    }
    
    // ============================================================================
    // IVisible Implementation
    // ============================================================================
    
    public setVisible(visible: boolean): void {
        this.visible = visible;
        if (this.phaserButton) {
            this.phaserButton.setVisible(visible);
        }
        logDebug('Button', `Set button visible: ${visible}`, {
            id: this.id,
            name: this.name,
            visible
        }, 'setVisible');
    }
    
    // ============================================================================
    // Button Interaction
    // ============================================================================
    
    private setInteractive(interactive: boolean): void {
        if (this.phaserButton) {
            this.phaserButton.setInteractive(interactive);
        }
    }
    
    private setupInteraction(): void {
        if (!this.phaserButton) return;
        
        // Hover effects
        this.phaserButton.on('pointerover', () => {
            if (!this.isEnabled) return;
            this.phaserButton?.setScale(this.hoverScale);
            // TODO: Fix tint implementation
            // if (this.backgroundRect) {
            //     this.backgroundRect.setTint(this.hoverTint);
            // }
            this.isHovered = true;
            
            logDebug('Button', 'Button hover started', {
                id: this.id,
                name: this.name,
                hoverScale: this.hoverScale,
                hoverTint: this.hoverTint
            }, 'setupInteraction');
        });
        
        this.phaserButton.on('pointerout', () => {
            if (!this.isEnabled) return;
            this.phaserButton?.setScale(1);
            // TODO: Fix tint implementation
            // if (this.backgroundRect) {
            //     this.backgroundRect.clearTint();
            // }
            this.isHovered = false;
            
            logDebug('Button', 'Button hover ended', {
                id: this.id,
                name: this.name
            }, 'setupInteraction');
        });
        
        // Click effects
        this.phaserButton.on('pointerdown', () => {
            if (!this.isEnabled) return;
            this.phaserButton?.setScale(this.clickScale);
            // TODO: Fix tint implementation
            // if (this.backgroundRect) {
            //     this.backgroundRect.setTint(this.clickTint);
            // }
            this.isPressed = true;
            
            logDebug('Button', 'Button pressed', {
                id: this.id,
                name: this.name,
                clickScale: this.clickScale,
                clickTint: this.clickTint
            }, 'setupInteraction');
        });
        
        this.phaserButton.on('pointerup', () => {
            if (!this.isEnabled) return;
            this.phaserButton?.setScale(this.hoverScale);
            // TODO: Fix tint implementation
            // if (this.backgroundRect) {
            //     this.backgroundRect.setTint(this.hoverTint);
            // }
            this.isPressed = false;
            
            // Execute click callback
            this.onClick();
            
            logDebug('Button', 'Button released', {
                id: this.id,
                name: this.name,
                hoverScale: this.hoverScale,
                hoverTint: this.hoverTint
            }, 'setupInteraction');
        });
    }
    
    // ============================================================================
    // Button-Specific Methods
    // ============================================================================
    
    public getButtonStatus(): {
        id: string;
        name: string;
        text: string;
        iconKey: string;
        enabled: boolean;
        visible: boolean;
        isActive: boolean;
        backgroundColor: number;
        borderColor: number;
        hasPhaserButton: boolean;
        soundPlaying: boolean;
        soundPaused: boolean;
    } {
        return {
            id: this.id,
            name: this.name,
            text: this.text,
            iconKey: this.iconKey,
            enabled: this.isEnabled,
            visible: this.visible,
            isActive: this.isActive,
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
            hasPhaserButton: this.phaserButton !== null,
            soundPlaying: this.isPlaying,
            soundPaused: this.isPaused
        };
    }
    
    // ============================================================================
    // Cleanup
    // ============================================================================
    
    public override destroy(): void {
        // Stop any playing sounds
        this.stopSound();
        
        // Destroy Phaser objects
        if (this.backgroundRect) {
            this.backgroundRect.destroy();
            this.backgroundRect = null;
        }
        
        if (this.buttonText) {
            this.buttonText.destroy();
            this.buttonText = null;
        }
        
        if (this.buttonIcon) {
            this.buttonIcon.destroy();
            this.buttonIcon = null;
        }
        
        if (this.phaserButton) {
            this.phaserButton.destroy();
            this.phaserButton = null;
        }
        
        // Call parent destroy
        super.destroy();
        
        logInfo('Button', 'Button destroyed', {
            id: this.id,
            name: this.name
        }, 'destroy');
    }
}
