window.oX = 0;
window.oY = 0;
window.CONTAINER = document.querySelector('.wrapper');
const form = document.querySelector('#form-t');
const resetButt = document.querySelector('#reset-butt');
const addButt = document.querySelector('#add-tri-butt');
const remButt = document.querySelector('#rem-tri-butt');
const dupButt = document.querySelector('#duplicate-butt');
const addPointsButt = document.querySelector('#add-points');
const submitPointsButt = document.querySelector('#submit-points');
const clearPointsButt = document.querySelector('#clear-points');

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
  if (!window.formFocused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Escape', 'Delete', 'NumpadAdd'].includes(code)) {
    e.preventDefault();
    const mul = (shiftKey ? 10 : 1) * ((ctrlKey && !shiftKey) ? 100 : 1);
    switch (code) {
      case 'ArrowUp':
        topInput.value = (+topInput.value - mul);
        break;
      case 'ArrowDown':
        topInput.value = (+topInput.value + mul);
        break;
      case 'ArrowLeft':
        leftInput.value = (+leftInput.value - mul);
        break;
      case 'ArrowRight':
        leftInput.value = (+leftInput.value + mul);
        break;
      case 'Space':
        const nextKey = figures.nextKey;
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
  figure.ref.addEventListener('dragend', (e) => {
    const { width, height } = figures.getActive(key).getRawProps();
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
addPointsButt.onclick = () => {
  wrapper.onmousedown = e => {
    if (window.points.length < 3) {
      const { offsetX, offsetY } = e;
      window.points.push([offsetX, offsetY]);
      wrapper.appendChild(getPoint(offsetY, offsetX));
    }
  };
};
submitPointsButt.onclick = () => {
  const transformPoints = (points) => {
    return points.map(([x, y]) => [x, -y]);
  };
  // window.points = [
  //   [100, 100],
  //   [100, 200],
  //   [200, 200]
  // ];

  window.points.forEach(([x, y]) => wrapper.appendChild(getPoint(y, x)));
  console.log(window.points);
  const t = new Triangle(...transformPoints(window.points));
  console.log(t);
  // const props = {};
  // const props = calcTriangleProps(...window.points);
  // console.log(props);
  // const { triangle, width, height, center, rotate, alpha } = props;
  // console.log({ triangle, width, height, center, rotate, alpha });
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
  // clearPoints();
};
clearPointsButt.onclick = clearPoints;
function clearPoints() {
  window.points = [];
  wrapper.querySelectorAll('.point').forEach(el => el.remove());
}