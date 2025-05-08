import { ActionCard } from '../ActionCard.js';

/**
 * Council Room card implementation
 * Cost: 5
 * Effect: +4 Cards, +1 Buy
 */
export class CouncilRoom extends ActionCard {
  constructor() {
    super({
      name: 'Council Room',
      cost: 5,
      description: '+4 Cards, +1 Buy'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    
    // Draw 4 cards
    player.drawCards(4);
    
    // Add 1 buy
    player.state.buys += 1;
  }
} 