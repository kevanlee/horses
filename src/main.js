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
  console.log('Game Engine Log:', msg); // Add console logging
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

// Debug logging
console.log('Game initialized:', { gameEngine, uiManager });
console.log('Player state:', gameEngine.player);
