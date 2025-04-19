import { createPlayer, drawCards } from './game.js';
import { cards } from './cards.js';

const player = createPlayer();
drawCards(player, 5);
renderDeckInventory();  // Display the initial deck inventory right after game setup

const handEl = document.getElementById('player-hand');
const marketplaceEl = document.getElementById('marketplace');
const logEl = document.getElementById('log');
const goldDisplay = document.getElementById('gold-display');

const marketSupply = [
  { card: cards.smithy, count: 10 },
  { card: cards.estate, count: 8 },
  { card: cards.copper, count: 46 }
];

function renderHand() {
  handEl.innerHTML = '<h2>Your Hand</h2>';
  player.hand.forEach((card) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerText = card.name;
    handEl.appendChild(cardEl);
  });
  updateGoldDisplay();
  renderDeckAndDiscardCount();  // Add this line to update deck and discard counts
}

function renderMarketplace() {
  marketplaceEl.innerHTML = '<h2>Marketplace</h2>';
  marketSupply.forEach((slot, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <strong>${slot.card.name}</strong><br>
      Cost: ${slot.card.cost}<br>
      Left: ${slot.count}
    `;
    cardEl.addEventListener('click', () => buyCard(index));
    marketplaceEl.appendChild(cardEl);
  });
}

function updateGoldDisplay() {
  const gold = player.hand
    .filter(card => card.type === 'Treasure')
    .reduce((sum, card) => sum + card.value, 0);
  player.gold = gold;
  goldDisplay.textContent = `Gold: ${player.gold}`;
}

function logMessage(msg) {
  const entry = document.createElement('div');
  entry.textContent = msg;
  logEl.appendChild(entry);  // This adds the log message below the header
}

function buyCard(index) {
  const slot = marketSupply[index];
  const cost = slot.card.cost;

  // Check if we have enough Buys
  if (player.buys <= 0) {
    logMessage("You don't have any buys left this turn.");
    return;
  }

  const treasures = player.hand.filter(card => card.type === 'Treasure');
  const totalGold = treasures.reduce((sum, card) => sum + card.value, 0);

  if (slot.count <= 0) {
    logMessage(`${slot.card.name} is sold out.`);
    return;
  }

  if (totalGold < cost) {
    logMessage(`Not enough gold to buy ${slot.card.name}.`);
    return;
  }

  // Spend treasures to pay for the card
  let remainingCost = cost;
  for (let i = 0; i < player.hand.length && remainingCost > 0; i++) {
    const card = player.hand[i];
    if (card.type === 'Treasure') {
      remainingCost -= card.value;
      player.discard.push(card);  // Add treasure to discard pile
      player.hand.splice(i, 1);   // Remove from hand
      i--;  // Adjust index after splice
    }
  }

  // Add purchased card to discard pile
  player.discard.push(slot.card);  // Add the card to the discard pile
  slot.count -= 1;

  player.buys--;  // Decrement Buys by 1
  logMessage(`You bought a ${slot.card.name}.`);

  // Immediately update discard pile counter
  renderDeckAndDiscardCount();

  // Updates the deck inventory after buying a card
  renderDeckInventory();  

  renderMarketplace();
  renderActionsAndBuys();
}

renderHand();
renderMarketplace();

const nextTurnBtn = document.getElementById('next-turn');
nextTurnBtn.addEventListener('click', nextTurn);

function nextTurn() {
  // Reset Actions and Buys at the start of the next turn
  player.actions = 1;  // 1 action per turn by default
  player.buys = 1;     // 1 buy per turn by default

  // Discard current hand
  player.discard.push(...player.hand);
  player.hand = [];

  // Draw 5 new cards
  drawCards(player, 5);

  renderDeckInventory();  // Update the deck inventory after drawing new cards


  logMessage("You started a new turn.");
  renderHand();
  renderDeckAndDiscardCount();
  renderActionsAndBuys();
}

function renderDeckAndDiscardCount() {
  const deckCountEl = document.getElementById('deck-count');
  const discardCountEl = document.getElementById('discard-count');

  deckCountEl.textContent = `Deck: ${player.deck.length} cards`;
  discardCountEl.textContent = `Discard Pile: ${player.discard.length} cards`;
}

function renderActionsAndBuys() {
  const actionsLeftEl = document.getElementById('actions-left');
  const buysLeftEl = document.getElementById('buys-left');

  actionsLeftEl.textContent = `Actions: ${player.actions}`;
  buysLeftEl.textContent = `Buys: ${player.buys}`;
}

function playActionCard(card) {
  if (player.actions <= 0) {
    logMessage("No actions left to play.");
    return;
  }

  player.actions--;  // Use an action to play this card
  logMessage(`You played a ${card.name}.`);

  if (card.name === "Smithy") {
    player.actions++;  // Smithy gives +1 action
    logMessage("Smithy gave you +1 Action.");
  }

  renderActionsAndBuys();
}

function renderDeckInventory() {
  const deckListEl = document.getElementById('deck-list');
  deckListEl.innerHTML = ''; // Clear current inventory

  // Count the cards in the deck, hand, and discard pile
  const cardCounts = {};

  // Count cards in the player's deck, hand, and discard pile
  [...player.deck, ...player.hand, ...player.discard].forEach(card => {
    if (cardCounts[card.name]) {
      cardCounts[card.name]++;
    } else {
      cardCounts[card.name] = 1;
    }
  });

  // Render each card type and count
  let totalCards = 0;
  for (const cardName in cardCounts) {
    const listItem = document.createElement('li');
    listItem.textContent = `${cardName}: ${cardCounts[cardName]}`;
    deckListEl.appendChild(listItem);
    totalCards += cardCounts[cardName];
  }

  // Add total card count
  const totalCountEl = document.createElement('li');
  totalCountEl.textContent = `Total Cards: ${totalCards}`;
  deckListEl.appendChild(totalCountEl);
}
