import { CardRegistry } from '../cards/CardRegistry.js';

export class GameSetup {
  constructor(modalManager, cardRegistry) {
    this.modalManager = modalManager;
    this.cardRegistry = cardRegistry;
    this.selectedCards = new Set();
    this.setupEventListeners();
  }

  show() {
    const setupModal = this.modalManager.modals.get('setup');
    if (!setupModal) return;

    // Reset selected cards
    this.selectedCards.clear();
    
    // Populate card options
    this.populateCardOptions();
    
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
      }
    });

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
        const config = this.getDefaultGameConfig();
        this.modalManager.hideModal('setup');
        this.modalManager.emit('gameSetupComplete', config);
      });
    }
  }

  populateCardOptions() {
    const actionCards = this.cardRegistry.getAllCards()
      .filter(card => card.type === 'Action')
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
      maxTurns: parseInt(document.getElementById('max-turns')?.value) || 100,
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
      .filter(card => card.type === 'Action')
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
} 