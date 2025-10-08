let totalGlasses = 8;
let currentGlasses = 0;

const waterEl = document.getElementById('water');
const statsEl = document.getElementById('stats');
const messageEl = document.getElementById('message');
const goalInput = document.getElementById('goalInput');

function updateGlass() {
  const percentage = (currentGlasses / totalGlasses) * 100;
  waterEl.style.height = percentage + '%';
  statsEl.textContent = `${currentGlasses} / ${totalGlasses} Glasses`;

  if (currentGlasses === totalGlasses) {
    messageEl.style.display = 'block';
  } else {
    messageEl.style.display = 'none';
  }
}

function drinkWater() {
  if (currentGlasses < totalGlasses) {
    currentGlasses++;
    updateGlass();
  }
}
function removeWater() {
  if (currentGlasses > 0) {
    currentGlasses--;
    updateGlass();
  }
}
function setGoal() {
  const newGoal = parseInt(goalInput.value);
  if (!isNaN(newGoal) && newGoal > 0) {
    totalGlasses = newGoal;
    currentGlasses = 0;
    updateGlass();
  }
}
updateGlass();