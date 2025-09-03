import { cards } from './cards.js';

// Game configuration constants
export const GAME_CONFIG = {
  INITIAL_HAND_SIZE: 5,
  LIBRARY_TARGET_HAND_SIZE: 7,
  INITIAL_ACTIONS: 1,
  INITIAL_BUYS: 1,
  INITIAL_COPPER_COUNT: 7,
  INITIAL_ESTATE_COUNT: 3
};

// Game phases (for future implementation)
export const GAME_PHASES = {
  ACTION_PHASE: 'action',
  BUY_PHASE: 'buy'
};

// Play areas (for future implementation)
export const PLAY_AREAS = {
  HAND: 'hand',
  DECK: 'deck',
  DISCARD: 'discard',
  TRASH: 'trash',
  PLAY_AREA: 'play_area', // Where played action cards go during turn
  MARKETPLACE: 'marketplace'
};

// Market supply configuration
export const MARKET_SUPPLY = [
  { card: cards.copper, count: 46 },
  { card: cards.silver, count: 40 },
  { card: cards.gold, count: 30 },
  { card: cards.estate, count: 8 },
  { card: cards.duchy, count: 8 },
  { card: cards.province, count: 8 },
  { card: cards.smithy, count: 10 },
  { card: cards.village, count: 10 },
  { card: cards.market, count: 10 },
  { card: cards.cellar, count: 10 },
  { card: cards.festival, count: 10 },
  { card: cards.library, count: 10 },
  { card: cards.laboratory, count: 10 },
  { card: cards.chapel, count: 10 },
  { card: cards.throneRoom, count: 10 },
  { card: cards.workshop, count: 10 },
  { card: cards.woodcutter, count: 10 },
  { card: cards.vassal, count: 10 },
  { card: cards.remodel, count: 10 },
  { card: cards.mine, count: 10 },
  { card: cards.moneylender, count: 10 },
  { card: cards.feast, count: 10 },
  { card: cards.councilRoom, count: 10 },
  { card: cards.adventurer, count: 10 },
  { card: cards.gardens, count: 8 },
  { card: cards.treasury, count: 10 },
  { card: cards.greatHall, count: 8 },
  { card: cards.masquerade, count: 10 },
  { card: cards.harbinger, count: 10 }
];
