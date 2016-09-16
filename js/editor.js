var mouseCoords = {};

var Editor = new (function() {
  var editor = this;

  var tileKeysMapping = [];
  var tileImages = [];
  var outputCode;

  this.initialize = function() {
    tileKeysMapping[KEY_T] = [BRICK_DEFSTYLE, BRICK_ALTSTYLE];
    tileKeysMapping[KEY_G] = [ENEMY_SIMPLE, ENEMY_SHOOTING];
    tileKeysMapping[KEY_H] = [ENEMY_ADVANCED1, ENEMY_ADVANCED2, ENEMY_ADVANCED3];
    tileKeysMapping[KEY_J] = [ENEMY_TURRET_SIMPLE, ENEMY_TURRET_ADVANCED];
    tileKeysMapping[KEY_Y] = [POWERUP_LASER, POWERUP_DOUBLE_LASER, POWERUP_TRIPLE_LASER];
    tileKeysMapping[KEY_U] = [POWERUP_ROCKET, POWERUP_DOUBLE_ROCKET, POWERUP_HOMING_ROCKET];
    tileKeysMapping[KEY_I] = [POWERUP_SHIELD, POWERUP_HEALTH, POWERUP_LIFE];
    tileKeysMapping[KEY_K] = [BOSS_1, BOSS_2, BOSS_3];

    tileImages[ENEMY_SIMPLE] = [Images.simple_enemy];
    tileImages[ENEMY_SHOOTING] = [Images.shooting_enemy, 70, 60];
    tileImages[ENEMY_ADVANCED1] = [Images.advanced_enemy1];
    tileImages[ENEMY_ADVANCED2] = [Images.advanced_enemy2];
    tileImages[ENEMY_ADVANCED3] = [Images.advanced_enemy3];
    tileImages[ENEMY_TURRET_SIMPLE] = [Images.simple_turret];
    tileImages[ENEMY_TURRET_ADVANCED] = [Images.advanced_turret_body];

    tileImages[BOSS_1] = [Images.boss1];
    tileImages[BOSS_2] = [Images.boss2];
    tileImages[BOSS_3] = [Images.boss3];

    tileImages[POWERUP_LASER] = [Images.powerUp_laser];
    tileImages[POWERUP_ROCKET] = [Images.powerUp_rocket];
    tileImages[POWERUP_DOUBLE_ROCKET] = [Images.powerUp_double_rocket];
    tileImages[POWERUP_HOMING_ROCKET] = [Images.powerUp_homing_rocket];
    tileImages[POWERUP_DOUBLE_LASER] = [Images.powerUp_double_laser];
    tileImages[POWERUP_TRIPLE_LASER] = [Images.powerUp_triple_laser];
    tileImages[POWERUP_SHIELD] = [Images.powerUp_shield];
    tileImages[POWERUP_HEALTH] = [Images.powerUp_health];
    tileImages[POWERUP_LIFE] = [Images.powerUp_life];

    outputCode = document.createElement('textarea');
    outputCode.style.width = '95%';
    outputCode.rows = 10;
    outputCode.style.display = 'none';
    document.body.appendChild(outputCode);

    console.log('Keys for the level editor:');
    console.table({
      0: 'Clear level',
      a: 'Move left',
      d: 'Move right',
      n: 'Append column', // adds new column to end of level
      m: 'Remove last column', // can shorten the level or remove columns
      t: 'Tiles: default, alternative style', // hit t twice to switch to
      // other tiles
      g: 'Enemy: Simple, shooting', // simple enemy - moves, doesn't shoot,
      // shooting enemy does both
      h: 'Enemy: Advanced 1, advanced 2, advanced 3', // advanced 1 - five yellow
      // enemies that move in wave, advanced 2 - tracks the player and
      // explodes when in proximity, advanced 3 - hides behind wall tile and
      // moves up or down when the player gets near
      j: 'Enemy: Simple turret, advanced turret', // simple turret -
      // attaches to wall, shoots
      // one direction, advanced turret - attachs to wall, always shoot at the
      // player
      y: 'Power up: laser, double laser, triple laser', // laser - default weapon
      // double laser - gives player ship two laser weapons, shoots straight
      // forward, triple laser - shotgun blast blaster with three beams
      u: 'Power up: rocket, double rocket, homing rocket', //
      i: 'Powerups: shield' // simple shield powerup for the player ship,
      // shield has 5 HP, 10
      // hits enemy weapons, 3 collisions with enemy ships negates shield,
      // otherwise collisions with walls is instakill, for now.
    });
  };

  this.toggle = function() {
    debug_editor = debug_stop_camera = debug_stop_enemies = !debug_editor;

    if (debug_editor) {
      document.addEventListener('keyup', this.keyUp);
      document.addEventListener('keydown', this.keyDown);
      document.addEventListener('mousemove', this.mouseMove);
      this.outputLevelCode();
    }
    else {
      document.removeEventListener('keyup', this.keyUp);
      document.removeEventListener('keydown', this.keyDown);
      document.removeEventListener('mousemove', this.mouseMove);
      outputCode.style.display = 'none';
    }

    this.resetLevel();
  };

  this.outputLevelCode = function() {
    outputCode.style.display = 'block';
    outputCode.value = JSON.stringify(Grid.loadedLevel);
  };

  this.mouseMove = function(event) {
    var rect = gameCanvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseCoords = {
      x: event.clientX - rect.left - root.scrollLeft,
      y: event.clientY - rect.top - root.scrollTop
    };
  };

  var keyDown_D = false;
  var keyDown_A = false;

  this.keyDown = function(event) {
    switch (event.keyCode) {
      case KEY_D:
        keyDown_D = true;
        break;
      case KEY_A:
        keyDown_A = true;
        break;
    }
  };

  this.keyUp = function(event) {
    event.preventDefault();
    if (tileKeysMapping[event.keyCode]) {
      var existingTile = Grid.tileTypeAtCoords(mouseCoords.x + Grid.cameraPanX(), mouseCoords.y);
      var index = tileKeysMapping[event.keyCode].indexOf(existingTile);
      if (existingTile == BRICK_SPACE || index == -1) {
        index = 0;
      }
      else {
        index++;
        if (index >= tileKeysMapping[event.keyCode].length) {
          index = -1;
        }
      }
      if (index >= 0) {
        editor.placeTile(tileKeysMapping[event.keyCode][index]);
      }
      else {
        editor.placeTile(BRICK_SPACE);
      }
    }
    else {
      switch (event.keyCode) {
        case KEY_R:
          editor.resetLevel();
          break;
        case KEY_D:
          keyDown_D = false;
          break;
        case KEY_A:
          keyDown_A = false;
          break;
        case KEY_N:
          editor.appendColumn();
          break;
        case KEY_M:
          editor.removeLastColumn();
          break;
        case KEY_0:
          if (confirm('Actually clear whole level?')) {
            editor.clearLevel();
          }
          break;
      }
    }
  };

  this.resetLevel = function() {
    Grid.addCameraPanX(-Grid.cameraPanX());
    Ship.reset();
    EnemyList.clear();
    PowerUpList.clear();
    Grid.loadLevel(JSON.parse(outputCode.value));
  };

  this.appendColumn = function() {
    var index = 0;
    var cols = Grid.loadedLevel.cols;
    Grid.loadedLevel.cols++;

    for (var i = Grid.loadedLevel.rows; i > 0; i--) {
      index = i * cols;
      Grid.loadedLevel.map.splice(index, 0, BRICK_SPACE);
    }

    Grid.refreshLevel();
    this.outputLevelCode();
  };

  this.removeLastColumn = function() {
    var index = 0;
    var cols = Grid.loadedLevel.cols;
    if (Grid.loadedLevel.cols <= GRID_MIN_COLS) {
      alert('Cannot remove any more columns');
      return;
    }

    Grid.loadedLevel.cols--;

    for (var i = Grid.loadedLevel.rows; i >= 0; i--) {
      index = cols + i * cols - 1;
      Grid.loadedLevel.map.splice(index, 1);
    }

    Grid.refreshLevel();
    this.outputLevelCode();
    Grid.addCameraPanX(0);
  };

  this.clearLevel = function() {
    for (var r = 0; r < Grid.loadedLevel.map.length; r++) {
      Grid.loadedLevel.map[r] = BRICK_SPACE;
    }

    Grid.refreshLevel();
    this.outputLevelCode();
  };

  this.placeTile = function(type) {
    var index = Grid.coordsToIndex(mouseCoords.x + Grid.cameraPanX(), mouseCoords.y);
    Grid.loadedLevel.map[index] = type;
    Grid.refreshLevel();

    this.outputLevelCode();
  };

  this.update = function() {
    if (keyDown_D) {
      Grid.addCameraPanX(CAMERA_SPEED*2);
    }
    else if (keyDown_A) {
      Grid.addCameraPanX(-CAMERA_SPEED*2);
    }
  };

  this.draw = function() {
    if (!debug_editor) {
      return;
    }

    var cell = Grid.coordsToTileCoords(mouseCoords.x, mouseCoords.y);
    drawStrokeRect(gameContext, cell.x + 1, cell.y + 1, GRID_WIDTH - 2, GRID_HEIGHT - 2, 'white', 2);
    var i = Grid.coordsToIndex(mouseCoords.x + Grid.cameraPanX(), mouseCoords.y);
    gameContext.textAlign = 'center';
    gameContext.textBaseline = 'middle';
    drawText(gameContext, cell.x + GRID_WIDTH / 2, cell.y + GRID_HEIGHT / 2, 'white', i);
  };

  this.hasTileImage = function(type) {
    return (debug_editor && type > 0 && tileImages[type] != undefined);
  };

  this.drawTileImage = function(type, x, y) {
    if (tileImages[type][1]) {
      drawBitmapFrameCenteredWithRotation(gameContext, tileImages[type][0], 0, x, y, tileImages[type][1], tileImages[type][2]);
    }
    else {
      drawBitmapCenteredWithRotation(gameContext, tileImages[type][0], x, y);
    }
  };

})();
