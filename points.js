class Point {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get coordinates() {
    return [this.x, this.y];
  }
}

class Section {
  constructor(A, B) {
    this._A = new Point(...A);
    this._B = new Point(...B);
  }

  get A() {
    return this._A;
  }
  get B() {
    return this._B;
  }
  get length() {
    const { A, B } = this;
    return Math.sqrt(((B.x - A.x) ** 2) + ((B.y - A.y) ** 2));
  }

  get center() {
    const { A, B } = this;
    return [((A.x + B.x) / 2), ((A.y + B.y) / 2)];
  }
}

class Triangle {
  constructor(A, B, C) {
    this._sides = {
      a: new Section(B, C),
      b: new Section(C, A),
      c: new Section(A, B),
    };
    this._rawPoints = { A, B, C };
    this._corners = (({ a, b, c }) => {
      return {
        A: {
          point: A,
          angle: Triangle.calcAngle(a.length, b.length, c.length)
        },
        B: {
          point: B,
          angle: Triangle.calcAngle(b.length, a.length, c.length)
        },
        C: {
          point: C,
          angle: Triangle.calcAngle(c.length, a.length, b.length)
        }
      }
    })(this._sides);
    this._baseSide = ((points, sides) => {
      const [A, B] = points.sort(([Ax, Ay], [Bx, By]) => Ay - By);
      return Object.keys(sides).find((name) => {
        const {A: pA, B: pB} = sides[name];
        const {x: Ax, y: Ay} = pA;
        const {x: Bx, y: By} = pB;
        return (Ax === A[0] && Ay === A[1] && Bx === B[0] && By === B[1]) || (Ax === B[0] && Ay === B[1] && Bx === A[0] && By === A[1]);
      });
    })([A, B, C], this._sides);
    this._basePoint = (({ A, B }) => {
      const [point] = [A, B].sort(({ x: Ax }, { x: Bx }) => Ax - Bx);
      return point;
    })(this._sides[this._baseSide]);
    this._baseCornerName = ((basePoint, corners) => {
      return Object.keys(corners).find((name) => {
        const { point } = corners[name];
        return point[0] === basePoint.x && point[1] === basePoint.y
      });
    })(this._basePoint, this._corners);
    this._baseCorner = this._corners[this._baseCornerName].angle;
  }

  get width() {
    return this._sides[this._baseSide].length;
  }

  get skew() {
    return this._baseCorner - 90;
  }

  get center() {
    const BCN = this._baseCornerName;
    const { A, B, C } = this._rawPoints;
    const pair = BCN === 'A' ? [B, C] : (BCN === 'B' ? [A, C] : [A, B]);
    const side = new Section(...pair);
    return side.center;
  }

  get height() {
    const name = this._baseSide === 'a' ? 'c' : (this._baseSide === 'b' ? 'a' : 'b');
    const alpha = this._baseCorner;
    return this._sides[name].length * Math.sin(alpha * Math.PI / 180);
  }

  get rotate() {
    const baseSide = this._sides[this._baseSide];
    const { A, B } = baseSide;
    if (A.x === B.x) {
      return 90
    }
    if (A.y === B.y) {
      return 0;
    }
    let P = [];
    let flag = false;
    if ((A.x < B.x && A.y > B.y) || (B.x < A.x && B.y > A.x)) {
      P = [A.x, B.y];
    }
    if ((A.x > B.x && B.y < A.y) || (B.x > A.x && A.y < B.y)) {
      P = [B.x, A.y];
      flag = true
    }
    const sin = (new Section(B.coordinates, P)).length / baseSide.length;
    const angle = (Math.asin(sin) / Math.PI) * 180;
    return !flag ? 90 - angle : angle * -1;
  }

  static calcAngle(a, b, c) {
    const cos = ((b * b) + (c * c) - (a * a)) / (2 * b * c);
    return (Math.acos(cos) / Math.PI) * 180;
  };
}
// const t = new Triangle([3,1], [6,8], [10,2]);
// console.log(t);
// function vectorLength([x1, y1], [x2, y2]) {
//   return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
// }
//
// function sectionCenter([x1, y1], [x2, y2]) {
//   return [((x1 + x2) / 2), ((y1 + y2) / 2)];
// }
//
// function getCosAlpha(a, b, c) { // "a" is opposite side to alpha
//   return ((b * b) + (c * c) - (a * a)) / (2 * b * c);
// }
//
// function getAlphaByCos(cos) {
//   return (Math.acos(cos) / Math.PI) * 180;
// }
//
// function getAlphaBySin(sin) {
//   return (Math.asin(sin) / Math.PI) * 180;
// }
//
// function getTriangleHeight(alpha, adjacentSide) {
//   return adjacentSide * Math.sin(alpha * Math.PI / 180);
// }
//
// function getRotateAngle(A, B) {
//   if (A[0] === B[0]) {
//     return 0
//   }
//   if (A[1] === B[1]) {
//     return 90;
//   }
//   let P = [];
//   if ((A[0] < B[0] && A[1] > B[1]) || (B[0] < A[0] && B[1] > A[1])) {
//     P = [A[0], B[1]];
//   }
//   if ((A[0] > B[0] && B[1] < A[1]) || (B[0] > A[0] && A[1] < B[1])) {
//     P = [B[0], A[1]];
//   }
//   const sinAlpha = vectorLength(B, P) / vectorLength(A, B);
//   return getAlphaBySin(sinAlpha);
// }
//
// // const A = [30, 10];
// // const B = [10, 50];
// // const C = [60, 30];
//
// function calcTriangleProps(A, B, C) { // [ax, ay], [bx, by], [cx, cy]
//   const triangle = {
//     a: {
//       vec: [B, C],
//       length: vectorLength(B, C)
//     },
//     b: {
//       vec: [A, C],
//       length: vectorLength(A, C)
//     },
//     c: {
//       vec: [A, B],
//       length: vectorLength(A, B)
//     },
//   };
//   const { a, b, c } = triangle;
//   const longest = a.length > b.length ? (a.length > c.length ? 'a' : 'c') : (b.length > c.length ? 'b' : 'c');
//   const shortest = a.length > b.length ? (b.length > c.length ? 'c' : 'b') : (a.length > c.length ? 'c' : 'a');
//   const third = Object.keys(triangle).filter(el => ![longest, shortest].includes(el))[0]; // width
//   const center = sectionCenter(...triangle[longest].vec); // Figure center. top = height / 2; left = width / 2;
//
//   const cosAlpha = getCosAlpha(triangle[longest].length, triangle[shortest].length, triangle[third].length);
//   const alpha = getAlphaByCos(cosAlpha); // skewX
//   console.log(alpha);
//   const height = Math.abs(getTriangleHeight(alpha, triangle[shortest].length)); // height
//   console.log(alpha, triangle);
//   const rotate = getRotateAngle(...triangle[third].vec);
//   return { triangle, width: triangle[third].length, height, center, rotate, alpha: -90 + alpha };
//   // console.log({ a, b, c, center, alpha, h, rotAngle });
// }

// calcTriangleProps(A, B, C);
