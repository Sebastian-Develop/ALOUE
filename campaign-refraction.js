// Mobile lens. Read each shop image once, then sample only the narrow rim
// during scrolling. The page itself stays visible through the clear center.
export function attachCanvasRefraction(bar, rimDisplacement) {
  const canvas = document.createElement('canvas');
  canvas.className = 'refraction-layer';
  canvas.setAttribute('aria-hidden', 'true');

  const context = canvas.getContext('2d');
  const sourceContext = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context || !sourceContext) return;

  bar.prepend(canvas);
  bar.setAttribute('data-renderer', 'canvas');

  const images = [...document.querySelectorAll('main img')];
  const sources = new Map();
  const density = Math.min(1.5, window.devicePixelRatio || 1);
  let frame;
  let scene = [];
  let layoutChanged = true;
  let output;
  let rim;
  let resizing = false;

  function readImage(image) {
    if (!image.naturalWidth || sources.has(image)) return;
    const factor = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * factor));
    const height = Math.max(1, Math.round(image.naturalHeight * factor));
    sourceContext.canvas.width = width;
    sourceContext.canvas.height = height;
    sourceContext.drawImage(image, 0, 0, width, height);
    try {
      const data = sourceContext.getImageData(0, 0, width, height).data;
      sources.set(image, { width, height, pixels: new Uint32Array(data.buffer) });
    } catch {
      // A remote image can opt out of pixel access. Its normal page stays visible.
      return;
    }
    invalidateLayout();
  }

  function measureScene() {
    const scroll = window.scrollY;
    scene = [];
    for (const image of images) {
      const source = sources.get(image);
      if (!source || image.closest('[hidden]')) continue;
      const rect = image.getBoundingClientRect();
      if (!rect.height || !rect.width) continue;
      const style = getComputedStyle(image);
      const cover = style.objectFit === 'cover';
      const factor = Math.max(rect.width / source.width, rect.height / source.height);
      const width = cover ? source.width * factor : rect.width;
      const height = cover ? source.height * factor : rect.height;
      const [x = '50%', y = '50%'] = style.objectPosition.split(' ');
      scene.push({
        source,
        bounds: { left: rect.left, right: rect.right, top: rect.top + scroll, bottom: rect.bottom + scroll },
        left: rect.left + (rect.width - width) * parseFloat(x) / 100,
        top: rect.top + scroll + (rect.height - height) * parseFloat(y) / 100,
        scaleX: source.width / width,
        scaleY: source.height / height,
        hero: image.classList.contains('hero-image'),
      });
    }
    layoutChanged = false;
  }

  function resizeLens(width, height) {
    canvas.width = width;
    canvas.height = height;
    output = context.createImageData(width, height);
    rim = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [dx, dy] = rimDisplacement(x + 0.5, y + 0.5, width, height, density);
        const bend = Math.hypot(dx, dy) / density;
        if (bend < 1) continue;
        rim.push({
          index: y * width + x,
          x: (x + 0.5 + dx) / density,
          y: (y + 0.5 + dy) / density,
          alpha: Math.round(206 * Math.min(1, (bend - 1) / 7)),
        });
      }
    }
  }

  function paint() {
    frame = undefined;
    const active = bar.classList.contains('liquid-glass') &&
      bar.parentElement.classList.contains('is-scrolled');
    if (!active) {
      bar.removeAttribute('data-refraction');
      return;
    }
    if (layoutChanged) measureScene();

    const lens = canvas.getBoundingClientRect();
    const width = Math.round(lens.width * density);
    const height = Math.round(lens.height * density);
    if (width < height || !height) return;

    const top = lens.top + window.scrollY;
    const bottom = top + lens.height;
    const visible = scene.filter(({ bounds }) => bounds.top < bottom && bounds.bottom > top);
    if (!visible.length) {
      bar.removeAttribute('data-refraction');
      return;
    }
    if (!output || (!resizing && (width !== canvas.width || height !== canvas.height))) {
      resizeLens(width, height);
    }
    const stretchX = width / canvas.width;
    const stretchY = height / canvas.height;

    const bytes = output.data;
    const pixels = new Uint32Array(bytes.buffer);
    pixels.fill(0);
    for (const { source, bounds, left, top: imageTop, scaleX, scaleY, hero } of visible) {
      for (const sample of rim) {
        const x = lens.left + sample.x * stretchX;
        const y = top + sample.y * stretchY;
        if (x < bounds.left || x >= bounds.right || y < bounds.top || y >= bounds.bottom) continue;
        const sx = Math.min(source.width - 1, Math.max(0, Math.floor((x - left) * scaleX)));
        const sy = Math.min(source.height - 1, Math.max(0, Math.floor((y - imageTop) * scaleY)));
        const index = sample.index * 4;
        pixels[sample.index] = source.pixels[sy * source.width + sx];
        if (hero) {
          // Match the campaign's vertical dark scrim inside the sampled area.
          const progress = (y - bounds.top) / (bounds.bottom - bounds.top);
          const shade = progress < 0.49
            ? 0.06 + Math.max(0, progress - 0.20) * 1.08
            : 0.376 + (progress - 0.49) * 1.03;
          bytes[index] = bytes[index] * (1 - shade) + 33 * shade;
          bytes[index + 1] = bytes[index + 1] * (1 - shade) + 26 * shade;
          bytes[index + 2] = bytes[index + 2] * (1 - shade) + 22 * shade;
        }
        bytes[index + 3] = sample.alpha;
      }
    }

    context.putImageData(output, 0, 0);
    if (!bar.hasAttribute('data-refraction')) bar.setAttribute('data-refraction', 'canvas');
  }

  function schedulePaint() {
    if (frame === undefined) frame = requestAnimationFrame(paint);
  }

  function invalidateLayout() {
    layoutChanged = true;
    schedulePaint();
  }

  const main = document.querySelector('main');
  new MutationObserver(invalidateLayout).observe(main, { subtree: true, attributeFilter: ['hidden'] });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(invalidateLayout).observe(main);
  for (const image of images) {
    image.addEventListener('load', () => {
      sources.delete(image);
      readImage(image);
    });
    if (image.complete) readImage(image);
  }
  bar.addEventListener('transitionrun', event => {
    if (event.target === bar && event.propertyName === 'width') resizing = true;
  });
  for (const type of ['transitionend', 'transitioncancel']) {
    bar.addEventListener(type, event => {
      if (event.target !== bar || event.propertyName !== 'width') return;
      resizing = false;
      schedulePaint();
    });
  }
  window.addEventListener('resize', invalidateLayout, { passive: true });
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('pageshow', invalidateLayout);
  schedulePaint();
  return schedulePaint;
}
