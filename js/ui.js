var UI = new (function(){
  this.keyHeld_W = false;
  this.keyHeld_E = false;

  this.height = 60;

  var center = {};
  var x;
  var vx = 3;
  var w, hw;

  this.initialize = function() {
    x = 0;
    center.x = gameCanvas.width / 2;
    center.y = gameCanvas.height / 2;
    w = Images.stars.width;
    hw = w / 2;
  };

  this.update = function() {
    if (this.keyHeld_E) {
      vx = 5;
    }
    else if (this.keyHeld_W) {
      vx = 2;
    }
    else {
      vx = 3;
    }

    x -= vx;
    if (x < hw) {
      x += w;
    }
  };

  this.draw = function() {
    var x2 = x - w;
    drawBitmapCenteredWithRotation(gameContext, Images.stars, x,center.y);
    drawBitmapCenteredWithRotation(gameContext, Images.stars, x2,center.y);

    drawBitmapCenteredWithRotation(gameContext, Images.ui, center.x,center.y);
  };
})();
