var EnemyList = new (function() {
  var enemyList = [];

  this.brickTypeIsEnemy = function(type) {
    return brickTypeEnemyClasses[type];
  };

  this.createEnemyByBrickType = function(type, x, y) {
    var Enemy = brickTypeEnemyClasses[type];
    enemyList.push(new Enemy(x, y));
  };

  this.clear = function() {
    enemyList = [];
  };

  this.findClosestEnemyInRange = function(point, range) {
    var enemy,
      rangeSquared = range * range,
      currentDistance,
      closestDistance = -1;
    for (var i = 0; i < enemyList.length; i++) {
      var enemyCoords = enemyList[i].coords();
      // Skip enemies behind the projectile
      if (enemyCoords.x <= point.x) {
        continue;
      }
      // Skip enemies too far away
      currentDistance = distanceBetweenPointsSquared(point, enemyCoords);
      if (currentDistance > rangeSquared) {
        continue;
      }
      if (closestDistance == -1 || closestDistance > currentDistance) {
        closestDistance = currentDistance;
        enemy = enemyList[i];
      }
    }

    return enemy;
  };

  this.checkCollision = function(ship) {
    for (var i = 0; i < enemyList.length; i++) {
      if (!enemyList[i].isReadyToRemove && checkCollisionShapes(ship, enemyList[i])) {
        ship.doDamage(enemyList[i].damage);
        enemyList[i].doDamage(ship.damage);
      }
    }
  };

  this.update = function() {
    for (var i = enemyList.length - 1; i >= 0; i--) {
      enemyList[i].update();

      shipProjectiles.checkCollision(enemyList[i]);

      enemyList[i].isReadyToRemove = enemyList[i].isReadyToRemove || enemyList[i].outOfBounds;

      if (enemyList[i].isReadyToRemove) {
        enemyList[i].explode();
        enemyList.splice(i, 1);
      }
    }
  };

  this.draw = function() {
    for (var i = 0; i < enemyList.length; i++) {
      enemyList[i].draw();
    }
  };
})();

function EnemyBase(x, y, vx, vy, health, damage, width, height, image, projectileClass, projectileAngle) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var frame = 0;
  var frameDelay = 2;
  var maxFrames = image.width / width;

  if (projectileClass) {
    var projectileType = projectileClass.prototype.constructor.name;
    var projectileRate = PROJECTILE_INFO[projectileType].rate;
    var projectileLast = projectileRate;
    if (projectileAngle == undefined) {
      projectileAngle = 0;
    }
  }

  this.damage = damage;
  this.outOfBounds = false;
  this.isReadyToRemove = false;

  this.boundingBox = function() {
    return {
      left: x - halfWidth,
      top: y - halfHeight,
      right: x + halfWidth,
      bottom: y + halfHeight
    };
  };

  this.bounds = function() {
    return this._bounds(x, y);
  };

  this.coords = function() {
    return { x: x, y: y };
  };

  this.doDamage = function(amount) {
    health -= amount;
    this.isReadyToRemove = (health <= 0);
  };

  this.explode = function() {
    if (!this.outOfBounds) {
      this._explode(x, y);
    }
  };

  this.move = function() {
    if (debug_stop_enemies) {
      return;
    }

    if (this._move) {
      this._move(x, y);
    }
    else {
      x += vx;
      y += vy;
    }
  };

  this.fireProjectile = function() {
    if (this._fireProjectile) {
      this._fireProjectile(x, y);
    }
    else {
      var muzzle = this.muzzle(x, y);
      new projectileClass(enemyProjectiles, muzzle.x, muzzle.y, projectileAngle * DEC2RAD);
    }
  };

  this.update = function() {
    if (this._update) {
      this._update(x, y);
    }
    else {
      this.move();
    }

    if (projectileClass) {
      projectileLast++;
      if (projectileLast > projectileRate) {
        projectileLast = 0;
        this.fireProjectile();
      }
    }

    var levelInfo = Grid.levelInfo();
    this.outOfBounds = (levelInfo.leftBound - width > x || x > levelInfo.rightBound + width * 2 || -height > y || y > levelInfo.height + height);
  };

  this.draw = function() {
    this._draw(frame, x, y, width, height);

    if (frameDelay-- <= 0) {
      frameDelay = 1;
      frame++;
      if (frame >= maxFrames) {
        frame = 0;
      }
    }

    if (debug_draw_bounds) {
      var b = this.bounds();
      for (var c = 0; c < b.length; c++) {
        drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#ff0');
      }
      b.push(b[0]);
      drawLines(gameContext, 'yellow', b);
    }
  }
}

var brickTypeEnemyClasses = [];

brickTypeEnemyClasses[ENEMY_SIMPLE] = SimpleEnemy;
function SimpleEnemy(x, y) {
  var vx = -5;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image = Images.simple_enemy;
  var width = 72;
  var height = 48;

  var halfWidth = width / 2;
  var quarterWidth = width / 4;
  var eighthWidth = width / 8;
  var halfHeight = height / 2;
  var quarterHeight = height / 4;
  var eighthHeight = height / 8;

  this._bounds = function(x, y) {
    return [
      { x: x - halfWidth, y: y },
      { x: x - eighthWidth, y: y + quarterHeight + eighthHeight },
      { x: x + eighthWidth, y: y + quarterHeight + eighthHeight },
      { x: x + quarterWidth + eighthWidth, y: y },
      { x: x + quarterWidth + eighthWidth, y: y - halfHeight }
    ];
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 20, 30);
    Sounds.explosion_simple_enemy.play();
  };

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height);
  };

  EnemyBase.call(this, x, y, vx, vy, health, damage, width, height, image);
}

SimpleEnemy.prototype = Object.create(EnemyBase.prototype);
SimpleEnemy.prototype.constructor = SimpleEnemy;

brickTypeEnemyClasses[ENEMY_SHOOTING] = ShootingEnemy;
function ShootingEnemy(x, y) {
  var vx = -3;
  var vy = 0;
  var health = 10;
  var damage = 3;
  var image = Images.shooting_enemy;
  var width = 70;
  var height = 60;

  var halfWidth = width / 2;
  var quarterWidth = width / 4;
  var eighthWidth = width / 8;
  var halfHeight = height / 2;
  var quarterHeight = height / 4;
  var eighthHeight = height / 8;

  this._bounds = function(x, y) {
    return [
      { x: x - quarterWidth - eighthWidth, y: y - eighthHeight },
      { x: x - quarterWidth - eighthWidth, y: y + eighthHeight },
      { x: x - quarterWidth, y: y + halfHeight },
      { x: x + quarterWidth, y: y + halfHeight },
      { x: x + halfWidth, y: y },
      { x: x + quarterWidth, y: y - quarterHeight - eighthHeight},
      { x: x, y: y - quarterHeight - eighthHeight }
    ];
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 20, 30);
    Sounds.explosion_shooting_enemy.play();
  };

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height);
  };

  this.muzzle = function(x, y) {
    return {
      x: x - halfWidth,
      y: y
    };
  };

  EnemyBase.call(this, x, y, vx, vy, health, damage, width, height, image, EnergyBall, 180);
}

ShootingEnemy.prototype = Object.create(EnemyBase.prototype);
ShootingEnemy.prototype.constructor = ShootingEnemy;

function TurretBase(x, y, vx, vy, health, damage, width, height, image_body, image_barrels, projectileClass, aimsAtShip) {
  // Set orientation
  var angle = 0;
  var angleBody = 0;
  if (Grid.isSolidTileTypeAtCoords(x, y + GRID_HEIGHT)) {
    // Has solid beneath it, point up
    angle = 270;
    angleBody = 0;
  }
  else if (Grid.isSolidTileTypeAtCoords(x - GRID_WIDTH, y)) {
    // Has solid on left side, point right
    angle = 0;
    angleBody = 90;
  }
  else if (Grid.isSolidTileTypeAtCoords(x + GRID_WIDTH, y)) {
    // Has solid on right side, point left
    angle = 180;
    angleBody = 270;
  }
  else if (Grid.isSolidTileTypeAtCoords(x, y - GRID_HEIGHT)) {
    // Has solid above it, point down
    angle = 90;
    angleBody = 180;
  }

  var minAngle = (angle - 80);
  var maxAngle = (angle + 80);
  if (minAngle > maxAngle) {
    var temp = minAngle;
    minAngle = maxAngle;
    maxAngle = temp;
  }

  minAngle *= DEC2RAD;
  maxAngle *= DEC2RAD;

  angle *= DEC2RAD;
  angleBody *= DEC2RAD;

  var halfWidth = width / 2;
  var halfHeight = height / 2;

  this._bounds = function(x, y) {
    return [
      { x: x - halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y + halfHeight },
      { x: x - halfWidth, y: y + halfHeight }
    ];
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 20, 30);
    Sounds.explosion_simple_turret.play();
  };

  this._draw = function(frame, x, y, width, height) {
    if (!aimsAtShip) {
      drawBitmapFrameCenteredWithRotation(gameContext, image_body, frame, x, y, width, height, angleBody);
    }
    else {
      drawBitmapFrameCenteredWithRotation(gameContext, image_barrels, frame, x, y + 2, width, height, angle + Math.PI * .5);
      drawBitmapFrameCenteredWithRotation(gameContext, image_body, frame, x, y, width, height, angleBody);

      if (debug_draw_bounds) {
        drawLines(gameContext, '#0f0', [
          { x: x, y: y },
          { x: x + 75 * Math.cos(minAngle), y: y + 75 * Math.sin(minAngle) }
        ]);
        drawLines(gameContext, '#00f', [
          { x: x, y: y },
          { x: x + 75 * Math.cos(maxAngle), y: y + 75 * Math.sin(maxAngle) }
        ]);

        var muzzle = this.muzzle(x, y);
        drawLines(gameContext, '#f00', [
          { x: muzzle.x, y: muzzle.y },
          { x: muzzle.x + 75 * Math.cos(angle), y: muzzle.y + 75 * Math.sin(angle) }
        ]);
      }
    }
  };

  this.muzzle = function(x, y) {
    return {
      x: x - 18 * Math.cos(angle),
      y: y - 18 * Math.sin(angle)
    };
  };

  this._update = function(x, y) {
    if (aimsAtShip) {
      var shipCoords = Ship.coords();
      angle = Math.atan2(shipCoords.y - y, shipCoords.x - x);
      if (angle < 0 && minAngle > 0) {
        angle += Math.PI * 2;
      }

      if (angle < minAngle) {
        angle = minAngle;
      }
      else if (angle > maxAngle) {
        angle = maxAngle;
      }
    }
  };

  this._fireProjectile = function(x, y) {
    var muzzle = this.muzzle(x, y);
    enemyProjectiles.spawn(projectileClass, muzzle.x, muzzle.y, angle);
  };

  EnemyBase.call(this, x, y, vx, vy, health, damage, width, height, image_body, projectileClass, angle);
}
TurretBase.prototype = Object.create(EnemyBase.prototype);
TurretBase.prototype.constructor = TurretBase;

brickTypeEnemyClasses[ENEMY_TURRET_SIMPLE] = SimpleTurret;
function SimpleTurret(x, y) {
  var vx = 0;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image = Images.simple_turret;
  var width = 40;
  var height = 40;

  TurretBase.call(this, x, y, vx, vy, health, damage, width, height, image, null, EnergyBall, false);
}

SimpleTurret.prototype = Object.create(TurretBase.prototype);
SimpleTurret.prototype.constructor = SimpleTurret;

brickTypeEnemyClasses[ENEMY_TURRET_ADVANCED] = AimingTurret;
function AimingTurret(x, y) {
  var vx = 0;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image_body = Images.advanced_turret_body;
  var image_barrels = Images.advanced_turret_barrels;
  var width = 40;
  var height = 40;

  TurretBase.call(this, x, y, vx, vy, health, damage, width, height, image_body, image_barrels, EnergyBall, true);
}

AimingTurret.prototype = Object.create(TurretBase.prototype);
AimingTurret.prototype.constructor = AimingTurret;
