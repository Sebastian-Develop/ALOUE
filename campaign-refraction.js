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
  let weights;
  let coverage;
  let scale;
  let pending = false;
  let needsWarmup = true;

  function resizeLens(width, height, density) {
    canvas.width = strip.width = width;
    canvas.height = strip.height = height;
    output = context.createImageData(width, height);
    samples = new Uint32Array(width * height);
    weights = new Uint8Array(width * height * 2);
    coverage = new Uint8Array(width * height);
    scale = density;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [dx, dy] = rimDisplacement(x + 0.5, y + 0.5, width, height, scale);
        const sampleX = Math.min(width - 1.001, Math.max(0, x + dx));
        const sampleY = Math.min(height - 1.001, Math.max(0, y + dy));
        const left = Math.floor(sampleX);
        const top = Math.floor(sampleY);
        const index = y * width + x;
        samples[index] = top * width + left;
        weights[index * 2] = Math.round((sampleX - left) * 255);
        weights[index * 2 + 1] = Math.round((sampleY - top) * 255);
        coverage[index] = Math.min(255, Math.round(Math.hypot(dx, dy) * 42 / scale));
      }
    }
  }

  function capture(section) {
    const entry = { attempts: (snapshots.get(section)?.attempts ?? 0) + 1 };
    snapshots.set(section, entry);
    pending = true;
    const bounds = section.getBoundingClientRect();
    import('./html2canvas.min.js')
      .then(() => document.fonts?.ready)
      .then(() => globalThis.html2canvas(section, {
        backgroundColor: null,
        scale: Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4000000 / (bounds.width * bounds.height))),
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone(_document, copy) {
          if (section.classList.contains('hero')) copy.style.minHeight = bounds.height + 'px';
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
      .catch(() => { entry.failedAt = performance.now(); })
      .finally(() => {
        pending = false;
        schedulePaint();
      });
  }

  function drawLiveImages(section, bounds, density) {
    for (const image of section.querySelectorAll('img')) {
      if (!image.complete || !image.naturalWidth || image.closest('[hidden]')) continue;
      const rect = image.getBoundingClientRect();
      if (rect.top >= bounds.bottom || rect.bottom <= bounds.top || !rect.height) continue;

      const style = getComputedStyle(image);
      const left = (rect.left - bounds.left) * density;
      const top = (rect.top - bounds.top) * density;
      const width = rect.width * density;
      const height = rect.height * density;
      stripContext.save();
      stripContext.beginPath();
      const radius = parseFloat(getComputedStyle(image.parentElement).borderTopLeftRadius) * density;
      if (stripContext.roundRect && radius) stripContext.roundRect(left, top, width, height, radius);
      else stripContext.rect(left, top, width, height);
      stripContext.clip();

      if (style.objectFit === 'cover') {
        const factor = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const paintedWidth = image.naturalWidth * factor;
        const paintedHeight = image.naturalHeight * factor;
        const [x = '50%', y = '50%'] = style.objectPosition.split(' ');
        stripContext.drawImage(
          image,
          left + (width - paintedWidth) * parseFloat(x) / 100,
          top + (height - paintedHeight) * parseFloat(y) / 100,
          paintedWidth,
          paintedHeight
        );
      } else {
        stripContext.drawImage(image, left, top, width, height);
      }
      stripContext.restore();
    }
  }

  function warpStrip(width, height) {
    const source = stripContext.getImageData(0, 0, width, height).data;
    const sourcePixels = new Uint32Array(source.buffer);
    const destination = new Uint32Array(output.data.buffer);
    const row = width * 4;
    for (let pixel = 0; pixel < samples.length; pixel++) {
      const sample = samples[pixel];
      const x = weights[pixel * 2] / 255;
      const y = weights[pixel * 2 + 1] / 255;
      if (!x && !y) {
        destination[pixel] = sourcePixels[sample];
        continue;
      }
      const index = sample * 4;
      const target = pixel * 4;
      if (!source[index + 3] || !source[index + 7] ||
          !source[index + row + 3] || !source[index + row + 7]) {
        destination[pixel] = sourcePixels[sample];
        continue;
      }
      for (let channel = 0; channel < 3; channel++) {
        const offset = index + channel;
        const top = source[offset] + (source[offset + 4] - source[offset]) * x;
        const bottom = source[offset + row] + (source[offset + row + 4] - source[offset + row]) * x;
        output.data[target + channel] = top + (bottom - top) * y;
      }
      output.data[target + 3] = 255;
    }
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
    const positions = sections.map(section => ({
      section,
      bounds: section.getBoundingClientRect(),
      snapshot: snapshots.get(section),
    }));
    const intersecting = positions.filter(({ bounds: section }) =>
      section.top < bounds.bottom && section.bottom > bounds.top
    );

    // Prepare the next sections before they cross the glass. A failed
    // snapshot leaves the directly sampled image path available.
    const candidates = [...intersecting, ...positions.filter(({ bounds: section }) =>
      section.top >= bounds.bottom && section.top < bounds.bottom + window.innerHeight * 0.8
    )];
    const now = performance.now();
    const next = candidates.find(({ snapshot }) =>
      !snapshot || (snapshot.attempts < 2 && now - snapshot.failedAt > 1000)
    );
    if (next && !pending) capture(next.section);

    const density = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * density);
    const height = Math.round(bounds.height * density);
    if (width < height || !height) return;
    if (width !== canvas.width || height !== canvas.height || density !== scale || !output) {
      resizeLens(width, height, density);
    }

    stripContext.fillStyle = paper;
    stripContext.fillRect(0, 0, width, height);
    // Render the live image strip as soon as each browser decodes the images.
    // A section snapshot adds text and other layers when it becomes available.
    const complete = intersecting.every(({ snapshot }) => snapshot?.bitmap);
    if (!complete) stripContext.clearRect(0, 0, width, height);
    for (const entry of intersecting) {
      const { section, bounds: position, snapshot } = entry;
      if (snapshot?.bitmap) {
        stripContext.drawImage(
          snapshot.bitmap,
          (position.left - bounds.left) * scale,
          (position.top - bounds.top) * scale,
          position.width * scale,
          position.height * scale
        );
      } else {
        drawLiveImages(section, bounds, scale);
      }
    }

    try {
      warpStrip(width, height);
      if (!complete) {
        // Keep the true page visible in the unwarped middle while the richer
        // scene is preparing. Only the rim is painted by the direct sampler.
        for (let index = 0; index < coverage.length; index++) {
          const alpha = index * 4 + 3;
          output.data[alpha] = Math.min(output.data[alpha], coverage[index]);
        }
      }
      context.putImageData(output, 0, 0);
      bar.setAttribute('data-refraction', 'canvas');
      bar.setAttribute('data-refraction-source', complete ? 'sections' : 'images');
    } catch {
      bar.removeAttribute('data-refraction');
    }
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
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(schedulePaint).observe(bar);
  for (const image of document.querySelectorAll('main img')) {
    image.addEventListener('load', schedulePaint);
  }
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('pageshow', schedulePaint);
  schedulePaint();
  return schedulePaint;
}
