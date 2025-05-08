import { ActionCard } from '../ActionCard.js';

/**
 * Moneylender card implementation
 * Cost: 4
 * Effect: Trash a Copper from your hand for +3 coins
 */
export class Moneylender extends ActionCard {
  constructor() {
    super({
      name: 'Moneylender',
      cost: 4,
      description: 'Trash a Copper from your hand for +3 coins'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    // Find Copper cards in hand
    const copperCards = player.state.hand.filter(card => card.name === 'Copper');
    
    if (copperCards.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Moneylender Effect',
        message: 'You have no Copper cards in your hand to trash.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose a Copper to trash',
      message: 'Select a Copper card to trash for +3 coins',
      cards: copperCards,
      confirmText: 'Trash Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to trash');
        }

        const trashedCard = selectedCards[0];
        
        if (trashedCard.name !== 'Copper') {
          throw new Error('Can only trash Copper cards');
        }

        // Trash the selected card
        player.trashCard(trashedCard);
        
        // Add 3 coins
        player.state.bonusGold += 3;
      }
    });
  }
} 