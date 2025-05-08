import { ActionCard } from '../ActionCard.js';

/**
 * Market card implementation
 * Cost: 5
 * Effect: +1 Card, +1 Action, +1 Buy, +1 Gold
 */
export class Market extends ActionCard {
  constructor() {
    super({
      name: 'Market',
      cost: 5,
      description: '+1 Card, +1 Action, +1 Buy, +1 Gold'
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    super.onPlay(player);
    
    // Draw a card
    player.drawCards(1);
    
    // Add additional action
    player.state.actions += 1;
    
    // Add additional buy
    player.state.buys += 1;
    
    // Add gold
    player.state.bonusGold += 1;
  }
} 