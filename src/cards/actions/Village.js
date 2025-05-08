import { ActionCard } from '../ActionCard.js';

/**
 * Village card implementation
 * Cost: 3
 * Effect: Draw 1 card, +2 Actions
 */
export class Village extends ActionCard {
  constructor() {
    super({
      name: 'Village',
      cost: 3,
      description: 'Draw 1 card, +2 Actions'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    player.drawCards(1);
    player.state.actions += 2;
  }
} 