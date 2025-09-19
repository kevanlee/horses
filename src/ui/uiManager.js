import { playActionCardEffect } from '../actionCards.js';

export class UIManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.elements = this.cacheElements();
    this.marketplaceCache = {
      layoutKey: null,
      cardNodes: new Map(),
      liveInfo: null,
      marketSupply: null
    };
    this.levelResolutionInProgress = false;
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
    element.innerHTML = `
      <span class="category">${categoryText}:</span>
      <span class="number">${newValue}</span>
    `;

    // Only animate if the value actually changed
    if (currentValue !== null && currentValue !== newValue.toString()) {
      this.animateNumber(element, animationType);
    }
  }

  getFreshModalConfirmButton({ text = 'Confirm', hidden = false } = {}) {
    const originalButton = document.getElementById('modal-confirm');
    if (!originalButton) {
      return null;
    }

    const newButton = originalButton.cloneNode(false);
    newButton.textContent = text;
    newButton.className = originalButton.className;
    newButton.classList.toggle('hidden', hidden);
    newButton.disabled = false;

    originalButton.replaceWith(newButton);
    return newButton;
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
        <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
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
        <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
      `;
      this.elements.playArea.appendChild(cardEl);
    });
  }

  renderMarketplace(marketSupply = []) {
    if (!this.elements.marketplace) return;

    const layoutKey = Array.isArray(marketSupply)
      ? marketSupply.map(slot => `${slot.card.name}-${slot.card.cost}`).join('|')
      : '';

    if (this.marketplaceCache.layoutKey !== layoutKey) {
      this.buildMarketplaceLayout(marketSupply, layoutKey);
    } else {
      this.marketplaceCache.marketSupply = marketSupply;
    }

    this.updateMarketplaceAffordability();
  }

  buildMarketplaceLayout(marketSupply, layoutKey) {
    const container = this.elements.marketplace;
    container.innerHTML = '';

    this.marketplaceCache.layoutKey = layoutKey;
    this.marketplaceCache.cardNodes = new Map();
    this.marketplaceCache.marketSupply = marketSupply;

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
    container.appendChild(liveInfo);
    this.marketplaceCache.liveInfo = {
      buys: liveInfo.querySelector('#marketplace-buys'),
      gold: liveInfo.querySelector('#marketplace-gold')
    };

    const topSection = document.createElement('div');
    topSection.id = 'marketplace-top';

    const moneyContainer = document.createElement('div');
    moneyContainer.id = 'money-cards';
    const victoryContainer = document.createElement('div');
    victoryContainer.id = 'victory-cards';

    topSection.appendChild(moneyContainer);
    topSection.appendChild(victoryContainer);
    container.appendChild(topSection);

    const actionContainer = document.createElement('div');
    actionContainer.id = 'action-cards';
    container.appendChild(actionContainer);

    const groupedCards = {
      money: [],
      victory: [],
      action: []
    };

    marketSupply.forEach((slot, index) => {
      if (!slot || !slot.card) return;
      const entry = { slot, index };
      const type = slot.card.type;

      if (type.includes('Action')) {
        groupedCards.action.push(entry);
      } else if (type.includes('Treasure')) {
        groupedCards.money.push(entry);
      } else if (type.includes('Victory')) {
        groupedCards.victory.push(entry);
      }
    });

    groupedCards.action.sort((a, b) => a.slot.card.cost - b.slot.card.cost);

    this.populateMarketplaceSection('Money Cards', groupedCards.money, moneyContainer, marketSupply);
    this.populateMarketplaceSection('Victory Cards', groupedCards.victory, victoryContainer, marketSupply);
    this.populateMarketplaceSection('Action Cards', groupedCards.action, actionContainer, marketSupply);
  }

  populateMarketplaceSection(title, entries, container, marketSupply) {
    container.innerHTML = '';
    if (!entries.length) {
      return;
    }

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);

    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    entries.forEach(({ slot, index }) => {
      const nodes = this.createMarketplaceCard(slot, index, marketSupply);
      this.marketplaceCache.cardNodes.set(index, nodes);
      cardContainer.appendChild(nodes.wrapper);
    });

    container.appendChild(cardContainer);
  }

  createMarketplaceCard(slot, index, marketSupply) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;
    cardEl.dataset.marketIndex = index;

    cardEl.innerHTML = `
      <div class="card-name">${slot.card.name}</div>
      <div class="card-type">${slot.card.type}</div>
      <div class="card-description">${slot.card.description || ''}</div>
      <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
      <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${slot.card.cost}</div>
      <div class="card-image">${slot.card.image ? `<img src="res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
    `;

    cardEl.addEventListener('click', () => {
      const supply = this.marketplaceCache.marketSupply || marketSupply;
      if (!cardEl.classList.contains('disabled') && supply) {
        this.handleBuyCard(index, supply);
      }
    });

    const countEl = document.createElement('div');
    countEl.className = 'card-count';
    countEl.textContent = `Left: ${slot.count}`;

    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper';
    cardWrapper.appendChild(cardEl);
    cardWrapper.appendChild(countEl);

    return { wrapper: cardWrapper, cardEl, countEl };
  }

  updateMarketplaceAffordability() {
    const cache = this.marketplaceCache;
    if (!cache || !cache.marketSupply) {
      return;
    }

    const gold = this.game.calculateAvailableGold();
    const buys = this.game.player.buys;
    const inBuyPhase = this.game.currentPhase === 'buy';

    if (cache.liveInfo) {
      if (cache.liveInfo.gold) {
        cache.liveInfo.gold.textContent = gold;
      }
      if (cache.liveInfo.buys) {
        cache.liveInfo.buys.textContent = buys;
      }
    }

    cache.cardNodes.forEach(({ cardEl, countEl }, index) => {
      const slot = cache.marketSupply[index];
      if (!slot) return;

      const soldOut = slot.count <= 0;
      const canAfford = slot.card.cost <= gold && buys > 0 && inBuyPhase;

      if (countEl) {
        countEl.textContent = `Left: ${slot.count}`;
      }

      cardEl.classList.toggle('disabled', soldOut || !canAfford);
      cardEl.classList.toggle('sold-out', soldOut);
    });
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
    this.updateMarketplaceAffordability();
  }

  renderDeckInventory() {
    this.elements.deckList.innerHTML = '';

    const sections = [
      { title: 'Hand', cards: this.game.player.hand },
      { title: 'Play Area', cards: this.game.player.playArea },
      { title: 'Draw Pile', cards: this.game.player.deck },
      { title: 'Discard', cards: this.game.player.discard },
      { title: 'Trash', cards: this.game.player.trash }
    ];

    const aggregateCounts = new Map();

    const renderCardCounts = (cards, title) => {
      if (!cards.length) {
        return;
      }

      const cardCounts = cards.reduce((acc, card) => {
        acc[card.name] = (acc[card.name] || 0) + 1;
        return acc;
      }, {});

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = title;
      this.elements.deckList.appendChild(sectionTitle);

      Object.entries(cardCounts)
        .sort(([aName], [bName]) => aName.localeCompare(bName))
        .forEach(([cardName, count]) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${cardName}: ${count}`;
          this.elements.deckList.appendChild(listItem);
          aggregateCounts.set(cardName, (aggregateCounts.get(cardName) || 0) + count);
        });

      const totalCountEl = document.createElement('li');
      totalCountEl.textContent = `Total Cards: ${cards.length}`;
      totalCountEl.classList.add('section-total');
      this.elements.deckList.appendChild(totalCountEl);
    };

    sections.forEach(section => renderCardCounts(section.cards, section.title));

    if (aggregateCounts.size) {
      const summaryTitle = document.createElement('h3');
      summaryTitle.textContent = 'Collection Totals';
      this.elements.deckList.appendChild(summaryTitle);

      Array.from(aggregateCounts.entries())
        .sort(([aName], [bName]) => aName.localeCompare(bName))
        .forEach(([cardName, count]) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${cardName}: ${count}`;
          this.elements.deckList.appendChild(listItem);
        });

      const overallTotal = document.createElement('li');
      overallTotal.textContent = `Total Cards Owned: ${this.getTotalCardCount()}`;
      overallTotal.classList.add('section-total');
      this.elements.deckList.appendChild(overallTotal);
    }
  }

  updateGoldDisplay() {
    const gold = this.game.calculateAvailableGold();
    this.updateNumberWithAnimation(this.elements.goldDisplay, gold, 'Gold', 'flash');
    this.updateMarketplaceAffordability();
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
      return;
    }

    const dungeonMaster = window.dungeonMaster;
    if (dungeonMaster && dungeonMaster.currentDungeonLevel) {
      const level = dungeonMaster.currentDungeonLevel;
      const description = level.getWinConditionDescription();
      const progress = this.getWinConditionProgress(level);

      this.elements.winConditionDisplay.innerHTML = `
        <div class="win-condition">
          <h3>Level ${level.levelNumber} Goal</h3>
          <p>${description}</p>
          <ul class="win-progress">
            ${progress.map(item => `
              <li>
                <span class="progress-label">${item.label}</span>
                <span class="progress-value">${item.value}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else {
      this.elements.winConditionDisplay.innerHTML = `
        <div class="win-condition">
          <h3>Loading...</h3>
          <p>Preparing your challenge...</p>
        </div>
      `;
    }
  }

  getWinConditionProgress(level) {
    const progress = [];
    const condition = level.winCondition || {};

    switch (condition.type) {
      case 'victory_points':
        progress.push({
          label: 'Victory Points',
          value: `${this.game.player.victoryPoints} / ${condition.target}`
        });
        break;
      case 'gold_accumulation':
        progress.push({
          label: 'Gold in Hand',
          value: `${this.game.calculateAvailableGold()} / ${condition.target}`
        });
        break;
      case 'card_collection':
        progress.push({
          label: 'Total Cards',
          value: `${this.getTotalCardCount()} / ${condition.target}`
        });
        break;
      case 'turn_limit':
        progress.push({
          label: 'Turns Survived',
          value: `${this.game.turnNumber} / ${condition.maxTurns}`
        });
        break;
      default:
        progress.push({
          label: 'Progress',
          value: `${this.game.turnNumber}`
        });
    }

    if (condition.type !== 'turn_limit' && level.maxTurns) {
      progress.push({
        label: 'Turn',
        value: `${this.game.turnNumber} / ${level.maxTurns}`
      });
    }

    return progress;
  }

  updateLivesDisplay() {
    if (!this.elements.livesDisplay) return;

    const dungeonMaster = window.dungeonMaster;
    if (!dungeonMaster) return;

    const totalLives = Math.max(dungeonMaster.maxLives || 3, 0);
    const currentLives = Math.max(Math.min(dungeonMaster.playerLives, totalLives), 0);
    const hearts = '❤️'.repeat(currentLives);
    const emptyHearts = '🤍'.repeat(Math.max(totalLives - currentLives, 0));
    const displayHearts = `${hearts}${emptyHearts}` || '—';

    this.elements.livesDisplay.innerHTML = `
      <span class="lives-label">Lives:</span>
      <span class="hearts">${displayHearts}</span>
    `;
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
    if (this.levelResolutionInProgress) {
      return;
    }

    const dungeonMaster = window.dungeonMaster;
    if (!dungeonMaster || !dungeonMaster.currentDungeonLevel) {
      return;
    }

    const completed = dungeonMaster.checkLevelCompletion(this.game);

    if (completed) {
      this.levelResolutionInProgress = true;
      this.handleLevelComplete();
    } else {
      // Check if turn limit exceeded (level failure)
      if (this.game.turnNumber > dungeonMaster.currentDungeonLevel.maxTurns) {
        this.levelResolutionInProgress = true;
        this.handleLevelFailure();
      }
    }
  }

  handleLevelComplete() {
    const dungeonMaster = window.dungeonMaster;
    this.logMessage("🎉 LEVEL COMPLETE! 🎉");
    this.logMessage(`You completed Level ${dungeonMaster.currentLevel}!`);
    
    // Save progress
    dungeonMaster.saveProgress();
    
    // Show victory modal
    this.showVictoryModal(dungeonMaster);
  }

  showVictoryModal(dungeonMaster) {
    const modal = document.getElementById('card-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Add victory class to the modal
    modal.classList.add('victory');
    modal.classList.remove('failure');

    const currentLevel = dungeonMaster.currentDungeonLevel;
    const levelStats = {
      levelNumber: dungeonMaster.currentLevel,
      challengeName: currentLevel.challengeName,
      turnsUsed: this.game.turnNumber,
      victoryPoints: this.game.player.victoryPoints,
      finalGold: this.game.calculateAvailableGold(),
      totalCards: this.getTotalCardCount(),
      winCondition: currentLevel.winCondition
    };

    modalTitle.textContent = '🎉 Level Complete! 🎉';
    modalBody.innerHTML = `
      <div class="victory-stats">
        <h3>${levelStats.challengeName || `Level ${levelStats.levelNumber}`}</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <strong>Turns Used:</strong> ${levelStats.turnsUsed} / ${currentLevel.maxTurns}
          </div>
          <div class="stat-item">
            <strong>Victory Points:</strong> ${levelStats.victoryPoints}
          </div>
          <div class="stat-item">
            <strong>Final Gold:</strong> ${levelStats.finalGold}
          </div>
          <div class="stat-item">
            <strong>Total Cards:</strong> ${levelStats.totalCards}
          </div>
          <div class="stat-item">
            <strong>Goal:</strong> ${currentLevel.getWinConditionDescription()}
          </div>
        </div>
        <div class="victory-message">
          <p>🏆 Congratulations! You've completed this challenge!</p>
          <p>Lives remaining: ${dungeonMaster.playerLives}</p>
        </div>
      </div>
    `;

    const confirmButton = this.getFreshModalConfirmButton({ text: 'Continue to Next Level' });

    confirmButton.onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('victory');

      // Add a pony for the completed level (if level 2 or higher)
      if (dungeonMaster.currentLevel >= 2) {
        this.addPonyToFooter();
      }

      this.marketplaceCache.layoutKey = null;
      this.levelResolutionInProgress = false;

      // Advance to next level
      const nextLevel = dungeonMaster.advanceToNextLevel();
      if (nextLevel) {
        // Dispatch startNewGame event to trigger the full initialization flow
        window.dispatchEvent(new CustomEvent('startNewGame'));
      }
    };

    modal.classList.remove('hidden');
  }

  showFailureModal(dungeonMaster, { isGameOver = false } = {}) {
    const modal = document.getElementById('card-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modal.classList.add('failure');
    modal.classList.remove('victory');

    const livesRemaining = Math.max(dungeonMaster.playerLives, 0);
    modalTitle.textContent = isGameOver ? '💀 Game Over 💀' : 'Level Failed';
    modalBody.innerHTML = `
      <div class="failure-message">
        <p>${isGameOver ? 'You are out of lives.' : 'You did not complete the objective in time.'}</p>
        <p>Lives remaining: ${livesRemaining}</p>
      </div>
    `;

    const confirmButton = this.getFreshModalConfirmButton({ text: isGameOver ? 'Return to Camp' : 'Try Again' });

    confirmButton.onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('failure');

      if (isGameOver) {
        this.handleGameOver();
      } else {
        this.restartCurrentLevel();
      }
    };

    modal.classList.remove('hidden');
  }

  getTotalCardCount() {
    return this.game.player.hand.length +
           this.game.player.deck.length +
           this.game.player.discard.length +
           this.game.player.playArea.length;
  }

  restartCurrentLevel() {
    const dungeonMaster = window.dungeonMaster;
    if (!dungeonMaster) return;

    dungeonMaster.generateLevel(dungeonMaster.currentLevel);
    window.currentMarketSupply = dungeonMaster.currentDungeonLevel.marketSupply;

    this.game.startNewGame();
    this.marketplaceCache.layoutKey = null;

    this.updateAllDisplays();

    const levelTitle = dungeonMaster.currentDungeonLevel.challengeName ?
      `=== Retry Level ${dungeonMaster.currentLevel}: ${dungeonMaster.currentDungeonLevel.challengeName} ===` :
      `=== Retry Level ${dungeonMaster.currentLevel} ===`;

    this.logMessage(levelTitle);
    this.logMessage(`Goal: ${dungeonMaster.currentDungeonLevel.getWinConditionDescription()}`);

    dungeonMaster.saveProgress();
    this.levelResolutionInProgress = false;
  }

  handleLevelFailure() {
    const dungeonMaster = window.dungeonMaster;
    if (!dungeonMaster) return;

    this.levelResolutionInProgress = true;

    const hasLivesLeft = dungeonMaster.failLevel();
    this.updateLivesDisplay();

    if (hasLivesLeft) {
      this.logMessage(`💔 You failed! Lives remaining: ${dungeonMaster.playerLives}`);
      this.logMessage('Try again with the same level...');
      this.showFailureModal(dungeonMaster, { isGameOver: false });
    } else {
      this.showFailureModal(dungeonMaster, { isGameOver: true });
    }
  }

  handleGameOver() {
    const dungeonMaster = window.dungeonMaster;
    this.logMessage('💀 GAME OVER 💀');
    if (dungeonMaster) {
      this.logMessage(`You reached Level ${dungeonMaster.maxLevelReached}`);
    }
    this.logMessage('Better luck next time!');

    this.levelResolutionInProgress = false;

    // Show game over screen after delay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('gameOver'));
    }, 3000);
  }

  // Pony level marker system
  addPonyToFooter() {
    const footerContent = document.getElementById('footer-content');
    if (!footerContent) return;

    const pony = document.createElement('img');
    pony.src = 'res/img/pony.png';
    pony.className = 'level-pony';
    pony.alt = 'Level completion pony';
    
    // Set size to 50% of natural size
    pony.style.width = '50px';
    pony.style.height = 'auto';
    
    // Random positioning within footer bounds
    const footerRect = footerContent.getBoundingClientRect();
    const ponyWidth = 50; // Approximate pony width at 50% size
    const ponyHeight = 50; // Approximate pony height at 50% size
    
    const maxX = Math.max(0, footerRect.width - ponyWidth);
    const maxY = Math.max(0, footerRect.height - ponyHeight);
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    pony.style.position = 'absolute';
    pony.style.left = `${randomX}px`;
    pony.style.top = `${randomY}px`;
    pony.style.pointerEvents = 'none'; // Don't interfere with clicks
    pony.style.zIndex = '1'; // Above background, below content
    
    footerContent.appendChild(pony);
  }

  removeAllPonies() {
    const footerContent = document.getElementById('footer-content');
    if (!footerContent) return;
    
    const ponies = footerContent.querySelectorAll('.level-pony');
    ponies.forEach(pony => pony.remove());
  }

  updatePoniesForLevel(currentLevel) {
    // Remove all existing ponies
    this.removeAllPonies();
    
    // Add ponies for levels 2 and above
    // Level 2 = 1 pony, Level 3 = 2 ponies, etc.
    const poniesToAdd = Math.max(0, currentLevel - 1);
    
    for (let i = 0; i < poniesToAdd; i++) {
      this.addPonyToFooter();
    }
  }

}
