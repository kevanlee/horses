import { ActionCard } from '../ActionCard.js';

/**
 * Woodcutter card implementation
 * Cost: 3
 * Effect: +1 Buy, +2 Gold
 */
export class Woodcutter extends ActionCard {
  constructor() {
    super({
      name: 'Woodcutter',
      cost: 3,
      description: '+1 Buy, +2 Gold'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    
    // Add additional buy
    player.state.buys += 1;
    
    // Add gold
    player.state.bonusGold += 2;
  }
} 