var UI = new (function() {
  this.height = 60;
  this.sound = true;

  var mouseX, mouseY;

  var soundButton;
  var projectileImg;
  var center = {};

  this.score = 0;
  var countingToScore = 0;
  var tweenCurrent = {
    score: this.score
  };
  var tweenUpdate = function() {
    UI.score = Math.round(tweenCurrent.score);
  };

  var easing = TWEEN.Easing.Quadratic.InOut;
  var tweenAdd = new TWEEN.Tween(tweenCurrent)
    .easing(easing)
    .onUpdate(tweenUpdate);

  this.addScore = function(amount) {
    countingToScore += amount;
    tweenAdd.stop().to({score: countingToScore}, 800).start();
  };

  this.resetScore = function() {
    this.score = 0;
  };

  this.toggleSound = function() {
    UI.sound = !UI.sound;
    Menu.toggleMusic(UI.sound);
  };

  this.initialize = function() {
    this.height = uiCanvas.height;
    center.x = uiCanvas.width / 2;
    center.y = uiCanvas.height / 2;

    soundButton = new UIButton(uiCanvas.width - 20, uiCanvas.height / 2, Images.button_sound_on, Images.button_sound_off, UI.toggleSound);

	  drawCanvas.addEventListener('mouseup', mouseReleased);
  };

  function mouseReleased(event) {
    var rect = drawCanvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = (event.clientX - rect.left - root.scrollLeft) / drawScale;
    mouseY = (event.clientY - rect.top - root.scrollTop) / drawScale;

    soundButton.checkClick(mouseX, mouseY);
    event.preventDefault();
  }

  this.update = function() {
    var projectileClass = Ship.currentProjectile();
    if (projectileClass) {
      var imageName = PROJECTILE_INFO[projectileClass.prototype.constructor.name].uiImageName;
      projectileImg = Images[imageName];
    }
  };

  this.draw = function() {
    soundButton.draw(this.sound);

    if (Menu.active) {
      drawGameTitle();
      return;
    }

    uiContext.font = gameFontSmall;
    drawText(uiContext, 25, 25, '#fff', 'Level');
    uiContext.textAlign = 'right';
    drawText(uiContext, 150, 25, '#fff', (Grid.loadedLevelId + 1));
    uiContext.textAlign = 'left';

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
      drawBitmapCenteredWithRotation(uiContext, Images.ui_life, 245 + l * Images.ui_life.width + 5, 18);
    }

    // Score
    drawText(uiContext, 460, 25, '#fff', 'Score');
    drawText(uiContext, 525, 25, '#fff', padLeft(this.score, 6, '0'));

    // Boss health
    var boss = EnemyList.getBoss();
    if (boss) {
      drawText(uiContext, 460, 45, '#fff', 'Boss');
      this.drawHealthBar(515, 32, boss.maxHealth, boss.health);
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
  };

  var titleShadows = [
    {
      offsetX: 0,
      offsetY: 1,
      blur: 0,
      color: '#ccc'
    },
    {
      offsetX: 0,
      offsetY: 2,
      blur: 0,
      color: '#c9c9c9'
    },
    {
      offsetX: 0,
      offsetY: 3,
      blur: 0,
      color: '#bbb'
    },
    {
      offsetX: 0,
      offsetY: 4,
      blur: 0,
      color: '#b9b9b9'
    },
    {
      offsetX: 0,
      offsetY: 5,
      blur: 0,
      color: '#aaa'
    }
  ];

  function drawGameTitle() {
    uiContext.font = gameFont;
    uiContext.textAlign = 'center';
    uiContext.textBaseline = 'middle';

    for (var s = 0; s < titleShadows.length; s++) {
      var shadow = titleShadows[s];

      uiContext.shadowColor = shadow.color;
      uiContext.shadowOffsetX = shadow.offsetX;
      uiContext.shadowOffsetY = shadow.offsetY;
      uiContext.shadowBlur = shadow.blur;
      drawText(uiContext, uiCanvas.width / 2, 25, '#fff', 'Journey of Little 2-bit');
    }

    uiContext.shadowColor = 'transparent';
    uiContext.shadowBlur = 0;
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
