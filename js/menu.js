var Menu = new (function() {
  this.active = false;

  var buttons = [];
  var menuLoop;
  var music;
  var menuFps = 30;
  var starFieldLeftSide = 0;

  var activeButton = undefined;

  this.initialize = function() {
    for (var b = 0; b < levels.length; b++) {
      buttons.push(new MenuButton('Level ' + (b + 1), gameStart.bind(this, b)));
    }

    if (buttons[0]) {
      activeButton = buttons[0];
    }

    if (!music) {
      music = new Audio('mus/title' + Sounds.audioFormat);
      music.loop = true;
    }
    Menu.activate();
  };

  this.activate = function() {
    if (gameInterval) {
      // Stop any screenshake that might still be shakin'
      shakeScreen(0);
      clearInterval(gameInterval);
      gameInterval = undefined;
    }

    drawCanvas.addEventListener('mousemove', calculateMouseCoords);
    drawCanvas.addEventListener('mouseup', mouseReleased);
    document.addEventListener('keydown', keyDown);

    Menu.active = true;
    MenuCredits.clear();
    UI.resetScore();

    this.toggleMusic(UI.sound);

    if (!menuLoop) {
      menuLoop = setInterval(draw, 1000 / menuFps);
    }
  };

  this.deactivate = function() {
    this.toggleMusic(false);
    Menu.active = false;
    drawCanvas.removeEventListener('mousemove', calculateMouseCoords);
    drawCanvas.removeEventListener('mouseup', mouseReleased);
    document.removeEventListener('keydown', keyDown);

    if (menuLoop) {
      clearInterval(menuLoop);
      menuLoop = undefined;
    }
  };

  this.toggleMusic = function(play) {
    if (!Menu.active) {
      return;
    }
    if (play) {
      music.currentTime = 0;
      music.play();
    }
    else {
      music.pause();
    }
  };

  var draw = function() {
    starFieldLeftSide += 2;
    StarfieldList.update(starFieldLeftSide);
    StarfieldList.draw(0);

    gameContext.font = gameFont;
    gameContext.textAlign = 'left';

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].draw();
    }

    MenuCredits.draw();

    UI.update();
    UI.draw();

    redrawCanvas();
  };

  function keyDown(event) {
    switch (event.keyCode) {
      case KEY_UP_ARROW:
      case KEY_W:
        setActiveButton(-1);
        break;
      case KEY_DOWN_ARROW:
      case KEY_S:
        setActiveButton(+1);
        break;
      case KEY_ENTER:
      case KEY_SPACE:
        activeButton.activate();
    }
  }

  function setActiveButton(addIndex) {
    var activeIndex = buttons.indexOf(activeButton);

    activeIndex += addIndex;

    if (activeIndex < 0) {
      activeIndex = buttons.length - 1;
    }
    else if (activeIndex > buttons.length - 1) {
      activeIndex = 0;
    }

    activeButton = buttons[activeIndex];
  }

  function mouseReleased() {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].checkClick()) {
        mouseCoords.x = mouseCoords.y = 0;
        return;
      }
    }
  }

  // Private button class
  var MenuButton = function(text, callback) {
    gameContext.font = gameFont;
    var width = gameContext.measureText(text).width;
    var height = 30;
    var heightOffset = 5;
    var x = 25;
    var y = 50 + buttons.length * (height + heightOffset);

    this.draw = function() {
      var color = fontColor;
      if (this.isActive()) {
        color = fontColorHighlight;
        activeButton = this;
      }

      gameContext.font = gameFont;
      drawText(gameContext, x, y, color, text);
    };

    this.isActive = function() {
      return (this == activeButton) || this.hover();
    };

    this.hover = function() {
      return x + width > mouseCoords.x && mouseCoords.x > x &&
        y + heightOffset > mouseCoords.y && mouseCoords.y > y - height + heightOffset;
    };

    this.activate = function() {
      callback();
    };

    this.checkClick = function() {
      if (this.hover()) {
        this.activate();
        return true;
      }
      return false;
    };

    return this;
  }; // MenuButton

  return this;
})();
