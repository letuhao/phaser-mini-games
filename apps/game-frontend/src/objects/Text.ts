// ============================================================================
// TEXT - Text Display Game Object
// ============================================================================
// This class implements ITextObject interface for displaying text
// Provides text styling, font management, and color control

import { BaseGameObject } from './BaseGameObject';
import { 
    ITextObject, 
    TextObjectConfig,
    IUIObject
} from './types';
import { logDebug, logInfo } from '../core/Logger';

export class Text extends BaseGameObject {
    // Text-specific properties
    public text: string = '';
    private fontSize: string = '24px';
    private color: string = '#ffffff';
    private fontFamily: string = 'Arial';
    private fontStyle: string = 'normal';
    private fontWeight: string = 'normal';
    private textAlign: string = 'center';
    private wordWrap: boolean = false;
    private wordWrapWidth: number = 0;
    
    // Phaser text reference
    private phaserText: Phaser.GameObjects.Text | null = null;
    
    // Scene reference (required by IGameObject)
    public scene: Phaser.Scene;
    
    // Visible property (required by IVisible interface)
    public visible: boolean = true;
    
    // UI state
    private isEnabled: boolean = true;
    
    constructor(config: TextObjectConfig, scene: Phaser.Scene) {
        super(config, scene);
        this.scene = scene;
        
        // Initialize text-specific properties
        if (config.text) this.text = config.text;
        if (config.style?.fontSize) this.fontSize = config.style.fontSize;
        if (config.style?.color) this.color = config.style.color;
        if (config.style?.fontFamily) this.fontFamily = config.style.fontFamily;
        if (config.style?.fontStyle) this.fontStyle = config.style.fontStyle;
        if (config.style?.fontWeight) this.fontWeight = config.style.fontWeight;
        if (config.style?.textAlign) this.textAlign = config.style.textAlign;
        if (config.style?.wordWrap !== undefined) this.wordWrap = config.style.wordWrap;
        if (config.style?.wordWrapWidth) this.wordWrapWidth = config.style.wordWrapWidth;
        
        logDebug('Text', `Text object initialized: ${this.text}`, {
            id: this.id,
            name: this.name,
            text: this.text,
            fontSize: this.fontSize,
            color: this.color,
            fontFamily: this.fontFamily
        }, 'constructor');
    }
    
    // ============================================================================
    // IUIObject Implementation
    // ============================================================================
    
    public enable(): void {
        this.isEnabled = true;
        logDebug('Text', 'Text object enabled', {
            id: this.id,
            name: this.name
        }, 'enable');
    }
    
    public disable(): void {
        this.isEnabled = false;
        logDebug('Text', 'Text object disabled', {
            id: this.id,
            name: this.name
        }, 'disable');
    }
    
    public get isEnabledObject(): boolean {
        return this.isEnabled;
    }
    
    // ============================================================================
    // ITextObject Implementation
    // ============================================================================
    
    public setText(text: string): void {
        this.text = text;
        if (this.phaserText) {
            this.phaserText.setText(text);
        }
        logDebug('Text', 'Text content updated', {
            id: this.id,
            name: this.name,
            text
        }, 'setText');
    }
    
    public setFontSize(size: string): void {
        this.fontSize = size;
        if (this.phaserText) {
            this.phaserText.setFontSize(size);
        }
        logDebug('Text', 'Font size updated', {
            id: this.id,
            name: this.name,
            fontSize: size
        }, 'setFontSize');
    }
    
    public setColor(color: string): void {
        this.color = color;
        if (this.phaserText) {
            this.phaserText.setColor(color);
        }
        logDebug('Text', 'Text color updated', {
            id: this.id,
            name: this.name,
            color
        }, 'setColor');
    }
    
    // ============================================================================
    // IVisible Implementation
    // ============================================================================
    
    public setVisible(visible: boolean): void {
        this.visible = visible;
        if (this.phaserText) {
            this.phaserText.setVisible(visible);
        }
        logDebug('Text', `Set text visible: ${visible}`, {
            id: this.id,
            name: this.name,
            visible
        }, 'setVisible');
    }
    
    // ============================================================================
    // Text Styling Methods
    // ============================================================================
    
    public setFontFamily(fontFamily: string): void {
        this.fontFamily = fontFamily;
        if (this.phaserText) {
            this.phaserText.setFontFamily(fontFamily);
        }
        logDebug('Text', 'Font family updated', {
            id: this.id,
            name: this.name,
            fontFamily
        }, 'setFontFamily');
    }
    
    public setFontStyle(style: string): void {
        this.fontStyle = style;
        if (this.phaserText) {
            this.phaserText.setFontStyle(style);
        }
        logDebug('Text', 'Font style updated', {
            id: this.id,
            name: this.name,
            style
        }, 'setFontStyle');
    }
    
    public setFontWeight(weight: string): void {
        this.fontWeight = weight;
        // Note: Phaser Text doesn't have setFontWeight method
        // Font weight is set when creating the text object
        logDebug('Text', 'Font weight updated', {
            id: this.id,
            name: this.name,
            weight
        }, 'setFontWeight');
    }
    
    public setTextAlign(align: string): void {
        this.textAlign = align;
        if (this.phaserText) {
            this.phaserText.setAlign(align);
        }
        logDebug('Text', 'Text alignment updated', {
            id: this.id,
            name: this.name,
            align
        }, 'setTextAlign');
    }
    
    public setWordWrap(enabled: boolean, width?: number): void {
        this.wordWrap = enabled;
        if (width !== undefined) {
            this.wordWrapWidth = width;
        }
        
        if (this.phaserText) {
            if (enabled) {
                this.phaserText.setWordWrapWidth(this.wordWrapWidth);
            } else {
                this.phaserText.setWordWrapWidth(0);
            }
        }
        
        logDebug('Text', 'Word wrap updated', {
            id: this.id,
            name: this.name,
            enabled,
            width: this.wordWrapWidth
        }, 'setWordWrap');
    }
    
    // ============================================================================
    // Phaser Integration
    // ============================================================================
    
    public override create(scene: Phaser.Scene): Phaser.GameObjects.Text {
        // Create text style configuration
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: this.fontSize,
            color: this.color,
            fontFamily: this.fontFamily,
            fontStyle: this.fontStyle,
            // Note: fontWeight is not supported in Phaser Text
            align: this.textAlign as any,
            wordWrap: this.wordWrap ? { width: this.wordWrapWidth } : undefined
        };
        
        // Create Phaser text object
        this.phaserText = scene.add.text(this.x, this.y, this.text, textStyle);
        
        // Set origin
        this.phaserText.setOrigin(0.5);
        
        // Set scale
        this.phaserText.setScale(this.scale);
        
        // Set visibility
        this.phaserText.setVisible(this.visible);
        
        // Set active state
        this.phaserText.setActive(this.isActive);
        
        // Assign to base class
        this.setPhaserObject(this.phaserText);
        
        logInfo('Text', 'Phaser text created', {
            id: this.id,
            name: this.name,
            position: { x: this.x, y: this.y },
            text: this.text,
            style: textStyle,
            scale: this.scale
        }, 'create');
        
        return this.phaserText;
    }
    
    public override update(time: number, delta: number): void {
        // Text objects typically don't need update logic
        // But we can add animations or effects here if needed
    }
    
    // ============================================================================
    // Text-Specific Methods
    // ============================================================================
    
    public getTextStatus(): {
        id: string;
        name: string;
        text: string;
        fontSize: string;
        color: string;
        fontFamily: string;
        fontStyle: string;
        fontWeight: string;
        textAlign: string;
        wordWrap: boolean;
        wordWrapWidth: number;
        enabled: boolean;
        visible: boolean;
        isActive: boolean;
        hasPhaserText: boolean;
    } {
        return {
            id: this.id,
            name: this.name,
            text: this.text,
            fontSize: this.fontSize,
            color: this.color,
            fontFamily: this.fontFamily,
            fontStyle: this.fontStyle,
            fontWeight: this.fontWeight,
            textAlign: this.textAlign,
            wordWrap: this.wordWrap,
            wordWrapWidth: this.wordWrapWidth,
            enabled: this.isEnabled,
            visible: this.visible,
            isActive: this.isActive,
            hasPhaserText: this.phaserText !== null
        };
    }
    
    // ============================================================================
    // Cleanup
    // ============================================================================
    
    public override destroy(): void {
        // Destroy Phaser text object
        if (this.phaserText) {
            this.phaserText.destroy();
            this.phaserText = null;
        }
        
        // Call parent destroy
        super.destroy();
        
        logInfo('Text', 'Text object destroyed', {
            id: this.id,
            name: this.name
        }, 'destroy');
    }
}
