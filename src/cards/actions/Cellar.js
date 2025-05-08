import { ActionCard } from '../ActionCard.js';
import { shuffle } from '../../game.js';

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
  async onPlay(player, gameState) {
    super.onPlay(player);
    
    // Add +1 Action
    player.state.actions += 1;

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }
    
    // Create a promise to handle the modal interaction
    const selectedCards = await new Promise((resolve) => {
      gameState.modalManager.showModal('card', {
        title: 'Choose cards to discard for Cellar',
        cards: player.state.hand,
        confirmText: 'Discard Selected',
        onConfirm: (cards) => {
          resolve(cards);
        }
      });
    });
    
    // Discard selected cards
    for (const card of selectedCards) {
      if (!card) continue;
      
      const index = player.state.hand.indexOf(card);
      if (index !== -1) {
        const [discardedCard] = player.state.hand.splice(index, 1);
        player.state.discard.push(discardedCard);
        player.emit('cardDiscarded', { player, card: discardedCard });
      }
    }
    
    // Draw new cards
    const numToDraw = selectedCards.length;
    
    // Draw cards one at a time, handling reshuffling
    for (let i = 0; i < numToDraw; i++) {
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) break;
        
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        shuffle(player.state.deck);
      }
      const drawnCard = player.state.deck.pop();
      if (drawnCard) {
        player.state.hand.push(drawnCard);
        player.emit('cardsDrawn', { player, cards: [drawnCard] });
      }
    }
    
    // Emit events to trigger UI updates
    gameState.emit('cardPlayed', { player, card: this });
    gameState.emit('stateChanged');
  }
} 