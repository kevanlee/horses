import { cards } from './cards.js';

export const createPlayer = () => {
    return {
      deck: [
        ...Array(7).fill(cards.copper),  // 7 copper cards
        ...Array(3).fill(cards.estate)   // 3 estate cards
      ],
      hand: [],
      discard: [],
      drawPile: [],
      gold: 0,
      actions: 1,  // 1 action by default
      buys: 1      // 1 buy by default
    };
  };  

export const shuffle = (array) =>
  array.sort(() => Math.random() - 0.5);

export const drawCards = (player, count = 5) => {
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      player.deck = shuffle(player.discard);
      player.discard = [];
    }
    if (player.deck.length > 0) {
      player.hand.push(player.deck.pop());
    }
  }
};
