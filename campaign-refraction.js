// Paint a small strip of the shop and warp its pixels with the desktop rim
// profile. The phone does not need SVG backdrop or element filter support.
export function attachCanvasRefraction(bar, rimDisplacement) {
  const sections = [...document.querySelectorAll('main > section, .footer')];
  const canvas = document.createElement('canvas');
  canvas.className = 'refraction-layer';
  canvas.setAttribute('aria-hidden', 'true');

  const context = canvas.getContext('2d');
  const strip = document.createElement('canvas');
  const stripContext = strip.getContext('2d', { willReadFrequently: true });
  if (!context || !stripContext) return;

  bar.prepend(canvas);
  bar.setAttribute('data-renderer', 'canvas');
  const paper = getComputedStyle(document.body).backgroundColor;
  const snapshots = new Map();
  let frame;
  let output;
  let samples;
  let scale;
  let pending = false;
  let needsWarmup = true;

  function resizeLens(width, height, density) {
    canvas.width = strip.width = width;
    canvas.height = strip.height = height;
    output = context.createImageData(width, height);
    samples = new Uint32Array(width * height);
    scale = density;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [dx, dy] = rimDisplacement(x + 0.5, y + 0.5, width, height, scale);
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(x + dx)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(y + dy)));
        samples[y * width + x] = sampleY * width + sampleX;
      }
    }
  }

  function capture(section) {
    const entry = {};
    snapshots.set(section, entry);
    pending = true;
    import('./html2canvas.min.js')
      .then(() => document.fonts?.ready)
      .then(() => globalThis.html2canvas(section, {
        backgroundColor: null,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        logging: false,
        onclone(_document, copy) {
          // html2canvas paints background-size: cover, but does not paint
          // object-fit: cover. Translate those images in the render copy.
          for (const image of copy.querySelectorAll('img')) {
            const style = image.ownerDocument.defaultView.getComputedStyle(image);
            if (style.objectFit !== 'cover') continue;
            const cover = image.ownerDocument.createElement('div');
            cover.className = image.className;
            const url = image.currentSrc || image.src;
            Object.assign(cover.style, {
              width: style.width,
              height: style.height,
              display: 'block',
              backgroundImage: `url("${encodeURI(url)}")`,
              backgroundPosition: style.objectPosition,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            });
            image.replaceWith(cover);
          }
        },
      }))
      .then(bitmap => { entry.bitmap = bitmap; })
      .catch(() => { entry.failed = true; })
      .finally(() => {
        pending = false;
        schedulePaint();
      });
  }

  function paint() {
    frame = undefined;
    if (!bar.classList.contains('liquid-glass')) return;
    if (needsWarmup && !pending) {
      needsWarmup = false;
      if (!snapshots.has(sections[0])) capture(sections[0]);
    }
    if (!bar.parentElement.classList.contains('is-scrolled')) return;

    const bounds = canvas.getBoundingClientRect();
    const intersecting = sections.map(section => ({
      section,
      bounds: section.getBoundingClientRect(),
      snapshot: snapshots.get(section),
    })).filter(({ bounds: section }) => section.top < bounds.bottom && section.bottom > bounds.top);

    const missing = intersecting.find(({ snapshot }) => !snapshot);
    if (missing && !pending) capture(missing.section);
    if (intersecting.some(({ snapshot }) => !snapshot?.bitmap)) {
      bar.removeAttribute('data-refraction');
      return;
    }

    const density = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * density);
    const height = Math.round(bounds.height * density);
    if (width < height || !height) return;
    if (width !== canvas.width || height !== canvas.height || density !== scale || !output) {
      resizeLens(width, height, density);
    }

    stripContext.fillStyle = paper;
    stripContext.fillRect(0, 0, width, height);
    for (const { bounds: section, snapshot } of intersecting) {
      stripContext.drawImage(
        snapshot.bitmap,
        (section.left - bounds.left) * scale,
        (section.top - bounds.top) * scale,
        section.width * scale,
        section.height * scale
      );
    }

    const source = new Uint32Array(stripContext.getImageData(0, 0, width, height).data.buffer);
    const destination = new Uint32Array(output.data.buffer);
    for (let pixel = 0; pixel < samples.length; pixel++) {
      destination[pixel] = source[samples[pixel]];
    }
    context.putImageData(output, 0, 0);
    bar.setAttribute('data-refraction', 'canvas');
  }

  function schedulePaint() {
    if (frame === undefined) frame = requestAnimationFrame(paint);
  }

  let viewportWidth = document.documentElement.clientWidth;
  window.addEventListener('resize', () => {
    const width = document.documentElement.clientWidth;
    if (width !== viewportWidth) {
      viewportWidth = width;
      snapshots.clear();
      needsWarmup = true;
    }
    schedulePaint();
  }, { passive: true });
  const collection = sections.find(section => section.classList.contains('collection'));
  new MutationObserver(() => {
    snapshots.delete(collection);
    schedulePaint();
  }).observe(collection, { subtree: true, attributeFilter: ['hidden'] });
  new ResizeObserver(schedulePaint).observe(bar);
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('pageshow', schedulePaint);
  schedulePaint();
  return schedulePaint;
}
