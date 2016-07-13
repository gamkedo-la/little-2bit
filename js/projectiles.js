var Bullet = function(x, y) {
  this.readyToRemove = false;

  var vx = 8;

  this.update = function() {
    x += vx;

    this.readyToRemove = (x > gameCanvas.width);
  };

  this.draw = function() {
    drawRect(gameContext, x, y, 8, 2, 'white');
  };
};

var Rocket = function(x, y) {
  this.readyToRemove = false;

  var vx = 16;

  this.update = function() {
    x += vx;

    this.readyToRemove = (x > gameCanvas.width);
  };

  this.draw = function() {
    drawRect(gameContext, x, y-2, 24, 6, 'red');
  };
};
