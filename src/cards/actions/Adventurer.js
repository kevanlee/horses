import { ActionCard } from '../ActionCard.js';

export class Adventurer extends ActionCard {
  constructor() {
    super({
      name: 'Adventurer',
      type: 'Action',
      cost: 6,
      description: 'Reveal cards until you reveal 2 Treasures. Add them to your hand.'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  async onPlay(player, gameState) {
    super.onPlay(player);

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    const treasuresFound = [];
    
    while (treasuresFound.length < 2) {
      // Check if we need to shuffle
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) {
          // No more cards to reveal
          await new Promise(resolve => {
            gameState.modalManager.showModal('card', {
              title: 'Adventurer Effect',
              message: `No more cards to reveal. Found ${treasuresFound.length} Treasure${treasuresFound.length === 1 ? '' : 's'}.`,
              onConfirm: resolve
            });
          });
          break;
        }
        // Shuffle discard into deck
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        gameState.shuffle(player.state.deck);
      }

      // Reveal a card
      const revealedCard = player.state.deck.shift();

      // Show modal for the revealed card
      await new Promise(resolve => {
        gameState.modalManager.showModal('card', {
          title: 'Adventurer Effect',
          message: `You revealed ${revealedCard.name}. ${revealedCard.type === 'Treasure' ? 'Adding to hand.' : 'Discarding.'} (Found ${treasuresFound.length} Treasure${treasuresFound.length === 1 ? '' : 's'})`,
          cards: [revealedCard],
          confirmText: 'Continue',
          onConfirm: () => {
            if (revealedCard.type === 'Treasure') {
              treasuresFound.push(revealedCard);
            } else {
              player.state.discard.push(revealedCard);
              player.emit('cardDiscarded', { player, card: revealedCard });
            }
            resolve();
          }
        });
      });
    }

    // If we found any treasures, show final modal and add them to hand
    if (treasuresFound.length > 0) {
      await new Promise(resolve => {
        gameState.modalManager.showModal('card', {
          title: 'Adventurer Effect',
          message: `Found ${treasuresFound.length} Treasure${treasuresFound.length === 1 ? '' : 's'}! Adding them to your hand.`,
          onConfirm: () => {
            // Add treasures to hand
            player.state.hand.push(...treasuresFound);
            // Emit events to update UI
            treasuresFound.forEach(card => {
              player.emit('cardsDrawn', { player, cards: [card] });
            });
            gameState.emit('cardPlayed', this);
            gameState.emit('stateChanged', {
              type: 'handUpdated',
              player: player
            });
            resolve();
          }
        });
      });
    }
  }
} 