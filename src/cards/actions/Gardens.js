import { ActionCard } from '../ActionCard.js';

export class Gardens extends ActionCard {
  // Static array to track all Gardens instances
  static instances = [];

  constructor() {
    super({
      name: 'Gardens',
      type: 'Action-Victory',
      cost: 4,
      description: '+1 Coin. Worth 1 VP per 10 cards in your deck.',
      points: 0  // Will be updated dynamically
    });
    // Register this instance
    Gardens.instances.push(this);
  }

  /**
   * Calculate points based on the total number of cards in the player's deck
   * @param {Player} player
   * @returns {number}
   */
  getPoints(player) {
    const totalCards = player.state.deck.length + player.state.hand.length + player.state.discard.length + player.state.playArea.length;
    const points = Math.floor(totalCards / 10);
    return points;
  }

  /**
   * Update the points display for all Gardens cards
   * @param {Player} player
   */
  static updateAllPoints(player) {
    const totalCards = player.state.deck.length + player.state.hand.length + player.state.discard.length + player.state.playArea.length;
    const pointsPerGardens = Math.floor(totalCards / 10);
    
    // Update points for all Gardens instances
    Gardens.instances.forEach(gardens => {
      gardens.points = pointsPerGardens;
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    // Add +1 Coin
    player.state.bonusGold += 1;
    // Update points for all Gardens cards
    Gardens.updateAllPoints(player);
  }

  /**
   * Update victory points for all Gardens cards
   * @param {Player} player
   * @param {GameState} gameState
   */
  updateVictoryPoints(player, gameState) {
    // Count all Gardens cards in play
    const gardensCount = [
      ...player.state.deck,
      ...player.state.hand,
      ...player.state.discard
    ].filter(card => card.name === 'Gardens').length;

    // Calculate points for all Gardens cards
    const totalCards = player.state.deck.length + player.state.hand.length + player.state.discard.length;
    const pointsPerGardens = Math.floor(totalCards / 10);
    const totalPoints = pointsPerGardens * gardensCount;

    // Update the victory points display
    if (gameState.updateVictoryPoints) {
      gameState.updateVictoryPoints(player, totalPoints);
    }
  }
} 