// Game state variables
let points = 0;
let pointsPerClick = 1;
let autoClickers = 0;
let autoCost = 10;
let multiplierLevel = 0;
let multiplierCost = 50;
const autoCostFactor = 1.5;
const multiplierCostFactor = 1.5;
let autoInterval = null;

// Settings variables
const bgMusicChoices = [
  "assets/future_click.mp3",
  "assets/bg-music2.mp3",
  "assets/bg-music3.mp3"
];
let bgMusicChoice = 0;
let bgVolume = 0.5; // Default volume

// Track which screen opened settings
let previousScreen = "";

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const settingsScreen = document.getElementById('settingsScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const tapButton = document.getElementById('tapButton');
const buyAutoButton = document.getElementById('buyAuto');
const buyMultiplierButton = document.getElementById('buyMultiplier');
const resetButton = document.getElementById('resetButton');
const restartButton = document.getElementById('restartButton');
const settingsButtonHome = document.getElementById('settingsButtonHome');
const settingsButtonGame = document.getElementById('settingsButtonGame');
const settingsBackButton = document.getElementById('settingsBackButton');
const pointsDisplay = document.getElementById('points');
const autoCountDisplay = document.getElementById('autoCount');
const multiplierLevelDisplay = document.getElementById('multiplierLevel');
const autoCostDisplay = document.getElementById('autoCostLabel');
const multiplierCostDisplay = document.getElementById('multiplierCostLabel');
const finalScoreDisplay = document.getElementById('finalScore');
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');
const volumeSlider = document.getElementById('volumeSlider');

// Load game state and settings from localStorage
function loadGame() {
  const savedPoints = localStorage.getItem('points');
  if (savedPoints !== null) {
    points = parseInt(savedPoints);
    pointsPerClick = parseInt(localStorage.getItem('pointsPerClick')) || 1;
    autoClickers = parseInt(localStorage.getItem('autoClickers')) || 0;
    autoCost = parseInt(localStorage.getItem('autoCost')) || 10;
    multiplierLevel = parseInt(localStorage.getItem('multiplierLevel')) || 0;
    multiplierCost = parseInt(localStorage.getItem('multiplierCost')) || 50;
  } else {
    points = 0;
    pointsPerClick = 1;
    autoClickers = 0;
    autoCost = 10;
    multiplierLevel = 0;
    multiplierCost = 50;
  }
  
  const savedBgChoice = localStorage.getItem('bgMusicChoice');
  if (savedBgChoice !== null) {
    bgMusicChoice = parseInt(savedBgChoice);
  }
  const savedVolume = localStorage.getItem('bgVolume');
  if (savedVolume !== null) {
    bgVolume = parseFloat(savedVolume);
  }
  
  // Update bgMusic settings
  bgMusic.src = bgMusicChoices[bgMusicChoice];
  bgMusic.volume = bgVolume;
  updateSettingsUI();
}

// Save game state and settings to localStorage
function saveGame() {
  localStorage.setItem('points', points);
  localStorage.setItem('pointsPerClick', pointsPerClick);
  localStorage.setItem('autoClickers', autoClickers);
  localStorage.setItem('autoCost', autoCost);
  localStorage.setItem('multiplierLevel', multiplierLevel);
  localStorage.setItem('multiplierCost', multiplierCost);
  localStorage.setItem('bgMusicChoice', bgMusicChoice);
  localStorage.setItem('bgVolume', bgVolume);
}

// Update the main UI
function updateUI() {
  pointsDisplay.innerText = points;
  autoCountDisplay.innerText = autoClickers;
  multiplierLevelDisplay.innerText = multiplierLevel;
  autoCostDisplay.innerText = autoCost;
  multiplierCostDisplay.innerText = multiplierCost;
  buyAutoButton.disabled = (points < autoCost);
  buyMultiplierButton.disabled = (points < multiplierCost);
}

// Update Settings Screen UI (radio buttons and slider)
function updateSettingsUI() {
  document.querySelectorAll('input[name="bgMusic"]').forEach(radio => {
    radio.checked = (parseInt(radio.value) === bgMusicChoice);
  });
  volumeSlider.value = bgVolume;
}

// Screen transition helper: hide all screens then show target
function showScreen(targetScreen) {
  homeScreen.style.display = 'none';
  gameScreen.style.display = 'none';
  settingsScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  targetScreen.style.display = 'flex';
}

// Start or resume the game
function startGame() {
  loadGame();
  showScreen(gameScreen);
  bgMusic.currentTime = 0;
  bgMusic.play();
  if (autoInterval) clearInterval(autoInterval);
  autoInterval = setInterval(() => {
    if (autoClickers > 0) {
      points += autoClickers;
    }
    updateUI();
    saveGame();
  }, 1000);
  updateUI();
}

// End game (reset interval and show Game Over)
function gameOver() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
  bgMusic.pause();
  finalScoreDisplay.innerText = points;
  showScreen(gameOverScreen);
}

// Event Listeners

startButton.addEventListener('click', startGame);

tapButton.addEventListener('click', () => {
  points += pointsPerClick;
  updateUI();
  // Clone the audio element to allow overlapping playback
  const soundClone = clickSound.cloneNode();
  soundClone.play();
  tapButton.classList.add('clicked');
  setTimeout(() => tapButton.classList.remove('clicked'), 200);
});

buyAutoButton.addEventListener('click', () => {
  if (points >= autoCost) {
    points -= autoCost;
    autoClickers += 1;
    autoCost = Math.ceil(autoCost * autoCostFactor);
    updateUI();
    saveGame();
    buyAutoButton.classList.add('purchased');
    setTimeout(() => buyAutoButton.classList.remove('purchased'), 500);
  }
});

buyMultiplierButton.addEventListener('click', () => {
  if (points >= multiplierCost) {
    points -= multiplierCost;
    multiplierLevel += 1;
    pointsPerClick = 1 + multiplierLevel;
    multiplierCost = Math.ceil(multiplierCost * multiplierCostFactor);
    updateUI();
    saveGame();
    buyMultiplierButton.classList.add('purchased');
    setTimeout(() => buyMultiplierButton.classList.remove('purchased'), 500);
  }
});

resetButton.addEventListener('click', () => {
  if (!confirm('Reset progress and start over?')) return;
  localStorage.clear();
  gameOver();
});

restartButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startGame();
});

// Settings button event listeners (store which screen opened settings)
settingsButtonHome.addEventListener('click', () => {
  previousScreen = 'home';
  showScreen(settingsScreen);
});
settingsButtonGame.addEventListener('click', () => {
  previousScreen = 'game';
  showScreen(settingsScreen);
});

// Settings Back button: return to the previous screen
settingsBackButton.addEventListener('click', () => {
  if (previousScreen === 'home') {
    showScreen(homeScreen);
  } else if (previousScreen === 'game') {
    showScreen(gameScreen);
  }
});

// Radio button event: change background music selection
document.querySelectorAll('input[name="bgMusic"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    bgMusicChoice = parseInt(e.target.value);
    bgMusic.src = bgMusicChoices[bgMusicChoice];
    saveGame();
  });
});

// Volume slider event: update volume
volumeSlider.addEventListener('input', (e) => {
  bgVolume = parseFloat(e.target.value);
  bgMusic.volume = bgVolume;
  saveGame();
});

// Prevent music from autoplaying without interaction
window.addEventListener('load', () => {
  bgMusic.pause();
  bgMusic.currentTime = 0;
});
