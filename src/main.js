import { GameState } from './core/GameState.js';
import { ModalManager } from './ui/ModalManager.js';
import { CardRegistry } from './cards/CardRegistry.js';
import { GameSetup } from './ui/GameSetup.js';
import { PlayerStats } from './core/PlayerStats.js';
import { StatsUI } from './ui/StatsUI.js';

class Game {
  constructor() {
    this.cardRegistry = new CardRegistry();
    this.gameState = new GameState(this.cardRegistry);
    this.modalManager = new ModalManager();
    this.gameSetup = new GameSetup(this.modalManager, this.cardRegistry);
    
    this.gameState.setModalManager(this.modalManager);
    this.setupEventListeners();
    this.showSetup();

    // Initialize stats system
    this.playerStats = new PlayerStats();
    this.statsUI = new StatsUI(this.playerStats, this.modalManager);
  }

  showSetup() {
    this.gameSetup.show();
    const setupHandler = (config) => {
      this.initializeGame(config);
      this.modalManager.off('gameSetupComplete', setupHandler);
    };
    this.modalManager.on('gameSetupComplete', setupHandler);
  }

  initializeGame(config = {}) {
    // Hide the game UI initially
    document.getElementById('game').classList.add('hidden');
    
    // Initialize game state with config
    this.gameState.initialize(config);
    
    // Show the game UI
    document.getElementById('game').classList.remove('hidden');
    
    // Update UI
    this.updateUI();
  }

  setupEventListeners() {
    // Game state events with error handling
    const safeUpdateUI = () => {
      try {
        this.updateUI();
      } catch (error) {
        console.error('Error updating UI:', error);
        alert('An error occurred while updating the game state. Please refresh the page.');
      }
    };

    this.gameState.on('cardPlayed', ({ player, card }) => {
      this.logMessage(`You played ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardDiscarded', ({ player, card }) => {
      this.logMessage(`You discarded ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardTrashed', ({ player, card }) => {
      this.logMessage(`You trashed ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardGained', ({ player, card }) => {
      this.logMessage(`You gained ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('turnChanged', ({ player, turnNumber }) => {
      this.logMessage(`Your turn ${turnNumber}`);
      safeUpdateUI();
    });

    this.gameState.on('gameEnded', ({ reason, finalScore, isLoss }) => {
      this.logMessage(`Game Over! ${reason}`);
      this.logMessage(`Final Score: ${finalScore} points!`);
      
      // Record game stats
      this.handleGameEnd({ reason, finalScore, isLoss });
    });

    // UI events
    document.getElementById('next-turn').addEventListener('click', () => {
      this.gameState.nextTurn();
      this.gameState.checkGameEnd();
    });

    // New game button
    document.getElementById('new-game').addEventListener('click', () => {
      this.modalManager.showModal('card', {
        title: 'Start New Game?',
        message: 'Are you sure you want to start a new game? Your current progress will be lost.',
        confirmText: 'Continue to New Game',
        onConfirm: () => {
          this.startNewGame();
        },
        onDiscard: () => {
          this.modalManager.hideModal('card');
        },
        discardText: 'Never Mind'
      });
    });

    // Stats button
    document.getElementById('stats-button').addEventListener('click', () => {
      this.showStats();
    });
  }

  showStats() {
    this.statsUI.show();
  }

  updateUI() {
    const player = this.gameState.getCurrentPlayer();
    
    // Update player stats
    document.getElementById('gold-display').textContent = 
      `Gold: ${this.gameState.calculatePlayerGold(player)}`;
    document.getElementById('current-vp').textContent = 
      player.calculateVictoryPoints();
    document.getElementById('target-vp').textContent = 
      this.gameState.victoryPointsToWin || '∞';
    document.getElementById('actions-left').textContent = 
      `Actions: ${player.state.actions}`;
    document.getElementById('buys-left').textContent = 
      `Buys: ${player.state.buys}`;
    document.getElementById('current-turn').textContent = 
      this.gameState.turnNumber;
    document.getElementById('max-turns').textContent = 
      this.gameState.maxTurns || '∞';
    
    // Update hand
    this.updateHand(player);
    
    // Update deck and discard counts
    this.updateDeckCounts(player);
    
    // Update marketplace
    this.updateMarketplace();
    
    // Update deck inventory
    this.updateDeckInventory(player);
  }

  updateHand(player) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    player.state.hand.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `card card-${card.type.toLowerCase()}`;
      if ((card.type === 'Action' || card.type === 'Action-Victory') && player.state.actions === 0) {
        cardEl.classList.add('disabled');
      }
      cardEl.innerHTML = `
        <strong>${card.name}</strong>
        ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
        ${card.type === 'Treasure' ? `<h4>${card.value}*</h4>` : ''}
        ${(card.type === 'Victory' || card.type === 'Action-Victory') ? `<h4>${card.points}pt</h4>` : ''}
        <em>Cost: ${card.cost}</em>
        ${(card.type === 'Action' || card.type === 'Action-Victory') ? `<img src="${card.icon}" class="card-icon" alt="${card.name} icon">` : ''}
      `;
      
      if ((card.type === 'Action' || card.type === 'Action-Victory') && player.state.actions > 0) {
        const playHandler = () => this.playCard(card);
        cardEl.addEventListener('click', playHandler);
        // Store the handler on the element for cleanup
        cardEl._playHandler = playHandler;
      }
      
      handContainer.appendChild(cardEl);
    });
  }

  updateDeckCounts(player) {
    const deckCountEl = document.getElementById('deck-count');
    const discardCountEl = document.getElementById('discard-count');
    
    // Clear existing content
    deckCountEl.innerHTML = '';
    discardCountEl.innerHTML = '';
    
    // Create deck pile
    const deckCard = document.createElement('div');
    deckCard.className = `pile-card ${player.state.deck.length === 0 ? 'empty' : ''}`;
    
    const deckInfo = document.createElement('div');
    deckInfo.className = 'pile-info';
    deckInfo.innerHTML = `
      <div class="pile-name">Deck</div>
      <div class="pile-count">${player.state.deck.length} cards</div>
    `;
    
    deckCountEl.appendChild(deckCard);
    deckCountEl.appendChild(deckInfo);
    
    // Create discard pile
    const discardCard = document.createElement('div');
    discardCard.className = `pile-card ${player.state.discard.length === 0 ? 'empty' : ''}`;
    
    const discardInfo = document.createElement('div');
    discardInfo.className = 'pile-info';
    discardInfo.innerHTML = `
      <div class="pile-name">Discard</div>
      <div class="pile-count">${player.state.discard.length} cards</div>
    `;
    
    discardCountEl.appendChild(discardCard);
    discardCountEl.appendChild(discardInfo);
  }

  updateMarketplace() {
    const marketplace = document.getElementById('marketplace');
    marketplace.innerHTML = '<h2 class="marketplace-title">Store</h2>';
    
    // Group cards by type
    const cardsByType = {
      Treasure: [],
      Victory: [],
      Action: []
    };
    
    this.cardRegistry.getAllCards().forEach(card => {
      const supply = this.gameState.supply.get(card.name);
      if (!supply) return;
      
      if (card.type === 'Treasure') {
        cardsByType.Treasure.push({ card, supply });
      } else if (card.type === 'Victory') {
        cardsByType.Victory.push({ card, supply });
      } else if (card.type === 'Action' || card.type === 'Action-Victory') {
        cardsByType.Action.push({ card, supply });
      }
    });

    // Sort each type's cards by cost
    Object.values(cardsByType).forEach(cards => {
      cards.sort((a, b) => a.card.cost - b.card.cost);
    });

    // Render each section
    Object.entries(cardsByType).forEach(([type, cards]) => {
      if (cards.length > 0) {
        const section = document.createElement('div');
        section.className = 'market-section';
        if (type === 'Action') {
          section.classList.add('action-section');
        }
        section.innerHTML = `<h3>${type} Cards</h3>`;
        
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        cards.forEach(({ card, supply }) => {
          const cardWrapper = document.createElement('div');
          cardWrapper.className = 'card-wrapper';
          
          const cardEl = document.createElement('div');
          cardEl.className = `card card-${card.type.toLowerCase()}`;
          if (!this.gameState.canBuyCard(card)) {
            cardEl.classList.add('disabled');
          }
          cardEl.innerHTML = `
            <strong>${card.name}</strong>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            ${card.type === 'Treasure' ? `<h4>${card.value}*</h4>` : ''}
            ${(card.type === 'Victory' || card.type === 'Action-Victory') ? `<h4>${card.points}pt</h4>` : ''}
            <em>Cost: ${card.cost}</em>
            ${(card.type === 'Action' || card.type === 'Action-Victory') ? `<img src="${card.icon}" class="card-icon" alt="${card.name} icon">` : ''}
          `;

          const availableText = document.createElement('div');
          availableText.className = 'available-text';
          availableText.textContent = `Available: ${supply.count}`;

          if (this.gameState.canBuyCard(card)) {
            const buyHandler = () => this.buyCard(card);
            cardEl.addEventListener('click', buyHandler);
            cardEl._buyHandler = buyHandler;
          }

          cardWrapper.appendChild(cardEl);
          cardWrapper.appendChild(availableText);
          cardContainer.appendChild(cardWrapper);
        });
        
        section.appendChild(cardContainer);
        marketplace.appendChild(section);
      }
    });
  }

  updateDeckInventory(player) {
    const deckListEl = document.getElementById('deck-list');
    deckListEl.innerHTML = '';

    const renderCardCounts = (cards, title) => {
      const cardCounts = {};
      cards.forEach(card => {
        cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;
      });

      const section = document.createElement('div');
      section.innerHTML = `<h3>${title}</h3>`;
      
      Object.entries(cardCounts).forEach(([name, count]) => {
        const item = document.createElement('li');
        item.textContent = `${name}: ${count}`;
        section.appendChild(item);
      });

      const total = document.createElement('li');
      total.textContent = `Total: ${cards.length}`;
      section.appendChild(total);

      deckListEl.appendChild(section);
    };

    renderCardCounts(player.state.deck, 'Deck');
    renderCardCounts(player.state.discard, 'Discard');
    renderCardCounts(player.state.playArea, 'Play Area');
    renderCardCounts(this.gameState.trash, 'Trash');
  }

  logMessage(message) {
    const logEl = document.getElementById('log');
    const entry = document.createElement('div');
    entry.textContent = message;
    logEl.appendChild(entry);
  }

  /**
   * @param {Card} card
   */
  playCard(card) {
    try {
      if (this.gameState.validatePlay(card)) {
        const player = this.gameState.getCurrentPlayer();
        player.playCard(card);  // This moves the card to play area
        card.onPlay(player, this.gameState);  // This applies the effect
        
        // Update UI immediately after card effect
        this.updateUI();
        
        // Check for game end after playing card
        this.gameState.checkGameEnd();
      }
    } catch (error) {
      this.logMessage(`Error: ${error.message}`);
    }
  }

  /**
   * @param {Card} card
   */
  buyCard(card) {
    try {
      if (this.gameState.canBuyCard(card)) {
        const player = this.gameState.getCurrentPlayer();
        const supply = this.gameState.supply.get(card.name);
        
        // Validate cost
        const totalGold = this.gameState.calculatePlayerGold(player);
        if (totalGold < card.cost) {
          throw new Error(`Not enough gold to buy ${card.name}`);
        }
        
        // Move only the treasure cards needed to pay for the card
        let remainingCost = card.cost;
        const treasureCards = player.state.hand.filter(c => c.type === 'Treasure');
        
        // Sort treasure cards by value in descending order to use highest value cards first
        treasureCards.sort((a, b) => b.value - a.value);
        
        for (const treasure of treasureCards) {
          if (remainingCost <= 0) break;
          
          const index = player.state.hand.indexOf(treasure);
          if (index !== -1) {
            player.state.hand.splice(index, 1);
            player.state.playArea.push(treasure);
            remainingCost -= treasure.value;
          }
        }
        
        supply.count--;
        player.state.buys--;
        player.gainCard(card);
        
        this.updateUI();
        
        // Check for game end after buying card
        this.gameState.checkGameEnd();
      }
    } catch (error) {
      this.logMessage(`Error: ${error.message}`);
    }
  }

  cleanup() {
    // Remove all event listeners
    this.gameState.removeAllListeners();
    this.modalManager = null;
    this.gameState = null;
    this.cardRegistry = null;
  }

  handleGameEnd(gameEndData) {
    // Record game stats
    this.playerStats.recordGame({
      victoryPoints: gameEndData.finalScore,
      turns: this.gameState.turnNumber,
      isWin: !gameEndData.isLoss,
      gameConfig: {
        victoryPointsToWin: this.gameState.victoryPointsToWin,
        maxTurns: this.gameState.maxTurns,
        selectedCards: Array.from(this.gameState.supply.keys())
      }
    });

    // Show game end modal
    this.modalManager.showModal('card', {
      title: gameEndData.isLoss ? 'Game Over - You Lost!' : 'Game Over - You Won!',
      message: `${gameEndData.reason}\nFinal Score: ${gameEndData.finalScore} points!`,
      confirmText: 'New Game',
      onConfirm: () => {
        this.modalManager.hideModal('card');
        this.startNewGame();
      }
    });
  }

  startNewGame() {
    // Reset game state
    this.gameState = new GameState(this.cardRegistry);
    this.gameState.setModalManager(this.modalManager);
    
    // Set up event listeners for the new game state
    this.setupEventListeners();
    
    // Hide the game UI
    document.getElementById('game').classList.add('hidden');
    
    // Clear the game log
    document.getElementById('log').innerHTML = '<h2>Game Log</h2>';
    
    // Show the setup modal and wait for configuration
    this.gameSetup.show();
    const setupHandler = (config) => {
      this.initializeGame(config);
      this.modalManager.off('gameSetupComplete', setupHandler);
    };
    this.modalManager.on('gameSetupComplete', setupHandler);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Cleanup on page unload
  window.addEventListener('unload', () => {
    game.cleanup();
  });
});
