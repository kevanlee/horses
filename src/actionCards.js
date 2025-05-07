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

    case "Great Hall":
      drawCards(player, 1);
      player.actions += 1;
      player.log("Great Hall: +1 Card, +1 Action");
      updateVictoryPoints(); // 🏆 Recalculate VP immediately
      break;

    case 'Masquerade':
      player.log("Masquerade: Draw 2 cards. Keep one.")
      handleMasqueradeEffect(player, card);
      break;
    
    case 'Harbinger':
      drawCards(player, 1);
      player.actions += 1;
      player.log("Harbinger: +1 Card, +1 Action");
      handleHarbingerEffect(player, card); 
      break;
    
    case "Council Room":
      drawCards(player, 4);
      player.buys += 1;
      player.log("Council Room: +4 Cards, +1 Buy");
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
      renderMarketplace(); // This will need to be implemented to update the available market cards
    };
  }
}

function handleChapelEffect(player, chapelCard) {
 // Remove Workshop from hand
  playActionCard(player, chapelCard);

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
      // Convert selected indices to array and sort descending to avoid index shifting issues
      const cardIndicesToTrash = Array.from(selectedCards).sort((a, b) => b - a);

      cardIndicesToTrash.forEach(i => {
        const [removed] = player.hand.splice(i, 1);
        player.trash.push(removed); 
      });
      

      // Close the modal and update the UI
      modal.classList.add('hidden');
      renderHand();
      renderDeckInventory();  
      updateVictoryPoints();
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

  const topCard = player.deck.shift();

  const cardEl = document.createElement('div');
  cardEl.className = 'card card-back'; // Initially styled as face-down
  cardEl.innerHTML = `<em>Click to reveal</em>`;

  cardEl.addEventListener('click', () => {
    cardEl.classList.remove('card-back');
    cardEl.innerHTML = `
      <strong>${topCard.name}</strong><br>
      <em>Type:</em> ${topCard.type}<br>
      <em>${topCard.description || ''}</em>
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

function handleMasqueradeEffect(player, card) {
  // 1. Draw 2 cards (reshuffle if needed)
  const drawnCards = [];
  for (let i = 0; i < 2; i++) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = [...player.discard];
      player.discard = [];
      shuffle(player.deck);
    }
    if (player.deck.length > 0) {
      drawnCards.push(player.deck.shift());
    }
  }

  // 2. Set up the modal
  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = document.getElementById('modal-confirm');

  modalTitle.textContent = "Masquerade: Choose a card to keep";
  modalBody.innerHTML = '';
  modal.classList.remove('hidden');

  let selectedCard = null;

  // 3. Display the two drawn cards
  drawnCards.forEach((drawnCard) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card'; // same styling
    cardDiv.innerHTML = `
      <strong>${drawnCard.name}</strong><br>
      <em>Type:</em> ${drawnCard.type}</em><br>
      <em>Cost:</em> ${drawnCard.cost}</em><br>
      <em>${drawnCard.description || ''}</em>
    `;

    cardDiv.addEventListener('click', () => {
      // Deselect previous selection
      const previous = modalBody.querySelector('.selected');
      if (previous) previous.classList.remove('selected');

      // Select this card
      cardDiv.classList.add('selected');
      selectedCard = drawnCard;
    });

    modalBody.appendChild(cardDiv);
  });

  // 4. Handle Confirm button
  function confirmChoice() {
    if (!selectedCard) {
      alert("Please select a card to keep!");
      return;
    }

    // Add the selected card to hand
    player.hand.push(selectedCard);

    // Discard the other
    drawnCards.forEach(card => {
      if (card !== selectedCard) {
        player.discard.push(card);
      }
    });

    // Cleanup
    modal.classList.add('hidden');
    confirmButton.removeEventListener('click', confirmChoice);
    modalBody.innerHTML = '';

    // Update the UI
    renderHand();
    renderDeckAndDiscardCount();
    updateVictoryPoints();
    renderMarketplace();
  }

  // Add the listener
  confirmButton.addEventListener('click', confirmChoice);
}

function handleHarbingerEffect(player, card) {

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = document.getElementById('modal-confirm');

  let selectedCard = null;
  let currentPage = 0;
  const cardsPerPage = 10;

  const discardCopy = [...player.discard]; // Important: copy so we don't mutate during selection

  // Helper: Render a page of discard cards
  function renderPage() {
    modalBody.innerHTML = '';

    if (discardCopy.length === 0) {
      modalBody.innerHTML = "<p>No cards to choose from.</p>";
      return;
    }

    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const pageCards = discardCopy.slice(start, end);

    pageCards.forEach((cardObj) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'card';
      cardDiv.innerHTML = `
        <strong>${cardObj.name}</strong><br>
        <em>Type:</em> ${cardObj.type}<br>
        <em>Cost:</em> ${cardObj.cost}<br>
        <em>${cardObj.description || ''}</em>
      `;

      cardDiv.addEventListener('click', () => {
        // Deselect previous selection
        const previous = modalBody.querySelector('.selected');
        if (previous) previous.classList.remove('selected');

        // Select this card
        cardDiv.classList.add('selected');
        selectedCard = cardObj;
      });

      modalBody.appendChild(cardDiv);
    });

    // Add page navigation
    const totalPages = Math.ceil(discardCopy.length / cardsPerPage);
    if (totalPages > 1) {
      const navDiv = document.createElement('div');
      navDiv.style.marginTop = '10px';
      navDiv.innerHTML = `
        <button id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Prev</button>
        Page ${currentPage + 1} / ${totalPages}
        <button id="next-page" ${currentPage === totalPages - 1 ? 'disabled' : ''}>Next</button>
      `;
      modalBody.appendChild(navDiv);

      document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage--;
          renderPage();
        }
      });

      document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          renderPage();
        }
      });
    }
  }

  function confirmChoice() {
    if (discardCopy.length === 0) {
      modal.classList.add('hidden');
      confirmButton.removeEventListener('click', confirmChoice);
      modalBody.innerHTML = '';
      return;
    }

    if (!selectedCard) {
      alert("Please select a card to put on top of your deck!");
      return;
    }

    // Remove selectedCard from discard pile and put on top of deck
    const index = player.discard.indexOf(selectedCard);
    if (index !== -1) {
      player.discard.splice(index, 1);
      player.deck.push(selectedCard);
    }

    // Cleanup
    modal.classList.add('hidden');
    confirmButton.removeEventListener('click', confirmChoice);
    modalBody.innerHTML = '';

    // Update UI
    renderHand();
    renderDeckAndDiscardCount();
    updateVictoryPoints();
  }

  // Set up the modal
  modalTitle.textContent = "Harbinger: Choose a card to put on top of your deck";
  modal.classList.remove('hidden');
  renderPage();
  confirmButton.addEventListener('click', confirmChoice);
}

