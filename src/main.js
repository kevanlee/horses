import { GameEngine } from './core/gameEngine.js';
import { UIManager } from './ui/uiManager.js';
import { MARKET_SUPPLY } from './constants.js';
import { playActionCardEffect } from './actionCards.js';

// Initialize game
const gameEngine = new GameEngine();
const uiManager = new UIManager(gameEngine);

// Make market supply globally accessible for action cards (temporary fix)
window.currentMarketSupply = MARKET_SUPPLY;

// Initialize game
gameEngine.startNewGame();

// Initial render
uiManager.renderHand();
uiManager.renderMarketplace(MARKET_SUPPLY);
uiManager.renderDeckInventory();
uiManager.updateAllDisplays();

// Override the log function to use UI manager
gameEngine.logMessage = (msg) => {
  uiManager.logMessage(msg);
  return msg;
};

// Export for action cards to use
window.gameEngine = gameEngine;
window.uiManager = uiManager;
window.renderHand = () => uiManager.renderHand();
window.renderMarketplace = () => uiManager.renderMarketplace(MARKET_SUPPLY);
window.renderDeckInventory = () => uiManager.renderDeckInventory();
window.updateVictoryPoints = () => uiManager.updateVictoryPoints();
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
}

// Initialize menu modal - try multiple approaches
initializeMenuModal();

// Also try after DOM is ready
document.addEventListener('DOMContentLoaded', initializeMenuModal);

// And after window loads
window.addEventListener('load', initializeMenuModal);
