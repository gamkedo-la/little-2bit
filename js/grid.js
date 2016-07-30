const GRID_WIDTH = 40;
const GRID_HEIGHT = 40;

var Grid = new (function() {
  var COLS = 20;
  var ROWS = 15;

  var level;
  var bricks = [];

  var canvasHalfWidth;
  var colsThatFitOnScreen;

  var camPanX;
  this.backgroundX = 0;
  this.backgroundWidth = 0;

//  const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X = 150;
  const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X = 50;

  this.initialize = function() {
    canvasHalfWidth = gameCanvas.width / 2;
    colsThatFitOnScreen = Math.floor(gameCanvas.width / GRID_WIDTH);
    camPanX = 0.0;

    bricks[BRICK_SPACE] = false;
    bricks[BRICK_TOP1] = Images.top1;
    bricks[BRICK_TOP2] = Images.top2;
    bricks[BRICK_BOTTOM1] = Images.bottom1;
    bricks[BRICK_BOTTOM2] = Images.bottom2;

    this.backgroundWidth = Images.stars.width;

    // @todo dynamic load level
    COLS = level1.cols;
    ROWS = level1.rows;
    level = level1.map;
  };

  this.levelInfo = function() {
    return {
      cols: COLS,
      rows: ROWS,
      width: COLS*GRID_WIDTH,
      height: ROWS*GRID_HEIGHT,
      leftBound: camPanX,
      rightBound: camPanX + gameCanvas.width
    };
  };

  this.update = function() {
    this.backgroundX = Math.floor(Grid.cameraPanX() / this.backgroundWidth) * this.backgroundWidth;
    cameraFollow();
  };
  
  function tileToIndex(col, row) {
    return (col + COLS*row);
  }

  this.isSolidTileTypeAtCoords = function(x, y) {
    return this.tileTypeAtCoords(x, y) != BRICK_SPACE;
  };

  this.tileTypeAtCoords = function(x, y) {
    var col = Math.floor(x / GRID_WIDTH);
    var row = Math.floor(y / GRID_HEIGHT);

    return level[tileToIndex(col, row)];
  };

  this.coordsToTileCoords = function(x, y) {
    var col = Math.floor(x / GRID_WIDTH);
    var row = Math.floor(y / GRID_HEIGHT);

    return {
      x: col * GRID_WIDTH,
      y: row * GRID_HEIGHT
    };
  };

  this.draw = function() {
    gameContext.drawImage(Images.stars, this.backgroundX, 0);
    gameContext.drawImage(Images.stars, this.backgroundX + this.backgroundWidth, 0);

    var cameraLeftMostCol = Math.floor(camPanX / GRID_WIDTH);
    var cameraRightMostCol = cameraLeftMostCol + colsThatFitOnScreen + 2;

    var i = 0, x = 0, y = 0;
    for (var r = 0; r < ROWS; r++) {
      x = cameraLeftMostCol * GRID_WIDTH;
      i = tileToIndex(cameraLeftMostCol, r);
      for (var c = cameraLeftMostCol; c < cameraRightMostCol; c++) {
        if (level[i] != undefined) {
          if (level[i] == SIMPLE_ENEMY) {
            level[i] = BRICK_SPACE;
            EnemyList.push(new SimpleEnemy(x, y));
          }
          else if (bricks[level[i]]) {
            gameContext.drawImage(bricks[level[i]], x, y);
          }
        }
        i++;
        x += GRID_WIDTH;
      }
      y += GRID_HEIGHT;
    }
  };

  function cameraFollow() {
    var shipCoords = Ship.coords();
    if (shipCoords.x > camPanX + canvasHalfWidth - PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X) {
      camPanX += Ship.speedX;
    }

    if (camPanX < 0) {
      camPanX = 0;
    }
    var maxPanRight = COLS * GRID_WIDTH - gameCanvas.width;
    if (camPanX > maxPanRight) {
      camPanX = maxPanRight;
    }
  }

  this.cameraPanX = function() {
    return camPanX;
  };
})();

const BRICK_SPACE = 0;
const BRICK_TOP1 = 1;
const BRICK_TOP2 = 2;
const BRICK_BOTTOM1 = 3;
const BRICK_BOTTOM2 = 4;

const SIMPLE_ENEMY = 6;

var level1 = {
  cols: 80,
  rows: 15,
  map: [
  //0                   1                   2                   3                 3 4                   5                   6                   7                 7
  //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
    1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
    0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
    3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,4,3,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,3,3,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4
  ]
};
