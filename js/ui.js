var UI = new (function() {
  this.height = 60;
  this.sound = true;

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

    var imageName = PROJECTILE_INFO[Ship.currentProjectile().prototype.constructor.name].uiImageName;
    projectileImg = Images[imageName];
  };

  this.draw = function() {
    uiContext.drawImage(Images.stars, -backgroundX, 0);
    uiContext.drawImage(Images.stars, -backgroundX + Grid.backgroundWidth, 0);

    uiContext.font = gameFontSmall;
    drawText(uiContext, 25, 25, '#fff', 'Journey of Little 2bit');

    // Health-bar
    drawText(uiContext, 25, 45, '#fff', 'Health');
    for (var h = 0; h < MAXHEALTH; h++) {
      if (h < Ship.health) {
        drawFillRect(uiContext, 100 + h * 10, 32, 8, 13, '#f00');
      }
      else {
        drawFillRect(uiContext, 100 + h * 10, 32, 8, 13, '#ccc');
      }
    }

    if (projectileImg) {
      drawText(uiContext, 325, 45, '#fff', 'Weapon');
      uiContext.drawImage(projectileImg, 415, 25);
    }

    soundButton.draw(this.sound);
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
