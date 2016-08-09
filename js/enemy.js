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

  this.update = function() {
    if (this._update) {
      this._update(x, y);
    }
    else {
      this.move();

      if (projectileClass) {
        projectileLast++;
        if (projectileLast > projectileRate) {
          projectileLast = 0;
          var muzzle = this.muzzle(x, y);
          new projectileClass(enemyProjectiles, muzzle.x, muzzle.y, projectileAngle * DEC2RAD);
        }
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

  EnemyBase.call(this, x, y, vx, vy, health, damage, width, height, image, EnergyBall, 0);
}

ShootingEnemy.prototype = Object.create(EnemyBase.prototype);
ShootingEnemy.prototype.constructor = ShootingEnemy;

brickTypeEnemyClasses[ENEMY_TURRET_SIMPLE] = SimpleTurret;
function SimpleTurret(x, y) {
  var vx = 0;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image = Images.simple_turret;
  var width = 40;
  var height = 40;

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
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height);
  };

  this.muzzle = function(x, y) {
    return {
      x: x,
      y: y - halfHeight
    };
  };

  EnemyBase.call(this, x, y, vx, vy, health, damage, width, height, image, EnergyBall, -90);
}

SimpleTurret.prototype = Object.create(EnemyBase.prototype);
SimpleTurret.prototype.constructor = SimpleTurret;

brickTypeEnemyClasses[ENEMY_TURRET_ADVANCED] = SimpleEnemy;
