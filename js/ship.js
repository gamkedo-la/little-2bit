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
  this.speedX = 8;
  this.speedY = 5;
  this.damage = 50;

  var x,y;
  var minX, minY, maxX, maxY;
  var halfWidth, quarterWidth, eighthWidth;
  var halfHeight, quarterHeight;

  var health = 50;

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

  this.doDamage = function(amount) {
    health -= amount;
  };

  this.boundingBox = function() {
    return {
      left: x-halfWidth,
      top: y-halfHeight,
      right: x+halfWidth,
      bottom: y+halfHeight
    };
  };

  this.bounds = function() {
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

  this.muzzleCoords = function() {
    return {
      x: x + halfWidth,
      y: y + 7
    };
  };

  this.checkCollision = function() {
    var checkCoords = this.bounds();
    for (var c = 0; c < checkCoords.length; c++) {
      if (Grid.isSolidTileTypeAtCoords(checkCoords[c].x, checkCoords[c].y)) {
        if (debug) {
          drawFillCircle(gameContext, checkCoords[c].x, checkCoords[c].y, 5, '#0f0');
        }

        return true;
      }
    }

    return false;
  };

  this.checkShot = function() {
    ProjectileList.damagedBy(this, []);
    EnemyList.checkCollision(this);

    return (health <= 0);
  };

  this.update = function() {
    if (this.isDead) {
      return;
    }

    if (this.keyHeld_N) {
      y -= this.speedY;
      if (y < minY) {
        y = minY;
      }
    }
    else if (this.keyHeld_S) {
      y += this.speedY;
      if (y > maxY) {
        y = maxY;
      }
    }

    if (this.keyHeld_W) {
      x -= this.speedX;
      if (x < Grid.cameraPanX() + minX) {
        x = Grid.cameraPanX() + minX;
      }
    }
    else if (this.keyHeld_E) {
      x += this.speedX;
      if (x > maxX) {
        x = maxX;
      }
    }

    if (this.checkCollision() || this.checkShot()) {
      this.isDead = true;
      EnemyList.clear();
      ProjectileList.clear();
      ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 25, 50);
      Sounds.explosion_ship.play();
    }

    if (this.keyHeld_1) {
      projectileClass = Laser;
    }
    else if (this.keyHeld_2) {
      projectileClass = Rocket;
    }

    if (this.keyHeld_SPACE) {
      if (projectiles.length < maxProjectiles && projectileLast == 0) {
        projectileLast = projectilesFiringRate;
        var muzzle = this.muzzleCoords();
        ProjectileList.push(new projectileClass(muzzle.x, muzzle.y));
      }
      else {
        projectileLast--;
      }
    }
    else {
      projectileLast = 0;
    }
  };

  this.draw = function() {
    if (!this.isDead) {
      drawBitmapCenteredWithRotation(gameContext, Images.ship, x, y, 0);
    }

    if (debug) {
      var b = this.bounds();
      for (var c = 0; c < b.length; c++) {
        drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#f00');
      }
      b.push(b[0]);
      drawLines(gameContext, '#f00', b);
      this.checkCollision();
      var muzzle = this.muzzleCoords();
      drawFillCircle(gameContext, muzzle.x, muzzle.y, 5, "#00f");
    }
  };

  this.coords = function() {
    return {x: x, y: y};
  };

  return this;
})();
