// === GAME LEVELS & SETUPS ===

import { GameEndConditions } from './game.js';
import { baseCards, actionCards } from './cards.js';

// Game level definition
export class GameLevel {
  constructor(name, description, endConditions, supplyCards) {
    this.name = name;
    this.description = description;
    this.endConditions = endConditions;
    this.supplyCards = supplyCards;
  }

  // Get a description of the win conditions
  getWinConditionDescription() {
    return this.endConditions.getDescription();
  }

  // Get the total number of cards in the supply
  getSupplySize() {
    return this.supplyCards.length;
  }
}

// Predefined game levels
export const gameLevels = {
  // Beginner-friendly level
  tutorial: new GameLevel(
    "Tutorial",
    "Learn the basics with simple cards and clear objectives",
    new GameEndConditions({
      victoryPointsToWin: 15,
      maxTurns: 20
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Simple action cards
      actionCards.village,
      actionCards.smithy,
      actionCards.market,
      actionCards.woodcutter,
      actionCards.laboratory
    ]
  ),

  // Standard Dominion-style game
  classic: new GameLevel(
    "Classic Dominion",
    "The traditional Dominion experience with balanced card selection",
    new GameEndConditions({
      victoryPointsToWin: 30,
      maxTurns: 50
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.gold,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Balanced action cards
      actionCards.village,
      actionCards.smithy,
      actionCards.market,
      actionCards.festival,
      actionCards.laboratory,
      actionCards.workshop,
      actionCards.woodcutter,
      actionCards.councilRoom,
      actionCards.harbinger,
      actionCards.cellar
    ]
  ),

  // Speed challenge
  speedRun: new GameLevel(
    "Speed Run",
    "Quick game with time pressure and efficient card play",
    new GameEndConditions({
      timeLimit: 5 * 60 * 1000, // 5 minutes
      victoryPointsToWin: 20
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.gold,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Fast action cards
      actionCards.village,
      actionCards.laboratory,
      actionCards.market,
      actionCards.festival,
      actionCards.councilRoom,
      actionCards.harbinger,
      actionCards.masquerade,
      actionCards.vassal,
      actionCards.woodcutter,
      actionCards.workshop
    ]
  ),

  // Hand-building challenge
  handBuilder: new GameLevel(
    "Hand Builder",
    "Focus on building a large hand of cards",
    new GameEndConditions({
      cardsInHandToWin: 12,
      maxTurns: 30
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.gold,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Card-drawing action cards
      actionCards.smithy,
      actionCards.laboratory,
      actionCards.councilRoom,
      actionCards.library,
      actionCards.masquerade,
      actionCards.harbinger,
      actionCards.village,
      actionCards.market,
      actionCards.festival,
      actionCards.treasury
    ]
  ),

  // Money-focused challenge
  moneyRush: new GameLevel(
    "Money Rush",
    "Accumulate wealth and reach a money target",
    new GameEndConditions({
      moneyInHandToWin: 25,
      maxTurns: 40
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.gold,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Money-generating action cards
      actionCards.market,
      actionCards.festival,
      actionCards.woodcutter,
      actionCards.vassal,
      actionCards.treasury,
      actionCards.gardens,
      actionCards.workshop,
      actionCards.village,
      actionCards.laboratory,
      actionCards.councilRoom
    ]
  ),

  // Complex strategy game
  mastermind: new GameLevel(
    "Mastermind",
    "Advanced strategy with complex card interactions",
    new GameEndConditions({
      victoryPointsToWin: 40,
      maxTurns: 60
    }),
    [
      // Base cards
      baseCards.copper,
      baseCards.silver,
      baseCards.gold,
      baseCards.estate,
      baseCards.duchy,
      baseCards.province,
      
      // Complex action cards
      actionCards.throneRoom,
      actionCards.chapel,
      actionCards.remodel,
      actionCards.mine,
      actionCards.moneylender,
      actionCards.feast,
      actionCards.library,
      actionCards.adventurer,
      actionCards.gardens,
      actionCards.greatHall
    ]
  )
};

// Default level for quick start and new games
export const defaultLevel = gameLevels.classic;

// Get all available levels
export function getAllLevels() {
  return Object.values(gameLevels);
}

// Get a specific level by name
export function getLevelByName(name) {
  return gameLevels[name] || defaultLevel;
}

// Get level names for UI display
export function getLevelNames() {
  return Object.keys(gameLevels);
}

// Create a custom level
export function createCustomLevel(name, description, endConditions, supplyCards) {
  return new GameLevel(name, description, endConditions, supplyCards);
}

// Level categories for organization
export const levelCategories = {
  beginner: ['tutorial'],
  standard: ['classic'],
  challenge: ['speedRun', 'handBuilder', 'moneyRush'],
  advanced: ['mastermind']
};

// Get levels by category
export function getLevelsByCategory(category) {
  if (!levelCategories[category]) return [];
  return levelCategories[category].map(name => gameLevels[name]);
}
