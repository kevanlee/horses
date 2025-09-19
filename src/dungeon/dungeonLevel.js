export class DungeonLevel {
  constructor(levelNumber, winCondition, marketSupply, challengeName = null, challengeId = null, maxTurns = null) {
    this.levelNumber = levelNumber;
    this.winCondition = winCondition;
    this.marketSupply = marketSupply;
    this.challengeName = challengeName;     // NEW: Challenge name
    this.challengeId = challengeId;         // NEW: Challenge ID
    this.maxTurns = maxTurns || this.calculateMaxTurns(); // NEW: Use provided maxTurns or calculate
  }

  // Calculate max turns - fallback for when no maxTurns provided
  calculateMaxTurns() {
    // If win condition has maxTurns defined (for turn_limit challenges), use that
    if (this.winCondition.maxTurns) {
      return this.winCondition.maxTurns;
    }
    // Otherwise use the old formula as fallback
    return Math.min(15, 8 + Math.floor(this.levelNumber / 2));
  }

  // Check if win condition is met
  checkWinCondition(gameEngine) {
    switch (this.winCondition.type) {
      case 'victory_points':
        const vpResult = gameEngine.player.victoryPoints >= this.winCondition.target;
        return vpResult;

      case 'gold_accumulation':
        const goldResult = gameEngine.calculateAvailableGold() >= this.winCondition.target;
        return goldResult;

      case 'turn_limit':
        const turnResult = gameEngine.turnNumber <= this.winCondition.maxTurns;
        return turnResult;

      case 'card_collection':
        const cardResult = this.checkCardCollection(gameEngine);
        return cardResult;

      default:
        return false;
    }
  }

  // Check card collection win condition
  checkCardCollection(gameEngine) {
    const totalCards = gameEngine.player.hand.length + 
                      gameEngine.player.deck.length + 
                      gameEngine.player.discard.length + 
                      gameEngine.player.playArea.length;
    
    return totalCards >= this.winCondition.target;
  }

  // Get win condition description for UI
  getWinConditionDescription() {
    let primaryGoal;
    switch (this.winCondition.type) {
      case 'victory_points':
        primaryGoal = `Reach ${this.winCondition.target} Victory Points`;
        break;
      
      case 'gold_accumulation':
        primaryGoal = `Accumulate ${this.winCondition.target} Gold`;
        break;
      
      case 'turn_limit':
        primaryGoal = `Survive ${this.winCondition.maxTurns} turns`;
        break;
      
      case 'card_collection':
        primaryGoal = `Accumulate ${this.winCondition.target} total cards`;
        break;
      
      default:
        primaryGoal = 'Complete the level';
    }
    
    // Always show both the primary goal and turn limit (unless the primary goal IS the turn limit)
    if (this.winCondition.type === 'turn_limit') {
      return primaryGoal;
    } else {
      return `${primaryGoal} within ${this.maxTurns} turns`;
    }
  }
}
