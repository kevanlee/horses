import { ActionCard } from '../ActionCard.js';

export class Library extends ActionCard {
  constructor() {
    super({
      name: 'Library',
      type: 'Action',
      cost: 5,
      description: 'Draw until you have 7 cards in hand. You may set aside Action cards.'
    });
  }

  /**
   * @param {Player} player
   * @param {GameState} gameState
   */
  onPlay(player, gameState) {
    super.onPlay(player);

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    // If already at 7 or more cards, just show a message
    if (player.state.hand.length >= 7) {
      gameState.modalManager.showModal('card', {
        title: 'Library Effect',
        message: 'You already have 7 or more cards in hand.',
        onConfirm: () => {} // Just close the modal
      });
      return;
    }

    const setAsideCards = [];
    const drawNextCard = () => {
      // Check if we need to shuffle
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) {
          // No more cards to draw
          gameState.modalManager.showModal('card', {
            title: 'Library Effect',
            message: 'No more cards to draw. Returning set-aside cards to discard.',
            onConfirm: () => {
              // Return set-aside cards to discard
              player.state.discard.push(...setAsideCards);
              player.emit('cardDiscarded', { player, cards: setAsideCards });
              gameState.emit('stateChanged');
            }
          });
          return;
        }
        // Shuffle discard into deck
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        gameState.shuffle(player.state.deck);
      }

      // Draw a card
      const drawnCard = player.state.deck.shift();

      // If we've reached 7 cards, end the effect
      if (player.state.hand.length >= 7) {
        gameState.modalManager.showModal('card', {
          title: 'Library Effect',
          message: 'You now have 7 cards in hand. Returning set-aside cards to discard.',
          onConfirm: () => {
            // Return set-aside cards to discard
            player.state.discard.push(...setAsideCards);
            player.emit('cardDiscarded', { player, cards: setAsideCards });
            gameState.emit('stateChanged');
          }
        });
        return;
      }

      // Show modal for the drawn card
      gameState.modalManager.showModal('card', {
        title: 'Library Effect',
        message: `You drew ${drawnCard.name}. ${drawnCard.type === 'Action' ? 'Would you like to set it aside?' : 'Adding to hand.'}`,
        cards: [drawnCard],
        confirmText: drawnCard.type === 'Action' ? 'Set Aside' : 'Continue',
        showCancel: drawnCard.type === 'Action',
        cancelText: 'Keep in Hand',
        onConfirm: () => {
          if (drawnCard.type === 'Action') {
            setAsideCards.push(drawnCard);
          } else {
            // Add to hand and emit events
            player.state.hand.push(drawnCard);
            player.emit('cardsDrawn', { player, cards: [drawnCard] });
            gameState.emit('handUpdated', player);
          }
          // Continue drawing until we have 7 cards
          if (player.state.hand.length < 7) {
            drawNextCard();
          } else {
            // We've reached 7 cards, handle set-aside cards
            if (setAsideCards.length > 0) {
              gameState.modalManager.showModal('card', {
                title: 'Library Effect',
                message: 'You now have 7 cards in hand. Returning set-aside cards to discard.',
                onConfirm: () => {
                  player.state.discard.push(...setAsideCards);
                  player.emit('cardDiscarded', { player, cards: setAsideCards });
                  gameState.emit('stateChanged');
                }
              });
            }
          }
        },
        onCancel: () => {
          // Add to hand and emit events
          player.state.hand.push(drawnCard);
          player.emit('cardsDrawn', { player, cards: [drawnCard] });
          gameState.emit('handUpdated', player);
          // Continue drawing until we have 7 cards
          if (player.state.hand.length < 7) {
            drawNextCard();
          } else {
            // We've reached 7 cards, handle set-aside cards
            if (setAsideCards.length > 0) {
              gameState.modalManager.showModal('card', {
                title: 'Library Effect',
                message: 'You now have 7 cards in hand. Returning set-aside cards to discard.',
                onConfirm: () => {
                  player.state.discard.push(...setAsideCards);
                  player.emit('cardDiscarded', { player, cards: setAsideCards });
                  gameState.emit('stateChanged');
                }
              });
            }
          }
        }
      });
    };

    // Start the drawing process
    drawNextCard();
  }
} 