import { logInfo, logDebug, logWarn, logError } from './Logger';
import { GameConfig, PerformanceConfig, AudioConfig, InputConfig, NetworkConfig } from '../config';

/**
 * Game Registry - Manages Multiple Games and Their Configurations
 * This is critical for scalability when building multiple mini-games and RPGs
 * Each game can have its own configuration, assets, and state
 */
export interface IGame {
    id: string;
    name: string;
    version: string;
    type: 'mini-game' | 'rpg' | 'arcade' | 'puzzle' | 'strategy' | 'adventure';
    description: string;
    thumbnail: string;
    config: GameConfig;
    performanceConfig: PerformanceConfig;
    audioConfig: AudioConfig;
    inputConfig: InputConfig;
    networkConfig: NetworkConfig;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Game Registry Manager
 * Provides centralized management for multiple games
 */
export class GameRegistry {
    private games: Map<string, IGame> = new Map();
    private activeGames: Set<string> = new Set();
    private gameConfigs: Map<string, any> = new Map();
    private gameAssets: Map<string, Set<string>> = new Map();
    private gameStates: Map<string, any> = new Map();
    
    constructor() {
        logInfo('GameRegistry', 'Initialized', {
            note: "Ready to manage multiple games and configurations"
        }, 'constructor');
    }
    
    /**
     * Register a new game
     */
    registerGame(game: Omit<IGame, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): string {
        const id = game.id || this.generateGameId(game.name);
        const now = new Date();
        
        const newGame: IGame = {
            ...game,
            id,
            createdAt: now,
            updatedAt: now
        };
        
        this.games.set(id, newGame);
        
        // Initialize game-specific data
        this.gameConfigs.set(id, {});
        this.gameAssets.set(id, new Set());
        this.gameStates.set(id, {});
        
        logInfo('GameRegistry', 'Game registered successfully', {
            gameId: id,
            gameName: game.name,
            gameType: game.type
        }, 'registerGame');
        
        return id;
    }
    
    /**
     * Generate a unique game ID
     */
    private generateGameId(name: string): string {
        const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let id = baseId;
        let counter = 1;
        
        while (this.games.has(id)) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        
        return id;
    }
    
    /**
     * Get a game by ID
     */
    getGame(id: string): IGame | null {
        return this.games.get(id) || null;
    }
    
    /**
     * Get all games
     */
    getAllGames(): IGame[] {
        return Array.from(this.games.values());
    }
    
    /**
     * Get games by type
     */
    getGamesByType(type: IGame['type']): IGame[] {
        return Array.from(this.games.values()).filter(game => game.type === type);
    }
    
    /**
     * Get active games
     */
    getActiveGames(): IGame[] {
        return Array.from(this.games.values()).filter(game => game.isActive);
    }
    
    /**
     * Update a game
     */
    updateGame(id: string, updates: Partial<Omit<IGame, 'id' | 'createdAt'>>): boolean {
        const game = this.games.get(id);
        
        if (!game) {
            logWarn('GameRegistry', 'Game not found for update', {
                gameId: id
            }, 'updateGame');
            return false;
        }
        
        const updatedGame: IGame = {
            ...game,
            ...updates,
            updatedAt: new Date()
        };
        
        this.games.set(id, updatedGame);
        
        logDebug('GameRegistry', 'Game updated successfully', {
            gameId: id,
            updates
        }, 'updateGame');
        
        return true;
    }
    
    /**
     * Activate a game
     */
    activateGame(id: string): boolean {
        const game = this.games.get(id);
        
        if (!game) {
            logWarn('GameRegistry', 'Game not found for activation', {
                gameId: id
            }, 'activateGame');
            return false;
        }
        
        game.isActive = true;
        game.updatedAt = new Date();
        this.activeGames.add(id);
        
        logInfo('GameRegistry', 'Game activated', {
            gameId: id,
            gameName: game.name
        }, 'activateGame');
        
        return true;
    }
    
    /**
     * Deactivate a game
     */
    deactivateGame(id: string): boolean {
        const game = this.games.get(id);
        
        if (!game) {
            logWarn('GameRegistry', 'Game not found for deactivation', {
                gameId: id
            }, 'deactivateGame');
            return false;
        }
        
        game.isActive = false;
        game.updatedAt = new Date();
        this.activeGames.delete(id);
        
        logInfo('GameRegistry', 'Game deactivated', {
            gameId: id,
            gameName: game.name
        }, 'deactivateGame');
        
        return true;
    }
    
    /**
     * Remove a game
     */
    removeGame(id: string): boolean {
        const game = this.games.get(id);
        
        if (!game) {
            logWarn('GameRegistry', 'Game not found for removal', {
                gameId: id
            }, 'removeGame');
            return false;
        }
        
        // Clean up game data
        this.games.delete(id);
        this.activeGames.delete(id);
        this.gameConfigs.delete(id);
        this.gameAssets.delete(id);
        this.gameStates.delete(id);
        
        logInfo('GameRegistry', 'Game removed successfully', {
            gameId: id,
            gameName: game.name
        }, 'removeGame');
        
        return true;
    }
    
    /**
     * Set game configuration
     */
    setGameConfig(gameId: string, config: any): void {
        this.gameConfigs.set(gameId, config);
        
        logDebug('GameRegistry', 'Game configuration set', {
            gameId,
            configKeys: Object.keys(config)
        }, 'setGameConfig');
    }
    
    /**
     * Get game configuration
     */
    getGameConfig(gameId: string): any {
        return this.gameConfigs.get(gameId) || {};
    }
    
    /**
     * Add game asset
     */
    addGameAsset(gameId: string, assetPath: string): void {
        if (!this.gameAssets.has(gameId)) {
            this.gameAssets.set(gameId, new Set());
        }
        
        this.gameAssets.get(gameId)!.add(assetPath);
        
        logDebug('GameRegistry', 'Game asset added', {
            gameId,
            assetPath
        }, 'addGameAsset');
    }
    
    /**
     * Get game assets
     */
    getGameAssets(gameId: string): string[] {
        return Array.from(this.gameAssets.get(gameId) || []);
    }
    
    /**
     * Set game state
     */
    setGameState(gameId: string, state: any): void {
        this.gameStates.set(gameId, state);
        
        logDebug('GameRegistry', 'Game state set', {
            gameId,
            stateKeys: Object.keys(state)
        }, 'setGameState');
    }
    
    /**
     * Get game state
     */
    getGameState(gameId: string): any {
        return this.gameStates.get(gameId) || {};
    }
    
    /**
     * Save all game data
     */
    async saveAllGameData(): Promise<boolean> {
        try {
            const gameData = {
                games: Array.from(this.games.entries()),
                gameConfigs: Array.from(this.gameConfigs.entries()),
                gameStates: Array.from(this.gameStates.entries()),
                timestamp: Date.now()
            };
            
            localStorage.setItem('gameRegistryData', JSON.stringify(gameData));
            
            logInfo('GameRegistry', 'All game data saved successfully', {
                gameCount: this.games.size,
                configCount: this.gameConfigs.size,
                stateCount: this.gameStates.size
            }, 'saveAllGameData');
            
            return true;
        } catch (error) {
            logError('GameRegistry', 'Error saving game data', {
                error
            }, 'saveAllGameData');
            return false;
        }
    }
    
    /**
     * Load all game data
     */
    async loadAllGameData(): Promise<boolean> {
        try {
            const gameData = localStorage.getItem('gameRegistryData');
            
            if (gameData) {
                const parsed = JSON.parse(gameData);
                
                // Restore games
                if (parsed.games) {
                    for (const [id, game] of parsed.games) {
                        this.games.set(id, game);
                        if (game.isActive) {
                            this.activeGames.add(id);
                        }
                    }
                }
                
                // Restore configurations
                if (parsed.gameConfigs) {
                    for (const [id, config] of parsed.gameConfigs) {
                        this.gameConfigs.set(id, config);
                    }
                }
                
                // Restore states
                if (parsed.gameStates) {
                    for (const [id, state] of parsed.gameStates) {
                        this.gameStates.set(id, state);
                    }
                }
                
                logInfo('GameRegistry', 'All game data loaded successfully', {
                    gameCount: this.games.size,
                    configCount: this.gameConfigs.size,
                    stateCount: this.gameStates.size
                }, 'loadAllGameData');
                
                return true;
            }
            
            return false;
        } catch (error) {
            logError('GameRegistry', 'Error loading game data', {
                error
            }, 'loadAllGameData');
            return false;
        }
    }
    
    /**
     * Get registry statistics
     */
    getStats(): {
        totalGames: number;
        activeGames: number;
        gamesByType: Record<string, number>;
        totalConfigs: number;
        totalStates: number;
        totalAssets: number;
    } {
        const gamesByType: Record<string, number> = {};
        
        for (const game of this.games.values()) {
            gamesByType[game.type] = (gamesByType[game.type] || 0) + 1;
        }
        
        let totalAssets = 0;
        for (const assets of this.gameAssets.values()) {
            totalAssets += assets.size;
        }
        
        return {
            totalGames: this.games.size,
            activeGames: this.activeGames.size,
            gamesByType,
            totalConfigs: this.gameConfigs.size,
            totalStates: this.gameStates.size,
            totalAssets
        };
    }
    
    /**
     * Clear all data
     */
    clear(): void {
        logInfo('GameRegistry', 'Clearing all game registry data', {
            gameCount: this.games.size,
            configCount: this.gameConfigs.size,
            stateCount: this.gameStates.size
        }, 'clear');
        
        this.games.clear();
        this.activeGames.clear();
        this.gameConfigs.clear();
        this.gameAssets.clear();
        this.gameStates.clear();
    }
}
