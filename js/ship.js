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

  this.isDead = false;
  this.speed = 5;

  var x,y;
  var minX, minY, maxX, maxY;
  var halfWidth, quarterWidth, eighthWidth;
  var halfHeight, quarterHeight;

  var projectiles = [];
  var maxProjectiles = 40;
  var projectilesFiringRate = 3;
  var projectileClass;
  var projectileLast = 0;

  this.initialize = function() {
    x = 100;
    y = gameCanvas.height / 2;

    var levelInfo = Grid.levelInfo();

    halfWidth = Images.ship.width / 2;
    quarterWidth = Images.ship.width / 4;
    eighthWidth = Images.ship.width / 8;
    halfHeight = Images.ship.height / 2;
    quarterHeight = Images.ship.height / 4;
    minX = halfWidth;
    maxX = levelInfo.width - halfWidth;
    minY = halfHeight;
    maxY = levelInfo.height - halfHeight;

    projectileClass = Rocket;
  };

  var boundingBox = function() {
    return [
      // Upper halfway right
      {x: x+quarterWidth, y: y-quarterHeight},
      // Upper halfway left
      {x: x-eighthWidth, y: y-halfHeight},
      // Upper left
      {x: x-(eighthWidth*3), y: y-halfHeight},
      // Middle left
      {x: x-(eighthWidth*3), y: y},
      // Lower left
      {x: x-(eighthWidth*3), y: y+halfHeight},
      // Lower halfway left
      {x: x-eighthWidth, y: y+halfHeight},
      // Lower middle
      {x: x+eighthWidth, y: y+halfHeight},
      // Lower halfway right
      {x: x+quarterWidth, y: y+quarterHeight},
      // Lower right
      {x: x+halfWidth, y: y+quarterHeight},
      // Middle right
      {x: x+halfWidth, y: y}
    ];
  };

  function checkCollision() {
    var checkCoords = boundingBox();
    for (var c = 0; c < checkCoords.length; c++) {
      if (Grid.isSolidTileTypeAtCoords(checkCoords[c].x, checkCoords[c].y)) {
        if (debug) {
          drawCircle(gameContext, checkCoords[c].x, checkCoords[c].y, 5, '#0f0');
        }

        return true;
      }
    }

    return false;
  }

  this.update = function() {
    if (this.isDead) {
      return;
    }

    if (this.keyHeld_N) {
      y -= this.speed;
      if (y < minY) {
        y = minY;
      }
    }
    else if (this.keyHeld_S) {
      y += this.speed;
      if (y > maxY) {
        y = maxY;
      }
    }

    if (this.keyHeld_W) {
      x -= this.speed;
      if (x < minX) {
        x = minX;
      }
    }
    else if (this.keyHeld_E) {
      x += this.speed;
      if (x > maxX) {
        x = maxX;
      }
    }

    if (checkCollision()) {
      this.isDead = true;
      ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 25, 50);
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
      if (projectiles[p].readyToRemove || this.isDead) {
        projectiles.splice(p, 1);
      }
    }
  };

  this.draw = function() {
    if (!this.isDead) {
      for (var p = 0; p < projectiles.length; p++) {
        projectiles[p].draw();
      }

      drawBitmapCenteredWithRotation(gameContext, Images.ship, x, y, 0);
    }

    if (debug) {
      var bb = boundingBox();
      for (var c = 0; c < bb.length; c++) {
        drawCircle(gameContext, bb[c].x, bb[c].y, 5, '#f00');
      }
      bb.push(bb[0]);
      drawLines(gameContext, '#f00', bb);
      checkCollision();
    }
  };

  this.coords = function() {
    return {x: x, y: y};
  };

  return this;
})();
