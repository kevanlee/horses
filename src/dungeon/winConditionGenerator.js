export class WinConditionGenerator {
  static generate(levelNumber) {
    const conditions = [
      'victory_points',
      'gold_accumulation', 
      'card_collection'
    ];
    
    // Pick a random condition type
    const conditionType = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Scale difficulty based on level
    const baseTarget = 5 + (levelNumber * 2);
    
    switch (conditionType) {
      case 'victory_points':
        return {
          type: 'victory_points',
          target: Math.min(25, baseTarget + Math.floor(Math.random() * 5))
        };
      
      case 'gold_accumulation':
        // Gold accumulation is much harder - need to get all gold in one hand
        return {
          type: 'gold_accumulation',
          target: Math.min(30, Math.max(8, baseTarget + Math.floor(Math.random() * 8)))
        };
      
      case 'card_collection':
        return {
          type: 'card_collection',
          target: Math.min(15, Math.max(3, baseTarget - 2))
        };
      
      default:
        return {
          type: 'victory_points',
          target: 10
        };
    }
  }
}
