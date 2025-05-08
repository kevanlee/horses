import { Card } from './base.js';

/**
 * Base class for all Action cards
 */
export class ActionCard extends Card {
  /**
   * @param {Object} config
   * @param {string} config.name
   * @param {number} config.cost
   * @param {string} config.description
   */
  constructor(config) {
    super({
      ...config,
      type: 'Action'
    });
  }

  /**
   * @param {Player} player
   * @returns {boolean}
   */
  canPlay(player) {
    return player.state.actions > 0;
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    // Base implementation - override in subclasses
    // Note: Action consumption is handled by Player.playCard()
  }
} 