import { cards } from '../cards.js';

export class MarketGenerator {
  static generate(levelNumber) {
    // Start with basic cards that are always available
    const baseCards = [
      { card: cards.copper, count: 46 },
      { card: cards.silver, count: 40 },
      { card: cards.gold, count: 30 },
      { card: cards.estate, count: 8 },
      { card: cards.duchy, count: 8 },
      { card: cards.province, count: 8 }
    ];

    // Get random action cards based on level
    const actionCards = this.getRandomActionCards(levelNumber);
    
    return [...baseCards, ...actionCards];
  }

  static getRandomActionCards(levelNumber) {
    const allActionCards = [
      cards.smithy, cards.village, cards.market, cards.cellar,
      cards.festival, cards.library, cards.laboratory, cards.chapel,
      cards.throneRoom, cards.workshop, cards.woodcutter, cards.vassal,
      cards.remodel, cards.mine, cards.moneylender, cards.feast,
      cards.councilRoom, cards.adventurer, cards.gardens, cards.treasury,
      cards.greatHall, cards.masquerade, cards.harbinger
    ];

    // Always exactly 10 action cards per level
    const numActionCards = 10;
    
    // Shuffle and pick random cards
    const shuffled = [...allActionCards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, numActionCards);
    
    // Create market supply entries
    return selectedCards.map(card => ({
      card: card,
      count: Math.max(4, 10 - Math.floor(levelNumber / 3)) // Fewer cards available at higher levels
    }));
  }
}
