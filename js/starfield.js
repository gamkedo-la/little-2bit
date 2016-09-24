const STAR_COUNT = 200;

const CAM_SLIDE_MULTIPLIER = 0.15;

function StarClass() {
  var x = 0;
  var y = 0;
  var dist = 0;
  var size = 0;

  x = Math.random() * gameCanvas.width;
  y = Math.random() * gameCanvas.height;
  dist = 1 + Math.random() * 2.0;
  size = 0.5 + Math.random() * 1.5;

  this.move = function(camSlideScale) {
    x -= dist * camSlideScale;
    y += 0;
    if (x < 0) {
      x = gameCanvas.width;
      y = Math.random() * gameCanvas.height;
    }
    if (x > gameCanvas.width) { // off the side, must have reset rescatter placement
      x = Math.random() * gameCanvas.width;
      y = Math.random() * gameCanvas.height;
    }
  };

  this.draw = function(leftSide) {
    drawStrokeCircle(gameContext, leftSide+x, y,  Math.random() * size, '#fff');
  }
}

var StarfieldList = new ( function() {
  var stars = [];
  var lastCamOffset = 0;

  for (var s = 0; s < STAR_COUNT; s++) {
     stars.push( new StarClass() );
  }

  this.update = function(leftSide) {
    var camDrift = (leftSide - lastCamOffset) * CAM_SLIDE_MULTIPLIER;
    lastCamOffset = leftSide;
    for (var s = 0; s < stars.length; s++) {
      stars[s].move(camDrift);
    }
  };

  this.draw = function(leftSide) {
    drawFillRect(gameContext, leftSide, 0, gameCanvas.width, gameCanvas.height, "#000");
    for (var s = 0; s < stars.length; s++) {
      stars[s].draw(leftSide);
    }
  };

})();
