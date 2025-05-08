import { ActionCard } from '../ActionCard.js';

export class Harbinger extends ActionCard {
  constructor() {
    super({
      name: 'Harbinger',
      type: 'Action',
      cost: 3,
      description: '+1 Card, +1 Action. Look through your discard pile and put a card on top of your deck.'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    
    // Draw 1 card
    player.drawCards(1);
    
    // Add 1 action
    player.state.actions += 1;

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    // Check if discard pile is empty
    if (player.state.discard.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Harbinger Effect',
        message: 'No cards in discard pile to choose from.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    // Show modal to select a card from discard
    gameState.modalManager.showModal('card', {
      title: 'Harbinger Effect',
      message: 'Choose a card from your discard pile to put on top of your deck',
      cards: player.state.discard,
      confirmText: 'Put on Top',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card');
        }

        const selectedCard = selectedCards[0];
        
        // Remove the card from discard
        const cardIndex = player.state.discard.indexOf(selectedCard);
        if (cardIndex === -1) {
          throw new Error('Selected card not found in discard pile');
        }
        player.state.discard.splice(cardIndex, 1);
        
        // Put the card on top of the deck
        player.state.deck.unshift(selectedCard);
      }
    });
  }
} 