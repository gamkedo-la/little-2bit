var Images = new (function() {
  var images = {
    stars: 'img/stars.png',
    ship: 'img/player_ship.png',
    simple_enemy: 'img/simple_enemy.png',
    shooting_enemy: 'img/enemy_ship.png',
    simple_turret: 'img/turret_enemy1.png',
    advanced_turret_body: 'img/advanced_turret_enemy_body.png',
    advanced_turret_barrels: 'img/advanced_turret_enemy_barrels.png',
    advanced_enemy1: 'img/advanced_enemy1.png',
    advanced_enemy2: 'img/advanced_enemy2.png',
    corners: 'img/corners.png',
    rocket: 'img/rocket.png',
    laser: 'img/laser.png',
    energy_ball: 'img/enemy_shot.png',
    ui_heart: 'img/ui-heart.png',
    ui_rocket: 'img/ui-rocket.png',
    ui_double_rocket: 'img/ui-double-rocket.png',
    ui_homing_rocket: 'img/ui-homing-rocket.png',
    ui_laser: 'img/ui-laser.png',
    ui_double_laser: 'img/ui-double-laser.png',
    ui_triple_laser: 'img/ui-triple-laser.png',
    powerUp_rocket: 'img/ui-rocket.png',
    powerUp_double_rocket: 'img/ui-double-rocket.png',
    powerUp_homing_rocket: 'img/ui-homing-rocket.png',
    powerUp_double_laser: 'img/ui-double-laser.png',
    powerUp_triple_laser: 'img/ui-triple-laser.png',
    powerUp_shield: 'img/ui-shield.png',
    shield_big: 'img/player_shield_big.png',
    shield_small: 'img/player_shield_small.png',
    shield_big_glow: 'img/player_shield_big_glow.png',
    shield_small_glow: 'img/player_shield_small_glow.png',

    particle_smoke: 'img/particle-smoke.png',

    button_sound_on: 'img/button-sound-on.png',
    button_sound_off: 'img/button-sound-off.png',

    bottom1: 'img/bottom1.png',
    bottom2: 'img/bottom2.png',
    bottom_turret: 'img/bottom-turret.png',
    top1: 'img/top1.png',
    top2: 'img/top2.png',
    tilemap_demo: 'img/tilemap_template.png'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(images).length;

    for (var key in images) {
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
  var audioFormat = '.wav';
  var audio = new Audio();
  if (audio.canPlayType('audio/ogg')) {
    audioFormat = '.ogg';
  }
  else if (audio.canPlayType('audio/mp3')) {
    audioFormat = '.mp3';
  }
  
  var sounds = {
    ship_hit: 'sfx/2bit hit',
    shield_hit: 'sfx/shield hit',
    laser: 'sfx/laser low short MPC',
    double_laser: 'sfx/double laser MPC',
    triple_laser: 'sfx/triple laser NEW MPC',
    rocket: 'sfx/rocket 1',
    double_rocket: 'sfx/double rocket',
    homing_rocket: 'sfx/homing rocket',
    bomb1: 'sfx/explosion1',
    bomb2: 'sfx/explosion1',
    energy_ball: 'sfx/energy ball',
    countdown_advanced_enemy2: 'sfx/countdown advanced enemy2',
    explosion_ship: 'sfx/2bit explodes',
    explosion_simple_enemy: 'sfx/explosion1',
    explosion_shooting_enemy: 'sfx/explosion2',
    explosion_simple_turret: 'sfx/explosion1',
    explosion_advanced_turret: 'sfx/explosion1',
    explosion_advanced_enemy1: 'sfx/explosion1',
    explosion_advanced_enemy2: 'sfx/explosion1',
    explosion_advanced_enemy3: 'sfx/explosion2',
    powerup_shield_pickup: 'sfx/shield power up'
  };

  this.initialize = function() {
    for (var key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key] + audioFormat);
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
