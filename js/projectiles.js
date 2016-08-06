var ProjectileList = function() {
  var projectiles = [];

  this.spawn = function(projectileClass, x, y) {
    new projectileClass(this, x, y);
  };

  this.push = function(projectile) {
    projectiles.push(projectile);
  };

  this.clear = function() {
    projectiles = [];
  };

  this.update = function() {
    for (var p = projectiles.length - 1; p >= 0; p--) {
      var coords = projectiles[p].nextStep();
      if (Grid.isSolidTileTypeAtCoords(coords.x, coords.y)) {
        // @todo where will it hit the wall?
//        var tileCoords = Grid.coordsToTileCoords(coords.x, coords.y);
//        projectiles[p].collideAt(tileCoords.x - 1, tileCoords.y + 1);
        projectiles[p].isReadyToRemove = true;
      }
      else {
        projectiles[p].move();
      }

      if (projectiles[p].isReadyToRemove || projectiles[p].outOfBounds || Ship.isDead) {
        projectiles[p].explode();
        projectiles.splice(p, 1);
      }
    }
  };

  this.draw = function() {
    if (Ship.isDead) {
      return;
    }

    for (var p = 0; p < projectiles.length; p++) {
      projectiles[p].draw();
    }
  };

  this.checkCollision = function(object) {
    var objectBounds = object.bounds();
    var objectCoords = object.coords();
    if (!objectBounds || !objectCoords) {
      return;
    }

    var p;

    for (p = projectiles.length - 1; p >= 0; p--) {
      if (projectiles[p].isReadyToRemove) {
        continue;
      }

      if (checkCollisionShapes(projectiles[p], object)) {
        projectiles[p].hitObject = object;
      }
      else {
        var coords = projectiles[p].coords();
        var next = projectiles[p].nextStep();
        var bounds = [
          { x: coords.x, y: coords.y},
          { x: next.x, y: next.y + 1}
        ];
        if (checkCollisionBounds(bounds, objectBounds)) {
          projectiles[p].hitObject = object;
        }
      }

      if (projectiles[p].hitObject) {
        projectiles[p].hitObject.doDamage(projectiles[p].damage);
        projectiles[p].isReadyToRemove = true;
      }
    }

    for (p = projectiles.length - 1; p >= 0; p--) {
      // Only projectiles that have exploded
      if (!projectiles[p].isReadyToRemove) {
        continue;
      }

      if (projectiles[p].blastRange <= 0) {
        continue;
      }

      if (projectiles[p].hitObject == object) {
        continue;
      }

      var distance = distanceBetweenPoints(projectiles[p].coords(), objectCoords);
      if (projectiles[p].blastRange >= distance) {
        object.doDamage(Math.round(projectiles[p].damage * (distance / projectiles[p].blastRange)));
      }
    }
  };
};

function ProjectileBase(list, x, y, vx, vy, width, height, damage, blastRange, image) {
  this.isReadyToRemove = false;
  this.hitObject = false;
  this.outOfBounds = false;
  this.damage = damage;
  this.blastRange = blastRange;

  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var frame = 0;
  var frameDelay = 1;
  var maxFrames = image.width / width;

  if (this._initialize) {
    this._initialize();
  }
  else {
    list.push(this);
  }

  this.nextStep = function() {
    if (this._nextStep) {
      return this._nextStep();
    }

    return {
      x: x + vx,
      y: y + vy
    };
  };

  this.move = function() {
    if (this._move) {
      this._move();
    }
    else {
      x += vx;
      y += vy;
    }

    var levelInfo = Grid.levelInfo();
    this.outOfBounds = (levelInfo.leftBound - width > x || x > levelInfo.rightBound + width || 0 > y || y > levelInfo.height);
  };

  this.collideAt = function(_x, _y) {
    x = _x;
    y = _y;
  };

  this.explode = function() {
    if (!this.outOfBounds) {
      this._explode(x, y);
    }
  };

  this.draw = function() {
    this._draw(frame, x, y, width, height);
    if (this.blastRange && debug) {
      drawStrokeCircle(gameContext, x, y, this.blastRange, '#fff');
    }

    if (frameDelay-- <= 0) {
      frameDelay = 1;
      frame++;
      if (frame >= maxFrames) {
        frame = 0;
      }
    }
  };

  this.coords = function() {
    return { x: x, y: y };
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
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x + width, y: y + height },
      { x: x, y: y + height }
    ];
  };
}

const PROJECTILE_INFO = {
  // Ship Projectiles
  Laser: {
    rate: 8,
    timeLimit: 0,
    uiImageName: 'ui_laser'
  },
  DoubleLaser: {
    rate: 10,
    timeLimit: 8,
    uiImageName: 'ui_double_laser'
  },
  TripleLaser: {
    rate: 10,
    timeLimit: 8,
    uiImageName: 'ui_triple_laser'
  },
  Rocket: {
    rate: 18,
    timeLimit: 5,
    uiImageName: 'ui_rocket'
  },
  DoubleRocket: {
    rate: 24,
    timeLimit: 5,
    uiImageName: 'ui_double_rocket'
  },

  // Enemy Projectiles
  EnergyBall: {
    rate: 32
  }
};

function Laser(list, x, y, angle) {
  var damage = 3;
  var blastRange = 0;
  var speed = 20;
  var vx = speed;
  var vy = 0;
  if (angle) {
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);
  }
  var image = Images.laser;
  var width = 30;
  var height = 24;

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  Sounds.laser.play();
}
Laser.prototype = Object.create(ProjectileBase.prototype);
Laser.prototype.constructor = Laser;

function DoubleLaser(list, x, y) {
  this._initialize = function() {
    new Laser(list, x, y - 8);
    new Laser(list, x, y + 8);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);
}
DoubleLaser.prototype = Object.create(ProjectileBase.prototype);
DoubleLaser.prototype.constructor = DoubleLaser;

function TripleLaser(list, x, y) {
  this._initialize = function() {
    new Laser(list, x, y, 0.4);
    new Laser(list, x, y);
    new Laser(list, x, y, -0.4);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);
}
TripleLaser.prototype = Object.create(ProjectileBase.prototype);
TripleLaser.prototype.constructor = TripleLaser;

function Rocket(list, x, y) {
  var damage = 6;
  var blastRange = 90;
  var vx = 15;
  var vy = 0;
  var image = Images.rocket;
  var width = 40;
  var height = 24;

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_ROCKET_BLAST, x, y, 0, 0, 1, 1);
    ParticleList.spawnParticles(PFX_ROCKET, x, y, 360, 50, 5, 10);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  Sounds.rocket.play();
}
Rocket.prototype = Object.create(ProjectileBase.prototype);
Rocket.prototype.constructor = Rocket;

function DoubleRocket(list, x, y) {
  this._initialize = function() {
    new Rocket(list, x, y - 14);
    new Rocket(list, x, y + 14);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);
}
DoubleRocket.prototype = Object.create(ProjectileBase.prototype);
DoubleRocket.prototype.constructor = DoubleRocket;

// Enemy Projectiles

function EnergyBall(list, x, y, angle) {
  var damage = 0.5;
  var blastRange = 0;
  var speed = -8;
  var vx = speed;
  var vy = 0;
  if (angle) {
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);
  }
  var image = Images.energy_ball;
  var width = 30;
  var height = 30;

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  Sounds.energy_ball.play();
}
EnergyBall.prototype = Object.create(ProjectileBase.prototype);
EnergyBall.prototype.constructor = EnergyBall;
