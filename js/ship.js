var Ship = new (function(){
  this.keyHeld_N = false;
  this.keyHeld_S = false;
  this.keyHeld_W = false;
  this.keyHeld_E = false;
  this.keyHeld_SPACE = false;
  this.keyHeld_1 = false;
  this.keyHeld_2 = false;
  this.keyHeld_3 = false;
  this.keyHeld_4 = false;
  this.keyHeld_5 = false;
  this.keyHeld_6 = false;

  var x,y;
  var v = 5;
  var minX, minY, maxX, maxY;

  var projectiles = [];
  var maxProjectiles = 40;
  var projectilesFiringRate = 3;
  var projectileClass;
  var projectileLast = 0;

  this.initialize = function() {
    x = 200;
    y = gameCanvas.height / 2;

    minX = Images.ship.width / 2;
    maxX = gameCanvas.width - minX;
    minY = UI.height + Images.ship.height / 2;
    maxY = gameCanvas.height - Images.ship.height / 2;

    projectileClass = Rocket;
  };

  this.update = function() {
    if (this.keyHeld_N) {
      y -= v;
      if (y < minY) {
        y = minY;
      }
    }
    else if (this.keyHeld_S) {
      y += v;
      if (y > maxY) {
        y = maxY;
      }
    }

    if (this.keyHeld_W) {
      x -= v;
      if (x < minX) {
        x = minX;
      }
    }
    else if (this.keyHeld_E) {
      x += v;
      if (x > maxX) {
        x = maxX;
      }
    }

    if (this.keyHeld_1) {
      projectileClass = Bullet;
    }
    else if (this.keyHeld_2) {
      projectileClass = Rocket;
    }

    if (this.keyHeld_SPACE) {
      if (projectiles.length < maxProjectiles && projectileLast == 0) {
        projectileLast = projectilesFiringRate;
        projectiles.push(new projectileClass(x, y));
      }
      else {
        projectileLast--;
      }
    }
    else {
      projectileLast = 0;
    }

    for (var p = projectiles.length - 1; p >= 0; p--) {
      projectiles[p].update();
      if (projectiles[p].readyToRemove) {
        projectiles.splice(p, 1);
      }
    }
  };

  this.draw = function() {
    for (var p = 0; p < projectiles.length; p++) {
      projectiles[p].draw();
    }

    drawBitmapCenteredWithRotation(gameContext, Images.ship, x,y, 0);
  };

  return this;
})();
