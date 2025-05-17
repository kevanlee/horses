import { CardRegistry } from '../cards/CardRegistry.js';

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

    Object.entries(this.presets).forEach(([key, preset]) => {
      const button = document.createElement('button');
      button.className = 'preset-button';
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