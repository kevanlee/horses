/**
 * Manages modal dialogs for card interactions
 */
export class ModalManager {
  constructor() {
    this.modals = new Map();
    this.setupModals();
  }

  setupModals() {
    // Card selection modal
    const cardModal = document.getElementById('card-modal');
    const modalContent = cardModal.querySelector('.modal-content');
    const modalTitle = modalContent.querySelector('#modal-title');
    const modalBody = modalContent.querySelector('#modal-body');
    const modalConfirm = modalContent.querySelector('#modal-confirm');

    this.modals.set('card', {
      element: cardModal,
      title: modalTitle,
      body: modalBody,
      confirm: modalConfirm
    });

    // Library modal
    const libraryModal = document.getElementById('library-modal');
    const libraryContent = libraryModal.querySelector('.modal-content');
    const libraryTitle = libraryContent.querySelector('h2');
    const libraryText = libraryContent.querySelector('#library-modal-text');
    const libraryHand = libraryContent.querySelector('#library-hand');
    const libraryConfirm = libraryContent.querySelector('#library-confirm');

    this.modals.set('library', {
      element: libraryModal,
      title: libraryTitle,
      text: libraryText,
      body: libraryHand,
      confirm: libraryConfirm
    });
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
  showModal(type, options) {
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
      options.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
          <strong>${card.name}</strong><br>
          <em>Type:</em> ${card.type}<br>
          <em>Cost:</em> ${card.cost}<br>
          ${card.description ? `<em>Effect:</em> ${card.description}` : ''}
        `;
        cardEl.dataset.index = index;
        modal.body.appendChild(cardEl);
      });
    }

    modal.confirm.textContent = options.confirmText || 'Confirm';
    modal.confirm.onclick = () => {
      const selectedCards = Array.from(modal.body.querySelectorAll('.card.selected'))
        .map(el => options.cards[parseInt(el.dataset.index)]);
      
      options.onConfirm(selectedCards);
      this.hideModal(type);
    };

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