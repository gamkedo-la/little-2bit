var gameCanvas, gameContext;
var framesPerSecond = 30;
var gameInterval;
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

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
  Ship.initialize();

  gameInterval = setInterval(gameLoop, 1000/framesPerSecond);
  console.log('Starting game!');
}

function clearCanvas() {
//  drawRect(gameContext, 0,0, gameCanvas.width,gameCanvas.height, 'black');
  if (Menu.active && Images.stars) {
    drawBitmapCenteredWithRotation(gameContext, Images.stars, gameCanvas.width/2,gameCanvas.height/2);
  }
}

function gameLoop() {
  clearCanvas();

  UI.update();
  Ship.update();

  UI.draw();
  Ship.draw();
}
