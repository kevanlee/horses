import { GameEngine } from './core/gameEngine.js';
import { UIManager } from './ui/uiManager.js';
import { DungeonMaster } from './dungeon/dungeonMaster.js';
import { StartScreen } from './ui/startScreen.js';
import { GameOverScreen } from './ui/gameOverScreen.js';
import { LevelSelectScreen } from './ui/levelSelectScreen.js';
import { RulesModal } from './ui/rulesModal.js';
import { playActionCardEffect } from './actionCards.js';

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

  if (!menuButton || !menuModal || !closeButton) {
    console.log('Menu modal elements not found, retrying...');
    setTimeout(initializeMenuModal, 100);
    return;
  }

  console.log('Initializing menu modal...');

  // Open modal when menu button is clicked
  menuButton.addEventListener('click', () => {
    console.log('Menu button clicked');
    menuModal.classList.add('active');
  });

  // Close modal when close button is clicked
  closeButton.addEventListener('click', () => {
    console.log('Close button clicked');
    menuModal.classList.remove('active');
  });

  // Close modal when clicking outside the modal content
  menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) {
      console.log('Clicked outside modal');
      menuModal.classList.remove('active');
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuModal.classList.contains('active')) {
      console.log('Escape key pressed');
      menuModal.classList.remove('active');
    }
  });

  // Give up button
  const giveUpBtn = document.getElementById('give-up-btn');
  if (giveUpBtn) {
    giveUpBtn.addEventListener('click', () => {
      menuModal.classList.remove('active');
      uiManager.handleLevelFailure();
    });
  }
}

// Initialize menu modal - try multiple approaches
initializeMenuModal();

// Also try after DOM is ready
document.addEventListener('DOMContentLoaded', initializeMenuModal);

// And after window loads
window.addEventListener('load', initializeMenuModal);

// Game start/resume event handlers
window.addEventListener('startNewGame', () => {
  const levelInfo = dungeonMaster.getCurrentLevelInfo();
  if (levelInfo) {
    // Set the market supply for this level
    window.currentMarketSupply = levelInfo.marketSupply;
    
    // Start the game
    gameEngine.startNewGame();
    
    // Initial render
    uiManager.renderHand();
    uiManager.renderMarketplace(levelInfo.marketSupply);
    uiManager.renderDeckInventory();
    uiManager.updateAllDisplays();
    
    // Show level info
    uiManager.logMessage(`=== Level ${levelInfo.levelNumber} ===`);
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
    uiManager.logMessage(`=== Resumed Level ${levelInfo.levelNumber} ===`);
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
