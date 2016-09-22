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
    drawText(uiContext, 25, 25, '#fff', 'Level');
    uiContext.textAlign = 'right';
    drawText(uiContext, 150, 25, '#fff', (Grid.loadedLevelId + 1));
    uiContext.textAlign = 'left';

    soundButton.draw(this.sound);

    // Projectile
    drawText(uiContext, 25, 45, '#fff', 'Weapon');
    if (projectileImg) {
      uiContext.drawImage(projectileImg, 115, 25);
    }

    // Health-bar
    drawText(uiContext, 165, 45, '#fff', 'Health');
    this.drawHealthBar(245, 32, MAXHEALTH, Ship.health);

    // Lives-bar
    drawText(uiContext, 165, 25, '#fff', 'Lives');
    for (var l = 0; l < Ship.lives; l++) {
      drawBitmapCenteredWithRotation(uiContext, Images.ui_heart, 245 + l * Images.ui_heart.width + 5, 18);
    }

    // Boss health
    var boss = EnemyList.getBoss();
    if (boss) {
      drawText(uiContext, 460, 45, '#fff', 'Boss');
      this.drawHealthBar(515, 32, boss.maxHealth, boss.health);
      console.log('boss', boss.maxHealth, boss.health);
    }
  };

  this.drawHealthBar = function(x, y, total, health) {
    var c, currentHealth = (MAXHEALTH / total) * health;
    for (var h = 0; h < MAXHEALTH; h++) {
      c = '#ccc';
      if (h < currentHealth) {
        c = '#f00';
      }
      drawFillRect(uiContext, x + h * 10, y, 8, 13, c);
    }
  }
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
