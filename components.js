function getIterator() {
  let i = 0;
  return () => {
    return i++;
  };
}
function download(data, filename, type) {
  const file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
function readFile(url) {
  // const xhr = new XMLHttpRequest();
  // xhr.open('GET', url, true);
  // let text = '';
  // xhr.onreadystatechange = () => {
  //   if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
  //     text = xhr.responseText;
  //   }
  // };
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
  f.style.setProperty('left', `${left - window.pLeft - 1}px`);
  f.style.setProperty('top', `${top - window.pTop - 1}px`);
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
  get props() {
    return this._properties;
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
StylesBlock.prototype.toString = function () {
  return '[StylesBlock]';
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
  get blocks() {
    return this._blocks;
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
StylesList.prototype.toString = function () {
  return '[StylesList]';
};


class Figure {
  constructor(key, className = '') {
    this._key = key;
    this._ref = createFigureElement(key, className);
    this._titleRef = null;
    this._className = className;
    this._styles = new StylesList(key);
    this._rawProperties = {};
  }
  get ref() {
    return this._ref;
  }
  get titleRef() {
    return this._titleRef;
  }
  get key() {
    return this._key;
  }
  get styles() {
    return this._styles;
  }
  get raw() {
    return this._rawProperties;
  }
  get className() {
    return this._className;
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
Figure.prototype.addTitle = function (title, props = {}) {
  const numberEl = document.createElement('div');
  const className = `${this._key}-title`;
  numberEl.innerText = title;
  numberEl.className = className;
  window.CONTAINER.appendChild(numberEl);
  this._styles.addBlock(`.${className}`, props, 'title');
  this._styles.refresh();
  this._titleRef = document.querySelector(`.wrapper div.${className}`);
};
Figure.prototype.toString = function () {
  return '[Figure]';
};

class FiguresList {
  constructor() {
    this._items = {};
    this._active = null;
  }

  get length() {
    return Object.keys(this._items).length;
  }
  get active() {
    return this._active;
  }
  get prevKey() {
    const keys = Object.keys(this._items);
    if (this._active === null) {
      return keys[0] || null;
    } else {
      const curIdx = keys.indexOf(this._active);
      if (curIdx === 0) {
        return keys[keys.length - 1] || null;
      } else {
        return keys[curIdx - 1] || null;
      }
    }
  }
  get nextKey() {
    const keys = Object.keys(this._items);
    if (this._active === null) {
      return keys[0] || null;
    } else {
      const curIdx = keys.indexOf(this._active);
      if (curIdx === keys.length - 1) {
        return keys[0] || null;
      } else {
        return keys[curIdx + 1] || null;
      }
    }
  }
}
FiguresList.prototype.toString = function () {
  return '[FiguresList]';
};
FiguresList.prototype.addFigure = function (key, className) {
  const fig = new Figure(key, `${className} ${key}`);
  this._items[key] = fig;
  this._active = key;
  // fig.ref.draggable = true;
  fig.ref.onmousedown = (e) => {
    e.stopPropagation();
    const { x, y, offsetX, offsetY } = e;
    const { left, top } = document.querySelector('.wrapper').getBoundingClientRect();
    window.pLeft = left;
    window.pTop = top;
    window.mov = fig.ref;
    window.oX = offsetX;
    window.oY = offsetY;
    fig.ref.style.setProperty('transition', 'none');
    setInlinePos(fig.ref, y - offsetY, x - offsetX);
  };
  // fig.ref.onmouseleave = e => {
  //   e.stopPropagation();
  //   window.mov = false;
  //   fig.ref.removeAttribute('style');
  // };
  fig.ref.onmouseup = (e) => {
    e.stopPropagation();
    window.mov = false;
    const top = e.y - window.oY;
    const left = e.x - window.oX;
    const styles = fig.styles.getBlockByAlias('figure');
    const title = fig.styles.getBlockByAlias('title');
    const newTop = top - window.pTop - 1;
    const newLeft = left - window.pLeft - 1;
    styles.setProperties({
      top: `${newTop}px`,
      left: `${newLeft}px`,
    });
    title.setProperties({
      top: `${newTop - 25}px`,
      left: `${newLeft}px`,
    });
    fig.updateRawProps({ top: newTop, left: newLeft });
    fig.ref.removeAttribute('style');
    setTimeout(() => fig.styles.refresh());
  };
  return fig;
};
FiguresList.prototype.removeFigure = function (key) {
  this._active = null;
  this._items[key].removeStyles();
  this._items[key].titleRef.remove();
  this._items[key].ref.remove();
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
FiguresList.prototype.export = function (json = true) {
  const exportList = [];
  for (const item in this._items) {
    const { key, raw, className, styles: stylesList } = this._items[item];
    const styles = [];
    for (const block of stylesList.blocks) {
      const { selector, alias, props } = block;
      styles.push({ selector, alias, props });
    }
    exportList.push({ key, raw, className, styles });
  }
  return json ? JSON.stringify(exportList, null, '\t') : exportList;
};
FiguresList.prototype.import = function (figures) {
  if (typeof figures === 'string') {
    try {
      figures = JSON.parse(figures);
    } catch (e) {
      console.error(e);
    }
  }
  for (const { key, raw, className, styles } of figures) {
    const title = isNaN(+key) ? ((+key.match(/\d+/)[0] + 1) || key) : +key;
    const figure = this.addFigure(key, className);
    figure.setRawProps(raw);
    const stylesList = [];
    let titleProps = {};
    for (const { alias, props, selector } of styles) {
      if (alias === 'title') {
        titleProps = props;
      } else {
        stylesList.push(new StylesBlock(selector, props, alias));
      }
    }
    figure.setStyles(stylesList);
    figure.addTitle(title, titleProps);
    figure.ref.addEventListener('click', () => {
      this.setActive(key);
      enable('remove');
      enable('duplicate');
      updateFormAndMarker(key);
    });
    figure.ref.addEventListener('dragend', (e) => {
      const { width, height } = this.getActive(key).getRawProps();
      const { left: pLeft, top: pTop } = document.querySelector('.wrapper').getBoundingClientRect();
      const top = e.y - window.oY - pTop - 1;
      const left = e.x - window.oX - pLeft - 1;
      topInput.value = top;
      leftInput.value = left;
      const markerProps = {
        top: `${top - 5}px`,
        left: `${left - 5}px`,
        width: `${width + 10}px`,
        height: `${height + 10}px`,
        display: 'block'
      };
      activeMarkerStyles.getBlockByAlias('main').setProperties(markerProps);
      activeMarkerStyles.refresh();
    });
  }
};

function getDia(a, b) {
  return Math.sqrt((a * a) + (b * b))
}
function getAlpha (w, h) {
  const sin = h / getDia(w, h);
  return (Math.asin(sin) / Math.PI) * 180;
}

