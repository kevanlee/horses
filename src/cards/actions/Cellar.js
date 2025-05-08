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
    console.log('Cellar: Starting onPlay');
    super.onPlay(player);
    
    // Add +1 Action
    player.state.actions += 1;
    console.log('Cellar: Added +1 Action, current actions:', player.state.actions);

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    console.log('Cellar: Current hand size before modal:', player.state.hand.length);
    
    // Create a promise to handle the modal interaction
    const selectedCards = await new Promise((resolve) => {
      gameState.modalManager.showModal('card', {
        title: 'Choose cards to discard for Cellar',
        cards: player.state.hand,
        confirmText: 'Discard Selected',
        onConfirm: (cards) => {
          console.log('Cellar: Modal confirmed, selected cards:', cards.length);
          resolve(cards);
        }
      });
    });

    // Process the selected cards after modal is closed
    console.log('Cellar: Processing selected cards:', selectedCards.length);
    
    // Discard selected cards
    for (const card of selectedCards) {
      if (!card) {
        console.error('Cellar: Attempted to discard undefined card');
        continue;
      }
      console.log('Cellar: Discarding card:', card.name);
      const index = player.state.hand.indexOf(card);
      if (index !== -1) {
        const [discardedCard] = player.state.hand.splice(index, 1);
        player.state.discard.push(discardedCard);
        player.emit('cardDiscarded', { player, card: discardedCard });
      }
    }
    console.log('Cellar: After discarding, hand size:', player.state.hand.length);
    
    // Draw new cards
    const numToDraw = selectedCards.length;
    console.log('Cellar: Attempting to draw', numToDraw, 'cards');
    
    // Draw cards one at a time, handling reshuffling
    for (let i = 0; i < numToDraw; i++) {
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) {
          console.log('Cellar: No more cards to draw');
          break;
        }
        console.log('Cellar: Reshuffling discard pile into deck');
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        shuffle(player.state.deck);
      }
      const drawnCard = player.state.deck.pop();
      if (drawnCard) {
        player.state.hand.push(drawnCard);
        player.emit('cardsDrawn', { player, cards: [drawnCard] });
        console.log('Cellar: Drew card:', drawnCard.name);
      }
    }
    
    console.log('Cellar: Finished drawing, final hand size:', player.state.hand.length);
    
    // Update UI directly after all operations are complete
    if (gameState.game && typeof gameState.game.updateUI === 'function') {
      gameState.game.updateUI();
    }
  }
} 