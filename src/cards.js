// Card definitions for Kentucky Rook

const SUITS = ['orange', 'purple', 'blue', 'yellow'];

const CARDS = [
  // 1-14 in each suit
  ...SUITS.flatMap(suit => Array.from({length: 14}, (_, i) => ({
    value: i + 1,
    suit,
    name: `${i + 1} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
    points: (i + 1 === 5) ? 5 : (i + 1 === 10 || i + 1 === 14) ? 10 : 0
  }))),
  // Rook card
  {
    value: 0,
    suit: 'rook',
    name: 'Rook',
    points: 20,
    isRook: true
  }
]; 