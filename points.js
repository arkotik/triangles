function vectorLength([x1, y1], [x2, y2]) {
  return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
}

function sectionCenter([x1, y1], [x2, y2]) {
  return [((x1 + x2) / 2), ((y1 + y2) / 2)];
}

function getCosAlpha(a, b, c) { // "a" is opposite side to alpha
  return ((b * b) + (c * c) - (a * a)) / (2 * b * c);
}

function getAlphaByCos(cos) {
  return (Math.acos(cos) / Math.PI) * 180;
}

function getAlphaBySin(sin) {
  return (Math.asin(sin) / Math.PI) * 180;
}

function getTriangleHeight(alpha, adjacentSide) {
  return adjacentSide * Math.sin(alpha * Math.PI / 180);
}

function getRotateAngle(A, B) {
  if (A[0] === B[0]) {
    return 0
  }
  if (A[1] === B[1]) {
    return 90;
  }
  let P = [];
  if ((A[0] < B[0] && A[1] > B[1]) || (B[0] < A[0] && B[1] > A[1])) {
    P = [A[0], B[1]];
  }
  if ((A[0] > B[0] && B[1] < A[1]) || (B[0] > A[0] && A[1] < B[1])) {
    P = [B[0], A[1]];
  }
  const sinAlpha = vectorLength(B, P) / vectorLength(A, B);
  return getAlphaBySin(sinAlpha);
}

// const A = [30, 10];
// const B = [10, 50];
// const C = [60, 30];

function calcTriangleProps(A, B, C) { // [ax, ay], [bx, by], [cx, cy]
  const triangle = {
    a: {
      vec: [B, C],
      length: vectorLength(B, C)
    },
    b: {
      vec: [A, C],
      length: vectorLength(A, C)
    },
    c: {
      vec: [A, B],
      length: vectorLength(A, B)
    },
  };
  const { a, b, c } = triangle;
  const longest = a.length > b.length ? (a.length > c.length ? 'a' : 'c') : (b.length > c.length ? 'b' : 'c');
  const shortest = a.length > b.length ? (b.length > c.length ? 'c' : 'b') : (a.length > c.length ? 'c' : 'a');
  const third = Object.keys(triangle).filter(el => ![longest, shortest].includes(el))[0]; // width
  const center = sectionCenter(...triangle[longest].vec); // Figure center. top = height / 2; left = width / 2;

  const cosAlpha = getCosAlpha(triangle[longest].length, triangle[shortest].length, triangle[third].length);
  const alpha = getAlphaByCos(cosAlpha); // skewX
  console.log(alpha);
  const height = Math.abs(getTriangleHeight(alpha, triangle[shortest].length)); // height
  console.log(alpha, triangle);
  const rotate = getRotateAngle(...triangle[third].vec);
  return { triangle, width: triangle[third].length, height, center, rotate, alpha: -90 + alpha };
  // console.log({ a, b, c, center, alpha, h, rotAngle });
}

// calcTriangleProps(A, B, C);
