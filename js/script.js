// Initial game state variables
let points = 0;
let pointsPerClick = 1;
let autoClickers = 0;
let autoCost = 10;
let multiplierLevel = 0;
let multiplierCost = 50;
const autoCostFactor = 1.5;
const multiplierCostFactor = 1.5;
let autoInterval = null;

// Get references to DOM elements
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const tapButton = document.getElementById('tapButton');
const buyAutoButton = document.getElementById('buyAuto');
const buyMultiplierButton = document.getElementById('buyMultiplier');
const resetButton = document.getElementById('resetButton');
const restartButton = document.getElementById('restartButton');
const pointsDisplay = document.getElementById('points');
const autoCountDisplay = document.getElementById('autoCount');
const multiplierLevelDisplay = document.getElementById('multiplierLevel');
const autoCostDisplay = document.getElementById('autoCostLabel');
const multiplierCostDisplay = document.getElementById('multiplierCostLabel');
const finalScoreDisplay = document.getElementById('finalScore');
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');

// Load game state from localStorage if available
function loadGame() {
  const savedPoints = localStorage.getItem('points');
  if (savedPoints !== null) {
    // Load saved values
    points = parseInt(savedPoints);
    pointsPerClick = parseInt(localStorage.getItem('pointsPerClick')) || 1;
    autoClickers = parseInt(localStorage.getItem('autoClickers')) || 0;
    autoCost = parseInt(localStorage.getItem('autoCost')) || 10;
    multiplierLevel = parseInt(localStorage.getItem('multiplierLevel')) || 0;
    multiplierCost = parseInt(localStorage.getItem('multiplierCost')) || 50;
  } else {
    // No saved game, use default starting values
    points = 0;
    pointsPerClick = 1;
    autoClickers = 0;
    autoCost = 10;
    multiplierLevel = 0;
    multiplierCost = 50;
  }
}

// Save current state to localStorage
function saveGame() {
  localStorage.setItem('points', points);
  localStorage.setItem('pointsPerClick', pointsPerClick);
  localStorage.setItem('autoClickers', autoClickers);
  localStorage.setItem('autoCost', autoCost);
  localStorage.setItem('multiplierLevel', multiplierLevel);
  localStorage.setItem('multiplierCost', multiplierCost);
}

// Update the displayed UI elements
function updateUI() {
  pointsDisplay.innerText = points;
  autoCountDisplay.innerText = autoClickers;
  multiplierLevelDisplay.innerText = multiplierLevel;
  autoCostDisplay.innerText = autoCost;
  multiplierCostDisplay.innerText = multiplierCost;
  // Enable/disable upgrade buttons based on affordability
  buyAutoButton.disabled = (points < autoCost);
  buyMultiplierButton.disabled = (points < multiplierCost);
}

// Start or continue the game
function startGame() {
  loadGame();                            // Load saved progress (if any)
  homeScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  gameScreen.style.display = 'flex';     // Show main game screen
  bgMusic.currentTime = 0;
  bgMusic.play();                        // Play background music
  // Start auto-clicker interval
  if (autoInterval) clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (autoClickers > 0) {
      points += autoClickers;            // generate points from auto-clickers
    }
    updateUI();
    saveGame();
  }, 1000);
  updateUI(); // initial UI update
}

// End the game and show Game Over screen
function gameOver() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
  bgMusic.pause();
  finalScoreDisplay.innerText = points;  // show final score
  gameScreen.style.display = 'none';
  gameOverScreen.style.display = 'flex'; // show Game Over screen
}

// Event listeners for buttons:
startButton.addEventListener('click', () => {
  startGame();
});

tapButton.addEventListener('click', () => {
  // Manual tap to earn points
  points += pointsPerClick;
  updateUI();
  clickSound.currentTime = 0;
  clickSound.play();
  // Click animation
  tapButton.classList.add('clicked');
  setTimeout(() => tapButton.classList.remove('clicked'), 200);
});

buyAutoButton.addEventListener('click', () => {
  // Purchase Auto-Clicker upgrade
  if (points >= autoCost) {
    points -= autoCost;
    autoClickers += 1;
    autoCost = Math.ceil(autoCost * autoCostFactor);  // increase next cost
    updateUI();
    saveGame();
    // Upgrade button flash animation
    buyAutoButton.classList.add('purchased');
    setTimeout(() => buyAutoButton.classList.remove('purchased'), 500);
  }
});

buyMultiplierButton.addEventListener('click', () => {
  // Purchase Multiplier upgrade
  if (points >= multiplierCost) {
    points -= multiplierCost;
    multiplierLevel += 1;
    pointsPerClick = 1 + multiplierLevel;             // each multiplier adds +1 per tap
    multiplierCost = Math.ceil(multiplierCost * multiplierCostFactor);
    updateUI();
    saveGame();
    buyMultiplierButton.classList.add('purchased');
    setTimeout(() => buyMultiplierButton.classList.remove('purchased'), 500);
  }
});

resetButton.addEventListener('click', () => {
  // Reset the game progress
  if (!confirm('Reset progress and start over?')) return;
  localStorage.clear();  // clear saved data
  gameOver();            // end the game and go to Game Over screen
});

restartButton.addEventListener('click', () => {
  // Restart a new game from Game Over screen
  gameOverScreen.style.display = 'none';
  startGame();
});

// Prevent music from autoplaying on page load without interaction
window.addEventListener('load', () => {
  bgMusic.pause();
  bgMusic.currentTime = 0;
});
