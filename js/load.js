var Images = new (function() {
  var images = {
    ship: 'img/player_ship.png',
    simple_enemy: 'img/simple_enemy.png',
    shooting_enemy: 'img/enemy_ship.png',
    simple_turret: 'img/turret_enemy1.png',
    advanced_turret_body: 'img/advanced_turret_enemy_body.png',
    advanced_turret_barrels: 'img/advanced_turret_enemy_barrels.png',
    advanced_enemy1: 'img/advanced_enemy1.png',
    advanced_enemy2: 'img/advanced_enemy2.png',
    advanced_enemy3: 'img/advanced_enemy3.png',

    boss1: 'img/boss-1.png',
    boss2: 'img/boss-2.png',
    boss3: 'img/boss-3.png',
    boss3_hotspot_glow: 'img/boss-3-hotspot-glow.png',

    energy_ball: 'img/enemy_shot.png',
    turret_shot: 'img/turret-shot.png',
    turret_shot_double: 'img/turret-shot-double.png',
    boss_ball: 'img/boss2_shot.png',
    ui_life: 'img/ui-life.png',
    ui_rocket: 'img/ui-rocket.png',
    ui_double_rocket: 'img/ui-double-rocket.png',
    ui_homing_rocket: 'img/ui-homing-rocket.png',
    ui_laser: 'img/ui-laser.png',
    ui_double_laser: 'img/ui-double-laser.png',
    ui_triple_laser: 'img/ui-triple-laser.png',
    powerUp_rocket: 'img/powerUp-rocket.png',
    powerUp_double_rocket: 'img/powerUp-double-rocket.png',
    powerUp_homing_rocket: 'img/powerUp-homing-rocket.png',
    powerUp_laser: 'img/powerUp-laser.png',
    powerUp_double_laser: 'img/powerUp-double-laser.png',
    powerUp_triple_laser: 'img/powerUp-triple-laser.png',
    powerUp_shield: 'img/powerUp-shield.png',
    powerUp_health: 'img/powerUp-health.png',
    powerUp_life: 'img/powerUp-life.png',
    shield_big: 'img/player_shield_big.png',
    shield_small: 'img/player_shield_small.png',
    shield_big_glow: 'img/player_shield_big_glow.png',
    shield_small_glow: 'img/player_shield_small_glow.png',

    particle_smoke: 'img/particle-smoke.png',

    button_sound_on: 'img/button-sound-on.png',
    button_sound_off: 'img/button-sound-off.png',

    explosion_shrapnel_1: 'img/particle-shrapnel-1.png',
    explosion_flash_1: 'img/particle-flare-1.png',
    explosion_flash_2: 'img/particle-flare-2.png',
    explosion_flash_3: 'img/particle-flare-3.png',
    explosion_flash_4: 'img/particle-flare-4.png',
    explosion_flame_1: 'img/particle-flame-1.png',
    explosion_flame_2: 'img/particle-flame-2.png',
    explosion_flame_3: 'img/particle-flame-3.png',
    explosion_flame_4: 'img/particle-flame-4.png',

    tilemap_cave: 'img/tilemap_cave.png',
    tilemap_surface: 'img/tilemap_surface.png',
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
  this.audioFormat = '.mp3';
  var audio = new Audio();
  if (audio.canPlayType('audio/ogg')) {
    this.audioFormat = '.ogg';
  }

  var sounds = {
    ship_hit: 'sfx/2bit hit',
    shield_hit: 'sfx/shield hit',
    laser: 'sfx/laser low short MPC',
    double_laser: 'sfx/double laser MPC',
    triple_laser: 'sfx/triple laser NEW MPC',
    rocket: 'sfx/rocket 2',
    double_rocket: 'sfx/double rocket',
    homing_rocket: 'sfx/homing rocket',
    energy_ball: 'sfx/energy ball',
    turret_shot: 'sfx/energy ball',
    turret_shot_double: 'sfx/energy ball',
    boss_ball: 'sfx/boss ball',
    countdown_advanced_enemy2: 'sfx/countdown advanced enemy2',
    advanced_enemy3_moves: 'sfx/advanced enemy3 moves',
    explosion_ship: 'sfx/2bit explodes',
    explosion_simple_enemy: 'sfx/simple enemy explosion v2',
    explosion_shooting_enemy: 'sfx/shooting enemy explosion',
    explosion_simple_turret: 'sfx/simple enemy explosion',
    explosion_advanced_turret: 'sfx/simple enemy explosion',
    explosion_advanced_enemy1: 'sfx/explosion1',
    explosion_advanced_enemy2: 'sfx/explosion1',
    explosion_advanced_enemy3: 'sfx/explosion2',
    explosion_boss: 'sfx/boss explosion',
    powerup_shield_pickup: 'sfx/shield power up',
    powerup_health_pickup: 'sfx/health power up',
    powerup_life_pickup: 'sfx/life power up'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(sounds).length;
    for (var key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key] + this.audioFormat, doneLoading);
      }
    }

    function doneLoading(event) {
      if (event) {
        // Remove event-listener so it only fires once!
        event.target.removeEventListener(event.type, arguments.callee);
      }

      numToLoad--;
      if (numToLoad == 0) {
        callback();
      }
    }
  };

  var Sound = function(_file, callback) {
    var timeOut = 8;
    var lastPlay = 0;
    var numSounds = 5;
    var index = 0;
    var file = new Audio(_file);
    file.addEventListener('canplaythrough', callback);
    var queue = [file];

    for (var i = 1; i < numSounds; i++) {
      queue[i] = queue[0].cloneNode(false);
    }

    this.play = function() {
      if (!UI.sound) {
        return;
      }
      if (Date.now() - lastPlay > timeOut) {
        lastPlay = Date.now();
        queue[index].currentTime = 0;
        queue[index].play();
        var s = queue[index];

        index++;
        if (index >= numSounds) {
          index = 0;
        }

        return s;
      }
    };
  };
})();
