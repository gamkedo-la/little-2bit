var ProjectileList = new (function() {
  var projectiles = [];

  this.push = function(projectile) {
    projectiles.push(projectile);
  };

  this.clear = function() {
    projectiles = [];
  };

  this.update = function() {
    for (var p = projectiles.length - 1; p >= 0; p--) {
      projectiles[p].update();
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
      }
    }
  }
})();

var Laser = function(x, y) {
  this.readyToRemove = false;
  this.outOfBounds = false;
  this.damage = 3;

  var vx = 11;
  var width = 8;
  var height = 2;
  var halfWidth = width / 2;

  Sounds.laser.play();

  this.update = function() {
    x += vx;

    if (Grid.isSolidTileTypeAtCoords(x + halfWidth, y)) {
      var tileCoords = Grid.coordsToTileCoords(x + halfWidth, y);
      x += (tileCoords.x - x - 1);
      this.readyToRemove = true;
    }
    else {
      var levelInfo = Grid.levelInfo();
      this.outOfBounds = (x > levelInfo.rightBound);
      this.readyToRemove = this.readyToRemove || this.outOfBounds;
    }
  };

  this.explode = function() {
    if (!this.outOfBounds) {
      ParticleList.spawnParticles(PFX_LASER, x, y, 360, 50, 2, 5);
    }
  };

  this.draw = function() {
    drawRect(gameContext, x, y, width, height, 'white');
  };

  this.coords = function() {
    return {x: x, y: y};
  };

  this.bounds = function() {
    return [
      {x: x, y: y},
      {x: x+width, y: y},
      {x: x+width, y: y+height},
      {x: x, y: y+height}
    ];
  };
};

var Rocket = function(x, y) {
  this.readyToRemove = false;
  this.outOfBounds = false;
  this.damage = 5;

  var vx = 10;
  var width = Images.rocket.width;
  var height = Images.rocket.height;
  var halfWidth = width / 2;

  Sounds.rocket.play();

  this.update = function() {
    x += vx;

    if (Grid.isSolidTileTypeAtCoords(x + halfWidth, y)) {
      var tileCoords = Grid.coordsToTileCoords(x + halfWidth, y);
      x += (tileCoords.x - x - 1);
      this.readyToRemove = true;
    }
    else {
      var levelInfo = Grid.levelInfo();
      this.outOfBounds = (x > levelInfo.rightBound);
      this.readyToRemove = this.readyToRemove || this.outOfBounds;
    }
  };

  this.explode = function(){
    if (!this.outOfBounds) {
      ParticleList.spawnParticles(PFX_ROCKET, x, y, 360, 50, 5, 10);
    }
  };

  this.draw = function() {
    drawBitmapCenteredWithRotation(gameContext, Images.rocket, x, y, 0);
  };

  this.coords = function() {
    return {x: x, y: y};
  };

  this.bounds = function() {
    return [
      {x: x, y: y},
      {x: x+width, y: y},
      {x: x+width, y: y+height},
      {x: x, y: y+height}
    ];
  };
};
