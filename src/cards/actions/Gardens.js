import { ActionCard } from '../ActionCard.js';

export class Gardens extends ActionCard {
  constructor() {
    super({
      name: 'Gardens',
      type: 'Action',
      cost: 4,
      description: 'Worth 1 VP per 10 cards in your deck (rounded down)'
    });
  }

  /**
   * Calculate points based on the total number of cards in the player's deck
   * @param {Player} player
   * @returns {number}
   */
  getPoints(player) {
    const totalCards = player.state.deck.length + player.state.hand.length + player.state.discard.length;
    return Math.floor(totalCards / 10);
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);
    // Update victory points when played
    this.updateVictoryPoints(player, gameState);
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