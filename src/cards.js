export const cardTypes = {
    TREASURE: 'Treasure',
    VICTORY: 'Victory',
    ACTION: 'Action',
  };

  export const cards = {
    copper: { name: 'Copper', type: 'Treasure', cost: 0, value: 1 },
    silver: { name: 'Silver', type: 'Treasure', cost: 3, value: 2 },
    gold: { name: 'Gold', type: 'Treasure', cost: 6, value: 3 },
    estate: { name: 'Estate', type: 'Victory', cost: 2, points: 1 },
    duchy: { name: 'Duchy', type: 'Victory', cost: 5, points: 3 },
    province: { name: 'Province', type: 'Victory', cost: 8, points: 6 },
    smithy: { name: 'Smithy', type: 'Action', cost: 4, description: 'Draw 3 cards' },
    village: { name: 'Village', type: 'Action', cost: 3, description: 'Draw 1 card, +2 Actions' },
    market: { name: 'Market', type: 'Action', cost: 5, description: 'Draw 1 card, +1 Action, +1 Buy, +1 Gold' },
    cellar: {
      name: 'Cellar',
      type: 'Action',
      cost: 2,
      description: '+1 Action. Discard any number of cards, then draw that many.'
    },
    festival: {
      name: 'Festival',
      type: 'Action',
      cost: 5,
      description: '+2 Actions, +1 Buy, +2 Gold'
    },
    library: {
      name: 'Library',
      type: 'Action',
      cost: 5,
      description: 'Draw until you have 7 cards in hand. You may set aside Action cards.'
    },
    laboratory: {
      name: 'Laboratory',
      type: 'Action',
      cost: 5,
      description: '+2 Cards, +1 Action'
    }
  }    
  