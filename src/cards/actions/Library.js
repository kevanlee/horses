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
  async onPlay(player, gameState) {
    super.onPlay(player);

    if (!gameState.modalManager) {
      throw new Error('ModalManager not set up');
    }

    // If already at 7 or more cards, just show a message
    if (player.state.hand.length >= 7) {
      await new Promise(resolve => {
        gameState.modalManager.showModal('card', {
          title: 'Library Effect',
          message: 'You already have 7 or more cards in hand.',
          onConfirm: resolve
        });
      });
      return;
    }

    const cardsToDraw = 7 - player.state.hand.length;
    const drawnCards = [];

    // Draw all cards first
    for (let i = 0; i < cardsToDraw; i++) {
      // Check if we need to shuffle
      if (player.state.deck.length === 0) {
        if (player.state.discard.length === 0) {
          break; // No more cards to draw
        }
        // Reshuffle discard into deck
        player.state.deck = [...player.state.discard];
        player.state.discard = [];
        player.shuffleDeck();
      }
      if (player.state.deck.length > 0) {
        const drawnCard = player.state.deck.shift();
        drawnCards.push(drawnCard);
      }
    }

    // Show all drawn cards in the modal and wait for completion
    const setAsideCards = [];
    await new Promise(resolve => {
      gameState.modalManager.showModal('card', {
        title: 'Library Effect',
        message: `Cards in hand: ${player.state.hand.length}/${7}. Cards to draw: ${cardsToDraw}\nClick "Discard" under Action cards to set them aside and draw replacements.`,
        cards: drawnCards,
        confirmText: 'Finish',
        onConfirm: () => {
          // Add all remaining cards to hand
          drawnCards.forEach(card => {
            player.state.hand.push(card);
            player.emit('cardsDrawn', { player, cards: [card] });
          });
          // Add any set-aside cards to discard
          if (setAsideCards.length > 0) {
            setAsideCards.forEach(card => {
              player.state.discard.push(card);
              player.emit('cardDiscarded', { player, card });
            });
          }
          resolve();
        },
        onCardClick: (cardEl, allCards) => {
          const card = drawnCards[parseInt(cardEl.dataset.index)];
          if (card.type === 'Action' || card.type === 'Action-Victory') {
            // Create or update the discard link
            let discardLink = cardEl.querySelector('.discard-link');
            if (!discardLink) {
              discardLink = document.createElement('div');
              discardLink.className = 'discard-link';
              discardLink.style.color = '#e74c3c';
              discardLink.style.cursor = 'pointer';
              discardLink.style.marginTop = '5px';
              discardLink.style.fontSize = '0.9em';
              discardLink.textContent = 'Discard';
              cardEl.appendChild(discardLink);

              // Add click handler for the discard link
              discardLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                
                // Add card to set-aside
                setAsideCards.push(card);
                
                // Try to draw a replacement card
                let replacementCard = null;
                if (player.state.deck.length === 0 && player.state.discard.length > 0) {
                  // Shuffle discard into deck
                  player.state.deck = [...player.state.discard];
                  player.state.discard = [];
                  player.shuffleDeck();
                }
                if (player.state.deck.length > 0) {
                  replacementCard = player.state.deck.shift();
                  // Replace the discarded card in drawnCards
                  const index = drawnCards.indexOf(card);
                  drawnCards[index] = replacementCard;
                  
                  // Update the card element
                  cardEl.innerHTML = ''; // Clear the card content
                  cardEl.dataset.index = index;
                  
                  // Create new card content
                  const cardContent = document.createElement('div');
                  cardContent.className = 'card';
                  if (replacementCard.type === 'Action' || replacementCard.type === 'Action-Victory') {
                    cardContent.classList.add('card-action');
                  } else if (replacementCard.type === 'Victory') {
                    cardContent.classList.add('card-victory');
                  } else if (replacementCard.type === 'Treasure') {
                    cardContent.classList.add('card-treasure');
                  }
                  
                  // Add card details
                  cardContent.innerHTML = `
                    <strong>${replacementCard.name}</strong>
                    <div class="card-description">${replacementCard.description}</div>
                    <h4>${replacementCard.cost}</h4>
                    <em>${replacementCard.type}</em>
                  `;
                  
                  cardEl.appendChild(cardContent);
                  
                  // If it's an Action card, add the discard link
                  if (replacementCard.type === 'Action' || replacementCard.type === 'Action-Victory') {
                    const newDiscardLink = document.createElement('div');
                    newDiscardLink.className = 'discard-link';
                    newDiscardLink.style.color = '#e74c3c';
                    newDiscardLink.style.cursor = 'pointer';
                    newDiscardLink.style.marginTop = '5px';
                    newDiscardLink.style.fontSize = '0.9em';
                    newDiscardLink.textContent = 'Discard';
                    cardEl.appendChild(newDiscardLink);
                    
                    // Add click handler for the new discard link
                    newDiscardLink.addEventListener('click', (e) => {
                      e.stopPropagation();
                      setAsideCards.push(replacementCard);
                      cardEl.remove(); // Remove the card from the UI
                    });
                  }
                } else {
                  // No more cards to draw, just remove the card
                  cardEl.remove();
                }
                
                // Update the message
                const messageEl = document.querySelector('.modal-content .message');
                if (messageEl) {
                  messageEl.textContent = `Cards in hand: ${player.state.hand.length}/${7}. Cards to draw: ${cardsToDraw}\nClick "Discard" under Action cards to set them aside and draw replacements.\nSet aside: ${setAsideCards.length} Action card${setAsideCards.length !== 1 ? 's' : ''}`;
                }
              });
            }
          }
        }
      });
    });

    // Emit events to trigger UI updates
    gameState.emit('cardPlayed', { player, card: this });
    gameState.emit('stateChanged');
  }
} 