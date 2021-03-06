var MenuCredits = new (function() {
  var creditsSeperator = '              ----------            ';
  var creditsSpacer = [
    '',
    '',
    creditsSeperator,
    '',
    ''
  ];
  var credits = [
    'Journey of Little 2-bit',
    '',
    'A game made at Gamkedo.Club',
    '',
    'SpadXIII -- project lead, coding',
    'level design, life/health art',
    'Jeremy Kenyon -- rocket art',
    'Chris Markle -- story text, energy ball,',
    'rocket, and space ship art',
    'Chris Karpyszyn -- player shields',
    'Chris DeLeon -- tile map code, stars',
    'parallax',
    'Mykola Mykhailytskyi -- turrets art',
    'Micky Turner -- all sounds',
    'c: Games -- cave tile map',
    'Eric Andrade -- level design',
    'Thomas Kresge -- menu music',
    'Oasis Rim -- bosses art, enemy art,',
    'play testing',
    'Ashleigh Morris -- page styling, weapons art',
    'power ups, turret projectile art',
    'Nicholas Polchies -- canvas scaling, play testing',
    ''
  ];

  var introText = [
    'Journey of Little 2-bit',
    '',
    '',
    '',
    '***INCOMING TRANSMISSION***',
    '',
    'MEMORANDUM',
    '',
    'To: [Employee_11-16G]',
    'From: Management',
    'Subject: Operation 2-bit--A New Hub',
    '',
    'Our monumental growth has afforded',
    'us the prospect of expanding our single',
    'B.I.T. hub into a second, ensuring that',
    'our reach extends to customers in the',
    'furthest depths of the galaxy.',
    '',
    'The cargo in your L2-b must be delivered',
    'to the inhabitants of our hub’s new location within',
    '12 hours. Failure will result in your immediate',
    'termination from Bulk Intergalactic Transporting.',
    '',
    'And remember, you are the face of',
    'this 2-bit operation, so make us proud!',
    '',
    '',
    '***END TRANSMISSION***'
  ];

  var victoryText = [
    '***INCOMING TRANSMISSION***',
    '',
	'You returned the cargo to its',
	'rightful owner: B.I.T.',
	'',
    'You have saved my people from total',
    'annihilation. You truly are a hero!',
    '',
    '',
    '',
    '',
    '',
    'The time for celebration is over...',
    '',
    'Although this battle is won, it',
    'is but the first of many to come.',
    '',
    'The true battle, the battle for',
    'the galaxy, is now upon us!',
    '',
    'We will need your services again soon.',
    '',
    '-A friend',
    '',
    '***END TRANSMISSION***',
    '',
    '',
    creditsSeperator,
    ''
  ];

  var gameOverText = [
    '***INCOMING TRANSMISSION***',
    '',
    'MEMORANDUM',
    '',
    'To: [Employee_11-16G]',
    'From: Management',
    'Subject: Operation 2-bit--FAILED',
    '',
    'You are no longer considered',
    'B.I.T. material, and as such, your',
    'contract is hereby terminated.',
    '',
    'Please remember to choose B.I.T.',
    'for all of your intergalactic ',
    'transporting needs!',
    '',
    '***END TRANSMISSION***',
    '',
    '',
    creditsSeperator,
    ''
  ];

  var menuCreditsText = [];

  var showLines = 1;
  var loopCounter = 30;
  var startY = 420;
  var fadeInY = 390;
  var fadeOutY = 80;
  var stopY = 50;
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
    menuCreditsText = menuCreditsText.concat(text, creditsSpacer, credits, creditsSpacer, ['', '']);

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
