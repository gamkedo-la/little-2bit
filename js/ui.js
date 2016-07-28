var UI = new (function(){
  this.height = 60;

  this.sound = true;

  var mouseX, mouseY;

  var soundButton;
  var center = {};

  this.toggleSound = function() {
    UI.sound = !UI.sound;
  };

  this.initialize = function(){
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

  this.update = function() {};

  this.draw = function() {
    drawFillRect(uiContext, 0, 0, uiCanvas.width, uiCanvas.height, 'black');

    uiContext.font = gameFontSmall;
    drawText(uiContext, 25, 25, '#fff', 'Journey of Little 2bit');

    // Health-bar
    drawFillRect(uiContext, 25, 35, 200, 20, '#fff');
    drawFillRect(uiContext, 25, 35, 200 * Ship.getHealthPercentage(), 20, '#f00');

    soundButton.draw(this.sound);
  };
})();

var UIButton = function(x, y, img_on, img_off, toggleCallback) {
  var width = img_on.width;
  var height = img_on.height;
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  this.checkClick = function() {
    if (this.hover()) {
      toggleCallback();
    }
  };

  this.hover = function() {
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
