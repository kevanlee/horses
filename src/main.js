import { GameState } from './core/GameState.js';
import { ModalManager } from './ui/ModalManager.js';
import { CardRegistry } from './cards/CardRegistry.js';

class Game {
  constructor() {
    this.cardRegistry = new CardRegistry();
    this.gameState = new GameState(this.cardRegistry);
    this.modalManager = new ModalManager();
    
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

    this.gameState.on('gameEnded', ({ reason }) => {
      const winner = this.gameState.determineWinner();
      this.logMessage(`Game Over! ${reason}`);
      this.logMessage(`You won with ${winner.calculateVictoryPoints()} points!`);
      alert(`Game Over! ${reason}\nYou won with ${winner.calculateVictoryPoints()} points!`);
    });

    // UI events
    document.getElementById('next-turn').addEventListener('click', () => {
      this.gameState.nextTurn();
      this.gameState.checkGameEnd();
    });
  }

  initializeGame() {
    // Add single player
    const player = this.gameState.addPlayer('Player');

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
      { name: 'Cellar', count: 10 },
      { name: 'Remodel', count: 10 },
      { name: 'Market', count: 10 },
      { name: 'Festival', count: 10 },
      { name: 'Laboratory', count: 10 },
      { name: 'Woodcutter', count: 10 },
      { name: 'Chapel', count: 10 },
      { name: 'Workshop', count: 10 },
      { name: 'Masquerade', count: 10 },
      { name: 'Vassal', count: 10 },
      { name: 'Council Room', count: 10 },
      { name: 'Mine', count: 10 },
      { name: 'Moneylender', count: 10 },
      { name: 'Feast', count: 10 },
      { name: 'Throne Room', count: 10 }
    ];

    // Add all cards to supply
    [...basicCards, ...actionCards].forEach(({ name, count }) => {
      const card = this.cardRegistry.getCard(name);
      this.gameState.addToSupply(card, count);
    });

    // Start the game
    this.gameState.getCurrentPlayer().startTurn();
    this.updateUI();
  }

  updateUI() {
    const player = this.gameState.getCurrentPlayer();
    
    // Update player stats
    document.getElementById('gold-display').textContent = 
      `Gold: ${this.gameState.calculatePlayerGold(player)}`;
    document.getElementById('victory-display').textContent = 
      `Victory Points: ${player.calculateVictoryPoints()}`;
    document.getElementById('actions-left').textContent = 
      `Actions: ${player.state.actions}`;
    document.getElementById('buys-left').textContent = 
      `Buys: ${player.state.buys}`;
    document.getElementById('turn-counter').textContent = 
      `Turn: ${this.gameState.turnNumber}`;
    
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
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <strong>${card.name}</strong><br>
        <em>Type:</em> ${card.type}<br>
        <em>Cost:</em> ${card.cost}<br>
        ${card.description ? `<em>Effect:</em> ${card.description}` : ''}
        ${card.type === 'Action' && player.state.actions > 0 ? '<button class="play-button">Play</button>' : ''}
      `;
      
      if (card.type === 'Action' && player.state.actions > 0) {
        const playButton = cardEl.querySelector('.play-button');
        const playHandler = () => this.playCard(card);
        playButton.addEventListener('click', playHandler);
        // Store the handler on the element for cleanup
        cardEl._playHandler = playHandler;
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
    marketplace.innerHTML = '<h2 class="marketplace-title">Marketplace</h2>';
    
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
        if (type === 'Action') {
          section.classList.add('action-section');
        }
        section.innerHTML = `<h3>${type} Cards</h3>`;
        
        if (type === 'Action') {
          const cardContainer = document.createElement('div');
          cardContainer.className = 'card-container';
          cards.forEach(({ card, supply }) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            if (!this.gameState.canBuyCard(card)) {
              cardEl.classList.add('disabled');
            }
            cardEl.innerHTML = `
              <strong>${card.name}</strong><br>
              <em>Type:</em> ${card.type}<br>
              <em>Cost:</em> ${card.cost}<br>
              ${card.description ? `<em>Effect:</em> ${card.description}` : ''}<br>
              <em>Available:</em> ${supply.count}
            `;

            if (this.gameState.canBuyCard(card)) {
              const buyHandler = () => this.buyCard(card);
              cardEl.addEventListener('click', buyHandler);
              cardEl._buyHandler = buyHandler;
            }

            cardContainer.appendChild(cardEl);
          });
          section.appendChild(cardContainer);
        } else {
          cards.forEach(({ card, supply }) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            if (!this.gameState.canBuyCard(card)) {
              cardEl.classList.add('disabled');
            }
            cardEl.innerHTML = `
              <strong>${card.name}</strong><br>
              <em>Type:</em> ${card.type}<br>
              <em>Cost:</em> ${card.cost}<br>
              ${card.description ? `<em>Effect:</em> ${card.description}` : ''}<br>
              <em>Available:</em> ${supply.count}
            `;

            if (this.gameState.canBuyCard(card)) {
              const buyHandler = () => this.buyCard(card);
              cardEl.addEventListener('click', buyHandler);
              cardEl._buyHandler = buyHandler;
            }

            section.appendChild(cardEl);
          });
        }
        
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
