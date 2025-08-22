/**
 * Storage utilities for game persistence
 */
export class GameStorage {
  constructor() {
    this.storageKey = 'horses-game-data';
  }

  /**
   * Save game data to localStorage
   * @param {Object} data - Data to save
   */
  save(data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.storageKey, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save game data:', error);
      return false;
    }
  }

  /**
   * Load game data from localStorage
   * @returns {Object|null} - Loaded data or null if not found/error
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) return null;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to load game data:', error);
      return null;
    }
  }

  /**
   * Clear all stored game data
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear game data:', error);
      return false;
    }
  }

  /**
   * Save player statistics
   * @param {Object} stats - Player statistics object
   */
  saveStats(stats) {
    const data = this.load() || {};
    data.stats = stats;
    return this.save(data);
  }

  /**
   * Load player statistics
   * @returns {Object|null} - Player statistics or null if not found
   */
  loadStats() {
    const data = this.load();
    return data?.stats || null;
  }

  /**
   * Save game settings/preferences
   * @param {Object} settings - Game settings object
   */
  saveSettings(settings) {
    const data = this.load() || {};
    data.settings = settings;
    return this.save(data);
  }

  /**
   * Load game settings/preferences
   * @returns {Object|null} - Game settings or null if not found
   */
  loadSettings() {
    const data = this.load();
    return data?.settings || null;
  }

  /**
   * Save current game state
   * @param {Object} gameState - Current game state object
   */
  saveGameState(gameState) {
    const data = this.load() || {};
    data.gameState = gameState;
    return this.save(data);
  }

  /**
   * Load saved game state
   * @returns {Object|null} - Game state or null if not found
   */
  loadGameState() {
    const data = this.load();
    return data?.gameState || null;
  }

  /**
   * Check if there's a saved game
   * @returns {boolean} - True if there's a saved game
   */
  hasSavedGame() {
    const data = this.load();
    return data?.gameState !== undefined && data?.gameState !== null;
  }

  /**
   * Get storage usage information
   * @returns {Object} - Storage usage stats
   */
  getStorageInfo() {
    try {
      const data = this.load();
      if (!data) return { size: 0, hasData: false };
      
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;
      
      return {
        size,
        sizeKB: Math.round(size / 1024 * 100) / 100,
        hasData: true,
        hasStats: !!data.stats,
        hasSettings: !!data.settings,
        hasGameState: !!data.gameState
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { size: 0, hasData: false, error: error.message };
    }
  }
}

/**
 * Export a singleton instance
 */
export const gameStorage = new GameStorage();
