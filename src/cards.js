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
    village: { name: 'Village ✅', type: 'Action', cost: 3, description: 'Draw 1 card, +2 Actions' },
    market: { name: 'Market', type: 'Action', cost: 5, description: 'Draw 1 card, +1 Action, +1 Buy, +1 Gold' },
    cellar: {
      name: 'Cellar ✅',
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
      name: 'Library ⚫️',
      type: 'Action',
      cost: 5,
      description: 'Draw until you have 7 cards in hand. You may set aside Action cards.'
    },
    laboratory: {
      name: 'Laboratory',
      type: 'Action',
      cost: 5,
      description: '+2 Cards, +1 Action'
    },
    chapel: {name: "Chapel ✅", type: "Action", cost: 2, description: "Trash up to 4 cards from your hand."},
    throneRoom: {name: "Throne Room ⚫️", type: "Action", cost: 4, description: "Choose an Action card in your hand. Play it twice."},
    workshop: {name: "Workshop ✅", type: "Action", cost: 3, description: "Gain a card costing up to 4 coins."},
    woodcutter: {name: "Woodcutter", type: "Action", cost: 3, description: "+1 Buy, +2 coins."},
    vassal: {name: "Vassal", type: "Action", cost: 3, description: "+2 coins, reveal top card. If Action, play it."},
    remodel: {name: "Remodel ⚫️", type: "Action", cost: 4, description: "Trash a card from your hand. Gain a card costing up to 2 more."},
    mine: {name: "Mine ⚫️", type: "Action", cost: 5, description: "Trash a Treasure from your hand. Gain a Treasure costing up to 3 more."},
    moneylender: {name: "Moneylender ⚫️", type: "Action", cost: 4, description: "Trash a Copper from your hand for +3 coins."},
    feast: {name: "Feast ⚫️", type: "Action", cost: 4, description: "Trash this card. Gain a card costing up to 5 coins."},
    councilRoom: {name: "Council Room", type: "Action", cost: 5, description: "+4 Cards, +1 Buy."},
    adventurer: {name: "Adventurer ⚫️", type: "Action", cost: 6, description: "Reveal cards until you reveal 2 Treasures. Add them to hand."},
    gardens: {name: "Gardens ⚫️", type: "Action", cost: 4, description: "Worth 1 VP for every 10 cards in your deck (rounded down)."},
    treasury: {name: "Treasury ⚫️", type: "Action", cost: 5, description: "+1 Card, +1 Action, +1 Coin, when you buy it, you may put it on top of your deck."},
    greatHall: {name: "Great Hall", type: "Action-Victory", cost: 3, points: 1, description: "+1 Card, +1 Action, worth 1 VP."},
    masquerade: {name: "Masquerade", type: "Action", cost: 3, description: "Draw 2 cards. Keep one, discard the other."},
    harbinger: {name: "Harbinger", type: "Action", cost: 3, description: "+1 Card, +1 Action, look through your discard pile and put a card on top of your deck."},

  }    
  