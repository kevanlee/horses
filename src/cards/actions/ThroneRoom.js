import { ActionCard } from '../ActionCard.js';

/**
 * Throne Room card implementation
 * Cost: 4
 * Effect: Choose an Action card in your hand. Play it twice.
 */
export class ThroneRoom extends ActionCard {
  constructor() {
    super({
      name: 'Throne Room',
      cost: 4,
      description: 'Choose an Action card in your hand. Play it twice.'
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

    // Find Action cards in hand
    const actionCards = player.state.hand.filter(card => card.type === 'Action');
    
    if (actionCards.length === 0) {
      gameState.modalManager.showModal('card', {
        title: 'Throne Room Effect',
        message: 'You have no Action cards in your hand to play.',
        onConfirm: () => {
          gameState.emit('cardPlayed', this);
          gameState.emit('stateChanged', {
            type: 'handUpdated',
            player: player
          });
        }
      });
      return;
    }

    gameState.modalManager.showModal('card', {
      title: 'Choose an Action card to play twice',
      message: 'Select an Action card from your hand to play twice',
      cards: actionCards,
      confirmText: 'Play Selected',
      onConfirm: async (selectedCards) => {
        if (selectedCards.length !== 1) {
          throw new Error('Must select exactly one card to play');
        }

        const actionCard = selectedCards[0];
        
        if (actionCard.type !== 'Action') {
          throw new Error('Can only play Action cards with Throne Room');
        }

        // Store the card in a temporary variable in case it gets trashed
        const cardToPlay = actionCard;

        // First play (consumes action)
        // Note: The action is already consumed by Throne Room's super.onPlay
        // So we need to increment it back for the first play
        player.state.actions++;
        await this.playActionCard(cardToPlay, player, gameState);

        // Second play (free)
        // If the card was trashed or moved, we can't play it again
        if (player.state.hand.includes(cardToPlay)) {
          await this.playActionCard(cardToPlay, player, gameState);
        }

        // Emit final events after both plays are complete
        gameState.emit('cardPlayed', this);
        gameState.emit('stateChanged', {
          type: 'handUpdated',
          player: player
        });
      }
    });
  }

  /**
   * Helper method to play an Action card
   * @param {Card} card - The card to play
   * @param {Player} player - The player playing the card
   * @param {GameState} gameState - The game state
   */
  async playActionCard(card, player, gameState) {
    // Remove from hand
    const index = player.state.hand.indexOf(card);
    if (index === -1) return; // Card was already moved/trashed
    player.state.hand.splice(index, 1);

    // Add to play area
    player.state.playArea.push(card);

    // Emit events for the card being played
    player.emit('cardPlayed', { player, card });
    gameState.emit('stateChanged', {
      type: 'handUpdated',
      player: player
    });

    // Play the card
    if (card.onPlay) {
      // Create a promise that resolves when the card's effect is complete
      return new Promise((resolve) => {
        // Set up a one-time listener for when the card's effect is done
        const cleanup = () => {
          gameState.removeListener('cardPlayed', onCardPlayed);
          resolve();
        };

        const onCardPlayed = ({ playedCard }) => {
          if (playedCard === card) {
            cleanup();
          }
        };

        gameState.on('cardPlayed', onCardPlayed);
        
        // Play the card
        card.onPlay(player, gameState);
      });
    }
  }
} 