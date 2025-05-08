import { EventEmitter } from './utils/EventEmitter.js';
import { cards } from './cards.js';

/**
 * @typedef {Object} PlayerState
 * @property {string} id - Unique identifier for the player
 * @property {string} name - Player's name
 * @property {Card[]} deck - Cards in the deck
 * @property {Card[]} hand - Cards in hand
 * @property {Card[]} discard - Cards in discard pile
 * @property {Card[]} playArea - Cards in play area
 * @property {Card[]} trash - Cards in trash
 * @property {number} gold - Current gold
 * @property {number} actions - Available actions
 * @property {number} buys - Available buys
 * @property {number} bonusGold - Additional gold from effects
 * @property {number} victoryPoints - Total victory points
 */

/**
 * Creates a new player with initial deck
 * @param {string} name - Player's name
 * @returns {PlayerState}
 */
export const createPlayer = (name) => {
  return {
    id: crypto.randomUUID(),
    name,
    deck: [
      ...Array(7).fill(cards.copper),
      ...Array(3).fill(cards.estate)
    ],
    hand: [],
    discard: [],
    playArea: [],
    trash: [],
    gold: 0,
    actions: 1,
    buys: 1,
    bonusGold: 0,
    victoryPoints: 0
  };
};

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Draws cards from deck to hand
 * @param {PlayerState} player - Player state
 * @param {number} count - Number of cards to draw
 * @returns {Card[]} Drawn cards
 * @throws {Error} If unable to draw requested number of cards
 */
export const drawCards = (player, count = 5) => {
  const drawn = [];
  
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      if (player.discard.length === 0) {
        throw new Error('No cards available to draw');
      }
      player.deck = shuffle(player.discard);
      player.discard = [];
    }
    
    const card = player.deck.pop();
    if (card) {
      player.hand.push(card);
      drawn.push(card);
    }
  }
  
  return drawn;
};

/**
 * Calculates total gold available to player
 * @param {PlayerState} player - Player state
 * @returns {number} Total gold
 */
export const calculateTotalGold = (player) => {
  let gold = player.gold + player.bonusGold;
  
  // Add gold from treasure cards in hand
  for (const card of player.hand) {
    if (card.type === 'Treasure') {
      gold += card.value;
    }
  }
  
  return gold;
};

/**
 * Calculates victory points for player
 * @param {PlayerState} player - Player state
 * @returns {number} Total victory points
 */
export const calculateVictoryPoints = (player) => {
  let points = 0;
  
  // Count points from all cards in all zones
  const allCards = [
    ...player.deck,
    ...player.hand,
    ...player.discard,
    ...player.playArea
  ];
  
  for (const card of allCards) {
    if (card.type === 'Victory' || card.type === 'Action-Victory') {
      points += card.points;
    }
  }
  
  player.victoryPoints = points;
  return points;
};

/**
 * Starts a new turn for a player
 * @param {PlayerState} player - Player state
 */
export const startTurn = (player) => {
  player.actions = 1;
  player.buys = 1;
  player.bonusGold = 0;
  
  try {
    drawCards(player, 5);
  } catch (error) {
    console.error('Error drawing cards:', error);
    // Handle error appropriately
  }
};

/**
 * Ends the current turn for a player
 * @param {PlayerState} player - Player state
 */
export const endTurn = (player) => {
  // Move all cards from hand and play area to discard
  player.discard.push(...player.hand, ...player.playArea);
  player.hand = [];
  player.playArea = [];
};

/**
 * Plays a card from hand
 * @param {PlayerState} player - Player state
 * @param {Card} card - Card to play
 * @throws {Error} If card cannot be played
 */
export const playCard = (player, card) => {
  const cardIndex = player.hand.indexOf(card);
  if (cardIndex === -1) {
    throw new Error('Card not in hand');
  }
  
  if (card.type === 'Action' && player.actions <= 0) {
    throw new Error('No actions remaining');
  }
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to play area
  player.playArea.push(card);
  
  // Reduce actions if it's an action card
  if (card.type === 'Action') {
    player.actions--;
  }
  
  // Apply card effect
  if (card.onPlay) {
    card.onPlay(player);
  }
};

/**
 * Buys a card from supply
 * @param {PlayerState} player - Player state
 * @param {Card} card - Card to buy
 * @param {Map<string, {card: Card, count: number}>} supply - Supply piles
 * @throws {Error} If card cannot be bought
 */
export const buyCard = (player, card, supply) => {
  if (player.buys <= 0) {
    throw new Error('No buys remaining');
  }
  
  const supplyPile = supply.get(card.name);
  if (!supplyPile || supplyPile.count <= 0) {
    throw new Error('Card not available in supply');
  }
  
  const totalGold = calculateTotalGold(player);
  if (totalGold < card.cost) {
    throw new Error('Not enough gold to buy card');
  }
  
  // Deduct cost and buy
  player.gold -= card.cost;
  player.buys--;
  supplyPile.count--;
  
  // Add card to discard
  player.discard.push(card);
};

// Turn counter
export let turnNumber = 1;

export const incrementTurn = () => {
  turnNumber++;
  console.log(`Turn ${turnNumber}`);
  const turnEl = document.getElementById('turn-counter');
  if (turnEl) {
    turnEl.textContent = `Turn ${turnNumber}`;
  }
};
