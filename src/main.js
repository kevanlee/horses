import { createPlayer, drawCards } from './game.js';
import { cards } from './cards.js';

const player = createPlayer();
drawCards(player, 5);
renderDeckInventory();  // Display the initial deck inventory right after game setup

const handEl = document.getElementById('player-hand');
const marketplaceEl = document.getElementById('marketplace');
const logEl = document.getElementById('log');
const goldDisplay = document.getElementById('gold-display');

// Define the cards and their initial supply count in the marketplace
const marketSupply = [
  { card: cards.copper, count: 46 },
  { card: cards.silver, count: 40 },
  { card: cards.gold, count: 30 },
  { card: cards.estate, count: 8 },
  { card: cards.duchy, count: 8 },
  { card: cards.province, count: 8 },
  { card: cards.smithy, count: 10 },
  { card: cards.village, count: 10 },  // Add Village with 10 cards
  { card: cards.market, count: 10 }    // Add Market with 10 cards
];

function renderHand() {
  handEl.innerHTML = '<h2>Your Hand</h2>';
  player.hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <strong>${card.name}</strong><br>
      <em>Type:</em> ${card.type}<br>
      <em>Cost:</em> ${card.cost}<br>
      <em>${card.description || ''}</em>
    `;

    // Add "Play" button only if player has actions left and card is an Action type
    if (player.actions > 0 && card.type === 'Action') {
      const playBtn = document.createElement('button');
      playBtn.textContent = 'Play';
      playBtn.addEventListener('click', () => playActionCard(card));
      cardEl.appendChild(document.createElement('br'));
      cardEl.appendChild(playBtn);
    }

    handEl.appendChild(cardEl);
  });

  updateGoldDisplay();
  renderDeckAndDiscardCount();
}

function renderMarketplace() {
  marketplaceEl.innerHTML = '<h2>Marketplace</h2>';
  marketSupply.forEach((slot, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <strong>${slot.card.name}</strong><br>
      <em>Type:</em> ${slot.card.type}<br>
      <em>Cost:</em> ${slot.card.cost}<br>
      <em>${slot.card.description || ''}</em><br>
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
  player.discard.push(slot.card);
  slot.count -= 1;

  player.buys--;
  logMessage(`You bought a ${slot.card.name}.`);

  renderDeckAndDiscardCount();
  renderDeckInventory();
  renderMarketplace();
  renderActionsAndBuys();
  renderHand(); // Ensure hand reflects removed Treasures
}

renderHand();
renderMarketplace();

const nextTurnBtn = document.getElementById('next-turn');
nextTurnBtn.addEventListener('click', nextTurn);

function nextTurn() {
  player.actions = 1;
  player.buys = 1;

  player.discard.push(...player.hand);
  player.hand = [];

  drawCards(player, 5);

  renderDeckInventory();
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

  player.actions--;
  logMessage(`You played a ${card.name}.`);

  switch (card.name) {
    case "Smithy":
      drawCards(player, 3);
      logMessage("Smithy: +3 Cards");
      break;
    case "Village":
      drawCards(player, 1);
      player.actions += 2;
      logMessage("Village: +1 Card, +2 Actions");
      break;
    case "Market":
      drawCards(player, 1);
      player.actions += 1;
      player.buys += 1;
      player.gold += 1;
      logMessage("Market: +1 Card, +1 Action, +1 Buy, +1 Gold");
      break;
    default:
      logMessage(`${card.name} has no defined effect yet.`);
  }

  // Remove card from hand and place it in discard
  const index = player.hand.indexOf(card);
  if (index !== -1) {
    player.hand.splice(index, 1);
    player.discard.push(card);
  }

  updateGoldDisplay();
  renderActionsAndBuys();
  renderHand();
}

function renderDeckInventory() {
  const deckListEl = document.getElementById('deck-list');
  deckListEl.innerHTML = '';

  const cardCounts = {};

  [...player.deck, ...player.hand, ...player.discard].forEach(card => {
    if (cardCounts[card.name]) {
      cardCounts[card.name]++;
    } else {
      cardCounts[card.name] = 1;
    }
  });

  let totalCards = 0;
  for (const cardName in cardCounts) {
    const listItem = document.createElement('li');
    listItem.textContent = `${cardName}: ${cardCounts[cardName]}`;
    deckListEl.appendChild(listItem);
    totalCards += cardCounts[cardName];
  }

  const totalCountEl = document.createElement('li');
  totalCountEl.textContent = `Total Cards: ${totalCards}`;
  deckListEl.appendChild(totalCountEl);
}
