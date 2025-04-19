export const cardTypes = {
    TREASURE: 'Treasure',
    VICTORY: 'Victory',
    ACTION: 'Action',
  };
  
  export const cards = {
    copper: {
      name: 'Copper',
      type: cardTypes.TREASURE,
      value: 1,
      cost: 0,
    },
    estate: {
      name: 'Estate',
      type: cardTypes.VICTORY,
      points: 1,
      cost: 2,
    },
    smithy: {
      name: 'Smithy',
      type: cardTypes.ACTION,
      cost: 4,
      effect: (gameState) => {
        gameState.drawCards(3);
      },
    },
  };
  