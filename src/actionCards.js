import { drawCards, shuffle } from './game.js';
import { marketSupply } from './main.js';

function playActionCard(player, card) {
  const index = player.hand.indexOf(card);
  if (index !== -1) {
    player.hand.splice(index, 1);
    player.discard.push(card);
  }
}


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

    case 'Chapel':
      handleChapelEffect(player, card);  
      break;

    case 'Workshop':
      handleWorkshopEffect(player, card);
      break;

    case "Woodcutter":
      player.buys += 1;
      player.bonusGold += 2;
      player.log("Woodcutter: +1 Buy, +2 Gold");
      break;
    
    case 'Vassal':
      handleVassalEffect(player, card);
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

function handleChapelEffect(player, chapelCard) {
  // Remove the Chapel card from the hand
  const index = player.hand.indexOf(chapelCard);
  if (index !== -1) {
    player.hand.splice(index, 1);
  }

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose up to 4 cards to trash';
  const selectedCards = new Set();

  player.hand.forEach((c, idx) => {
    // Don't allow the Chapel card itself to be selected
    if (c.name !== 'Chapel') {
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
        } else if (selectedCards.size < 4) { // Only allow up to 4 cards to be selected
          selectedCards.add(idx);
          cardEl.classList.add('selected');
        }
      });
      modalBody.appendChild(cardEl);
    }
  });

  // Show modal
  modal.classList.remove('hidden');

  modalConfirm.textContent = 'Trash Selected';
  modalConfirm.onclick = () => {
    if (selectedCards.size > 0) {
      // Trash selected cards from the player's hand and deck
      const cardsToTrash = [];
      player.hand.forEach((card, i) => {
        if (selectedCards.has(i)) {
          cardsToTrash.push(card);
        }
      });

      // Remove the selected cards from hand and deck
      cardsToTrash.forEach(card => {
        const handIndex = player.hand.indexOf(card);
        if (handIndex !== -1) {
          player.hand.splice(handIndex, 1);
        }
        const deckIndex = player.deck.indexOf(card);
        if (deckIndex !== -1) {
          player.deck.splice(deckIndex, 1);
        }
      });

      // Close the modal and update the UI
      modal.classList.add('hidden');
      renderHand();
      renderDeckInventory();  
    } else {
      alert('Please select at least one card to trash.');
    }
  };
}

function handleWorkshopEffect(player, workshopCard) {
  // Remove Workshop from hand
  playActionCard(player, workshopCard);

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose a card costing up to 4';
  const selectedCardIndex = { value: null };

  // Filter marketSupply for cards costing <= 4
  marketSupply.forEach((slot, idx) => {
    if (slot.card.cost <= 4 && slot.count > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <strong>${slot.card.name}</strong><br>
        <em>Type:</em> ${slot.card.type}<br>
        <em>Cost:</em> ${slot.card.cost}<br>
      `;

      cardEl.addEventListener('click', () => {
        // Deselect others
        Array.from(modalBody.children).forEach(c => c.classList.remove('selected'));
        // Select this one
        cardEl.classList.add('selected');
        selectedCardIndex.value = idx;
      });

      modalBody.appendChild(cardEl);
    }
  });

  // Show modal
  modal.classList.remove('hidden');

  modalConfirm.textContent = 'Gain Selected';
  modalConfirm.onclick = () => {
    if (selectedCardIndex.value !== null) {
      const chosenSlot = marketSupply[selectedCardIndex.value];
      if (chosenSlot.count > 0) {
        player.discard.push(chosenSlot.card);
        chosenSlot.count--;
  
        // 🎉 Add this line:
        player.log(`You gained a ${chosenSlot.card.name}!`);
      }
    }
  
    // Close modal and update UI
    modal.classList.add('hidden');
    renderHand();
    renderMarketplace();
    renderDeckInventory();
  };  
}

function handleVassalEffect(player, vassalCard) {
  // Play Vassal: +2 gold immediately
  playActionCard(player, vassalCard);
  player.bonusGold += 2;
  player.log("Vassal: +2 Gold");

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalTitle.textContent = 'Vassal Effect';
  modalBody.innerHTML = `
    <p>You've gained +2 gold! Click the card below to reveal the top card of your deck.</p>
  `;
  modalConfirm.classList.add('hidden'); // Hide confirm button for now

  if (player.deck.length === 0) {
    shuffleDiscardIntoDeck(player);
  }

  if (player.deck.length === 0) {
    modalBody.innerHTML += `<p>Your deck is empty. No card to reveal.</p>`;
    modalConfirm.classList.remove('hidden');
    modalConfirm.textContent = 'Continue';
    modalConfirm.onclick = () => {
      modal.classList.add('hidden');
      renderHand();
      renderMarketplace();
      renderDeckInventory();
    };
    modal.classList.remove('hidden');
    return;
  }

  const topCard = player.deck.pop();

  const cardEl = document.createElement('div');
  cardEl.className = 'card card-back'; // Initially styled as face-down
  cardEl.innerHTML = `<em>Click to reveal</em>`;

  cardEl.addEventListener('click', () => {
    cardEl.classList.remove('card-back');
    cardEl.innerHTML = `
      <strong>${topCard.name}</strong><br>
      <em>Type:</em> ${topCard.type}<br>
      <em>Cost:</em> ${topCard.cost}
    `;

    if (topCard.type === 'Action') {
      modalBody.innerHTML += `<p>It's an Action card! Play it or discard it?</p>`;
      modalConfirm.classList.remove('hidden');
      modalConfirm.textContent = 'Play This Card';

      // Play it if they click confirm
      modalConfirm.onclick = () => {
        playActionCard(player, topCard);
        player.log(`Vassal: You played ${topCard.name} for free!`);
        modal.classList.add('hidden');
        renderHand();
        renderMarketplace();
        renderDeckInventory();
      };

      // Add discard option
      const discardButton = document.createElement('button');
      discardButton.textContent = 'Discard Instead';
      discardButton.onclick = () => {
        player.discard.push(topCard);
        player.log(`Vassal: You discarded ${topCard.name}.`);
        modal.classList.add('hidden');
        renderHand();
        renderMarketplace();
        renderDeckInventory();
      };
      modalBody.appendChild(discardButton);
    } else {
      player.discard.push(topCard);
      modalBody.innerHTML += `<p>It's not an Action card. It has been discarded.</p>`;
      modalConfirm.classList.remove('hidden');
      modalConfirm.textContent = 'Continue';
      modalConfirm.onclick = () => {
        modal.classList.add('hidden');
        renderHand();
        renderMarketplace();
        renderDeckInventory();
      };
    }
  });

  modalBody.appendChild(cardEl);
  modal.classList.remove('hidden');
}
