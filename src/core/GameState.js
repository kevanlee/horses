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
    this.gameEnded = false;
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
    if (this.gameEnded) return false;
    
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
    if (this.gameEnded) return;
    
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
    if (this.gameEnded) {
      throw new Error('Cannot play card: Game is over');
    }
    
    if (!this.player.canPlay(card)) {
      throw new Error('Cannot play card: No actions remaining or not an action card');
    }
    
    if (!this.player.state.hand.includes(card)) {
      throw new Error('Cannot play card: Card not in hand');
    }
    
    return true;
  }

  /**
   * @param {Object} config
   * @param {number} [config.victoryPointsToWin]
   * @param {number} [config.maxTurns]
   * @param {number} [config.timeLimit]
   * @param {number} [config.provinceThreshold]
   * @param {string[]} [config.selectedCards]
   */
  initialize(config = {}) {
    // Store custom config
    this.victoryPointsToWin = config.victoryPointsToWin;
    this.maxTurns = config.maxTurns;
    this.timeLimit = config.timeLimit;
    this.provinceThreshold = config.provinceThreshold;

    // Add single player
    const player = this.addPlayer('Player');

    // Initialize supply piles
    const basicCards = [
      { name: 'Copper', count: 60 },
      { name: 'Silver', count: 40 },
      { name: 'Gold', count: 30 },
      { name: 'Estate', count: 24 },
      { name: 'Duchy', count: 12 },
      { name: 'Province', count: 12 }
    ];

    // Add basic cards to supply
    basicCards.forEach(({ name, count }) => {
      const card = this.cardRegistry.getCard(name);
      this.addToSupply(card, count);
    });

    // Add selected action cards to supply
    if (config.selectedCards) {
      config.selectedCards.forEach(cardName => {
        const card = this.cardRegistry.getCard(cardName);
        this.addToSupply(card, 10);
      });
    } else {
      // Default action cards if none selected
      const defaultActionCards = [
        'Cellar', 'Chapel', 'Village', 'Woodcutter', 'Workshop',
        'Smithy', 'Remodel', 'Moneylender', 'Market', 'Festival'
      ];
      defaultActionCards.forEach(cardName => {
        const card = this.cardRegistry.getCard(cardName);
        this.addToSupply(card, 10);
      });
    }

    // Start the game
    this.getCurrentPlayer().startTurn();
  }

  /**
   * Check if the game should end
   * @returns {boolean}
   */
  checkGameEnd() {
    // Check custom victory points threshold
    if (this.victoryPointsToWin) {
      const playerPoints = this.getCurrentPlayer().calculateVictoryPoints();
      console.log('Checking victory points:', {
        currentPoints: playerPoints,
        threshold: this.victoryPointsToWin,
        shouldEnd: playerPoints >= this.victoryPointsToWin
      });
      if (playerPoints >= this.victoryPointsToWin) {
        return true;
      }
    }

    // Check custom turn limit
    if (this.maxTurns && this.turnNumber > this.maxTurns) {
      return true;
    }

    // Check custom province threshold
    const provincePile = this.supply.get('Province');
    if (this.provinceThreshold && provincePile && provincePile.count <= this.provinceThreshold) {
      return true;
    }

    // Check if any supply pile is empty
    for (const [cardName, pile] of this.supply) {
      if (pile.count === 0) {
        return true;
      }
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
    if (this.gameEnded) return; // Don't update if game is over
    
    console.log('Updating victory points:', {
      oldPoints: player.state.victoryPoints,
      newPoints: points,
      threshold: this.victoryPointsToWin
    });
    
    player.state.victoryPoints = points;
    this.emit('victoryPointsUpdated', { player, points });
    
    // Check if game should end after updating points
    const shouldEnd = this.checkGameEnd();
    console.log('Game end check result:', shouldEnd);
    
    if (shouldEnd) {
      console.log('Game should end - emitting gameEnded event');
      this.gameEnded = true;
      this.emit('gameEnded', { reason: 'Victory points threshold reached!' });
    }
  }
} 