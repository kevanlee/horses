import { CHALLENGE_DEFINITIONS, getChallengeById, getRandomChallenge, getChallengeInDifficultyRange } from './challengeDefinitions.js';

export class ChallengeManager {
  constructor() {
    this.completedChallenges = new Set(); // Track completed challenge IDs
    this.availableChallenges = new Set(CHALLENGE_DEFINITIONS.map(c => c.id)); // All available challenges
    this.currentChallenge = null;
    this.selectionStrategy = 'progressive'; // 'random', 'progressive', or 'difficulty_scaled'
  }

  // Get a challenge for the given level number
  getChallengeForLevel(levelNumber) {
    let challenge;
    
    switch (this.selectionStrategy) {
      case 'random':
        challenge = this.getRandomAvailableChallenge();
        break;
      
      case 'progressive':
        challenge = this.getProgressiveChallenge(levelNumber);
        break;
      
      case 'difficulty_scaled':
        challenge = this.getDifficultyScaledChallenge(levelNumber);
        break;
      
      default:
        challenge = this.getProgressiveChallenge(levelNumber);
    }

    // If no challenge available, reset the pool
    if (!challenge) {
      this.resetChallengePool();
      challenge = this.getRandomAvailableChallenge();
    }

    this.currentChallenge = challenge;
    return challenge;
  }

  // Progressive selection - easier challenges early, harder ones later
  getProgressiveChallenge(levelNumber) {
    let targetDifficulty;
    
    if (levelNumber <= 5) {
      targetDifficulty = 1;
    } else if (levelNumber <= 10) {
      targetDifficulty = 2;
    } else if (levelNumber <= 15) {
      targetDifficulty = 3;
    } else if (levelNumber <= 20) {
      targetDifficulty = 4;
    } else if (levelNumber <= 25) {
      targetDifficulty = 5;
    } else {
      targetDifficulty = 6;
    }

    // Get challenges in target difficulty, with some flexibility
    const excludeIds = Array.from(this.completedChallenges);
    let challenge = getChallengeInDifficultyRange(targetDifficulty, targetDifficulty, excludeIds);
    
    // If no exact match, try adjacent difficulties
    if (!challenge) {
      challenge = getChallengeInDifficultyRange(
        Math.max(1, targetDifficulty - 1), 
        Math.min(6, targetDifficulty + 1), 
        excludeIds
      );
    }

    return challenge;
  }

  // Difficulty scaled - gradually increase difficulty based on level
  getDifficultyScaledChallenge(levelNumber) {
    const minDifficulty = Math.max(1, Math.floor(levelNumber / 8) + 1);
    const maxDifficulty = Math.min(6, Math.floor(levelNumber / 5) + 2);
    
    const excludeIds = Array.from(this.completedChallenges);
    return getChallengeInDifficultyRange(minDifficulty, maxDifficulty, excludeIds);
  }

  // Completely random selection from available challenges
  getRandomAvailableChallenge() {
    const excludeIds = Array.from(this.completedChallenges);
    return getRandomChallenge(excludeIds);
  }

  // Mark current challenge as completed
  completeCurrentChallenge() {
    if (this.currentChallenge) {
      this.completedChallenges.add(this.currentChallenge.id);
      this.availableChallenges.delete(this.currentChallenge.id);
    }
  }

  // Reset challenge pool when all challenges have been completed
  resetChallengePool() {
    console.log('Resetting challenge pool - all challenges completed!');
    this.completedChallenges.clear();
    this.availableChallenges = new Set(CHALLENGE_DEFINITIONS.map(c => c.id));
  }

  // Get challenge statistics
  getStats() {
    return {
      totalChallenges: CHALLENGE_DEFINITIONS.length,
      completedCount: this.completedChallenges.size,
      availableCount: this.availableChallenges.size,
      completedChallenges: Array.from(this.completedChallenges),
      currentChallenge: this.currentChallenge
    };
  }

  // Check if a specific challenge has been completed
  isChallengeCompleted(challengeId) {
    return this.completedChallenges.has(challengeId);
  }

  // Set selection strategy
  setSelectionStrategy(strategy) {
    if (['random', 'progressive', 'difficulty_scaled'].includes(strategy)) {
      this.selectionStrategy = strategy;
    }
  }

  // Get challenge by ID (for level select screen)
  getChallengeById(id) {
    return getChallengeById(id);
  }

  // Save state to localStorage
  saveState() {
    const state = {
      completedChallenges: Array.from(this.completedChallenges),
      availableChallenges: Array.from(this.availableChallenges),
      currentChallenge: this.currentChallenge,
      selectionStrategy: this.selectionStrategy
    };
    localStorage.setItem('challengeManagerState', JSON.stringify(state));
  }

  // Load state from localStorage
  loadState() {
    const saved = localStorage.getItem('challengeManagerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.completedChallenges = new Set(state.completedChallenges || []);
        this.availableChallenges = new Set(state.availableChallenges || CHALLENGE_DEFINITIONS.map(c => c.id));
        this.currentChallenge = state.currentChallenge || null;
        this.selectionStrategy = state.selectionStrategy || 'progressive';
        return true;
      } catch (error) {
        console.error('Failed to load challenge manager state:', error);
        return false;
      }
    }
    return false;
  }

  // Get challenges for level select screen (show completed status)
  getChallengesForLevelSelect() {
    return CHALLENGE_DEFINITIONS.map(challenge => ({
      ...challenge,
      isCompleted: this.completedChallenges.has(challenge.id)
    }));
  }
}
