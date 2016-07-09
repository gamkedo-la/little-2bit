var Ship = new (function(){
  this.keyHeld_N = false;
  this.keyHeld_S = false;
  this.keyHeld_W = false;
  this.keyHeld_E = false;
  this.keyHeld_SPACE = false;
  this.keyHeld_1 = false;
  this.keyHeld_2 = false;
  this.keyHeld_3 = false;
  this.keyHeld_4 = false;
  this.keyHeld_5 = false;
  this.keyHeld_6 = false;

  var x,y;
  var v = 5;
  var minX, minY, maxX, maxY;

  this.initialize = function() {
    x = 200;
    y = gameCanvas.height / 2;

    minX = Images.ship.width / 2 + 5;
    maxX = gameCanvas.width - minX;
    minY = UI.height + Images.ship.height / 2;
    maxY = gameCanvas.height - Images.ship.height / 2 - 5;
  };

  this.update = function() {
    if (this.keyHeld_N) {
      y -= v;
      if (y < minY) {
        y = minY;
      }
    }
    else if (this.keyHeld_S) {
      y += v;
      if (y > maxY) {
        y = maxY;
      }
    }

    if (this.keyHeld_W) {
      x -= v;
      if (x < minX) {
        x = minX;
      }
    }
    else if (this.keyHeld_E) {
      x += v;
      if (x > maxX) {
        x = maxX;
      }
    }

    this.y = y;
  };

  this.draw = function() {
    drawBitmapCenteredWithRotation(gameContext, Images.ship, x,y, 0);
  };

  return this;
})();
