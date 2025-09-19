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

    // Get random action cards (level number no longer affects difficulty, just for randomness seed)
    const actionCards = this.getRandomActionCards();
    
    return [...baseCards, ...actionCards];
  }

  static getRandomActionCards() {
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
    const shuffled = [...allActionCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedCards = shuffled.slice(0, numActionCards);
    
    // Create market supply entries
    return selectedCards.map(card => ({
      card: card,
      count: 10 // Consistent 10 cards available at all levels
    }));
  }
}
