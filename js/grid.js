const CAMERA_SPEED = 4;
const GRID_WIDTH = 40;
const GRID_HEIGHT = 40;

var Grid = new (function() {
  var COLS = 20;
  var ROWS = 15;

  var loadedLevel;
  var level;
  var editorLevel;
  var tilemap;
  var levelPrettyTileGrid;

  var canvasHalfWidth;
  var colsThatFitOnScreen;

  var camPanX;
  this.backgroundX = 0;
  this.backgroundWidth = 0;
  this.keyHeld_E = false;

  const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X = 100;

  this.initialize = function() {
    canvasHalfWidth = gameCanvas.width / 2;
    colsThatFitOnScreen = Math.floor(gameCanvas.width / GRID_WIDTH);
    camPanX = 0.0;

    this.backgroundWidth = Images.stars.width;
    initArtMaskLookup();

    // @todo dynamic load level
    this.loadLevel(level1);
  };

  this.reloadLevel = function() {
    this.loadLevel(loadedLevel);
  };

  this.loadLevel = function(_level) {
    loadedLevel = _level;
    COLS = _level.cols;
    ROWS = _level.rows;
    tilemap = Images[_level.tilemap];
    level = _level.map.slice(); // Copy just the values, not a reference
    editorLevel = _level.map;

    this.processGrid();
  };

  this.processGrid = function() {
    levelPrettyTileGrid = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var i = tileToIndex(c, r);

        // adjacency around a given title is labelled like:
        // QWE
        // ASD // for describing adjacency around tile at position S
        // ZXC

        var bitMask = 0;
        var directTouchCount = 0;
        var cornerCount = 0;
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c - 1, r - 1)) { // Q
          bitMask |= maskShiftLookup[SHL_Q];
          cornerCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c, r - 1)) { // W
          bitMask |= maskShiftLookup[SHL_W];
          directTouchCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c + 1, r - 1)) { // E
          bitMask |= maskShiftLookup[SHL_E];
          cornerCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c - 1, r)) { // A
          bitMask |= maskShiftLookup[SHL_A];
          directTouchCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c, r)) { // S
          bitMask |= maskShiftLookup[SHL_S];
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c + 1, r)) { // D
          bitMask |= maskShiftLookup[SHL_D];
          directTouchCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c - 1, r + 1)) { // Z
          bitMask |= maskShiftLookup[SHL_Z];
          cornerCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c, r + 1)) { // X
          bitMask |= maskShiftLookup[SHL_X];
          directTouchCount++;
        }
        if (this.isSolidTileTypeAtCR_WithBoundsSafety(c + 1, r + 1)) { // C
          bitMask |= maskShiftLookup[SHL_C];
          cornerCount++;
        }

        if ((bitMask & maskShiftLookup[SHL_S]) != 0) {
          if (tilemaskToArtIdx[bitMask] != undefined) {
            levelPrettyTileGrid[i] = tilemaskToArtIdx[bitMask];
          }
          else if (directTouchCount == 4) {
            if (cornerCount > 0) {
              levelPrettyTileGrid[i] = TILE_QWEASDZXC;
            }
            else {
              levelPrettyTileGrid[i] = TILE_WASDX;
            }
          }
          else if (directTouchCount == 3) {
            if ((bitMask & maskShiftLookup[SHL_W]) == 0) {
              levelPrettyTileGrid[i] = TILE_ASDX;
            }
            else if ((bitMask & maskShiftLookup[SHL_A]) == 0) {
              levelPrettyTileGrid[i] = TILE_WSDX;
            }
            else if ((bitMask & maskShiftLookup[SHL_D]) == 0) {
              levelPrettyTileGrid[i] = TILE_WASX;
            }
            else /* if((bitMask & maskShiftLookup[SHL_X]) == 0) */ {
              levelPrettyTileGrid[i] = TILE_WASD;
            }
          }
          else if (directTouchCount == 2) {
            if ((bitMask & maskShiftLookup[SHL_A]) != 0 && (bitMask & maskShiftLookup[SHL_D]) != 0) {
              levelPrettyTileGrid[i] = TILE_ASD;
            }
            else if ((bitMask & maskShiftLookup[SHL_W]) != 0 && (bitMask & maskShiftLookup[SHL_X]) != 0) {
              levelPrettyTileGrid[i] = TILE_WSX;
            }
            else if ((bitMask & maskShiftLookup[SHL_W]) != 0 && (bitMask & maskShiftLookup[SHL_D]) != 0) {
              levelPrettyTileGrid[i] = TILE_WSD;
            }
            else if ((bitMask & maskShiftLookup[SHL_D]) != 0 && (bitMask & maskShiftLookup[SHL_X]) != 0) {
              levelPrettyTileGrid[i] = TILE_SDX;
            }
            else if ((bitMask & maskShiftLookup[SHL_A]) != 0 && (bitMask & maskShiftLookup[SHL_X]) != 0) {
              levelPrettyTileGrid[i] = TILE_ASX;
            }
            else if ((bitMask & maskShiftLookup[SHL_A]) != 0 && (bitMask & maskShiftLookup[SHL_W]) != 0) {
              levelPrettyTileGrid[i] = TILE_WAS;
            }
            //levelPrettyTileGrid[i] = TILE_S;
          }
          else if (directTouchCount == 1) {
            if ((bitMask & maskShiftLookup[SHL_W]) != 0) {
              levelPrettyTileGrid[i] = TILE_WS;
            }
            else if ((bitMask & maskShiftLookup[SHL_D]) != 0) {
              levelPrettyTileGrid[i] = TILE_SD;
            }
            else if ((bitMask & maskShiftLookup[SHL_X]) != 0) {
              levelPrettyTileGrid[i] = TILE_SX;
            }
            else if ((bitMask & maskShiftLookup[SHL_A]) != 0) {
              levelPrettyTileGrid[i] = TILE_AS;
            }
          }
          else /* if(directTouchCount == 0) */ {
            levelPrettyTileGrid[i] = TILE_S;
          }

          if (level[i] == BRICK_ALTSTYLE) {
            levelPrettyTileGrid[i] += PRETTY_TILE_ART_COLS * PRETTY_TILE_ART_ROWS_PER_STYLE;
          }
        }
        else {
          levelPrettyTileGrid[i] = undefined; // skip
        }
      }
    }
  };

  this.levelInfo = function() {
    return {
      cols: COLS,
      rows: ROWS,
      width: COLS * GRID_WIDTH,
      height: ROWS * GRID_HEIGHT,
      leftBound: camPanX,
      rightBound: camPanX + gameCanvas.width
    };
  };

  this.cameraSpeed = function() {
    if (debug_stop_camera) {
      return 0;
    }

    // @todo check if a boss is active
    var maxPanRight = COLS * GRID_WIDTH - gameCanvas.width;
    if (camPanX >= maxPanRight) {
      return 0;
    }
    return CAMERA_SPEED;
  };

  this.update = function() {
    if (!Ship.isDead) {
      camPanX += this.cameraSpeed();
      this.backgroundX = Math.floor(Grid.cameraPanX() / this.backgroundWidth) * this.backgroundWidth;
      cameraFollow(this.keyHeld_E);
    }
  };

  function tileToIndex(col, row) {
    return (col + COLS * row);
  }

  function coordsToIndex(x, y) {
    var col = Math.floor(x / GRID_WIDTH);
    var row = Math.floor(y / GRID_HEIGHT);

    return (col + COLS * row);
  }

  this.isSolidTileTypeAtCR_WithBoundsSafety = function(col, row) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) {
      return true; // treat out of bounds as solid
    }
    var type = level[tileToIndex(col, row)];
    return type != BRICK_SPACE && !EnemyList.brickTypeIsEnemy(type) && !PowerUpList.brickTypeIsPowerUp(type);
  };

  this.isSolidTileTypeAtCoords = function(x, y) {
    var type = this.tileTypeAtCoords(x, y);
    return type != BRICK_SPACE && !EnemyList.brickTypeIsEnemy(type) && !PowerUpList.brickTypeIsPowerUp(type);
  };

  this.tileTypeAtCoords = function(x, y) {
    return level[coordsToIndex(x, y)];
  };

  this.coordsToTileCoords = function(x, y) {
    var col = Math.floor((x + camPanX) / GRID_WIDTH);
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
          if (Editor.hasTileImage(level[i])) {
            Editor.drawTileImage(level[i], x + (GRID_WIDTH / 2), y + (GRID_HEIGHT / 2));
          }
          else if (EnemyList.brickTypeIsEnemy(level[i])) {
            if (!debug_editor) {
              EnemyList.createEnemyByBrickType(level[i], x + (GRID_WIDTH / 2), y + (GRID_HEIGHT / 2));
              level[i] = BRICK_SPACE;
            }
          }
          else if (PowerUpList.brickTypeIsPowerUp(level[i])) {
            if (!debug_editor) {
              PowerUpList.createPowerUpByBrickType(level[i], x + (GRID_WIDTH / 2), y + (GRID_HEIGHT / 2));
              level[i] = BRICK_SPACE;
            }
          }
          else if (levelPrettyTileGrid[i] != undefined) {
            var tileArtSourceX = levelPrettyTileGrid[i] % PRETTY_TILE_ART_COLS * GRID_WIDTH;
            var tileArtSourceY = Math.floor(levelPrettyTileGrid[i] / PRETTY_TILE_ART_COLS) * GRID_HEIGHT;
            gameContext.drawImage(tilemap,
                                  tileArtSourceX,tileArtSourceY,
                                  GRID_WIDTH,GRID_HEIGHT,
                                  x, y,
                                  GRID_WIDTH,GRID_HEIGHT);
          }
        }
        if (debug_draw_bounds) {
          if (r == ROWS - 1) {
            drawLines(gameContext, '#fff', [
              { x: x, y: 0 },
              { x: x, y: gameCanvas.height }
            ]);
          }
        }

        i++;
        x += GRID_WIDTH;
      }
      if (debug_draw_bounds) {
        drawLines(gameContext, '#fff', [
          { x: x, y: y },
          { x: cameraRightMostCol, y: y }
        ]);
      }
      y += GRID_HEIGHT;
    }
  };

  function cameraFollow(keyHeld_E) {
    var shipCoords = Ship.coords();
    if (keyHeld_E && shipCoords.x > camPanX + canvasHalfWidth - PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X) {
      this.addCameraPanX(Ship.speedX / 2);
    }
  }

  this.cameraPanX = function() {
    return camPanX;
  };

  this.addCameraPanX = function(v) {
    camPanX += v;

    if (camPanX < 0) {
      camPanX = 0;
    }
    var maxPanRight = COLS * GRID_WIDTH - gameCanvas.width;
    if (camPanX > maxPanRight) {
      camPanX = maxPanRight;
    }
  };

  this.setTile = function(x, y, type) {
    var index = coordsToIndex(x, y);
    if (loadedLevel.map[index] != type) {
      loadedLevel.map[index] = type;
    }
    else {
      loadedLevel.map[index] = BRICK_SPACE;
    }
    this.reloadLevel();
  };
})();

const BRICK_SPACE = 0;
const BRICK_DEFSTYLE = 1; // these will be automatically converted into different tile segments during level start
const BRICK_ALTSTYLE = 2;

const ENEMY_SIMPLE = 6;
const ENEMY_SHOOTING = 7;
const ENEMY_ADVANCED1 = 8;
const ENEMY_ADVANCED2 = 9;
const ENEMY_ADVANCED3 = 10;
const ENEMY_TURRET_SIMPLE = 11;
const ENEMY_TURRET_ADVANCED = 12;

const POWERUP_ROCKET = 20;
const POWERUP_DOUBLE_ROCKET = 21;
const POWERUP_HOMING_ROCKET = 22;
const POWERUP_DOUBLE_LASER = 23;
const POWERUP_TRIPLE_LASER = 24;
const POWERUP_SHIELD = 25;

var level1 = {
  cols: 80,
  rows: 15,
  tilemap: 'tilemap_demo',
  map: [
  //0                   1                   2                   3                   4                   5                   6                   7                 7
  //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
    1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    0,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,2,0,0,0,0,0,1,1,1,0,0,0,0,0,0,2,2,8,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,1,
    0,0,0,0,0,2,0,2,0,0,0,0,0,1,1,1,1,0,1,0,2,2,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,1,
    0,0,0,0,0,2,2,2,0,0,9,0,0,0,0,0,0,0,0,0,2,2,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,7,0,2,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,24,0,1,1,1,0,2,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,0,0,1,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,6,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,0,1,0,0,0,20,0,0,0,2,0,0,0,0,0,1,1,1,1,2,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,1,
    0,0,0,0,1,1,1,0,0,21,0,0,0,2,2,0,0,0,0,1,0,1,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,1,
    0,0,0,0,1,0,1,0,0,0,2,2,2,2,2,0,0,22,0,1,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    0,0,0,0,1,0,1,0,0,0,0,0,2,0,0,0,0,0,11,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ]
};
