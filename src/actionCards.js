import { GAME_CONFIG } from './constants.js';
import { handleThroneRoomEffect } from './throneRoom.js';


function prepareConfirmButton(options = {}) {
  if (window.uiManager && typeof window.uiManager.getFreshModalConfirmButton === 'function') {
    return window.uiManager.getFreshModalConfirmButton(options);
  }

  const button = document.getElementById('modal-confirm');
  if (button) {
    if (options.text) {
      button.textContent = options.text;
    }
    button.classList.toggle('hidden', Boolean(options.hidden));
    button.onclick = null;
  }
  return button;
}


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
      // Create discard copy BEFORE drawing cards (which might shuffle discard into deck)
      const discardCopy = [...player.discard];
      window.gameEngine.drawCards(player, 1);
      player.actions += 1;
      gameEngine.logMessage("Harbinger: +1 Card, +1 Action");
      handleHarbingerEffect(player, card, gameEngine, discardCopy); 
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
  const confirmButton = prepareConfirmButton({ text: 'Discard Selected' });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose cards to discard for Cellar';
  const selectedCards = new Set();

  player.hand.forEach((c, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${c.type.toLowerCase().replace(/\s+/g, '-')}`;
    cardEl.innerHTML = `
      <div class="card-name">${c.name}</div>
      <div class="card-description">${c.description || ''}</div>
      <div class="card-coins">${c.value ? c.value + '*' : ''}</div>
      <div class="card-victory">${c.points ? c.points + 'pt' : ''}</div>
      <div class="card-image">${c.image ? `<img src="res/img/cards/${c.image}" alt="${c.name}">` : ''}</div>
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

  if (!confirmButton) {
    return;
  }

  confirmButton.classList.remove('hidden');
  confirmButton.onclick = () => {
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
    confirmButton.onclick = null;
    confirmButton.classList.add('hidden');
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

  const drawn = [];

  const drawNextCard = () => {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = window.gameEngine.shuffle(player.discard);
      player.discard = [];
    }

    if (player.deck.length > 0) {
      drawn.push(player.deck.pop());
    }
  };

  while (drawn.length < cardsNeeded) {
    const beforeLength = drawn.length;
    drawNextCard();
    if (drawn.length === beforeLength) {
      break; // No more cards to draw
    }
  }

  const renderDrawnCards = () => {
    libraryHand.innerHTML = '';

    const drawIntro = document.createElement('p');
    drawIntro.textContent = `Here are your next ${drawn.length} card(s):`;
    libraryHand.appendChild(drawIntro);

    drawn.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = `card ${card.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardDiv.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-description">${card.description || ''}</div>
        <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
        <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
        <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
      `;

      if (card.type.includes('Action')) {
        const discardButton = document.createElement('button');
        discardButton.textContent = 'Set Aside';
        discardButton.onclick = () => {
          player.discard.push(card);
          drawn.splice(index, 1);
          drawNextCard();
          renderDrawnCards();
        };
        cardDiv.appendChild(discardButton);
      }

      libraryHand.appendChild(cardDiv);
    });

    if (drawn.length > 0) {
      confirmButton.classList.remove('hidden');
      confirmButton.textContent = "That's 7!";
    } else {
      confirmButton.classList.add('hidden');
    }
  };

  renderDrawnCards();

  confirmButton.onclick = () => {
    player.hand.push(...drawn);
    window.uiManager.refreshAfterActionCard();
    modal.classList.add('hidden');
  };
}

function handleChapelEffect(player, chapelCard, gameEngine) {
  // Note: Chapel card is already in play area, no need to remove from hand

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = prepareConfirmButton({ hidden: true });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose up to 4 cards to trash';
  const selectedCards = new Set();

  player.hand.forEach((c, idx) => {
    // Only exclude the specific played Chapel card (it should already be in play area)
    const cardEl = document.createElement('div');
    cardEl.className = `card ${c.type.toLowerCase().replace(/\s+/g, '-')}`;
    cardEl.innerHTML = `
      <div class="card-name">${c.name}</div>
      <div class="card-description">${c.description || ''}</div>
      <div class="card-coins">${c.value ? c.value + '*' : ''}</div>
      <div class="card-victory">${c.points ? c.points + 'pt' : ''}</div>
      <div class="card-image">${c.image ? `<img src="res/img/cards/${c.image}" alt="${c.name}">` : ''}</div>
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
  });

  // Show modal
  modal.classList.remove('hidden');

  if (!confirmButton) {
    return;
  }

  confirmButton.classList.remove('hidden');
  confirmButton.textContent = 'Trash Selected';
  confirmButton.onclick = () => {
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
      confirmButton.onclick = null;
      confirmButton.classList.add('hidden');
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
  const confirmButton = prepareConfirmButton({ text: 'Gain Selected' });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Choose a card costing up to 4';
  const selectedCardIndex = { value: null };

  // Filter marketSupply for cards costing <= 4
  window.currentMarketSupply.forEach((slot, idx) => {
    if (slot.card.cost <= 4 && slot.count > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardEl.innerHTML = `
        <div class="card-name">${slot.card.name}</div>
        <div class="card-description">${slot.card.description || ''}</div>
        <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
        <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
        <div class="card-image">${slot.card.image ? `<img src="res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
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
  if (!confirmButton) return;

  confirmButton.onclick = () => {
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
    confirmButton.onclick = null;
    confirmButton.classList.add('hidden');
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
  let confirmButton = prepareConfirmButton({ text: 'Trash Selected' });

  modalTitle.textContent = 'Vassal Effect';
  modalBody.innerHTML = `
    <div class="vassal">
      <p>You've gained +2 gold! Click the card below to reveal the top card of your deck.</p>
    </div>
  `;
  if (!confirmButton) return;
  confirmButton.classList.add('hidden');

  if (player.deck.length === 0) {
    window.gameEngine.shuffleDiscardIntoDeck();
  }

  if (player.deck.length === 0) {
    modalBody.innerHTML += `<p>Your deck is empty. No card to reveal.</p>`;
    confirmButton.classList.remove('hidden');
    confirmButton.textContent = 'Continue';
    confirmButton.onclick = () => {
      modal.classList.add('hidden');
      confirmButton.onclick = null;
      window.uiManager.refreshAfterActionCard();
    };
    modal.classList.remove('hidden');
    return;
  }

  const topCard = player.deck.pop();

  const cardEl = document.createElement('div');
  cardEl.className = `card card-back ${topCard.type.toLowerCase().replace(/\s+/g, '-')}`; // Initially styled as face-down
  cardEl.innerHTML = `<em>Click to reveal</em>`;

  cardEl.addEventListener('click', () => {
    cardEl.classList.remove('card-back');
    cardEl.innerHTML = `
      <div class="card-name">${topCard.name}</div>
      <div class="card-description">${topCard.description || ''}</div>
      <div class="card-coins">${topCard.value ? topCard.value + '*' : ''}</div>
      <div class="card-victory">${topCard.points ? topCard.points + 'pt' : ''}</div>
      <div class="card-image">${topCard.image ? `<img src="res/img/cards/${topCard.image}" alt="${topCard.name}">` : ''}</div>
    `;

    if (topCard.type === 'Action') {
      modalBody.innerHTML += `<br /><p>It's an Action card! Play it or discard it?</p>`;
      confirmButton.classList.remove('hidden');
      confirmButton.textContent = 'Play This Card';

      // Play it if they click confirm
      confirmButton.onclick = () => {
        gameEngine.logMessage(`Vassal: You played ${topCard.name} for free!`);

        // Add the card to play area (like a normal action card play)
        player.playArea.push(topCard);

        // Close the Vassal modal first
        modal.classList.add('hidden');
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');

        // Execute the action card effect (this may open its own modal)
        playActionCardEffect(topCard, player, gameEngine);

        // Update UI
        window.uiManager.refreshAfterActionCard();
      };

      // Add discard option
      const discardButton = document.createElement('button');
      discardButton.className = 'discard-instead';
      discardButton.textContent = 'Discard Instead';
      discardButton.onclick = () => {
        player.discard.push(topCard);
        gameEngine.logMessage(`Vassal: You discarded ${topCard.name}.`);
        modal.classList.add('hidden');
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');
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
      
      confirmButton.classList.remove('hidden');
      confirmButton.textContent = 'Continue';
      confirmButton.onclick = () => {
        modal.classList.add('hidden');
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');
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
      player.deck = window.gameEngine.shuffle(player.discard);
      player.discard = [];
    }
    if (player.deck.length > 0) {
      drawnCards.push(player.deck.pop());
    }
  }

  // 2. Set up the modal
  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = prepareConfirmButton({ text: 'Put in Hand' });

  modalTitle.textContent = "Masquerade: Choose a card to keep";
  modalBody.innerHTML = '';
  modal.classList.remove('hidden');
  
  // Ensure confirm button is visible and labeled correctly for this flow
  if (!confirmButton) return;
  confirmButton.classList.remove('hidden');

  let selectedCard = null;

  // 3. Display the two drawn cards
  drawnCards.forEach((drawnCard) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${drawnCard.type.toLowerCase().replace(/\s+/g, '-')}`; // use the drawn card's type
    cardDiv.innerHTML = `
      <div class="card-name">${drawnCard.name}</div>
      <div class="card-description">${drawnCard.description || ''}</div>
      <div class="card-coins">${drawnCard.value ? drawnCard.value + '*' : ''}</div>
      <div class="card-victory">${drawnCard.points ? drawnCard.points + 'pt' : ''}</div>
      <div class="card-image">${drawnCard.image ? `<img src="res/img/cards/${drawnCard.image}" alt="${drawnCard.name}">` : ''}</div>
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
    confirmButton.classList.add('hidden');
    modalBody.innerHTML = '';

    // Update the UI
    window.uiManager.refreshAfterActionCard();
  }

  // Add the listener
  confirmButton.addEventListener('click', confirmChoice);
}

function handleHarbingerEffect(player, card, gameEngine, discardCopy) {

  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = prepareConfirmButton({ text: discardCopy.length === 0 ? 'Continue' : 'Put on Top' });

  let selectedCard = null;
  let currentPage = 0;
  const cardsPerPage = 10;

  if (!confirmButton) {
    return;
  }

  // Helper: Render a page of discard cards
  const renderPage = () => {
    modalBody.innerHTML = '';

    if (discardCopy.length === 0) {
      modalBody.innerHTML = '<p>No cards to choose from.</p>';
      confirmButton.textContent = 'Continue';
      return;
    }

    const start = currentPage * cardsPerPage;
    const end = start + cardsPerPage;
    const pageCards = discardCopy.slice(start, end);

    pageCards.forEach((cardObj) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = `card ${cardObj.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardDiv.innerHTML = `
        <div class="card-name">${cardObj.name}</div>
        <div class="card-description">${cardObj.description || ''}</div>
        <div class="card-coins">${cardObj.value ? cardObj.value + '*' : ''}</div>
        <div class="card-victory">${cardObj.points ? cardObj.points + 'pt' : ''}</div>
        <div class="card-image">${cardObj.image ? `<img src="res/img/cards/${cardObj.image}" alt="${cardObj.name}">` : ''}</div>
      `;

      cardDiv.addEventListener('click', () => {
        const previous = modalBody.querySelector('.selected');
        if (previous) previous.classList.remove('selected');

        cardDiv.classList.add('selected');
        selectedCard = cardObj;
      });

      modalBody.appendChild(cardDiv);
    });

    // Add page navigation
    const totalPages = Math.ceil(discardCopy.length / cardsPerPage);
    if (totalPages > 1) {
      const navDiv = document.createElement('div');
      navDiv.style.margin = '25px';
      navDiv.style.width = '100%';
      navDiv.innerHTML = `
        <button id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Prev</button>
        Page ${currentPage + 1} / ${totalPages}
        <button id="next-page" ${currentPage === totalPages - 1 ? 'disabled' : ''}>Next</button>
      `;
      modalBody.appendChild(navDiv);

      modalBody.querySelector('#prev-page').addEventListener('click', () => {
        if (currentPage > 0) {
          currentPage--;
          renderPage();
        }
      });

      modalBody.querySelector('#next-page').addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          renderPage();
        }
      });
    }
  };

  const confirmChoice = () => {
    if (discardCopy.length === 0) {
      modal.classList.add('hidden');
      confirmButton.onclick = null;
      confirmButton.classList.add('hidden');
      modalBody.innerHTML = '';
      return;
    }

    if (!selectedCard) {
      alert('Please select a card to put on top of your deck!');
      return;
    }

    let index = player.discard.indexOf(selectedCard);
    if (index === -1) {
      index = player.discard.findIndex(cardInDiscard => cardInDiscard.name === selectedCard.name);
    }

    if (index !== -1) {
      const [cardToMove] = player.discard.splice(index, 1);
      player.deck.push(cardToMove);
      gameEngine.logMessage(`Harbinger: Placed ${cardToMove.name} on top of your deck.`);
    }

    modal.classList.add('hidden');
    confirmButton.onclick = null;
    confirmButton.classList.add('hidden');
    modalBody.innerHTML = '';

    window.uiManager.refreshAfterActionCard();
  };

  // Set up the modal
  modalTitle.textContent = 'Harbinger: Choose a card to put on top of your deck';
  modal.classList.remove('hidden');
  confirmButton.classList.remove('hidden');
  confirmButton.textContent = discardCopy.length === 0 ? 'Continue' : 'Put on Top';
  confirmButton.onclick = confirmChoice;

  renderPage();
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
  let confirmButton = prepareConfirmButton({ text: 'Gain Selected' });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Feast: Choose a card costing up to 5 coins';
  const selectedCardIndex = { value: null };

  // Filter marketSupply for cards costing <= 5
  window.currentMarketSupply.forEach((slot, idx) => {
    if (slot.card.cost <= 5 && slot.count > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;
      cardEl.innerHTML = `
        <div class="card-name">${slot.card.name}</div>
        <div class="card-description">${slot.card.description || ''}</div>
        <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
        <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
        <div class="card-image">${slot.card.image ? `<img src="res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
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
  if (!confirmButton) return;

  confirmButton.onclick = () => {
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
    confirmButton.onclick = null;
    confirmButton.classList.add('hidden');
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
  let confirmButton = prepareConfirmButton({ text: 'Trash Selected' });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Mine: Choose a Treasure to trash';
  const selectedCardIndex = { value: null };

  // Show only Treasure cards from hand
  treasureCards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type.toLowerCase().replace(/\s+/g, '-')}`;
    cardEl.innerHTML = `
      <div class="card-name">${card.name}</div>
      <div class="card-description">${card.description || ''}</div>
      <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
      <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
      <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
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
  if (!confirmButton) return;

  confirmButton.onclick = () => {
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
          cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;
          cardEl.innerHTML = `
            <div class="card-name">${slot.card.name}</div>
            <div class="card-description">${slot.card.description || ''}</div>
            <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
            <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
            <div class="card-image">${slot.card.image ? `<img src="res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
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
      
      confirmButton = prepareConfirmButton({ text: 'Gain Selected' });
      if (!confirmButton) return;

      confirmButton.onclick = () => {
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
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');
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
  let confirmButton = prepareConfirmButton({ text: 'Trash Selected' });

  modalBody.innerHTML = '';
  modalTitle.textContent = 'Remodel: Choose a card to trash';
  const selectedCardIndex = { value: null };

  // Show all cards from hand
  player.hand.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type.toLowerCase().replace(/\s+/g, '-')}`;
    cardEl.innerHTML = `
      <div class="card-name">${card.name}</div>
      <div class="card-description">${card.description || ''}</div>
      <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
      <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
      <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
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
  if (!confirmButton) return;

  confirmButton.onclick = () => {
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
          cardEl.className = `card ${slot.card.type.toLowerCase().replace(/\s+/g, '-')}`;
          cardEl.innerHTML = `
            <div class="card-name">${slot.card.name}</div>
            <div class="card-type">${slot.card.type}</div>
            <div class="card-description">${slot.card.description || ''}</div>
            <div class="card-coins">${slot.card.value ? slot.card.value + '*' : ''}</div>
            <div class="card-victory">${slot.card.points ? slot.card.points + 'pt' : ''}</div>
            <div class="card-cost">Cost: ${slot.card.cost}</div>
            <div class="card-image">${slot.card.image ? `<img src="res/img/cards/${slot.card.image}" alt="${slot.card.name}">` : ''}</div>
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
      
      // Update the confirm button for the second step
      confirmButton = prepareConfirmButton({ text: 'Gain Selected' });
      if (!confirmButton) return;

      confirmButton.onclick = () => {
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
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');
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
      
      if (revealedCard.type === 'Treasure') {
        treasuresFound.push(revealedCard);
      }
    } else {
      break;
    }
  }
  
  // Show modal with revealed cards
  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = prepareConfirmButton({ text: 'Continue' });

  modal.classList.add('adventurer');
  modalBody.innerHTML = '';
  modalTitle.textContent = `Adventurer: Revealed ${revealedCards.length} cards`;
  
  // Create sections for treasures and non-treasures
  const treasureSection = document.createElement('div');
  treasureSection.className = 'adventurer-flex';
  treasureSection.innerHTML = `<h4>Treasures Found (${treasuresFound.length}/2) - Added to Hand:</h4>`;
  modalBody.appendChild(treasureSection);
  
  // Show found treasures
  treasuresFound.forEach(treasure => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${treasure.type.toLowerCase().replace(/\s+/g, '-')} treasure-found`;
    cardEl.innerHTML = `
      <div class="card-name">${treasure.name}</div>
      <div class="card-description">${treasure.description || ''}</div>
      <div class="card-coins">${treasure.value ? treasure.value + '*' : ''}</div>
      <div class="card-image">${treasure.image ? `<img src="res/img/cards/${treasure.image}" alt="${treasure.name}">` : ''}</div>
    `;
    treasureSection.appendChild(cardEl);
  });
  
  // Show discarded cards
  const nonTreasures = revealedCards.filter(card => !treasuresFound.includes(card));
  if (nonTreasures.length > 0) {
    const discardSection = document.createElement('div');
    discardSection.innerHTML = `<h4>Other Cards Revealed - Discarded (${nonTreasures.length}):</h4>`;
    modalBody.appendChild(discardSection);
    
    nonTreasures.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${card.type.toLowerCase().replace(/\s+/g, '-')} card-discarded`;
      cardEl.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-description">${card.description || ''}</div>
        <div class="card-coins">${card.value ? card.value + '*' : ''}</div>
        <div class="card-victory">${card.points ? card.points + 'pt' : ''}</div>
        <div class="card-image">${card.image ? `<img src="res/img/cards/${card.image}" alt="${card.name}">` : ''}</div>
      `;
      discardSection.appendChild(cardEl);
    });
  }
  
  // Set up confirm button
  if (!confirmButton) return;

  confirmButton.classList.remove('hidden');
  confirmButton.onclick = () => {
    // Add found Treasures to hand
    treasuresFound.forEach(treasure => {
      player.hand.push(treasure);
    });
    
    // Discard all other revealed cards
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

    // Close modal and update UI
    modal.classList.add('hidden');
    confirmButton.onclick = null;
    confirmButton.classList.add('hidden');
    window.uiManager.refreshAfterActionCard();
  };

  // Show the modal
  modal.classList.remove('hidden');
}

