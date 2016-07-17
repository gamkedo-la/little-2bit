var UI = new (function(){
  this.height = 60;

  var center = {};

  this.initialize = function(){
    center.x = gameCanvas.width / 2;
    center.y = gameCanvas.height / 2;
  };
  this.update = function(){};
  this.draw = function(){
    drawBitmapCenteredWithRotation(gameContext, Images.corners, center.x,center.y);
  };
})();
