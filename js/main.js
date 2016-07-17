var gameCanvas, gameContext;
var framesPerSecond = 30;
var gameInterval;
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

// Debug
var debug = false;

window.onload = function() {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');

  clearCanvas();
  Images.initialize(Menu.initialize);
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

function clearCanvas() {
  if (Menu.active && Images.stars) {
    drawBitmapCenteredWithRotation(gameContext, Images.stars, gameCanvas.width/2,gameCanvas.height/2);
  }
}

function gameLoop() {
  clearCanvas();

  UI.update();
  Grid.update();
  Ship.update();

  gameContext.save();
  gameContext.translate(-Grid.cameraPanX(), 0);
  Grid.draw();
  Ship.draw();
  gameContext.restore();

  UI.draw();
}
