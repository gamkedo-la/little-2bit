const DEC2RAD = (Math.PI / -180);
const PFX_BUBBLE = 1;
const PFX_ROCKET = 2;
const PFX_ROCKET_BLAST = 3;
const PFX_LASER = 4;
const PFX_SMOKE = 5;

var PFX_CONFIG = [];
PFX_CONFIG[PFX_BUBBLE] = {
  initialSpeed: 10,
  initialSize: 20,
  initialLifeTime: 80,
  shrink: true,
  dieOnCollision: true,
  speedDecay: 0.98,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 0.5,
  color: '#f00'
};

PFX_CONFIG[PFX_ROCKET] = {
  initialSpeed: 10,
  initialSize: 5,
  initialLifeTime: 30,
  shrink: true,
  dieOnCollision: true,
  speedDecay: 0.98,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 0.5,
  color: '#f00'
};

PFX_CONFIG[PFX_ROCKET_BLAST] = {
  initialSpeed: 0,
  initialSize: 90,
  initialLifeTime: 6,
  shrink: true,
  dieOnCollision: false,
  speedDecay: 0.98,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 0.5,
  color: '#f00'
};

PFX_CONFIG[PFX_LASER] = {
  initialSpeed: 5,
  initialSize: 2,
  initialLifeTime: 20,
  shrink: true,
  dieOnCollision: true,
  speedDecay: 0.98,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 1,
  color: '#f00'
};

PFX_CONFIG[PFX_SMOKE] = {
  initialSpeed: 3,
  initialSize: 3,
  initialLifeTime: 30,
  shrink: false,
  dieOnCollision: false,
  speedDecay: 0.975,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 0.2,
  image: 'particle_smoke'
};

var ParticleList = new (function() {
  var particleList = [];

  function randomRange(initial) {
    return (initial * 0.7) + (Math.random() * initial * 0.5);
  }

  this.spawnParticles = function(type, x, y, angleMin, angleMax, minQuantity, maxQuantity) {
    if (!PFX_CONFIG[type]) {
      return;
    }

    // Degrees -> radians
    angleMin = angleMin * DEC2RAD;
    angleMax = angleMax * DEC2RAD;

    var quantity = minQuantity;
    if (maxQuantity) {
      quantity = minQuantity + Math.floor(Math.random() * (maxQuantity - minQuantity));
    }

    var levelInfo = Grid.levelInfo();
    var minX = levelInfo.leftBound;
    var minY = 0;
    var maxX = levelInfo.rightBound;
    var maxY = levelInfo.height;

    for (var i = 0; i < quantity; i++) {
      var angle = angleMin + (Math.random() * (angleMax - angleMin));
      var speed = randomRange(PFX_CONFIG[type].initialSpeed);

      var particle = {
        x: x,
        y: y,
        size: randomRange(PFX_CONFIG[type].initialSize),
        speed: speed,
        lifeTime: Math.round(randomRange(PFX_CONFIG[type].initialLifeTime)),
        angle: angle,
        speedX: speed * Math.cos(angle),
        speedY: speed * Math.sin(angle),
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        alpha: PFX_CONFIG[type].alphaFrom
      };

      for (var property in PFX_CONFIG[type]) {
        if (PFX_CONFIG[type].hasOwnProperty(property)) {
          particle[property] = PFX_CONFIG[type][property];
        }
      }

      if (particle.image != undefined) {
        particle.image = Images[particle.image];
      }

      particleList.push(particle);
    }
  };

  var updateParticle = function(particle) {
    var progress = (particle.initialLifeTime - particle.lifeTime) / particle.initialLifeTime;
    particle.lifeTime--;

    if (particle.shrink) {
      particle.size = particle.initialSize + (progress * -particle.initialSize);
    }

    particle.alpha = particle.alphaFrom + (progress * (particle.alphaTo - particle.alphaFrom));

    if (particle.speedDecay) {
      particle.speedX *= particle.speedDecay;
      particle.speedY *= particle.speedDecay;
    }

    particle.isOutOfBounds = (particle.minX > particle.x || particle.x > particle.maxX || particle.minY > particle.y || particle.y > particle.maxY);
    particle.isDead = (particle.lifeTime <= 0);
    particle.hasCollided = particle.dieOnCollision && Grid.isSolidTileTypeAtCoords(particle.x, particle.y);

    particle.isReadyToRemove  = particle.isOutOfBounds || particle.isDead || particle.hasCollided;

    particle.x += particle.speedX;
    particle.y += particle.speedY;
  };

  var drawParticle = function(particle) {
    if (particle.alpha < 1) {
      gameContext.save();
      gameContext.globalAlpha = particle.alpha;
    }
    if (particle.image) {
      if (particle.shrink) {
        drawBitmapCenteredWithScale(gameContext, particle.image, particle.x, particle.y, particle.size / particle.initialSize);
      }
      else {
        drawBitmapCenteredWithRotation(gameContext, particle.image, particle.x, particle.y);
      }
    }
    else {
      drawFillCircle(gameContext, particle.x, particle.y, particle.size, particle.color);
    }
    if (particle.alpha < 1) {
      gameContext.restore();
    }
  };

  this.update = function() {
    for (var i = particleList.length - 1; i >= 0; i--) {
      updateParticle(particleList[i]);
      if (particleList[i].isReadyToRemove) {
        particleList.splice(i, 1);
      }
    }
  };

  this.draw = function() {
    for (var i = 0; i < particleList.length; i++) {
      drawParticle(particleList[i]);
    }
  };
})();
