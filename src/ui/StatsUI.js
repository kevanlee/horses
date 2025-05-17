import { ModalManager } from './ModalManager.js';

export class StatsUI {
  constructor(playerStats, modalManager) {
    this.playerStats = playerStats;
    this.modalManager = modalManager;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    const closeButton = document.getElementById('close-stats');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.modalManager.hideModal('stats');
      });
    }

    // Reset button
    const resetButton = document.getElementById('reset-stats');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
          this.playerStats.resetStats();
          this.updateUI();
        }
      });
    }

    // Listen for stats updates
    this.playerStats.on('statsUpdated', () => {
      this.updateUI();
    });
  }

  show() {
    this.updateUI();
    this.modalManager.showModal('stats', {
      title: 'Player Statistics',
      onConfirm: () => this.modalManager.hideModal('stats')
    });
  }

  updateUI() {
    const stats = this.playerStats.getStats();
    
    // Update summary stats
    document.getElementById('games-played').textContent = stats.gamesPlayed;
    document.getElementById('win-rate').textContent = 
      stats.gamesPlayed > 0 ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%';
    document.getElementById('highest-score').textContent = stats.highestScore;
    document.getElementById('average-score').textContent = 
      stats.gamesPlayed > 0 ? Math.round(stats.averageScore) : '0';
    
    // Update fastest win
    const fastestWinEl = document.getElementById('fastest-win');
    if (stats.fastestWin) {
      const date = new Date(stats.fastestWin.date);
      fastestWinEl.textContent = `${stats.fastestWin.turns} turns (${date.toLocaleDateString()})`;
    } else {
      fastestWinEl.textContent = '-';
    }

    // Update game history
    const historyList = document.getElementById('game-history-list');
    historyList.innerHTML = '';

    stats.gameHistory.forEach(game => {
      const item = document.createElement('div');
      item.className = `game-history-item ${game.isWin ? 'win' : 'loss'}`;
      
      const date = new Date(game.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      item.innerHTML = `
        <div class="date">${formattedDate}</div>
        <div class="result">
          ${game.isWin ? 'Victory' : 'Defeat'} - ${game.victoryPoints} VP in ${game.turns} turns
        </div>
      `;
      
      historyList.appendChild(item);
    });
  }
} 