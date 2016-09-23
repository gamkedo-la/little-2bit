const COLLISION_CHECK_STEPS = 4;
var ProjectileList = function() {
  var projectiles = [];

  this.spawn = function(projectileClass, x, y, angle) {
    new projectileClass(this, x, y, angle);
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
      var coords = projectiles[p].coords();
      if (!projectiles[p].isOutOfBounds && Grid.isSolidTileTypeAtCoords(coords.x, coords.y)) {
        // Approximately figure out where it hit the wall
        var collision_check_step = -1 / COLLISION_CHECK_STEPS;
        for (var s = 1; s < COLLISION_CHECK_STEPS; s++) {
          var prev = projectiles[p].step(collision_check_step * s);
          if (!Grid.isSolidTileTypeAtCoords(prev.x, prev.y)) {
            projectiles[p].moveTo(prev);
            break;
          }
        }
        projectiles[p].isReadyToRemove = true;
      }

      if (projectiles[p].isReadyToRemove || projectiles[p].isOutOfBounds || Ship.isDead) {
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
        var next = projectiles[p].step(.5);
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
  this.isOutOfBounds = false;
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

  this.step = function(ratio) {
    if (ratio == undefined) {
      ratio = 1;
    }

    if (this._step) {
      return this._step(x, y, ratio);
    }

    return {
      x: x + vx * ratio,
      y: y + vy * ratio
    };
  };

  this.move = function() {
    if (this._move) {
      this._move(x, y);
    }
    else {
      this.moveTo(this.step(1));
    }

    var levelInfo = Grid.levelInfo();
    this.isOutOfBounds = (levelInfo.leftBound - width > x || x > levelInfo.rightBound + width || -height > y || y > levelInfo.height + height);
  };

  this.moveTo = function(coords) {
    x = coords.x;
    y = coords.y;
  };

  this.explode = function() {
    if (!this.isOutOfBounds) {
      this._explode(x, y);
    }
  };

  this.draw = function() {
    this._draw(frame, x, y, width, height);
    if (this.blastRange && debug_draw_bounds) {
      drawStrokeCircle(gameContext, x, y, this.blastRange, '#fff');
    }
    if (debug_draw_bounds) {
      var b = this.bounds();
      b.push(b[0]);
      drawLines(gameContext, '#fff', b);
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
    if (this._bounds) {
      return this._bounds(x, y);
    }

    return [
      { x: x - halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y - halfHeight },
      { x: x + halfWidth, y: y + halfHeight },
      { x: x - halfWidth, y: y + halfHeight }
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
  HomingRocket: {
    rate: 32,
    timeLimit: 4,
    uiImageName: 'ui_homing_rocket'
  },

  // Enemy Projectiles
  EnergyBall: {
    rate: 32
  },
  BossBall: {
    rate: 32
  }
};

function Laser(list, x, y, angle, noSound) {
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

  var halfWidth = width / 2;
  var quarterHeight = height / 4;

  this._bounds = function(x, y) {
    // @todo what about rotated projectiles...?
    return [
      { x: x - halfWidth, y: y - quarterHeight },
      { x: x + halfWidth, y: y - quarterHeight },
      { x: x + halfWidth, y: y + quarterHeight },
      { x: x - halfWidth, y: y + quarterHeight }
    ];
  };

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  if (!noSound) {
    Sounds.laser.play();
  }
}
Laser.prototype = Object.create(ProjectileBase.prototype);
Laser.prototype.constructor = Laser;

function DoubleLaser(list, x, y) {
  this._initialize = function() {
    new Laser(list, x, y - 8, 0, true);
    new Laser(list, x, y + 8, 0, true);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);

  Sounds.double_laser.play();
}
DoubleLaser.prototype = Object.create(ProjectileBase.prototype);
DoubleLaser.prototype.constructor = DoubleLaser;

function TripleLaser(list, x, y) {
  this._initialize = function() {
    new Laser(list, x, y, 0.4, true);
    new Laser(list, x, y, 0, true);
    new Laser(list, x, y, -0.4, true);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);

  Sounds.triple_laser.play();
}
TripleLaser.prototype = Object.create(ProjectileBase.prototype);
TripleLaser.prototype.constructor = TripleLaser;

function Rocket(list, x, y, noSound) {
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
    ParticleList.spawnParticles(PFX_ROCKET, x, y, 360, 50, 10, 30);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  if (!noSound) {
    Sounds.rocket.play();
  }
}
Rocket.prototype = Object.create(ProjectileBase.prototype);
Rocket.prototype.constructor = Rocket;

function DoubleRocket(list, x, y) {
  this._initialize = function() {
    new Rocket(list, x, y - 14, true);
    new Rocket(list, x, y + 14, true);
  };

  ProjectileBase.call(this, list, x, y, 0, 0, 0, 0, 0, 0, 0);

  Sounds.double_rocket.play();
}
DoubleRocket.prototype = Object.create(ProjectileBase.prototype);
DoubleRocket.prototype.constructor = DoubleRocket;

function HomingRocket(list, x, y) {
  var damage = 6;
  var blastRange = 90;
  var speed = 13;
  var vx = speed;
  var vy = 0;
  var angle = 0;
  var image = Images.rocket;
  var width = 40;
  var height = 24;

  var targetRange = 180;
  var target = false;
  var rotationEase = .3;

  this._move = function(x, y) {
    var thisCoords = { x: x, y: y };
    if (!target) {
      // Find a target
      target = EnemyList.findClosestEnemyInRange(thisCoords, targetRange);
    }

    if (target) {
      // Rotate towards target
      var newVs = rotateToTarget(vx, vy, speed, rotationEase, target.coords(), thisCoords);
      vx = newVs.vx;
      vy = newVs.vy;
      angle = Math.atan2(vy, vx);
    }

    this.moveTo({
      x: x + vx,
      y: y + vy
    });
  };

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle);

    if (debug_draw_bounds) {
      drawStrokeCircle(gameContext, x, y, targetRange, '#f00');
      drawLines(gameContext, '#fff', [
        { x: x, y: y },
        { x: x + 75 * Math.cos(angle), y: y + 75 * Math.sin(angle) }
      ]);
    }
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_ROCKET_BLAST, x, y, 0, 0, 1, 1);
    ParticleList.spawnParticles(PFX_ROCKET, x, y, 0, 360, 10, 30);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  Sounds.homing_rocket.play();
}
HomingRocket.prototype = Object.create(ProjectileBase.prototype);
HomingRocket.prototype.constructor = HomingRocket;

// Enemy Projectiles

function EnergyBall(list, x, y, angle) {
  var damage = 0.5;
  var blastRange = 0;
  var speed = 8;
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

function BossBall(list, x, y, angle) {
  var damage = 0.5;
  var blastRange = 0;
  var speed = 8;
  var vx = speed;
  var vy = 0;
  if (angle) {
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);
  }
  var image = Images.boss_ball;
  var width = 30;
  var height = 30;

  this._draw = function(frame, x, y, width, height) {
    drawBitmapFrameCenteredWithRotation(gameContext, image, frame, x, y, width, height, angle);
  };

  this._explode = function(x, y) {
    ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
  };

  ProjectileBase.call(this, list, x, y, vx, vy, width, height, damage, blastRange, image);

  Sounds.boss_ball.play();
}
BossBall.prototype = Object.create(ProjectileBase.prototype);
BossBall.prototype.constructor = BossBall;
