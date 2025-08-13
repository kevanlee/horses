

// Chatbot Log UI logic

function appendMessage(text, sender = 'system') {
  const chatLog = document.getElementById('chat-log');
  const msg = document.createElement('div');
  msg.className = `chat-message ${sender}`;
  msg.textContent = text;
  chatLog.appendChild(msg);
  // Animate in
  setTimeout(() => msg.classList.add('visible'), 10);
  // Auto-scroll to bottom
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setInputEnabled(enabled) {
  document.getElementById('chat-input').disabled = !enabled;
  document.getElementById('chat-send').disabled = !enabled;
  if (enabled) {
    document.getElementById('chat-input').focus();
  }
}

// Conversation state
let conversationStep = 0;
let playerName = '';
let tablemates = [];
let teamName = '';
let rookGameInstance = null;

function pickRandomPlayers(num = 3) {
  const names = [...COMPUTER_PLAYER_NAMES];
  const picked = [];
  for (let i = 0; i < num; i++) {
    const idx = Math.floor(Math.random() * names.length);
    picked.push(names.splice(idx, 1)[0]);
  }
  return picked;
}

function updateOtherPlayersUI(names) {
  const container = document.querySelector('.other-players');
  if (!container) return;
  container.innerHTML = '';
  names.forEach(name => {
    const div = document.createElement('div');
    div.className = 'player';
    div.textContent = name;
    container.appendChild(div);
  });
}

async function tablematesSayHello(names) {
  for (let i = 0; i < names.length; i++) {
    await new Promise(res => setTimeout(res, 700));
    appendMessage(`${names[i]}: Hello!`, 'system');
  }
  // After all have said hello, ask for team name
  setTimeout(() => {
    appendMessage('What should we call our team?');
    setInputEnabled(true);
    conversationStep = 2;
  }, 700);
}

async function nextBiddingTurn() {
  if (!rookGameInstance || rookGameInstance.state !== 'bidding') return;

  // If only one player hasn't passed, bidding is over
  if (rookGameInstance.passedPlayers.size === 3) {
    // Find the winner
    let winnerIndex = null;
    for (let i = 0; i < 4; i++) {
      if (!rookGameInstance.passedPlayers.has(i)) winnerIndex = i;
    }
    if (rookGameInstance.currentBid !== null && winnerIndex !== null) {
      await new Promise(res => setTimeout(res, 800)); // Small pause before win message
      appendMessage(`${rookGameInstance.players[winnerIndex].name} won the bid at ${rookGameInstance.currentBid}.`);
      console.log(`[BID] Bidding ended. Winner: ${rookGameInstance.players[winnerIndex].name}, Amount: ${rookGameInstance.currentBid}`);
      appendMessage(`${rookGameInstance.players[winnerIndex].name} won the bid at ${rookGameInstance.currentBid}!`);
      console.log('[DEBUG] Calling postBidHandler from nextBiddingTurn', { winnerName: rookGameInstance.players[winnerIndex].name, winnerIndex, bid: rookGameInstance.currentBid });
      await postBidHandler(rookGameInstance.players[winnerIndex].name, winnerIndex, rookGameInstance.currentBid);
    } else {
      await new Promise(res => setTimeout(res, 800)); // Small pause before no-winner message
      appendMessage('No one won the bid. All players passed.');
      console.log('[BID] Bidding ended. No valid bid. All players passed.');
    }
    conversationStep = 5;
    setInputEnabled(false);
    return;
  }

  // Advance to the next eligible player
  let attempts = 0;
  while (rookGameInstance.passedPlayers.has(rookGameInstance.currentBidder) && attempts < 4) {
    rookGameInstance.currentBidder = (rookGameInstance.currentBidder + 1) % 4;
    attempts++;
  }

  // Human's turn
  if (rookGameInstance.currentBidder === 0 && !rookGameInstance.passedPlayers.has(0)) {
    appendMessage('Your bid!');
    setInputEnabled(true);
    return;
  }

  // Computer's turn
  const i = rookGameInstance.currentBidder;
  if (!rookGameInstance.passedPlayers.has(i)) {
    console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) evaluating bid...`);
    const result = rookGameInstance.evaluateComputerBid(i);
    const lastBid = rookGameInstance.biddingHistory[rookGameInstance.biddingHistory.length - 1];
    if (lastBid.bid === 'pass') {
      appendMessage(`${lastBid.player}: Pass`);
      console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) passed.`);
    } else {
      appendMessage(`${lastBid.player}: ${lastBid.bid}`);
      console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) bid: ${lastBid.bid}`);
    }
    // If result is an object with winner, show the win message
    if (result && typeof result === 'object' && result.winner !== undefined) {
      await new Promise(res => setTimeout(res, 800)); // Small pause before win message
      if (result.winner && result.bidAmount) {
        appendMessage(`${result.winner} won the bid at ${result.bidAmount}!`);
        const winnerIndex = rookGameInstance.players.findIndex(p => p.name === result.winner);
        await postBidHandler(result.winner, winnerIndex, result.bidAmount);
      } else {
        appendMessage('No one won the bid. All players passed.');
      }
      conversationStep = 5;
      setInputEnabled(false);
      return;
    }
    await new Promise(res => setTimeout(res, 800));
    rookGameInstance.currentBidder = (rookGameInstance.currentBidder + 1) % 4;
    nextBiddingTurn();
  }
}

async function handleUserInput(input) {
  input = input.trim();
  if (!input) return;
  appendMessage(input, 'user');
  setInputEnabled(false);

  if (conversationStep === 0) {
    playerName = input;
    setTimeout(() => {
      appendMessage(`Nice to meet you, ${playerName}!`);
      setTimeout(() => {
        appendMessage('Are you ready to play? (y/n)');
        setInputEnabled(true);
        conversationStep = 1;
        document.getElementById('chat-input').focus();
      }, 700);
    }, 500);
  } else if (conversationStep === 1) {
    if (/^(y|yes)$/i.test(input)) {
      setTimeout(async () => {
        appendMessage('Great! Let\'s get started!');
        // Pick 3 random computer players
        tablemates = pickRandomPlayers(3);
        computerTeamName = COMPUTER_TEAM_NAMES[Math.floor(Math.random() * COMPUTER_TEAM_NAMES.length)];
        setTimeout(async () => {
          appendMessage(`Your tablemates are: ${tablemates.join(', ')}.`);
          updateOtherPlayersUI(tablemates);
          updateScoreboardTeams();
          await tablematesSayHello(tablemates);
          // Optionally: trigger game start here
        }, 700);
      }, 400);
      setInputEnabled(false);
    } else if (/^(n|no)$/i.test(input)) {
      setTimeout(() => {
        appendMessage('No worries! Let me know when you\'re ready.');
        setInputEnabled(true);
      }, 400);
    } else {
      setTimeout(() => {
        appendMessage('Please answer with y/n.');
        setInputEnabled(true);
      }, 400);
    }
  } else if (conversationStep === 2) {
    teamName = input;
    setTimeout(() => {
      appendMessage(`Awesome! Our team is now called "${teamName}".`);
      updateScoreboardTeams();
      setTimeout(() => {
        appendMessage('Are you ready to go? (y/n)');
        setInputEnabled(true);
        conversationStep = 3;
      }, 700);
    }, 400);
    setInputEnabled(false);
  } else if (conversationStep === 3) {
    if (/^(y|yes)$/i.test(input)) {
      setTimeout(async () => {
        appendMessage('Dealing the first hand');
        
        // Initialize the game instance
        rookGameInstance = new RookGame();
        rookGameInstance.setupGame(
          [playerName, ...tablemates], // playerNames
          [teamName, computerTeamName] // teamNames
        );
        
        // Initialize scoreboard
        updateScoreboard();
        
        // Animate dealing the hand
        await animateDealHand(rookGameInstance.players[0].hand);
        
        // Hide the setup overlay with fade-out
        const overlay = document.getElementById('setup-overlay');
        if (overlay) {
          overlay.classList.add('fade-out');
          overlay.addEventListener('transitionend', function handler() {
            overlay.style.display = 'none';
            overlay.removeEventListener('transitionend', handler);
          });
        }
        
        // Start bidding after dealing animation
        setTimeout(async () => {
          if (rookGameInstance) {
            // Add a longer pause before showing the bidding message
            setTimeout(() => {
              const biddingInfo = rookGameInstance.startBidding();
              appendMessage(`${biddingInfo.dealer} dealt. ${biddingInfo.firstBidder} starts the bidding.`);
              conversationStep = 4;
              setTimeout(() => {
                nextBiddingTurn();
              }, 800); // Small pause before first bid
            }, 1200); // 1200ms pause before bidding message
          }
        }, 2000); // Wait for dealing animation
      }, 400);
    } else if (/^(n|no)$/i.test(input)) {
      setTimeout(() => {
        appendMessage('Let me know when you\'re ready!');
        setInputEnabled(true);
      }, 400);
    } else {
      setTimeout(() => {
        appendMessage('Please answer with y/n.');
        setInputEnabled(true);
      }, 400);
    }
  } else if (conversationStep === 4) {
    // Handle bidding input
    if (/^pass$/i.test(input)) {
      // User chooses to pass
      console.log('[BID] User chooses to pass.');
      const result = rookGameInstance.passBid(0);
      const lastBid = rookGameInstance.biddingHistory[rookGameInstance.biddingHistory.length - 1];
      appendMessage(`${lastBid.player}: Pass`);
      setInputEnabled(false);
      // Advance to next eligible player
      rookGameInstance.currentBidder = (rookGameInstance.currentBidder + 1) % 4;
      if (result && (result.winner !== undefined)) {
        if (result.winner && result.bidAmount) {
          appendMessage(`${result.winner} won the bid at ${result.bidAmount}!`);
        } else {
          appendMessage('No one won the bid. All players passed.');
        }
        conversationStep = 5;
        setInputEnabled(false);
      } else {
        setTimeout(() => {
          nextBiddingTurn();
        }, 500);
      }
      return;
    }
    const bidAmount = parseInt(input);
    if (isNaN(bidAmount) || bidAmount < 100 || bidAmount % 5 !== 0) {
      appendMessage('Please enter a valid bid (minimum 100, increments of 5), or type "pass" to pass.');
      setInputEnabled(true);
      return;
    }
    console.log(`[BID] User attempts to bid:`, bidAmount);
    const result = rookGameInstance.placeBid(0, bidAmount);
    const lastBid = rookGameInstance.biddingHistory[rookGameInstance.biddingHistory.length - 1];
    appendMessage(`${lastBid.player}: ${lastBid.bid}`);
    setInputEnabled(false);
    // Advance to next eligible player
    rookGameInstance.currentBidder = (rookGameInstance.currentBidder + 1) % 4;
    if (result && (typeof result === 'object') && (result.winner !== undefined)) {
      if (result.winner && result.bidAmount) {
        appendMessage(`${result.winner} won the bid at ${result.bidAmount}!`);
        await postBidHandler(result.winner, 0, result.bidAmount);
      } else {
        appendMessage('No one won the bid. All players passed.');
      }
      conversationStep = 5;
      setInputEnabled(false);
    } else {
      setTimeout(() => {
        nextBiddingTurn();
      }, 500);
    }
    return;
  }
}

async function handleBiddingRound() {
  if (!rookGameInstance || rookGameInstance.state !== 'bidding') return;
  
  // Handle computer players
  for (let i = 1; i < 4; i++) {
    if (rookGameInstance.passedPlayers.has(i)) continue;
    
    console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) evaluating bid...`);
    const result = rookGameInstance.evaluateComputerBid(i);
    if (result) {
      // Bidding ended
      if (result.winner && result.bidAmount) {
        console.log(`[BID] Bidding ended. Winner: ${result.winner}, Amount: ${result.bidAmount}`);
        appendMessage(`${result.winner} won the bid at ${result.bidAmount}.`);
      } else {
        console.log('[BID] Bidding ended. No valid bid. All players passed.');
        appendMessage('No one won the bid. All players passed.');
      }
      conversationStep = 5;
      setInputEnabled(false);
      return;
    } else if (result === null) {
      // Player passed
      console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) passed.`);
      appendMessage(`${rookGameInstance.players[i].name}: Pass`);
    } else {
      // Player bid
      const lastBid = rookGameInstance.biddingHistory[rookGameInstance.biddingHistory.length - 1];
      console.log(`[BID] Computer player ${i} (${rookGameInstance.players[i]?.name}) bid: ${lastBid.bid}`);
      appendMessage(`${lastBid.player}: ${lastBid.bid}`);
    }
    
    await new Promise(res => setTimeout(res, 800));
  }
  
  // Human's turn
  if (!rookGameInstance.passedPlayers.has(0)) {
    appendMessage('Your bid!');
    setInputEnabled(true);
  }
}

function handleSend() {
  const input = document.getElementById('chat-input');
  const value = input.value;
  if (!value.trim()) return;
  handleUserInput(value);
  input.value = '';
}

const COMPUTER_TEAM_NAMES = [
  'Jacks', 'Rooks', 'Kings', 'Queens', 'Aces',
  'Falcons', 'Owls', 'Stars', 'Wolves', 'Crows'
];
let computerTeamName = '';

function updateScoreboardTeams() {
  const teamScoreEls = document.querySelectorAll('.team-score');
  if (teamScoreEls.length >= 2) {
    // Player's team
    teamScoreEls[0].querySelector('h4').textContent = teamName;
    teamScoreEls[0].querySelector('p:not(.score)').innerHTML = `${playerName}<br>${tablemates[1]}`;
    // Computer team
    teamScoreEls[1].querySelector('h4').textContent = computerTeamName;
    teamScoreEls[1].querySelector('p:not(.score)').innerHTML = `${tablemates[0]}<br>${tablemates[2]}`;
    // (Do not touch .score here)
  }
  // Update team names in the scoreboard table header
  const roundTable = document.querySelector('.score-by-round table');
  if (roundTable) {
    const ths = roundTable.querySelectorAll('th');
    if (ths.length >= 5) {
      ths[3].textContent = teamName;
      ths[4].textContent = computerTeamName;
    }
  }
}

function sortHandBySuitAndValue(hand) {
  const suitOrder = ['blue', 'orange', 'purple', 'yellow'];
  const valueOrder = [1, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  
  return hand.sort((a, b) => {
    // Rook cards go last
    if (a.isRook && !b.isRook) return 1;
    if (!a.isRook && b.isRook) return -1;
    if (a.isRook && b.isRook) return 0;
    
    // Sort by suit first
    const suitA = suitOrder.indexOf(a.suit);
    const suitB = suitOrder.indexOf(b.suit);
    if (suitA !== suitB) return suitA - suitB;
    
    // Then by value (1 highest, then 14, 13, etc.)
    const valueA = valueOrder.indexOf(a.value);
    const valueB = valueOrder.indexOf(b.value);
    return valueA - valueB;
  });
}

function renderPlayerHand(hand) {
  const handDiv = document.querySelector('.cards-in-hand');
  if (!handDiv) return;
  handDiv.innerHTML = '';
  const sortedHand = sortHandBySuitAndValue(hand);
  sortedHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.suit}${card.isRook ? ' rook' : ''}`;
    cardDiv.innerHTML = `<p>${card.isRook ? 'R' : card.value} <span class="card-icon"></span></p>`;
    handDiv.appendChild(cardDiv);
  });
}

async function animateDealHand(hand) {
  const handDiv = document.querySelector('.cards-in-hand');
  if (!handDiv) return;
  handDiv.innerHTML = '';
  const sortedHand = sortHandBySuitAndValue(hand);
  for (let i = 0; i < sortedHand.length; i++) {
    const card = sortedHand[i];
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.suit}${card.isRook ? ' rook' : ''}`;
    cardDiv.innerHTML = `<p>${card.isRook ? 'R' : card.value} <span class="card-icon"></span></p>`;
    handDiv.appendChild(cardDiv);
    await new Promise(res => setTimeout(res, 60));
  }
}

function runDebugMode() {
  // Fixed debug values
  playerName = 'DebugKev';
  teamName = 'Debuggers';
  tablemates = ['Ada', 'Basil', 'Cleo'];
  computerTeamName = 'Jacks';

  // Set up the game logic and deal cards
  rookGameInstance = new RookGame();
  rookGameInstance.setupGame(
    [playerName, ...tablemates], // playerNames
    [teamName, computerTeamName] // teamNames
  );
  
  // Initialize scoreboard
  updateScoreboard();

  // Animate dealing the hand
  animateDealHand(rookGameInstance.players[0].hand);

  // Clear chat log
  const chatLog = document.getElementById('chat-log');
  if (chatLog) chatLog.innerHTML = '';

  // Show debug flow in chat (restored to match onboarding)
  appendMessage('Welcome to Kentucky Rook!');
  appendMessage(`What's your name?`);
  appendMessage(playerName, 'user');
  appendMessage(`Nice to meet you, ${playerName}!`);
  appendMessage('Are you ready to play? (y/n)');
  appendMessage('yes', 'user');
  appendMessage(`Great! Let's get started!`);
  appendMessage(`Your tablemates are: ${tablemates.join(', ')}.`);
  updateOtherPlayersUI(tablemates);
  updateScoreboardTeams();
  tablemates.forEach(name => appendMessage(`${name}: Hello!`, 'system'));
  appendMessage('What should we call our team?');
  appendMessage(teamName, 'user');
  appendMessage(`Awesome! Our team is now called "${teamName}".`);
  updateScoreboardTeams();
  appendMessage('Are you ready to go? (y/n)');
  appendMessage('yes', 'user');
  appendMessage('Dealing the first hand');

  // Start bidding after dealing
  setTimeout(async () => {
    const biddingInfo = rookGameInstance.startBidding();
    appendMessage(`${biddingInfo.dealer} dealt. ${biddingInfo.firstBidder} starts the bidding.`);
    conversationStep = 4;
    setTimeout(() => {
      nextBiddingTurn();
    }, 800); // Small pause before first bid
  }, 2000);

  // Hide the setup overlay with fade-out
  const overlay = document.getElementById('setup-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    overlay.addEventListener('transitionend', function handler() {
      overlay.style.display = 'none';
      overlay.removeEventListener('transitionend', handler);
    });
  }

  // Keep conversationStep at 4 for bidding phase
  setInputEnabled(false);
}
  
// Add post-bid handler
async function postBidHandler(winnerName, winnerIndex, bidAmount) {
  console.log('[DEBUG] postBidHandler called', { winnerName, winnerIndex, bidAmount });
  if (winnerIndex === 0) {
    // User won: show kitty, allow selection, then prompt for trump
    rookGameInstance.state = 'postbid-user';
    await new Promise(res => setTimeout(res, 800)); // Pause after win message
    showKittyForUser();
    // Fallback: if .play-area is empty after 200ms, show error
    setTimeout(() => {
      const playArea = document.querySelector('.play-area');
      if (playArea && playArea.innerHTML.trim() === '' && rookGameInstance.state === 'postbid-user') {
        appendMessage('[ERROR] Could not display kitty. Please check the UI.');
        console.error('[DEBUG] .play-area was empty after showKittyForUser');
      }
    }, 200);
  } else {
    // Computer won: choose trump
    rookGameInstance.state = 'postbid-computer';
    const trump = chooseComputerTrump(winnerIndex);
    rookGameInstance.trump = trump;
    await new Promise(res => setTimeout(res, 800)); // Pause before power suit message
    appendMessage(`${rookGameInstance.players[winnerIndex].name} chooses ${capitalize(trump)} as the power suit!`);
    // Start the play phase
    setTimeout(() => {
      startPlayPhase();
    }, 800);
    
    // Add current round to table and update scoreboard
    addCurrentRoundToTable();
    updateScoreboard();
  }
}

function chooseComputerTrump(winnerIndex) {
  const hand = rookGameInstance.players[winnerIndex].hand;
  const suitCounts = {};
  hand.forEach(card => {
    if (!card.suit) return;
    if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
    suitCounts[card.suit].push(card.value);
  });
  // Find suit with most cards, break ties by highest card
  let bestSuit = null;
  let bestCount = -1;
  let bestHigh = -1;
  for (const suit in suitCounts) {
    const count = suitCounts[suit].length;
    const high = Math.max(...suitCounts[suit]);
    if (count > bestCount || (count === bestCount && high > bestHigh)) {
      bestSuit = suit;
      bestCount = count;
      bestHigh = high;
    }
  }
  return bestSuit;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show the kitty in .play-area and allow user to pick cards
function showKittyForUser() {
  // Add kitty cards to hand and clear kitty
  rookGameInstance.players[0].hand.push(...rookGameInstance.kitty);
  rookGameInstance.kitty = [];
  // Render the updated hand
  renderPlayerHand(rookGameInstance.players[0].hand);
  setTimeout(() => {
    appendMessage('Kitty cards have been added to your hand.');
    promptDiscardToKittyWithConfirm(5);
  }, 800);
  window._selectedKitty = [];
  console.log('[DEBUG] showKittyForUser added kitty cards to hand');
}

function promptDiscardToKittyWithConfirm(numToDiscard) {
  appendMessage(`Select ${numToDiscard} cards from your hand to discard to the kitty, then click Confirm.`);
  const handDiv = document.querySelector('.cards-in-hand');
  handDiv.querySelectorAll('.card').forEach((cardDiv, idx) => {
    cardDiv.style.cursor = 'pointer';
    cardDiv.addEventListener('click', () => selectDiscardCardWithConfirm(idx, cardDiv, numToDiscard));
  });
  window._selectedDiscard = [];
  // Add Confirm button to the play area instead of the chat log
  const playArea = document.querySelector('.play-area');
  const confirmDiv = document.createElement('div');
  confirmDiv.style.marginTop = '12px';
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  // Style the Confirm button similar to Send
  confirmBtn.style.padding = '8px 18px';
  confirmBtn.style.background = '#cdcdcd';
  confirmBtn.style.border = 'none';
  confirmBtn.style.color = '#222';
  confirmBtn.style.borderRadius = '4px';
  confirmBtn.style.fontSize = '1rem';
  confirmBtn.style.fontWeight = 'normal';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.style.transition = 'background 0.2s';
  confirmBtn.onmouseover = () => { confirmBtn.style.background = '#b0b0b0'; };
  confirmBtn.onmouseout = () => { confirmBtn.style.background = '#b0b0b0'; };
  confirmBtn.onclick = () => {
    if (window._selectedDiscard.length !== numToDiscard) {
      appendMessage(`Please select exactly ${numToDiscard} cards to discard.`);
      return;
    }
    finalizeKittyDiscard();
    confirmDiv.remove();
  };
  confirmDiv.appendChild(confirmBtn);
  playArea.appendChild(confirmDiv);
}

function selectDiscardCardWithConfirm(idx, cardDiv, numToDiscard) {
  if (!window._selectedDiscard) window._selectedDiscard = [];
  const selectedIdx = window._selectedDiscard.indexOf(idx);
  if (selectedIdx !== -1) {
    // Deselect
    window._selectedDiscard.splice(selectedIdx, 1);
    cardDiv.style.outline = '';
    return;
  }
  if (window._selectedDiscard.length >= numToDiscard) return;
  window._selectedDiscard.push(idx);
  cardDiv.style.outline = '2px solid #222222';
}

function finalizeKittyDiscard() {
  // Remove selected cards from hand+kitty, add to kitty, update hand
  const hand = rookGameInstance.players[0].hand.concat(rookGameInstance.kitty);
  const discardCards = window._selectedDiscard.map(i => hand[i]);
  rookGameInstance.kitty = discardCards;
  rookGameInstance.players[0].hand = hand.filter((_, i) => !window._selectedDiscard.includes(i));
  renderPlayerHand(rookGameInstance.players[0].hand);
  // Clear the play area (remove kitty cards and confirm button)
  const playArea = document.querySelector('.play-area');
  if (playArea) playArea.innerHTML = '';
  // Prompt for trump
  promptUserTrump();
}

function promptUserTrump() {
  appendMessage('Choose your power suit:');
  const playArea = document.querySelector('.play-area');
  playArea.innerHTML = '<h4 style="margin-bottom: 8px;">Choose Power Suit</h4><br />';
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '12px';
  btnRow.style.marginTop = '8px';
  const suitColors = {
    blue:   { bg: '#007bff', hover: '#0056b3' },
    orange: { bg: '#fd7e14', hover: '#c05600' },
    purple: { bg: '#6f42c1', hover: '#4b286b' },
    yellow: { bg: '#ffc107', hover: '#b38600', color: '#333' }
  };
  ['blue','orange','purple','yellow'].forEach(suit => {
    const btn = document.createElement('button');
    btn.textContent = capitalize(suit);
    // Style the suit button with its color
    btn.style.padding = '6px 16px';
    btn.style.background = suitColors[suit].bg;
    btn.style.border = 'none';
    btn.style.color = suitColors[suit].color || '#fff';
    btn.style.borderRadius = '4px';
    btn.style.fontSize = '1rem';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background 0.2s';
    btn.onmouseover = () => { btn.style.background = suitColors[suit].hover; };
    btn.onmouseout = () => { btn.style.background = suitColors[suit].bg; };
    btn.onclick = () => {
      rookGameInstance.trump = suit;
      appendMessage(`You chose ${capitalize(suit)} as the power suit!`);
      playArea.innerHTML = '';
      // Add current round to table and update scoreboard
      addCurrentRoundToTable();
      updateScoreboard();
      // Start the play phase
      setTimeout(() => {
        startPlayPhase();
      }, 800);
    };
    btnRow.appendChild(btn);
  });
  playArea.appendChild(btnRow);
}

// Play phase functions
function startPlayPhase() {
  const playInfo = rookGameInstance.startPlay();
  appendMessage(`${playInfo.leader} leads the first trick.`);
  conversationStep = 6; // Play phase
  setTimeout(() => {
    nextPlayTurn();
  }, 800);
}

async function nextPlayTurn() {
  if (!rookGameInstance || rookGameInstance.state !== 'play') return;

  // Check if hand is complete
  if (rookGameInstance.players.every(player => player.hand.length === 0)) {
    appendMessage('Hand complete!');
    // Calculate and display final scores
    const scoreResult = rookGameInstance.scoreHand();
    setTimeout(() => {
      const bidSuccess = scoreResult.bidSuccess ? 'made' : 'failed';
      const bidTeam = scoreResult.bidSuccess !== null ? (rookGameInstance.bidWinner % 2 === 0 ? teamName : computerTeamName) : 'No bid';
      appendMessage(`Final scores: ${teamName} ${scoreResult.team0Score > 0 ? '+' : ''}${scoreResult.team0Score}, ${computerTeamName} ${scoreResult.team1Score > 0 ? '+' : ''}${scoreResult.team1Score}`);
      if (scoreResult.bidSuccess !== null) {
        appendMessage(`${bidTeam} ${bidSuccess} their bid of ${rookGameInstance.bidAmount}`);
      }
      appendMessage(`Total: ${teamName} ${scoreResult.totalTeam0}, ${computerTeamName} ${scoreResult.totalTeam1}`);
      
      // Update the bid success/failure in the table
      updateBidSuccessInTable(scoreResult.bidSuccess);
      updateScoreboard();
      
      // Increment round for next hand
      rookGameInstance.startNewRound();
    }, 800);
    return;
  }

  // Human's turn
  if (rookGameInstance.currentPlayer === 0) {
    appendMessage('Your turn to play a card.');
    enableCardSelection();
    return;
  }

  // Computer's turn
  const playerIndex = rookGameInstance.currentPlayer;
  console.log(`[PLAY] Computer player ${playerIndex} (${rookGameInstance.players[playerIndex]?.name}) playing...`);
  
  const cardIndex = rookGameInstance.evaluateComputerPlay(playerIndex);
  if (cardIndex !== null) {
    const card = rookGameInstance.players[playerIndex].hand[cardIndex];
    const result = rookGameInstance.playCard(playerIndex, cardIndex);
    
    if (card) {
      appendMessage(`${rookGameInstance.players[playerIndex].name}: ${card.isRook ? 'Rook' : card.value} ${capitalize(card.suit)}`);
    }
    
    // Update play area to show current trick
    updatePlayArea();
    
    if (result && typeof result === 'object' && result.winner) {
      await new Promise(res => setTimeout(res, 800));
      appendMessage(`${result.winner} wins the trick!`);
      // Update live trick count
      updateLiveTrickCount();
      // Clear play area for next trick
      clearPlayArea();
      // Start next trick
      setTimeout(() => {
        nextPlayTurn();
      }, 800);
    } else if (result === true) {
      // Trick continues
      await new Promise(res => setTimeout(res, 800));
      nextPlayTurn();
    }
  }
}

function enableCardSelection() {
  const handDiv = document.querySelector('.cards-in-hand');
  const validPlays = rookGameInstance.getValidPlays(0);
  
  handDiv.querySelectorAll('.card').forEach((cardDiv, idx) => {
    if (validPlays.includes(idx)) {
      cardDiv.style.cursor = 'pointer';
      cardDiv.addEventListener('click', () => playCard(idx, cardDiv));
    } else {
      cardDiv.style.cursor = 'not-allowed';
      cardDiv.style.opacity = '0.5';
    }
  });
}

function playCard(cardIndex, cardDiv) {
  // Remove click handlers
  const handDiv = document.querySelector('.cards-in-hand');
  handDiv.querySelectorAll('.card').forEach(c => {
    c.style.cursor = '';
    c.style.opacity = '';
    c.replaceWith(c.cloneNode(true));
  });
  
  const card = rookGameInstance.players[0].hand[cardIndex];
  const result = rookGameInstance.playCard(0, cardIndex);
  
  if (card) {
    appendMessage(`You: ${card.isRook ? 'Rook' : card.value} ${capitalize(card.suit)}`);
  }
  
  // Update hand display
  renderPlayerHand(rookGameInstance.players[0].hand);
  
  // Update play area to show current trick
  updatePlayArea();
  
  if (result && typeof result === 'object' && result.winner) {
    setTimeout(() => {
      appendMessage(`${result.winner} wins the trick!`);
      // Update live trick count
      updateLiveTrickCount();
      // Clear play area for next trick
      clearPlayArea();
      // Start next trick
      setTimeout(() => {
        nextPlayTurn();
      }, 800);
    }, 800);
  } else if (result === true) {
    // Trick continues
    setTimeout(() => {
      nextPlayTurn();
    }, 800);
  }
}

// Play area display functions
function updatePlayArea() {
  const playArea = document.querySelector('.play-area');
  if (!playArea || !rookGameInstance || !rookGameInstance.currentTrick) return;
  
  // Clear existing content except power suit pill
  const powerSuitPill = playArea.querySelector('#power-suit-pill');
  playArea.innerHTML = '';
  if (powerSuitPill) {
    playArea.appendChild(powerSuitPill);
  }
  
  // Add current trick display
  if (rookGameInstance.currentTrick.length > 0) {
    const trickTitle = document.createElement('h4');
    trickTitle.textContent = 'Current Trick';
    trickTitle.style.marginBottom = '12px';
    trickTitle.style.textAlign = 'center';
    playArea.appendChild(trickTitle);
    
    const trickContainer = document.createElement('div');
    trickContainer.style.display = 'flex';
    trickContainer.style.justifyContent = 'center';
    trickContainer.style.gap = '8px';
    trickContainer.style.flexWrap = 'wrap';
    
    // Create 4 slots for the trick (even if not all filled)
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.style.width = '60px';
      slot.style.height = '80px';
      slot.style.border = '2px dashed #ccc';
      slot.style.borderRadius = '8px';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.backgroundColor = '#f8f8f8';
      
      if (i < rookGameInstance.currentTrick.length) {
        const play = rookGameInstance.currentTrick[i];
        const card = play.card;
        const player = rookGameInstance.players[play.player];
        
        // Create card display
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit}${card.isRook ? ' rook' : ''}`;
        cardDiv.style.transform = 'scale(0.8)';
        cardDiv.innerHTML = `<p>${card.isRook ? 'R' : card.value} <span class="card-icon"></span></p>`;
        
        // Add player name below card
        const playerName = document.createElement('div');
        playerName.textContent = player.name;
        playerName.style.fontSize = '0.8rem';
        playerName.style.textAlign = 'center';
        playerName.style.marginTop = '4px';
        playerName.style.color = '#666';
        
        const cardContainer = document.createElement('div');
        cardContainer.appendChild(cardDiv);
        cardContainer.appendChild(playerName);
        
        slot.innerHTML = '';
        slot.appendChild(cardContainer);
        slot.style.border = '2px solid #333';
        slot.style.backgroundColor = '#fff';
      } else {
        // Empty slot
        slot.innerHTML = '<span style="color: #ccc; font-size: 0.8rem;">Empty</span>';
      }
      
      trickContainer.appendChild(slot);
    }
    
    playArea.appendChild(trickContainer);
  }
}

function clearPlayArea() {
  const playArea = document.querySelector('.play-area');
  if (!playArea) return;
  
  // Clear everything except power suit pill
  const powerSuitPill = playArea.querySelector('#power-suit-pill');
  playArea.innerHTML = '';
  if (powerSuitPill) {
    playArea.appendChild(powerSuitPill);
  }
}

// Scoreboard update functions
function updateScoreboard() {
  if (!rookGameInstance) return;
  
  // Update overall team scores
  const teamScoreEls = document.querySelectorAll('.team-score .score');
  if (teamScoreEls.length >= 2) {
    teamScoreEls[0].textContent = rookGameInstance.scores.team0;
    teamScoreEls[1].textContent = rookGameInstance.scores.team1;
  }
  
  // Update round table
  updateRoundTable();
}

function updateRoundTable() {
  if (!rookGameInstance) return;
  
  const roundTable = document.querySelector('.score-by-round table');
  if (!roundTable) return;
  
  // Update team names in header
  const ths = roundTable.querySelectorAll('thead th');
  if (ths.length >= 5) {
    ths[3].textContent = teamName;
    ths[4].textContent = computerTeamName;
  }
  
  // Clear existing rows in tbody
  const tbody = roundTable.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = '';
  }
  
  // Add rows for each round
  rookGameInstance.roundScores.forEach((roundScore, index) => {
    const row = document.createElement('tr');
    
    const roundCell = document.createElement('td');
    roundCell.textContent = `R${roundScore.round}`;
    
    const bidSuccessCell = document.createElement('td');
    bidSuccessCell.textContent = roundScore.bidSuccess === null ? 'X' : (roundScore.bidSuccess ? '✓' : 'X');
    
    const bidInfoCell = document.createElement('td');
    if (roundScore.bidWinner === 'None') {
      bidInfoCell.textContent = 'X';
    } else {
      const shortName = roundScore.bidWinner.substring(0, 3);
      bidInfoCell.textContent = `${shortName} ${roundScore.bidAmount}`;
    }
    
    const team0Cell = document.createElement('td');
    team0Cell.textContent = roundScore.team0Score;
    
    const team1Cell = document.createElement('td');
    team1Cell.textContent = roundScore.team1Score;
    
    row.appendChild(roundCell);
    row.appendChild(bidSuccessCell);
    row.appendChild(bidInfoCell);
    row.appendChild(team0Cell);
    row.appendChild(team1Cell);
    
    tbody.appendChild(row);
  });
}

function updateLiveTrickCount() {
  if (!rookGameInstance || rookGameInstance.state !== 'play') return;
  
  // Calculate current points for each team
  let team0Points = 0;
  let team1Points = 0;
  
  // Go through all completed tricks to calculate points
  for (let i = 0; i < rookGameInstance.tricks.length; i++) {
    const trick = rookGameInstance.tricks[i];
    const trickWinner = rookGameInstance.trickWinners[i];
    const winningTeam = trickWinner % 2; // 0 or 1
    
    // Calculate points for this trick
    let trickPoints = 0;
    for (const play of trick) {
      const card = play.card;
      if (card.isRook) {
        trickPoints += 20;
      } else if (card.value === 1) {
        trickPoints += 15;
      } else if (card.value === 14 || card.value === 10) {
        trickPoints += 10;
      } else if (card.value === 5) {
        trickPoints += 5;
      }
    }
    
    // Last trick gets 20 bonus points
    if (i === rookGameInstance.tricks.length - 1) {
      trickPoints += 20;
    }
    
    // Add points to appropriate team
    if (winningTeam === 0) {
      team0Points += trickPoints;
    } else {
      team1Points += trickPoints;
    }
  }
  
  // Update the current round row in the table with live points
  updateCurrentRoundRow(team0Points, team1Points);
}

function updateCurrentRoundRow(team0Points, team1Points) {
  if (!rookGameInstance || !rookGameInstance.bidAmount) return;
  
  const roundTable = document.querySelector('.score-by-round table tbody');
  if (!roundTable) return;
  
  // Find the current round row (should be the last row)
  const rows = roundTable.querySelectorAll('tr');
  if (rows.length > 0) {
    const currentRow = rows[rows.length - 1];
    const cells = currentRow.querySelectorAll('td');
    
    if (cells.length >= 5) {
      // Update the team score cells with current points
      cells[3].textContent = team0Points;
      cells[4].textContent = team1Points;
    }
  }
}

function addCurrentRoundToTable() {
  if (!rookGameInstance || !rookGameInstance.bidAmount) return;
  
  const roundTable = document.querySelector('.score-by-round table tbody');
  if (!roundTable) return;
  
  // Create new row for current round
  const row = document.createElement('tr');
  
  const roundCell = document.createElement('td');
  roundCell.textContent = `R${rookGameInstance.currentRound}`;
  
  const bidSuccessCell = document.createElement('td');
  bidSuccessCell.textContent = '?'; // Will be updated when hand completes
  
  const bidInfoCell = document.createElement('td');
  const shortName = rookGameInstance.players[rookGameInstance.bidWinner].name.substring(0, 3);
  bidInfoCell.textContent = `${shortName} ${rookGameInstance.bidAmount}`;
  
  const team0Cell = document.createElement('td');
  team0Cell.textContent = '0'; // Start at 0 points
  
  const team1Cell = document.createElement('td');
  team1Cell.textContent = '0'; // Start at 0 points
  
  row.appendChild(roundCell);
  row.appendChild(bidSuccessCell);
  row.appendChild(bidInfoCell);
  row.appendChild(team0Cell);
  row.appendChild(team1Cell);
  
  roundTable.appendChild(row);
}

function updateBidSuccessInTable(bidSuccess) {
  if (!rookGameInstance) return;
  
  const roundTable = document.querySelector('.score-by-round table tbody');
  if (!roundTable) return;
  
  // Find the current round row (should be the last row)
  const rows = roundTable.querySelectorAll('tr');
  if (rows.length > 0) {
    const currentRow = rows[rows.length - 1];
    const cells = currentRow.querySelectorAll('td');
    
    if (cells.length >= 5) {
      // Update the bid success cell
      cells[1].textContent = bidSuccess ? '✓' : 'X';
    }
  }
}

// Restore DOMContentLoaded event listener to initialize the game and UI

document.addEventListener('DOMContentLoaded', () => {
  // Initial messages
  appendMessage('Welcome to Kentucky Rook!');
  setTimeout(() => {
    appendMessage('What\'s your name?');
    setInputEnabled(true);
    document.getElementById('chat-input').focus();
  }, 700);

  // Input handlers
  document.getElementById('chat-send').addEventListener('click', handleSend);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  setInputEnabled(false);

  // Debugging mode handler
  const debugLink = document.getElementById('debug-jump-in');
  if (debugLink) {
    debugLink.addEventListener('click', (e) => {
      e.preventDefault();
      runDebugMode();
    });
  }
});
  