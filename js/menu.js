var Menu = new (function() {
  this.active = false;

  var buttons = [];
  var mouseX, mouseY;
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

    Menu.activate();
  };

  this.activate = function() {
    if (gameInterval) {
      clearInterval(gameInterval);
      gameInterval = undefined;
    }

    gameCanvas.addEventListener('mousemove', mouseMove);
    gameCanvas.addEventListener('mouseup', mouseReleased);
    document.addEventListener('keydown', keyDown);

    Menu.active = true;
    MenuCredits.clear();

    if (!music) {
      music = new Audio('mus/title' + Sounds.audioFormat);
      music.loop = true;
    }
    this.toggleMusic(UI.sound);

    if (!menuLoop) {
      menuLoop = setInterval(draw, 1000 / menuFps);
    }
  };

  this.deactivate = function() {
    Menu.active = false;
    gameCanvas.removeEventListener('mousemove', mouseMove);
    gameCanvas.removeEventListener('mouseup', mouseReleased);
    document.removeEventListener('keydown', keyDown);
    this.toggleMusic(false);

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

  function mouseMove(event) {
    var rect = gameCanvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = event.clientX - rect.left - root.scrollLeft;
    mouseY = event.clientY - rect.top - root.scrollTop;
  }

  function mouseReleased() {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].checkClick()) {
        mouseX = mouseY = 0;
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
      return x + width > mouseX && mouseX > x &&
        y + heightOffset > mouseY && mouseY > y - height + heightOffset;
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
