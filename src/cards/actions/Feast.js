import { ActionCard } from '../ActionCard.js';

/**
 * Feast card implementation
 * Cost: 4
 * Effect: Trash this card. Gain a card costing up to 5 coins.
 */
export class Feast extends ActionCard {
  constructor() {
    super({
      name: 'Feast',
      cost: 4,
      description: 'Trash this card. Gain a card costing up to 5 coins.'
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

    // First, trash this card from the play area
    const feastIndex = player.state.playArea.findIndex(card => card.name === 'Feast');
    if (feastIndex === -1) {
      throw new Error('Feast card not found in play area');
    }
    const feastCard = player.state.playArea.splice(feastIndex, 1)[0];
    player.emit('cardTrashed', { card: feastCard });

    // Then show modal to gain a card
    const availableCards = gameState.cardRegistry.getAllCards()
      .filter(card => {
        const supply = gameState.supply.get(card.name);
        return supply && supply.count > 0 && card.cost <= 5;
      });

    if (availableCards.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Feast Effect',
        message: 'No cards available to gain.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose a card to gain',
      message: 'Select a card costing up to 5 to gain',
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

        if (gainedCard.cost > 5) {
          throw new Error('Selected card costs more than allowed');
        }

        // Gain the selected card
        supply.count--;
        player.gainCard(gainedCard);
        
        // Emit events to update UI
        player.emit('cardPlayed', { card: this });
        gameState.emit('stateChanged');
      }
    });
  }
} 