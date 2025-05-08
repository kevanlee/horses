import { Smithy } from './actions/Smithy.js';
import { Village } from './actions/Village.js';
import { Cellar } from './actions/Cellar.js';
import { Remodel } from './actions/Remodel.js';
import { Market } from './actions/Market.js';
import { Festival } from './actions/Festival.js';
import { Laboratory } from './actions/Laboratory.js';
import { Woodcutter } from './actions/Woodcutter.js';
import { Chapel } from './actions/Chapel.js';
import { Workshop } from './actions/Workshop.js';
import { Masquerade } from './actions/Masquerade.js';
import { TreasureCard } from './TreasureCard.js';
import { VictoryCard } from './VictoryCard.js';
import { Vassal } from './actions/Vassal.js';
import { CouncilRoom } from './actions/CouncilRoom.js';
import { Mine } from './actions/Mine.js';
import { Moneylender } from './actions/Moneylender.js';
import { Feast } from './actions/Feast.js';
import { ThroneRoom } from './actions/ThroneRoom.js';
import { GreatHall } from './actions/GreatHall.js';
import { Treasury } from './actions/Treasury.js';
import { Harbinger } from './actions/Harbinger.js';
import { Library } from './actions/Library.js';
import { Adventurer } from './actions/Adventurer.js';
import { Gardens } from './actions/Gardens.js';

/**
 * Registry of all available cards in the game
 */
export class CardRegistry {
  constructor() {
    this.cards = new Map();
    this.initializeCards();
  }

  initializeCards() {
    // Basic Treasure cards
    this.registerCard(new TreasureCard({
      name: 'Copper',
      cost: 0,
      value: 1
    }));

    this.registerCard(new TreasureCard({
      name: 'Silver',
      cost: 3,
      value: 2
    }));

    this.registerCard(new TreasureCard({
      name: 'Gold',
      cost: 6,
      value: 3
    }));

    // Basic Victory cards
    this.registerCard(new VictoryCard({
      name: 'Estate',
      cost: 2,
      points: 1
    }));

    this.registerCard(new VictoryCard({
      name: 'Duchy',
      cost: 5,
      points: 3
    }));

    this.registerCard(new VictoryCard({
      name: 'Province',
      cost: 8,
      points: 6
    }));

    // Action cards
    this.registerCard(new Smithy());
    this.registerCard(new Village());
    this.registerCard(new Cellar());
    this.registerCard(new Remodel());
    this.registerCard(new Market());
    this.registerCard(new Festival());
    this.registerCard(new Laboratory());
    this.registerCard(new Woodcutter());
    this.registerCard(new Chapel());
    this.registerCard(new Workshop());
    this.registerCard(new Masquerade());
    this.registerCard(new Vassal());
    this.registerCard(new CouncilRoom());
    this.registerCard(new Mine());
    this.registerCard(new Moneylender());
    this.registerCard(new Feast());
    this.registerCard(new ThroneRoom());
    this.registerCard(new GreatHall());
    this.registerCard(new Treasury());
    this.registerCard(new Harbinger());
    this.registerCard(new Library());
    this.registerCard(new Adventurer());
    this.registerCard(new Gardens());
  }

  /**
   * @param {Card} card
   */
  registerCard(card) {
    this.cards.set(card.name, card);
  }

  /**
   * @param {string} name
   * @returns {Card}
   */
  getCard(name) {
    const card = this.cards.get(name);
    if (!card) {
      throw new Error(`Card ${name} not found in registry`);
    }
    return card;
  }

  /**
   * @returns {Card[]}
   */
  getAllCards() {
    return Array.from(this.cards.values());
  }

  /**
   * @param {string} type
   * @returns {Card[]}
   */
  getCardsByType(type) {
    return this.getAllCards().filter(card => card.type === type);
  }
} 