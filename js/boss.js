var Boss = function(phase, list, initialX, initialY) {
  this.isBoss = true;

  var x = initialX;
  var y = initialY;

  var images = {
    1: Images.boss1,
    2: Images.boss2,
    3: Images.boss3
  };

  var currentImage;
  var width;
  var halfWidth;
  var thirdWidth;
  var quarterWidth;
  var halfHeight;
  var muzzlePosX;
  var muzzlePosY;
  var topAngle = 177;
  var bottomAngle = 183;

  this.health = 0;
  this.maxHealth = 0;
  this.damage = 0;
  var maxYSpeed;

  const DASH_TIMER = 75;
  const SHOOT_TIMER = 18;
  const SPAWN_TIMER = 26;

  var dashShaking = false;
  var dashing = false;
  var retreating = false;
  var dashSpeedX = 28;
  var dashShake = 1;

  var dashCountdown = DASH_TIMER;
  var shootCountdown = SHOOT_TIMER;
  var spawnCountdown = SPAWN_TIMER;
  var spawnCount = 0;

  // @todo tweak!
  var healths = {
    1: 100,
    2: 125,
    3: 150
  };

  var damages = {
    1: 7,
    2: 8,
    3: 9
  };

  var maxYSpeeds = {
    1: 4,
    2: 3.5,
    3: 3
  };

  this.update = function() {
    if (!dashing && !retreating) {
      var shipCoords = Ship.coords();
      var dy = shipCoords.y - y;
      if (dy != 0) {
        y += sign(dy) * (Math.min(maxYSpeed, Math.abs(dy)));
      }
    }

    switch (phase) {
      case 1:
        this.updatePhase1();
        break;
      case 2:
        this.updatePhase2();
        break;
      case 3:
        this.updatePhase3();
        break;
    }
  };

  this.switchPhase = function(_phase) {
    phase = _phase;
    currentImage = images[phase];
    width = currentImage.width;
    halfWidth = currentImage.width / 2;
    thirdWidth = currentImage.width / 3;
    quarterWidth = currentImage.width / 4;
    halfHeight = currentImage.height / 2;
    muzzlePosX = (_phase == 3) ? 43 : 29;
    muzzlePosY = (_phase == 3) ? 80 : 40;
    this.health = healths[phase];
    this.maxHealth = healths[phase];
    this.damage = damages[phase];
    maxYSpeed = maxYSpeeds[phase];
    dashing = retreating = false;

    dashCountdown = DASH_TIMER;
    shootCountdown = SHOOT_TIMER;
    spawnCountdown = SPAWN_TIMER;
  };
  this.switchPhase(phase);

  this.boundingBox = function() {
    return {
      left: x - halfWidth,
      top: y - halfHeight,
      right: x + halfWidth,
      bottom: y + halfHeight
    };
  };

  this.bounds = function() {
    return [
      { x: x - halfWidth, y: y },
      { x: x - thirdWidth, y: y + halfHeight },
      { x: x + quarterWidth, y: y + halfHeight },
      { x: x + quarterWidth, y: y },
      { x: x + quarterWidth, y: y - halfHeight },
      { x: x - thirdWidth, y: y - halfHeight }
    ];
  };

  this.doDamage = function(_damage) {
    this.health -= _damage;
    if (this.health <= 0) {
      phase--;
      if (phase <= 0) {
        this.isReadyToRemove = true;
      }
      else {
        this.switchPhase(phase);
      }
    }
  };

  this.explode = function() {
    ParticleList.explosion(x, y);
    Sounds.explosion_boss.play();
  };

  this.coords = function() {
    return { x: x, y: y };
  };

  this.draw = function() {
    var offsetX = 0, offsetY = 0;
    if (dashShaking) {
      dashShake++;
      offsetX = Math.random() * dashShake - dashShake * 0.5;
      offsetY = Math.random() * dashShake - dashShake * 0.5;
    }
    drawBitmapCenteredWithRotation(gameContext, currentImage, x + offsetX, y + offsetY);

    if (debug_draw_bounds) {
      var b = this.bounds();
      for (var c = 0; c < b.length; c++) {
        drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#ff0');
      }
      b.push(b[0]);
      drawLines(gameContext, 'yellow', b);
    }
  };

  this.updatePhase1 = function() {
    var levelInfo = Grid.levelInfo();

    dashCountdown--;
    if (dashShaking) {
      if (dashCountdown <= 0) {
        dashing = true;
        dashShaking = false;
      }
    }
    else if (dashing) {
      x -= dashSpeedX;
      dashing = (x > levelInfo.leftBound + width);
      retreating = !dashing;
    }
    else if (retreating) {
      x += dashSpeedX;
      retreating = (x < initialX);
      if (!retreating) {
        dashCountdown = DASH_TIMER;
      }
    }
    else {
      if (dashCountdown <= 0) {
        dashCountdown = 13;
        dashShaking = true;
        dashShake = 1;
      }
    }
  };

  function randomAngle(min, max) {
    return (min + (Math.random() * (max - min))) * DEC2RAD;
  }

  this.updatePhase2 = function() {
    shootCountdown--;
    if (shootCountdown <= 0) {
      shootCountdown = SHOOT_TIMER;
      new BossBall(enemyProjectiles, x - muzzlePosX, y - muzzlePosY, randomAngle(topAngle, topAngle - 10));
      new BossBall(enemyProjectiles, x - muzzlePosX, y + muzzlePosY, randomAngle(bottomAngle, bottomAngle + 10));
    }
  };

  this.updatePhase3 = function() {
    spawnCountdown--;
    if (spawnCountdown <= 0) {
      spawnCountdown = SPAWN_TIMER;
      spawnCount++;
      if (spawnCount >= 5) {
        new AdvancedEnemy2(EnemyList, x - muzzlePosX, y - muzzlePosY);
        new AdvancedEnemy2(EnemyList, x - muzzlePosX, y + muzzlePosY);
        spawnCount = 0;
      }
      else {
        new SimpleEnemy(EnemyList, x - muzzlePosX, y);
      }
    }
  };

  list.push(this);
};

var Boss1 = function(list, initialX, initialY) {
  return new Boss(1, list, initialX, initialY);
};
brickTypeEnemyClasses[BOSS_1] = Boss1;

var Boss2 = function(list, initialX, initialY) {
  return new Boss(2, list, initialX, initialY);
};
brickTypeEnemyClasses[BOSS_2] = Boss2;

var Boss3 = function(list, initialX, initialY) {
  return new Boss(3, list, initialX, initialY);
};
brickTypeEnemyClasses[BOSS_3] = Boss3;
