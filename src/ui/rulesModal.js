export class RulesModal {
  constructor() {
    this.element = null;
    this.boundEscHandler = null;
  }

  show(levelInfo) {
    console.log('RulesModal.show() called with levelInfo:', levelInfo);
    console.log('Win condition object:', levelInfo.winCondition);
    console.log('Win condition description:', levelInfo.winConditionDescription);
    
    // Create rules modal
    this.element = document.createElement('div');
    this.element.id = 'rules-modal';
    this.element.className = 'modal-overlay active';
    
    // Get available cards for this level
    const availableCards = this.getAvailableCards(levelInfo.marketSupply);
    
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="level-info">
        <h2 class="level-number">${levelInfo.challengeName ? `${levelInfo.challengeName}` : `Level ${levelInfo.levelNumber}`}</h2>
        ${levelInfo.challengeName ? `<h3 class="level-subtitle">Level ${levelInfo.levelNumber}</h3>` : ''}
        </div>
        <div class="level-info-box">
        <div class="rules-section">
          <h3>Goal</h3>
          <p>${levelInfo.winConditionDescription || 'Complete the level objective'}</p>
        </div>
        
        <div class="rules-section">
          <h3>Action Cards</h3>
          <div class="available-cards">
            ${availableCards.map(card => `
              <div class="card-item">
                <span class="card-name">${card.name}</span>
                <span class="card-cost">(${card.cost} gold)</span>
              </div>
            `).join('')}
          </div>
        </div>
        </div>
        
        <button id="lets-go-btn" class="start-button">Let's Go!</button>
      </div>
    `;

    document.body.appendChild(this.element);
    console.log('Rules modal element added to DOM');
    this.bindEvents();
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    if (this.boundEscHandler) {
      document.removeEventListener('keydown', this.boundEscHandler);
      this.boundEscHandler = null;
    }
  }

  getAvailableCards(marketSupply) {
    // Get unique cards from market supply (excluding basic treasure/victory cards)
    const uniqueCards = new Map();
    
    marketSupply.forEach(slot => {
      if (slot.card.type.includes('Action')) {
        uniqueCards.set(slot.card.name, slot.card);
      }
    });
    
    return Array.from(uniqueCards.values()).sort((a, b) => a.cost - b.cost);
  }

  bindEvents() {
    const letsGoBtn = document.getElementById('lets-go-btn');

    if (letsGoBtn) {
      letsGoBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Close modal when clicking outside
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
      }
    });

    // Close modal with Escape key
    if (!this.boundEscHandler) {
      this.boundEscHandler = (e) => {
        if (e.key === 'Escape' && this.element) {
          this.hide();
        }
      };
      document.addEventListener('keydown', this.boundEscHandler);
    }
  }
}

