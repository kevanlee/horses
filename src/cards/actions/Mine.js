import { ActionCard } from '../ActionCard.js';

/**
 * Mine card implementation
 * Cost: 5
 * Effect: Trash a Treasure from your hand. Gain a Treasure costing up to 3 more.
 */
export class Mine extends ActionCard {
  constructor() {
    super({
      name: 'Mine',
      cost: 5,
      description: 'Trash a Treasure from your hand. Gain a Treasure costing up to 3 more.'
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

    // First modal: Choose Treasure card to trash
    const treasureCards = player.state.hand.filter(card => card.type === 'Treasure');
    
    if (treasureCards.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Mine Effect',
        message: 'You have no Treasure cards in your hand to trash.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose a Treasure to trash',
      message: 'Select a Treasure card from your hand to trash',
      cards: treasureCards,
      confirmText: 'Trash Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to trash');
        }

        const trashedCard = selectedCards[0];
        const maxCost = trashedCard.cost + 3;

        // Trash the selected card
        player.trashCard(trashedCard);

        // Second modal: Choose Treasure card to gain
        const availableTreasures = gameState.cardRegistry.getAllCards()
          .filter(card => {
            const supply = gameState.supply.get(card.name);
            return supply && 
                   supply.count > 0 && 
                   card.type === 'Treasure' && 
                   card.cost <= maxCost;
          });

        if (availableTreasures.length === 0) {
          gameState.modalManager.showModal('card', {
            title: 'Mine Effect',
            message: 'No Treasure cards available to gain.',
            onConfirm: () => {} // Just close the modal
          });
          return;
        }

        gameState.modalManager.showModal('card', {
          title: 'Choose a Treasure to gain',
          message: `Select a Treasure card costing up to ${maxCost} to gain`,
          cards: availableTreasures,
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

            if (gainedCard.type !== 'Treasure') {
              throw new Error('Selected card must be a Treasure');
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