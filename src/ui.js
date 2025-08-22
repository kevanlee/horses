import { EventEmitter } from './utils/EventEmitter.js';
import { CardRegistry } from './cards/CardRegistry.js';

/**
 * Manages modal dialogs for card interactions
 */
export class ModalManager extends EventEmitter {
  constructor() {
    super();
    this.modals = new Map();
    this.initializeModals();
  }

  initializeModals() {
    // Initialize card modal
    const cardModal = document.getElementById('card-modal');
    if (cardModal) {
      this.modals.set('card', {
        element: cardModal,
        title: cardModal.querySelector('#modal-title'),
        body: cardModal.querySelector('#modal-body'),
        confirm: cardModal.querySelector('#modal-confirm')
      });
    }

    // Initialize library modal
    const libraryModal = document.getElementById('library-modal');
    if (libraryModal) {
      this.modals.set('library', {
        element: libraryModal,
        title: libraryModal.querySelector('h2'),
        body: libraryModal.querySelector('#library-modal-text'),
        confirm: libraryModal.querySelector('#library-confirm')
      });
    }

    // Initialize setup modal
    const setupModal = document.getElementById('setup-modal');
    if (setupModal) {
      this.modals.set('setup', {
        element: setupModal,
        title: setupModal.querySelector('h2'),
        body: setupModal.querySelector('#setup-body'),
        confirm: setupModal.querySelector('#setup-confirm')
      });
    }

    // Initialize stats modal
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) {
      this.modals.set('stats', {
        element: statsModal,
        title: statsModal.querySelector('h2'),
        body: statsModal.querySelector('#stats-content'),
        confirm: statsModal.querySelector('#close-stats')
      });
    }
  }

  /**
   * @param {string} type
   * @param {Object} options
   * @param {string} options.title
   * @param {string} [options.message]
   * @param {Card[]} [options.cards]
   * @param {Function} options.onConfirm
   * @param {string} [options.confirmText='Confirm']
   * @param {Function} [options.onDiscard]
   * @param {string} [options.discardText='Discard']
   * @param {Object} [options.faceDownCard]
   * @param {Function} [options.onReveal]
   */
  showModal(type, options = {}) {
    const modal = this.modals.get(type);
    if (!modal) {
      console.error(`Modal type ${type} not found. Available types: ${Array.from(this.modals.keys()).join(', ')}`);
      throw new Error(`Modal type ${type} not found`);
    }

    if (!options || typeof options !== 'object') {
      throw new Error('Modal options must be an object');
    }

    if (!options.title) {
      throw new Error('Modal title is required');
    }

    if (!options.onConfirm || typeof options.onConfirm !== 'function') {
      throw new Error('Modal onConfirm callback is required and must be a function');
    }

    modal.title.textContent = options.title;
    
    // Special handling for stats modal
    if (type === 'stats') {
      modal.element.classList.remove('hidden');
      return;
    }
    
    // Only clear and update body if it exists and it's not the stats modal
    if (modal.body) {
      modal.body.innerHTML = '';

      if (options.message) {
        const messageEl = document.createElement('p');
        messageEl.textContent = options.message;
        modal.body.appendChild(messageEl);
      }

      if (options.faceDownCard) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-back';
        cardEl.textContent = 'Click to reveal';
        cardEl.onclick = () => {
          cardEl.classList.remove('card-back');
          cardEl.innerHTML = `
            <strong>${options.faceDownCard.name}</strong><br>
            <em>Type:</em> ${options.faceDownCard.type}<br>
            <em>Cost:</em> ${options.faceDownCard.cost}<br>
            ${options.faceDownCard.description ? `<em>Effect:</em> ${options.faceDownCard.description}` : ''}
          `;
          cardEl.onclick = null;
          if (options.onReveal) {
            options.onReveal(options.faceDownCard);
          }
        };
        modal.body.appendChild(cardEl);
      }

      if (options.cards) {
        if (!Array.isArray(options.cards)) {
          throw new Error('Modal cards must be an array');
        }
        
        // Create card container
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        modal.body.appendChild(cardContainer);

        options.cards.forEach((card, index) => {
          const cardEl = document.createElement('div');
          cardEl.className = `card card-${card.type.toLowerCase()}`;
          cardEl.innerHTML = `
            <strong>${card.name}</strong>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            ${card.type === 'Treasure' ? `<h4>${card.value}*</h4>` : ''}
            ${card.type === 'Victory' ? `<h4>${card.points}pt</h4>` : ''}
            <em>Cost: ${card.cost}</em>
            ${card.type === 'Action' ? `<img src="${card.icon}" class="card-icon" alt="${card.name} icon">` : ''}
          `;
          cardEl.dataset.index = index;
          
          // Add click handler for selection
          cardEl.addEventListener('click', () => {
            if (options.onCardClick) {
              // Use custom click handler if provided
              options.onCardClick(cardEl, Array.from(cardContainer.querySelectorAll('.card')));
            } else {
              // Default toggle behavior
              cardEl.classList.toggle('selected');
            }
          });
          
          cardContainer.appendChild(cardEl);
        });
      }
    }

    modal.confirm.textContent = options.confirmText || 'Confirm';
    const confirmHandler = () => {
      const selectedCards = Array.from(modal.body.querySelectorAll('.card.selected'))
        .map(el => options.cards[parseInt(el.dataset.index)]);
      
      this.hideModal(type);
      // Use setTimeout to ensure modal is hidden before processing
      setTimeout(() => {
        options.onConfirm(selectedCards);
      }, 0);
    };
    modal.confirm.onclick = confirmHandler;

    if (options.onDiscard) {
      // Create discard button if it doesn't exist
      if (!modal.discard) {
        const discardButton = document.createElement('button');
        discardButton.id = 'modal-discard';
        discardButton.className = 'modal-button';
        modal.element.querySelector('.modal-content').appendChild(discardButton);
        modal.discard = discardButton;
      }
      modal.discard.textContent = options.discardText || 'Discard';
      modal.discard.onclick = () => {
        options.onDiscard();
        this.hideModal(type);
      };
      modal.discard.classList.remove('hidden');
    } else if (modal.discard) {
      modal.discard.classList.add('hidden');
    }

    modal.element.classList.remove('hidden');
  }

  /**
   * @param {string} type
   */
  hideModal(type) {
    const modal = this.modals.get(type);
    if (!modal) throw new Error(`Modal type ${type} not found`);
    modal.element.classList.add('hidden');
  }

  /**
   * @param {string} type
   * @param {string} message
   */
  updateModalMessage(type, message) {
    const modal = this.modals.get(type);
    if (!modal) throw new Error(`Modal type ${type} not found`);
    if (modal.text) {
      modal.text.textContent = message;
    }
  }
}

export class GameSetup {
  constructor(modalManager, cardRegistry) {
    this.modalManager = modalManager;
    this.cardRegistry = cardRegistry;
    this.selectedCards = new Set();
    this.currentPreset = null;
    this.isCustomSettings = true;
    
    // Define preset configurations
    this.presets = {
      quickGame: {
        name: "Quick Game",
        victoryPointsToWin: 20,
        maxTurns: 30,
        selectedCards: [
          'Smithy',      // Simple draw
          'Village',     // Simple action
          'Market',      // Simple economy
          'Festival',    // Simple action + buy
          'Cellar',      // Simple discard
          'Chapel',      // Simple trashing
          'Workshop',    // Simple gaining
          'Woodcutter',  // Simple economy
          'Council Room', // Draw + buy
          'Moneylender'  // Simple treasure upgrade
        ]
      },
      standardGame: {
        name: "Standard Game",
        victoryPointsToWin: 30,
        maxTurns: 50,
        selectedCards: [
          'Smithy',      // Draw
          'Village',     // Action
          'Market',      // Economy
          'Festival',    // Action + buy
          'Cellar',      // Discard
          'Library',     // Complex draw
          'Laboratory',  // Draw + action
          'Chapel',      // Trashing
          'Workshop',    // Gaining
          'Woodcutter'   // Economy
        ]
      },
      longGame: {
        name: "Long Game",
        victoryPointsToWin: 40,
        maxTurns: 100,
        selectedCards: [
          'Smithy',      // Draw
          'Village',     // Action
          'Market',      // Economy
          'Festival',    // Action + buy
          'Cellar',      // Discard
          'Library',     // Complex draw
          'Laboratory',  // Draw + action
          'Chapel',      // Trashing
          'Throne Room', // Complex action
          'Remodel'      // Complex gaining
        ]
      }
    };
    this.setupEventListeners();
  }

  show() {
    const setupModal = this.modalManager.modals.get('setup');
    if (!setupModal) return;

    // Reset selected cards and current preset
    this.selectedCards.clear();
    this.currentPreset = null;
    
    // Add preset buttons
    this.addPresetButtons();
    
    // Populate card options
    this.populateCardOptions();
    
    // Update the UI
    this.updateSelectedCardsList();
    this.updateConfirmButton();
    
    // Show the modal
    setupModal.element.classList.remove('hidden');
  }

  setupEventListeners() {
    const setupModal = this.modalManager.modals.get('setup');
    if (!setupModal) return;

    const setupConfirm = setupModal.confirm;
    const setupBody = setupModal.body;

    // Handle card selection
    setupBody.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const cardOption = e.target.closest('.card-option');
        const cardName = cardOption.dataset.cardName;
        
        if (e.target.checked) {
          if (this.selectedCards.size < 10) {
            this.selectedCards.add(cardName);
            cardOption.classList.add('selected');
          } else {
            e.target.checked = false;
            return;
          }
        } else {
          this.selectedCards.delete(cardName);
          cardOption.classList.remove('selected');
        }

        this.updateSelectedCardsList();
        this.updateConfirmButton();
        this.checkIfSettingsMatchPreset();
      }
    });

    // Handle VP and turns input changes
    const vpInput = document.getElementById('vp-to-win');
    const turnsInput = document.getElementById('max-turns-input');
    
    if (vpInput) {
      vpInput.addEventListener('change', () => this.checkIfSettingsMatchPreset());
    }
    if (turnsInput) {
      turnsInput.addEventListener('change', () => this.checkIfSettingsMatchPreset());
    }

    // Handle confirm button
    setupConfirm.addEventListener('click', () => {
      const config = this.getGameConfig();
      this.modalManager.hideModal('setup');
      this.modalManager.emit('gameSetupComplete', config);
    });

    // Handle default game option
    const defaultGameLink = document.getElementById('default-game-link');
    if (defaultGameLink) {
      defaultGameLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.isCustomSettings = true;
        this.currentPreset = null;
        this.updateGameMode();
        const config = this.getDefaultGameConfig();
        this.modalManager.hideModal('setup');
        this.modalManager.emit('gameSetupComplete', config);
      });
    }
  }

  populateCardOptions() {
    const actionCards = this.cardRegistry.getAllCards()
      .filter(card => card.type === 'Action' || card.type === 'Action-Victory')
      .sort((a, b) => a.name.localeCompare(b.name));

    const cardList = document.querySelector('.card-list');
    if (cardList) {
      cardList.innerHTML = actionCards.map(card => `
        <div class="card-option" data-card-name="${card.name}">
          <input type="checkbox" id="card-${card.name}">
          <label for="card-${card.name}">
            <strong>${card.name}</strong>
            <span>(${card.cost})</span>
          </label>
        </div>
      `).join('');
    }
  }

  updateSelectedCardsList() {
    const selectedList = document.getElementById('selected-cards-list');
    const selectedCount = document.getElementById('selected-count');
    
    if (selectedList && selectedCount) {
      selectedCount.textContent = this.selectedCards.size;
      selectedList.innerHTML = Array.from(this.selectedCards).map(cardName => `
        <div class="card-option selected">
          <strong>${cardName}</strong>
        </div>
      `).join('');
    }
  }

  updateConfirmButton() {
    const setupConfirm = document.getElementById('setup-confirm');
    if (setupConfirm) {
      setupConfirm.disabled = this.selectedCards.size !== 10;
    }
  }

  getGameConfig() {
    const config = {
      victoryPointsToWin: parseInt(document.getElementById('vp-to-win')?.value) || 30,
      maxTurns: parseInt(document.getElementById('max-turns-input')?.value) || 100,
      selectedCards: Array.from(this.selectedCards)
    };

    // Log the configuration
    const logEl = document.getElementById('log');
    if (logEl) {
      const entry = document.createElement('div');
      entry.innerHTML = `
        <strong>Game Configuration:</strong><br>
        Victory Points to Win: ${config.victoryPointsToWin}<br>
        Maximum Turns: ${config.maxTurns}<br>
        Selected Cards: ${config.selectedCards.join(', ')}
      `;
      logEl.appendChild(entry);
    }

    return config;
  }

  getDefaultGameConfig() {
    const allActionCards = this.cardRegistry.getAllCards()
      .filter(card => card.type === 'Action' || card.type === 'Action-Victory')
      .map(card => card.name);

    const config = {
      victoryPointsToWin: null,
      maxTurns: null,
      selectedCards: allActionCards
    };

    // Log the configuration
    const logEl = document.getElementById('log');
    if (logEl) {
      const entry = document.createElement('div');
      entry.innerHTML = `
        <strong>Default Game Configuration:</strong><br>
        Victory Points: No limit<br>
        Maximum Turns: No limit<br>
        All Action Cards Available
      `;
      logEl.appendChild(entry);
    }

    return config;
  }

  addPresetButtons() {
    const setupBody = document.getElementById('setup-body');
    if (!setupBody) return;

    // Create preset section if it doesn't exist
    let presetSection = document.querySelector('.preset-section');
    if (!presetSection) {
      presetSection = document.createElement('div');
      presetSection.className = 'setup-section preset-section';
      setupBody.insertBefore(presetSection, setupBody.firstChild);
    }

    // Clear and update preset section content
    presetSection.innerHTML = '<h3>Preset Games</h3><div class="preset-buttons"></div>';
    const buttonsContainer = presetSection.querySelector('.preset-buttons');

    // Add the original three presets
    Object.entries(this.presets).forEach(([key, preset]) => {
      const button = document.createElement('button');
      button.className = 'preset-button';
      button.dataset.preset = key;
      button.textContent = preset.name;
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        buttonsContainer.querySelectorAll('.preset-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Clear previous selection and apply new preset
        this.selectedCards.clear();
        this.currentPreset = key;
        this.isCustomSettings = false;
        
        // Update VP and Turns input fields
        const vpInput = document.getElementById('vp-to-win');
        const turnsInput = document.getElementById('max-turns-input');
        
        if (vpInput) {
          vpInput.value = preset.victoryPointsToWin;
          console.log(`Setting VP to ${preset.victoryPointsToWin}`);
        }
        
        if (turnsInput) {
          turnsInput.value = preset.maxTurns;
          console.log(`Setting max turns to ${preset.maxTurns}`);
          
          // Force the input to update by dispatching an input event
          turnsInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Update checkboxes and card options
        const cardOptions = document.querySelectorAll('.card-option');
        cardOptions.forEach(option => {
          const checkbox = option.querySelector('input[type="checkbox"]');
          const cardName = option.dataset.cardName;
          const isSelected = preset.selectedCards.includes(cardName);
          
          if (checkbox) {
            checkbox.checked = isSelected;
          }
          
          if (isSelected) {
            option.classList.add('selected');
            this.selectedCards.add(cardName);
          } else {
            option.classList.remove('selected');
          }
        });
        
        // Update UI
        this.updateSelectedCardsList();
        this.updateConfirmButton();
        this.updateGameMode();
      });
      buttonsContainer.appendChild(button);
    });

    // Add the additional preset buttons
    for (let i = 1; i <= 15; i++) {
      const button = document.createElement('button');
      button.className = 'preset-button';
      button.dataset.preset = i.toString();
      button.textContent = `Preset ${i}`;
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        buttonsContainer.querySelectorAll('.preset-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Clear previous selection
        this.selectedCards.clear();
        this.currentPreset = null;
        this.isCustomSettings = true;
        
        // Update UI
        this.updateSelectedCardsList();
        this.updateConfirmButton();
        this.updateGameMode();
      });
      buttonsContainer.appendChild(button);
    }
  }

  updateGameMode() {
    const gameMode = document.getElementById('game-mode');
    if (!gameMode) return;

    if (this.isCustomSettings) {
      gameMode.textContent = 'You vs. Custom';
    } else if (this.currentPreset) {
      gameMode.textContent = `You vs. ${this.presets[this.currentPreset].name}`;
    }
  }

  checkIfSettingsMatchPreset() {
    if (!this.currentPreset) {
      this.isCustomSettings = true;
      return;
    }

    const preset = this.presets[this.currentPreset];
    const vpInput = document.getElementById('vp-to-win');
    const turnsInput = document.getElementById('max-turns-input');
    
    // Check if VP and turns match
    const vpMatch = vpInput && parseInt(vpInput.value) === preset.victoryPointsToWin;
    const turnsMatch = turnsInput && parseInt(turnsInput.value) === preset.maxTurns;
    
    // Check if selected cards match
    const cardsMatch = preset.selectedCards.length === this.selectedCards.size &&
      preset.selectedCards.every(card => this.selectedCards.has(card));
    
    this.isCustomSettings = !(vpMatch && turnsMatch && cardsMatch);
    this.updateGameMode();
  }
}

export class StatsUI {
  constructor(playerStats, modalManager) {
    this.playerStats = playerStats;
    this.modalManager = modalManager;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    const closeButton = document.getElementById('close-stats');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.modalManager.hideModal('stats');
      });
    }

    // Reset button
    const resetButton = document.getElementById('reset-stats');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
          this.playerStats.resetStats();
          this.updateUI();
        }
      });
    }

    // Listen for stats updates
    this.playerStats.on('statsUpdated', () => {
      this.updateUI();
    });
  }

  show() {
    this.updateUI();
    this.modalManager.showModal('stats', {
      title: 'Player Statistics',
      onConfirm: () => this.modalManager.hideModal('stats')
    });
  }

  updateUI() {
    const stats = this.playerStats.getStats();
    
    // Update summary stats
    document.getElementById('games-played').textContent = stats.gamesPlayed;
    document.getElementById('win-rate').textContent = 
      stats.gamesPlayed > 0 ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%';
    document.getElementById('highest-score').textContent = stats.highestScore;
    document.getElementById('average-score').textContent = 
      stats.gamesPlayed > 0 ? Math.round(stats.averageScore) : '0';
    
    // Update fastest win
    const fastestWinEl = document.getElementById('fastest-win');
    if (stats.fastestWin) {
      const date = new Date(stats.fastestWin.date);
      fastestWinEl.textContent = `${stats.fastestWin.turns} turns (${date.toLocaleDateString()})`;
    } else {
      fastestWinEl.textContent = '-';
    }

    // Update game history
    const historyList = document.getElementById('game-history-list');
    historyList.innerHTML = '';

    stats.gameHistory.forEach(game => {
      const item = document.createElement('div');
      item.className = `game-history-item ${game.isWin ? 'win' : 'loss'}`;
      
      const date = new Date(game.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      item.innerHTML = `
        <div class="date">${formattedDate}</div>
        <div class="result">
          ${game.isWin ? 'Victory' : 'Defeat'} - ${game.victoryPoints} VP in ${game.turns} turns
        </div>
      `;
      
      historyList.appendChild(item);
    });
  }
}
