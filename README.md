# Horses
a deck-building card game

Python code
python3 -m http.server 5500


Bug list: 
* ✅ Harbinger - Button now correctly says "Put on Top" and the chosen card returns to your deck.
* ✅ Vassal - Revealed Action cards now play correctly after the modal choice, and messaging stays in sync.
* Turn counter is missing its colon
* Randomize gold+VP at first hand
* ✅ Masquerade - button label reads "Put in Hand" and resets properly between modal cards.
* ✅ Masquerade - the unchosen card is discarded instead of disappearing.
* ✅ Cellar and Chapel now appear in the Deck Inventory alongside the rest of your collection.
* ✅ Chapel now records trashed cards in the trash pile and UI.

To-do
* Restyle 
* Add win conditions
* Add data tracker
* After troubleshooting, make sure that the Deck Inventory shows all cards you own and not what's in discard
* Implement Throne Room modal cards (Cellar, Chapel, Workshop, Feast, Mine, Remodel, Masquerade, Harbinger, Library, Vassal, Adventurer) - currently show message that they need special implementation

Cards are working? A checklist

## Basic Cards
* Copper ✅
* Silver ✅
* Gold ✅
* Estate ✅
* Duchy ✅
* Province ✅

## Action Cards
* Cellar ✅👍
* Council Room ✅👍
* Workshop ✅👍
* Village ✅👍
* Woodcutter ✅👍
* Smithy ✅👍
* Treasury ✅👍
* Great Hall ✅👍
* Laboratory ✅👍
* Market ✅👍
* Festival ✅👍
* Remodel ✅👍
* Throne Room ⚫️
* Chapel ✅👍
* Masquerade ✅👍 - modal keeps the right art, the button now reads "Put in Hand," and the spare card goes to discard.
* Harbinger ✅👍 - modal shows the right cards, supports paging, and puts the selected card back on top of your deck.
* Feast ✅👍 - modal opens again so you can gain a card up to 5 cost.
* Library ❌ - fix the UI. Also, when drawing new cards after discarding action cards, the new cards need the proper/same info including CSS class, and it needs to reshuffle the discard when it runs out
* Mine ✅👍 - treasure upgrade flow works and sends the new treasure to your hand.
* Moneylender ✅👍
* Gardens ❌ 🐠
* Adventurer ✅👍 - reveals cards with the right art, adds treasures to hand, and discards the rest.
* Vassal ✅👍 - UI clarifies the choice and lets you play or discard the revealed Action.


