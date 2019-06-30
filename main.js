class Styles {
  constructor(selector) {
    this._selector = selector;
    this._properties = {};
  }
}

Styles.prototype.setProperty = function (name, value) {
  this._properties[name] = value;
};

Styles.prototype.getProperty = function (name) {
  return this._properties[name];
};

Styles.prototype.removeProperty = function (name) {
  delete this._properties[name];
};

Styles.prototype.getStyleBlock = function () {
  const lines = [];
  for (const name in this._properties) {
    if (this._properties.hasOwnProperty(name)) {
      const value = this._properties[name];
      const line = `\t${name}: ${value};`;
      lines.push(line);
    }
  }
  const stylesText = lines.join('\n');
  return `${this._selector}{\n` + stylesText + '\n}\n';
};

function getDia(a, b) {
  return Math.sqrt((a * a) + (b * b))
}
function getAlpha (w, h) {
  const sin = h / getDia(w, h);
  return (Math.asin(sin) / Math.PI) * 180;
}

function getStyleFuncParams(params) {
  let style = '';
  for (const key in params) {
    // noinspection JSUnfilteredForInLoop
    style += `${key}(${params[key]})`;
  }
  return style;
}
