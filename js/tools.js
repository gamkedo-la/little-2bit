const DEC2RAD = (Math.PI / 180);

if (!Object.keys) {
  Object.keys = function(obj) {
    var arr = [],
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  };
}

function isString(obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

function padLeft(nr, n, str) {
  return Array(n - String(nr).length + 1).join(str || '0') + nr;
}


var fontHeightCache = [];
function determineFontHeight(font) {
  var result = fontHeightCache[font];

  if (!result) {
    var body = document.getElementsByTagName('body')[0];
    var dummy = document.createElement('div');

    var dummyText = document.createTextNode('(AbqMjgL');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', 'font:' + font + ';position:absolute;top:0;left:0;margin:0;padding:0');
    body.appendChild(dummy);
    result = dummy.offsetHeight;

    fontHeightCache[font] = result;
    body.removeChild(dummy);
  }

  return result;
}

function rotateToTarget(vx, vy, speed, rotationEase, shipCoords, thisCoords) {
  var diffX = shipCoords.x - thisCoords.x;
  var diffY = shipCoords.y - thisCoords.y;
  var dist = Math.sqrt(diffX * diffX + diffY * diffY);
  var newVX = (diffX / dist) * speed;
  var newVY = (diffY / dist) * speed;

  return {
    vx: vx * rotationEase + newVX * (1.0 - rotationEase),
    vy: vy * rotationEase + newVY * (1.0 - rotationEase)
  };
}

function distanceBetweenPoints(point1, point2) {
  return Math.sqrt(distanceBetweenPointsSquared(point1, point2));
}

function distanceBetweenPointsSquared(point1, point2) {
  return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
}

function checkCollisionShapes(shape1, shape2) {
  var r1 = shape1.boundingBox();
  var r2 = shape2.boundingBox();

  if ((r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)) {
    return false;
  }

  var bounds1 = shape1.bounds();
  var bounds2 = shape2.bounds();

  return checkCollisionBounds(bounds1, bounds2)
}

function checkCollisionBounds(bounds1, bounds2) {
  var i;
  for (i = 0; i < bounds1.length; i++) {
    if (checkCollisionPointBounds(bounds1[i], bounds2)) {
      return true;
    }
  }

  for (i = 0; i < bounds2.length; i++) {
    if (checkCollisionPointBounds(bounds2[i], bounds1)) {
      return true;
    }
  }

  return false;
}

function checkCollisionPointBounds(point, bounds) {
  var sum_signs = 0, j = 0, on_edge = false, cross_product, shapeLength = bounds.length;
  for (var i = 0; i < shapeLength; i++) {
    j++;
    if (j == shapeLength) {
      j = 0;
    }
    cross_product = (point.x - bounds[i].x) * (bounds[j].y - bounds[i].y) - (point.y - bounds[i].y) * (bounds[j].x - bounds[i].x);
    if (cross_product == 0) {
      on_edge = true;
    }
    sum_signs += sign(cross_product);
  }

  if (on_edge) {
    return 0;
  }

  return sum_signs == shapeLength || sum_signs == -shapeLength;
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}
