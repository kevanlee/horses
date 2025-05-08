import { ActionCard } from '../ActionCard.js';

/**
 * Festival card implementation
 * Cost: 5
 * Effect: +2 Actions, +1 Buy, +2 Gold
 */
export class Festival extends ActionCard {
  constructor() {
    super({
      name: 'Festival',
      cost: 5,
      description: '+2 Actions, +1 Buy, +2 Gold'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    
    // Add two additional actions
    player.state.actions += 2;
    
    // Add additional buy
    player.state.buys += 1;
    
    // Add gold
    player.state.bonusGold += 2;
  }
} 