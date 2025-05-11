# cardio
a card game

Python code
python3 -m http.server 1000


Bug list: 
* Gardens - Should not be clickable. Should be colored differently. Not sure that it's actually calculating and updating VP
* Vassal - Kind of works. You click the card once, and it reads it and does not update the card. You click it again and it reveals. Not sure if it discards or keeps or uses. It might have actually added it to my hand (a Silver). It actually did work with a Cellar once! 
* Masquerade - does not work
* Library - works except it adds to your hand AFTER the buy phase
* End game win conditions do not work

To-do
* Is it horse-themed? 
* When bonusGodl is added, how do we tell this to the player in the UI
* Turn off hover state and hand-cursor for Treasure and Victory cards in hand
* Add data tracker
* After troubleshooting, make sure that the Deck Inventory shows all cards you own and not what's in discard

Cards are working? A checklist

### Action Cards
- ✅ Smithy (Cost: 4) - Draw 3 cards
- ✅ Village (Cost: 3) - Draw 1 card, +2 Actions
- ✅ Cellar (Cost: 2) - +1 Action, Discard any number of cards, then draw that many
- ✅ Remodel (Cost: 4) - Trash a card from your hand. Gain a card costing up to $2 more
- ✅ Market (Cost: 5) - +1 Card, +1 Action, +1 Buy, +1 Gold
- ✅ Festival (Cost: 5) - +2 Actions, +1 Buy, +2 Gold
- ✅ Laboratory (Cost: 5) - +2 Cards, +1 Action
- ✅ Woodcutter (Cost: 3) - +1 Buy, +2 Gold
- ✅ Chapel (Cost: 2) - Trash up to 4 cards from your hand
- ✅ Workshop (Cost: 3) - Gain a card costing up to 4
- ✅ Masquerade (Cost: 3) - Draw 2 cards, choose one to keep and discard the other
- ✅ Vassal (Cost: 3) - +2 Gold. Reveal the top card of your deck. If it's an Action card, you may play it for free
- ✅ Council Room (Cost: 5) - +4 Cards, +1 Buy
- ✅ Great Hall (Cost: 3) - +1 Card, +1 Action, worth 1 VP
- ⚠️ Harbinger (Cost: 3) - +1 Card, +1 Action, look through your discard pile and put a card on top of your deck
- ⚠️ Library (Cost: 5) - Draw until you have 7 cards in hand. You may set aside Action cards
- ⚠️ Throne Room (Cost: 4) - Choose an Action card in your hand. Play it twice
- ✅ Mine (Cost: 5) - Trash a Treasure from your hand. Gain a Treasure costing up to 3 more
- ✅ Moneylender (Cost: 4) - Trash a Copper from your hand for +3 coins
- ✅ Feast (Cost: 4) - Trash this card. Gain a card costing up to 5 coins
- ❌ Adventurer (Cost: 6) - Reveal cards until you reveal 2 Treasures. Add them to hand
- ✅ Gardens (Cost: 4) - +1 Coin. Worth 1 VP per 10 cards in your deck
- ✅ Treasury (Cost: 5) - +1 Card, +1 Action, +1 Coin