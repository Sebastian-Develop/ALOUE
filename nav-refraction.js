import { injectLiquidGlassFilter } from './inject-filter.js';

const svgNamespace = 'http://www.w3.org/2000/svg';
const filterId = 'aloue-nav-refraction';
const filterScale = 76;

function setAttributes(node, attributes) {
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
}

// The flat center samples the page in place. A rounded bevel bends it inward
// along the straight edges and radially around the two end caps.
function drawDisplacementMap(context, width, height) {
  const image = context.createImageData(width, height);
  const radius = height / 2;
  const bevel = Math.min(21, radius);
  const { data } = image;

  for (let y = 0; y < height; y++) {
    const dy = y + 0.5 - radius;
    for (let x = 0; x < width; x++) {
      const px = x + 0.5;
      const dx = px - Math.min(Math.max(px, radius), width - radius);
      const distance = Math.hypot(dx, dy);
      const depth = radius - distance;
      const pixel = (y * width + x) * 4;
      let bend = 0;

      if (depth >= -1 && depth < bevel && distance > 0) {
        const slope = 1 - Math.max(0, depth) / bevel;
        // Curved ends catch a little more light than the straight edges.
        const curvature = Math.abs(dx) / distance;
        const strength = 0.43 + 0.06 * curvature;
        bend = -strength * slope ** 2 / distance;
      }
      data[pixel] = 128 + 255 * dx * bend;
      data[pixel + 1] = 128 + 255 * dy * bend;
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
  if (!chromium || !CSS.supports('backdrop-filter', `url(#${filterId})`)) return;

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
    bar.setAttribute('data-refraction', '');
  }

  // Coalesce intermediate sizes from the existing width transition.
  let pending;
  const resize = new ResizeObserver(() => {
    if (pending !== undefined) return;
    pending = window.setTimeout(() => {
      pending = undefined;
      updateMap();
    }, 65);
  });
  resize.observe(bar);
  bar.addEventListener('transitionend', event => {
    if (event.propertyName === 'width') updateMap();
  });
  return updateMap;
}
