export class StartScreen {
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

    // Create start screen
    this.element = document.createElement('div');
    this.element.id = 'start-screen';
    this.element.innerHTML = `
      <div class="start-screen-content">
        <h1>Giddy Up!</h1>
        <p>HORSES: Like Dominion but with horses.</p>
        
        <div class="start-options">
          <button id="new-game-btn" class="start-button">Start New Game</button>
          <a href="#" id="resume-game-btn" class="start-link">Resume Adventure</a>
          <a href="#" id="level-select-btn" class="start-link">Level Selection</a>
        </div>
          <div class="sticky-footer">
                <div id="spacer"></div>
                    <img class="horse-logo" src="res/img/horse-head.svg" alt="Horses" id="horses">
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

    // Show the main game
    const gameElement = document.getElementById('game');
    if (gameElement) {
      gameElement.style.display = 'block';
    }
  }

  bindEvents() {
    const newGameBtn = document.getElementById('new-game-btn');
    const resumeGameBtn = document.getElementById('resume-game-btn');
    const levelSelectBtn = document.getElementById('level-select-btn');

    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.dungeonMaster.startNewDungeon();
        this.hide();
        // Trigger game start
        window.dispatchEvent(new CustomEvent('startNewGame'));
      });
    }

    if (resumeGameBtn) {
      resumeGameBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        const hasProgress = this.dungeonMaster.loadProgress();
        if (hasProgress) {
          this.dungeonMaster.generateLevel(this.dungeonMaster.currentLevel);
          this.hide();
          // Trigger game resume
          window.dispatchEvent(new CustomEvent('resumeGame'));
        } else {
          alert('No saved progress found!');
        }
      });
    }

    if (levelSelectBtn) {
      levelSelectBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        this.hide();
        // Trigger level select screen
        window.dispatchEvent(new CustomEvent('showLevelSelect'));
      });
    }
  }
}
