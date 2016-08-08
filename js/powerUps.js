var PowerUpList = new (function() {
  var powerUpList = [];

  this.brickTypeIsPowerUp = function(type) {
    return brickTypePowerUps[type];
  };

  this.createPowerUpByBrickType = function(type, x, y) {
    var PowerUpClass = brickTypePowerUps[type];
    powerUpList.push(new PowerUpClass(x, y));
  };

  this.clear = function() {
    powerUpList = [];
  };

  this.checkCollision = function(ship) {
    for (var i = 0; i < powerUpList.length; i++) {
      if (checkCollisionShapes(ship, powerUpList[i])) {
        powerUpList[i].pickUp();
      }
    }
  };

  this.update = function() {
    var i;
    for (i = powerUpList.length - 1; i >= 0; i--) {
      var boundingBox = powerUpList[i].boundingBox();
      var levelInfo = Grid.levelInfo();
      powerUpList[i].outOfBounds = (levelInfo.leftBound > boundingBox.right || boundingBox.left > levelInfo.rightBound || 0 > boundingBox.bottom || boundingBox.top > levelInfo.height);

      powerUpList[i].isReadyToRemove = powerUpList[i].isReadyToRemove || powerUpList[i].outOfBounds;
    }

    for (i = powerUpList.length - 1; i >= 0; i--) {
      if (powerUpList[i].isReadyToRemove) {
        powerUpList.splice(i, 1);
      }
    }
  };

  this.draw = function() {
    for (var i = 0; i < powerUpList.length; i++) {
      powerUpList[i].draw();
    }
  };
})();

function PowerUpBase(x, y, width, height, image) {
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var frame = 0;
  var frameDelay = 1;
  var maxFrames = image.width / width;

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
    var boundingBox = this.boundingBox();

    return [
      { x: boundingBox.left, y: boundingBox.top },
      { x: boundingBox.left, y: boundingBox.bottom },
      { x: boundingBox.right, y: boundingBox.bottom },
      { x: boundingBox.right, y: boundingBox.top }
    ];
  };

  this.coords = function() {
    return { x: x, y: y };
  };

  this.pickUp = function() {
    this.isReadyToRemove = true;
    this._pickUp();
  };

  this.draw = function() {
    gameContext.drawImage(image, width * frame, 0, width, height, x - halfWidth, y - halfHeight, width, height);

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

var brickTypePowerUps = [];

brickTypePowerUps[POWERUP_ROCKET] = PowerUpRocket;
function PowerUpRocket(x, y) {
  var width = 40;
  var height = 24;
  var image = Images.powerUp_rocket;

  this._pickUp = function() {
    Ship.setProjectile(Rocket);
  };

  PowerUpBase.call(this, x, y, width, height, image);
}

PowerUpRocket.prototype = Object.create(PowerUpBase.prototype);
PowerUpRocket.prototype.constructor = PowerUpRocket;

brickTypePowerUps[POWERUP_DOUBLE_ROCKET] = PowerUpDoubleRocket;
function PowerUpDoubleRocket(x, y) {
  var width = 40;
  var height = 24;
  var image = Images.powerUp_double_rocket;

  this._pickUp = function() {
    Ship.setProjectile(DoubleRocket);
  };

  PowerUpBase.call(this, x, y, width, height, image);
}

PowerUpDoubleRocket.prototype = Object.create(PowerUpBase.prototype);
PowerUpDoubleRocket.prototype.constructor = PowerUpDoubleRocket;

brickTypePowerUps[POWERUP_DOUBLE_LASER] = PowerUpDoubleLaser;
function PowerUpDoubleLaser(x, y) {
  var width = 40;
  var height = 24;
  var image = Images.powerUp_double_laser;

  this._pickUp = function() {
    Ship.setProjectile(DoubleLaser);
  };

  PowerUpBase.call(this, x, y, width, height, image);
}

PowerUpDoubleLaser.prototype = Object.create(PowerUpBase.prototype);
PowerUpDoubleLaser.prototype.constructor = PowerUpDoubleLaser;

brickTypePowerUps[POWERUP_TRIPLE_LASER] = PowerUpTripleLaser;
function PowerUpTripleLaser(x, y) {
  var width = 40;
  var height = 24;
  var image = Images.powerUp_triple_laser;

  this._pickUp = function() {
    Ship.setProjectile(TripleLaser);
  };

  PowerUpBase.call(this, x, y, width, height, image);
}

PowerUpTripleLaser.prototype = Object.create(PowerUpBase.prototype);
PowerUpTripleLaser.prototype.constructor = PowerUpTripleLaser;

//shield powerup
brickTypePowerUps[POWERUP_SHIELD] = PowerUpShield;
function PowerUpShield(x, y) {
  var width = 40;
  var height = 24;
  var image = Images.powerUp_shield;

  this._pickUp = function() {
    //do something on pickup
  };

  PowerUpBase.call(this, x, y, width, height, image);
}

PowerUpShield.prototype = Object.create(PowerUpBase.prototype);
PowerUpShield.prototype.constructor = PowerUpShield;
