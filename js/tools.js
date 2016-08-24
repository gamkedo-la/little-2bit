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
