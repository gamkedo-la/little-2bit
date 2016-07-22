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
