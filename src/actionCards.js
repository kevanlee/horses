import { drawCards, shuffle } from './game.js';

// 👇 Central function that handles any action card
export function playActionCardEffect(card, player) {
  switch (card.name) {
    case "Smithy":
      drawCards(player, 3);
      player.log("Smithy: +3 Cards");
      break;
      
    case "Village":
      drawCards(player, 1);
      player.actions += 2;
      player.log("Village: +1 Card, +2 Actions");
      break;
      
    case "Market":
      drawCards(player, 1);
      player.actions += 1;
      player.buys += 1;
      player.bonusGold += 1; 
      player.log("Market: +1 Card, +1 Action, +1 Buy, +1 Gold");
      break;

    case "Festival":
      player.actions += 2;
      player.buys += 1;
      player.bonusGold += 2;
      player.log("Festival: +2 Actions, +1 Buy, +2 Gold");
      break;

    case "Cellar":
      player.actions += 1;
      player.log("Cellar: +1 Action. Choose cards to discard and draw.");
      handleCellarEffect(player, card);
      break;

    case "Library":
      player.log("Library: Draw until you have 7 cards, discard Action cards.");
      handleLibraryEffect(player, card);
      break;

    case "Laboratory":
      drawCards(player, 2);
      player.actions += 1;
      player.log("Laboratory: +2 Cards, +1 Action");
      break;
    
    default:
      player.log(`${card.name} has no effect yet.`);
  }
}

function handleCellarEffect(player, cellarCard) {
  // Remove the Cellar from the hand
  const index = player.hand.indexOf(cellarCard);
  if (index !== -1) {
    player.hand.splice(index, 1);
  }

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose cards to discard for Cellar';
  const selectedCards = new Set();

  player.hand.forEach((c, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <strong>${c.name}</strong><br>
      <em>Type:</em> ${c.type}<br>
      <em>Cost:</em> ${c.cost}<br>
    `;
    cardEl.addEventListener('click', () => {
      if (selectedCards.has(idx)) {
        selectedCards.delete(idx);
        cardEl.classList.remove('selected');
      } else {
        selectedCards.add(idx);
        cardEl.classList.add('selected');
      }
    });
    modalBody.appendChild(cardEl);
  });

  // Show modal
  modal.classList.remove('hidden');

  modalConfirm.textContent = 'Discard Selected';
  modalConfirm.onclick = () => {
    const numToDraw = selectedCards.size;

    const kept = [];
    player.hand.forEach((c, i) => {
      if (selectedCards.has(i)) {
        player.discard.push(c);
      } else {
        kept.push(c);
      }
    });

    player.hand = kept;
    drawCards(player, numToDraw);

    // Close modal and update UI
    modal.classList.add('hidden');
    renderHand();
    renderMarketplace();

  };
}

function handleLibraryEffect(player, libraryCard) {
  const index = player.hand.indexOf(libraryCard);
  if (index !== -1) {
    player.hand.splice(index, 1);
    player.discard.push(libraryCard);
  }

  const modal = document.getElementById('library-modal');
  const text = document.getElementById('library-modal-text');
  const libraryHand = document.getElementById('library-hand');
  const confirmButton = document.getElementById('modal-confirm');

  // Reset modal content
  modal.classList.remove('hidden');
  libraryHand.innerHTML = ''; // Clear previous cards
  confirmButton.classList.add('hidden'); // Initially hide the confirm button

  const currentHandSize = player.hand.length;
  const cardsNeeded = 7 - currentHandSize;

  // Display how many cards are needed
  text.textContent = `You currently have ${currentHandSize} cards. You need to draw ${cardsNeeded} more card(s).`;

  let drawn = [];
  for (let i = 0; i < cardsNeeded; i++) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = shuffle(player.discard);
      player.discard = [];
    }

    if (player.deck.length > 0) {
      drawn.push(player.deck.pop());
    }
  }

  // Add "Here are your next X cards" text
  const drawIntro = document.createElement('p');
  drawIntro.textContent = `Here are your next ${drawn.length} card(s):`;
  libraryHand.appendChild(drawIntro);

  drawn.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `<strong>${card.name}</strong><br><em>${card.type}</em>`;

    // Add a discard button for Action cards
    if (card.type === "Action") {
      const discardButton = document.createElement('button');
      discardButton.textContent = 'Discard';
      discardButton.onclick = () => {
        // Discard the card and draw a new one
        player.discard.push(card);
        libraryHand.removeChild(cardDiv); // Remove the discarded card div
        drawn = drawn.filter(c => c !== card); // Remove the card from the drawn array

        // If deck is empty, shuffle discard pile and continue drawing
        if (player.deck.length === 0 && player.discard.length > 0) {
          player.deck = shuffle(player.discard);
          player.discard = [];
        }
        if (player.deck.length > 0) {
          const newCard = player.deck.pop();
          drawn.push(newCard); // Add the new card to the drawn array

          // Update modal with new card
          const newCardDiv = document.createElement('div');
          newCardDiv.className = 'card';
          newCardDiv.innerHTML = `<strong>${newCard.name}</strong><br><em>${newCard.type}</em>`;
          
          // If the new card is an action card, add a Discard button again
          if (newCard.type === "Action") {
            const discardButtonNew = document.createElement('button');
            discardButtonNew.textContent = 'Discard';
            discardButtonNew.onclick = () => {
              player.discard.push(newCard);
              libraryHand.removeChild(newCardDiv);
              drawn = drawn.filter(c => c !== newCard);
            };
            newCardDiv.appendChild(discardButtonNew);
          }
          
          libraryHand.appendChild(newCardDiv); // Add the new card to the modal
        }
      };
      cardDiv.appendChild(discardButton);
    }

    libraryHand.appendChild(cardDiv);
  });

  // Ensure Confirm button is shown after drawing cards
  if (drawn.length > 0) {
    confirmButton.classList.remove('hidden');
    confirmButton.textContent = "Confirm";
    confirmButton.onclick = () => {
      // Add the drawn cards to the player's hand
      player.hand.push(...drawn);
      renderHand(); // Re-render the player's hand
      modal.classList.add('hidden');

      // Re-render the market supply if there are changes to the hand
      renderMarketSupply(); // This will need to be implemented to update the available market cards
    };
  }
}
