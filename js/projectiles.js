var ProjectileList = function() {
  var projectiles = [];

  this.spawn = function(ProjectileClass, x, y) {
    new ProjectileClass(this, x, y);
  };

  this.push = function(projectile) {
    projectiles.push(projectile);
  };

  this.clear = function() {
    projectiles = [];
  };

  this.update = function() {
    for (var p = projectiles.length - 1; p >= 0; p--) {
      projectiles[p].move();

      var coords = projectiles[p].coordsTip();
      if (Grid.isSolidTileTypeAtCoords(coords.x, coords.y)) {
        var tileCoords = Grid.coordsToTileCoords(coords.x, coords.y);
        projectiles[p].collideAt(tileCoords.x - 1, tileCoords.y + 1);
        projectiles[p].isReadyToRemove = true;
      }
      else {
        projectiles[p].isReadyToRemove = projectiles[p].isReadyToRemove || projectiles[p].outOfBounds;
      }

      if (projectiles[p].isReadyToRemove || Ship.isDead) {
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

      if (checkCollisionPointShape(projectiles[p].coords(), objectBounds)) {
        object.doDamage(projectiles[p].damage);
        projectiles[p].isReadyToRemove = true;
        projectiles[p].hitObject = object;
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
    x += (_x - x);
    y += (_y - y);
  };

  this.explode = function() {
    if (!this.outOfBounds) {
      this._explode(x, y);
    }
  };

  this.draw = function() {
    this._draw(frame, x - halfWidth, y - halfHeight, width, height);
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

  this.coordsTip = function() {
    return { x: x + width, y: y };
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
  Laser: {
    rate: 8,
    timeLimit: 0,
    uiImageName: 'ui_laser'
  },
  DoubleLaser: {
    rate: 8,
    timeLimit: 8,
    uiImageName: 'ui_double_laser'
  },
  TripleLaser: {
    rate: 8,
    timeLimit: 8,
    uiImageName: 'ui_triple_laser'
  },
  Rocket: {
    rate: 18,
    timeLimit: 5,
    uiImageName: 'ui_rocket'
  },
  DoubleRocket: {
    rate: 18,
    timeLimit: 5,
    uiImageName: 'ui_double_rocket'
  }
};

function Laser(list, x, y, angle) {
  var damage = 2;
  var blastRange = 0;
  var speed = 20;
  var vx = speed;
  var vy = 0;
  if (angle) {
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);
  }
  var width = 30;
  var height = 24;

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, Images.laser, frame, x, y, width, height, angle);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, Images.laser);

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
  var damage = 5;
  var blastRange = 90;
  var vx = 15;
  var vy = 0;
  var width = 40;
  var height = 24;

  this._draw = function(frame, x, y, width, height) {
    gameContext.drawImage(Images.rocket, width * frame, 0, width, height, x, y, width, height);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_ROCKETBLAST, x, y, 0, 0, 1, 1);
    ParticleList.spawnParticles(PFX_ROCKET, x, y, 360, 50, 5, 10);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, Images.rocket);

  Sounds.rocket.play();
}
Rocket.prototype = Object.create(ProjectileBase.prototype);
Rocket.prototype.constructor = Rocket;

function DoubleRocket(list, x, y) {
  this._initialize = function() {
    new Rocket(list, x, y - 12);
    new Rocket(list, x, y + 12);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);
}
DoubleRocket.prototype = Object.create(ProjectileBase.prototype);
DoubleRocket.prototype.constructor = DoubleRocket;
