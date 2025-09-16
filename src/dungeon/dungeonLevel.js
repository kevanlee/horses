export class DungeonLevel {
  constructor(levelNumber, winCondition, marketSupply) {
    this.levelNumber = levelNumber;
    this.winCondition = winCondition;
    this.marketSupply = marketSupply;
    this.maxTurns = this.calculateMaxTurns();
  }

  // Calculate max turns based on level difficulty
  calculateMaxTurns() {
    // Simple scaling: higher levels get more turns
    return Math.min(15, 8 + Math.floor(this.levelNumber / 2));
  }

  // Check if win condition is met
  checkWinCondition(gameEngine) {
    console.log(`Checking win condition: ${this.winCondition.type}`);
    console.log(`Target: ${this.winCondition.target}`);
    
    switch (this.winCondition.type) {
      case 'victory_points':
        const vpResult = gameEngine.player.victoryPoints >= this.winCondition.target;
        console.log(`Victory points: ${gameEngine.player.victoryPoints} >= ${this.winCondition.target} = ${vpResult}`);
        return vpResult;
      
      case 'gold_accumulation':
        const goldResult = gameEngine.calculateAvailableGold() >= this.winCondition.target;
        console.log(`Gold: ${gameEngine.calculateAvailableGold()} >= ${this.winCondition.target} = ${goldResult}`);
        return goldResult;
      
      case 'turn_limit':
        const turnResult = gameEngine.turnNumber <= this.winCondition.maxTurns;
        console.log(`Turns: ${gameEngine.turnNumber} <= ${this.winCondition.maxTurns} = ${turnResult}`);
        return turnResult;
      
      case 'card_collection':
        const cardResult = this.checkCardCollection(gameEngine);
        console.log(`Card collection result: ${cardResult}`);
        return cardResult;
      
      default:
        console.log('Unknown win condition type:', this.winCondition.type);
        return false;
    }
  }

  // Check card collection win condition
  checkCardCollection(gameEngine) {
    const allCards = [
      ...gameEngine.player.hand,
      ...gameEngine.player.deck,
      ...gameEngine.player.discard,
      ...gameEngine.player.playArea
    ];
    
    const uniqueCards = new Set(allCards.map(card => card.name));
    return uniqueCards.size >= this.winCondition.target;
  }

  // Get win condition description for UI
  getWinConditionDescription() {
    switch (this.winCondition.type) {
      case 'victory_points':
        return `Reach ${this.winCondition.target} Victory Points`;
      
      case 'gold_accumulation':
        return `Accumulate ${this.winCondition.target} Gold`;
      
      case 'turn_limit':
        return `Survive ${this.winCondition.maxTurns} turns`;
      
      case 'card_collection':
        return `Collect ${this.winCondition.target} different card types`;
      
      default:
        return 'Complete the level';
    }
  }
}
