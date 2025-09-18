// Predefined challenges for the dungeon crawler
// Each challenge has a unique name, win condition, and difficulty tier

export const CHALLENGE_DEFINITIONS = [
  // ===== TIER 1: BEGINNER =====
  {
    id: 1,
    name: "First Steps",
    winCondition: { type: 'victory_points', target: 28 },
    maxTurns: 48,
    difficulty: 1
  },
  {
    id: 2,
    name: "Copper Rush",
    winCondition: { type: 'gold_accumulation', target: 50 },
    maxTurns: 110,
    difficulty: 1
  },
  {
    id: 3,
    name: "Deck Builder",
    winCondition: { type: 'card_collection', target: 30 },
    maxTurns: 30,
    difficulty: 1
  },
  {
    id: 4,
    name: "Quick Victory",
    winCondition: { type: 'victory_points', target: 10 },
    maxTurns: 8,
    difficulty: 1
  },
  {
    id: 5,
    name: "Silver Standard",
    winCondition: { type: 'gold_accumulation', target: 12 },
    maxTurns: 35,
    difficulty: 1
  },
  {
    id: 6,
    name: "Growing Collection",
    winCondition: { type: 'card_collection', target: 18 },
    maxTurns: 100,
    difficulty: 1
  },
  {
    id: 7,
    name: "Steady Progress",
    winCondition: { type: 'victory_points', target: 12 },
    maxTurns: 100,
    difficulty: 1
  },
  {
    id: 8,
    name: "Golden Opportunity",
    winCondition: { type: 'gold_accumulation', target: 15 },
    maxTurns: 100,
    difficulty: 1
  },

  // ===== TIER 2: INTERMEDIATE (9-12 turns) =====
  {
    id: 9,
    name: "Rising Noble",
    winCondition: { type: 'victory_points', target: 15 },
    maxTurns: 10,
    difficulty: 2
  },
  {
    id: 10,
    name: "Treasure Hunter",
    winCondition: { type: 'gold_accumulation', target: 18 },
    maxTurns: 11,
    difficulty: 2
  },
  {
    id: 11,
    name: "Card Collector",
    winCondition: { type: 'card_collection', target: 22 },
    maxTurns: 11,
    difficulty: 2
  },
  {
    id: 12,
    name: "Swift Conquest",
    winCondition: { type: 'victory_points', target: 18 },
    maxTurns: 11,
    difficulty: 2
  },
  {
    id: 13,
    name: "Gold Rush",
    winCondition: { type: 'gold_accumulation', target: 20 },
    maxTurns: 12,
    difficulty: 2
  },
  {
    id: 14,
    name: "Deck Master",
    winCondition: { type: 'card_collection', target: 25 },
    maxTurns: 12,
    difficulty: 2
  },
  {
    id: 15,
    name: "Provincial Power",
    winCondition: { type: 'victory_points', target: 20 },
    maxTurns: 12,
    difficulty: 2
  },
  {
    id: 16,
    name: "Midas Touch",
    winCondition: { type: 'gold_accumulation', target: 22 },
    maxTurns: 12,
    difficulty: 2
  },
  {
    id: 17,
    name: "Endurance Test",
    winCondition: { type: 'turn_limit', maxTurns: 12 },
    maxTurns: 12,
    difficulty: 2
  },
  {
    id: 18,
    name: "Balanced Approach",
    winCondition: { type: 'victory_points', target: 16 },
    maxTurns: 11,
    difficulty: 2
  },

  // ===== TIER 3: ADVANCED (10-13 turns) =====
  {
    id: 19,
    name: "Duke's Ambition",
    winCondition: { type: 'victory_points', target: 22 },
    maxTurns: 12,
    difficulty: 3
  },
  {
    id: 20,
    name: "Golden Hoard",
    winCondition: { type: 'gold_accumulation', target: 25 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 21,
    name: "Massive Deck",
    winCondition: { type: 'card_collection', target: 28 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 22,
    name: "Royal Ascension",
    winCondition: { type: 'victory_points', target: 25 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 23,
    name: "Treasure Vault",
    winCondition: { type: 'gold_accumulation', target: 28 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 24,
    name: "Card Hoarder",
    winCondition: { type: 'card_collection', target: 30 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 25,
    name: "Marathon Runner",
    winCondition: { type: 'turn_limit', maxTurns: 13 },
    maxTurns: 13,
    difficulty: 3
  },
  {
    id: 26,
    name: "Strategic Victory",
    winCondition: { type: 'victory_points', target: 20 },
    maxTurns: 11,
    difficulty: 3
  },
  {
    id: 27,
    name: "Speed Demon",
    winCondition: { type: 'victory_points', target: 18 },
    maxTurns: 9,
    difficulty: 3
  },
  {
    id: 28,
    name: "Lightning Gold",
    winCondition: { type: 'gold_accumulation', target: 20 },
    maxTurns: 10,
    difficulty: 3
  },

  // ===== TIER 4: EXPERT (11-14 turns) =====
  {
    id: 29,
    name: "Emperor's Dream",
    winCondition: { type: 'victory_points', target: 28 },
    maxTurns: 13,
    difficulty: 4
  },
  {
    id: 30,
    name: "Dragon's Hoard",
    winCondition: { type: 'gold_accumulation', target: 30 },
    maxTurns: 14,
    difficulty: 4
  },
  {
    id: 31,
    name: "Infinite Deck",
    winCondition: { type: 'card_collection', target: 35 },
    maxTurns: 14,
    difficulty: 4
  },
  {
    id: 32,
    name: "Ultimate Victory",
    winCondition: { type: 'victory_points', target: 30 },
    maxTurns: 14,
    difficulty: 4
  },
  {
    id: 33,
    name: "Miser's Paradise",
    winCondition: { type: 'gold_accumulation', target: 32 },
    maxTurns: 14,
    difficulty: 4
  },
  {
    id: 34,
    name: "Perfectionist",
    winCondition: { type: 'victory_points', target: 25 },
    maxTurns: 11,
    difficulty: 4
  },
  {
    id: 35,
    name: "Blitz Master",
    winCondition: { type: 'gold_accumulation', target: 25 },
    maxTurns: 11,
    difficulty: 4
  },
  {
    id: 36,
    name: "Endurance Champion",
    winCondition: { type: 'turn_limit', maxTurns: 14 },
    maxTurns: 14,
    difficulty: 4
  },

  // ===== TIER 5: MASTER (12-15 turns) =====
  {
    id: 37,
    name: "Legendary Status",
    winCondition: { type: 'victory_points', target: 35 },
    maxTurns: 15,
    difficulty: 5
  },
  {
    id: 38,
    name: "King's Ransom",
    winCondition: { type: 'gold_accumulation', target: 35 },
    maxTurns: 15,
    difficulty: 5
  },
  {
    id: 39,
    name: "Master Collector",
    winCondition: { type: 'card_collection', target: 40 },
    maxTurns: 15,
    difficulty: 5
  },
  {
    id: 40,
    name: "Speed Legend",
    winCondition: { type: 'victory_points', target: 30 },
    maxTurns: 12,
    difficulty: 5
  },
  {
    id: 41,
    name: "Golden Legend",
    winCondition: { type: 'gold_accumulation', target: 30 },
    maxTurns: 12,
    difficulty: 5
  },
  {
    id: 42,
    name: "Impossible Dream",
    winCondition: { type: 'victory_points', target: 25 },
    maxTurns: 10,
    difficulty: 5
  },
  {
    id: 43,
    name: "Lightning Wealth",
    winCondition: { type: 'gold_accumulation', target: 28 },
    maxTurns: 11,
    difficulty: 5
  },
  {
    id: 44,
    name: "Marathon Master",
    winCondition: { type: 'turn_limit', maxTurns: 15 },
    maxTurns: 15,
    difficulty: 5
  },

  // ===== TIER 6: GRANDMASTER (Extreme Challenges) =====
  {
    id: 45,
    name: "Godlike Victory",
    winCondition: { type: 'victory_points', target: 40 },
    maxTurns: 15,
    difficulty: 6
  },
  {
    id: 46,
    name: "Infinite Wealth",
    winCondition: { type: 'gold_accumulation', target: 40 },
    maxTurns: 15,
    difficulty: 6
  },
  {
    id: 47,
    name: "Card God",
    winCondition: { type: 'card_collection', target: 45 },
    maxTurns: 15,
    difficulty: 6
  },
  {
    id: 48,
    name: "The Impossible",
    winCondition: { type: 'victory_points', target: 35 },
    maxTurns: 12,
    difficulty: 6
  },
  {
    id: 49,
    name: "Miracle Worker",
    winCondition: { type: 'gold_accumulation', target: 35 },
    maxTurns: 12,
    difficulty: 6
  },
  {
    id: 50,
    name: "Transcendence",
    winCondition: { type: 'victory_points', target: 30 },
    maxTurns: 9,
    difficulty: 6
  }
];

// Helper functions for challenge management
export function getChallengesByDifficulty(difficulty) {
  return CHALLENGE_DEFINITIONS.filter(challenge => challenge.difficulty === difficulty);
}

export function getChallengeById(id) {
  return CHALLENGE_DEFINITIONS.find(challenge => challenge.id === id);
}

export function getRandomChallenge(excludeIds = []) {
  const available = CHALLENGE_DEFINITIONS.filter(challenge => !excludeIds.includes(challenge.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getChallengeInDifficultyRange(minDifficulty, maxDifficulty, excludeIds = []) {
  const available = CHALLENGE_DEFINITIONS.filter(challenge => 
    challenge.difficulty >= minDifficulty && 
    challenge.difficulty <= maxDifficulty && 
    !excludeIds.includes(challenge.id)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
