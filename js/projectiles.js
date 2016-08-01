const FIRING_RATES = {
  Laser: {
    rate: 8,
    timeLimit: 0
  },
  Rocket: {
    rate: 18,
    timeLimit: 5
  }
};

var ProjectileList = new (function() {
  var projectiles = [];

  this.push = function(projectile) {
    projectiles.push(projectile);
  };

  this.clear = function() {
    projectiles = [];
  };

  this.update = function() {
    var levelInfo = Grid.levelInfo();

    for (var p = projectiles.length - 1; p >= 0; p--) {
      projectiles[p].move();

      var coords = projectiles[p].coordsTip();
      if (Grid.isSolidTileTypeAtCoords(coords.x, coords.y)) {
        var tileCoords = Grid.coordsToTileCoords(coords.x, coords.y);
        projectiles[p].collideAt(tileCoords.x - 1);
        projectiles[p].readyToRemove = true;
      }
      else {
        projectiles[p].outOfBounds = (levelInfo.leftBound > coords.x || coords.x > levelInfo.rightBound || 0 > coords.y || coords.y > levelInfo.height);
        projectiles[p].readyToRemove = projectiles[p].readyToRemove || projectiles[p].outOfBounds;
      }

      if (projectiles[p].readyToRemove || Ship.isDead) {
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

  this.damagedBy = function(object, types) {
    var objectBounds = object.bounds();
    if (!objectBounds) {
      return;
    }

    for (var p = projectiles.length - 1; p >= 0; p--) {
      if (projectiles[p].readyToRemove || types.indexOf(projectiles[p].constructor) == -1) {
        continue;
      }

      if (checkCollisionPointShape(projectiles[p].coords(), objectBounds)) {
        object.doDamage(projectiles[p].damage);
        projectiles[p].readyToRemove = true;
        projectiles[p].hitObject = object;
        shakeScreen(8);
      }
    }
  };

  this.blastDamagedBy = function(object, types) {
    var objectCoords = object.coords();
    if (!objectCoords) {
      return;
    }

    for (var p = projectiles.length - 1; p >= 0; p--) {
      // Only projectiles that have exploded
      if (!projectiles[p].readyToRemove) {
        continue;
      }

      if (projectiles[p].blastRange <= 0) {
        continue;
      }

      if (projectiles[p].hitObject == object) {
        continue;
      }

      if (types.indexOf(projectiles[p].constructor) == -1) {
        continue;
      }

      var distance = distanceBetweenPoints(projectiles[p].coords(), objectCoords);
      if (projectiles[p].blastRange >= distance) {
        object.doDamage(Math.round(projectiles[p].damage * (distance / projectiles[p].blastRange)));
      }
    }
  };
})();

function ProjectileBase(x, y, vx, width, height, damage, blastRange) {
  this.readyToRemove = false;
  this.hitObject = false;
  this.outOfBounds = false;
  this.damage = damage;
  this.blastRange = blastRange;

  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var image = this._getImage();

  var frame = 0;
  var frameDelay = 1;
  var maxFrames = image.width / width;

  this.move = function() {
    x += vx;
  };

  this.collideAt = function(_x) {
    x += (_x - x);
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
    return { x: x + halfWidth, y: y };
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

function Laser(x, y) {
  var vx = 20;
  var width = 30;
  var height = 24;
  ProjectileBase.call(this, x, y, vx, width, height);

  Sounds.laser.play();
}
Laser.prototype = Object.create(ProjectileBase.prototype);
Laser.prototype.constructor = Laser;

Laser.prototype._getImage = function() {
  return Images.laser;
};
Laser.prototype._draw = function(frame, x, y, width, height) {
  gameContext.drawImage(Images.laser, width * frame, 0, width, height, x, y, width, height);
};
Laser.prototype._explode = function(x, y) {
  ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
};

function Rocket(x, y) {
  var damage = 5;
  var blastRange = 90;
  var vx = 15;
  var width = 40;
  var height = 24;
  ProjectileBase.call(this, x, y, vx, width, height, damage, blastRange);

  Sounds.rocket.play();
}
Rocket.prototype = Object.create(ProjectileBase.prototype);
Rocket.prototype.constructor = Rocket;

Rocket.prototype._getImage = function() {
  return Images.rocket;
};
Rocket.prototype._draw = function(frame, x, y, width, height) {
  gameContext.drawImage(Images.rocket, width * frame, 0, width, height, x, y, width, height);
};
Rocket.prototype._explode = function(x, y) {
  ParticleList.spawnParticles(PFX_ROCKETBLAST, x, y, 0, 0, 1, 1);
  ParticleList.spawnParticles(PFX_ROCKET, x, y, 360, 50, 5, 10);
};
