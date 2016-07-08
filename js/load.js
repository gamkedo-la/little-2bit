var stars = document.createElement('img');

// @todo make class...

function loadImages(callback) {
  var numToLoad = 0;

  // @todo load the actual images...
  stars.onload = doneLoading;
  stars.src = 'img/stars.png';
  numToLoad++;

  function doneLoading() {
    numToLoad--;
    if (numToLoad <= 0) {
      callback();
    }
  }
}
