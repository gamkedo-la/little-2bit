var UI = new (function(){
  this.height = 60;

  var center = {};

  this.initialize = function(){
    center.x = uiCanvas.width / 2;
    center.y = uiCanvas.height / 2;
  };

  this.update = function(){};

  this.draw = function(){
    uiContext.font = gameFontSmall;
    drawText(uiContext, 25, 25, '#fff', 'Journey of Little 2bit');
  };
})();
