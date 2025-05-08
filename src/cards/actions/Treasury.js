import { ActionCard } from '../ActionCard.js';

export class Treasury extends ActionCard {
  constructor() {
    super({
      name: 'Treasury',
      type: 'Action',
      cost: 5,
      description: '+1 Card, +1 Action, +1 Coin'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    
    // Draw 1 card
    player.drawCards(1);
    
    // Add 1 action
    player.state.actions += 1;
    
    // Add 1 coin
    player.state.bonusGold += 1;
  }
} 