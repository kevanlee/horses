import { ActionCard } from '../ActionCard.js';

/**
 * Test card implementation
 * Cost: 0
 * Effect: Draw 1 card
 */
export class Test extends ActionCard {
  constructor() {
    super({
      name: 'Test',
      cost: 0,
      description: 'Draw 1 card'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    console.log('Test: Starting onPlay');
    super.onPlay(player);
    
    // Draw 1 card
    if (player.state.deck.length === 0) {
      if (player.state.discard.length === 0) {
        console.log('Test: No cards to draw');
        return;
      }
      console.log('Test: Reshuffling discard pile into deck');
      player.state.deck = [...player.state.discard];
      player.state.discard = [];
      gameState.shuffle(player.state.deck);
    }
    
    const drawnCard = player.state.deck.pop();
    if (drawnCard) {
      player.state.hand.push(drawnCard);
      player.emit('cardsDrawn', { player, cards: [drawnCard] });
      console.log('Test: Drew card:', drawnCard.name);
    }
    
    // Update UI
    gameState.emit('handUpdated', player);
  }
} 