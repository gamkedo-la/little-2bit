var Images = new (function() {
  var images = {
    stars: 'img/stars.png',
    ship: 'img/spaceship.png',
    corners: 'img/corners.png'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(images).length;

    for (key in images) {
      if (images.hasOwnProperty(key)) {
        this[key] = document.createElement('img');
        this[key].onload = doneLoading;
        this[key].src = images[key];
      }
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
