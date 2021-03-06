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
  this.score = 0;
  var maxYSpeed;

  const DASH_TIMER = 60;
  const SHOOT_TIMER = 18;
  const SPAWN_TIMER = 40;

  var dashShaking = false;
  var dashing = false;
  var retreating = false;
  var dashSpeedX = 28;
  var dashShake = 1;

  var dashCountdown = DASH_TIMER;
  var shootCountdown = SHOOT_TIMER;
  var spawnCountdown = SPAWN_TIMER;
  var spawnCount = 0;

  const HOTSPOT_TIMER = 30;
  var hotSpotTimeout = HOTSPOT_TIMER;
  var glowParticles = [];

  // @todo tweak!
  var healths = {
    1: 100,
    2: 125,
    3: 150
  };

  var damages = {
    1: 9,
    2: 16,
    3: 18
  };

  var maxYSpeeds = {
    1: 4,
    2: 3.5,
    3: 2
  };

  var scores = {
    1: 300,
    2: 400,
    3: 500
  };

  var shipLastY = -1;
  var targetY = -1;
  var hoverDistance = 80;
  var speedY = 0;

  this.trackShipY = function(shipY) {
    var dy = shipY - y;
    if (dy != 0) {
      speedY = sign(dy) * (Math.min(maxYSpeed, Math.abs(dy)));
      y += speedY;
    }
  };

  this.hoverShipY = function(shipY) {
    if (shipLastY != shipY) {
      this.trackShipY(shipY);
      if (y == shipY) {
        shipLastY = shipY;
        targetY = -1;
      }
    }
    else if (targetY != -1 && y != targetY) {
      this.trackShipY(targetY);
    }
    else {
      targetY = shipY - hoverDistance + Math.floor(Math.random() * 2 * hoverDistance);
    }
  };

  this.update = function() {
    if (!dashing && !retreating) {
      var shipY = Math.round(Ship.coords().y);
      if (phase == 1) {
        this.trackShipY(shipY);
      }
      else {
        this.hoverShipY(shipY);
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

    for (var p = glowParticles.length - 1; p >= 0; p--) {
      glowParticles[p].y += speedY;
      ParticleList.updateParticle(glowParticles[p]);
      if (glowParticles[p].isReadyToRemove) {
        glowParticles.splice(p, 1);
      }
    }

    if (phase > 1) {
      hotSpotTimeout--;
      if (hotSpotTimeout == 0) {
        var type = (phase == 3) ? PFX_HOTSPOT_GLOW : PFX_HOTSPOT_GLOW_SMALL;
        ParticleList.createParticles(glowParticles, type, x - muzzlePosX + 5, y + muzzlePosY - 3, 0, 0, 1);
        ParticleList.createParticles(glowParticles, type, x - muzzlePosX + 5, y - muzzlePosY + 3, 180, 180, 1);
        ParticleList.createParticles(glowParticles, PFX_HOTSPOT_GLOW_SMALL, x - halfWidth, y, 0, 0, 1);
        hotSpotTimeout = HOTSPOT_TIMER;
      }
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
    muzzlePosX = (_phase == 3) ? 43 : 32;
    muzzlePosY = (_phase == 3) ? 80 : 46;
    this.health = healths[phase];
    this.maxHealth = healths[phase];
    this.damage = damages[phase];
    this.score = scores[phase];
    maxYSpeed = maxYSpeeds[phase];
    dashing = retreating = false;

    dashCountdown = DASH_TIMER;
    shootCountdown = SHOOT_TIMER;
    spawnCountdown = SPAWN_TIMER;

    glowParticles = [];
    hotSpotTimeout = HOTSPOT_TIMER;
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
    if (phase == 3) {
      return [
        { x: x - halfWidth, y: y },
        { x: x - 10, y: y + halfHeight },
        { x: x + quarterWidth, y: y + halfHeight },
        { x: x + quarterWidth, y: y },
        { x: x + quarterWidth, y: y - halfHeight },
        { x: x - 10, y: y - halfHeight }
      ];
    }

    return [
      { x: x - halfWidth, y: y },
      { x: x + quarterWidth, y: y + halfHeight },
      { x: x + quarterWidth, y: y },
      { x: x + quarterWidth, y: y - halfHeight }
    ];
  };

  this.hotSpots = function() {
    var hotSpotSize = (phase == 3) ? 20 : 15;
    return [
      [
        { x: x - muzzlePosX + 15, y: y - muzzlePosY - hotSpotSize },
        { x: x - muzzlePosX - 15, y: y - muzzlePosY - hotSpotSize },
        { x: x - muzzlePosX - 15, y: y - muzzlePosY + hotSpotSize },
        { x: x - muzzlePosX + 15, y: y - muzzlePosY + hotSpotSize }
      ],
      [
        { x: x - muzzlePosX + 15, y: y + muzzlePosY - hotSpotSize },
        { x: x - muzzlePosX - 15, y: y + muzzlePosY - hotSpotSize },
        { x: x - muzzlePosX - 15, y: y + muzzlePosY + hotSpotSize },
        { x: x - muzzlePosX + 15, y: y + muzzlePosY + hotSpotSize }
      ],
      [
        {x: x - halfWidth + 15, y: y - hotSpotSize },
        {x: x - halfWidth - 15, y: y - hotSpotSize },
        {x: x - halfWidth - 15, y: y + hotSpotSize },
        {x: x - halfWidth + 15, y: y + hotSpotSize }
      ]
    ];
  };

  this.doDamage = function(_damage, projectile) {
    if (projectile && phase > 1) {
      // Check impact in vulnerable spots.
      var hasHit = false;
      var hotSpots = this.hotSpots();
      for (var h = 0; h < hotSpots.length; h++) {
        if (checkCollisionBounds(projectile.bounds(), hotSpots[h])) {
          hasHit = true;
          break;
        }
      }

      if (!hasHit) {
        return;
      }
    }

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

  this.bounce = function() {
    dashing = false;
    retreating = !dashing;
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

    for (var p = glowParticles.length - 1; p >= 0; p--) {
      ParticleList.drawParticle(glowParticles[p]);
    }

    drawBitmapCenteredWithRotation(gameContext, currentImage, x + offsetX, y + offsetY);

    if (debug_draw_bounds) {
      var b = this.bounds();
      for (var c = 0; c < b.length; c++) {
        drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#ff0');
      }
      b.push(b[0]);
      drawLines(gameContext, '#ff0', b);

      var h = this.hotSpots();
      for (var d = 0; d < h.length; d++) {
        b = h[d];
        for (c = 0; c < b.length; c++) {
          drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#0f0');
        }
        b.push(b[0]);
        drawLines(gameContext, '#0f0', b);
      }
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
      new AdvancedEnemy2(EnemyList, x - muzzlePosX, y - muzzlePosY);
      new AdvancedEnemy2(EnemyList, x - muzzlePosX, y + muzzlePosY);
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
