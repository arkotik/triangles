function getIterator() {
  let i = 0;
  return () => {
    return i++;
  };
}

function createStyleElement(key) {
  let el = document.createElement('style');
  el.type = 'text/css';
  el.dataset.key = key;
  document.head.appendChild(el);
  return document.querySelector(`head style[data-key="${key}"]`);
}
function createFigureElement(key, className) {
  let el = document.createElement('div');
  el.className = className;
  el.dataset.figure = key;
  window.CONTAINER.appendChild(el);
  return document.querySelector(`.wrapper div[data-figure="${key}"]`);
}
// const simpleRX = /^\d+(?=[A-Za-z]?)/g;
// const skewRX = /(?<=(skew\(|deg,\s))(\d+(?=deg))/g;
// const literalRX = /^[A-Za-z]+$/g;

function setInlinePos(f, top, left) {
  const { left: pLeft, top: pTop } = document.querySelector('.wrapper').getBoundingClientRect();
  // console.log(`${top - pTop - 1}px`, `${left - pLeft - 1}px`);
  f.style.setProperty('left', `${left - pLeft - 1}px`);
  f.style.setProperty('top', `${top - pTop - 1}px`);
}

class StylesBlock {
  constructor(selector, properties = {}, alias = '') {
    this._alias = alias;
    this._selector = selector;
    this._properties = properties;
  }

  get selector() {
    return this._selector;
  }
  get alias() {
    return this._alias;
  }
}
StylesBlock.prototype.setProperty = function (name, value) {
  this._properties[name] = value;
};
StylesBlock.prototype.setProperties = function (properties) {
  this._properties = { ...this._properties, ...properties};
};
StylesBlock.prototype.getProperty = function (name) {
  return this._properties[name];
};
StylesBlock.prototype.removeProperty = function (name) {
  delete this._properties[name];
};
StylesBlock.prototype.getStyleContent = function () {
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


class StylesList {
  constructor(key) {
    this._key = key;
    this._blocks = [];
    this._selectors = new Set();
    this._ref = createStyleElement(key);
  }
  get ref() {
    return this._ref;
  }
  get key() {
    return this._key;
  }
}
StylesList.prototype.addBlock = function (selector, properties = {}, alias = '') {
  const block = new StylesBlock(selector, properties, alias);
  this._selectors.add(selector);
  this._blocks.push(block);
  return block;
};
StylesList.prototype.setBlocks = function (blocksList) {
  for (const block of blocksList) {
    this._blocks.push(block);
    this._selectors.add(block.selector);
  }
};
StylesList.prototype.getBlockBySelector = function (selector) {
  return this._blocks.find(block => block.selector === selector);
};
StylesList.prototype.getBlockByAlias = function (alias) {
  return this._blocks.find(block => block.alias === alias);
};
StylesList.prototype.getBlocksList = function () {
  return this._blocks;
};
StylesList.prototype.getSelectorsList = function () {
  return [...this._selectors];
};
StylesList.prototype.getTextContent = function () {
  let text = '';
  for (const block of this._blocks) {
    text += block.getStyleContent() + '\n';
  }
  return text;
};
StylesList.prototype.refresh = function () {
  this._ref.innerHTML = this.getTextContent();
};



class Figure {
  constructor(key, className = '') {
    this._key = key;
    this._ref = createFigureElement(key, className);
    this._className = className;
    this._styles = new StylesList(key);
    this._rawProperties = {};
  }
  get ref() {
    return this._ref;
  }
  get key() {
    return this._key;
  }
  get styles() {
    return this._styles;
  }
}
Figure.prototype.setStyles = function (blocksList) {
  this._styles.setBlocks(blocksList);
  this.rerender();
};
Figure.prototype.getStyles = function () {
  return this._styles;
};
Figure.prototype.rerender = function () {
  this._styles.refresh();
};
Figure.prototype.getRawProps = function () {
  return this._rawProperties;
};
Figure.prototype.setRawProps = function (props) {
  this._rawProperties = props;
};
Figure.prototype.updateRawProps = function (props) {
  this._rawProperties = { ...this._rawProperties, ...props };
};
Figure.prototype.removeStyles = function () {
  this._styles.ref.remove();
};


class FiguresList {
  constructor() {
    this._items = {};
    this._active = null;
  }

  get active() {
    return this._active;
  }
}
FiguresList.prototype.addFigure = function (key, className) {
  const fig = new Figure(key, `${className} ${key}`);
  this._items[key] = fig;
  this._active = key;
  fig.ref.draggable = true;
  fig.ref.onmousedown = (e) => {
    window.oX = e.offsetX;
    window.oY = e.offsetY;
  };
  fig.ref.ondragstart = (e) => {
    setInlinePos(fig.ref, e.y - window.oY, e.x - window.oX);
  };
  fig.ref.ondragend = (e) => {
    const { left: pLeft, top: pTop } = document.querySelector('.wrapper').getBoundingClientRect();
    const top = e.y - window.oY;
    const left = e.x - window.oX;
    const styles = fig.styles.getBlockByAlias('figure');
    styles.setProperties({
      top: `${top - pTop - 1}px`,
      left: `${left - pLeft - 1}px`,
    });
    fig.updateRawProps({ top: top - pTop - 1, left: left - pLeft - 1 });
    fig.ref.removeAttribute('style');
    setTimeout(() => fig.styles.refresh())
  };
  return fig;
};
FiguresList.prototype.removeFigure = function (key) {
  this._active = null;
  this._items[key].removeStyles();
  delete this._items[key];
};
FiguresList.prototype.setActive = function (key) {
  this._active = key;
};
FiguresList.prototype.getItem = function (key) {
  return this._items[key];
};
FiguresList.prototype.getActive = function () {
  return this.getItem(this._active);
};
FiguresList.prototype.setStyles = function (key, styles) {
  this._items[key].setStyles(styles)
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
//
// function createTri(id, style) {
//   const tri = document.createElement('div');
//   tri.dataset.id = id;
// }
