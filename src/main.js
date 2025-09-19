import { GameEngine } from './core/gameEngine.js';
import { UIManager } from './ui/uiManager.js';
import { DungeonMaster } from './dungeon/dungeonMaster.js';
import { StartScreen } from './ui/startScreen.js';
import { GameOverScreen } from './ui/gameOverScreen.js';
import { LevelSelectScreen } from './ui/levelSelectScreen.js';
import { RulesModal } from './ui/rulesModal.js';
import { playActionCardEffect } from './actionCards.js';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize dungeon system
const dungeonMaster = new DungeonMaster();
const gameEngine = new GameEngine();
const uiManager = new UIManager(gameEngine);
const startScreen = new StartScreen(dungeonMaster);
const gameOverScreen = new GameOverScreen(dungeonMaster);
const levelSelectScreen = new LevelSelectScreen(dungeonMaster);
const rulesModal = new RulesModal();

// Show start screen instead of auto-starting
startScreen.show();

// Override the log function to use UI manager
gameEngine.logMessage = (msg) => {
  uiManager.logMessage(msg);
  return msg;
};

// Export for action cards to use
window.gameEngine = gameEngine;
window.uiManager = uiManager;
window.dungeonMaster = dungeonMaster;
window.renderHand = () => uiManager.renderHand();
window.renderMarketplace = () => uiManager.renderMarketplace(window.currentMarketSupply || []);
window.renderDeckInventory = () => uiManager.renderDeckInventory();
window.updateVictoryPoints = () => uiManager.updateVictoryPoints();
window.updateCardCounter = () => uiManager.updateCardCounter();
window.renderDeckAndDiscardCount = () => uiManager.renderDeckAndDiscardCount();
window.renderActionsAndBuys = () => uiManager.renderActionsAndBuys();
window.updateGoldDisplay = () => uiManager.updateGoldDisplay();
window.shuffleDiscardIntoDeck = () => gameEngine.shuffleDiscardIntoDeck();

// Menu Modal functionality
function initializeMenuModal() {
  const menuButton = document.getElementById('menu-button');
  const menuModal = document.getElementById('menu-modal');
  const closeButton = document.getElementById('close-menu');
  const giveUpBtn = document.getElementById('give-up-btn');

  if (!menuButton || !menuModal || !closeButton) {
    return;
  }

  let escapeHandler = null;

  const closeModal = () => {
    menuModal.classList.remove('active');
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
      escapeHandler = null;
    }
  };

  const openModal = () => {
    menuModal.classList.add('active');
    if (!escapeHandler) {
      escapeHandler = (event) => {
        if (event.key === 'Escape') {
          closeModal();
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  };

  menuButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  menuModal.addEventListener('click', (event) => {
    if (event.target === menuModal) {
      closeModal();
    }
  });

  if (giveUpBtn) {
    giveUpBtn.addEventListener('click', () => {
      closeModal();
      uiManager.handleLevelFailure();
    });
  }
}

document.addEventListener('DOMContentLoaded', initializeMenuModal);

// Game start/resume event handlers
window.addEventListener('startNewGame', () => {
  const levelInfo = dungeonMaster.getCurrentLevelInfo();
  if (levelInfo) {
    // Set the market supply for this level
    window.currentMarketSupply = levelInfo.marketSupply;
    
    // Start the game
    gameEngine.startNewGame();
    
    // Update ponies for current level
    uiManager.updatePoniesForLevel(dungeonMaster.currentLevel);
    
    // Initial render
    uiManager.renderHand();
    uiManager.renderMarketplace(levelInfo.marketSupply);
    uiManager.renderDeckInventory();
    uiManager.updateAllDisplays();
    
    // Show level info
    const levelTitle = levelInfo.challengeName ? 
      `=== Level ${levelInfo.levelNumber}: ${levelInfo.challengeName} ===` :
      `=== Level ${levelInfo.levelNumber} ===`;
    uiManager.logMessage(levelTitle);
    uiManager.logMessage(`Goal: ${dungeonMaster.currentDungeonLevel.getWinConditionDescription()}`);
    uiManager.logMessage(`Lives: ${levelInfo.lives}`);
    
    // Force update win condition display
    uiManager.updateWinConditionDisplay();
    
    // Save progress when starting a new game
    dungeonMaster.saveProgress();
    
    // Show rules modal AFTER everything is set up
    setTimeout(() => {
      console.log('About to show rules modal with levelInfo:', levelInfo);
      rulesModal.show(levelInfo);
    }, 100);
  }
});

window.addEventListener('resumeGame', () => {
  const levelInfo = dungeonMaster.getCurrentLevelInfo();
  if (levelInfo) {
    // Set the market supply for this level
    window.currentMarketSupply = levelInfo.marketSupply;
    
    // Resume the game (don't call startNewGame, just render)
    uiManager.renderHand();
    uiManager.renderMarketplace(levelInfo.marketSupply);
    uiManager.renderDeckInventory();
    uiManager.updateAllDisplays();
    
    // Show level info
    const levelTitle = levelInfo.challengeName ? 
      `=== Resumed Level ${levelInfo.levelNumber}: ${levelInfo.challengeName} ===` :
      `=== Resumed Level ${levelInfo.levelNumber} ===`;
    uiManager.logMessage(levelTitle);
    uiManager.logMessage(`Goal: ${dungeonMaster.currentDungeonLevel.getWinConditionDescription()}`);
    uiManager.logMessage(`Lives: ${levelInfo.lives}`);
    
    // Force update win condition display
    uiManager.updateWinConditionDisplay();
    
    // Save progress when resuming a game
    dungeonMaster.saveProgress();
  }
});

// Game over event handler
window.addEventListener('gameOver', () => {
  gameOverScreen.show();
});

// Show start screen event handler
window.addEventListener('showStartScreen', () => {
  startScreen.show();
});

// Show level select screen event handler
window.addEventListener('showLevelSelect', () => {
  levelSelectScreen.show();
});
