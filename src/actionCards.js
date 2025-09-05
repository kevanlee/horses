import { GAME_CONFIG } from './constants.js';
import { handleThroneRoomEffect } from './throneRoom.js';


// 👇 Central function that handles any action card
export function playActionCardEffect(card, player, gameEngine) {
  switch (card.name) {
    case "Smithy":
      window.gameEngine.drawCards(player, 3);
      gameEngine.logMessage("Smithy: +3 Cards");
      break;
      
    case "Village":
      window.gameEngine.drawCards(player, 1);
      player.actions += 2;
      gameEngine.logMessage("Village: +1 Card, +2 Actions");
      break;
      
    case "Market":
      window.gameEngine.drawCards(player, 1);
      player.actions += 1;
      player.buys += 1;
      player.bonusGold += 1; 
      gameEngine.logMessage("Market: +1 Card, +1 Action, +1 Buy, +1 Gold");
      break;

    case "Festival":
      player.actions += 2;
      player.buys += 1;
      player.bonusGold += 2;
      gameEngine.logMessage("Festival: +2 Actions, +1 Buy, +2 Gold");
      break;

    case "Cellar":
      player.actions += 1;
      gameEngine.logMessage("Cellar: +1 Action. Choose cards to discard and draw.");
      handleCellarEffect(player, card, gameEngine);
      break;

    case "Library":
      gameEngine.logMessage("Library: Draw until you have 7 cards, discard Action cards.");
      handleLibraryEffect(player, card, gameEngine);
      break;

    case "Laboratory":
      window.gameEngine.drawCards(player, 2);
      player.actions += 1;
      gameEngine.logMessage("Laboratory: +2 Cards, +1 Action");
      break;

    case 'Chapel':
      handleChapelEffect(player, card, gameEngine);  
      break;

    case 'Workshop':
      handleWorkshopEffect(player, card, gameEngine);
      break;

    case "Woodcutter":
      player.buys += 1;
      player.bonusGold += 2;
      gameEngine.logMessage("Woodcutter: +1 Buy, +2 Gold");
      break;
    
    case 'Vassal':
      handleVassalEffect(player, card, gameEngine);
      break;    

    case "Great Hall":
      window.gameEngine.drawCards(player, 1);
      player.actions += 1;
      gameEngine.logMessage("Great Hall: +1 Card, +1 Action");
      window.uiManager.updateVictoryPoints(); // 🏆 Recalculate VP immediately
      break;

    case 'Masquerade':
      gameEngine.logMessage("Masquerade: Draw 2 cards. Keep one.")
      handleMasqueradeEffect(player, card, gameEngine);
      break;
    
    case 'Harbinger':
      window.gameEngine.drawCards(player, 1);
      player.actions += 1;
      gameEngine.logMessage("Harbinger: +1 Card, +1 Action");
      handleHarbingerEffect(player, card, gameEngine); 
      break;
    
    case "Council Room":
      window.gameEngine.drawCards(player, 4);
      player.buys += 1;
      gameEngine.logMessage("Council Room: +4 Cards, +1 Buy");
      break;

    case "Feast":
      handleFeastEffect(player, card, gameEngine);
      break;

    case "Moneylender":
      handleMoneylenderEffect(player, card, gameEngine);
      break;

    case "Gardens":
      // Gardens has no immediate effect - VP is calculated in updateVictoryPoints
      gameEngine.logMessage("Gardens: Worth 1 VP for every 10 cards in your deck.");
      break;

    case "Treasury":
      window.gameEngine.drawCards(player, 1);
      player.actions += 1;
      player.bonusGold += 1;
      gameEngine.logMessage("Treasury: +1 Card, +1 Action, +1 Coin");
      break;

    case "Mine":
      handleMineEffect(player, card, gameEngine);
      break;

    case "Remodel":
      handleRemodelEffect(player, card, gameEngine);
      break;

    case "Adventurer":
      handleAdventurerEffect(player, card, gameEngine);
      break;

    case "Throne Room":
      handleThroneRoomEffect(player, card, gameEngine);
      break;

    default:
      gameEngine.logMessage(`${card.name} has no effect yet.`);
  }
}

function handleCellarEffect(player, cellarCard, gameEngine) {
  // Note: Cellar card is already in play area, no need to remove from hand

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
      <div class="card-name">${c.name}</div>
      <div class="card-type">${c.type}</div>
      <div class="card-description">${c.description || ''}</div>
      <div class="card-coins">${c.value ? c.value + '*' : ''}</div>
      <div class="card-victory">${c.points ? c.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${c.cost}</div>
      <div class="card-image"></div>
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
    window.gameEngine.drawCards(player, numToDraw);

    // Close modal and update UI
    modal.classList.add('hidden');
    window.uiManager.refreshAfterActionCard();
  };
}

function handleLibraryEffect(player, libraryCard, gameEngine) {
  // Note: Library card is already in play area, no need to remove from hand

  const modal = document.getElementById('library-modal');
  const text = document.getElementById('library-modal-text');
  const libraryHand = document.getElementById('library-hand');
  const confirmButton = document.getElementById('library-modal-confirm');

  // Reset modal content
  modal.classList.remove('hidden');
  libraryHand.innerHTML = ''; // Clear previous cards
  confirmButton.classList.add('hidden'); // Initially hide the confirm button

  const currentHandSize = player.hand.length;
  const cardsNeeded = GAME_CONFIG.LIBRARY_TARGET_HAND_SIZE - currentHandSize;

  // Display how many cards are needed
  text.textContent = `You currently have ${currentHandSize} cards. You need to draw ${cardsNeeded} more card(s).`;

  let drawn = [];
  for (let i = 0; i < cardsNeeded; i++) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = window.gameEngine.shuffle(player.discard);
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
    cardDiv.innerHTML = `<div class="card-name">${card.name}</div><div class="card-type">${card.type}</div><div class="card-description">${card.description || ''}</div><div class="card-coins">${card.value ? card.value + '*' : ''}</div><div class="card-victory">${card.points ? card.points + 'pt' : ''}</div><div class="card-cost">Cost: ${card.cost}</div><div class="card-image"></div>`;

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
          player.deck = window.gameEngine.shuffle(player.discard);
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
      window.uiManager.refreshAfterActionCard(); // Use the new UI manager
      modal.classList.add('hidden');
    };
  }
}

function handleChapelEffect(player, chapelCard, gameEngine) {
  // Note: Chapel card is already in play area, no need to remove from hand

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
        <div class="card-name">${c.name}</div>
        <div class="card-type">${c.type}</div>
        <div class="card-cost">Cost: ${c.cost}</div>
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
      window.uiManager.refreshAfterActionCard();
      window.uiManager.updateVictoryPoints();
    } else {
      alert('Please select at least one card to trash.');
    }
  };
}

function handleWorkshopEffect(player, workshopCard, gameEngine) {
  // Note: Workshop card is already in play area, no need to remove from hand

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose a card costing up to 4';
  const selectedCardIndex = { value: null };

  // Filter marketSupply for cards costing <= 4
  window.currentMarketSupply.forEach((slot, idx) => {
    if (slot.card.cost <= 4 && slot.count > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <div class="card-name">${slot.card.name}</div>
        <div class="card-type">${slot.card.type}</div>
        <div class="card-description">${slot.card.description || ''}</div>
        <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
        <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
        <div class="card-cost">Cost: ${slot.card.cost}</div>
        <div class="card-image"></div>
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
      const chosenSlot = window.currentMarketSupply[selectedCardIndex.value];
      if (chosenSlot.count > 0) {
        player.discard.push(chosenSlot.card);
        chosenSlot.count--;
  
        // 🎉 Add this line:
        gameEngine.logMessage(`You gained a ${chosenSlot.card.name}!`);
      }
    }
  
    // Close modal and update UI
    modal.classList.add('hidden');
    window.uiManager.refreshAfterActionCard();
  };
}

function handleVassalEffect(player, vassalCard, gameEngine) {
  // Note: Vassal card is already in play area, no need to remove from hand
  player.bonusGold += 2;
  gameEngine.logMessage("Vassal: +2 Gold");

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
    window.gameEngine.shuffleDiscardIntoDeck();
  }

  if (player.deck.length === 0) {
    modalBody.innerHTML += `<p>Your deck is empty. No card to reveal.</p>`;
    modalConfirm.classList.remove('hidden');
    modalConfirm.textContent = 'Continue';
    modalConfirm.onclick = () => {
      modal.classList.add('hidden');
      window.uiManager.refreshAfterActionCard();
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
      <div class="card-name">${topCard.name}</div>
      <div class="card-type">${topCard.type}</div>
      <div class="card-description">${topCard.description || ''}</div>
      <div class="card-coins">${topCard.value ? topCard.value + '*' : ''}</div>
      <div class="card-victory">${topCard.points ? topCard.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${topCard.cost}</div>
      <div class="card-image"></div>
    `;

    if (topCard.type === 'Action') {
      modalBody.innerHTML += `<p>It's an Action card! Play it or discard it?</p>`;
      modalConfirm.classList.remove('hidden');
      modalConfirm.textContent = 'Play This Card';

      // Play it if they click confirm
      modalConfirm.onclick = () => {
        gameEngine.logMessage(`Vassal: You played ${topCard.name} for free!`);
        
        // Add the card to play area (like a normal action card play)
        player.playArea.push(topCard);
        
        // Execute the action card effect
        playActionCardEffect(topCard, player, gameEngine);
        
        modal.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };

      // Add discard option
      const discardButton = document.createElement('button');
      discardButton.textContent = 'Discard Instead';
      discardButton.onclick = () => {
        player.discard.push(topCard);
        gameEngine.logMessage(`Vassal: You discarded ${topCard.name}.`);
        modal.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };
      modalBody.appendChild(discardButton);
    } else {
      player.discard.push(topCard);
      gameEngine.logMessage(`Vassal: You discarded ${topCard.name}.`);
      
      // Create a new paragraph element instead of using innerHTML +=
      const discardMessage = document.createElement('p');
      discardMessage.textContent = `It's not an Action card. It has been discarded.`;
      modalBody.appendChild(discardMessage);
      
      modalConfirm.classList.remove('hidden');
      modalConfirm.textContent = 'Continue';
      modalConfirm.onclick = () => {
        modal.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };
    }
  });

  modalBody.appendChild(cardEl);
  modal.classList.remove('hidden');
}

function handleMasqueradeEffect(player, card, gameEngine) {
  // 1. Draw 2 cards (reshuffle if needed)
  const drawnCards = [];
  for (let i = 0; i < 2; i++) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = [...player.discard];
      player.discard = [];
      window.gameEngine.shuffle(player.deck);
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
      <div class="card-name">${drawnCard.name}</div>
      <div class="card-type">${drawnCard.type}</div>
      <div class="card-description">${drawnCard.description || ''}</div>
      <div class="card-coins">${drawnCard.value ? drawnCard.value + '*' : ''}</div>
      <div class="card-victory">${drawnCard.points ? drawnCard.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${drawnCard.cost}</div>
      <div class="card-image"></div>
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
    window.uiManager.refreshAfterActionCard();
  }

  // Add the listener
  confirmButton.addEventListener('click', confirmChoice);
}

function handleHarbingerEffect(player, card, gameEngine) {

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
        <div class="card-name">${cardObj.name}</div>
        <div class="card-type">${cardObj.type}</div>
        <div class="card-description">${cardObj.description || ''}</div>
        <div class="card-coins">${cardObj.value ? cardObj.value + '*' : ''}</div>
        <div class="card-victory">${cardObj.points ? cardObj.points + 'pt' : ''}</div>
        <div class="card-cost">Cost: ${cardObj.cost}</div>
        <div class="card-image"></div>
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
    window.uiManager.refreshAfterActionCard();
  }

  // Set up the modal
  modalTitle.textContent = "Harbinger: Choose a card to put on top of your deck";
  modal.classList.remove('hidden');
  renderPage();
  confirmButton.addEventListener('click', confirmChoice);
}

function handleFeastEffect(player, feastCard, gameEngine) {
  // First, trash the Feast card (remove from play area and add to trash)
  const feastIndex = player.playArea.indexOf(feastCard);
  if (feastIndex !== -1) {
    player.playArea.splice(feastIndex, 1);
    player.trash.push(feastCard);
  }
  
  gameEngine.logMessage("Feast: Trashed this card. Choose a card costing up to 5 coins.");

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Feast: Choose a card costing up to 5 coins';
  const selectedCardIndex = { value: null };

  // Filter marketSupply for cards costing <= 5
  window.currentMarketSupply.forEach((slot, idx) => {
    if (slot.card.cost <= 5 && slot.count > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.innerHTML = `
        <div class="card-name">${slot.card.name}</div>
        <div class="card-type">${slot.card.type}</div>
        <div class="card-cost">Cost: ${slot.card.cost}</div>
        <div class="card-coins">${slot.card.coins || ''}</div>
        <div class="card-victory">${slot.card.victory || ''}</div>
        <div class="card-description">${slot.card.description || ''}</div>
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
      const chosenSlot = window.currentMarketSupply[selectedCardIndex.value];
      if (chosenSlot.count > 0) {
        player.discard.push(chosenSlot.card);
        chosenSlot.count--;
        
        gameEngine.logMessage(`Feast: You gained a ${chosenSlot.card.name}!`);
      }
    }

    // Close modal and update UI
    modal.classList.add('hidden');
    window.uiManager.refreshAfterActionCard();
  };
}

function handleMoneylenderEffect(player, moneylenderCard, gameEngine) {
  // Check if player has a Copper in hand
  const copperIndex = player.hand.findIndex(card => card.name === 'Copper');
  
  if (copperIndex !== -1) {
    // Trash the Copper and gain +3 coins
    const copper = player.hand.splice(copperIndex, 1)[0];
    player.trash.push(copper);
    player.bonusGold += 3;
    
    gameEngine.logMessage("Moneylender: Trashed a Copper for +3 coins.");
  } else {
    gameEngine.logMessage("Moneylender: No Copper in hand to trash.");
  }
}

function handleMineEffect(player, mineCard, gameEngine) {
  // Check if player has any Treasure cards in hand
  const treasureCards = player.hand.filter(card => card.type === 'Treasure');
  
  if (treasureCards.length === 0) {
    gameEngine.logMessage("Mine: No Treasure cards in hand to trash.");
    return;
  }

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Mine: Choose a Treasure to trash';
  const selectedCardIndex = { value: null };

  // Show only Treasure cards from hand
  treasureCards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <div class="card-name">${card.name}</div>
      <div class="card-type">${card.type}</div>
      <div class="card-description">${card.description || ''}</div>
      <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
      <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${card.cost}</div>
      <div class="card-value">${card.value}</div>
      <div class="card-image"></div>
    `;
    cardEl.addEventListener('click', () => {
      // Deselect others
      Array.from(modalBody.children).forEach(c => c.classList.remove('selected'));
      // Select this one
      cardEl.classList.add('selected');
      selectedCardIndex.value = idx;
    });
    modalBody.appendChild(cardEl);
  });

  modal.classList.remove('hidden');
  modalConfirm.textContent = 'Trash Selected';
  modalConfirm.onclick = () => {
    if (selectedCardIndex.value !== null) {
      const selectedTreasure = treasureCards[selectedCardIndex.value];
      const maxCost = selectedTreasure.cost + 3;
      
      // Trash the selected treasure
      const handIndex = player.hand.indexOf(selectedTreasure);
      if (handIndex !== -1) {
        player.hand.splice(handIndex, 1);
        player.trash.push(selectedTreasure);
      }
      
      // Now show cards to gain
      modalBody.innerHTML = '';
      modalTitle.textContent = `Mine: Choose a Treasure costing up to ${maxCost} coins`;
      const selectedGainIndex = { value: null };
      
      // Filter marketSupply for Treasure cards costing <= maxCost
      window.currentMarketSupply.forEach((slot, idx) => {
        if (slot.card.type === 'Treasure' && slot.card.cost <= maxCost && slot.count > 0) {
          const cardEl = document.createElement('div');
          cardEl.className = 'card';
          cardEl.innerHTML = `
            <div class="card-name">${slot.card.name}</div>
            <div class="card-type">${slot.card.type}</div>
            <div class="card-description">${slot.card.description || ''}</div>
            <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
            <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
            <div class="card-cost">Cost: ${slot.card.cost}</div>
            <div class="card-value">${slot.card.value}</div>
            <div class="card-image"></div>
          `;
          cardEl.addEventListener('click', () => {
            // Deselect others
            Array.from(modalBody.children).forEach(c => c.classList.remove('selected'));
            // Select this one
            cardEl.classList.add('selected');
            selectedGainIndex.value = idx;
          });
          modalBody.appendChild(cardEl);
        }
      });
      
      modalConfirm.textContent = 'Gain Selected';
      modalConfirm.onclick = () => {
        if (selectedGainIndex.value !== null) {
          const chosenSlot = window.currentMarketSupply[selectedGainIndex.value];
          if (chosenSlot.count > 0) {
            player.hand.push(chosenSlot.card);
            chosenSlot.count--;
            
            gameEngine.logMessage(`Mine: Trashed ${selectedTreasure.name} and gained ${chosenSlot.card.name} to hand!`);
          }
        }

        // Close modal and update UI
        modal.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };
    } else {
      alert('Please select a Treasure to trash.');
    }
  };
}

function handleRemodelEffect(player, remodelCard, gameEngine) {
  // Check if player has any cards in hand
  if (player.hand.length === 0) {
    gameEngine.logMessage("Remodel: No cards in hand to trash.");
    return;
  }

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Remodel: Choose a card to trash';
  const selectedCardIndex = { value: null };

  // Show all cards from hand
  player.hand.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <div class="card-name">${card.name}</div>
      <div class="card-type">${card.type}</div>
      <div class="card-description">${card.description || ''}</div>
      <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
      <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
      <div class="card-cost">Cost: ${card.cost}</div>
      <div class="card-image"></div>
    `;
    cardEl.addEventListener('click', () => {
      // Deselect others
      Array.from(modalBody.children).forEach(c => c.classList.remove('selected'));
      // Select this one
      cardEl.classList.add('selected');
      selectedCardIndex.value = idx;
    });
    modalBody.appendChild(cardEl);
  });

  modal.classList.remove('hidden');
  modalConfirm.textContent = 'Trash Selected';
  modalConfirm.onclick = () => {
    if (selectedCardIndex.value !== null) {
      const selectedCard = player.hand[selectedCardIndex.value];
      const maxCost = selectedCard.cost + 2;
      
      // Trash the selected card
      const handIndex = player.hand.indexOf(selectedCard);
      if (handIndex !== -1) {
        player.hand.splice(handIndex, 1);
        player.trash.push(selectedCard);
      }
      
      // Now show cards to gain
      modalBody.innerHTML = '';
      modalTitle.textContent = `Remodel: Choose a card costing up to ${maxCost} coins`;
      const selectedGainIndex = { value: null };
      
      // Filter marketSupply for cards costing <= maxCost
      window.currentMarketSupply.forEach((slot, idx) => {
        if (slot.card.cost <= maxCost && slot.count > 0) {
          const cardEl = document.createElement('div');
          cardEl.className = 'card';
          cardEl.innerHTML = `
            <div class="card-name">${slot.card.name}</div>
            <div class="card-type">${slot.card.type}</div>
            <div class="card-cost">Cost: ${slot.card.cost}</div>
            <div class="card-description">${slot.card.description || ''}</div>
          `;
          cardEl.addEventListener('click', () => {
            // Deselect others
            Array.from(modalBody.children).forEach(c => c.classList.remove('selected'));
            // Select this one
            cardEl.classList.add('selected');
            selectedGainIndex.value = idx;
          });
          modalBody.appendChild(cardEl);
        }
      });
      
      modalConfirm.textContent = 'Gain Selected';
      modalConfirm.onclick = () => {
        if (selectedGainIndex.value !== null) {
          const chosenSlot = window.currentMarketSupply[selectedGainIndex.value];
          if (chosenSlot.count > 0) {
            player.discard.push(chosenSlot.card);
            chosenSlot.count--;
            
            gameEngine.logMessage(`Remodel: Trashed ${selectedCard.name} and gained ${chosenSlot.card.name}!`);
          }
        }

        // Close modal and update UI
        modal.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };
    } else {
      alert('Please select a card to trash.');
    }
  };
}

function handleAdventurerEffect(player, adventurerCard, gameEngine) {
  gameEngine.logMessage("Adventurer: Revealing cards until 2 Treasures are found...");
  
  const revealedCards = [];
  const treasuresFound = [];
  let cardsRevealed = 0;
  
  // Keep revealing until we find 2 Treasures or run out of cards
  while (treasuresFound.length < 2) {
    // Check if deck is empty and shuffle if needed
    if (player.deck.length === 0) {
      if (player.discard.length > 0) {
        player.deck = window.gameEngine.shuffle([...player.discard]);
        player.discard = [];
        gameEngine.logMessage("Shuffled discard pile into deck.");
      } else {
        // No more cards to reveal
        break;
      }
    }
    
    // Reveal top card
    if (player.deck.length > 0) {
      const revealedCard = player.deck.pop();
      revealedCards.push(revealedCard);
      cardsRevealed++;
      
      if (revealedCard.type === 'Treasure') {
        treasuresFound.push(revealedCard);
        gameEngine.logMessage(`Revealed ${revealedCard.name} (Treasure #${treasuresFound.length})`);
      } else {
        gameEngine.logMessage(`Revealed ${revealedCard.name} (not a Treasure)`);
      }
    } else {
      break;
    }
  }
  
  // Add found Treasures to hand
  treasuresFound.forEach(treasure => {
    player.hand.push(treasure);
  });
  
  // Discard all other revealed cards
  const nonTreasures = revealedCards.filter(card => !treasuresFound.includes(card));
  nonTreasures.forEach(card => {
    player.discard.push(card);
  });
  
  // Log results
  if (treasuresFound.length === 2) {
    gameEngine.logMessage(`Adventurer: Found 2 Treasures (${treasuresFound.map(t => t.name).join(', ')}) and added them to hand.`);
  } else if (treasuresFound.length === 1) {
    gameEngine.logMessage(`Adventurer: Found only 1 Treasure (${treasuresFound[0].name}) and added it to hand.`);
  } else {
    gameEngine.logMessage("Adventurer: No Treasures found in deck.");
  }
  
  if (nonTreasures.length > 0) {
    gameEngine.logMessage(`Discarded ${nonTreasures.length} non-Treasure cards.`);
  }
}

