import { injectLiquidGlassFilter } from './inject-filter.js';
import { attachSceneRefraction } from './scene-refraction.js?v=fluid-glass';

const svgNamespace = 'http://www.w3.org/2000/svg';
const filterId = 'aloue-nav-refraction';
const filterScale = 76;

function setAttributes(node, attributes) {
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
}

// The same capsule profile drives both the native SVG and the mobile canvas.
function rimDisplacement(x, y, width, height, scale = 1) {
  const radius = height / 2;
  const bevel = Math.min(21 * scale, radius);
  const dx = x - Math.min(Math.max(x, radius), width - radius);
  const dy = y - radius;
  const distance = Math.hypot(dx, dy);
  const depth = radius - distance;
  if (depth < -scale || depth >= bevel || !distance) return [0, 0];

  const slope = 1 - Math.max(0, depth) / bevel;
  const strength = 0.43 + 0.06 * Math.abs(dx) / distance;
  const bend = -strength * slope ** 2 * filterScale * scale / distance;
  return [dx * bend, dy * bend];
}

function drawDisplacementMap(context, width, height) {
  const image = context.createImageData(width, height);
  const { data } = image;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [dx, dy] = rimDisplacement(x + 0.5, y + 0.5, width, height);
      const pixel = (y * width + x) * 4;
      data[pixel] = 128 + 255 * dx / filterScale;
      data[pixel + 1] = 128 + 255 * dy / filterScale;
      data[pixel + 2] = 128;
      data[pixel + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

export function attachNavRefraction(bar) {
  // SVG filters on a live CSS backdrop are supported in Chromium.
  const chromium = navigator.userAgentData?.brands.some(({ brand }) => brand === 'Chromium') ??
    (/\bChrome\//.test(navigator.userAgent) && !/\bCriOS\//.test(navigator.userAgent));
  const mobile = window.matchMedia('(max-width: 780px)').matches ||
    navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  if (mobile || !chromium || !CSS.supports('backdrop-filter', `url(#${filterId})`)) {
    return attachSceneRefraction(bar, rimDisplacement);
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const filter = injectLiquidGlassFilter({ id: filterId, animate: false });
  filter.parentElement.style.position = 'absolute';
  const displacement = filter.querySelector('feDisplacementMap');
  const map = document.createElementNS(svgNamespace, 'feImage');
  filter.querySelector('feTurbulence').replaceWith(map);
  setAttributes(map, { preserveAspectRatio: 'none', result: 'bevel' });
  setAttributes(filter, { filterUnits: 'userSpaceOnUse', x: 0, y: 0 });
  setAttributes(displacement, { in2: 'bevel', scale: filterScale });

  function updateMap() {
    const { offsetWidth: width, offsetHeight: height } = bar;
    if (width < height || height === 0 || !bar.classList.contains('liquid-glass')) return;
    if (width === canvas.width && height === canvas.height && bar.hasAttribute('data-refraction')) return;
    canvas.width = width;
    canvas.height = height;
    drawDisplacementMap(context, width, height);
    setAttributes(filter, { width, height });
    setAttributes(map, { x: 0, y: 0, width, height, href: canvas.toDataURL() });
    bar.setAttribute('data-refraction', 'native');
  }

  // Coalesce intermediate sizes from the existing width transition.
  let pending;
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    if (pending !== undefined) return;
    pending = window.setTimeout(() => {
      pending = undefined;
      updateMap();
    }, 65);
  });
  resize?.observe(bar);
  window.addEventListener('resize', updateMap, { passive: true });
  bar.addEventListener('transitionend', event => {
    if (event.propertyName === 'width') updateMap();
  });
  return updateMap;
}
