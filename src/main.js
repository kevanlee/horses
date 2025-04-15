// src/main.js

let cred = 0;
let deck = [];
let hand = [];
let discardPile = [];
const maxHandSize = 3;
let teamSlots = 0;

const gameState = {
  cred: 0,
  clickMultiplier: 1,
  passiveIncome: 0,
  extraDrawNextRound: 0,
  autoClickInterval: null,
  ownedCards: []  // Track owned cards
};

const availableCards = [
  {
    id: 1,
    name: "Auto Clicker",
    type: "boost",
    cost: 30,
    description: "Auto-clicks at 1 click every 1.5 seconds.",
    effect: (state) => {
      if (!state.autoClickInterval) {
        state.autoClickInterval = setInterval(() => {
          cred += 1 * gameState.clickMultiplier;
          updateCredDisplay();
        }, 1500);
      }
    }
  },
  {
    id: 2,
    name: "Scout Prospect",
    type: "utility",
    cost: 10,
    description: "Draw 1 extra card next round",
    effect: (state) => { state.extraDrawNextRound += 1; }
  },
  {
    id: 3,
    name: "Sign All-Star",
    type: "boost",
    cost: 50,
    description: "2x Cred per click for 30 sec",
    effect: (state) => {
      state.clickMultiplier = 2;
      setTimeout(() => state.clickMultiplier = 1, 30000);
    }
  },
  {
    id: 4,
    name: "Hire Analytics Team",
    type: "passive",
    cost: 75,
    description: "Gain +1 Cred per second",
    effect: (state) => { state.passiveIncome += 1; }
  }
];

function updateCredDisplay() {
  document.getElementById("cred-display").textContent = cred;
}

function updateShopUI() {
  const shopContainer = document.getElementById("shop-cards");
  shopContainer.innerHTML = "";

  availableCards.forEach(card => {
    if (cred >= card.cost) {  // Only show cards the player can afford
      const cardEl = document.createElement("div");
      cardEl.className = "card";
      cardEl.innerHTML = `
        <h3>${card.name}</h3>
        <p>${card.description}</p>
        <p>Cost: ${card.cost} Cred</p>
        <button onclick="buyCard(${card.id})">Buy</button>
      `;
      shopContainer.appendChild(cardEl);
    }
  });
}

function updateTeamSlotsUI() {
  const teamContainer = document.getElementById("team-slots");
  teamContainer.innerHTML = "";

  if (cred >= 50) {
    teamSlots = 1;  // Unlock a team slot
    const teamSlot = document.createElement("div");
    teamSlot.className = "card";
    teamSlot.innerHTML = `<p>New team slot unlocked! Slot 1</p>`;
    teamContainer.appendChild(teamSlot);
  }
}

function buyCard(cardId) {
  const card = availableCards.find(c => c.id === cardId);
  if (card && cred >= card.cost) {
    cred -= card.cost;
    deck.push(card);
    gameState.ownedCards.push(card);  // Track owned cards
    updateShopUI();
    updateCredDisplay();
    updateOwnedCardsUI();  // Update the UI for owned cards
  }
}

function updateOwnedCardsUI() {
  const ownedCardsContainer = document.getElementById("owned-cards-list");
  ownedCardsContainer.innerHTML = "";

  gameState.ownedCards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.innerHTML = `
      <h3>${card.name}</h3>
      <p>${card.description}</p>
      <p>Owned</p>
    `;
    ownedCardsContainer.appendChild(cardEl);
  });
}

function drawHand() {
  shuffle(deck);
  hand = deck.slice(0, maxHandSize + gameState.extraDrawNextRound);
  gameState.extraDrawNextRound = 0;
  updateHandUI();
}

function playCard(index) {
  const card = hand[index];
  if (!card) return;

  card.effect(gameState);
  discardPile.push(card);
  hand.splice(index, 1);
  updateHandUI();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateHandUI() {
  const handEl = document.getElementById("hand-cards");
  handEl.innerHTML = "";
  hand.forEach((card, index) => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${card.name}</h3>
      <p>${card.description}</p>
      <button onclick="playCard(${index})">Play</button>
    `;
    handEl.appendChild(el);
  });
}

function tick() {
  cred += gameState.passiveIncome;
  updateCredDisplay();
}

function initClicker() {
  document.getElementById("click-btn").addEventListener("click", () => {
    cred += 1 * gameState.clickMultiplier;
    updateCredDisplay();
    updateShopUI();  // Update the shop UI after each click
    updateTeamSlotsUI();  // Check if team slots should be unlocked
  });
}

// Initial setup
updateCredDisplay();
updateShopUI();
updateTeamSlotsUI();
updateOwnedCardsUI();  // Display owned cards on game start
initClicker();
setInterval(tick, 1000);
