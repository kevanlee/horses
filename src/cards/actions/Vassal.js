import { ActionCard } from '../ActionCard.js';

/**
 * Vassal card implementation
 * Cost: 3
 * Effect: +2 Gold. Reveal the top card of your deck. If it's an Action card, you may play it for free.
 */
export class Vassal extends ActionCard {
  constructor() {
    super({
      name: 'Vassal',
      cost: 3,
      description: '+2 Gold. Reveal the top card of your deck. If it\'s an Action card, you may play it for free.'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    player.state.bonusGold += 2;

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    // Check if deck needs to be reshuffled
    if (player.state.deck.length === 0) {
      if (player.state.discard.length === 0) {
        // No cards to reveal
        gameState.modalManager.showModal('card', {
          title: 'Vassal Effect',
          message: 'Your deck is empty. No card to reveal.',
          onConfirm: () => {} // Just close the modal
        });
        return;
      }
      // Reshuffle discard into deck
      player.state.deck = [...player.state.discard];
      player.state.discard = [];
      gameState.shuffle(player.state.deck);
    }

    // Draw the top card
    const revealedCard = player.state.deck.shift();

    // Show the card face down initially
    gameState.modalManager.showModal('card', {
      title: 'Vassal Effect',
      message: 'Click the card below to reveal the top card of your deck.',
      faceDownCard: revealedCard,
      onConfirm: () => {}, // Add empty onConfirm to satisfy the requirement
      onReveal: (card) => {
        // Show a new modal with the revealed card
        if (card.type === 'Action') {
          gameState.modalManager.showModal('card', {
            title: 'Vassal Effect',
            message: 'It\'s an Action card! Play it or discard it?',
            cards: [{
              ...card,
              description: card.description || '',
              icon: card.icon || '/res/icons/action-icon.png'
            }],
            confirmText: 'Play This Card',
            onConfirm: () => {
              // Temporarily increment actions to allow free play
              player.state.actions++;
              card.onPlay(player, gameState);
              // Decrement actions after playing
              player.state.actions--;
            },
            onDiscard: () => {
              // Discard the revealed card
              player.state.discard.push(card);
            }
          });
        } else {
          // Not an Action card, just show discard button
          gameState.modalManager.showModal('card', {
            title: 'Vassal Effect',
            message: 'It\'s not an Action card. It will be discarded.',
            cards: [{
              ...card,
              description: card.description || '',
              icon: card.icon || '/res/icons/action-icon.png'
            }],
            onConfirm: () => {}, // Add empty onConfirm to satisfy the requirement
            onDiscard: () => {
              // Discard the revealed card
              player.state.discard.push(card);
            }
          });
        }
      }
    });
  }
} 