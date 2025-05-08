import { Player } from './Player.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Manages the overall game state and rules
 */
export class GameState extends EventEmitter {
  /**
   * @param {CardRegistry} cardRegistry
   */
  constructor(cardRegistry) {
    super();
    this.player = null;
    this.supply = new Map();
    this.trash = [];
    this.modalManager = null;
    this.cardRegistry = cardRegistry;
    this.turnNumber = 1;
  }

  /**
   * @param {ModalManager} modalManager
   */
  setModalManager(modalManager) {
    this.modalManager = modalManager;
  }

  /**
   * @param {string} name
   * @returns {Player}
   */
  addPlayer(name) {
    this.player = new Player(name, this.cardRegistry);
    this.setupPlayerListeners(this.player);
    return this.player;
  }

  /**
   * @param {Player} player
   */
  setupPlayerListeners(player) {
    player.on('cardPlayed', ({ card }) => {
      this.emit('cardPlayed', { player, card });
    });

    player.on('cardDiscarded', ({ card }) => {
      this.emit('cardDiscarded', { player, card });
    });

    player.on('cardTrashed', ({ card }) => {
      this.trash.push(card);
      this.emit('cardTrashed', { player, card });
    });

    player.on('cardGained', ({ card }) => {
      this.emit('cardGained', { player, card });
    });

    player.on('cardsDrawn', ({ cards }) => {
      this.emit('cardsDrawn', { player, cards });
    });
  }

  /**
   * @param {Card} card
   * @param {number} count
   */
  addToSupply(card, count) {
    this.supply.set(card.name, {
      card,
      count
    });
  }

  /**
   * @param {Card} card
   * @returns {boolean}
   */
  canBuyCard(card) {
    const supply = this.supply.get(card.name);
    
    if (!supply || supply.count <= 0) return false;
    if (this.player.state.buys <= 0) return false;
    
    const totalGold = this.calculatePlayerGold(this.player);
    return totalGold >= card.cost;
  }

  /**
   * @param {Player} player
   * @returns {number}
   */
  calculatePlayerGold(player) {
    let gold = player.state.bonusGold;  // Start with bonus gold
    for (const card of player.state.hand) {
      if (card.type === 'Treasure') {
        gold += card.value;
      }
    }
    return gold;
  }

  /**
   * @returns {Player}
   */
  getCurrentPlayer() {
    return this.player;
  }

  nextTurn() {
    this.player.endTurn();
    this.turnNumber++;
    this.player.startTurn();
    
    this.emit('turnChanged', { 
      player: this.player,
      turnNumber: this.turnNumber
    });
  }

  /**
   * @param {Card} card
   * @returns {boolean}
   */
  validatePlay(card) {
    if (!this.player.canPlay(card)) {
      throw new Error('Cannot play card: No actions remaining or not an action card');
    }
    
    if (!this.player.state.hand.includes(card)) {
      throw new Error('Cannot play card: Card not in hand');
    }
    
    return true;
  }

  /**
   * @returns {boolean}
   */
  checkGameEnd() {
    // Check if any supply pile is empty
    for (const [name, supply] of this.supply) {
      if (supply.count <= 0) {
        this.emit('gameEnded', { reason: `Supply pile ${name} is empty` });
        return true;
      }
    }
    
    // Check if Province pile is empty
    const provinceSupply = this.supply.get('Province');
    if (provinceSupply && provinceSupply.count <= 0) {
      this.emit('gameEnded', { reason: 'Province supply pile is empty' });
      return true;
    }
    
    return false;
  }

  /**
   * @returns {Player}
   */
  determineWinner() {
    return this.player;
  }

  /**
   * Updates victory points for a player and triggers UI update
   * @param {Player} player
   * @param {number} points
   */
  updateVictoryPoints(player, points) {
    player.state.victoryPoints = points;
    this.emit('victoryPointsUpdated', { player, points });
  }
} 