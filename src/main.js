// === MAIN GAME CONTROLLER ===

import { GameFactory, GamePhase, GameEndConditions } from './game.js';
import { cardRegistry, defaultSupply } from './cards.js';
import { defaultLevel, gameLevels, getAllLevels } from './levels.js';

// Screen manager class
class ScreenManager {
  constructor() {
    this.currentScreen = 'landing';
    this.initializeScreenNavigation();
  }

  // Initialize screen navigation
  initializeScreenNavigation() {
    // Landing page buttons
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => this.showScreen('level'));
    }

    const quickStartBtn = document.getElementById('quick-start-btn');
    if (quickStartBtn) {
      quickStartBtn.addEventListener('click', () => this.startQuickGame());
    }

    // Level selection page buttons
    const backToLandingFromLevelBtn = document.getElementById('back-to-landing-from-level');
    if (backToLandingFromLevelBtn) {
      backToLandingFromLevelBtn.addEventListener('click', () => this.showScreen('landing'));
    }

    const customGameBtn = document.getElementById('custom-game-btn');
    if (customGameBtn) {
      customGameBtn.addEventListener('click', () => this.showScreen('custom-setup'));
    }

    // Custom setup page buttons
    const backToLevelBtn = document.getElementById('back-to-level');
    if (backToLevelBtn) {
      backToLevelBtn.addEventListener('click', () => this.showScreen('level'));
    }

    const startCustomGameBtn = document.getElementById('start-custom-game-btn');
    if (startCustomGameBtn) {
      startCustomGameBtn.addEventListener('click', () => this.startCustomGame());
    }

    // Game page buttons
    const backToSetupBtn = document.getElementById('back-to-setup');
    if (backToSetupBtn) {
      backToSetupBtn.addEventListener('click', () => this.showScreen('level'));
    }

    // Populate level selection screen
    this.populateLevelSelection();
  }

  // Populate the level selection screen with available levels
  populateLevelSelection() {
    const levelGrid = document.querySelector('.level-grid');
    if (!levelGrid) return;

    const levels = getAllLevels();
    
    levelGrid.innerHTML = '';
    
    levels.forEach(level => {
      const levelCard = document.createElement('div');
      levelCard.className = 'level-card';
      levelCard.innerHTML = `
        <h3>${level.name}</h3>
        <p class="level-description">${level.description}</p>
        <div class="level-details">
          <p><strong>Win Condition:</strong> ${level.getWinConditionDescription()}</p>
          <p><strong>Cards:</strong> ${level.getSupplySize()} in supply</p>
        </div>
        <button class="play-level-btn" data-level="${level.name}">Play This Level</button>
      `;
      
      levelCard.addEventListener('click', (e) => {
        if (e.target.classList.contains('play-level-btn')) {
          this.startLevel(level);
        }
      });
      
      levelGrid.appendChild(levelCard);
    });
  }

  // Start a specific level
  startLevel(level) {
    if (window.gameController) {
      window.gameController.startNewGame(level);
      this.showScreen('game');
    }
  }

  // Show a specific screen
  showScreen(screenName) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    // Show the target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenName;
    }
  }

  // Start a quick game with default level
  startQuickGame() {
    if (window.gameController) {
      window.gameController.startNewGame(defaultLevel);
      this.showScreen('game');
    }
  }

  // Start a custom game with selected settings
  startCustomGame() {
    // Get setup values from the form
    const vpToWin = parseInt(document.getElementById('vp-to-win')?.value) || null;
    const maxTurns = parseInt(document.getElementById('max-turns')?.value) || null;
    const cardsInHand = parseInt(document.getElementById('cards-in-hand')?.value) || null;
    const moneyInHand = parseInt(document.getElementById('money-in-hand')?.value) || null;
    const timeLimit = parseInt(document.getElementById('time-limit')?.value) || null;
    
    // Create custom end conditions based on setup
    const endConditions = new GameEndConditions({
      victoryPointsToWin: vpToWin,
      maxTurns: maxTurns,
      cardsInHandToWin: cardsInHand,
      moneyInHandToWin: moneyInHand,
      timeLimit: timeLimit ? timeLimit * 60 * 1000 : null // Convert minutes to milliseconds
    });
    
    // TODO: Get selected action cards
    const selectedCards = this.getSelectedActionCards();
    
    if (window.gameController) {
      window.gameController.startCustomGame(defaultSupply, endConditions);
      this.showScreen('game');
    }
  }

  // Get selected action cards from setup
  getSelectedActionCards() {
    // TODO: Implement card selection logic
    return [];
  }
}

// Game controller class
class GameController {
  constructor() {
    this.game = null;
    this.ui = null;
    this.isInitialized = false;
  }

  // Initialize the game
  async initialize() {
    try {
      // Create a new game with default level
      this.game = GameFactory.createGame(defaultLevel.supplyCards, defaultLevel.endConditions);
      
      // Initialize UI
      this.ui = new GameUI(this);
      
      // Start the game (this will handle dealing and starting the first turn)
      this.game.startGame();
      
      // Update UI
      this.ui.updateGameState();
      
      this.isInitialized = true;
      console.log('Game initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  // Start a new game with a specific level
  startNewGame(level = defaultLevel) {
    this.game = GameFactory.createGame(level.supplyCards, level.endConditions);
    this.game.startGame();
    this.ui.updateGameState();
  }

  // Start a game with custom settings
  startCustomGame(supplyCards, endConditions) {
    this.game = GameFactory.createGame(supplyCards, endConditions);
    this.game.startGame();
    this.ui.updateGameState();
  }

  // Play a card
  playCard(cardIndex) {
    try {
      if (!this.game || this.game.phase !== GamePhase.ACTION) {
        throw new Error('Cannot play cards outside of action phase');
      }

      const card = this.game.playCard(cardIndex);
      this.ui.updateGameState();
      
      // Handle special card effects that require UI interaction
      if (card.requiresTarget) {
        this.handleCardTargeting(card);
      }
      
      return card;
    } catch (error) {
      console.error('Error playing card:', error);
      this.ui.showError(error.message);
    }
  }

  // Buy a card
  buyCard(cardId) {
    try {
      if (!this.game || this.game.phase !== GamePhase.BUY) {
        throw new Error('Cannot buy cards outside of buy phase');
      }

      const card = this.game.buyCard(cardId);
      this.ui.updateGameState();
      return card;
    } catch (error) {
      console.error('Error buying card:', error);
      this.ui.showError(error.message);
    }
  }

  // Start buy phase
  startBuyPhase() {
    try {
      this.game.startBuyPhase();
      this.ui.updateGameState();
    } catch (error) {
      console.error('Error starting buy phase:', error);
      this.ui.showError(error.message);
    }
  }

  // End turn
  endTurn() {
    try {
      this.game.endTurn();
      this.ui.updateGameState();
    } catch (error) {
      console.error('Error ending turn:', error);
      this.ui.showError(error.message);
    }
  }

  // Handle card targeting for complex cards
  handleCardTargeting(card) {
    switch (card.id) {
      case 'chapel':
        this.ui.showCardSelectionModal('Select cards to trash (up to 4)', 
          this.game.getCurrentPlayer().hand, 
          card.maxTargets,
          (selectedCards) => this.handleChapelEffect(selectedCards)
        );
        break;
      case 'throneRoom':
        this.ui.showCardSelectionModal('Select an action card to play twice',
          this.game.getCurrentPlayer().hand.filter(c => c.type.includes('action')),
          1,
          (selectedCards) => this.handleThroneRoomEffect(selectedCards[0])
        );
        break;
      // Add more complex card handlers here
    }
  }

  // Handle Chapel effect
  handleChapelEffect(selectedCards) {
    const player = this.game.getCurrentPlayer();
    for (const card of selectedCards) {
      const index = player.hand.findIndex(c => c === card);
      if (index !== -1) {
        player.hand.splice(index, 1);
        // In a real implementation, you'd add cards to a trash pile
        console.log(`Trashed ${card.name}`);
      }
    }
    this.ui.updateGameState();
  }

  // Handle Throne Room effect
  handleThroneRoomEffect(selectedCard) {
    if (selectedCard) {
      // Play the selected card twice
      this.game.executeCardEffects(selectedCard, this.game.getCurrentPlayer());
      this.game.executeCardEffects(selectedCard, this.game.getCurrentPlayer());
      this.ui.updateGameState();
    }
  }

  // Get current game state
  getGameState() {
    return this.game ? this.game.getGameState() : null;
  }
}

// Game UI class
class GameUI {
  constructor(controller) {
    this.controller = controller;
    this.initializeEventListeners();
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Next turn button
    const nextTurnBtn = document.getElementById('next-turn');
    if (nextTurnBtn) {
      nextTurnBtn.addEventListener('click', () => {
        if (this.controller.game.phase === GamePhase.ACTION) {
          this.controller.startBuyPhase();
        } else if (this.controller.game.phase === GamePhase.BUY) {
          this.controller.endTurn();
        }
      });
    }

    // New game button
    const newGameBtn = document.getElementById('new-game');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.controller.startNewGame();
      });
    }
  }

  // Update the game state display
  updateGameState() {
    const gameState = this.controller.getGameState();
    if (!gameState) return;

    this.updatePlayerInfo(gameState.currentPlayer);
    this.updateSupply(gameState.supply);
    this.updateGameLog(gameState.gameLog);
    this.updatePhaseInfo(gameState.phase);
    this.updateTurnInfo(gameState.turn);
    
    if (gameState.gameOver) {
      this.showGameOver();
    }
  }

  // Update player information display
  updatePlayerInfo(player) {
    // Update hand display
    const playerHand = document.getElementById('player-hand');
    if (playerHand) {
      playerHand.innerHTML = '';
      player.hand.forEach((card, index) => {
        const cardElement = this.createCardElement(card, index);
        playerHand.appendChild(cardElement);
      });
    }

    // Update deck count
    const deckCount = document.getElementById('deck-count');
    if (deckCount) {
      deckCount.textContent = `Deck: ${player.getDeckSize()}`;
    }

    // Update discard count
    const discardCount = document.getElementById('discard-count');
    if (discardCount) {
      discardCount.textContent = `Discard: ${player.getDiscardSize()}`;
    }

    // Update player stats
    const actionsLeft = document.getElementById('actions-left');
    if (actionsLeft) {
      actionsLeft.textContent = `Actions: ${player.actions}`;
    }

    const buysLeft = document.getElementById('buys-left');
    if (buysLeft) {
      buysLeft.textContent = `Buys: ${player.buys}`;
    }

    const goldDisplay = document.getElementById('gold-display');
    if (goldDisplay) {
      goldDisplay.textContent = `Gold: ${player.money}`;
    }

    // Update victory points
    const currentVP = document.getElementById('current-vp');
    if (currentVP) {
      currentVP.textContent = player.calculateVictoryPoints();
    }
  }

  // Update supply display
  updateSupply(supply) {
    const marketplace = document.getElementById('marketplace');
    if (!marketplace) return;

    marketplace.innerHTML = '<h3 class="marketplace-title">Supply</h3>';

    // Group cards by type
    const treasureCards = [];
    const victoryCards = [];
    const actionCards = [];

    for (const [cardId, pile] of Object.entries(supply)) {
      const card = pile.card;
      const cardElement = this.createSupplyCardElement(card, pile.getRemaining());
      
      if (card.type === 'treasure') {
        treasureCards.push(cardElement);
      } else if (card.type === 'victory' || card.type === 'action-victory') {
        victoryCards.push(cardElement);
      } else if (card.type === 'action') {
        actionCards.push(cardElement);
      }
    }

    // Create sections
    if (treasureCards.length > 0) {
      const treasureSection = this.createMarketSection('Treasure Cards', treasureCards);
      marketplace.appendChild(treasureSection);
    }

    if (victoryCards.length > 0) {
      const victorySection = this.createMarketSection('Victory Cards', victoryCards);
      marketplace.appendChild(victorySection);
    }

    if (actionCards.length > 0) {
      const actionSection = this.createMarketSection('Action Cards', actionCards);
      marketplace.appendChild(actionSection);
    }
  }

  // Create market section
  createMarketSection(title, cards) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    section.appendChild(titleElement);
    
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    cards.forEach(card => cardContainer.appendChild(card));
    section.appendChild(cardContainer);
    
    return section;
  }

  // Create card element for hand
  createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = `card card-${card.type}`;
    cardElement.innerHTML = `
      <strong>${card.name}</strong>
      <div class="card-description">${card.description}</div>
      <em>Cost: ${card.cost}</em>
    `;

    // Add click handler for action cards
    if (card.type.includes('action') && this.controller.game.phase === GamePhase.ACTION) {
      cardElement.addEventListener('click', () => {
        this.controller.playCard(index);
      });
    }

    return cardElement;
  }

  // Create supply card element
  createSupplyCardElement(card, remaining) {
    const cardElement = document.createElement('div');
    cardElement.className = `card card-${card.type}`;
    cardElement.innerHTML = `
      <strong>${card.name}</strong>
      <div class="card-description">${card.description}</div>
      <em>Cost: ${card.cost}</em>
      <div class="card-count">${remaining} left</div>
    `;

    // Add click handler for buying
    if (this.controller.game.phase === GamePhase.BUY) {
      cardElement.addEventListener('click', () => {
        this.controller.buyCard(card.id);
      });
    }

    return cardElement;
  }

  // Update game log
  updateGameLog(gameLog) {
    const logElement = document.getElementById('log');
    if (!logElement) return;

    const logBody = logElement.querySelector('div') || logElement;
    logBody.innerHTML = '';

    // Show last 10 log entries
    const recentLogs = gameLog.slice(-10);
    recentLogs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.textContent = `[Turn ${log.turn}] ${log.message}`;
      logBody.appendChild(logEntry);
    });
  }

  // Update phase information
  updatePhaseInfo(phase) {
    const nextTurnBtn = document.getElementById('next-turn');
    if (nextTurnBtn) {
      if (phase === GamePhase.SETUP) {
        nextTurnBtn.textContent = 'Setup Complete';
        nextTurnBtn.disabled = true;
      } else if (phase === GamePhase.DEALING) {
        nextTurnBtn.textContent = 'Dealing...';
        nextTurnBtn.disabled = true;
      } else if (phase === GamePhase.ACTION) {
        nextTurnBtn.textContent = 'Start Buy Phase';
        nextTurnBtn.disabled = false;
      } else if (phase === GamePhase.BUY) {
        nextTurnBtn.textContent = 'End Turn';
        nextTurnBtn.disabled = false;
      } else {
        nextTurnBtn.textContent = 'Next Turn';
        nextTurnBtn.disabled = false;
      }
    }
  }

  // Update turn information
  updateTurnInfo(turn) {
    const currentTurn = document.getElementById('current-turn');
    if (currentTurn) {
      currentTurn.textContent = turn;
    }
  }

  // Show error message
  showError(message) {
    console.error('Game Error:', message);
    // You could implement a toast notification here
    alert(message);
  }

  // Show card selection modal
  showCardSelectionModal(title, cards, maxSelections, onConfirm) {
    // This would be implemented with a modal system
    console.log('Card selection modal:', title, cards, maxSelections);
    // For now, just call the callback with the first card
    if (cards.length > 0) {
      onConfirm([cards[0]]);
    }
  }

  // Show game over screen
  showGameOver() {
    const gameState = this.controller.getGameState();
    alert(`Game Over! Final score: ${gameState.currentPlayer.victoryPoints} victory points!`);
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize screen manager
  const screenManager = new ScreenManager();
  
  // Initialize game controller
  const gameController = new GameController();
  await gameController.initialize();
  
  // Make the controllers globally available for debugging
  window.gameController = gameController;
  window.screenManager = screenManager;
});

// Export for use in other modules
export { GameController, GameUI };
