import { ICommand, ButtonClickCommand, CompositeCommand } from './ICommand';
import { IButtonObject } from '../objects/types';
import { logInfo, logDebug, logWarn, logError } from '../core/Logger';

/**
 * Button Manager using Command Pattern
 * Manages button commands and their execution
 */
export class ButtonManager {
    private commands: Map<string, ICommand> = new Map();
    private buttons: Map<string, IButtonObject> = new Map();
    private commandHistory: ICommand[] = [];
    private maxHistorySize: number = 50;
    
    constructor() {
        logInfo('ButtonManager', 'Initialized', {
            note: "Ready to manage button commands using command pattern"
        }, 'constructor');
    }
    
    /**
     * Register a button with its associated command
     */
    registerButton(buttonId: string, button: IButtonObject, command: ICommand): void {
        this.buttons.set(buttonId, button);
        this.commands.set(buttonId, command);
        
        logInfo('ButtonManager', 'Button registered', {
            buttonId,
            buttonType: button.constructor.name,
            commandDescription: command.getDescription()
        }, 'registerButton');
    }
    
    /**
     * Register a button with a simple action function
     */
    registerButtonAction(buttonId: string, button: IButtonObject, action: () => void): void {
        const command = new ButtonClickCommand(buttonId, action);
        this.registerButton(buttonId, button, command);
    }
    
    /**
     * Register a button with multiple actions (composite command)
     */
    registerButtonActions(buttonId: string, button: IButtonObject, actions: (() => void)[]): void {
        const compositeCommand = new CompositeCommand(`Composite actions for ${buttonId}`);
        
        actions.forEach(action => {
            const command = new ButtonClickCommand(buttonId, action);
            compositeCommand.addCommand(command);
        });
        
        this.registerButton(buttonId, button, compositeCommand);
    }
    
    /**
     * Execute a button command
     */
    executeButtonCommand(buttonId: string): boolean {
        const command = this.commands.get(buttonId);
        
        if (!command) {
            logWarn('ButtonManager', 'No command found for button', {
                buttonId,
                availableButtons: Array.from(this.commands.keys())
            }, 'executeButtonCommand');
            return false;
        }
        
        if (!command.canExecute()) {
            logWarn('ButtonManager', 'Command cannot be executed', {
                buttonId,
                commandDescription: command.getDescription()
            }, 'executeButtonCommand');
            return false;
        }
        
        try {
            logDebug('ButtonManager', 'Executing button command', {
                buttonId,
                commandDescription: command.getDescription()
            }, 'executeButtonCommand');
            
            command.execute();
            
            // Add to history for undo functionality
            this.addToHistory(command);
            
            logInfo('ButtonManager', 'Button command executed successfully', {
                buttonId,
                commandDescription: command.getDescription()
            }, 'executeButtonCommand');
            
            return true;
        } catch (error) {
            logError('ButtonManager', 'Error executing button command', {
                buttonId,
                commandDescription: command.getDescription(),
                error
            }, 'executeButtonCommand');
            return false;
        }
    }
    
    /**
     * Execute a command directly
     */
    executeCommand(command: ICommand): boolean {
        if (!command.canExecute()) {
            logWarn('ButtonManager', 'Command cannot be executed', {
                commandDescription: command.getDescription()
            }, 'executeCommand');
            return false;
        }
        
        try {
            logDebug('ButtonManager', 'Executing command', {
                commandDescription: command.getDescription()
            }, 'executeCommand');
            
            command.execute();
            
            // Add to history for undo functionality
            this.addToHistory(command);
            
            logInfo('ButtonManager', 'Command executed successfully', {
                commandDescription: command.getDescription()
            }, 'executeCommand');
            
            return true;
        } catch (error) {
            logError('ButtonManager', 'Error executing command', {
                commandDescription: command.getDescription(),
                error
            }, 'executeCommand');
            return false;
        }
    }
    
    /**
     * Undo the last executed command
     */
    undoLastCommand(): boolean {
        if (this.commandHistory.length === 0) {
            logWarn('ButtonManager', 'No commands to undo', {
                historySize: this.commandHistory.length
            }, 'undoLastCommand');
            return false;
        }
        
        const lastCommand = this.commandHistory[this.commandHistory.length - 1];
        
        if (!lastCommand.undo) {
            logWarn('ButtonManager', 'Last command does not support undo', {
                commandDescription: lastCommand.getDescription()
            }, 'undoLastCommand');
            return false;
        }
        
        try {
            logDebug('ButtonManager', 'Undoing last command', {
                commandDescription: lastCommand.getDescription()
            }, 'undoLastCommand');
            
            lastCommand.undo();
            
            // Remove from history
            this.commandHistory.pop();
            
            logInfo('ButtonManager', 'Command undone successfully', {
                commandDescription: lastCommand.getDescription(),
                remainingHistory: this.commandHistory.length
            }, 'undoLastCommand');
            
            return true;
        } catch (error) {
            logError('ButtonManager', 'Error undoing command', {
                commandDescription: lastCommand.getDescription(),
                error
            }, 'undoLastCommand');
            return false;
        }
    }
    
    /**
     * Get a button by ID
     */
    getButton(buttonId: string): IButtonObject | null {
        return this.buttons.get(buttonId) || null;
    }
    
    /**
     * Get a command by button ID
     */
    getCommand(buttonId: string): ICommand | null {
        return this.commands.get(buttonId) || null;
    }
    
    /**
     * Check if a button is registered
     */
    isButtonRegistered(buttonId: string): boolean {
        return this.buttons.has(buttonId);
    }
    
    /**
     * Get all registered button IDs
     */
    getRegisteredButtonIds(): string[] {
        return Array.from(this.buttons.keys());
    }
    
    /**
     * Get button count
     */
    getButtonCount(): number {
        return this.buttons.size;
    }
    
    /**
     * Get command history
     */
    getCommandHistory(): ICommand[] {
        return [...this.commandHistory];
    }
    
    /**
     * Clear command history
     */
    clearCommandHistory(): void {
        logInfo('ButtonManager', 'Clearing command history', {
            historySize: this.commandHistory.length
        }, 'clearCommandHistory');
        
        this.commandHistory = [];
    }
    
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        logDebug('ButtonManager', 'Max history size updated', {
            newSize: size
        }, 'setMaxHistorySize');
    }
    
    /**
     * Remove a button and its command
     */
    unregisterButton(buttonId: string): boolean {
        const button = this.buttons.get(buttonId);
        const command = this.commands.get(buttonId);
        
        if (!button || !command) {
            logWarn('ButtonManager', 'Button not found for unregistration', {
                buttonId
            }, 'unregisterButton');
            return false;
        }
        
        this.buttons.delete(buttonId);
        this.commands.delete(buttonId);
        
        logInfo('ButtonManager', 'Button unregistered', {
            buttonId,
            remainingButtons: this.buttons.size
        }, 'unregisterButton');
        
        return true;
    }
    
    /**
     * Add command to history
     */
    private addToHistory(command: ICommand): void {
        this.commandHistory.push(command);
        
        // Maintain history size limit
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.shift();
        }
    }
}
