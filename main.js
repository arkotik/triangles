window.oX = 0;
window.oY = 0;
window.CONTAINER = document.querySelector('.wrapper');

/** --------------------------DnD----------------------  */

window.CONTAINER.onmousedown = (e) => {
  e.stopPropagation();
  const fig = figures.getActive();
  if (!fig) {
    return false;
  }
  const { x, y } = e;
  const { left, top } = window.CONTAINER.getBoundingClientRect();
  const offsetX = x - left;
  const offsetY = y - top;
  window.pLeft = left;
  window.pTop = top;
  const { top: figTop, left: figLeft, width: figWidth, height: figHeight } = fig.raw;
  if (offsetX > figLeft && offsetX < (figLeft + figWidth) && offsetY > figTop && offsetY < (figTop + figHeight)) {
    window.mov = fig;
    window.oX = offsetX - figLeft;
    window.oY = offsetY - figTop;
    fig.ref.style.setProperty('transition', 'none');
  }
};
window.CONTAINER.onmousemove = ({ x, y }) => {
  if (window.mov) {
    setInlinePos(window.mov.ref, y - window.oY, x - window.oX);
  }
};
window.CONTAINER.onmouseup = (e) => {
  e.stopPropagation();
  const top = e.y - window.oY;
  const left = e.x - window.oX;
  const styles = window.mov.styles.getBlockByAlias('figure');
  const title = window.mov.styles.getBlockByAlias('title');
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
  window.mov.updateRawProps({ top: newTop, left: newLeft });
  window.mov.ref.removeAttribute('style');
  setTimeout(() => {
    window.mov.styles.refresh();
    window.mov = false;
  });
};

/** ------------------------------------------------  */



const form = document.querySelector('#form-t');
const resetButt = document.querySelector('#reset-butt');
const addButt = document.querySelector('#add-tri-butt');
const remButt = document.querySelector('#rem-tri-butt');
const dupButt = document.querySelector('#duplicate-butt');
const addPointsButt = document.querySelector('#add-points');
const submitPointsButt = document.querySelector('#submit-points');
const clearPointsButt = document.querySelector('#clear-points');
const exportButt = document.querySelector('#export-butt');
const importButt = document.querySelector('#import-butt');
const fileImport = document.querySelector('#file-import');

const state = {
  add: {
    ref: addButt,
    disabled: false
  },
  remove: {
    ref: remButt,
    disabled: true
  },
  reset: {
    ref: resetButt,
    disabled: false
  },
  duplicate: {
    ref: dupButt,
    disabled: true
  }
};

function disable(name) {
  state[name].disabled = true;
  state[name].ref.classList.add('disabled');
}
function enable(name) {
  state[name].disabled = false;
  state[name].ref.classList.remove('disabled');
}
const colorInput = document.querySelector('#t-color');
const colorPickerInput = document.querySelector('#t-color-picker');
const widthInput = document.querySelector('#t-width');
const heightInput = document.querySelector('#t-height');
const topInput = document.querySelector('#t-top');
const leftInput = document.querySelector('#t-left');
const rotateInput = document.querySelector('#t-rotate');
const skewXInput = document.querySelector('#t-skew-x');
const skewYInput = document.querySelector('#t-skew-y');
const hMirrorInput = document.querySelector('#t-mirror-h');
const vMirrorInput = document.querySelector('#t-mirror-v');

colorPickerInput.onchange = () => {
  colorInput.value = colorPickerInput.value;
};
document.querySelector('html').onkeydown = e => {
  const { shiftKey, ctrlKey, code } = e;
  if (!window.formFocused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Escape', 'Delete', 'NumpadAdd', 'KeyA', 'KeyW', 'KeyD', 'KeyS', 'KeyC', 'KeyQ', 'KeyE'].includes(code)) {
    e.preventDefault();
    const mul = (shiftKey ? 10 : 1) * ((ctrlKey && !shiftKey) ? 100 : 1);
    switch (code) {
      case 'KeyQ':
        rotateInput.value -= 1;
        break;
      case 'KeyE':
        rotateInput.value -= -1;
        break;
      case 'KeyC':
        dupButt.click();
        break;
      case 'KeyW':
      case 'ArrowUp':
        topInput.value = (+topInput.value - mul);
        break;
      case 'KeyS':
      case 'ArrowDown':
        topInput.value = (+topInput.value + mul);
        break;
      case 'KeyA':
      case 'ArrowLeft':
        leftInput.value = (+leftInput.value - mul);
        break;
      case 'KeyD':
      case 'ArrowRight':
        leftInput.value = (+leftInput.value + mul);
        break;
      case 'Space':
        const nextKey = shiftKey ? figures.prevKey : figures.nextKey;
        figures.setActive(nextKey);
        updateFormAndMarker(nextKey);
        break;
      case 'Escape':
        figures.setActive(null);
        disable('remove');
        disable('duplicate');
        break;
      case 'Delete':
        if (figures.active) {
          figures.removeFigure(figures.active);
          hideMarker();
          disable('remove');
          disable('duplicate');
        }
        break;
      case 'NumpadAdd':
        addButt.click();
        break;
    }
    update(figures.getActive());
  }
};

const figures = new FiguresList();
const next = getIterator();
const activeMarkerStyles = new StylesList('marker');
activeMarkerStyles.addBlock('.active-marker', {
  position: 'absolute',
  display: 'block',
  border: `1px dashed #a5a5a5`
}, 'main');
activeMarkerStyles.refresh();

function updateFormAndMarker(key) {
  const { width, height, skewX, skewY, top, left, rotate, mirrorH, mirrorV, color } = figures.getActive(key).getRawProps();
  const markerProps = {
    top: `${top - 5}px`,
    left: `${left - 5}px`,
    width: `${width + 10}px`,
    height: `${height + 10}px`,
    display: 'block'
  };
  activeMarkerStyles.getBlockByAlias('main').setProperties(markerProps);
  activeMarkerStyles.refresh();
  colorInput.value = color;
  colorPickerInput.value = color;
  widthInput.value = width;
  heightInput.value = height;
  skewXInput.value = skewX;
  skewYInput.value = skewY;
  topInput.value = top;
  leftInput.value = left;
  rotateInput.value = rotate;
  hMirrorInput.checked = mirrorH;
  vMirrorInput.checked = mirrorV;
}

function addFig(clear = true) {
  figures.setActive(null);
  if (clear) {
    form.reset();
  } else {
    topInput.value -= -15;
    leftInput.value -= -15;
  }
  const index = next();
  const key = `fig-${index}`;
  const { figureProps, beforeProps, raw } = collectProps();

  const figStyle = new StylesBlock(`.triangle.${key}`, figureProps, 'figure');
  const beforeStyle = new StylesBlock(`.triangle.${key}:before`, beforeProps, 'before');

  const figure = figures.addFigure(key, 'triangle');
  figure.setStyles([figStyle, beforeStyle]);
  figure.setRawProps(raw);
  figure.addTitle(index + 1, {
    position: 'absolute',
    left: `${raw.left}px`,
    top: `${raw.top - 25}px`,
    width: `${raw.width}px`,
    'text-align': 'center'
  });
  figure.ref.addEventListener('click', () => {
    figures.setActive(key);
    enable('remove');
    enable('duplicate');
    updateFormAndMarker(key);
  });
  // figure.ref.addEventListener('mouseup', (e) => {
  //   const { width, height } = figures.getActive(key).getRawProps();
  //   const { left: pLeft, top: pTop } = document.querySelector('.wrapper').getBoundingClientRect();
  //   const top = e.y - window.oY - pTop - 1;
  //   const left = e.x - window.oX - pLeft - 1;
  //   topInput.value = top;
  //   leftInput.value = left;
  //   const markerProps = {
  //     top: `${top - 5}px`,
  //     left: `${left - 5}px`,
  //     width: `${width + 10}px`,
  //     height: `${height + 10}px`,
  //     display: 'block'
  //   };
  //   activeMarkerStyles.getBlockByAlias('main').setProperties(markerProps);
  //   activeMarkerStyles.refresh();
  // });
  enable('remove');
  enable('duplicate');
}

addButt.onclick = () => {
  if (!state.add.disabled) {
    addFig();
    remButt.classList.remove('disabled');
  }
};
remButt.onclick = () => {
  if (!state.remove.disabled && figures.active) {
    figures.removeFigure(figures.active);
    hideMarker();
    disable('remove');
    disable('duplicate');
  }
};
dupButt.onclick = () => {
  if (!state.duplicate.disabled) {
    addFig(false);
  }
};

function hideMarker() {
  activeMarkerStyles.getBlockByAlias('main').setProperty('display', 'none');
  activeMarkerStyles.refresh();
}

function collectProps() {
  const color = colorInput.value;
  const width = +widthInput.value;
  const height = +heightInput.value;
  const skewX = +skewXInput.value;
  const skewY = +skewYInput.value;
  const rotate = +rotateInput.value;
  const top = +topInput.value;
  const left = +leftInput.value;
  const mirrorH = !!hMirrorInput.checked;
  const mirrorV = !!vMirrorInput.checked;
  const mirrorHVal = !!hMirrorInput.checked ? -1 : 1;
  const mirrorVVal = !!vMirrorInput.checked ? 90 : 0;
  const dia = getDia(width, height);
  const halfDia = dia / 2;
  const alpha = (getAlpha(width, height) + mirrorVVal) * mirrorHVal;
  const markerProps = {
    top: `${top - 5}px`,
    left: `${left - 5}px`,
    width: `${width + 10}px`,
    height: `${height + 10}px`,
    display: 'block'
  };
  activeMarkerStyles.getBlockByAlias('main').setProperties(markerProps);
  activeMarkerStyles.refresh();
  return {
    figureProps: {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform:`rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg)`
    },
    beforeProps: {
      width: `${dia}px`,
      height: `${halfDia}px`,
      position: 'relative',
      top: `calc((100% - ${halfDia}px) / 2)`,
      left: `calc((100% - ${dia}px) / 2)`,
      transform: `rotate(${alpha}deg) translate(0, 50%)`,
      background: color
    },
    raw: { width, height, skewX, skewY, top, left, dia, alpha, rotate, mirrorH, mirrorV, color }
  };
}

function update(figure) {
  if (figure) {
    const { figureProps, beforeProps, raw } = collectProps();
    const { styles } = figure;
    figure.setRawProps(raw);
    styles.getBlockByAlias('figure').setProperties(figureProps);
    styles.getBlockByAlias('before').setProperties(beforeProps);
    styles.getBlockByAlias('title').setProperties({
      position: 'absolute',
      left: `${raw.left}px`,
      top: `${raw.top - 25}px`,
      width: `${raw.width}px`,
      'text-align': 'center'
    });
    styles.refresh();
  } else {
    form.reset();
    hideMarker();
  }
}
const inputsArr = [widthInput, heightInput, skewXInput, skewYInput, topInput, leftInput, rotateInput, hMirrorInput, vMirrorInput, colorInput, colorPickerInput];

inputsArr.forEach(el => {
  el.addEventListener('change', () => update(figures.getActive()));
  el.addEventListener('focus', () => (window.formFocused = true));
  el.addEventListener('blur', () => (window.formFocused = false));
});
form.onsubmit = e => {
  e.preventDefault();
  return false;
};
resetButt.onclick = function () {
  form.reset();
  const active = figures.getActive();
  if (active) {
    update(active);
  }
};

/** ++++++++++++++++++++++++++ points +++++++++++++++++++++++++++++++++ */
window.points = [];
function getPoint(top, left) {
  const p = document.createElement('div');
  p.className = 'point';
  p.style.setProperty('top', `${top}px`);
  p.style.setProperty('left', `${left}px`);
  p.style.setProperty('z-index', '9999');
  return p;
}
const wrapper = document.querySelector('.wrapper');
const overlay = document.querySelector('.overlay');
addPointsButt.onclick = () => {
  clearPoints();
  overlay.classList.add('visible');
  overlay.onmouseup = e => e.stopPropagation();
  overlay.onclick = e => e.stopPropagation();
  overlay.onmousedown = e => {
    e.stopPropagation();
    if (window.points.length < 3) {
      const { offsetX, offsetY } = e;
      window.points.push([offsetX, offsetY]);
      overlay.appendChild(getPoint(offsetY, offsetX));
    }
  };
};
submitPointsButt.onclick = () => {
  const transformPoints = (points) => {
    return points.map(([x, y]) => [x, -y]);
  };
  window.points.forEach(([x, y]) => overlay.appendChild(getPoint(y, x)));
  console.log(window.points);
  const t = new Triangle(...transformPoints(window.points));
  console.log(t);
  const [x, y] = t.center;
  const top = -y - (t.height / 2);
  const left = x - (t.width / 2);
  const rot = t.rotate;
  widthInput.value = t.width;
  heightInput.value = t.height;
  skewXInput.value = t.skew;
  topInput.value = top;
  leftInput.value = left;
  rotateInput.value = isNaN(t.rotate) ? 0 : rot;
  update(figures.getActive());
  clearPoints();
};
clearPointsButt.onclick = clearPoints;
function clearPoints() {
  window.points = [];
  overlay.querySelectorAll('.point').forEach(el => el.remove());
  overlay.classList.remove('visible');
}

exportButt.onclick = () => {
  download(figures.export(), 'figures-list.json', 'json');
};

fileImport.onchange = () => {
  const file = fileImport.files[0];
  // readFile(fileImport.value).then(console.log).catch(console.error);
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const list = JSON.parse(e.target.result);
      figures.import(list);
    } catch (e) {
      console.error(e);
    }
  };
  reader.readAsText(file);
};

importButt.onclick = () => {
  fileImport.click();
};
