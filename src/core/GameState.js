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
    
    // Check if we've reached max turns before incrementing
    if (this.maxTurns && this.turnNumber > this.maxTurns) {
      console.log('Maximum turns reached, ending game');
      this.checkGameEnd(); // This will trigger the game end with loss condition
      return;
    }
    
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
   * @param {boolean} [config.useProvinceEndCondition=false] - Whether to use Province pile as end condition
   * @param {boolean} [config.useSupplyPileEndCondition=false] - Whether to use empty supply piles as end condition
   */
  initialize(config = {}) {
    // Reset game state
    this.gameEnded = false;
    this.turnNumber = 1;
    this.trash = [];
    this.supply = new Map();
    
    // Store custom config
    this.victoryPointsToWin = config.victoryPointsToWin;
    this.maxTurns = config.maxTurns;
    this.timeLimit = config.timeLimit;
    this.provinceThreshold = config.provinceThreshold;
    this.useProvinceEndCondition = config.useProvinceEndCondition || false;
    this.useSupplyPileEndCondition = config.useSupplyPileEndCondition || false;

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
    const player = this.getCurrentPlayer();
    const vp = player.calculateVictoryPoints();
    
    console.log('Checking game end conditions:', {
      currentVP: vp,
      neededVP: this.victoryPointsToWin,
      provincesLeft: this.supply.get('Province')?.length || 0,
      useProvinceEndCondition: this.useProvinceEndCondition,
      useSupplyPileEndCondition: this.useSupplyPileEndCondition,
      currentTurn: this.turnNumber,
      maxTurns: this.maxTurns
    });

    // Check if max turns reached (loss condition)
    if (this.maxTurns && this.turnNumber > this.maxTurns) {
      console.log('Game end: Maximum turns reached!');
      this.gameEnded = true;
      this.emit('gameEnded', { 
        reason: 'Maximum turns reached!',
        finalScore: vp,
        isLoss: true
      });
      return true;
    }

    // Check if player has reached victory points threshold (win condition)
    if (this.victoryPointsToWin && vp >= this.victoryPointsToWin) {
      console.log('Game end: Victory points threshold reached!');
      this.gameEnded = true;
      this.emit('gameEnded', { 
        reason: 'Victory points threshold reached!',
        finalScore: vp,
        isLoss: false
      });
      return true;
    }

    // Check if Province pile is empty (if enabled) (win condition)
    if (this.useProvinceEndCondition && this.supply.get('Province')?.length === 0) {
      console.log('Game end: Province pile is empty!');
      this.gameEnded = true;
      this.emit('gameEnded', { 
        reason: 'Province pile is empty!',
        finalScore: vp,
        isLoss: false
      });
      return true;
    }

    // Check if any three supply piles are empty (if enabled) (win condition)
    if (this.useSupplyPileEndCondition) {
      const emptyPiles = Array.from(this.supply.values())
        .filter(pile => pile.length === 0).length;
      
      if (emptyPiles >= 3) {
        console.log('Game end: Three or more supply piles are empty!');
        this.gameEnded = true;
        this.emit('gameEnded', { 
          reason: 'Three or more supply piles are empty!',
          finalScore: vp,
          isLoss: false
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Updates victory points for a player and triggers UI update
   * @param {Player} player
   * @param {number} points
   */
  updateVictoryPoints(player, points) {
    if (this.gameEnded) return; // Don't update if game is over
    
    console.log('Updating victory points:', {
      player: player.name,
      oldPoints: player.state.victoryPoints,
      newPoints: points,
      neededToWin: this.victoryPointsToWin,
      provincesLeft: this.supply.get('Province')?.length || 0
    });
    
    player.state.victoryPoints = points;
    this.emit('victoryPointsUpdated', { player, points });
    
    // Check if game should end after updating points
    const shouldEnd = this.checkGameEnd();
    
    if (shouldEnd) {
      console.log('Game should end - emitting gameEnded event');
      this.gameEnded = true;
      let reason = 'Game Over!';
      if (this.victoryPointsToWin && points >= this.victoryPointsToWin) {
        reason = 'Victory points threshold reached!';
      } else if (this.useProvinceEndCondition && this.supply.get('Province')?.length === 0) {
        reason = 'Province pile is empty!';
      } else if (this.useSupplyPileEndCondition) {
        const emptyPiles = Array.from(this.supply.values())
          .filter(pile => pile.length === 0).length;
        if (emptyPiles >= 3) {
          reason = 'Three or more supply piles are empty!';
        }
      }
      this.emit('gameEnded', { reason, finalScore: points });
    }
  }
} 