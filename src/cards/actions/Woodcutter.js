import { ActionCard } from '../ActionCard.js';

/**
 * Woodcutter card implementation
 * Cost: 3
 * Effect: +1 Buy, +2 Gold
 */
export class Woodcutter extends ActionCard {
  constructor() {
    super({
      name: 'Woodcutter',
      cost: 3,
      description: '+1 Buy, +2 Gold'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    // Log initial state
    console.log('Woodcutter: Initial state -', {
      buys: player.state.buys,
      gold: gameState.calculatePlayerGold(player),
      bonusGold: player.state.bonusGold
    });
    
    // Don't call super.onPlay since we don't need to modify actions
    // The action is already consumed when the card is played
    
    // Add additional buy
    const oldBuys = player.state.buys;
    player.state.buys += 1;
    console.log('Woodcutter: Buys increased from', oldBuys, 'to', player.state.buys);
    
    // Add gold
    const oldGold = gameState.calculatePlayerGold(player);
    player.state.bonusGold += 2;
    const newGold = gameState.calculatePlayerGold(player);
    console.log('Woodcutter: Gold increased from', oldGold, 'to', newGold, {
      bonusGold: player.state.bonusGold
    });

    // Log final state
    console.log('Woodcutter: Final state -', {
      buys: player.state.buys,
      gold: newGold,
      bonusGold: player.state.bonusGold
    });

    // Emit events to update UI
    player.emit('cardPlayed', { card: this });
    gameState.emit('stateChanged');
  }
} 