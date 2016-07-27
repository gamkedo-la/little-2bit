var gameCanvas, gameContext, uiCanvas, uiContext;
var framesPerSecond = 30;
var gameInterval;
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

// Debug
var debug = true;

window.onload = function() {
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

  gameInterval = setInterval(gameLoop, 1000/framesPerSecond);
  console.log('Starting game!');
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

  Grid.draw();
  ProjectileList.draw();
  ParticleList.draw();
  EnemyList.draw();
  Ship.draw();

  gameContext.restore();

  UI.draw();
}
