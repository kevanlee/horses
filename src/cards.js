// === CARD DEFINITIONS ===

// Card types
export const CardType = {
  TREASURE: 'treasure',
  VICTORY: 'victory',
  ACTION: 'action',
  ACTION_TREASURE: 'action-treasure',
  ACTION_VICTORY: 'action-victory',
  CURSE: 'curse'
};

// Base card definitions
export const baseCards = {
  // Treasure Cards
  copper: {
    id: 'copper',
    name: 'Copper',
    type: CardType.TREASURE,
    cost: 0,
    value: 1,
    supplyCount: 60,
    description: 'Worth 1 money'
  },
  
  silver: {
    id: 'silver',
    name: 'Silver',
    type: CardType.TREASURE,
    cost: 3,
    value: 2,
    supplyCount: 40,
    description: 'Worth 2 money'
  },
  
  gold: {
    id: 'gold',
    name: 'Gold',
    type: CardType.TREASURE,
    cost: 6,
    value: 3,
    supplyCount: 30,
    description: 'Worth 3 money'
  },

  // Victory Cards
  estate: {
    id: 'estate',
    name: 'Estate',
    type: CardType.VICTORY,
    cost: 2,
    points: 1,
    supplyCount: 12,
    description: 'Worth 1 victory point'
  },
  
  duchy: {
    id: 'duchy',
    name: 'Duchy',
    type: CardType.VICTORY,
    cost: 5,
    points: 3,
    supplyCount: 12,
    description: 'Worth 3 victory points'
  },
  
  province: {
    id: 'province',
    name: 'Province',
    type: CardType.VICTORY,
    cost: 8,
    points: 6,
    supplyCount: 12,
    description: 'Worth 6 victory points'
  },

  // Curse Cards
  curse: {
    id: 'curse',
    name: 'Curse',
    type: CardType.CURSE,
    cost: 0,
    points: -1,
    supplyCount: 10,
    description: 'Worth -1 victory point'
  }
};

// Action card definitions
export const actionCards = {
  // Basic Actions
  smithy: {
    id: 'smithy',
    name: 'Smithy',
    type: CardType.ACTION,
    cost: 4,
    effects: ['draw:3'],
    supplyCount: 10,
    description: 'Draw 3 cards'
  },
  
  village: {
    id: 'village',
    name: 'Village',
    type: CardType.ACTION,
    cost: 3,
    effects: ['draw:1', 'actions:2'],
    supplyCount: 10,
    description: 'Draw 1 card, +2 Actions'
  },
  
  market: {
    id: 'market',
    name: 'Market',
    type: CardType.ACTION,
    cost: 5,
    effects: ['draw:1', 'actions:1', 'buys:1', 'money:1'],
    supplyCount: 10,
    description: 'Draw 1 card, +1 Action, +1 Buy, +1 Gold'
  },
  
  cellar: {
    id: 'cellar',
    name: 'Cellar',
    type: CardType.ACTION,
    cost: 2,
    effects: ['actions:1'],
    supplyCount: 10,
    description: '+1 Action. Discard any number of cards, then draw that many.'
  },
  
  festival: {
    id: 'festival',
    name: 'Festival',
    type: CardType.ACTION,
    cost: 5,
    effects: ['actions:2', 'buys:1', 'money:2'],
    supplyCount: 10,
    description: '+2 Actions, +1 Buy, +2 Gold'
  },
  
  laboratory: {
    id: 'laboratory',
    name: 'Laboratory',
    type: CardType.ACTION,
    cost: 5,
    effects: ['draw:2', 'actions:1'],
    supplyCount: 10,
    description: '+2 Cards, +1 Action'
  },
  
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    type: CardType.ACTION,
    cost: 3,
    effects: [],
    supplyCount: 10,
    description: 'Gain a card costing up to 4 coins.'
  },
  
  woodcutter: {
    id: 'woodcutter',
    name: 'Woodcutter',
    type: CardType.ACTION,
    cost: 3,
    effects: ['buys:1', 'money:2'],
    supplyCount: 10,
    description: '+1 Buy, +2 coins.'
  },
  
  vassal: {
    id: 'vassal',
    name: 'Vassal',
    type: CardType.ACTION,
    cost: 3,
    effects: ['money:2'],
    supplyCount: 10,
    description: '+2 coins, reveal top card. If Action, play it.'
  },
  
  councilRoom: {
    id: 'councilRoom',
    name: 'Council Room',
    type: CardType.ACTION,
    cost: 5,
    effects: ['draw:4', 'buys:1'],
    supplyCount: 10,
    description: '+4 Cards, +1 Buy.'
  },
  
  masquerade: {
    id: 'masquerade',
    name: 'Masquerade',
    type: CardType.ACTION,
    cost: 3,
    effects: ['draw:2'],
    supplyCount: 10,
    description: 'Draw 2 cards. Keep one, discard the other.'
  },
  
  harbinger: {
    id: 'harbinger',
    name: 'Harbinger',
    type: CardType.ACTION,
    cost: 3,
    effects: ['draw:1', 'actions:1'],
    supplyCount: 10,
    description: '+1 Card, +1 Action, look through your discard pile and put a card on top of your deck.'
  },

  // Complex Actions (require special handling)
  chapel: {
    id: 'chapel',
    name: 'Chapel',
    type: CardType.ACTION,
    cost: 2,
    effects: [],
    supplyCount: 10,
    description: 'Trash up to 4 cards from your hand.',
    requiresTarget: true,
    targetType: 'hand',
    maxTargets: 4
  },
  
  throneRoom: {
    id: 'throneRoom',
    name: 'Throne Room',
    type: CardType.ACTION,
    cost: 4,
    effects: [],
    supplyCount: 10,
    description: 'Choose an Action card in your hand. Play it twice.',
    requiresTarget: true,
    targetType: 'hand',
    maxTargets: 1,
    targetFilter: (card) => card.type.includes('action')
  },
  
  remodel: {
    id: 'remodel',
    name: 'Remodel',
    type: CardType.ACTION,
    cost: 4,
    effects: [],
    supplyCount: 10,
    description: 'Trash a card from your hand. Gain a card costing up to 2 more.',
    requiresTarget: true,
    targetType: 'hand',
    maxTargets: 1
  },
  
  mine: {
    id: 'mine',
    name: 'Mine',
    type: CardType.ACTION,
    cost: 5,
    effects: [],
    supplyCount: 10,
    description: 'Trash a Treasure from your hand. Gain a Treasure costing up to 3 more.',
    requiresTarget: true,
    targetType: 'hand',
    maxTargets: 1,
    targetFilter: (card) => card.type === CardType.TREASURE
  },
  
  moneylender: {
    id: 'moneylender',
    name: 'Moneylender',
    type: CardType.ACTION,
    cost: 4,
    effects: [],
    supplyCount: 10,
    description: 'Trash a Copper from your hand for +3 coins.',
    requiresTarget: true,
    targetType: 'hand',
    maxTargets: 1,
    targetFilter: (card) => card.id === 'copper'
  },
  
  feast: {
    id: 'feast',
    name: 'Feast',
    type: CardType.ACTION,
    cost: 4,
    effects: [],
    supplyCount: 10,
    description: 'Trash this card. Gain a card costing up to 5 coins.',
    requiresTarget: true,
    targetType: 'self',
    maxTargets: 1
  },
  
  library: {
    id: 'library',
    name: 'Library',
    type: CardType.ACTION,
    cost: 5,
    effects: [],
    supplyCount: 10,
    description: 'Draw until you have 7 cards in hand. You may set aside Action cards.',
    requiresTarget: true,
    targetType: 'deck',
    maxTargets: -1 // Unlimited
  },
  
  adventurer: {
    id: 'adventurer',
    name: 'Adventurer',
    type: CardType.ACTION,
    cost: 6,
    effects: [],
    supplyCount: 10,
    description: 'Reveal cards until you reveal 2 Treasures. Add them to hand.',
    requiresTarget: true,
    targetType: 'deck',
    maxTargets: 2,
    targetFilter: (card) => card.type === CardType.TREASURE
  },

  // Action-Victory Cards
  gardens: {
    id: 'gardens',
    name: 'Gardens',
    type: CardType.ACTION_VICTORY,
    cost: 4,
    effects: ['money:1'],
    supplyCount: 10,
    description: '+1 Coin. Worth 1 VP per 10 cards in your deck.',
    specialVP: (player) => Math.floor(player.getTotalCards() / 10)
  },
  
  greatHall: {
    id: 'greatHall',
    name: 'Great Hall',
    type: CardType.ACTION_VICTORY,
    cost: 3,
    points: 1,
    effects: ['draw:1', 'actions:1'],
    supplyCount: 10,
    description: '+1 Card, +1 Action, worth 1 VP.'
  },
  
  treasury: {
    id: 'treasury',
    name: 'Treasury',
    type: CardType.ACTION,
    cost: 5,
    effects: ['draw:1', 'actions:1', 'money:1'],
    supplyCount: 10,
    description: '+1 Card, +1 Action, +1 Coin, when you buy it, you may put it on top of your deck.'
  }
};

// Combine all cards
export const allCards = {
  ...baseCards,
  ...actionCards
};

// Card registry for easy lookup
export class CardRegistry {
  constructor() {
    this.cards = new Map();
    this.loadCards();
  }

  loadCards() {
    // Load base cards
    for (const [id, card] of Object.entries(baseCards)) {
      this.cards.set(id, card);
    }
    
    // Load action cards
    for (const [id, card] of Object.entries(actionCards)) {
      this.cards.set(id, card);
    }
  }

  getCard(id) {
    return this.cards.get(id);
  }

  getAllCards() {
    return Array.from(this.cards.values());
  }

  getActionCards() {
    return Array.from(this.cards.values()).filter(card => 
      card.type.includes('action') && card.type !== CardType.ACTION_VICTORY
    );
  }

  getTreasureCards() {
    return Array.from(this.cards.values()).filter(card => 
      card.type === CardType.TREASURE
    );
  }

  getVictoryCards() {
    return Array.from(this.cards.values()).filter(card => 
      card.type === CardType.VICTORY || card.type === CardType.ACTION_VICTORY
    );
  }

  getCardsByCost(maxCost) {
    return Array.from(this.cards.values()).filter(card => 
      card.cost <= maxCost
    );
  }
}

// Default supply setup
export const defaultSupply = [
  baseCards.copper,
  baseCards.silver,
  baseCards.gold,
  baseCards.estate,
  baseCards.duchy,
  baseCards.province,
  actionCards.smithy,
  actionCards.village,
  actionCards.market,
  actionCards.cellar
];

// Export card registry instance
export const cardRegistry = new CardRegistry();    
  