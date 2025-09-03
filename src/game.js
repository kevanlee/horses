// This file is now deprecated - functionality has been moved to GameEngine class
// Keeping for backward compatibility during transition

import { cards } from './cards.js';

// Legacy exports for backward compatibility
export const createPlayer = () => {
  console.warn('createPlayer is deprecated - use GameEngine.createPlayer() instead');
  return {
    deck: [
      ...Array(7).fill(cards.copper),
      ...Array(3).fill(cards.estate)
    ],
    hand: [],
    discard: [],
    drawPile: [],
    trash: [],
    gold: 0,
    actions: 1,
    buys: 1,
    bonusGold: 0,
  };
};

export let turnNumber = 1;

export const incrementTurn = () => {
  console.warn('incrementTurn is deprecated - use GameEngine.nextTurn() instead');
  turnNumber++;
  console.log(`Turn ${turnNumber}`);
  const turnEl = document.getElementById('turn-counter');
  if (turnEl) {
    turnEl.textContent = `Turn ${turnNumber}`;
  }
};

export const shuffle = (array) => {
  console.warn('shuffle is deprecated - use GameEngine.shuffle() instead');
  return array.sort(() => Math.random() - 0.5);
};

export const drawCards = (player, count = 5) => {
  console.warn('drawCards is deprecated - use GameEngine.drawCards() instead');
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
