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
    this.players = [];
    this.currentPlayerIndex = 0;
    this.supply = new Map();
    this.trash = [];
    this.modalManager = null;
    this.cardRegistry = cardRegistry;
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
    const player = new Player(name, this.cardRegistry);
    this.players.push(player);
    this.setupPlayerListeners(player);
    return player;
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
    const player = this.getCurrentPlayer();
    const supply = this.supply.get(card.name);
    
    if (!supply || supply.count <= 0) return false;
    if (player.state.buys <= 0) return false;
    
    const totalGold = this.calculatePlayerGold(player);
    return totalGold >= card.cost;
  }

  /**
   * @param {Player} player
   * @returns {number}
   */
  calculatePlayerGold(player) {
    let gold = 0;
    for (const card of player.state.hand) {
      if (card.type === 'Treasure') {
        gold += card.value;
      }
    }
    return gold + player.state.bonusGold;
  }

  /**
   * @returns {Player}
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  nextTurn() {
    const currentPlayer = this.getCurrentPlayer();
    currentPlayer.endTurn();
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const nextPlayer = this.getCurrentPlayer();
    nextPlayer.startTurn();
    
    this.emit('turnChanged', { 
      previousPlayer: currentPlayer,
      currentPlayer: nextPlayer
    });
  }

  /**
   * @param {Card} card
   * @returns {boolean}
   */
  validatePlay(card) {
    const player = this.getCurrentPlayer();
    
    if (!player.canPlay(card)) {
      throw new Error('Cannot play card: No actions remaining');
    }
    
    if (!player.state.hand.includes(card)) {
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
    let winner = this.players[0];
    let highestPoints = winner.calculateVictoryPoints();
    
    for (let i = 1; i < this.players.length; i++) {
      const player = this.players[i];
      const points = player.calculateVictoryPoints();
      
      if (points > highestPoints) {
        winner = player;
        highestPoints = points;
      }
    }
    
    return winner;
  }
} 