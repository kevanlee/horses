import { ActionCard } from '../ActionCard.js';

/**
 * Chapel card implementation
 * Cost: 2
 * Effect: Trash up to 4 cards from your hand
 */
export class Chapel extends ActionCard {
  constructor() {
    super({
      name: 'Chapel',
      cost: 2,
      description: 'Trash up to 4 cards from your hand'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    // Don't call super.onPlay since Chapel doesn't need to modify actions
    // The action is already consumed when the card is played

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose up to 4 cards to trash',
      message: 'Select cards from your hand to trash (up to 4)',
      cards: player.state.hand,
      confirmText: 'Trash Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length > 4) {
          throw new Error('Cannot trash more than 4 cards');
        }

        // Trash selected cards
        for (const card of selectedCards) {
          player.trashCard(card);
        }
      }
    });
  }
} 