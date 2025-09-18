import { DungeonLevel } from './dungeonLevel.js';
import { ChallengeManager } from './ChallengeManager.js';
import { MarketGenerator } from './marketGenerator.js';

export class DungeonMaster {
  constructor() {
    this.currentLevel = 1;
    this.maxLevelReached = 1;
    this.playerLives = 3;
    this.completedLevels = new Set();
    this.currentDungeonLevel = null;
    this.totalLevelsCompleted = 0;
    this.bestLevelReached = 1;
    this.levelStats = new Map(); // Track stats per level
    this.challengeManager = new ChallengeManager(); // NEW: Challenge system
  }

  // Start a new dungeon run (reset everything)
  startNewDungeon() {
    this.currentLevel = 1;
    this.playerLives = 3;
    this.completedLevels.clear();
    this.generateLevel(1);
  }

  // Generate a specific level using challenge system
  generateLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.maxLevelReached = Math.max(this.maxLevelReached, levelNumber);
    
    // Get a challenge from the challenge manager
    const challenge = this.challengeManager.getChallengeForLevel(levelNumber);
    const marketSupply = MarketGenerator.generate(levelNumber);
    
    this.currentDungeonLevel = new DungeonLevel(
      levelNumber,
      challenge.winCondition,
      marketSupply,
      challenge.name,    // NEW: Pass challenge name
      challenge.id,      // NEW: Pass challenge ID
      challenge.maxTurns // NEW: Pass challenge max turns
    );
    
    return this.currentDungeonLevel;
  }

  // Check if player completed the current level
  checkLevelCompletion(gameEngine) {
    if (!this.currentDungeonLevel) return false;
    
    const completed = this.currentDungeonLevel.checkWinCondition(gameEngine);
    if (completed) {
      this.completeLevel(gameEngine);
      return true;
    }
    return false;
  }

  // Complete the current level and track stats
  completeLevel(gameEngine) {
    const levelNumber = this.currentLevel;
    
    // Track completion
    this.completedLevels.add(levelNumber);
    this.totalLevelsCompleted++;
    this.bestLevelReached = Math.max(this.bestLevelReached, levelNumber);
    
    // Mark challenge as completed in challenge manager
    this.challengeManager.completeCurrentChallenge();
    
    // Track level stats
    const stats = {
      levelNumber: levelNumber,
      challengeName: this.currentDungeonLevel.challengeName, // NEW: Track challenge name
      challengeId: this.currentDungeonLevel.challengeId,     // NEW: Track challenge ID
      turnsUsed: gameEngine.turnNumber,
      finalVictoryPoints: gameEngine.player.victoryPoints,
      finalGold: gameEngine.calculateAvailableGold(),
      totalCards: this.getTotalCardCount(gameEngine),
      completedAt: new Date().toISOString(),
      winCondition: this.currentDungeonLevel.winCondition
    };
    
    this.levelStats.set(levelNumber, stats);
    
    // Save progress
    this.saveProgress();
  }

  // Get total card count for stats
  getTotalCardCount(gameEngine) {
    return gameEngine.player.hand.length + 
           gameEngine.player.deck.length + 
           gameEngine.player.discard.length + 
           gameEngine.player.playArea.length;
  }

  // Handle level failure (lose a life)
  failLevel() {
    this.playerLives--;
    return this.playerLives > 0;
  }

  // Check if game is over (no lives left)
  isGameOver() {
    return this.playerLives <= 0;
  }

  // Get current level info
  getCurrentLevelInfo() {
    return this.currentDungeonLevel ? {
      levelNumber: this.currentDungeonLevel.levelNumber,
      challengeName: this.currentDungeonLevel.challengeName,     // NEW: Include challenge name
      challengeId: this.currentDungeonLevel.challengeId,         // NEW: Include challenge ID
      winCondition: this.currentDungeonLevel.winCondition,
      winConditionDescription: this.currentDungeonLevel.getWinConditionDescription(),
      marketSupply: this.currentDungeonLevel.marketSupply,
      lives: this.playerLives
    } : null;
  }

  // Advance to next level
  advanceToNextLevel() {
    const nextLevel = this.currentLevel + 1;
    return this.generateLevel(nextLevel);
  }

  // Save progress to localStorage
  saveProgress() {
    const saveData = {
      currentLevel: this.currentLevel,
      maxLevelReached: this.maxLevelReached,
      bestLevelReached: this.bestLevelReached,
      playerLives: this.playerLives,
      completedLevels: Array.from(this.completedLevels),
      totalLevelsCompleted: this.totalLevelsCompleted,
      levelStats: Array.from(this.levelStats.entries()),
      currentDungeonLevel: this.currentDungeonLevel ? {
        levelNumber: this.currentDungeonLevel.levelNumber,
        challengeName: this.currentDungeonLevel.challengeName,   // NEW: Save challenge name
        challengeId: this.currentDungeonLevel.challengeId,       // NEW: Save challenge ID
        winCondition: this.currentDungeonLevel.winCondition,
        marketSupply: this.currentDungeonLevel.marketSupply
      } : null,
      timestamp: Date.now()
    };
    localStorage.setItem('dungeonProgress', JSON.stringify(saveData));
    
    // Also save challenge manager state
    this.challengeManager.saveState();
  }

  // Load progress from localStorage
  loadProgress() {
    const saveData = localStorage.getItem('dungeonProgress');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.currentLevel = data.currentLevel || 1;
      this.maxLevelReached = data.maxLevelReached || 1;
      this.bestLevelReached = data.bestLevelReached || 1;
      this.playerLives = data.playerLives || 3;
      this.completedLevels = new Set(data.completedLevels || []);
      this.totalLevelsCompleted = data.totalLevelsCompleted || 0;
      this.levelStats = new Map(data.levelStats || []);
      
      // Load challenge manager state
      this.challengeManager.loadState();
      
      // Restore current dungeon level if it exists
      if (data.currentDungeonLevel) {
        this.currentDungeonLevel = new DungeonLevel(
          data.currentDungeonLevel.levelNumber,
          data.currentDungeonLevel.winCondition,
          data.currentDungeonLevel.marketSupply,
          data.currentDungeonLevel.challengeName || 'Unknown Challenge', // NEW: Restore challenge name
          data.currentDungeonLevel.challengeId || null                   // NEW: Restore challenge ID
        );
      }
      
      return true;
    }
    return false;
  }

  // Get completion statistics
  getCompletionStats() {
    return {
      totalLevelsCompleted: this.totalLevelsCompleted,
      bestLevelReached: this.bestLevelReached,
      currentLevel: this.currentLevel,
      completedLevels: Array.from(this.completedLevels).sort((a, b) => a - b),
      levelStats: Object.fromEntries(this.levelStats)
    };
  }

  // Check if a level has been completed
  isLevelCompleted(levelNumber) {
    return this.completedLevels.has(levelNumber);
  }

  // Get stats for a specific level
  getLevelStats(levelNumber) {
    return this.levelStats.get(levelNumber);
  }
}
