// === GAME STATE MANAGEMENT ===

// Game phases
export const GamePhase = {
  SETUP: 'setup',
  DEALING: 'dealing',
  ACTION: 'action',
  BUY: 'buy',
  CLEANUP: 'cleanup',
  GAME_OVER: 'game_over'
};

// Card types
export const CardType = {
  TREASURE: 'treasure',
  VICTORY: 'victory',
  ACTION: 'action',
  ACTION_TREASURE: 'action-treasure',
  ACTION_VICTORY: 'action-victory',
};

// Player state
export class Player {
  constructor(name, startingDeck = []) {
    this.name = name;
    this.deck = [...startingDeck];
    this.hand = [];
    this.discard = [];
    this.playArea = [];
    this.actions = 1;
    this.buys = 1;
    this.money = 0;
    this.victoryPoints = 0;
    this.turnCount = 0;
  }

  // Draw cards from deck to hand
  drawCards(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        this.shuffleDiscardIntoDeck();
        if (this.deck.length === 0) return; // No cards to draw
      }
      this.hand.push(this.deck.pop());
    }
  }

  // Shuffle discard pile into deck
  shuffleDiscardIntoDeck() {
    this.deck = [...this.discard];
    this.discard = [];
    this.shuffleDeck();
  }

  // Shuffle deck
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Get deck size
  getDeckSize() {
    return this.deck.length;
  }

  // Get discard size
  getDiscardSize() {
    return this.discard.length;
  }

  // Get total cards in deck
  getTotalCards() {
    return this.deck.length + this.hand.length + this.discard.length + this.playArea.length;
  }

  // Calculate victory points
  calculateVictoryPoints() {
    let points = 0;
    const allCards = [...this.deck, ...this.hand, ...this.discard, ...this.playArea];
    
    for (const card of allCards) {
      if (card.points) {
        points += card.points;
      }
      // Special victory point calculations (like Gardens)
      if (card.specialVP) {
        points += card.specialVP(this);
      }
    }
    
    return points;
  }
}

// Supply pile management
export class SupplyPile {
  constructor(card, count = 10) {
    this.card = card;
    this.count = count;
    this.originalCount = count;
  }

  // Take a card from the pile
  takeCard() {
    if (this.count > 0) {
      this.count--;
      return { ...this.card };
    }
    return null;
  }

  // Check if pile is empty
  isEmpty() {
    return this.count === 0;
  }

  // Get remaining count
  getRemaining() {
    return this.count;
  }
}

// Game end conditions configuration
export class GameEndConditions {
  constructor(options = {}) {
    // Victory Points: Game ends when player reaches this VP total
    this.victoryPointsToWin = options.victoryPointsToWin || null;
    
    // Total Turns: Game ends after this many turns
    this.maxTurns = options.maxTurns || null;
    
    // Cards in Hand: Game ends when player has this many cards in hand
    this.cardsInHandToWin = options.cardsInHandToWin || null;
    
    // Money in Hand: Game ends when player has this much money
    this.moneyInHandToWin = options.moneyInHandToWin || null;
    
    // Time Limit: Game ends after this many seconds (in milliseconds)
    this.timeLimit = options.timeLimit || null;
    this.gameStartTime = null; // Will be set when game starts
    
    // Custom end conditions (for future extensibility)
    this.customEndConditions = options.customEndConditions || [];
  }

  // Set the game start time (called when game begins)
  setGameStartTime() {
    this.gameStartTime = Date.now();
  }

  // Get elapsed time in milliseconds
  getElapsedTime() {
    if (!this.gameStartTime) return 0;
    return Date.now() - this.gameStartTime;
  }

  // Check if a custom end condition is met
  checkCustomConditions(gameState) {
    for (const condition of this.customEndConditions) {
      if (typeof condition === 'function' && condition(gameState)) {
        return true;
      }
    }
    return false;
  }

  // Get a description of the current end conditions
  getDescription() {
    const conditions = [];
    
    if (this.victoryPointsToWin !== null) {
      conditions.push(`Reach ${this.victoryPointsToWin} victory points`);
    }
    if (this.maxTurns !== null) {
      conditions.push(`Complete ${this.maxTurns} turns`);
    }
    if (this.cardsInHandToWin !== null) {
      conditions.push(`Have ${this.cardsInHandToWin} cards in hand`);
    }
    if (this.moneyInHandToWin !== null) {
      conditions.push(`Have ${this.moneyInHandToWin} money`);
    }
    if (this.timeLimit !== null) {
      const minutes = Math.floor(this.timeLimit / 60000);
      const seconds = Math.floor((this.timeLimit % 60000) / 1000);
      conditions.push(`Complete within ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    
    return conditions.length > 0 ? conditions.join(' OR ') : 'No specific win conditions set';
  }
}

// Main game state
export class GameState {
  constructor(player, supplyCards = [], endConditions = new GameEndConditions()) {
    this.player = player;
    this.phase = GamePhase.SETUP;
    this.turn = 1;
    this.supply = new Map();
    this.gameLog = [];
    this.gameOver = false;
    this.endConditions = endConditions;
    
    // Initialize supply
    this.initializeSupply(supplyCards);
  }

  // Get current player
  getCurrentPlayer() {
    return this.player;
  }

  // Initialize supply piles
  initializeSupply(supplyCards) {
    for (const card of supplyCards) {
      const pile = new SupplyPile(card, card.supplyCount || 10);
      this.supply.set(card.id, pile);
    }
  }

  // Start a new game
  startGame() {
    this.phase = GamePhase.DEALING;
    this.turn = 1;
    this.gameOver = false;
    this.gameLog = [];

    // Initialize player
    this.player.shuffleDeck();

    // Set game start time for time-based end conditions
    this.endConditions.setGameStartTime();

    this.logGameEvent('Game started');
    this.dealInitialHands();
  }

  // Deal initial hands
  dealInitialHands() {
    this.player.drawCards(5); // Draw starting hand
    
    this.logGameEvent('Initial hand dealt');
    this.phase = GamePhase.ACTION;
    this.startTurn();
  }

  // Deal cards to player (for card effects)
  dealCardsToPlayer(count) {
    this.player.drawCards(count);
    this.logGameEvent(`Draws ${count} card(s)`);
  }

  // Start a new turn
  startTurn() {
    const player = this.getCurrentPlayer();
    player.turnCount++;
    player.actions = 1;
    player.buys = 1;
    player.money = 0;
    player.playArea = [];
    this.phase = GamePhase.ACTION;

    this.logGameEvent(`Turn ${this.turn} begins`);
  }

  // End current turn
  endTurn() {
    const player = this.getCurrentPlayer();
    
    // Cleanup phase
    this.phase = GamePhase.CLEANUP;
    
    // Move all cards from hand and play area to discard
    player.discard.push(...player.hand, ...player.playArea);
    player.hand = [];
    player.playArea = [];
    
    // Draw new hand
    player.drawCards(5);
    
    this.logGameEvent(`Turn ${this.turn} ends`);
    
    // Move to next turn
    this.turn++;
    
    // Check for game end conditions
    this.checkGameEndConditions();
    
    if (!this.gameOver) {
      this.startTurn();
    }
  }

  // Play a card from hand
  playCard(cardIndex) {
    const player = this.getCurrentPlayer();
    
    if (this.phase !== GamePhase.ACTION) {
      throw new Error('Can only play cards during action phase');
    }
    
    if (player.actions <= 0) {
      throw new Error('No actions remaining');
    }
    
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      throw new Error('Invalid card index');
    }
    
    const card = player.hand[cardIndex];
    
    if (!card.type.includes('action')) {
      throw new Error('Can only play action cards');
    }
    
    // Remove card from hand and add to play area
    player.hand.splice(cardIndex, 1);
    player.playArea.push(card);
    
    // Reduce actions
    player.actions--;
    
    this.logGameEvent(`Plays ${card.name}`);
    
    // Execute card effects
    this.executeCardEffects(card, player);
    
    return card;
  }

  // Execute card effects
  executeCardEffects(card, player) {
    if (card.effects) {
      for (const effect of card.effects) {
        this.executeEffect(effect, player);
      }
    }
  }

  // Execute a single effect
  executeEffect(effect, player) {
    const [effectType, ...params] = effect.split(':');
    
    switch (effectType) {
      case 'draw':
        const drawCount = parseInt(params[0]) || 1;
        player.drawCards(drawCount);
        this.logGameEvent(`Draws ${drawCount} card(s)`);
        break;
        
      case 'actions':
        const actionCount = parseInt(params[0]) || 1;
        player.actions += actionCount;
        this.logGameEvent(`Gains ${actionCount} action(s)`);
        break;
        
      case 'buys':
        const buyCount = parseInt(params[0]) || 1;
        player.buys += buyCount;
        this.logGameEvent(`Gains ${buyCount} buy(s)`);
        break;
        
      case 'money':
        const moneyAmount = parseInt(params[0]) || 1;
        player.money += moneyAmount;
        this.logGameEvent(`Gains ${moneyAmount} money`);
        break;
        
      default:
        console.warn(`Unknown effect: ${effect}`);
    }
  }

  // Buy a card from supply
  buyCard(cardId) {
    const player = this.getCurrentPlayer();
    
    if (this.phase !== GamePhase.BUY) {
      throw new Error('Can only buy cards during buy phase');
    }
    
    if (player.buys <= 0) {
      throw new Error('No buys remaining');
    }
    
    const supplyPile = this.supply.get(cardId);
    if (!supplyPile || supplyPile.isEmpty()) {
      throw new Error('Card not available in supply');
    }
    
    const card = supplyPile.card;
    if (player.money < card.cost) {
      throw new Error('Not enough money to buy this card');
    }
    
    // Take card from supply and add to discard
    const boughtCard = supplyPile.takeCard();
    player.discard.push(boughtCard);
    
    // Spend money and reduce buys
    player.money -= card.cost;
    player.buys--;
    
    this.logGameEvent(`Buys ${card.name} for ${card.cost} money`);
    
    return boughtCard;
  }

  // Move to buy phase
  startBuyPhase() {
    if (this.phase !== GamePhase.ACTION) {
      throw new Error('Must be in action phase to start buy phase');
    }
    
    this.phase = GamePhase.BUY;
    this.logGameEvent(`Starts buy phase`);
  }

  // Check game end conditions
  checkGameEndConditions() {
    // Check victory points limit
    if (this.endConditions.victoryPointsToWin !== null) {
      const currentVP = this.player.calculateVictoryPoints();
      if (currentVP >= this.endConditions.victoryPointsToWin) {
        this.endGame('Victory points target reached!');
        return;
      }
    }

    // Check turn limit
    if (this.endConditions.maxTurns !== null && this.turn >= this.endConditions.maxTurns) {
      this.endGame('Maximum turns reached!');
      return;
    }

    // Check cards in hand limit
    if (this.endConditions.cardsInHandToWin !== null) {
      if (this.player.hand.length >= this.endConditions.cardsInHandToWin) {
        this.endGame('Cards in hand target reached!');
        return;
      }
    }

    // Check money in hand limit
    if (this.endConditions.moneyInHandToWin !== null) {
      if (this.player.money >= this.endConditions.moneyInHandToWin) {
        this.endGame('Money in hand target reached!');
        return;
      }
    }

    // Check time limit
    if (this.endConditions.timeLimit !== null) {
      const elapsedTime = this.endConditions.getElapsedTime();
      if (elapsedTime >= this.endConditions.timeLimit) {
        this.endGame('Time limit reached!');
        return;
      }
    }

    // Note: Traditional Dominion end conditions (Province empty, 3+ piles empty) 
    // are not included as they are not part of the five specified win conditions

    // Check custom end conditions
    if (this.endConditions.checkCustomConditions(this)) {
      this.endGame('Custom end condition met!');
      return;
    }
  }

  // End the game
  endGame(reason = 'Game ended') {
    this.gameOver = true;
    this.phase = GamePhase.GAME_OVER;
    
    // Calculate final score
    this.player.victoryPoints = this.player.calculateVictoryPoints();
    
    this.logGameEvent(`Game over! ${reason} Final score: ${this.player.victoryPoints} victory points`);
  }

  // Log game events
  logGameEvent(message) {
    const event = {
      turn: this.turn,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.gameLog.push(event);
    console.log(`[Turn ${this.turn}] ${message}`);
  }

  // Get game state for UI
  getGameState() {
    return {
      currentPlayer: this.getCurrentPlayer(),
      phase: this.phase,
      turn: this.turn,
      supply: Object.fromEntries(this.supply),
      gameLog: this.gameLog,
      gameOver: this.gameOver
    };
  }
}

// Game factory for creating new games
export class GameFactory {
  static createGame(supplyCards = [], endConditions = new GameEndConditions()) {
    // Create player with starting deck
    const startingDeck = [
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'copper', name: 'Copper', type: 'treasure', cost: 0, value: 1 },
      { id: 'estate', name: 'Estate', type: 'victory', cost: 2, points: 1 },
      { id: 'estate', name: 'Estate', type: 'victory', cost: 2, points: 1 },
      { id: 'estate', name: 'Estate', type: 'victory', cost: 2, points: 1 }
    ];
    const player = new Player('Player', startingDeck);
    
    return new GameState(player, supplyCards, endConditions);
  }

  // Create a game with default end conditions (no specific win conditions)
  static createDefaultGame(supplyCards = []) {
    const defaultEndConditions = new GameEndConditions({
      // No specific win conditions - game continues until player chooses to end
    });
    return this.createGame(supplyCards, defaultEndConditions);
  }

  // Create a game with custom victory point target
  static createVPGame(supplyCards = [], vpTarget = 30) {
    const vpEndConditions = new GameEndConditions({
      victoryPointsToWin: vpTarget
    });
    return this.createGame(supplyCards, vpEndConditions);
  }

  // Create a game with turn limit
  static createTurnLimitGame(supplyCards = [], maxTurns = 100) {
    const turnLimitEndConditions = new GameEndConditions({
      maxTurns: maxTurns
    });
    return this.createGame(supplyCards, turnLimitEndConditions);
  }

  // Create a game with cards in hand target
  static createCardsInHandGame(supplyCards = [], cardsTarget = 10) {
    const cardsEndConditions = new GameEndConditions({
      cardsInHandToWin: cardsTarget
    });
    return this.createGame(supplyCards, cardsEndConditions);
  }

  // Create a game with money in hand target
  static createMoneyInHandGame(supplyCards = [], moneyTarget = 15) {
    const moneyEndConditions = new GameEndConditions({
      moneyInHandToWin: moneyTarget
    });
    return this.createGame(supplyCards, moneyEndConditions);
  }

  // Create a game with time limit (in minutes)
  static createTimeLimitGame(supplyCards = [], timeLimitMinutes = 10) {
    const timeEndConditions = new GameEndConditions({
      timeLimit: timeLimitMinutes * 60 * 1000 // Convert minutes to milliseconds
    });
    return this.createGame(supplyCards, timeEndConditions);
  }
}
