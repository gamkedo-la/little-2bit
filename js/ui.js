var UI = new (function() {
  this.height = 60;
  this.sound = false;

  var mouseX, mouseY;

  var backgroundX = 0;

  var soundButton;
  var projectileImg;
  var center = {};

  this.toggleSound = function() {
    UI.sound = !UI.sound;
  };

  this.initialize = function() {
    this.height = uiCanvas.height;
    center.x = uiCanvas.width / 2;
    center.y = uiCanvas.height / 2;

    soundButton = new UIButton(uiCanvas.width - 20, uiCanvas.height / 2, Images.button_sound_on, Images.button_sound_off, UI.toggleSound);

    uiCanvas.addEventListener('mouseup', mouseReleased);
  };

  function mouseReleased(event) {
    var rect = uiCanvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = event.clientX - rect.left - root.scrollLeft;
    mouseY = event.clientY - rect.top - root.scrollTop;

    soundButton.checkClick(mouseX, mouseY);
    event.preventDefault();
  }

  this.update = function() {
    backgroundX = Grid.cameraPanX() % Grid.backgroundWidth;

    var projectileClass = Ship.currentProjectile();
    if (projectileClass) {
      var imageName = PROJECTILE_INFO[projectileClass.prototype.constructor.name].uiImageName;
      projectileImg = Images[imageName];
    }
  };

  this.clear = function() {
    uiContext.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
  };

  this.draw = function() {
    uiContext.drawImage(Images.stars, -backgroundX, 0);
    uiContext.drawImage(Images.stars, -backgroundX + Grid.backgroundWidth, 0);

    uiContext.font = gameFontSmall;
    drawText(uiContext, 25, 25, '#fff', 'Journey of Little 2bit  (Level ' + (Grid.loadedLevelId + 1) + ')');

    soundButton.draw(this.sound);

    // Projectile
    drawText(uiContext, 25, 45, '#fff', 'Weapon');
    if (projectileImg) {
      uiContext.drawImage(projectileImg, 115, 25);
    }

    // Health-bar
    drawText(uiContext, 165, 45, '#fff', 'Health');
    var c;
    for (var h = 0; h < MAXHEALTH; h++) {
      c = '#ccc';
      if (h < Ship.health) {
        c = '#f00';
      }
      drawFillRect(uiContext, 245 + h * 10, 32, 8, 13, c);
    }

    // Lives-bar
    for (var l = 0; l < Ship.lives; l++) {
      drawText(uiContext, 455, 45, '#fff', 'Lives');
      drawBitmapCenteredWithRotation(uiContext, Images.ui_heart, 520 + l * Images.ui_heart.width + 5, 38);
    }
  };
})();

var UIButton = function(x, y, img_on, img_off, toggleCallback) {
  var width = img_on.width;
  var height = img_on.height;
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  this.checkClick = function(mouseX, mouseY) {
    if (this.hover(mouseX, mouseY)) {
      toggleCallback();
    }
  };

  this.hover = function(mouseX, mouseY) {
    return (x + halfWidth > mouseX && mouseX > x - halfWidth &&
    y + halfHeight > mouseY && mouseY > y - halfHeight);
  };

  this.draw = function(state) {
    if (state) {
      drawBitmapCenteredWithRotation(uiContext, img_on, x, y, 0);
    }
    else {
      drawBitmapCenteredWithRotation(uiContext, img_off, x, y, 0);
    }
  };
};
