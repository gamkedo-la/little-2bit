var MenuCredits = new (function() {
  var creditsSeperator = '              ----------            ';
  var title = [
  ];
  var creditsSpacer = [
    '',
    '',
    creditsSeperator,
    '',
    ''
  ];
  var credits = [
    'Spad-XIII -- project lead',
    'Jeremy -- rocket art',
    'cmarkle -- story, energy ball art',
    'rocket art, space ship art',
    'flannelbeard -- player shields',
    'aciago -- turrets art',
    'mickyzo -- single/double/triple laser,',
    'player hit/explosion sounds',
    'Chris DeLeon -- tile map code'
  ];

  var introText = [
    'The Journey of Little 2-bit',
    '',
    '',
    '',
    '***INCOMING TRANSMISSION***',
    '',
    'MEMORANDUM',
    '',
    'To: [Employee_11-16G]',
    'From: Management',
    'Subject: Operation 2-bit--',
    'we’re expanding!',
    '',
    'Our monumental growth has afforded',
    'us the prospect of expanding our',
    'single B.I.T. hub into a second.',
    'This will ensure our reach extends',
    'to customers in the furthest depths',
    'of the galaxy.',
    '',
    'The cargo in your L2-b must be',
    'delivered to the inhabitants of our',
    'hub’s new location within 12 hours.',
    'Failure will result in your ',
    'immediate termination from ',
    'Bulk Intergalactic Transporting.',
    '',
    'And remember, you are the face of',
    'this 2-bit operation, so make us',
    'proud!',
    '',
    '***END TRANSMISSION***'
  ];

  var victoryText = [
    '***INCOMING TRANSMISSION***',
    '',
    '',
    'You did it!',
    '',
    '***END TRANSMISSION***',
    '',
    '',
    creditsSeperator,
    '',
    '',
    'The Journey of Little 2-bit',
    '',
    'A game made at Gamkedo.club',
    ''
  ];

  var gameOverText = [
    '***INCOMING TRANSMISSION***',
    '',
    '',
    'Game Over',
    '',
    '***END TRANSMISSION***',
    '',
    '',
    creditsSeperator,
    '',
    '',
    'The Journey of Little 2-bit',
    '',
    'A game made at Gamkedo.club',
    ''
  ];

  var menuCreditsText = [];

  var showLines = 1;
  var loopCounter = 30;
  var startY = 420;
  var fadeInY = 390;
  var fadeOutY = 100;
  var stopY = 75;
  var x = 0;

  var lines = [];

  this.initialize = function() {
    this.enableMenuCreditsText();

    gameContext.font = gameFontSmall;
    x = gameCanvas.width - gameContext.measureText(creditsSeperator).width;
  };

  this.clear = function() {
    lines = [];
    showLines = 1;

    this.showFirstLine();
  };

  this.setText = function(text) {
    menuCreditsText = [];
    menuCreditsText = menuCreditsText.concat(title, text, creditsSpacer, credits, creditsSpacer, ['', '']);

    this.showFirstLine();
  };

  this.showFirstLine = function() {
    if (lines.length == 0) {
      lines.push(new MenuCreditLine(menuCreditsText[0]));
    }
  };

  this.enableMenuCreditsText = function() {
    this.setText(introText);
  };

  this.enableVictoryText = function() {
    this.setText(victoryText);
  };

  this.enableGameOverText = function() {
    this.setText(gameOverText);
  };

  this.draw = function() {
    if (loopCounter-- <= 0) {
      loopCounter = 30;
      if (showLines >= menuCreditsText.length) {
        showLines = 0;
        this.enableMenuCreditsText();
      }

      if (menuCreditsText[showLines]) {
        lines.push(new MenuCreditLine(menuCreditsText[showLines]));
      }
      showLines++;
    }

    for (var i = lines.length - 1; i >= 0; i--) {
      lines[i].draw();
      if (lines[i].remove) {
        lines.splice(i, 1);
      }
    }
  };

  var MenuCreditLine = function(text) {
    this.remove = false;

    var y = startY;
    var alpha = 0.2;

    var fadeInAlpha = startY - fadeInY;
    var fadeOutAlpha = fadeOutY - stopY;

    this.draw = function() {
      y--;

      this.remove = (y < stopY);

      if (y > fadeInY) {
        alpha = (fadeInAlpha - (y - fadeInY)) / fadeInAlpha;
      }
      else if (y < fadeOutY) {
        alpha = (y - stopY) / fadeOutAlpha;
      }
      else if (fadeInY >= y && y >= fadeOutY) {
        alpha = 1;
      }

      if (alpha < 0) {
        alpha = 0;
      }

      gameContext.font = gameFontSmall;
      gameContext.textBaseline = 'middle';
      gameContext.textAlign = 'center';
      drawTextAlpha(gameContext, x, y, fontColor, text, alpha);
    };

    return this;
  }; // MenuCreditsLine

  return this;
})();
