import { EventEmitter } from '../utils/EventEmitter.js';

export class PlayerStats extends EventEmitter {
  constructor() {
    super();
    this.stats = this.loadStats();
  }

  getStats() {
    return this.stats;
  }

  loadStats() {
    const savedStats = localStorage.getItem('playerStats');
    return savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      highestScore: 0,
      fastestWin: null,
      averageScore: 0,
      totalScore: 0,
      gameHistory: []
    };
  }

  saveStats() {
    localStorage.setItem('playerStats', JSON.stringify(this.stats));
  }

  recordGame(gameResult) {
    const {
      victoryPoints,
      turns,
      isWin,
      gameConfig
    } = gameResult;

    // Update basic stats
    this.stats.gamesPlayed++;
    if (isWin) {
      this.stats.gamesWon++;
    }

    // Update score stats
    this.stats.totalScore += victoryPoints;
    this.stats.averageScore = this.stats.totalScore / this.stats.gamesPlayed;
    this.stats.highestScore = Math.max(this.stats.highestScore, victoryPoints);

    // Update fastest win
    if (isWin && (!this.stats.fastestWin || turns < this.stats.fastestWin.turns)) {
      this.stats.fastestWin = {
        turns,
        score: victoryPoints,
        date: new Date().toISOString()
      };
    }

    // Add to game history
    this.stats.gameHistory.unshift({
      date: new Date().toISOString(),
      victoryPoints,
      turns,
      isWin,
      gameConfig
    });

    // Keep only last 50 games in history
    if (this.stats.gameHistory.length > 50) {
      this.stats.gameHistory.pop();
    }

    // Save to localStorage
    this.saveStats();

    // Emit event for UI updates
    this.emit('statsUpdated', this.stats);
  }

  resetStats() {
    this.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      highestScore: 0,
      fastestWin: null,
      averageScore: 0,
      totalScore: 0,
      gameHistory: []
    };
    this.saveStats();
    this.emit('statsUpdated', this.stats);
  }
} 