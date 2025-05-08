import { ActionCard } from '../ActionCard.js';

/**
 * Laboratory card implementation
 * Cost: 5
 * Effect: +2 Cards, +1 Action
 */
export class Laboratory extends ActionCard {
  constructor() {
    super({
      name: 'Laboratory',
      cost: 5,
      description: '+2 Cards, +1 Action'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    
    // Draw two cards
    player.drawCards(2);
    
    // Add additional action
    player.state.actions += 1;
  }
} 