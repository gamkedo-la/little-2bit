const PFX_TYPE = 0;
const PFX_BUBBLE = 1;
const PFX_ROCKET = 2;
const PFX_ROCKET_BLAST = 3;
const PFX_LASER = 4;
const PFX_SMOKE = 5;

var PFX_CONFIG = [];
PFX_CONFIG[PFX_TYPE] = {
  initialSpeed: 8,
  randomInitialSpeed: true,
  speedDecay: 0.975,
  initialSize: 2.5,
  randomInitialSize: true,
  sizeDecay: 1.03,
  // Number of frames/gameLoops
  initialLifeTime: 30,
  randomInitialLifeTime: true,
  // Angles in degrees
  initialAngle: 180,
  randomInitialAngle: true,
  rotationSpeed: .05,
  rotationDecay: 0.98,
  // From 1 to 0
  initialAlpha: .9,
  randomInitialAlpha: true,
  alphaDecay: 0.95,

  gravity: 0,
  // Particle is removed when it collides with walls
  dieOnCollision: false,
  // Pick one: color or image
  color: '#f00',
  image: 'particle_smoke'
};

PFX_CONFIG[PFX_BUBBLE] = {
  initialSpeed: 10,
  randomInitialSpeed: true,
  speedDecay: 0.975,
  initialSize: 20,
  randomInitialSize: true,
  sizeDecay: .99,
  initialLifeTime: 80,
  randomInitialLifeTime: true,
  initialAlpha: 1,
  randomInitialAlpha: true,
  alphaDecay: 0.98,
  dieOnCollision: true,
  gravity: 0,
  color: '#f00'
};

PFX_CONFIG[PFX_ROCKET] = {
  initialSpeed: 10,
  randomInitialSpeed: true,
  speedDecay: 0.975,
  initialSize: 5,
  randomInitialSize: true,
  sizeDecay: .99,
  initialLifeTime: 30,
  randomInitialLifeTime: true,
  initialAlpha: 1,
  randomInitialAlpha: true,
  alphaDecay: 0.98,
  dieOnCollision: true,
  gravity: 0,
  color: '#f00'
};

PFX_CONFIG[PFX_ROCKET_BLAST] = {
  initialSpeed: 0,
  randomInitialSpeed: true,
  speedDecay: 0.975,
  initialSize: 80,
  randomInitialSize: true,
  sizeDecay: 1.1,
  initialLifeTime: 6,
  randomInitialLifeTime: true,
  initialAlpha: 0.8,
  randomInitialAlpha: true,
  alphaDecay: 0.75,
  dieOnCollision: false,
  gravity: 0,
  color: '#f00'
};

PFX_CONFIG[PFX_LASER] = {
  initialSpeed: 5,
  speedDecay: 0.98,
  initialSize: 2,
  sizeDecay: 0.98,
  initialLifeTime: 20,
  randomInitialLifeTime: true,
  initialAlpha: 1,
  alphaDecay: 0.98,
  dieOnCollision: true,
  gravity: 0,
  color: '#f00'
};

PFX_CONFIG[PFX_SMOKE] = {
  initialSpeed: 3,
  randomInitialSpeed: true,
  speedDecay: 0.975,
  initialSize: 1,
  randomInitialSize: true,
  sizeDecay: 1.04,
  initialLifeTime: 30,
  randomInitialLifeTime: true,
  initialAngle: 180,
  randomInitialAngle: true,
  rotationSpeed: .05,
  rotationDecay: 0.98,
  initialAlpha: .9,
  randomInitialAlpha: true,
  alphaDecay: 0.95,
  gravity: 0,
  dieOnCollision: false,
  image: 'particle_smoke'
};

var ParticleList = new (function() {
  var particleList = [];

  function randomRange(initial) {
    return (initial * 0.7) + (Math.random() * initial * 0.5);
  }

  this.spawnParticles = function(type, x, y, directionAngleMin, directionAngleMax, minQuantity, maxQuantity) {
    if (!PFX_CONFIG[type]) {
      return;
    }

    // Degrees -> radians
    directionAngleMin = directionAngleMin * DEC2RAD;
    directionAngleMax = directionAngleMax * DEC2RAD;
    var initialAngle = PFX_CONFIG[type].initialAngle * DEC2RAD;
    var rotationSpeed = 0;
    if (PFX_CONFIG[type].rotationSpeed) {
      rotationSpeed = PFX_CONFIG[type].rotationSpeed * DEC2RAD;
    }

    var quantity = minQuantity;
    if (maxQuantity > 0) {
      quantity = minQuantity + Math.floor(Math.random() * (maxQuantity - minQuantity));
    }

    var levelInfo = Grid.levelInfo();
    var minX = levelInfo.leftBound;
    var minY = 0;
    var maxX = levelInfo.rightBound;
    var maxY = levelInfo.height;

    for (var i = 0; i < quantity; i++) {
      var directionAngle = directionAngleMin + (Math.random() * (directionAngleMax - directionAngleMin));
      var speed = PFX_CONFIG[type].initialSpeed;
      if (PFX_CONFIG[type].randomInitialSpeed) {
        speed = randomRange(speed);
      }
      var size = PFX_CONFIG[type].initialSize;
      if (PFX_CONFIG[type].randomInitialSize) {
        size = randomRange(size);
      }
      var lifetime = PFX_CONFIG[type].initialLifeTime;
      if (PFX_CONFIG[type].randomInitialLifeTime) {
        lifetime = Math.round(randomRange(lifetime));
      }
      var angle = initialAngle;
      if (PFX_CONFIG[type].randomInitialAngle) {
        angle = randomRange(angle);
      }
      var alpha = PFX_CONFIG[type].initialAlpha;
      if (PFX_CONFIG[type].randomInitialAlpha) {
        alpha = randomRange(PFX_CONFIG[type].initialAlpha);
      }

      var particle = {
        x: x,
        y: y,
        size: size,
        speed: speed,
        lifeTime: lifetime,
        angle: angle,
        rotationSpeed: rotationSpeed,
        directionAngle: directionAngle,
        speedX: speed * Math.cos(directionAngle),
        speedY: speed * Math.sin(directionAngle),
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        alpha: alpha
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
    particle.lifeTime--;

    if (particle.sizeDecay) {
      particle.size *= particle.sizeDecay;
    }

    if (particle.alphaDecay) {
      particle.alpha *= particle.alphaDecay;
    }

    if (particle.rotationSpeed) {
      particle.angle += particle.rotationSpeed;

      if (particle.rotationDecay) {
        particle.rotationSpeed *= particle.rotationDecay;
      }
    }

    if (particle.speedDecay) {
      particle.speedX *= particle.speedDecay;
      particle.speedY *= particle.speedDecay;
    }

    particle.isOutOfBounds = (particle.minX > particle.x || particle.x > particle.maxX || particle.minY > particle.y || particle.y > particle.maxY);
    particle.isDead = (particle.lifeTime <= 0);
    particle.hasCollided = particle.dieOnCollision && Grid.isSolidTileTypeAtCoords(particle.x, particle.y);

    particle.isReadyToRemove = particle.isOutOfBounds || particle.isDead || particle.hasCollided;

    particle.x += particle.speedX;
    particle.y += particle.speedY;
  };

  var drawParticle = function(particle) {
    if (particle.alpha < 1) {
      gameContext.save();
      gameContext.globalAlpha = particle.alpha;
    }
    if (particle.image) {
      drawBitmapCenteredWithScaleAndRotation(gameContext, particle.image, particle.x, particle.y, particle.size, particle.angle);
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
