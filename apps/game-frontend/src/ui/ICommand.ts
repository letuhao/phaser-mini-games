/**
 * Command pattern interface for UI actions
 * Each UI action is encapsulated as a command object
 */
export interface ICommand {
    /**
     * Execute the command
     */
    execute(): void;
    
    /**
     * Undo the command (optional)
     */
    undo?(): void;
    
    /**
     * Get a description of what this command does
     */
    getDescription(): string;
    
    /**
     * Check if the command can be executed
     */
    canExecute(): boolean;
}

/**
 * Base command class providing common functionality
 */
export abstract class BaseCommand implements ICommand {
    protected description: string;
    protected canExecuteFlag: boolean = true;
    
    constructor(description: string) {
        this.description = description;
    }
    
    abstract execute(): void;
    
    getDescription(): string {
        return this.description;
    }
    
    canExecute(): boolean {
        return this.canExecuteFlag;
    }
    
    /**
     * Set whether this command can be executed
     */
    protected setCanExecute(canExecute: boolean): void {
        this.canExecuteFlag = canExecute;
    }
}

/**
 * Simple command that executes a function
 */
export class FunctionCommand extends BaseCommand {
    private action: () => void;
    private undoAction?: () => void;
    
    constructor(description: string, action: () => void, undoAction?: () => void) {
        super(description);
        this.action = action;
        this.undoAction = undoAction;
    }
    
    execute(): void {
        if (this.canExecute()) {
            this.action();
        }
    }
    
    undo(): void {
        if (this.undoAction) {
            this.undoAction();
        }
    }
}

/**
 * Button click command for UI buttons
 */
export class ButtonClickCommand extends BaseCommand {
    private action: () => void;
    private buttonId: string;
    
    constructor(buttonId: string, action: () => void) {
        super(`Button click: ${buttonId}`);
        this.buttonId = buttonId;
        this.action = action;
    }
    
    execute(): void {
        if (this.canExecute()) {
            console.log(`Executing button click for: ${this.buttonId}`);
            this.action();
        }
    }
    
    getButtonId(): string {
        return this.buttonId;
    }
}

/**
 * Composite command that executes multiple commands
 */
export class CompositeCommand extends BaseCommand {
    private commands: ICommand[] = [];
    
    constructor(description: string) {
        super(description);
    }
    
    addCommand(command: ICommand): void {
        this.commands.push(command);
    }
    
    execute(): void {
        if (this.canExecute()) {
            this.commands.forEach(command => {
                if (command.canExecute()) {
                    command.execute();
                }
            });
        }
    }
    
    undo(): void {
        // Execute undo in reverse order
        for (let i = this.commands.length - 1; i >= 0; i--) {
            const command = this.commands[i];
            if (command.undo) {
                command.undo();
            }
        }
    }
    
    canExecute(): boolean {
        return this.canExecuteFlag && this.commands.every(cmd => cmd.canExecute());
    }
}
