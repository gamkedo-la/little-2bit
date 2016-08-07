var gameCanvas, gameContext, uiCanvas, uiContext;
var framesPerSecond = 30;
var gameInterval;
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#09d';

var shipProjectiles, enemyProjectiles;

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

// Debug
var debug = true;
var debug_draw_bounds = false;
var debug_single_step = false;
var debug_stop_camera = false;

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

  shipProjectiles = new ProjectileList();
  enemyProjectiles = new ProjectileList();

  if (debug_single_step) {
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
    gameInterval = setInterval(gameLoop, 1000 / framesPerSecond);
    console.log('Starting game!');
  }

  if (debug) {
    console.log('Debug mode enabled! Action keys:');
    console.table({
      1: 'Single laser',
      2: 'Double laser',
      3: 'Triple laser',
      4: 'Rocket',
      5: 'Double Rocket',
      b: 'Draw bounds',
      p: 'Stop camera movement'
    });

    document.addEventListener('keyup', function(event) {
      event.preventDefault();
      switch (event.keyCode) {
        case 49: // 1
          Ship.setProjectile(Laser);
          break;
        case 50: // 2
          Ship.setProjectile(DoubleLaser);
          break;
        case 51: // 3
          Ship.setProjectile(TripleLaser);
          break;
        case 52: // 4
          Ship.setProjectile(Rocket);
          break;
        case 53: // 5
          Ship.setProjectile(DoubleRocket);
          break;
        case 66: // b
          debug_draw_bounds = !debug_draw_bounds;
          break;
        case 80: // p
          debug_stop_camera = !debug_stop_camera;
          break;
        default:
          console.log('Pressed', event.keyCode);
      }
    });
  }
}

function shakeScreen(amount) {
  screenShakeAmountHalf = amount / 2;
  screenShakeAmount = amount;
}

function gameLoop() {
  UI.update();
  Grid.update();
  PowerUpList.update();
  shipProjectiles.update();
  enemyProjectiles.update();
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
  PowerUpList.draw();
  shipProjectiles.draw();
  enemyProjectiles.draw();
  ParticleList.draw();
  EnemyList.draw();
  Ship.draw();

  gameContext.restore();

  UI.draw();
}
