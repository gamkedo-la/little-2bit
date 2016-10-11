//Canvas rescale variables
var drawScale, aspectRatio;
var gameDiv;
var drawCanvas, drawContext;

var gameCanvas, gameContext, uiCanvas, uiContext;
var framesPerSecond = 30;
var gameInitialized = false;
var gameInterval;
var gameInitTime, gameTime;
var mouseCoords = {};
var gameFontHuge = '50pt Verdana';
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var gameFontExtraSmall = '10pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

var shipProjectiles, enemyProjectiles;

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

// Debug
var debug = false;
var debug_editor = false;
var debug_draw_bounds = false;
var debug_single_step = false;
var debug_stop_camera = false;
var debug_stop_enemies = false;

window.onload = function () {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');
  uiCanvas = document.getElementById('uiCanvas');
  uiContext = uiCanvas.getContext('2d');
  drawCanvas = document.getElementById('drawCanvas');
  drawContext = drawCanvas.getContext('2d');

  Sounds.initialize();
  Images.initialize(menuInitialize);
	
	initDrawingCanvas();
	resizeWindow();
};

function menuInitialize() {
  StarfieldList.initialize();
  UI.initialize();
  MenuCredits.initialize();
  Menu.initialize();
}

function gameInitialize() {
  setupInput();

  Grid.initialize();
  Ship.initialize();
  Editor.initialize();

  shipProjectiles = new ProjectileList();
  enemyProjectiles = new ProjectileList();

  if (debug) {
    console.log('Debug mode enabled! Action keys:');
    console.table({
      1: 'Single laser',
      2: 'Double laser',
      3: 'Triple laser',
      4: 'Rocket',
      5: 'Double Rocket',
      6: 'Homing Rocket',
      b: 'Draw bounds',
      o: 'Stop enemy movement',
      p: 'Stop camera movement',
      l: 'Level editor'
    });

    document.addEventListener('keyup', function(event) {
      event.preventDefault();
      switch (event.keyCode) {
        case KEY_1:
          Ship.setProjectile(Laser);
          break;
        case KEY_2:
          Ship.setProjectile(DoubleLaser);
          break;
        case KEY_3:
          Ship.setProjectile(TripleLaser);
          break;
        case KEY_4:
          Ship.setProjectile(Rocket);
          break;
        case KEY_5:
          Ship.setProjectile(DoubleRocket);
          break;
        case KEY_6:
          Ship.setProjectile(HomingRocket);
          break;
        case KEY_B:
          debug_draw_bounds = !debug_draw_bounds;
          break;
        case KEY_L:
          Editor.toggle();
          break;
        case KEY_O:
          debug_stop_enemies = !debug_stop_enemies;
          break;
        case KEY_P:
          debug_stop_camera = !debug_stop_camera;
          break;
        default:
//          console.log('Pressed', event.keyCode);
      }
    });
  }
}

function gameStart(levelId) {
  if (!gameInitialized) {
    gameInitialized = true;
    gameInitialize();
  }

  Menu.deactivate();

  Grid.loadLevelId(levelId);
  Ship.restart();

  if (debug && debug_single_step) {
    gameLoop();
    console.log('Single Step gameLoop!');
    console.log('middle mouse = spawn Laser');
    console.log('left mouse = single gameLoop step');
    document.addEventListener('mousedown', function(event) {
      if (event.button == 1) {
        var c = Ship.coords();
        shipProjectiles.spawn(Laser, c.x, c.y);
      }
      else {
        gameLoop();
      }
      event.preventDefault();
    });
  }
  else {
    gameInitTime = Date.now();
    gameInterval = setInterval(gameLoop, 1000 / framesPerSecond);
  }

  if (debug) {
    gameCanvas.addEventListener('mouseup', explodeAt);

    function explodeAt(event) {
      var rect = gameCanvas.getBoundingClientRect();
      var root = document.documentElement;
      var mouseX = (event.clientX - rect.left - root.scrollLeft)/drawScale;
      var mouseY = (event.clientY - rect.top - root.scrollTop)/drawScale;

      console.log('explode at', mouseX, mouseY);
      ParticleList.explosion(mouseX, mouseY - 50);
    }
  }
}

function shakeScreen(amount) {
  screenShakeAmountHalf = amount / 2;
  screenShakeAmount = amount;
}

function gameLoop() {
  gameTime = Date.now - gameInitTime;
  TWEEN.update();

  Grid.update();
  var leftBound = Grid.levelInfo().leftBound;
  StarfieldList.update(leftBound);
  PowerUpList.update();
  shipProjectiles.update();
  enemyProjectiles.update();
  EnemyList.update();
  Ship.update();
  ParticleList.update();
  UI.update();
  Editor.update();

  if (!gameInterval) {
    return;
  }

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

  StarfieldList.draw(leftBound);
  Grid.draw();
  PowerUpList.draw();
  shipProjectiles.draw();
  enemyProjectiles.draw();
  ParticleList.draw();
  EnemyList.draw();
  Ship.draw();
  Editor.draw();

  gameContext.restore();

  UI.draw();

  redrawCanvas();
}

function resizeWindow() {
  gameDiv.height = window.innerHeight;
  gameDiv.width = window.innerWidth;

  if (window.innerWidth / window.innerHeight < aspectRatio) {
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerWidth / aspectRatio;
  }
  else {
    drawCanvas.height = window.innerHeight;
    drawCanvas.width = window.innerHeight * aspectRatio;
  }

  drawCanvas.style.top = (window.innerHeight / 2 - drawCanvas.height / 2) + 'px';
  drawCanvas.style.left = (window.innerWidth / 2 - drawCanvas.width / 2) + 'px';

  drawScale = drawCanvas.width / gameCanvas.width;
}

function calculateMouseCoords(event) {
  var rect = drawCanvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseCoords = {
    x: (event.clientX - rect.left - root.scrollLeft) / drawScale,
    y: (event.clientY - rect.top - uiCanvas.height * drawScale - root.scrollTop) / drawScale
  };
}

function redrawCanvas() {
  // Use scale and translate to align multiple canvas objects to the drawing canvas
  drawContext.save();
  drawContext.translate(0, uiCanvas.height * drawScale);
  drawContext.scale(drawScale, drawScale);
  drawContext.drawImage(gameCanvas, 0, 0);
  drawContext.restore();

  drawContext.save();
  drawContext.scale(drawScale, drawScale);
  drawContext.drawImage(uiCanvas, 0, 0);
  drawContext.restore();
}

function initDrawingCanvas() {
  window.addEventListener('resize', resizeWindow);
  gameDiv = document.getElementById('gameDiv');

  aspectRatio = gameCanvas.width / (gameCanvas.height + uiCanvas.height);
}
