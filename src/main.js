import { GameState } from './core/GameState.js';
import { ModalManager } from './ui/ModalManager.js';
import { CardRegistry } from './cards/CardRegistry.js';

class Game {
  constructor() {
    this.gameState = new GameState();
    this.modalManager = new ModalManager();
    this.cardRegistry = new CardRegistry();
    
    this.gameState.setModalManager(this.modalManager);
    this.setupEventListeners();
    this.initializeGame();
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
      this.logMessage(`${player.name} played ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardDiscarded', ({ player, card }) => {
      this.logMessage(`${player.name} discarded ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardTrashed', ({ player, card }) => {
      this.logMessage(`${player.name} trashed ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('cardGained', ({ player, card }) => {
      this.logMessage(`${player.name} gained ${card.name}`);
      safeUpdateUI();
    });

    this.gameState.on('turnChanged', ({ previousPlayer, currentPlayer }) => {
      this.logMessage(`${currentPlayer.name}'s turn`);
      safeUpdateUI();
    });

    this.gameState.on('gameEnded', ({ reason }) => {
      const winner = this.gameState.determineWinner();
      this.logMessage(`Game Over! ${reason}`);
      this.logMessage(`Winner: ${winner.name} with ${winner.calculateVictoryPoints()} points!`);
      alert(`Game Over! ${reason}\nWinner: ${winner.name} with ${winner.calculateVictoryPoints()} points!`);
    });

    // UI events
    document.getElementById('next-turn').addEventListener('click', () => {
      this.gameState.nextTurn();
      this.gameState.checkGameEnd();
    });
  }

  initializeGame() {
    // Add players
    const player1 = this.gameState.addPlayer('Player 1');
    const player2 = this.gameState.addPlayer('Player 2');

    // Initialize supply piles
    const basicCards = [
      { name: 'Copper', count: 60 },
      { name: 'Silver', count: 40 },
      { name: 'Gold', count: 30 },
      { name: 'Estate', count: 24 },
      { name: 'Duchy', count: 12 },
      { name: 'Province', count: 12 }
    ];

    const actionCards = [
      { name: 'Smithy', count: 10 },
      { name: 'Village', count: 10 },
      { name: 'Cellar', count: 10 }
    ];

    // Add all cards to supply
    [...basicCards, ...actionCards].forEach(({ name, count }) => {
      const card = this.cardRegistry.getCard(name);
      this.gameState.addToSupply(card, count);
    });

    // Start first player's turn
    this.gameState.getCurrentPlayer().startTurn();
    this.updateUI();
  }

  updateUI() {
    const currentPlayer = this.gameState.getCurrentPlayer();
    
    // Update player stats
    document.getElementById('current-player').textContent = 
      `Current Player: ${currentPlayer.name}`;
    document.getElementById('gold-display').textContent = 
      `Gold: ${this.gameState.calculatePlayerGold(currentPlayer)}`;
    document.getElementById('victory-display').textContent = 
      `Victory Points: ${currentPlayer.calculateVictoryPoints()}`;
    document.getElementById('actions-left').textContent = 
      `Actions: ${currentPlayer.state.actions}`;
    document.getElementById('buys-left').textContent = 
      `Buys: ${currentPlayer.state.buys}`;
    document.getElementById('turn-counter').textContent = 
      `Turn: ${this.gameState.currentPlayerIndex + 1}`;
    
    // Update hand
    this.updateHand(currentPlayer);
    
    // Update deck and discard counts
    this.updateDeckCounts(currentPlayer);
    
    // Update marketplace
    this.updateMarketplace();
    
    // Update deck inventory
    this.updateDeckInventory(currentPlayer);
  }

  updateHand(player) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    player.state.hand.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <strong>${card.name}</strong><br>
        <em>Type:</em> ${card.type}<br>
        <em>Cost:</em> ${card.cost}<br>
        ${card.description ? `<em>Effect:</em> ${card.description}` : ''}
      `;
      
      if (card.type === 'Action' && player.state.actions > 0) {
        cardEl.addEventListener('click', () => this.playCard(card));
      }
      
      handContainer.appendChild(cardEl);
    });
  }

  updateDeckCounts(player) {
    document.getElementById('deck-count').textContent = 
      `Deck: ${player.state.deck.length}`;
    document.getElementById('discard-count').textContent = 
      `Discard: ${player.state.discard.length}`;
  }

  updateMarketplace() {
    const marketplace = document.getElementById('marketplace');
    marketplace.innerHTML = '<h2>Marketplace</h2>';
    
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
      } else if (card.type === 'Action') {
        cardsByType.Action.push({ card, supply });
      }
    });

    // Render each section
    Object.entries(cardsByType).forEach(([type, cards]) => {
      if (cards.length > 0) {
        const section = document.createElement('div');
        section.className = 'market-section';
        section.innerHTML = `<h3>${type} Cards</h3>`;
        
        cards.forEach(({ card, supply }) => {
          const cardEl = document.createElement('div');
          cardEl.className = 'card';
          cardEl.innerHTML = `
            <strong>${card.name}</strong><br>
            <em>Type:</em> ${card.type}<br>
            <em>Cost:</em> ${card.cost}<br>
            ${card.description ? `<em>Effect:</em> ${card.description}` : ''}<br>
            <em>Available:</em> ${supply.count}
          `;

          if (this.gameState.canBuyCard(card)) {
            cardEl.addEventListener('click', () => this.buyCard(card));
          }

          section.appendChild(cardEl);
        });
        
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
        player.playCard(card);
        card.onPlay(player, this.gameState);
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
        
        supply.count--;
        player.state.buys--;
        player.gainCard(card);
        
        this.updateUI();
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
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Cleanup on page unload
  window.addEventListener('unload', () => {
    game.cleanup();
  });
});
