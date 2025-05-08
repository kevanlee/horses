import { ActionCard } from '../ActionCard.js';

/**
 * Masquerade card implementation
 * Cost: 3
 * Effect: Draw 2 cards. Keep one, discard the other.
 */
export class Masquerade extends ActionCard {
  constructor() {
    super({
      name: 'Masquerade',
      cost: 3,
      description: 'Draw 2 cards. Keep one, discard the other.'
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

    // Draw 2 cards (reshuffle if needed)
    const drawnCards = [];
    for (let i = 0; i < 2; i++) {
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) {
          gameState.modalManager.showModal('card', {
            title: 'Masquerade Effect',
            message: 'Your deck is empty. No cards to draw.',
            onConfirm: () => {} // Just close the modal
          });
          return;
        }
        // Reshuffle discard into deck
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        gameState.shuffle(player.state.deck);
      }
      if (player.state.deck.length > 0) {
        drawnCards.push(player.state.deck.shift());
      }
    }

    if (drawnCards.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Masquerade Effect',
        message: 'No cards to draw.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    gameState.modalManager.showModal('card', {
      title: 'Masquerade: Choose a card to keep',
      message: 'Select one card to keep. The other will be discarded.',
      cards: drawnCards,
      confirmText: 'Keep Selected',
      onConfirm: (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to keep');
        }

        const cardToKeep = selectedCards[0];
        
        // Add the selected card to hand
        player.state.hand.push(cardToKeep);

        // Discard the other card
        drawnCards.forEach(card => {
          if (card !== cardToKeep) {
            player.state.discard.push(card);
          }
        });

        // Update UI
        gameState.emit('handUpdated', player);
        gameState.emit('discardUpdated', player);
      }
    });
  }
} 