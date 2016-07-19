var Bullet = function(x, y) {
  this.readyToRemove = false;

  var vx = 8;
  var width = 8;
  var height = 2;
  var halfWidth = width / 2;
  y += 6;

  this.update = function() {
    x += vx;

    if (Grid.isSolidTileTypeAtCoords(x + halfWidth, y)) {
      this.readyToRemove = true;
    }
    else {
      var levelInfo = Grid.levelInfo();
      this.readyToRemove = (x > levelInfo.rightBound);
    }
  };

  this.draw = function() {
    drawRect(gameContext, x, y, width, height, 'white');
  };
};

var Rocket = function(x, y) {
  this.readyToRemove = false;

  var vx = 16;
  var width = 24;
  var height = 6;
  var halfWidth = width / 2;
  y += 4;

  this.update = function() {
    x += vx;

    if (Grid.isSolidTileTypeAtCoords(x + halfWidth, y)) {
      this.readyToRemove = true;
    }
    else {
      var levelInfo = Grid.levelInfo();
      this.readyToRemove = (x > levelInfo.rightBound);
    }
  };

  this.draw = function() {
    drawRect(gameContext, x, y, width, height, 'red');
  };
};
