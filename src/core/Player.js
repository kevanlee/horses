import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * @typedef {Object} PlayerState
 * @property {Card[]} deck
 * @property {Card[]} hand
 * @property {Card[]} discard
 * @property {Card[]} playArea
 * @property {number} actions
 * @property {number} buys
 * @property {number} bonusGold
 * @property {number} victoryPoints
 */

export class Player extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.reset();
  }

  reset() {
    /** @type {PlayerState} */
    this.state = {
      deck: [],
      hand: [],
      discard: [],
      playArea: [],
      actions: 0,
      buys: 0,
      bonusGold: 0,
      victoryPoints: 0
    };
  }

  /**
   * @param {number} count
   * @returns {Card[]}
   */
  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.state.deck.length === 0) {
        if (this.state.discard.length === 0) break;
        this.shuffleDiscardIntoDeck();
      }
      const card = this.state.deck.pop();
      if (card) {
        this.state.hand.push(card);
        drawn.push(card);
      }
    }
    this.emit('cardsDrawn', { player: this, cards: drawn });
    return drawn;
  }

  /**
   * @param {Card} card
   */
  playCard(card) {
    const index = this.state.hand.indexOf(card);
    if (index === -1) throw new Error('Card not in hand');
    
    this.state.hand.splice(index, 1);
    this.state.playArea.push(card);
    this.state.actions--;
    
    this.emit('cardPlayed', { player: this, card });
  }

  /**
   * @param {Card} card
   */
  discardCard(card) {
    const index = this.state.hand.indexOf(card);
    if (index === -1) throw new Error('Card not in hand');
    
    this.state.hand.splice(index, 1);
    this.state.discard.push(card);
    
    this.emit('cardDiscarded', { player: this, card });
  }

  /**
   * @param {Card} card
   */
  trashCard(card) {
    const index = this.state.hand.indexOf(card);
    if (index === -1) throw new Error('Card not in hand');
    
    this.state.hand.splice(index, 1);
    this.emit('cardTrashed', { player: this, card });
  }

  /**
   * @param {Card} card
   */
  gainCard(card) {
    this.state.discard.push(card);
    this.emit('cardGained', { player: this, card });
  }

  shuffleDiscardIntoDeck() {
    this.state.deck = [...this.state.discard];
    this.state.discard = [];
    this.shuffleDeck();
  }

  shuffleDeck() {
    for (let i = this.state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.deck[i], this.state.deck[j]] = [this.state.deck[j], this.state.deck[i]];
    }
  }

  startTurn() {
    this.state.actions = 1;
    this.state.buys = 1;
    this.state.bonusGold = 0;
    this.drawCards(5);
    this.emit('turnStarted', { player: this });
  }

  endTurn() {
    // Move all cards from hand and play area to discard
    this.state.discard.push(...this.state.hand, ...this.state.playArea);
    this.state.hand = [];
    this.state.playArea = [];
    this.emit('turnEnded', { player: this });
  }

  /**
   * @returns {number}
   */
  calculateVictoryPoints() {
    let points = 0;
    const allCards = [...this.state.deck, ...this.state.hand, ...this.state.discard, ...this.state.playArea];
    
    for (const card of allCards) {
      if (card.type === 'Victory' || card.type === 'Action-Victory') {
        points += card.points;
      }
    }
    
    this.state.victoryPoints = points;
    return points;
  }
} 