var Menu = new (function() {
  this.active = false;

  var buttons = [];
  var mouseX, mouseY;
  var menuLoop;
  var menuFps = 20;

  this.initialize = function() {
    if (gameInterval) {
      clearInterval(gameInterval);
      gameInterval = undefined;
    }

    Menu.active = true;

    gameCanvas.addEventListener('mousemove', mouseMove);
    gameCanvas.addEventListener('mouseup', mouseReleased);

    buttons.push(new MenuButton('Level 1', gameStart));
    buttons.push(new MenuButton('Level 2', gameStart));
    buttons.push(new MenuButton('Level 3', gameStart));
    buttons.push(new MenuButton('Level 4', gameStart));

    MenuCredits.initialize();

    menuLoop = setInterval(draw, 1000/menuFps);
  };

  this.deactive = function() {
    Menu.active = false;
    gameCanvas.removeEventListener('mousemove', mouseMove);
    gameCanvas.removeEventListener('mouseup', mouseReleased);

    if (menuLoop) {
      clearInterval(menuLoop);
      menuLoop = undefined;
    }
  };

  var draw = function() {
    clearCanvas();
    gameContext.font = gameFont;
    gameContext.textAlign = 'left';
    drawText(gameContext, 25,50, fontColorHighlight, 'Journey of little 2bit');

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].draw();
    }

    MenuCredits.draw();
  };

  function mouseMove(event) {
    var rect = gameCanvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = event.clientX - rect.left - root.scrollLeft;
    mouseY = event.clientY - rect.top - root.scrollTop;
  }

  function mouseReleased() {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].checkClick()) {
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
		var y = 100 + buttons.length * (height + heightOffset);

		this.draw = function() {
			var color = fontColor;
			if (this.hover()) {
				color = fontColorHighlight;
			}

			drawText(gameContext, x, y, color, text);
		};

		this.hover = function() {
			return x + width > mouseX && mouseX > x &&
				y+heightOffset > mouseY && mouseY > y-height+heightOffset;
		};

		this.checkClick = function() {
			if (this.hover()) {
				callback();
        return true;
			}
      return false;
		};

		return this;
	}; // MenuButton

  return this;
})();
