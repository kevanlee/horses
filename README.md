# Horses
a deck-building card game

Python code
python3 -m http.server 5500


Bug list: 
* Harbinger - Sometimes Harbinger's button says Discard
* Vassal - the Action card I draw does not get its effects applied
* Turn counter is missing its colon
* Randomize gold+VP at first hand
* Masquerade - button says Trash / Discard Selected when it shouldn't, e.g. after a card with a modal is played on a previous hand, like Cellar
* Masquerade - the card you don't choose gets lost somewhere (trashed? abandoned?)
* Cellar and Chapel don't show up in my game inventory
* Add code so that any trashed card gets added to trash pile (Chapel)

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
* Chapel ❌ - does not let you trash other chapel cards in your hand
* Village ✅👍
* Woodcutter ✅👍
* Masquerade ❌ - text of the button is wrong (Put in hand, not Discard)
* Harbinger ❌ - text of the button is wrong (Discard, should be "Add to top of deck"). Update button text if discard is empty. When does it put it on top of my deck? because I played masquerade right after, and my card wasn't in there. What is the # of cards that show up on a page? b/c I have two pages but it looks like they all could fit on page 1. 
* Smithy ✅👍
* Throne Room ⚫️
* Feast ❌ - modal does not open
* Library ❌ - fix the UI. Also, when drawing new cards after discarding action cards, the new cards need the proper/same info including CSS class, and it needs to reshuffle the discard when it runs out
* Laboratory ✅👍
* Mine ✅
* Council Room ✅
* Treasury ✅
* Adventurer ✅
* Workshop ✅
* Vassal ✅
* Great Hall ✅
* Remodel ✅
* Moneylender ✅ - need to confirm it actually adds money
* Gardens ❌
* Market ✅👍
* Festival ✅👍