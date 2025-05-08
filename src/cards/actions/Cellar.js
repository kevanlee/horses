import { ActionCard } from '../ActionCard.js';

/**
 * Cellar card implementation
 * Cost: 2
 * Effect: +1 Action. Discard any number of cards, then draw that many.
 */
export class Cellar extends ActionCard {
  constructor() {
    super({
      name: 'Cellar',
      cost: 2,
      description: '+1 Action. Discard any number of cards, then draw that many.'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    player.state.actions += 1;

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose cards to discard for Cellar',
      cards: player.state.hand,
      confirmText: 'Discard Selected',
      onConfirm: (selectedCards) => {
        // Discard selected cards
        for (const card of selectedCards) {
          player.discardCard(card);
        }
        
        // Draw new cards
        player.drawCards(selectedCards.length);
      }
    });
  }
} 