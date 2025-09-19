// Throne Room Implementation
// Separate file to avoid conflicts with existing card logic

// Hard-coded effects for each action card when played via Throne Room
const THRONE_ROOM_EFFECTS = {
  // Simple cards (no modals) - just double the effects
  "Smithy": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 3);
    window.gameEngine.drawCards(player, 3);
    gameEngine.logMessage("Throne Room + Smithy: +6 Cards total");
  },

  "Village": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 1);
    player.actions += 2;
    window.gameEngine.drawCards(player, 1);
    player.actions += 2;
    gameEngine.logMessage("Throne Room + Village: +2 Cards, +4 Actions total");
  },

  "Market": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    player.buys += 1;
    player.bonusGold += 1;
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    player.buys += 1;
    player.bonusGold += 1;
    gameEngine.logMessage("Throne Room + Market: +2 Cards, +2 Actions, +2 Buys, +2 Gold total");
  },

  "Festival": (player, gameEngine) => {
    player.actions += 2;
    player.buys += 1;
    player.bonusGold += 2;
    player.actions += 2;
    player.buys += 1;
    player.bonusGold += 2;
    gameEngine.logMessage("Throne Room + Festival: +4 Actions, +2 Buys, +4 Gold total");
  },

  "Laboratory": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 2);
    player.actions += 1;
    window.gameEngine.drawCards(player, 2);
    player.actions += 1;
    gameEngine.logMessage("Throne Room + Laboratory: +4 Cards, +2 Actions total");
  },

  "Woodcutter": (player, gameEngine) => {
    player.buys += 1;
    player.bonusGold += 2;
    player.buys += 1;
    player.bonusGold += 2;
    gameEngine.logMessage("Throne Room + Woodcutter: +2 Buys, +4 Gold total");
  },

  "Great Hall": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    gameEngine.logMessage("Throne Room + Great Hall: +2 Cards, +2 Actions total");
    window.uiManager.updateVictoryPoints();
  },

  "Council Room": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 4);
    player.buys += 1;
    window.gameEngine.drawCards(player, 4);
    player.buys += 1;
    gameEngine.logMessage("Throne Room + Council Room: +8 Cards, +2 Buys total");
  },

  "Treasury": (player, gameEngine) => {
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    player.bonusGold += 1;
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    player.bonusGold += 1;
    gameEngine.logMessage("Throne Room + Treasury: +2 Cards, +2 Actions, +2 Gold total");
  },

  "Moneylender": (player, gameEngine) => {
    // Check if player has a Copper in hand
    const copperIndex = player.hand.findIndex(card => card.name === 'Copper');
    
    if (copperIndex !== -1) {
      // Trash the Copper and gain +3 coins (twice)
      const copper = player.hand.splice(copperIndex, 1)[0];
      player.trash.push(copper);
      player.bonusGold += 6; // +3 coins twice
      gameEngine.logMessage("Throne Room + Moneylender: Trashed 1 Copper for +6 coins total");
    } else {
      gameEngine.logMessage("Throne Room + Moneylender: No Copper in hand to trash.");
    }
  },

  // Modal cards - these need special handling
  "Cellar": (player, gameEngine) => {
    player.actions += 1;
    gameEngine.logMessage("Throne Room + Cellar: +1 Action. Choose cards to discard and draw (twice).");
    handleThroneRoomModalCard(player, "Cellar", gameEngine);
  },

  "Chapel": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Chapel: Choose cards to trash (twice).");
    handleThroneRoomModalCard(player, "Chapel", gameEngine);
  },

  "Workshop": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Workshop: Choose a card costing up to 4 coins to gain (twice).");
    handleThroneRoomModalCard(player, "Workshop", gameEngine);
  },

  "Feast": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Feast: Choose a card costing up to 5 coins to gain (twice).");
    handleThroneRoomModalCard(player, "Feast", gameEngine);
  },

  "Mine": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Mine: Choose a Treasure to trash and gain a better one (twice).");
    handleThroneRoomModalCard(player, "Mine", gameEngine);
  },

  "Remodel": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Remodel: Choose a card to trash and gain a better one (twice).");
    handleThroneRoomModalCard(player, "Remodel", gameEngine);
  },

  "Masquerade": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Masquerade: Draw 2 cards, keep one (twice).");
    handleThroneRoomModalCard(player, "Masquerade", gameEngine);
  },

  "Harbinger": (player, gameEngine) => {
    // Create discard copy BEFORE drawing cards (which might shuffle discard into deck)
    const discardCopy = [...player.discard];
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    window.gameEngine.drawCards(player, 1);
    player.actions += 1;
    gameEngine.logMessage("Throne Room + Harbinger: +2 Cards, +2 Actions. Choose cards to put on deck (twice).");
    handleThroneRoomModalCard(player, "Harbinger", gameEngine, discardCopy);
  },

  "Library": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Library: Draw until you have 7 cards, discard Action cards (twice).");
    handleThroneRoomModalCard(player, "Library", gameEngine);
  },

  "Vassal": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Vassal: +4 coins, reveal top cards and play Actions (twice).");
    handleThroneRoomModalCard(player, "Vassal", gameEngine);
  },

  "Adventurer": (player, gameEngine) => {
    gameEngine.logMessage("Throne Room + Adventurer: Reveal cards until 2 Treasures found (twice).");
    handleThroneRoomModalCard(player, "Adventurer", gameEngine);
  }
};

// Handle modal cards that need to be executed twice
function handleThroneRoomModalCard(player, cardName, gameEngine, discardCopy = null) {
  // For now, we'll execute the modal card effect twice sequentially
  // This is a simplified approach - in a full implementation, we'd need to
  // track the Throne Room state and ensure the modal appears twice
  
  gameEngine.logMessage(`Executing ${cardName} effect twice via Throne Room...`);
  
  // Import the original effect handlers
  import('../actionCards.js').then(module => {
    // Execute the effect twice
    // Note: This is a simplified approach - full implementation would need
    // more sophisticated state management
    gameEngine.logMessage("Note: Modal cards in Throne Room need special implementation");
  });
}

// Main Throne Room effect handler
export function handleThroneRoomEffect(player, throneRoomCard, gameEngine) {
  // Check if player has any Action cards in hand
  const actionCards = player.hand.filter(card => card.type.includes('Action'));
  
  if (actionCards.length === 0) {
    // No action cards in hand
    const modal = document.getElementById('card-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmButton = (window.uiManager && window.uiManager.getFreshModalConfirmButton({ text: 'Continue' })) || document.getElementById('modal-confirm');

    modalTitle.textContent = 'Throne Room';
    modalBody.innerHTML = '<p>You have no Action cards in your hand to play twice.</p>';

    if (confirmButton) {
      confirmButton.classList.remove('hidden');
      confirmButton.onclick = () => {
        modal.classList.add('hidden');
        confirmButton.onclick = null;
        confirmButton.classList.add('hidden');
        window.uiManager.refreshAfterActionCard();
      };
    }

    modal.classList.remove('hidden');
    return;
  }

  // Show modal to select Action card
  const modal = document.getElementById('card-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const confirmButton = (window.uiManager && window.uiManager.getFreshModalConfirmButton({ text: 'Play Twice' })) || document.getElementById('modal-confirm');

  modalTitle.textContent = 'Throne Room: Choose an Action card to play twice';
  modalBody.innerHTML = '';
  const selectedCardIndex = { value: null };

  // Show only Action cards from hand
  actionCards.forEach((card, idx) => {
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
  if (!confirmButton) {
    return;
  }

  confirmButton.classList.remove('hidden');
  confirmButton.onclick = () => {
    if (selectedCardIndex.value !== null) {
      const selectedCard = actionCards[selectedCardIndex.value];

      if (THRONE_ROOM_EFFECTS[selectedCard.name]) {
        THRONE_ROOM_EFFECTS[selectedCard.name](player, gameEngine);
      } else {
        gameEngine.logMessage(`Throne Room: ${selectedCard.name} is not yet implemented for Throne Room.`);
      }

      modal.classList.add('hidden');
      confirmButton.onclick = null;
      confirmButton.classList.add('hidden');
      window.uiManager.refreshAfterActionCard();
    } else {
      alert('Please select an Action card to play twice.');
    }
  };
}
