function drawBitmapCenteredWithRotation(canvasContext, useBitmap, atX, atY, withAng) {
  canvasContext.save();
  canvasContext.translate(atX, atY);
  if (withAng != undefined) {
    canvasContext.rotate(withAng);
  }
  canvasContext.drawImage(useBitmap, -useBitmap.width / 2, -useBitmap.height / 2);
  canvasContext.restore();
}

function drawBitmapFrameCenteredWithRotation(canvasContext, useBitmap, frame, atX, atY, width, height, withAng) {
  canvasContext.save();
  canvasContext.translate(atX, atY);
  if (withAng != undefined) {
    canvasContext.rotate(withAng);
  }
  canvasContext.drawImage(useBitmap, width * frame, 0, width, height, -width / 2, -height / 2, width, height);
  canvasContext.restore();
}

function drawBitmapFrameCenteredWithRotationAndAlpha(canvasContext, useBitmap, frame, atX, atY, width, height, withAng, alpha) {
  canvasContext.save();
  canvasContext.globalAlpha = alpha;
  canvasContext.translate(atX, atY);
  if (withAng != undefined) {
    canvasContext.rotate(withAng);
  }
  canvasContext.drawImage(useBitmap, width * frame, 0, width, height, -width / 2, -height / 2, width, height);
  canvasContext.restore();
}

function drawBitmapCenteredWithScaleAndRotation(canvasContext, useBitmap, atX, atY, scale, angle) {
  canvasContext.save();
  canvasContext.translate(atX, atY);
  if (angle != undefined) {
    canvasContext.rotate(angle);
  }
  if (scale == undefined) {
    scale = 1;
  }
  var scaledWidth = useBitmap.width * scale;
  var scaledHeight = useBitmap.height * scale;
  canvasContext.drawImage(useBitmap, 0, 0, useBitmap.width, useBitmap.height, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
  canvasContext.restore();
}

function drawFillRect(canvasContext, topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function drawStrokeRect(canvasContext, topLeftX, topLeftY, boxWidth, boxHeight, strokeColor, lineWidth) {
  canvasContext.strokeStyle = strokeColor;
  if (lineWidth != undefined) {
    var oldLineWidth = canvasContext.lineWidth;
    canvasContext.lineWidth = lineWidth;
  }
  canvasContext.strokeRect(topLeftX, topLeftY, boxWidth, boxHeight);
  if (lineWidth != undefined) {
    canvasContext.lineWidth = oldLineWidth;
  }
}

function drawFillCircle(canvasContext, centerX, centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  canvasContext.fill();
}

function drawStrokeCircle(canvasContext, centerX, centerY, radius, fillColor) {
  canvasContext.strokeStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  canvasContext.stroke();
}

function drawLines(canvasContext, fillColor, pointArray) {
  canvasContext.beginPath();
  canvasContext.moveTo(pointArray[0].x, pointArray[0].y);
  for (var i = 1; i < pointArray.length; i++) {
    canvasContext.lineTo(pointArray[i].x, pointArray[i].y);
  }
  canvasContext.strokeStyle = fillColor;
  canvasContext.stroke();
}

function drawText(canvasContext, textX, textY, fillColor, showWords) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX, textY);
}

function drawTextAlpha(canvasContext, textX, textY, fillColor, showWords, alpha) {
  canvasContext.save();

  if (alpha === undefined) {
    alpha = 1;
  }
  canvasContext.globalAlpha = alpha;
  drawText(canvasContext, textX, textY, fillColor, showWords);
  canvasContext.restore();
}

function drawTextHugeCentered(text) {
  gameContext.font = gameFontHuge;
  gameContext.textBaseline = 'middle';
  gameContext.textAlign = 'center';
  drawText(gameContext, Grid.cameraPanX() + gameCanvas.width / 2, gameCanvas.height / 2, '#fff', text);
}

function drawTextBox(text, font, textBoxBorder) {
  var lineHeight = determineFontHeight(font);
  var numLines = 1;
  if (!isString(text)) {
    numLines = text.length;
  }
  else {
    text = [text];
  }

  var textX = Grid.cameraPanX() + gameCanvas.width / 2;
  var textY = gameCanvas.height / 2;

  var t = text.slice();
  var longestLine = t.sort(function (a, b) { return b.length - a.length; })[0];
  gameContext.font = font;
  var boxWidth = 40 + gameContext.measureText(longestLine).width;
  var boxHeight = 40 + numLines * lineHeight;

  // Block out the stars behind the text for readability
  if (textBoxBorder) {
    _drawTextBoxBorder(gameContext, textX - boxWidth / 2, textY - boxHeight / 2, boxWidth, boxHeight);
  }

  gameContext.font = font;
  gameContext.textBaseline = 'middle';
  gameContext.textAlign = 'center';

  if (numLines > 1) {
    textY -= lineHeight * Math.floor(numLines / 2);
  }
  for (var l = 0; l < numLines; l++) {
    drawText(gameContext, textX, textY, '#fff', text[l]);
    textY += lineHeight;
  }
}

function _drawTextBoxBorder(ctx, x, y, width, height) {
  var cornerSize = 16;

  ctx.beginPath();
  ctx.moveTo(x + cornerSize, y);
  ctx.quadraticCurveTo(x, y, x, y + cornerSize);

  ctx.lineTo(x, y + height - cornerSize);
  ctx.quadraticCurveTo(x, y + height, x + cornerSize, y + height);

  ctx.lineTo(x + width - cornerSize, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - cornerSize);

  ctx.lineTo(x + width, y + cornerSize);
  ctx.quadraticCurveTo(x + width, y, x + width - cornerSize, y);

  ctx.lineTo(x + cornerSize, y);

  ctx.lineWidth = 4;
  ctx.fillStyle = '#515151';
  ctx.strokeStyle = '#878787';
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.font = gameFontExtraSmall;
  ctx.fillText('Press any key...', x + width - cornerSize, y + height - 10, width);
}
