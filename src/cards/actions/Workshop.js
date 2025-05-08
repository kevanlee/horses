import { ActionCard } from '../ActionCard.js';

/**
 * Workshop card implementation
 * Cost: 3
 * Effect: Gain a card costing up to 4
 */
export class Workshop extends ActionCard {
  constructor() {
    super({
      name: 'Workshop',
      cost: 3,
      description: 'Gain a card costing up to 4'
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

    // Get all available cards costing up to 4
    const availableCards = gameState.cardRegistry.getAllCards()
      .filter(card => {
        const supply = gameState.supply.get(card.name);
        return supply && supply.count > 0 && card.cost <= 4;
      });

    gameState.modalManager.showModal('card', {
      title: 'Choose a card to gain',
      message: 'Select a card costing up to 4 to gain',
      cards: availableCards,
      confirmText: 'Gain Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to gain');
        }

        const gainedCard = selectedCards[0];
        const supply = gameState.supply.get(gainedCard.name);
        
        if (!supply || supply.count <= 0) {
          throw new Error('Selected card is no longer available');
        }

        if (gainedCard.cost > 4) {
          throw new Error('Selected card costs more than allowed');
        }

        // Gain the selected card
        supply.count--;
        player.gainCard(gainedCard);
      }
    });
  }
} 