var Images = new (function() {
  var images = {
    stars: 'img/stars.png',
    ship: 'img/spaceship.png',
    simple_enemy: 'img/simple_enemy.png',
    corners: 'img/corners.png',

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
    laser: 'sfx/laser.wav',
    rocket: 'sfx/rocket1.wav',
    explosion_ship: 'sfx/explosion2.wav',
    explosion_simple_enemy: 'sfx/explosion1.wav'
  };

  this.initialize = function() {
    for (key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key]);
      }
    }
  };

  var Sound = function (_file) {
    var timeOut = 8;
    var lastPlay = 0;
    var numSounds = 5;
    var queue = [];
    var index = 0;
    var file = new Audio(_file);

    for (var i = 0; i < numSounds; i++) {
      queue[i] = file.cloneNode(false);
    }

    this.play = function () {
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
