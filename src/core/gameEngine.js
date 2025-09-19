import { GAME_CONFIG, GAME_PHASES } from '../constants.js';
import { cards } from '../cards.js';

export class GameEngine {
  constructor() {
    this.player = this.createPlayer();
    this.turnNumber = 1;
    this.gameLog = [];
    this.currentPhase = GAME_PHASES.ACTION_PHASE;
  }

  createPlayer() {
    return {
      deck: [
        ...Array(GAME_CONFIG.INITIAL_COPPER_COUNT).fill(cards.copper),
        ...Array(GAME_CONFIG.INITIAL_ESTATE_COUNT).fill(cards.estate)
      ],
      hand: [],
      discard: [],
      playArea: [], // NEW: Where played action cards go during turn
      drawPile: [],
      trash: [],
      gold: 0,
      actions: GAME_CONFIG.INITIAL_ACTIONS,
      buys: GAME_CONFIG.INITIAL_BUYS,
      bonusGold: 0,
      victoryPoints: 0
    };
  }

  logMessage(msg) {
    this.gameLog.push(msg);
    return msg;
  }

  shuffle(array) {
    const result = Array.isArray(array) ? [...array] : [];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  drawCards(player, count = GAME_CONFIG.INITIAL_HAND_SIZE) {
    for (let i = 0; i < count; i++) {
      if (player.deck.length === 0) {
        if (player.discard.length > 0) {
          player.deck = this.shuffle([...player.discard]);
          player.discard = [];
        } else {
          break; // No cards to draw
        }
      }
      if (player.deck.length > 0) {
        player.hand.push(player.deck.pop());
      }
    }
  }

  startNewGame() {
    this.player = this.createPlayer();
    // Shuffle the initial deck for randomized starting hands
    this.player.deck = this.shuffle(this.player.deck);
    this.turnNumber = 1;
    this.gameLog = [];
    this.currentPhase = GAME_PHASES.ACTION_PHASE;
    this.drawCards(this.player, GAME_CONFIG.INITIAL_HAND_SIZE);
    this.updateVictoryPoints();
    this.logMessage("Game started!");
  }

  nextTurn() {
    this.logMessage("=== Starting New Turn ===");
    
    // Reset everything
    this.player.actions = GAME_CONFIG.INITIAL_ACTIONS;
    this.player.buys = GAME_CONFIG.INITIAL_BUYS;
    this.player.bonusGold = 0;

    // Move hand and play area to discard
    this.player.discard.push(...this.player.hand, ...this.player.playArea);
    this.player.hand = [];
    this.player.playArea = [];

    // Draw new hand
    this.drawCards(this.player, GAME_CONFIG.INITIAL_HAND_SIZE);
    
    // Start new turn with Action Phase
    this.turnNumber++;
    this.currentPhase = GAME_PHASES.ACTION_PHASE;
    this.logMessage(`You started turn ${this.turnNumber} in Action Phase.`);
    
    this.updateVictoryPoints();
    
  }

  // Phase progression methods
  nextPhase() {
    switch (this.currentPhase) {
      case GAME_PHASES.ACTION_PHASE:
        this.currentPhase = GAME_PHASES.BUY_PHASE;
        this.logMessage("Moving to Buy Phase.");
        // Scroll to buy phase anchor with a small delay to ensure UI updates
        setTimeout(() => {
          const anchor = document.getElementById('buy-phase-anchor');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        break;
      case GAME_PHASES.BUY_PHASE:
        // Auto-advance to cleanup and then new turn
        this.autoCleanupAndNewTurn();
        break;
      case GAME_PHASES.CLEANUP_PHASE:
        // This shouldn't happen anymore, but just in case
        this.autoCleanupAndNewTurn();
        break;
    }
  }

  // Auto-cleanup and new turn (happens in background)
  autoCleanupAndNewTurn() {
    this.logMessage("Cleaning up and starting new turn...");
    // Move play area to discard
    this.player.discard.push(...this.player.playArea);
    this.player.playArea = [];
    // Start new turn (which will draw new hand)
    this.nextTurn();
  }


  updateVictoryPoints() {
    const allCards = [...this.player.hand, ...this.player.deck, ...this.player.discard, ...this.player.playArea];
    const victoryCards = allCards.filter(card => card.type.includes('Victory'));
    
    let victoryPoints = 0;
    
    victoryCards.forEach(card => {
      if (card.name === 'Gardens') {
        // Gardens: 1 VP per 10 cards (rounded down)
        const totalCards = allCards.length;
        victoryPoints += Math.floor(totalCards / 10);
      } else {
        // Regular victory cards
        victoryPoints += card.points || 0;
      }
    });

    this.player.victoryPoints = victoryPoints;
    return victoryPoints;
  }

  getTotalCardCount() {
    return this.player.hand.length + 
           this.player.deck.length + 
           this.player.discard.length + 
           this.player.playArea.length;
  }

  calculateAvailableGold() {
    const treasureGold = this.player.hand
      .filter(card => card.type === 'Treasure')
      .reduce((sum, card) => sum + card.value, 0);
    
    return treasureGold + this.player.bonusGold;
  }

  canBuyCard(cardCost) {
    return this.player.buys > 0 && this.calculateAvailableGold() >= cardCost;
  }

  // Validation functions
  validatePurchase(cardCost) {
    if (this.player.buys <= 0) {
      return { valid: false, reason: "No buys remaining" };
    }
    
    if (this.calculateAvailableGold() < cardCost) {
      return { valid: false, reason: "Insufficient gold" };
    }
    
    return { valid: true };
  }

  validateCardAvailability(slot) {
    if (slot.count <= 0) {
      return { valid: false, reason: "Card is sold out" };
    }
    
    return { valid: true };
  }

  // Payment processing functions
  calculatePayment(cost) {
    const treasureCards = this.player.hand.filter(card => card.type === 'Treasure');
    const cardsToDiscard = [];
    let remainingCost = cost;

    for (const card of treasureCards) {
      if (remainingCost <= 0) break;
      
      remainingCost -= card.value;
      cardsToDiscard.push(card);
    }

    return { cardsToDiscard, remainingCost };
  }

  processPayment(cardsToDiscard, remainingCost) {
    // Remove treasure cards from hand
    cardsToDiscard.forEach(card => {
      const index = this.player.hand.indexOf(card);
      if (index !== -1) {
        this.player.hand.splice(index, 1);
        this.player.discard.push(card);
      }
    });

    // Subtract remaining cost from bonus gold
    if (remainingCost > 0) {
      this.player.bonusGold -= remainingCost;
    }

    // Only reset bonus gold if it was actually used
    if (remainingCost > 0) {
      this.player.bonusGold = 0;
    }
  }

  // Card acquisition functions
  acquireCard(card, marketSupply, cardIndex) {
    // Add purchased card to discard pile
    this.player.discard.push(card);
    
    // Reduce market supply
    marketSupply[cardIndex].count -= 1;
    
    // Reduce buys
    this.player.buys--;
  }

  // Main buyCard function - now much cleaner
  buyCard(cardIndex, marketSupply) {
    const slot = marketSupply[cardIndex];
    const cost = slot.card.cost;

    // Validate purchase
    const purchaseValidation = this.validatePurchase(cost);
    if (!purchaseValidation.valid) {
      return { success: false, message: purchaseValidation.reason };
    }

    // Validate card availability
    const availabilityValidation = this.validateCardAvailability(slot);
    if (!availabilityValidation.valid) {
      return { success: false, message: availabilityValidation.reason };
    }

    // Calculate payment
    const { cardsToDiscard, remainingCost } = this.calculatePayment(cost);

    // Process payment
    this.processPayment(cardsToDiscard, remainingCost);

    // Acquire the card
    this.acquireCard(slot.card, marketSupply, cardIndex);

    // Update game state
    this.updateVictoryPoints();
    
    return { 
      success: true, 
      message: `You bought a ${slot.card.name}.`,
      card: slot.card
    };
  }

  // Action card validation
  validateActionCardPlay() {
    if (this.player.actions <= 0) {
      return { valid: false, reason: "No actions remaining" };
    }
    
    if (this.currentPhase !== GAME_PHASES.ACTION_PHASE) {
      return { valid: false, reason: "Can only play action cards during Action Phase" };
    }
    
    return { valid: true };
  }

  // Action card processing - now uses play area
  processActionCard(card) {
    this.player.actions--;
    
    // Remove card from hand and place it in play area (not discard)
    const index = this.player.hand.indexOf(card);
    if (index !== -1) {
      this.player.hand.splice(index, 1);
      this.player.playArea.push(card); // NEW: Goes to play area instead of discard
    }
  }

  // Main playActionCard function - now much cleaner
  playActionCard(card) {
    const validation = this.validateActionCardPlay();
    if (!validation.valid) {
      return { success: false, message: validation.reason };
    }

    this.processActionCard(card);
    return { success: true, message: `You played ${card.name}.` };
  }

  shuffleDiscardIntoDeck() {
    if (this.player.discard.length === 0) return false;

    this.player.deck = [...this.player.deck, ...this.player.discard];
    this.player.discard = [];
    this.player.deck = this.shuffle(this.player.deck);
    
    this.logMessage("Shuffled discard pile into deck.");
    return true;
  }
}
