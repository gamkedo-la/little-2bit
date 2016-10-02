const START_LIVES = 3;
const MAXLIVES = 6;
const MAXHEALTH = 20;
const SHIP_FRAME_DELAY = 2;
const SHIP_DEFAULT_PROJECTILE = Laser;
const BOUNCE_BACK_TIME = 10;
const BOUNCE_DAMAGE = 1;
const VELOCITY_DECAY = 0.8;

const SHIELD_LIFE_AMOUNT = 5;
const SHIELD_ANIMATION = 3;

var Ship = new (function() {
  this.keyHeld_N = false;
  this.keyHeld_S = false;
  this.keyHeld_W = false;
  this.keyHeld_E = false;
  this.bounceBackCountdown = 0;

  this.keyHeld = false;

  this.isDead = false;
  this.speedX = 10;
  this.speedY = 8;
  this.damage = 50;

  var bounce_x = 0;
  var bounce_y = 0;
  var velocity_x = 0;
  var velocity_y = 0;

  this.shieldAmount = 0;
  var shieldAnimationTimer = 0;

  var x, y;
  var prev_x, prev_y;
  var minX, minY, maxX, maxY;
  var width = 100;
  var height = 35;
  var halfWidth, quarterWidth, eighthWidth;
  var halfHeight, quarterHeight, eighthHeight;

  this.health = MAXHEALTH;
  this.lives = START_LIVES;

  var respawnAuto = false;
  var respawnTime;
  var respawnDelay = 2000; // milliseconds

  var projectileType;
  var projectileClass;
  var projectileRate = 0;
  var projectileLast = 0;
  var projectileTimeout = 0;
  var projectileDefault = SHIP_DEFAULT_PROJECTILE;

  var frame = 0;
  var maxFrames = 0;
  var frameDelay = SHIP_FRAME_DELAY;

  this.initialize = function() {
    halfWidth = width / 2;
    quarterWidth = width / 4;
    eighthWidth = width / 8;
    halfHeight = height / 2;
    quarterHeight = height / 4;
    eighthHeight = height / 8;
    minX = halfWidth;
    minY = halfHeight;

    maxFrames = Math.floor(Images.ship.width / width);

    this.reset();
  };

  this.restart = function() {
    this.lives = START_LIVES;
    this.reset();
  };

  this.reset = function() {
    var levelInfo = Grid.levelInfo();
    x = 100;
    y = levelInfo.height / 2;
    maxX = levelInfo.width - halfWidth;
    maxY = levelInfo.height - halfHeight - eighthHeight;

    this.shieldAmount = 0;
    this.health = MAXHEALTH;
    this.isDead = false;

    if (levelInfo.noProjectile) {
      this.setProjectile(undefined);
    }
    else {
      this.setProjectile(projectileDefault);
    }
  };

  this.respawn = function() {
    if ((!respawnAuto || !this.keyHeld) && (respawnTime > Date.now())) {
      return;
    }
    if (!respawnAuto) {
      respawnAuto = true;
      respawnTime = Date.now() + respawnDelay;
      return;
    }

    Grid.reset();
    Grid.refreshLevel();

    if (!this.lives) {
      MenuCredits.enableGameOverText();
      Menu.activate();
      // Reset ship projectile to default...
      this.setProjectile(SHIP_DEFAULT_PROJECTILE);
    }
  };

  this.doDamage = function(amount) {
    if (this.shieldAmount > 0) {
      this.shieldAmount -= amount;

      if (this.shieldAmount < 0) {
        this.health += this.shieldAmount;
        this.shieldAmount = 0;
      }
    }
    else {
      this.health -= amount;
    }

    shakeScreen(5 * amount);

    if (this.shieldAmount > 0) {
      Sounds.shield_hit.play();
    }
    else {
      Sounds.ship_hit.play();
    }

    if (this.health <= 0) {
      this.die();
    }
  };

  this.die = function() {
    this.lives--;
    this.isDead = true;
    this.shieldAmount = 0;
    projectileDefault = SHIP_DEFAULT_PROJECTILE;
    respawnAuto = false;
    respawnTime = Date.now() + respawnDelay;
  };

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
      // Upper halfway right
      { x: x + quarterWidth, y: y - halfHeight },
      // Upper halfway left
      { x: x, y: y - halfHeight - 5 },
      // Upper left
      { x: x - (eighthWidth * 3), y: y - halfHeight },
      // Middle left
      { x: x - quarterWidth, y: y },
      // Lower left
      { x: x - quarterWidth, y: y + halfHeight },
      // Lower middle
      { x: x, y: y + halfHeight + 5 },
      // Lower halfway right
      { x: x + quarterWidth, y: y + halfHeight },
      // Middle right
      { x: x + halfWidth, y: y }
    ];
  };

  this.muzzleCoords = function() {
    return {
      x: x + halfWidth,
      y: y + 2
    };
  };

  this.checkCollisions = function() {
    var checkCoords = [
      { x: x, y: y - halfHeight },
      { x: x, y: y + halfHeight },
      { x: x - halfWidth, y: y },
      { x: x + halfWidth, y: y },

      { x: x - quarterWidth, y: y - halfHeight },
      { x: x - quarterWidth, y: y + halfHeight },
      { x: x + quarterWidth, y: y - halfHeight },
      { x: x + quarterWidth, y: y + halfHeight },
      { x: x - halfWidth, y: y - quarterHeight },
      { x: x - halfWidth, y: y - quarterHeight },
      { x: x + halfWidth, y: y + quarterHeight },
      { x: x + halfWidth, y: y + quarterHeight }
    ];
    for (var c = 0; c < checkCoords.length; c++) {
      if (Grid.isSolidTileTypeAtCoords(checkCoords[c].x, checkCoords[c].y)) {
        this.doDamage(BOUNCE_DAMAGE);

        // Recalculate the bounds outside the wall
        checkCoords[c].x = checkCoords[c].x - (prev_x - x);
        checkCoords[c].y = checkCoords[c].y - (prev_y - y);

        // Step back now to not get stuck in the wall
        x = prev_x;
        y = prev_y;

        this.bounceBackCountdown = BOUNCE_BACK_TIME;
        bounce_x = -(checkCoords[c].x - x) * .03;
        bounce_y = -(checkCoords[c].y - y) * .03;

        ParticleList.spawnParticles(PFX_BOUNCE, checkCoords[c].x, checkCoords[c].y, 360, 0, 5, 25);
        break;
      }
    }

    if (!this.isDead) {
      enemyProjectiles.checkCollision(this);
      EnemyList.checkCollision(this);
      PowerUpList.checkCollision(this);
    }
  };

  this.setProjectile = function(projectile) {
    projectileTimeout = projectileType = projectileRate = 0;
    projectileClass = projectile;
    if (!projectile) {
      return;
    }

    projectileType = projectileClass.prototype.constructor.name;
    projectileRate = PROJECTILE_INFO[projectileType].rate;
    if (PROJECTILE_INFO[projectileType].timeLimit > 0) {
      projectileTimeout = Date.now() + PROJECTILE_INFO[projectileType].timeLimit * 1000;
    }
    else {
      projectileDefault = projectileClass;
    }
  };

  this.setShield = function() {
    this.shieldAmount = SHIELD_LIFE_AMOUNT;
  };

  this.addHealth = function(amount) {
    this.health = Math.min(this.health + amount, MAXHEALTH);
  };

  this.addLife = function() {
    this.lives = Math.min(this.lives + 1, MAXLIVES);
  };

  this.move = function() {
    prev_x = x;
    prev_y = y;

    x += Grid.cameraSpeed();

    var isNotBouncing = (this.bounceBackCountdown <= 0);

    if (isNotBouncing && this.keyHeld_N) {
      velocity_y = -this.speedY;
    }
    else if (isNotBouncing && this.keyHeld_S) {
      velocity_y = this.speedY;
    }
    else {
      velocity_y *= VELOCITY_DECAY;
    }

    if (isNotBouncing && this.keyHeld_W) {
      velocity_x = -this.speedX;
    }
    else if (isNotBouncing && this.keyHeld_E) {
      velocity_x = this.speedX;
    }
    else {
      velocity_x *= VELOCITY_DECAY;
    }

    x += velocity_x;
    y += velocity_y;

    if (this.bounceBackCountdown > 0) {
      var factor = (BOUNCE_BACK_TIME / (1 + BOUNCE_BACK_TIME - this.bounceBackCountdown));
      x += bounce_x * factor;
      y += bounce_y * factor;
    }

    var camPanX = Grid.cameraPanX();
    if (x < camPanX + minX) {
      x = camPanX + minX;
    }

    if (Grid.cameraSpeed() != 0 && x > camPanX + gameCanvas.width - width) {
      x = camPanX + gameCanvas.width - width;
    }

    // World bounds checks
    if (y < minY) {
      y = minY;
    }
    else if (y > maxY) {
      y = maxY;
    }
    if (x > maxX) {
      x = maxX;
    }
  };

  this.update = function() {
    if (!Grid.isReady || debug_editor) {
      return;
    }

    if (this.isDead) {
      Ship.respawn();
      return;
    }

    this.move();

    if (this.bounceBackCountdown > 0) {
      this.bounceBackCountdown--;
    }

    this.checkCollisions();

    if (this.isDead) {
      shakeScreen(35);

      EnemyList.clear();
      PowerUpList.clear();
      shipProjectiles.clear();
      enemyProjectiles.clear();
      ParticleList.explosion(x, y);
      Sounds.explosion_ship.play();
    }

    if (projectileType && PROJECTILE_INFO[projectileType] && !debug_single_step) {
      projectileLast++;

      if (projectileLast > projectileRate) {
        projectileLast = 0;
        var muzzle = this.muzzleCoords();
        shipProjectiles.spawn(projectileClass, muzzle.x, muzzle.y);
      }
    }

    // Reset to default projectile
    if (projectileTimeout > 0 && projectileTimeout <= Date.now()) {
      this.setProjectile(projectileDefault);
    }
  };

  this.drawShield = function() {
    var shieldImage = 'shield_small';
    if (this.shieldAmount >= SHIELD_LIFE_AMOUNT / 2) {
      shieldImage = 'shield_big';
    }
    if (shieldAnimationTimer >= SHIELD_ANIMATION) {
      shieldImage += '_glow';
    }

    drawBitmapFrameCenteredWithRotationAndAlpha(gameContext, Images[shieldImage], frame, x + 5, y, 108, 65, 0, this.shieldAmount / SHIELD_LIFE_AMOUNT);

    shieldAnimationTimer++;
    if (shieldAnimationTimer > SHIELD_ANIMATION * 2) {
      shieldAnimationTimer = 0;
    }
  };

  this.draw = function() {
    if (debug_editor) {
      return;
    }

    if (!this.isDead) {
      drawBitmapFrameCenteredWithRotation(gameContext, Images.ship, frame, x, y, width, height);

      // Add some smoke to the engines!
      var minSmoke = (this.keyHeld_E) ? 2 : 1;
      var maxSmoke = (this.keyHeld_E) ? 4 : 1;
      ParticleList.spawnParticles(PFX_SMOKE, x - quarterWidth - 5, y - quarterHeight - eighthHeight, 160, 195, minSmoke, maxSmoke);
      ParticleList.spawnParticles(PFX_SMOKE, x - quarterWidth + 5, y + quarterHeight + eighthHeight, 165, 200, minSmoke, maxSmoke);

      if (maxFrames > 1 && frameDelay-- <= 0) {
        frameDelay = SHIP_FRAME_DELAY;
        frame++;
        if (frame >= maxFrames) {
          frame = 0;
        }
      }

      this.drawShield();
    }
    else {
      drawTextHugeCentered('Oh noes!?');
    }

    if (debug_draw_bounds) {
      var b = this.bounds();
      for (var c = 0; c < b.length; c++) {
        drawFillCircle(gameContext, b[c].x, b[c].y, 5, '#f00');
      }
      b.push(b[0]);
      drawLines(gameContext, '#f00', b);
      this.checkCollisions();
      var muzzle = this.muzzleCoords();
      drawFillCircle(gameContext, muzzle.x, muzzle.y, 5, "#00f");
    }
  };

  this.coords = function() {
    return { x: x, y: y };
  };

  this.currentProjectile = function() {
    return projectileClass;
  };

  return this;
})();
