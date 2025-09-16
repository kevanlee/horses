export class GameOverScreen {
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

    // Create game over screen
    this.element = document.createElement('div');
    this.element.id = 'game-over-screen';
    this.element.innerHTML = `
      <div class="game-over-content">
        <h1>💀 Game Over 💀</h1>
        <div class="game-over-stats">
          <p>You reached <strong>Level ${this.dungeonMaster.maxLevelReached}</strong></p>
          <p>Completed <strong>${this.dungeonMaster.totalLevelsCompleted}</strong> levels</p>
          <p>Best level reached: <strong>${this.dungeonMaster.bestLevelReached}</strong></p>
        </div>
        
        <div class="game-over-options">
          <button id="restart-game-btn" class="game-over-button">Try Again</button>
          <button id="level-select-btn" class="game-over-button">Level Select</button>
          <button id="main-menu-btn" class="game-over-button">Main Menu</button>
        </div>
        
        <div class="game-over-message">
          <p>Better luck next time, adventurer!</p>
          <p>Each run teaches you something new.</p>
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

  bindEvents() {
    const restartBtn = document.getElementById('restart-game-btn');
    const levelSelectBtn = document.getElementById('level-select-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.dungeonMaster.startNewDungeon();
        this.hide();
        // Trigger new game
        window.dispatchEvent(new CustomEvent('startNewGame'));
      });
    }

    if (levelSelectBtn) {
      levelSelectBtn.addEventListener('click', () => {
        this.hide();
        // Show level select screen
        window.dispatchEvent(new CustomEvent('showLevelSelect'));
      });
    }

    if (mainMenuBtn) {
      mainMenuBtn.addEventListener('click', () => {
        this.hide();
        // Show start screen
        window.dispatchEvent(new CustomEvent('showStartScreen'));
      });
    }
  }
}
