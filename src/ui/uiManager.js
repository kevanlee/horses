import { playActionCardEffect } from '../actionCards.js';

export class UIManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.elements = this.cacheElements();
    this.bindEvents();
  }

  // Helper method to animate number updates
  animateNumber(element, animationType = 'flash') {
    if (!element) return;
    
    const numberSpan = element.querySelector('.number');
    if (!numberSpan) return;
    
    // Remove any existing animation classes
    numberSpan.classList.remove('flash', 'pulse');
    
    // Force a reflow to ensure the class removal takes effect
    numberSpan.offsetHeight;
    
    // Add the animation class
    numberSpan.classList.add(animationType);
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      numberSpan.classList.remove(animationType);
    }, animationType === 'flash' ? 600 : 400);
  }

  // Helper method to check if a number has changed and animate if so
  updateNumberWithAnimation(element, newValue, categoryText, animationType = 'flash') {
    const currentNumberSpan = element.querySelector('.number');
    const currentValue = currentNumberSpan ? currentNumberSpan.textContent : null;
    
    // Update the content
    element.innerHTML = `<span class="number">${newValue}</span> <span class="category">${categoryText}</span>`;
    
    // Only animate if the value actually changed
    if (currentValue !== null && currentValue !== newValue.toString()) {
      this.animateNumber(element, animationType);
    }
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
      cardCounter: document.getElementById('card-counter'),
      deckCount: document.getElementById('deck-count'),
      discardCount: document.getElementById('discard-count'),
      deckList: document.getElementById('deck-list'),
      playArea: document.getElementById('played-cards'),
      phaseDisplay: document.getElementById('phase-display'),
      nextPhaseBtn: document.getElementById('next-phase'),
      winConditionDisplay: document.getElementById('win-condition-display'),
      livesDisplay: document.getElementById('lives-display'),
      currentLevel: document.getElementById('current-level'),
      maxLevel: document.getElementById('max-level'),
      levelBoxes: document.getElementById('level-boxes')
    };
  }

  bindEvents() {
    // Note: nextTurnBtn doesn't exist in HTML, so we only have nextPhaseBtn
    this.elements.nextPhaseBtn.addEventListener('click', () => {
      // If we're in buy phase, start the enhanced cleanup sequence
      if (this.game.currentPhase === 'buy') {
        this.startEnhancedCleanupSequence();
      } else {
        this.game.nextPhase();
        this.updateAllDisplays();
        this.checkWinConditions();
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
    this.elements.hand.innerHTML = '';
    
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    this.game.player.hand.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${card.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardEl.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-description">${card.description || ''}</div>
        <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
        <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
        <div class="card-cost">Cost: ${card.cost}</div>
        <div class="card-image">${card.image ? `<img src="../res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
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

    this.game.player.playArea.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = `card played-card ${card.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardEl.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-description">${card.description || ''}</div>
        <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
        <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
        <div class="card-cost">Cost: ${card.cost}</div>
        <div class="card-image">${card.image ? `<img src="../res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
      `;
      this.elements.playArea.appendChild(cardEl);
    });
  }

  renderMarketplace(marketSupply) {
    this.elements.marketplace.innerHTML = '';
    
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
          cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;

          const totalGold = this.game.calculateAvailableGold();

          if (slot.card.cost > totalGold || this.game.player.buys <= 0 || this.game.currentPhase !== 'buy') {
            cardEl.classList.add('disabled');
          } else {
            cardEl.classList.remove('disabled');
          }

          cardEl.innerHTML = `
            <div class="card-name">${slot.card.name}</div>
            <div class="card-type">${slot.card.type}</div>
            <div class="card-description">${slot.card.description || ''}</div>
            <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
            <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
            <div class="card-cost">Cost: ${slot.card.cost}</div>
            <div class="card-image">${slot.card.image ? `<img src="../res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
          `;

          if (!cardEl.classList.contains('disabled')) {
            // Find the actual index in the marketSupply array
            const actualIndex = marketSupply.findIndex(s => s.card.name === slot.card.name);
            cardEl.addEventListener('click', () => this.handleBuyCard(actualIndex, marketSupply));
          }

          // Add count outside the card container
          const countEl = document.createElement('div');
          countEl.className = 'card-count';
          countEl.textContent = `Left: ${slot.count}`;

          // Wrap card and count in a single container
          const cardWrapper = document.createElement('div');
          cardWrapper.className = 'card-wrapper';
          cardWrapper.appendChild(cardEl);
          cardWrapper.appendChild(countEl);

          cardContainer.appendChild(cardWrapper);
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
    // Update deck count with tiny card visual
    this.elements.deckCount.innerHTML = `
      <div class="tiny"></div>
      <div>Deck: ${this.game.player.deck.length} cards</div>
    `;
    
    // Update discard count with tiny card visual
    this.elements.discardCount.innerHTML = `
      <div class="tiny"></div>
      <div>Discard: ${this.game.player.discard.length} cards</div>
    `;
  }

  renderActionsAndBuys() {
    this.updateNumberWithAnimation(this.elements.actionsLeft, this.game.player.actions, 'Actions', 'pulse');
    this.updateNumberWithAnimation(this.elements.buysLeft, this.game.player.buys, 'Buys', 'pulse');
    
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
    this.updateNumberWithAnimation(this.elements.goldDisplay, gold, 'Gold', 'flash');
    
    // Also update marketplace live info if it exists
    const marketplaceGold = document.getElementById('marketplace-gold');
    if (marketplaceGold) {
      marketplaceGold.textContent = gold;
    }
  }

  updateVictoryPoints() {
    this.updateNumberWithAnimation(this.elements.victoryDisplay, this.game.player.victoryPoints, 'Points', 'flash');
  }

  updateTurnCounter() {
    this.updateNumberWithAnimation(this.elements.turnCounter, this.game.turnNumber, 'Turns', 'pulse');
  }

  updateCardCounter() {
    const totalCards = this.game.getTotalCardCount();
    this.updateNumberWithAnimation(this.elements.cardCounter, totalCards, 'Cards', 'pulse');
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
    this.updateCardCounter();
    this.updatePhaseDisplay();
    this.renderActionsAndBuys();
    this.renderDeckAndDiscardCount();
    this.renderHand();
    this.renderPlayArea();
    this.renderDeckInventory();
    this.renderMarketplace(window.currentMarketSupply || []);
    this.updateWinConditionDisplay();
    this.updateLivesDisplay();
    this.updateLevelProgression();
  }

  updateWinConditionDisplay() {
    if (!this.elements.winConditionDisplay) {
      console.log('Win condition display element not found');
      return;
    }
    
    const dungeonMaster = window.dungeonMaster;
    console.log('DungeonMaster:', dungeonMaster);
    console.log('Current dungeon level:', dungeonMaster?.currentDungeonLevel);
    
    if (dungeonMaster && dungeonMaster.currentDungeonLevel) {
      const level = dungeonMaster.currentDungeonLevel;
      const description = level.getWinConditionDescription();
      console.log('Setting win condition:', description);
      
      this.elements.winConditionDisplay.innerHTML = `
        <div class="win-condition">
          <h3>Level ${level.levelNumber} Goal</h3>
          <p>${description}</p>
        </div>
      `;
    } else {
      console.log('No dungeon master or current level found');
      this.elements.winConditionDisplay.innerHTML = `
        <div class="win-condition">
          <h3>Loading...</h3>
          <p>Preparing your challenge...</p>
        </div>
      `;
    }
  }

  updateLivesDisplay() {
    if (!this.elements.livesDisplay) return;
    
    const dungeonMaster = window.dungeonMaster;
    if (dungeonMaster) {
      const hearts = '❤️'.repeat(dungeonMaster.playerLives);
      const emptyHearts = '🤍'.repeat(3 - dungeonMaster.playerLives);
      this.elements.livesDisplay.innerHTML = `
        <div class="lives-display">
          <span class="lives-label">Lives:</span>
          <span class="hearts">${hearts}${emptyHearts}</span>
        </div>
      `;
    }
  }

  updateLevelProgression() {
    if (!window.dungeonMaster) return;
    
    const dungeonMaster = window.dungeonMaster;
    const currentLevel = dungeonMaster.currentLevel;
    const maxLevel = 10; // You can make this configurable later
    
    // Update level text
    if (this.elements.currentLevel) {
      this.elements.currentLevel.textContent = currentLevel;
    }
    if (this.elements.maxLevel) {
      this.elements.maxLevel.textContent = maxLevel;
    }
    
    // Render level boxes
    if (this.elements.levelBoxes) {
      this.elements.levelBoxes.innerHTML = '';
      
      for (let i = 1; i <= maxLevel; i++) {
        const box = document.createElement('div');
        box.className = 'level-box';
        
        if (i < currentLevel) {
          box.classList.add('completed');
        } else if (i === currentLevel) {
          box.classList.add('current');
        } else {
          box.classList.add('locked');
        }
        
        this.elements.levelBoxes.appendChild(box);
      }
    }
  }

  handlePlayActionCard(card) {
    const result = this.game.playActionCard(card);
    
    if (result.success) {
      this.logMessage(result.message);
      
      // Execute the action card effect
      playActionCardEffect(card, this.game.player, this.game);
      
      this.updateAllDisplays();
      this.renderHand();
      
      // Check win conditions after playing action card
      this.checkWinConditions();
      
      // Save progress after playing action card
      if (window.dungeonMaster) {
        window.dungeonMaster.saveProgress();
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
      
      // Check win conditions after buying a card
      this.checkWinConditions();
      
      // Save progress after buying a card
      if (window.dungeonMaster) {
        window.dungeonMaster.saveProgress();
      }
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
    
    // Scroll to top of page for new deal phase
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // After a short delay, trigger deal glow and start new turn
    setTimeout(() => {
      this.triggerDealGlow();
      
      // Start the new turn after deal glow begins
      setTimeout(() => {
        this.game.nextTurn();
        this.updateAllDisplays();
        this.checkWinConditions();
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

  checkWinConditions() {
    const dungeonMaster = window.dungeonMaster;
    if (!dungeonMaster || !dungeonMaster.currentDungeonLevel) {
      console.log('No dungeon master or current level found for win condition check');
      return;
    }

    console.log('Checking win conditions...');
    console.log('Current victory points:', this.game.player.victoryPoints);
    console.log('Current gold:', this.game.calculateAvailableGold());
    console.log('Win condition:', dungeonMaster.currentDungeonLevel.winCondition);
    
    const completed = dungeonMaster.checkLevelCompletion(this.game);
    console.log('Level completed?', completed);
    
    if (completed) {
      this.handleLevelComplete();
    }
  }

  handleLevelComplete() {
    const dungeonMaster = window.dungeonMaster;
    this.logMessage("🎉 LEVEL COMPLETE! 🎉");
    this.logMessage(`You completed Level ${dungeonMaster.currentLevel}!`);
    
    // Save progress
    dungeonMaster.saveProgress();
    
    // Advance to next level after a delay
    setTimeout(() => {
      const nextLevel = dungeonMaster.advanceToNextLevel();
      if (nextLevel) {
        // Reset game state for new level
        this.game.startNewGame();
        
        this.logMessage(`=== Level ${nextLevel.levelNumber} ===`);
        this.logMessage(`Goal: ${nextLevel.getWinConditionDescription()}`);
        this.logMessage(`Lives: ${dungeonMaster.playerLives}`);
        
        // Update market supply and re-render
        window.currentMarketSupply = nextLevel.marketSupply;
        this.updateAllDisplays();
      }
    }, 2000);
  }

  handleLevelFailure() {
    const dungeonMaster = window.dungeonMaster;
    const hasLivesLeft = dungeonMaster.failLevel();
    
    if (hasLivesLeft) {
      this.logMessage(`💔 You failed! Lives remaining: ${dungeonMaster.playerLives}`);
      this.logMessage("Try again with the same level...");
      
      // Restart the current level
      setTimeout(() => {
        dungeonMaster.generateLevel(dungeonMaster.currentLevel);
        window.currentMarketSupply = dungeonMaster.currentDungeonLevel.marketSupply;
        this.game.startNewGame();
        this.updateAllDisplays();
        this.logMessage(`=== Retry Level ${dungeonMaster.currentLevel} ===`);
        this.logMessage(`Goal: ${dungeonMaster.currentDungeonLevel.getWinConditionDescription()}`);
      }, 2000);
    } else {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.logMessage("💀 GAME OVER 💀");
    this.logMessage(`You reached Level ${dungeonMaster.maxLevelReached}`);
    this.logMessage("Better luck next time!");
    
    // Show game over screen after delay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gameOver'));
    }, 3000);
  }

}
