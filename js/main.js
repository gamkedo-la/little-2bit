var gameCanvas, gameContext, uiCanvas, uiContext;
var framesPerSecond = 30;
var gameInterval;
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

// Debug
var debug = true;

window.onload = function () {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');
  uiCanvas = document.getElementById('uiCanvas');
  uiContext = uiCanvas.getContext('2d');

  Sounds.initialize();
  // Skip menu for now, until we have more levels :)
//  Images.initialize(Menu.initialize);
  Images.initialize(gameStart);
};

function gameStart() {
  setupInput();

  Menu.deactive();

  UI.initialize();
  Grid.initialize();
  Ship.initialize();

  gameInterval = setInterval(gameLoop, 1000 / framesPerSecond);
  console.log('Starting game!');
}

function shakeScreen(amount) {
  screenShakeAmountHalf = amount / 2;
  screenShakeAmount = amount;
}

function gameLoop() {
  UI.update();
  Grid.update();
  ProjectileList.update();
  EnemyList.update();
  Ship.update();
  ParticleList.update();

  gameContext.save();
  gameContext.translate(-Grid.cameraPanX(), 0);

  if (screenShakeAmount) {
    if (screenShakeAmount < screenShakeAmountHalf) {
      screenShakeAmount *= 0.75;
    }
    else {
      screenShakeAmount *= 0.95;
    }

    gameContext.translate(Math.random()*screenShakeAmount-screenShakeAmount*0.5, Math.random()*screenShakeAmount-screenShakeAmount*0.5);

    if (screenShakeAmount <= 0.02) {
      screenShakeAmount = 0;
    }
  }

  Grid.draw();
  ProjectileList.draw();
  ParticleList.draw();
  EnemyList.draw();
  Ship.draw();

  gameContext.restore();

  UI.draw();
}
