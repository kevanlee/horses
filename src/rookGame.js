console.log('rookGame.js loaded');
// Core gameplay logic for Kentucky Rook



class RookGame {
  constructor() {
    this.players = [];
    this.teams = [];
    this.deck = [];
    this.kitty = [];
    this.trump = null;
    this.scores = { team0: 0, team1: 0 }; // Team scores
    this.roundScores = []; // Scores for each round
    this.currentBid = null;
    this.biddingHistory = [];
    this.tricks = [];
    this.state = 'setup'; // setup, bidding, play, scoring
    this.dealerIndex = 0;
    this.currentBidder = 0;
    this.passedPlayers = new Set();
    this.minimumBid = 100;
    this.currentRound = 1;
    this.bidWinner = null;
    this.bidAmount = null;
  }

  shuffleDeck() {
    // Fisher-Yates shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  setupGame(playerNames, teamNames) {
    // Assign players to teams
    this.players = playerNames.map((name, i) => ({
      name,
      hand: [],
      team: i % 2 === 0 ? 0 : 1 // alternate for 2 teams
    }));
    this.teams = [teamNames[0], teamNames[1]];
    // Prepare and shuffle deck
    this.deck = [...CARDS];
    this.shuffleDeck();
    // Deal 13 cards to each player
    for (let i = 0; i < 4; i++) {
      this.players[i].hand = this.deck.slice(i * 13, (i + 1) * 13);
    }
    // 5 cards to the kitty
    this.kitty = this.deck.slice(52, 57);
    // Do NOT increment dealerIndex here! Increment after hand is scored.
  }

  startNewRound() {
    this.currentRound++;
    this.bidWinner = null;
    this.bidAmount = null;
  }

  startBidding() {
    this.state = 'bidding';
    this.currentBid = null; // No bid yet
    this.currentBidder = (this.dealerIndex + 1) % 4; // left of dealer
    this.passedPlayers = new Set();
    this.biddingHistory = [];
    return {
      dealer: this.players[this.dealerIndex]?.name || 'Dealer',
      firstBidder: this.players[this.currentBidder]?.name || 'Player'
    };
  }

  placeBid(playerIndex, bidAmount) {
    if (this.passedPlayers.has(playerIndex)) return false;
    if (bidAmount < this.minimumBid) return false;
    if (this.currentBid !== null && bidAmount < this.currentBid + 5) return false;
    this.currentBid = bidAmount;
    this.biddingHistory.push({
      player: this.players[playerIndex].name,
      bid: bidAmount
    });
    // If a player bids 200, end bidding immediately
    if (bidAmount >= 200) {
      return this.endBidding(playerIndex);
    }
    return true;
  }

  passBid(playerIndex) {
    console.log(`Player ${this.players[playerIndex]?.name || playerIndex} passes.`);
    this.passedPlayers.add(playerIndex);
    this.biddingHistory.push({
      player: this.players[playerIndex].name,
      bid: 'pass'
    });
    // this.currentBidder = (this.currentBidder + 1) % 4; // Removed to fix turn order
    // Check if bidding is over
    if (this.passedPlayers.size === 3) {
      console.log('Three players have passed. Checking for valid bid...');
      // Only end bidding if a valid bid was placed
      if (this.currentBid !== null) {
        // Find the one player who hasn't passed
        for (let i = 0; i < 4; i++) {
          if (!this.passedPlayers.has(i)) {
            console.log(`Bidding winner is player index ${i} (${this.players[i]?.name || i}) with bid ${this.currentBid}`);
            return this.endBidding(i);
          }
        }
      } else {
        // All players passed, no valid bid
        console.log('All players passed. No valid bid.');
        return this.endBidding(null);
      }
    }
    return null; // bidding continues
  }

  evaluateComputerBid(playerIndex) {
    const player = this.players[playerIndex];
    const hand = player.hand;
    // Simple strategy: count high cards (1, 14, 13, 12, 11)
    const highCards = hand.filter(card => [1, 14, 13, 12, 11].includes(card.value)).length;
    const rookCard = hand.find(card => card.isRook);
    // If they have good cards, bid more aggressively
    let bidAmount;
    if (highCards >= 4 || rookCard) {
      // Bid more aggressively, but always in increments of 5
      if (this.currentBid === null) {
        bidAmount = this.minimumBid;
      } else {
        // Add 5 to 20, but round up to nearest 5
        const increment = 5 * (1 + Math.floor(Math.random() * 4)); // 5, 10, 15, or 20
        bidAmount = this.currentBid + increment;
      }
    } else {
      // 50% chance to pass with bad cards
      if (Math.random() < 0.5) {
        return this.passBid(playerIndex);
      } else {
        bidAmount = this.currentBid === null ? this.minimumBid : this.currentBid + 5;
      }
    }
    // Ensure bid is in increments of 5
    bidAmount = Math.ceil(bidAmount / 5) * 5;
    // Cap bid at 200
    if (bidAmount >= 200) {
      bidAmount = 200;
      this.placeBid(playerIndex, bidAmount);
      // End bidding immediately if 200 is bid
      return this.endBidding(playerIndex);
    }
    return this.placeBid(playerIndex, bidAmount);
  }

  endBidding(winnerIndex) {
    this.state = 'play';
    if (this.currentBid === null || winnerIndex === null) {
      console.log('No valid bid. No winner.');
      return { winner: null, bidAmount: null };
    }
    const winner = this.players[winnerIndex];
    this.bidWinner = winnerIndex;
    this.bidAmount = this.currentBid;
    console.log(`Bidding ended. Winner: ${winner.name}, Bid Amount: ${this.currentBid}`);
    return {
      winner: winner.name,
      bidAmount: this.currentBid
    };
  }

  startPlay() {
    this.state = 'play';
    this.currentTrick = [];
    this.ledSuit = null;
    this.currentPlayer = this.dealerIndex; // Dealer leads first
    this.tricks = [];
    this.trickWinners = [];
    return {
      leader: this.players[this.dealerIndex].name,
      trump: this.trump
    };
  }

  playCard(playerIndex, cardIndex) {
    const player = this.players[playerIndex];
    const card = player.hand[cardIndex];
    
    if (!card) return false;
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add to current trick
    this.currentTrick.push({
      player: playerIndex,
      card: card
    });
    
    // Set led suit if this is the first card
    if (this.currentTrick.length === 1) {
      this.ledSuit = card.suit;
    }
    
    // Move to next player
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    
    // Check if trick is complete
    if (this.currentTrick.length === 4) {
      return this.completeTrick();
    }
    
    return true; // trick continues
  }

  completeTrick() {
    // Find winner of the trick
    let winner = this.currentTrick[0];
    let highestCard = winner.card;
    
    for (let i = 1; i < this.currentTrick.length; i++) {
      const play = this.currentTrick[i];
      if (this.isCardHigher(play.card, highestCard)) {
        winner = play;
        highestCard = play.card;
      }
    }
    
    // Add trick to history
    this.tricks.push([...this.currentTrick]);
    this.trickWinners.push(winner.player);
    
    // Clear current trick
    this.currentTrick = [];
    this.ledSuit = null;
    
    // Set winner as next leader
    this.currentPlayer = winner.player;
    
    // Check if hand is complete (all players should have empty hands)
    if (this.players.every(player => player.hand.length === 0)) {
      return this.scoreHand();
    }
    
    return { winner: this.players[winner.player].name };
  }

  isCardHigher(card1, card2) {
    // Rook card always wins
    if (card1.isRook && !card2.isRook) return true;
    if (!card1.isRook && card2.isRook) return false;
    if (card1.isRook && card2.isRook) return false; // Rook vs Rook, first one wins
    
    // Trump suit beats non-trump
    if (card1.suit === this.trump && card2.suit !== this.trump) return true;
    if (card1.suit !== this.trump && card2.suit === this.trump) return false;
    
    // If both are trump or both are non-trump, compare values
    if (card1.suit === card2.suit) {
      // 1 is highest, then 14, 13, 12, etc.
      if (card1.value === 1 && card2.value !== 1) return true;
      if (card1.value !== 1 && card2.value === 1) return false;
      return card1.value > card2.value;
    }
    
    // If neither is trump and suits don't match, led suit wins
    if (card1.suit === this.ledSuit && card2.suit !== this.ledSuit) return true;
    if (card1.suit !== this.ledSuit && card2.suit === this.ledSuit) return false;
    
    // If neither follows led suit, first card wins
    return false;
  }

  getValidPlays(playerIndex) {
    const player = this.players[playerIndex];
    const hand = player.hand;
    
    // If this is the first card of the trick, all cards are valid
    if (this.currentTrick.length === 0) {
      return hand.map((_, index) => index);
    }
    
    // Must follow led suit if possible
    const ledSuitCards = hand.filter(card => card.suit === this.ledSuit);
    if (ledSuitCards.length > 0) {
      return hand.map((card, index) => card.suit === this.ledSuit ? index : -1).filter(i => i !== -1);
    }
    
    // If can't follow led suit, all cards are valid
    return hand.map((_, index) => index);
  }

  evaluateComputerPlay(playerIndex) {
    const validPlays = this.getValidPlays(playerIndex);
    if (validPlays.length === 0) return null;
    
    // Simple strategy: play highest card of led suit, or lowest card if can't follow
    const hand = this.players[playerIndex].hand;
    let bestPlay = validPlays[0];
    
    if (this.currentTrick.length === 0) {
      // Leading - play highest trump or highest card
      let highestValue = -1;
      for (let i = 0; i < validPlays.length; i++) {
        const card = hand[validPlays[i]];
        if (card.suit === this.trump) {
          // For trump, 1 is highest, then 14, 13, etc.
          const cardValue = card.value === 1 ? 15 : card.value; // Treat 1 as 15 for comparison
          if (cardValue > highestValue) {
            highestValue = cardValue;
            bestPlay = validPlays[i];
          }
        }
      }
      if (highestValue === -1) {
        // No trump, play highest card
        for (let i = 0; i < validPlays.length; i++) {
          const card = hand[validPlays[i]];
          const cardValue = card.value === 1 ? 15 : card.value; // Treat 1 as 15 for comparison
          if (cardValue > highestValue) {
            highestValue = cardValue;
            bestPlay = validPlays[i];
          }
        }
      }
    } else {
      // Following - try to win if possible, otherwise play low
      let canWin = false;
      let bestCard = hand[validPlays[0]];
      
      for (let i = 0; i < validPlays.length; i++) {
        const card = hand[validPlays[i]];
        if (this.isCardHigher(card, bestCard)) {
          bestCard = card;
          bestPlay = validPlays[i];
          canWin = true;
        }
      }
      
      if (!canWin) {
        // Can't win, play lowest card (1 is highest, so 2 is lowest)
        let lowestValue = 15;
        for (let i = 0; i < validPlays.length; i++) {
          const card = hand[validPlays[i]];
          const cardValue = card.value === 1 ? 15 : card.value; // Treat 1 as 15 for comparison
          if (cardValue < lowestValue) {
            lowestValue = cardValue;
            bestPlay = validPlays[i];
          }
        }
      }
    }
    
    return bestPlay;
  }

  scoreHand() {
    this.state = 'scoring';
    
    // Calculate points for each team based on cards won
    let team0Points = 0;
    let team1Points = 0;
    let rookWinner = null;
    let lastTrickWinner = null;
    
    // Go through all tricks to calculate points
    for (let i = 0; i < this.tricks.length; i++) {
      const trick = this.tricks[i];
      const trickWinner = this.trickWinners[i];
      const winningTeam = trickWinner % 2; // 0 or 1
      
      // Calculate points for this trick
      let trickPoints = 0;
      for (const play of trick) {
        const card = play.card;
        if (card.isRook) {
          trickPoints += 20;
          rookWinner = winningTeam;
        } else if (card.value === 1) {
          trickPoints += 15;
        } else if (card.value === 14 || card.value === 10) {
          trickPoints += 10;
        } else if (card.value === 5) {
          trickPoints += 5;
        }
      }
      
      // Last trick gets 20 bonus points
      if (i === this.tricks.length - 1) {
        trickPoints += 20;
        lastTrickWinner = winningTeam;
      }
      
      // Add points to appropriate team
      if (winningTeam === 0) {
        team0Points += trickPoints;
      } else {
        team1Points += trickPoints;
      }
    }
    
    let team0Score = 0;
    let team1Score = 0;
    
    if (this.bidWinner !== null && this.bidAmount !== null) {
      const biddingTeam = this.bidWinner % 2; // 0 or 1
      const otherTeam = 1 - biddingTeam;
      
      if (biddingTeam === 0) {
        // Team 0 won the bid
        if (team0Points >= this.bidAmount) {
          // Made their bid
          team0Score = this.bidAmount;
          team1Score = 200 - this.bidAmount;
        } else {
          // Failed to make bid
          team0Score = -this.bidAmount;
          team1Score = 200 + this.bidAmount;
        }
      } else {
        // Team 1 won the bid
        if (team1Points >= this.bidAmount) {
          // Made their bid
          team1Score = this.bidAmount;
          team0Score = 200 - this.bidAmount;
        } else {
          // Failed to make bid
          team1Score = -this.bidAmount;
          team0Score = 200 + this.bidAmount;
        }
      }
    } else {
      // No valid bid, teams keep their earned points
      team0Score = team0Points;
      team1Score = team1Points;
    }
    
    // Update team scores
    this.scores.team0 += team0Score;
    this.scores.team1 += team1Score;
    
    // Store round score
    this.roundScores.push({
      round: this.currentRound,
      bidWinner: this.bidWinner !== null ? this.players[this.bidWinner].name : 'None',
      bidAmount: this.bidAmount,
      team0Score: team0Score,
      team1Score: team1Score,
      team0Points: team0Points,
      team1Points: team1Points,
      bidSuccess: this.bidWinner !== null ? (this.bidWinner % 2 === 0 ? team0Points >= this.bidAmount : team1Points >= this.bidAmount) : null
    });
    
    return {
      team0Score: team0Score,
      team1Score: team1Score,
      team0Points: team0Points,
      team1Points: team1Points,
      totalTeam0: this.scores.team0,
      totalTeam1: this.scores.team1,
      bidSuccess: this.bidWinner !== null ? (this.bidWinner % 2 === 0 ? team0Points >= this.bidAmount : team1Points >= this.bidAmount) : null
    };
  }

  // Add more methods as needed
} 