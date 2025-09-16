export class LevelSelectScreen {
  constructor(dungeonMaster) {
    this.dungeonMaster = dungeonMaster;
    this.element = null;
  }

  show() {
    // Hide the main game
    const gameElement = document.getElementById('game');
    if (gameElement) {
      gameElement.style.display = 'none';
    }

    // Create level select screen
    this.element = document.createElement('div');
    this.element.id = 'level-select-screen';
    this.element.innerHTML = `
      <div class="level-select-content">
        <h1>🏰 Level Selection 🏰</h1>
        <div class="completion-stats">
          <p>Best Level Reached: <strong>${this.dungeonMaster.bestLevelReached}</strong></p>
          <p>Total Levels Completed: <strong>${this.dungeonMaster.totalLevelsCompleted}</strong></p>
        </div>
        
        <div class="level-grid" id="level-grid">
          ${this.generateLevelGrid()}
        </div>
        
        <div class="level-select-options">
          <button id="back-to-menu-btn" class="level-select-button">Back to Menu</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.element);
    this.bindEvents();
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  generateLevelGrid() {
    const maxLevels = Math.max(10, this.dungeonMaster.bestLevelReached + 2);
    let gridHTML = '';

    for (let i = 1; i <= maxLevels; i++) {
      const isCompleted = this.dungeonMaster.isLevelCompleted(i);
      const isUnlocked = i <= this.dungeonMaster.bestLevelReached + 1;
      const isCurrent = i === this.dungeonMaster.currentLevel;
      
      let statusClass = 'locked';
      let statusIcon = '🔒';
      let statusText = 'Locked';
      
      if (isCompleted) {
        statusClass = 'completed';
        statusIcon = '✅';
        statusText = 'Completed';
      } else if (isUnlocked) {
        statusClass = 'available';
        statusIcon = '🎯';
        statusText = 'Available';
      }
      
      if (isCurrent) {
        statusClass += ' current';
        statusIcon = '🎮';
        statusText = 'Current';
      }

      const levelStats = this.dungeonMaster.getLevelStats(i);
      const statsText = levelStats ? 
        `Turns: ${levelStats.turnsUsed} | Points: ${levelStats.finalVictoryPoints}` : '';

      gridHTML += `
        <div class="level-card ${statusClass}" data-level="${i}">
          <div class="level-number">Level ${i}</div>
          <div class="level-status">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
          </div>
          ${statsText ? `<div class="level-stats">${statsText}</div>` : ''}
        </div>
      `;
    }

    return gridHTML;
  }

  bindEvents() {
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.hide();
        window.dispatchEvent(new CustomEvent('showStartScreen'));
      });
    }

    // Level card click handlers
    const levelCards = this.element.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', () => {
        const levelNumber = parseInt(card.dataset.level);
        const isUnlocked = levelNumber <= this.dungeonMaster.bestLevelReached + 1;
        
        if (isUnlocked) {
          this.dungeonMaster.generateLevel(levelNumber);
          this.hide();
          window.dispatchEvent(new CustomEvent('startNewGame'));
        }
      });
    });
  }
}
