import { Card } from './base.js';

/**
 * Base class for all Treasure cards
 */
export class TreasureCard extends Card {
  /**
   * @param {Object} config
   * @param {string} config.name
   * @param {number} config.cost
   * @param {number} config.value
   */
  constructor(config) {
    super({
      ...config,
      type: 'Treasure',
      description: `Worth ${config.value} coins`
    });
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    player.state.bonusGold += this.value;
  }
} 