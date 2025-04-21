import { drawCards } from './game.js';

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

  const cellarHandEl = document.getElementById('cellar-hand');
  cellarHandEl.innerHTML = '';
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
    cellarHandEl.appendChild(cardEl);
  });

  // Show modal
  document.getElementById('cellar-modal').classList.remove('hidden');

  document.getElementById('confirm-discard').onclick = () => {
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
    document.getElementById('cellar-modal').classList.add('hidden');
    renderHand(); // This will call the renderHand function defined in main.js
  };
}
