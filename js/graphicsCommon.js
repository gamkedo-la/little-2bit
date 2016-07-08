function drawBitmapCenteredWithRotation(canvasContext, useBitmap, atX,atY, withAng) {
  canvasContext.save();
  canvasContext.translate(atX,atY);
  if (withAng = undefined) {
    withAng = 0;
  }
  canvasContext.rotate(withAng);
  canvasContext.drawImage(useBitmap, -useBitmap.width/2,-useBitmap.height/2);
  canvasContext.restore();
}

function drawRect(canvasContext, topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
}

function drawCircle(canvasContext, centerX,centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX,centerY, radius, 0,Math.PI * 2, true);
  canvasContext.fill();
}

function drawText(canvasContext, textX,textY, fillColor, showWords) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function drawTextAlpha(canvasContext, textX,textY, fillColor, showWords, alpha) {
  canvasContext.save();

	if(alpha === undefined)
	{
		alpha = 1;
	}
	canvasContext.globalAlpha = alpha;
  drawText(canvasContext, textX,textY, fillColor, showWords);
	canvasContext.restore();
}
