var Images = new (function() {
  var images = {
    stars: 'img/stars.png',
    ship: 'img/player_ship.png',
    simple_enemy: 'img/simple_enemy.png',
    shooting_enemy: 'img/enemy_ship.png',
    corners: 'img/corners.png',
    rocket: 'img/rocket.png',
    laser: 'img/laser.png',
    energy_ball: 'img/enemy_shot.png',
    ui_rocket: 'img/ui-rocket.png',
    ui_double_rocket: 'img/ui-double-rocket.png',
    ui_laser: 'img/ui-laser.png',
    ui_double_laser: 'img/ui-double-laser.png',
    ui_triple_laser: 'img/ui-triple-laser.png',
    powerUp_rocket: 'img/ui-rocket.png',
    powerUp_double_rocket: 'img/ui-double-rocket.png',
    powerUp_double_laser: 'img/ui-double-laser.png',
    powerUp_triple_laser: 'img/ui-triple-laser.png',
    powerUp_shield: 'img/ui-shield.png',
    shield_big: 'img/player_shield_big.png',
    shield_small: 'img/player_shield_small.png',

    particle_smoke: 'img/particle-smoke.png',

    button_sound_on: 'img/button-sound-on.png',
    button_sound_off: 'img/button-sound-off.png',

    bottom1: 'img/bottom1.png',
    bottom2: 'img/bottom2.png',
    top1: 'img/top1.png',
    top2: 'img/top2.png'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(images).length;

    for (key in images) {
      if (images.hasOwnProperty(key)) {
        this[key] = loadImage(images[key]);
      }
    }

    function loadImage(src) {
      var img = document.createElement('img');
      img.onload = doneLoading;
      img.src = src;

      return img;
    }

    function doneLoading() {
      numToLoad--;
      if (numToLoad == 0) {
        callback();
      }
    }

    return this;
  }
})();

var Sounds = new (function() {
  var sounds = {
    ship_hit: 'sfx/ship_hit.wav',
    laser: 'sfx/laser.wav',
    energy_ball: 'sfx/energy_ball.wav',
    rocket: 'sfx/rocket1.wav',
    explosion_ship: 'sfx/explosion2.wav',
    explosion_simple_enemy: 'sfx/explosion1.wav',
    explosion_shooting_enemy: 'sfx/explosion1.wav'
  };

  this.initialize = function() {
    for (key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key]);
      }
    }
  };

  var Sound = function(_file) {
    var timeOut = 8;
    var lastPlay = 0;
    var numSounds = 5;
    var queue = [];
    var index = 0;
    var file = new Audio(_file);

    for (var i = 0; i < numSounds; i++) {
      queue[i] = file.cloneNode(false);
    }

    this.play = function() {
      if (!UI.sound) {
        return;
      }
      if (Date.now() - lastPlay > timeOut) {
        lastPlay = Date.now();
        queue[index].currentTime = 0;
        queue[index].play();

        index++;
        if (index >= numSounds) {
          index = 0;
        }
      }
    };
  };
})();
