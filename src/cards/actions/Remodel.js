import { ActionCard } from '../ActionCard.js';

/**
 * Remodel card implementation
 * Cost: 4
 * Effect: Trash a card from your hand. Gain a card costing up to $2 more.
 */
export class Remodel extends ActionCard {
  constructor() {
    super({
      name: 'Remodel',
      cost: 4,
      description: 'Trash a card from your hand. Gain a card costing up to $2 more.'
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

    // First modal: Choose card to trash
    gameState.modalManager.showModal('card', {
      title: 'Choose a card to trash',
      message: 'Select a card from your hand to trash',
      cards: player.state.hand,
      confirmText: 'Trash Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to trash');
        }

        const trashedCard = selectedCards[0];
        const maxCost = trashedCard.cost + 2;

        // Trash the selected card
        player.trashCard(trashedCard);

        // Second modal: Choose card to gain
        const availableCards = gameState.cardRegistry.getAllCards()
          .filter(card => {
            const supply = gameState.supply.get(card.name);
            return supply && supply.count > 0 && card.cost <= maxCost;
          });

        gameState.modalManager.showModal('card', {
          title: 'Choose a card to gain',
          message: `Select a card costing up to ${maxCost} to gain`,
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

            if (gainedCard.cost > maxCost) {
              throw new Error('Selected card costs more than allowed');
            }

            // Gain the selected card
            supply.count--;
            player.gainCard(gainedCard);
          }
        });
      }
    });
  }
} 