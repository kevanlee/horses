import { ActionCard } from '../ActionCard.js';

/**
 * Smithy card implementation
 * Cost: 4
 * Effect: Draw 3 cards
 */
export class Smithy extends ActionCard {
  constructor() {
    super({
      name: 'Smithy',
      cost: 4,
      description: 'Draw 3 cards'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    player.drawCards(3);
  }
} 