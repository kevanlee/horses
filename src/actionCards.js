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
      player.bonusGold += 1; // Increase gold by 1 for Market
      player.log("Market: +1 Card, +1 Action, +1 Buy, +1 Gold");
      break;
    default:
      player.log(`${card.name} has no effect yet.`);
  }
}

