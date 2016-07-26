const PFX_BUBBLE = 1;
const PFX_ROCKET = 2;
const PFX_ROCKETBLAST = 3;
const PFX_LASER = 4;

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
  alphaTo: 0.5
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
  alphaTo: 0.5
};

PFX_CONFIG[PFX_ROCKETBLAST] = {
  initialSpeed: 0,
  initialSize: 80,
  initialLifeTime: 6,
  shrink: true,
  dieOnCollision: false,
  speedDecay: 0.98,
  gravity: 0,
  alphaFrom: 1,
  alphaTo: 0.5
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
  alphaTo: 1
};

var ParticleList = new (function(){
  var particleList = [];

  function randomRange(initial) {
    return (initial * 0.7) + (Math.random() * initial * 0.5);
  }

  this.spawnParticles = function(type, x, y, angleMin, angleMax, minQuantity, maxQuantity) {
    if (!PFX_CONFIG[type]) {
      return;
    }

    // Degrees -> radians
    angleMin = angleMin * (Math.PI / -180);
    angleMax = angleMax * (Math.PI / -180);

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
        shrink: PFX_CONFIG[type].shrink,
        gravity: PFX_CONFIG[type].gravity,
        speedDecay: PFX_CONFIG[type].speedDecay,
        initialSize: PFX_CONFIG[type].initialSize,
        initialSpeed: PFX_CONFIG[type].initialSpeed,
        initialLifeTime: PFX_CONFIG[type].initialLifeTime,
        dieOnCollision: PFX_CONFIG[type].dieOnCollision,
        alphaFrom: PFX_CONFIG[type].alphaFrom,
        alphaTo: PFX_CONFIG[type].alphaTo,

        x: x,
        y: y,
        size: randomRange(PFX_CONFIG[type].initialSize),
        speed: speed,
        lifeTime: Math.round(randomRange(PFX_CONFIG[type].initialLifeTime)),
        color: '#f00',
        angle: angle,
        speedX: speed * Math.cos(angle),
        speedY: speed * Math.sin(angle),
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        alpha: PFX_CONFIG[type].alphaFrom
      };

      particleList.push(particle);
    }
  };

  var updateParticle = function(particle) {
    var progress = (particle.initialLifeTime - particle.lifeTime) / particle.initialLifeTime;
    particle.lifeTime--;

    if (particle.shrink) {
      particle.size = particle.initialSize + (progress * - particle.initialSize);
    }

    particle.alpha = particle.alphaFrom + (progress * (particle.alphaTo - particle.alphaFrom));

    if (particle.speedDecay) {
      particle.speedX *= particle.speedDecay;
      particle.speedY *= particle.speedDecay;
    }

    particle.isReadyToRemove = (particle.lifeTime <= 0);
    if (!particle.isReadyToRemove && particle.dieOnCollision) {
      particle.isReadyToRemove = (particle.minX > particle.x || particle.x > particle.maxX || particle.minY > particle.y || particle.y > particle.maxY || Grid.isSolidTileTypeAtCoords(particle.x, particle.y));
    }

    particle.x += particle.speedX;
    particle.y += particle.speedY;
  };

  var drawParticle = function(particle) {
    if (particle.alpha < 1) {
      gameContext.save();
      gameContext.globalAlpha = particle.alpha;
    }
    drawCircle(gameContext, particle.x, particle.y, particle.size, particle.color);
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