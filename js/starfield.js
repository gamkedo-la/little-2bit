const STAR_COUNT_GAME = 150;
const STAR_COUNT_UI = 30;

const CAM_SLIDE_MULTIPLIER = 0.15;

function StarClass(context, canvas) {
  var x = 0;
  var y = 0;
  var dist = 0;
  var size = 0;

  x = Math.random() * canvas.width;
  y = Math.random() * canvas.height;
  dist = 1 + Math.random() * 2.0;
  size = 0.5 + Math.random() * 1.5;

  this.move = function(camSlideScale) {
    x -= dist * camSlideScale;
    y += 0;
    if (x < 0) {
      x = canvas.width;
      y = Math.random() * canvas.height;
    }
    if (x > canvas.width) { // off the side, must have reset rescatter placement
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
    }
  };

  this.draw = function(leftSide) {
    drawStrokeCircle(context, leftSide+x, y,  Math.random() * size, '#fff');
  }
}

var StarfieldList = new (function() {
  var game_stars = [];
  var ui_stars = [];
  var lastCamOffset = 0;

  this.initialize = function() {
    for (var s = 0; s < STAR_COUNT_GAME; s++) {
      if (s < STAR_COUNT_UI) {
        ui_stars.push(new StarClass(uiContext, uiCanvas));
      }
      game_stars.push(new StarClass(gameContext, gameCanvas));
    }
  };

  this.update = function(leftSide) {
    var camDrift = (leftSide - lastCamOffset) * CAM_SLIDE_MULTIPLIER;
    lastCamOffset = leftSide;
    for (var s = 0; s < game_stars.length; s++) {
      if (s < ui_stars.length) {
        ui_stars[s].move(camDrift);
      }
      game_stars[s].move(camDrift);
    }
  };

  this.draw = function(leftSide) {
    drawFillRect(gameContext, leftSide, 0, gameCanvas.width, gameCanvas.height, "#000");
    drawFillRect(uiContext, 0, 0, uiCanvas.width, uiCanvas.height, "#000");
    for (var s = 0; s < game_stars.length; s++) {
      if (s < ui_stars.length) {
        ui_stars[s].draw(0);
      }
      game_stars[s].draw(leftSide);
    }
  };
})();
