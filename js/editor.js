var mouseCoords = {};

var Editor = new (function() {
  var editor = this;

  var tileKeysMapping = [];
  var tileImages = [];
  var outputCode;

  this.initialize = function() {
    tileKeysMapping[KEY_T] = [BRICK_DEFSTYLE, BRICK_ALTSTYLE];
    tileKeysMapping[KEY_G] = [ENEMY_SIMPLE, ENEMY_SHOOTING];
    tileKeysMapping[KEY_H] = [ENEMY_ADVANCED1, ENEMY_ADVANCED2/*, ENEMY_ADVANCED3*/];
    tileKeysMapping[KEY_J] = [ENEMY_TURRET_SIMPLE, ENEMY_TURRET_ADVANCED];
    tileKeysMapping[KEY_Y] = [POWERUP_DOUBLE_LASER, POWERUP_TRIPLE_LASER];
    tileKeysMapping[KEY_U] = [POWERUP_ROCKET, POWERUP_DOUBLE_ROCKET, POWERUP_HOMING_ROCKET];
    tileKeysMapping[KEY_I] = [POWERUP_SHIELD];

    tileImages[ENEMY_SIMPLE] = [Images.simple_enemy];
    tileImages[ENEMY_SHOOTING] = [Images.shooting_enemy, 70, 60];
    tileImages[ENEMY_ADVANCED1] = [Images.advanced_enemy1];
    tileImages[ENEMY_ADVANCED2] = [Images.advanced_enemy2];
//  tileImages[ENEMY_ADVANCED3] = [Images.advanced_enemy3];
    tileImages[ENEMY_TURRET_SIMPLE] = [Images.simple_turret];
    tileImages[ENEMY_TURRET_ADVANCED] = [Images.advanced_turret_body];

    tileImages[POWERUP_ROCKET] = [Images.powerUp_rocket];
    tileImages[POWERUP_DOUBLE_ROCKET] = [Images.powerUp_double_rocket];
    tileImages[POWERUP_HOMING_ROCKET] = [Images.powerUp_homing_rocket];
    tileImages[POWERUP_DOUBLE_LASER] = [Images.powerUp_double_laser];
    tileImages[POWERUP_TRIPLE_LASER] = [Images.powerUp_triple_laser];
    tileImages[POWERUP_SHIELD] = [Images.powerUp_shield];

    outputCode = document.createElement('textarea');
    outputCode.style.width = '95%';
    outputCode.rows = 20;
    outputCode.style.display = 'none';
    document.body.appendChild(outputCode);
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
    outputCode.value = 'levels[1] = ' + JSON.stringify(Grid.loadedLevel) + ';';
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
          // @todo append column to level
          // @todo clear level?
          // @todo output level code
      }
    }
  };

  this.resetLevel = function() {
    Grid.addCameraPanX(-Grid.cameraPanX());
    Ship.reset();
    EnemyList.clear();
    PowerUpList.clear();
    Grid.reloadLevel();
  };

  this.placeTile = function(type) {
    Grid.setTile(mouseCoords.x + Grid.cameraPanX(), mouseCoords.y, type);

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
