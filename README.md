# Kentucky Rook - Rules & Gameplay

Python code
python3 -m http.server 3000

This project implements the classic card game **Kentucky Rook** (also known as Rook or Rook 1-High). Below is a summary of the rules and gameplay for easy reference and future development.

---

## Deck
- 1 Rook deck (or a standard deck with custom cards)
- Cards used: 1–14 in each color (orange, purple, blue, and yellow)
- The Rook card 
- **Total cards:** 57 (if using 1–14 in 4 suits + Rook)
- Some house rules remove certain cards (e.g., 2s, 3s, 4s) for a 45-card deck

## Setup
- 4 players, 2 teams (partners sit opposite)
- All cards are dealt except for a "kitty" (5 cards) placed face down in the center

## Teams
- Two teams: North/South vs. East/West (or custom team names)
- Partners work together to win tricks and score points

## Bidding
- Players bid for the right to name power suit and take the kitty
- Bidding starts at a minimum (100 points)
- Each player may pass or raise the bid
- Highest bidder wins, names power suit, and picks up the kitty
- Bidder discards the same number of cards as in the kitty

## Play
- The player to the left of the dealer leads the first trick
- Players must follow suit if able; otherwise, may play any card (including power suit)
- The highest card of the suit led wins the trick unless a power suit is played
- The Rook card is worth 10.5 in the highest power suit
- Winner of each trick leads the next

## Scoring
- Points are scored for certain cards captured in tricks:
  - 5s: 5 points each
  - 10s: 10 points each
  - 14s: 10 points each
  - 1s: 15 points each
  - Rook card: 20 points
- An additional 20 points is awarded to the team that takes the last trick
- Total points per hand: 200 (with standard deck)
- The team that wins the bid must make at least their bid to score points; otherwise, they lose their bid amount
- Opponents always score their points

## Special Rules
- The Rook card is always power suit
- The kitty is won by the highest bidder. This player may put cards from the kitty into their hand so long as they end up with a final hand of 13 and a kitty of 5.
- The player who wins the last trick gets any points in the kitty.

## Example Hand Flow
1. Shuffle and deal all cards, set aside the kitty
2. Bidding round
3. Winner of bid takes kitty, discards, names power suit
4. Play out all tricks
5. Count points and update scores

---



