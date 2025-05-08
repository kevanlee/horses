import { Card } from './base.js';

/**
 * Base class for all Victory cards
 */
export class VictoryCard extends Card {
  /**
   * @param {Object} config
   * @param {string} config.name
   * @param {number} config.cost
   * @param {number} config.points
   */
  constructor(config) {
    super({
      ...config,
      type: 'Victory',
      description: `Worth ${config.points} victory points`
    });
  }
} 