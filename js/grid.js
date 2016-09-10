const CAMERA_SPEED = 4;
const GRID_WIDTH = 40;
const GRID_HEIGHT = 40;
const GRID_MIN_COLS = 20;

var Grid = new (function() {
  var COLS = 20;
  var ROWS = 15;

  this.isReady = false;
  var startTime;
  var startDelay = 500; // milliseconds
  var startCountDown = 4;
  var statusText = '';
  var levelCompleteTime = false;
  var levelCompleteDelay = 4000; // milliseconds

  this.loadedLevelId = undefined;
  this.loadedLevel = undefined;
  var level;
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
  };

  this.refreshLevel = function() {
    this.loadLevel(this.loadedLevel);
  };

  this.nextLevel = function() {
    if (!levels[this.loadedLevelId+1]) {
      MenuCredits.enableVictoryText();
      Menu.activate();
      return;
    }

    this.loadedLevelId++;
    this.loadLevel();
    this.reset();
  };

  this.loadLevelId = function(_levelId) {
    this.loadedLevelId = _levelId;
    this.loadLevel();
  };

  this.loadLevel = function(_level) {
    if (!_level) {
      _level = levels[this.loadedLevelId];
    }
    COLS = _level.cols;
    ROWS = _level.rows;
    tilemap = Images[_level.tilemap];
    level = _level.map.slice(); // Copy just the values, not a reference

    if (!this.loadedLevel) {
      this.reset();
    }
    this.loadedLevel = _level;

    this.processGrid();
  };

  this.reset = function() {
    if (shipProjectiles) {
      EnemyList.clear();
      shipProjectiles.clear();
      enemyProjectiles.clear();
      PowerUpList.clear();
      ParticleList.clear();
    }

    // @todo reset to last respawn position?

    camPanX = this.backgroundX = 0;
    Ship.reset();
    this.isReady = false;

    startTime = Date.now() + startDelay * 2;
    startCountDown = 4;
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
    if (!this.isReady || debug_stop_camera) {
      return 0;
    }

    if (this.isAtEndOfLevel() || EnemyList.hasBoss()) {
      return 0;
    }

    return CAMERA_SPEED;
  };

  this.isAtEndOfLevel = function() {
    var maxPanRight = COLS * GRID_WIDTH - gameCanvas.width;
    return (camPanX >= maxPanRight);
  };

  this.update = function() {
    if (!this.isReady && !levelCompleteTime) {
      if (startTime < Date.now()) {
        startCountDown--;
        startTime = Date.now() + startDelay;
      }
      if (startCountDown == 4) {
        statusText = 'Ready?';
      }
      else if (startCountDown <= 0) {
        statusText = 'Go!';
      }
      else {
        statusText = startCountDown;
      }
      if (startCountDown <= 0) {
        this.isReady = true;
        statusText = '';
      }
    }

    if (this.isReady && !Ship.isDead) {
      camPanX += this.cameraSpeed();
      this.backgroundX = Math.floor(this.cameraPanX() / this.backgroundWidth) * this.backgroundWidth;
      this.cameraFollow(this.keyHeld_E);
    }

    if (!debug_editor && this.isAtEndOfLevel() && EnemyList.isEmpty() && !Ship.isDead) {
      if (!levelCompleteTime) {
        levelCompleteTime = Date.now() + levelCompleteDelay;
        statusText = 'Level complete!';
        this.isReady = false;
        shipProjectiles.clear();
        enemyProjectiles.clear();
      }
      else if (levelCompleteTime <= Date.now()) {
        levelCompleteTime = false;
        this.nextLevel();
      }
    }
  };

  function tileToIndex(col, row) {
    return (col + COLS * row);
  }

  this.coordsToIndex = function(x, y) {
    var col = Math.floor(x / GRID_WIDTH);
    var row = Math.floor(y / GRID_HEIGHT);

    return (col + COLS * row);
  };

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
    return level[this.coordsToIndex(x, y)];
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
    var reProcessGrid = false;
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
              level[i] = EnemyList.createEnemyByBrickType(level[i], x + (GRID_WIDTH / 2), y + (GRID_HEIGHT / 2));
              reProcessGrid = true;
            }
          }
          else if (PowerUpList.brickTypeIsPowerUp(level[i])) {
            if (!debug_editor) {
              PowerUpList.createPowerUpByBrickType(level[i], x + (GRID_WIDTH / 2), y + (GRID_HEIGHT / 2));
              level[i] = BRICK_SPACE;
              reProcessGrid = true;
            }
          }
          else if (levelPrettyTileGrid[i] != undefined) {
            this.drawPrettyGridTile(i, x, y);
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

    if (reProcessGrid) {
      this.processGrid();
    }

    if (!this.isReady && statusText) {
      drawTextHugeCentered(statusText);
    }
  };

  this.drawPrettyGridTile = function(index, x, y) {
    if (levelPrettyTileGrid[index] == undefined) {
      return;
    }

    var tileArtSourceX = levelPrettyTileGrid[index] % PRETTY_TILE_ART_COLS * GRID_WIDTH;
    var tileArtSourceY = Math.floor(levelPrettyTileGrid[index] / PRETTY_TILE_ART_COLS) * GRID_HEIGHT;
    gameContext.drawImage(tilemap,
      tileArtSourceX,tileArtSourceY,
      GRID_WIDTH,GRID_HEIGHT,
      x, y,
      GRID_WIDTH,GRID_HEIGHT);
  };

  this.cameraFollow = function(keyHeld_E) {
    if (EnemyList.hasBoss()) {
      return;
    }

    var shipCoords = Ship.coords();
    if (keyHeld_E && shipCoords.x > camPanX + canvasHalfWidth - PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X) {
      this.addCameraPanX(Ship.speedX / 2);
    }
  };

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
})();
