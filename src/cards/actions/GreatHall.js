import { ActionCard } from '../ActionCard.js';

export class GreatHall extends ActionCard {
  constructor() {
    super({
      name: 'Great Hall',
      type: 'Action-Victory',
      cost: 3,
      description: '+1 Card, +1 Action, worth 1 VP',
      points: 1
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
  }
} 