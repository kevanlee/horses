const fruits = ['Apple', 'Mango', 'Peach', 'Banana', 'Kiwi', 'Strawberry', 'Pineapple', 'Grape', 'Orange', 'Cherry'];
const animals = ['Tiger', 'Eagle', 'Shark', 'Bear', 'Panther', 'Wolf', 'Falcon', 'Rhino', 'Cobra', 'Jaguar'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePlayer() {
  const name = `${fruits[getRandomInt(0, fruits.length - 1)]} ${animals[getRandomInt(0, animals.length - 1)]}`;
  const offense = getRandomInt(1, 99);
  const defense = getRandomInt(1, 99);
  const intangibles = getRandomInt(1, 99);
  const overall = Math.round((offense + defense + intangibles) / 3);
  return { name, offense, defense, intangibles, overall };
}

function createCard(player) {
  return `
    <div class="card">
      <h3>${player.name}</h3>
      <p class="stat"><strong>Overall:</strong> ${player.overall}</p>
      <p class="stat"><strong>Offense:</strong> ${player.offense}</p>
      <p class="stat"><strong>Defense:</strong> ${player.defense}</p>
      <p class="stat"><strong>Intangibles:</strong> ${player.intangibles}</p>
    </div>
  `;
}
function loadRecord() {
  return {
    wins: parseInt(localStorage.getItem('wins')) || 0,
    losses: parseInt(localStorage.getItem('losses')) || 0,
    ties: parseInt(localStorage.getItem('ties')) || 0,
    pointDiff: parseInt(localStorage.getItem('pointDiff')) || 0,
  };
}

function saveRecord(record) {
  localStorage.setItem('wins', record.wins);
  localStorage.setItem('losses', record.losses);
  localStorage.setItem('ties', record.ties);
  localStorage.setItem('pointDiff', record.pointDiff);
}


function updateScoreboard(record) {
  document.getElementById('wins').textContent = record.wins;
  document.getElementById('losses').textContent = record.losses;
  document.getElementById('ties').textContent = record.ties;
  document.getElementById('point-diff').textContent = record.pointDiff;
}



document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById('start-btn');
  const battleBtn = document.getElementById('battle-btn');
  const squadSection = document.getElementById('squad-section');
  const cardContainer = document.getElementById('card-container');
  const opponentContainer = document.getElementById('opponent-container');
  const resultText = document.getElementById('result');

  let squad = [];
  let opponent = [];

  startBtn.addEventListener('click', () => {
    cardContainer.innerHTML = '';
    opponentContainer.innerHTML = '';
    resultText.classList.add('hidden');
    battleBtn.classList.remove('hidden');

    squad = [];
    opponent = [];

    for (let i = 0; i < 5; i++) {
      const player = generatePlayer();
      squad.push(player);
      cardContainer.innerHTML += createCard(player);
    }

    for (let i = 0; i < 5; i++) {
      const enemy = generatePlayer();
      opponent.push(enemy);
      opponentContainer.innerHTML += createCard(enemy);
    }

    squadSection.classList.remove('hidden');
  });

  battleBtn.addEventListener('click', () => {
    function getTeamStats(team) {
      let offenseTotal = 0;
      let defenseTotal = 0;
      let intangiblesTotal = 0;
  
      team.forEach(player => {
        offenseTotal += player.offense;
        defenseTotal += player.defense;
        intangiblesTotal += player.intangibles;
      });
  
      const avgOffense = offenseTotal / team.length;
      const avgDefense = defenseTotal / team.length;
      const avgIntangibles = intangiblesTotal / team.length;
      const randomBonus = getRandomInt(0, 10);
  
      const score = 
        (avgOffense * 0.4) + 
        (avgDefense * 0.3) + 
        (avgIntangibles * 0.3) + 
        randomBonus;
  
      return {
        avgOffense: avgOffense.toFixed(1),
        avgDefense: avgDefense.toFixed(1),
        avgIntangibles: avgIntangibles.toFixed(1),
        bonus: randomBonus,
        score: Math.round(score)
      };
    }
  
    const squadStats = getTeamStats(squad);
    const opponentStats = getTeamStats(opponent);
  
    let result = '';
    if (squadStats.score > opponentStats.score) {
      result = `Your Squad Wins! 🎉 (${squadStats.score} - ${opponentStats.score})`;
    } else if (opponentStats.score > squadStats.score) {
      result = `Opponent Wins! 😤 (${opponentStats.score} - ${squadStats.score})`;
    } else {
      result = `It's a tie! 🤝 (${squadStats.score} - ${opponentStats.score})`;
    }
  
    resultText.textContent = result;
    resultText.classList.remove('hidden');
  
    if (squadStats.score > opponentStats.score) {
      currentRecord.wins += 1;
    } else if (opponentStats.score > squadStats.score) {
      currentRecord.losses += 1;
    } else {
      currentRecord.ties += 1;
    }
    
// Add point differential
currentRecord.pointDiff += squadStats.score - opponentStats.score;

// Then update the record as before
if (squadStats.score > opponentStats.score) {
  currentRecord.wins += 1;
} else if (opponentStats.score > squadStats.score) {
  currentRecord.losses += 1;
} else {
  currentRecord.ties += 1;
}

saveRecord(currentRecord);
updateScoreboard(currentRecord);

    
    const breakdownText = `
  🟦 Your Squad
  - Avg Offense: ${squadStats.avgOffense}
  - Avg Defense: ${squadStats.avgDefense}
  - Avg Intangibles: ${squadStats.avgIntangibles}
  - Bonus: ${squadStats.bonus}
  - Final Score: ${squadStats.score}
  
  🟥 Opponent Squad
  - Avg Offense: ${opponentStats.avgOffense}
  - Avg Defense: ${opponentStats.avgDefense}
  - Avg Intangibles: ${opponentStats.avgIntangibles}
  - Bonus: ${opponentStats.bonus}
  - Final Score: ${opponentStats.score}
    `.trim();
  
    document.getElementById('breakdown-text').textContent = breakdownText;
    document.getElementById('breakdown').classList.remove('hidden');
  });
  
  
});

const currentRecord = loadRecord();
updateScoreboard(currentRecord);

