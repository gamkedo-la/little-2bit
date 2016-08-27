var EnemyList = new (function() {
  var enemyList = [];

  this.brickTypeIsEnemy = function(type) {
    return brickTypeEnemyClasses[type];
  };

  this.createEnemyByBrickType = function(type, x, y) {
    var Enemy = brickTypeEnemyClasses[type];
    new Enemy(this, x, y);
  };

  this.push = function(enemy) {
    enemyList.push(enemy);
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

      enemyList[i].isReadyToRemove = enemyList[i].isReadyToRemove || enemyList[i].isOutOfBounds;

      if (enemyList[i].isReadyToRemove) {
        if (!enemyList[i].isOutOfBounds) {
          enemyList[i].explode();
        }
        enemyList.splice(i, 1);
      }
    }
  };

  this.draw = function() {
    for (var i = 0; i < enemyList.length; i++) {
      enemyList[i].draw();
    }
  };

  var enemyTypes = [];
  this.drawTileByBrickType = function(type, x, y) {
    if (!enemyTypes[type]) {
      var Enemy = brickTypeEnemyClasses[type];
      enemyTypes[type] = new Enemy(this, x, y);
    }
  };
})();

function EnemyBase(list, x, y, vx, vy, health, damage, width, height, image, projectileClass, projectileAngle) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var frame = 0;
  var frameDelay = 2;
  var maxFrames = image.width / width;

  var initialX = x;
  var initialY = y;

  if (projectileClass) {
    var projectileType = projectileClass.prototype.constructor.name;
    var projectileRate = PROJECTILE_INFO[projectileType].rate;
    var projectileLast = projectileRate;
    if (projectileAngle == undefined) {
      projectileAngle = 0;
    }
  }

  this.damage = damage;
  this.isOutOfBounds = false;
  this.isReadyToRemove = false;

  if (this._initialize) {
    this._initialize();
  }
  else {
    list.push(this);
  }

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
    if (!this.isOutOfBounds) {
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

  this.moveTo = function(coords) {
    x = coords.x;
    y = coords.y;
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
    this.isOutOfBounds = !debug_editor && (levelInfo.leftBound < initialX && initialX < levelInfo.rightBound) && (levelInfo.leftBound - width > x || x > levelInfo.rightBound + width * 2 || -height > y || y > levelInfo.height + height);
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
function SimpleEnemy(list, x, y) {
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

  EnemyBase.call(this, list, x, y, vx, vy, health, damage, width, height, image);
}

SimpleEnemy.prototype = Object.create(EnemyBase.prototype);
SimpleEnemy.prototype.constructor = SimpleEnemy;

brickTypeEnemyClasses[ENEMY_SHOOTING] = ShootingEnemy;
function ShootingEnemy(list, x, y) {
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
      { x: x + quarterWidth, y: y - quarterHeight - eighthHeight },
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

  EnemyBase.call(this, list, x, y, vx, vy, health, damage, width, height, image, EnergyBall, 180);
}

ShootingEnemy.prototype = Object.create(EnemyBase.prototype);
ShootingEnemy.prototype.constructor = ShootingEnemy;

function TurretBase(list, x, y, vx, vy, health, damage, width, height, image_body, image_barrels, projectileClass, aimsAtShip) {
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
      x: x + 18 * Math.cos(angle),
      y: y + 18 * Math.sin(angle)
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

  EnemyBase.call(this, list, x, y, vx, vy, health, damage, width, height, image_body, projectileClass, angle);
}
TurretBase.prototype = Object.create(EnemyBase.prototype);
TurretBase.prototype.constructor = TurretBase;

brickTypeEnemyClasses[ENEMY_TURRET_SIMPLE] = SimpleTurret;
function SimpleTurret(list, x, y) {
  var vx = 0;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image = Images.simple_turret;
  var width = 40;
  var height = 40;

  TurretBase.call(this, list, x, y, vx, vy, health, damage, width, height, image, null, EnergyBall, false);
}

SimpleTurret.prototype = Object.create(TurretBase.prototype);
SimpleTurret.prototype.constructor = SimpleTurret;

brickTypeEnemyClasses[ENEMY_TURRET_ADVANCED] = AimingTurret;
function AimingTurret(list, x, y) {
  var vx = 0;
  var vy = 0;
  var health = 4;
  var damage = 3;
  var image_body = Images.advanced_turret_body;
  var image_barrels = Images.advanced_turret_barrels;
  var width = 40;
  var height = 40;

  TurretBase.call(this, list, x, y, vx, vy, health, damage, width, height, image_body, image_barrels, EnergyBall, true);
}

AimingTurret.prototype = Object.create(TurretBase.prototype);
AimingTurret.prototype.constructor = AimingTurret;

brickTypeEnemyClasses[ENEMY_ADVANCED1] = AdvancedEnemy1;
function AdvancedEnemy1(list, x, y) {
  this._initialize = function() {
    for (var e = 0; e < 6; e++) {
      new AdvancedEnemyShip(list, x, y, -3 * e);
    }
  };

  EnemyBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);
}
AdvancedEnemy1.prototype = Object.create(EnemyBase.prototype);
AdvancedEnemy1.prototype.constructor = AdvancedEnemy1;

function AdvancedEnemyShip(list, x, y, step) {
  var vx = 5;
  var health = 4;
  var damage = 2;
  var image = Images.advanced_enemy1;
  var width = 55;
  var height = 42;

  var maxSteps = 60;
  var startY = y;
  var rangeY = 50;

  var halfWidth = width / 2;
  var eighthWidth = width / 8;
  var halfHeight = height / 2;

  if (!step || step > maxSteps) {
    step = 1;
  }

  // Part of a chain of ships?
  if (step < 0) {
    var a = (step / maxSteps) * 2 * Math.PI;
    x = x - (step * 20);
    y = startY - (rangeY * Math.sin(a));

    step = maxSteps + step;
  }

  this._bounds = function(x, y) {
    return [
      { x: x - halfWidth, y: y },
      { x: x - eighthWidth, y: y + halfHeight },
      { x: x + halfWidth, y: y },
      { x: x - eighthWidth, y: y - halfHeight }
    ];
  };

  this._move = function(x, y) {
    step++;
    if (step > maxSteps) {
      step = 1;
    }
    var a = (step / maxSteps) * 2 * Math.PI;
    this.moveTo({
      x: x - vx,
      y: startY - (rangeY * Math.sin(a))
    });
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 20, 30);
    Sounds.explosion_simple_enemy.play();
  };

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height);
  };

  EnemyBase.call(this, list, x, y, 0, 0, health, damage, width, height, image);
}

AdvancedEnemyShip.prototype = Object.create(EnemyBase.prototype);
AdvancedEnemyShip.prototype.constructor = AdvancedEnemyShip;

brickTypeEnemyClasses[ENEMY_ADVANCED2] = AdvancedEnemy2;

function AdvancedEnemy2(list, x, y) {
  var speed = 5;
  var vx = -speed;
  var vy = 0;
  var health = 4;
  var damage = 2;
  var image = Images.advanced_enemy2;
  var width = 40;
  var height = 30;
  var angle = Math.PI;
  var rotationEase = .3;
  var isExploding = false;
  var explodeRange = 80;
  var explodeRangeSquared = explodeRange * explodeRange;
  var explodeShake = 1;
  var explodeTimer = 15;

  var halfWidth = width / 2;
  var eighthWidth = width / 8;
  var halfHeight = height / 2;

  this._bounds = function(x, y) {
    return [
      { x: x - halfWidth, y: y },
      { x: x - eighthWidth, y: y + halfHeight },
      { x: x + halfWidth, y: y },
      { x: x - eighthWidth, y: y - halfHeight }
    ];
  };

  this._update = function(x, y) {
    var thisCoords = { x: x, y: y };
    var shipCoords = Ship.coords();
    var distance = distanceBetweenPointsSquared(thisCoords, shipCoords);

    if (isExploding) {
      if (explodeTimer-- <= 0) {
        Ship.doDamage(Math.round(damage * (explodeRangeSquared / distance) * 10) / 10);
        this.isReadyToRemove = true;
      }
      return;
    }

    // Check distance to player
    isExploding = (explodeRangeSquared >= distance);

    // Move towards player
    var newVs = rotateToTarget(vx, vy, speed, rotationEase, shipCoords, { x: x, y: y });
    vx = newVs.vx;
    vy = newVs.vy;
    angle = Math.atan2(vy, vx);

    this.move();
  };

  this._move = function(x, y) {
    this.moveTo({
      x: x + vx,
      y: y + vy
    });
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_BUBBLE, x, y, 360, 0, 20, 30);
    Sounds.explosion_simple_enemy.play();
  };

  this._draw = function(frame, x, y, width, height) {
    if (isExploding) {
      explodeShake++;
      x += Math.random() * explodeShake - explodeShake * 0.5;
      y += Math.random() * explodeShake - explodeShake * 0.5;
    }

    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle + Math.PI);

    if (debug_draw_bounds) {
      drawStrokeCircle(gameContext, x, y, explodeRange, '#f00');
    }
  };

  EnemyBase.call(this, list, x, y, 0, 0, health, damage, width, height, image);
}

AdvancedEnemy2.prototype = Object.create(EnemyBase.prototype);
AdvancedEnemy2.prototype.constructor = AdvancedEnemy2;
