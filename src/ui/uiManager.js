import { playActionCardEffect } from '../actionCards.js';

export class UIManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.elements = this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    return {
      hand: document.getElementById('player-hand'),
      marketplace: document.getElementById('marketplace'),
      log: document.getElementById('log'),
      goldDisplay: document.getElementById('gold-display'),
      victoryDisplay: document.getElementById('victory-display'),
      actionsLeft: document.getElementById('actions-left'),
      buysLeft: document.getElementById('buys-left'),
      turnCounter: document.getElementById('turn-counter'),
      deckCount: document.getElementById('deck-count'),
      discardCount: document.getElementById('discard-count'),
      deckList: document.getElementById('deck-list'),
      nextTurnBtn: document.getElementById('next-turn'),
      playArea: document.getElementById('played-cards'),
      phaseDisplay: document.getElementById('phase-display'),
      nextPhaseBtn: document.getElementById('next-phase')
    };
  }

  bindEvents() {
    this.elements.nextTurnBtn.addEventListener('click', () => {
      this.game.nextTurn();
      this.updateAllDisplays();
    });
    
    this.elements.nextPhaseBtn.addEventListener('click', () => {
      // If we're in buy phase, start the enhanced cleanup sequence
      if (this.game.currentPhase === 'buy') {
        this.startEnhancedCleanupSequence();
      } else {
        this.game.nextPhase();
        this.updateAllDisplays();
      }
    });
    

  }

  logMessage(msg) {
    const entry = document.createElement('div');
    entry.textContent = msg;
    // Prepend new messages at the top for better UX
    this.elements.log.insertBefore(entry, this.elements.log.firstChild);
  }

  renderHand() {
    this.elements.hand.innerHTML = '<h2>Your Hand</h2>';
    
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    this.game.player.hand.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <strong>${card.name}</strong><br>
        <em>Type:</em> ${card.type}<br>
        <em>Cost:</em> ${card.cost}<br>
        <em>${card.description || ''}</em>
      `;

      // Add "Play" button only if player has actions left and card is an Action type
      if (this.game.player.actions > 0 && card.type.includes('Action') && this.game.currentPhase === 'action') {
        const playBtn = document.createElement('button');
        playBtn.textContent = 'Play';
        playBtn.addEventListener('click', () => this.handlePlayActionCard(card));
        cardEl.appendChild(document.createElement('br'));
        cardEl.appendChild(playBtn);
      }

      cardContainer.appendChild(cardEl);
    });
    
    this.elements.hand.appendChild(cardContainer);
  }

  renderPlayArea() {
    this.elements.playArea.innerHTML = '';

    if (this.game.player.playArea.length === 0) {
      this.elements.playArea.innerHTML = '<p>No cards played this turn</p>';
      return;
    }

    this.game.player.playArea.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card played-card';
      cardEl.innerHTML = `
        <strong>${card.name}</strong><br>
        <em>Type:</em> ${card.type}<br>
        <em>Cost:</em> ${card.cost}<br>
        <em>${card.description || ''}</em>
      `;
      this.elements.playArea.appendChild(cardEl);
    });
  }

  renderMarketplace(marketSupply) {
    this.elements.marketplace.innerHTML = '<h2>Marketplace</h2>';
    
    // Add live info for buys and gold
    const liveInfo = document.createElement('div');
    liveInfo.className = 'marketplace-live-info';
    liveInfo.innerHTML = `
      <div class="live-info-item">
        <strong>Buys Remaining:</strong> <span id="marketplace-buys">${this.game.player.buys}</span>
      </div>
      <div class="live-info-item">
        <strong>Available Gold:</strong> <span id="marketplace-gold">${this.game.calculateAvailableGold()}</span>
      </div>
    `;
    this.elements.marketplace.appendChild(liveInfo);

    const moneyCards = [];
    const victoryCards = [];
    const actionCards = [];

    // Split cards into groups
    marketSupply.forEach((slot) => {
      const type = slot.card.type;

      if (type.includes('Action')) {
        actionCards.push(slot);
      } else if (type.includes('Treasure')) {
        moneyCards.push(slot);
      } else if (type.includes('Victory')) {
        victoryCards.push(slot);
      }
    });

    // Sort action cards by cost ascending
    actionCards.sort((a, b) => a.card.cost - b.card.cost);

    // Helper to render a section
    const renderSection = (title, cards, container) => {
      if (cards.length > 0) {
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        container.appendChild(sectionTitle);

        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        cards.forEach((slot) => {
          const cardEl = document.createElement('div');
          cardEl.className = 'card';

          const totalGold = this.game.calculateAvailableGold();

          if (slot.card.cost > totalGold || this.game.player.buys <= 0 || this.game.currentPhase !== 'buy') {
            cardEl.classList.add('disabled');
          } else {
            cardEl.classList.remove('disabled');
          }

          cardEl.innerHTML = `
            <strong>${slot.card.name}</strong><br>
            <em>Type:</em> ${slot.card.type}<br>
            <em>Cost:</em> ${slot.card.cost}<br>
            <em>${slot.card.description || ''}</em><br>
            Left: ${slot.count}
          `;

          if (!cardEl.classList.contains('disabled')) {
            // Find the actual index in the marketSupply array
            const actualIndex = marketSupply.findIndex(s => s.card.name === slot.card.name);
            cardEl.addEventListener('click', () => this.handleBuyCard(actualIndex, marketSupply));
          }

          cardContainer.appendChild(cardEl);
        });

        container.appendChild(cardContainer);
      }
    };

    // Render money and victory cards side by side
    if (moneyCards.length > 0 || victoryCards.length > 0) {
      const topSection = document.createElement('div');
      topSection.id = 'marketplace-top';
      
      const moneyContainer = document.createElement('div');
      moneyContainer.id = 'money-cards';
      const victoryContainer = document.createElement('div');
      victoryContainer.id = 'victory-cards';

      renderSection('Money Cards', moneyCards, moneyContainer);
      renderSection('Victory Cards', victoryCards, victoryContainer);

      topSection.appendChild(moneyContainer);
      topSection.appendChild(victoryContainer);
      this.elements.marketplace.appendChild(topSection);
    }

    // Render action cards below
    if (actionCards.length > 0) {
      const actionContainer = document.createElement('div');
      actionContainer.id = 'action-cards';
      renderSection('Action Cards', actionCards, actionContainer);
      this.elements.marketplace.appendChild(actionContainer);
    }
  }

  renderDeckAndDiscardCount() {
    this.elements.deckCount.textContent = `Deck: ${this.game.player.deck.length} cards`;
    this.elements.discardCount.textContent = `Discard Pile: ${this.game.player.discard.length} cards`;
  }

  renderActionsAndBuys() {
    this.elements.actionsLeft.textContent = `Actions: ${this.game.player.actions}`;
    this.elements.buysLeft.textContent = `Buys: ${this.game.player.buys}`;
    
    // Also update marketplace live info if it exists
    const marketplaceBuys = document.getElementById('marketplace-buys');
    if (marketplaceBuys) {
      marketplaceBuys.textContent = this.game.player.buys;
    }
  }

  renderDeckInventory() {
    this.elements.deckList.innerHTML = '';

    const renderCardCounts = (cards, title) => {
      const cardCounts = {};

      cards.forEach(card => {
        if (cardCounts[card.name]) {
          cardCounts[card.name]++;
        } else {
          cardCounts[card.name] = 1;
        }
      });

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = title;
      this.elements.deckList.appendChild(sectionTitle);

      let totalCards = 0;
      for (const cardName in cardCounts) {
        const listItem = document.createElement('li');
        listItem.textContent = `${cardName}: ${cardCounts[cardName]}`;
        this.elements.deckList.appendChild(listItem);
        totalCards += cardCounts[cardName];
      }

      const totalCountEl = document.createElement('li');
      totalCountEl.textContent = `Total Cards: ${totalCards}`;
      this.elements.deckList.appendChild(totalCountEl);
    };

    renderCardCounts(this.game.player.deck, 'Deck (All Cards)');
    renderCardCounts(this.game.player.discard, 'Discard (Most Recent)');
    renderCardCounts(this.game.player.trash, 'Trash');
  }

  updateGoldDisplay() {
    const gold = this.game.calculateAvailableGold();
    this.elements.goldDisplay.textContent = `Gold: ${gold}`;
    
    // Also update marketplace live info if it exists
    const marketplaceGold = document.getElementById('marketplace-gold');
    if (marketplaceGold) {
      marketplaceGold.textContent = gold;
    }
  }

  updateVictoryPoints() {
    this.elements.victoryDisplay.textContent = `Victory Points: ${this.game.player.victoryPoints}`;
  }

  updateTurnCounter() {
    this.elements.turnCounter.textContent = `Turn: ${this.game.turnNumber}`;
  }

  updatePhaseDisplay() {
    // Get all phase items
    const phaseItems = this.elements.phaseDisplay.querySelectorAll('.phase-item');
    
    // Remove all classes first
    phaseItems.forEach(item => {
      item.classList.remove('current', 'completed');
    });
    
    // Set current phase
    if (this.game.currentPhase === 'action') {
      phaseItems[1].classList.add('current'); // Action phase
      phaseItems[0].classList.add('completed'); // New Deal is always completed
    } else if (this.game.currentPhase === 'buy') {
      phaseItems[2].classList.add('current'); // Buy phase
      phaseItems[0].classList.add('completed'); // New Deal is always completed
      phaseItems[1].classList.add('completed'); // Action phase is completed
    } else if (this.game.currentPhase === 'cleanup') {
      phaseItems[3].classList.add('current'); // Clean Up phase
      phaseItems[0].classList.add('completed'); // New Deal is always completed
      phaseItems[1].classList.add('completed'); // Action phase is completed
      phaseItems[2].classList.add('completed'); // Buy phase is completed
    } else if (this.game.currentPhase === 'newdeal') {
      phaseItems[0].classList.add('current'); // New Deal phase
    }
    
    // Update button text
    if (this.game.currentPhase === 'buy') {
      this.elements.nextPhaseBtn.textContent = 'End Turn';
    } else if (this.game.currentPhase === 'cleanup') {
      this.elements.nextPhaseBtn.textContent = 'Cleaning Up...';
      this.elements.nextPhaseBtn.disabled = true;
    } else if (this.game.currentPhase === 'newdeal') {
      this.elements.nextPhaseBtn.textContent = 'Dealing...';
      this.elements.nextPhaseBtn.disabled = true;
    } else {
      this.elements.nextPhaseBtn.textContent = 'Next Phase';
      this.elements.nextPhaseBtn.disabled = false;
    }
  }

  updateAllDisplays() {
    this.updateGoldDisplay();
    this.updateVictoryPoints();
    this.updateTurnCounter();
    this.updatePhaseDisplay();
    this.renderActionsAndBuys();
    this.renderDeckAndDiscardCount();
    this.renderHand();
    this.renderPlayArea();
    this.renderDeckInventory();
    this.renderMarketplace(window.currentMarketSupply || []);
  }

  handlePlayActionCard(card) {
    const result = this.game.playActionCard(card);
    
    if (result.success) {
      this.logMessage(result.message);
      
      // Execute the action card effect
      playActionCardEffect(card, this.game.player, this.game);
      
      this.updateAllDisplays();
      this.renderHand();
      
      // Check if we should auto-advance to Buy Phase
      if (this.game.shouldAutoAdvanceFromActionPhase()) {
        setTimeout(() => {
          this.logMessage("No more actions possible. Auto-advancing to Buy Phase.");
          this.game.currentPhase = 'buy';
          this.updateAllDisplays();
        }, 1000); // Small delay so player can see what happened
      }
    } else {
      this.logMessage(result.message);
    }
  }

  handleBuyCard(cardIndex, marketSupply) {
    if (cardIndex >= 0 && cardIndex < marketSupply.length) {
      // Card index is valid
    } else {
      console.error('Invalid card index:', cardIndex);
    }
    
    const result = this.game.buyCard(cardIndex, marketSupply);
    
    if (result.success) {
      this.logMessage(result.message);
      this.updateAllDisplays();
      this.renderHand();
      this.renderMarketplace(marketSupply);
      this.renderDeckInventory();
    } else {
      this.logMessage(result.message);
    }
  }

  // Method to be called when action card effects need to update the UI
  refreshAfterActionCard() {
    this.updateAllDisplays();
    this.renderHand();
    this.renderMarketplace(window.currentMarketSupply || []);
    this.renderDeckInventory();
  }

  // Enhanced cleanup sequence with New Deal phase display
  startEnhancedCleanupSequence() {
    // Step 1: Set phase to cleanup and update display
    this.game.currentPhase = 'cleanup';
    this.updatePhaseDisplay();
    
    // Step 2: Clear Play Area and Hand (after a brief delay to show phase change)
    setTimeout(() => {
      this.clearPlayAreaAndHand();
      
      // Step 3: Trigger discard glow
      setTimeout(() => {
        this.triggerCleanupGlow();
        
        // Step 4: After glow completes, show New Deal phase briefly
        setTimeout(() => {
          this.showNewDealPhase();
        }, 1000); // Reduced from 1500ms to 1000ms
      }, 150); // Reduced from 300ms to 150ms
    }, 150); // Reduced from 300ms to 150ms
  }

  showNewDealPhase() {
    // Show New Deal phase briefly
    this.game.currentPhase = 'newdeal';
    this.updatePhaseDisplay();
    
    // After a short delay, trigger deal glow and start new turn
    setTimeout(() => {
      this.triggerDealGlow();
      
      // Start the new turn after deal glow begins
      setTimeout(() => {
        this.game.nextTurn();
        this.updateAllDisplays();
      }, 200); // Back to 200ms
    }, 600); // Increased from 300ms to 600ms to make New Deal more visible
  }

  clearPlayAreaAndHand() {
    // First, move all cards from hand and play area to discard pile
    this.game.player.discard.push(...this.game.player.hand);
    this.game.player.discard.push(...this.game.player.playArea);
    
    // Update the discard count immediately
    this.renderDeckAndDiscardCount();
    
    // Then clear the play area
    this.elements.playArea.innerHTML = '';
    
    // Clear the hand but keep the header
    const handHeader = this.elements.hand.querySelector('h2');
    this.elements.hand.innerHTML = '';
    if (handHeader) {
      this.elements.hand.appendChild(handHeader);
    }
    
    // Update the game state to reflect cleared areas
    this.game.player.playArea = [];
    this.game.player.hand = [];
  }

  triggerCleanupGlow() {
    if (this.elements.discardIndicator) {
      this.elements.discardIndicator.classList.add('cleaning');
      setTimeout(() => {
        this.elements.discardIndicator.classList.remove('cleaning');
      }, 1500);
    }
  }

  triggerDealGlow() {
    if (this.elements.deckIndicator) {
      this.elements.deckIndicator.classList.add('dealing');
      setTimeout(() => {
        this.elements.deckIndicator.classList.remove('dealing');
      }, 1500);
    }
  }
}
