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

document.getElementById('start-btn').addEventListener('click', () => {
  const squadSection = document.getElementById('squad-section');
  const cardContainer = document.getElementById('card-container');
  
  // Clear any existing cards
  cardContainer.innerHTML = '';

  // Generate 5 players
  for (let i = 0; i < 5; i++) {
    const player = generatePlayer();
    cardContainer.innerHTML += createCard(player);
  }

  squadSection.classList.remove('hidden');
});
