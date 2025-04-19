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
    smithy: {
      name: 'Smithy',
      type: 'Action',
      cost: 4,
      description: '+3 Cards'
    },
    village: {
      name: 'Village',
      type: 'Action',
      cost: 3,
      description: '+1 Card, +2 Actions'
    },
    market: {
      name: 'Market',
      type: 'Action',
      cost: 5,
      description: '+1 Card, +1 Action, +1 Buy, +1 Gold'
    }
  };
  