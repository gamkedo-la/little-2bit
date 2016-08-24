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

function sign(x) {
  if (x == 0) {
    return 0;
  }

  return x / Math.abs(x);
}

function l(x) {
  return (Math.round(x * 100) / 100);
}

var debugT = 0;
function rotateToTarget(angle, rotationEase, thisCoords, targetCoords) {
  var ft = Math.PI * 2;
  var targetAngle = Math.atan2(targetCoords.y - thisCoords.y, targetCoords.x - thisCoords.x);

  targetAngle = (targetAngle + ft) % ft;
  var sourceAngle = (angle + ft) % ft;

  if (sourceAngle == targetAngle) {
    return angle;
  }

  if (debugT++ > 0) {
//    return angle;
  }
  var oldAngle = angle;


//  var delta = angle - targetAngle;
//  var deltaAbs = Math.abs(delta);
//
//  if (deltaAbs > Math.PI) {
//    delta = deltaAbs - ft;
//  }

  var delta = (sourceAngle - targetAngle) % ft;
  if (delta > Math.PI) {
    delta -= ft;
  }
  if (l(delta) != 0) {
    console.log({ s: l(sourceAngle), t: l(targetAngle), d: l(delta) });
  }

  angle += (sign(delta) * delta) / rotationEase;
  angle %= ft;

//  var sourceAngle = ((angle > 0) ? angle : (angle + ft)) % ft;
//  targetAngle = ((targetAngle > 0) ? targetAngle : (targetAngle + ft)) % ft;
//  var diffAngle = Math.abs(sourceAngle - targetAngle);
//  if (diffAngle > 0.01) {
//    var factor = (((sourceAngle - targetAngle + ft) % ft) > Math.PI ) ? 1 : -1;
//    angle += factor * diffAngle / rotationEase;
//    if (diffAngle > Math.PI) {
//      console.table({
//        ddn: ((sourceAngle - targetAngle + ft) % ft),
//        dd: sourceAngle - targetAngle,
//        f: factor,
//        a: angle,
//        oa: oldAngle,
//        ta: targetAngle
//      });
//    }
//  }

//  var diff = Math.abs(angle - targetAngle);
//
//  if (diff > Math.PI) {
//    diff = Math.PI * 2 - diff; //Normalize the difference in case it goes beyond a  full circle
//  }

//  if (Math.round(diff * 100) / 100 != 0) {
//    angle += diff / rotationEase;
//    angle %= (Math.PI*2);
//  }


//  targetAngle = targetAngle % ft;

//  var angleDelta = (angle - targetAngle + ft) % ft;
//  if (Math.abs(angleDelta) > 0.01) {
////  angleDelta = Math.min(angleDelta - ft, angleDelta);
//    var sign = (angleDelta > Math.PI) ? 1 : -1;
//    angle = (angle + ((sign * angleDelta) / rotationEase)) % ft;
//
//    console.table({
//      dd: Math.round((angle - targetAngle) * 100) / 100,
//      adr: angleDelta,
//      ad: Math.round(sign * angleDelta / DEC2RAD),
//      ta: Math.round(targetAngle / DEC2RAD),
//      a: Math.round(angle / DEC2RAD),
//      oa: Math.round(oldAngle / DEC2RAD)
//    });
//  }

//  if (Math.abs(targetAngle - angle) > Math.PI) {
//    if (targetAngle > 0 && angle < 0) {
//      angle -= (2 * Math.PI - targetAngle + angle) / rotationEase;
//    }
//    else if (angle > 0 && targetAngle < 0) {
//      if (debugT++ > 10) {
//        return angle;
//      }
//      console.table({
//        a: angle,
//        ta: targetAngle,
//        c: (2 * Math.PI + targetAngle + angle),
//        c2: (2 * Math.PI + targetAngle + angle) / rotationEase
//      });
//      angle += (2 * Math.PI + targetAngle + angle) / rotationEase;
//    }
//  }
//  else if (targetAngle < angle) {
//    angle -= Math.abs(targetAngle - angle) / rotationEase;
//  }
//  else {
//    angle += Math.abs(angle - targetAngle) / rotationEase;
//  }

//  if (angle > Math.PI * 2) {
//    angle = angle % (Math.PI * 2);
//  }

  return angle;
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
