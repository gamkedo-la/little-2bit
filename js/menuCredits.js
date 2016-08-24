var MenuCredits = new (function() {
  var creditsSeperator = '              ----------            ';
  var credits = [
    '    The Journey of Little 2-bit    ',
    '',
	'',
	'',
	'***INCOMING MESSAGE***',
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
	'',
	'***END TRANSMISSION***',
	'',
	'',
	'',
    creditsSeperator,
    '',
    'Spad-XIII - project lead, code',
    'Another name - some other roles',
    'Second name - some other roles',
    'Third name - some other roles',
    'Fourth name - some other roles'
  ];

  var showLines = 1;
  var loopCounter = 30;
  var startY = 420;
  var fadeInY = 390;
  var fadeOutY = 100;
  var stopY = 75;
  var x = 0;

  var lines = [];

  this.initialize = function() {
    lines.push(new MenuCreditLine(credits[0]));

    // Add some blank lines at the bottom of the credits
    for (var i = 0; i < 6; i++) {
      credits.push('');
      if (i == 2) {
        credits.push(creditsSeperator);
      }
    }

    gameContext.font = gameFontSmall;
    x = gameCanvas.width - 25 - gameContext.measureText(creditsSeperator).width;
  };

  this.draw = function() {
    if (loopCounter-- <= 0) {
      loopCounter = 30;
      if (showLines >= credits.length) {
        showLines = 0;
      }

      if (credits[showLines]) {
        lines.push(new MenuCreditLine(credits[showLines]));
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

    var x = gameCanvas.width / 4 * 3;
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
