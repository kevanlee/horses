/**
 * @typedef {Object} CardConfig
 * @property {string} name - The name of the card
 * @property {string} type - The type of the card (Action, Treasure, Victory)
 * @property {number} cost - The cost of the card
 * @property {string} description - The description of the card's effect
 * @property {number} [value] - The coin value (for Treasure cards)
 * @property {number} [points] - The victory points (for Victory cards)
 */

export class Card {
  /**
   * @param {CardConfig} config
   */
  constructor(config) {
    this.name = config.name;
    this.type = config.type;
    this.cost = config.cost;
    this.description = config.description;
    this.value = config.value || 0;
    this.points = config.points || 0;
  }

  /**
   * @param {Player} player
   * @returns {boolean}
   */
  canPlay(player) {
    return player.actions > 0;
  }

  /**
   * @param {Player} player
   */
  onPlay(player) {
    // Base implementation - override in subclasses
  }

  /**
   * @param {Player} player
   */
  onBuy(player) {
    // Base implementation - override in subclasses
  }

  /**
   * @returns {string}
   */
  toString() {
    return `${this.name} (${this.type}) - ${this.description}`;
  }
} 