var Grid = new (function() {
  const WIDTH = 40;
  const HEIGHT = 40;
  var COLS = 20;
  var ROWS = 15;
  var level;
  var bricks = [];

  var canvasHalfWidth;
  var colsThatFitOnScreen;

  var camPanX;
  var backgroundX;
  var backgroundWidth;

  const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X = 50;

  this.initialize = function() {
    canvasHalfWidth = gameCanvas.width / 2;
    colsThatFitOnScreen = Math.floor(gameCanvas.width / WIDTH);
    camPanX = 0.0;

    bricks = [
      false, // black space
      Images.top1,
      Images.top2,
      Images.bottom1,
      Images.bottom2
    ];
    backgroundWidth = Images.stars.width;

    // @todo dynamic load level
    COLS = level1.cols;
    ROWS = level1.rows;
    level = level1.map;
  };

  this.levelInfo = function() {
    return {
      cols: COLS,
      rows: ROWS,
      width: COLS*WIDTH,
      height: ROWS*HEIGHT,
      leftBound: camPanX,
      rightBound: camPanX + gameCanvas.width
    };
  };

  this.update = function() {
    backgroundX = Math.floor(Grid.cameraPanX() / backgroundWidth) * backgroundWidth;
    cameraFollow();
  };
  
  function tileToIndex(col, row) {
    return (col + COLS*row);
  }

  this.draw = function() {
    gameContext.drawImage(Images.stars, backgroundX, 0);
    gameContext.drawImage(Images.stars, backgroundX + backgroundWidth, 0);

    var cameraLeftMostCol = Math.floor(camPanX / WIDTH);
    var cameraRightMostCol = cameraLeftMostCol + colsThatFitOnScreen + 2;

    var i = 0, x = 0, y = 0;
    for(var r = 0; r < ROWS; r++) {
      x = cameraLeftMostCol * WIDTH;
      i = tileToIndex(cameraLeftMostCol, r);
      for(var c = cameraLeftMostCol; c < cameraRightMostCol; c++) {
        if (level[i] != undefined && bricks[level[i]]) {
          gameContext.drawImage(bricks[level[i]], x, y);
        }
        i++;
        x += WIDTH;
      }
      y += HEIGHT;
    }
  };

  function cameraFollow() {
    var shipCoords = Ship.coords();
    var cameraFocusCenterX = camPanX + canvasHalfWidth;

    var playerDistFromCameraFocusX = Math.abs(shipCoords.x - cameraFocusCenterX);
    if (playerDistFromCameraFocusX > PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X) {
      if (cameraFocusCenterX < shipCoords.x)  {
        camPanX += Ship.speed;
      } else {
        camPanX -= Ship.speed;
      }
    }

    if (camPanX < 0) {
      camPanX = 0;
    }
    var maxPanRight = COLS * WIDTH - gameCanvas.width;
    if (camPanX > maxPanRight) {
      camPanX = maxPanRight;
    }
  }

  this.cameraPanX = function() {
    return camPanX;
  };
})();

var level1 = {
  cols: 80,
  rows: 15,
  map: [
  //0                   1                   2                   3                 3 4                   5                   6                   7                 7
  //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
    1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,1,2,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,4,3,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4,3,3,3,3,3,3,3,3,3,3,4,4,3,4,4,3,3,3,4,4,4,4
  ]
};
