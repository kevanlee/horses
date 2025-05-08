// src/playerState.js
import { allCards } from './cards.js';

export function getPlayer() {
  return {
    deck: [...allCards], // Initialize the deck with cards
    hand: [],
    discard: []
  };
}

export function drawInitialHand(player) {
  shuffleDeck(player.deck);
  player.hand = player.deck.slice(0, 5);  // Draw 5 cards into hand
  player.deck = player.deck.slice(5);     // Remaining deck
  
  console.log('Player hand after drawing:', player.hand); // Log the hand to check
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];  // Shuffle logic
  }
}
