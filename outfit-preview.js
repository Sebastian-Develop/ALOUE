const plateCache = new Map();
const shellColorCache = new Map();
const activePaint = new WeakMap();
const plateKinds = new Set(['wool-jacket', 'reversible-jacket', 'parka', 'gilet', 't-shirt', 'longsleeve']);
const fallbackColors = {
  outer: [102, 81, 72],
  shirt: [190, 178, 159],
  trousers: [103, 98, 91],
};

function loadPhoto(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Die Styling-Vorschau konnte nicht geladen werden.'));
    image.src = src;
  });
}

function cached(cache, key, load, limit) {
  if (cache.has(key)) {
    const entry = cache.get(key);
    cache.delete(key);
    cache.set(key, entry);
    return entry;
  }
  const entry = load().catch(error => {
    if (cache.get(key) === entry) cache.delete(key);
    throw error;
  });
  cache.set(key, entry);
  if (cache.size > limit) cache.delete(cache.keys().next().value);
  return entry;
}

function garmentKind(garment, fallback) {
  if (garment?.kind) return garment.kind;
  const url = typeof garment === 'string' ? garment : garment?.src || '';
  if (url.includes('gilet')) return 'gilet';
  if (url.includes('parka')) return 'parka';
  if (url.includes('jacket-reversible')) return 'reversible-jacket';
  if (url.includes('long-sleeves')) return 'longsleeve';
  return fallback;
}

function luminance(r, g, b) {
  return Math.round(r * .213 + g * .715 + b * .072);
}

function median(histogram, total) {
  let sum = 0;
  for (let shade = 0; shade < histogram.length; shade++) {
    sum += histogram[shade];
    if (sum >= total / 2) return shade;
  }
  return 100;
}

function coverageBetween(value, low, high) {
  return Math.max(0, Math.min(1, (value - low) / (high - low)));
}

function masksFor(data, width, height, hasOuterwear) {
  const masks = [[], [], []];
  const histograms = masks.map(() => new Uint32Array(256));
  const count = [0, 0, 0];

  // Every plate was photographed with three distinct garment hues. Constrain
  // each hue to its body area before recoloring, leaving skin and set intact.
  for (let y = Math.round(height * .155); y < height * .948; y++) {
    const row = y / height;
    for (let x = Math.round(width * .13); x < width * .87; x++) {
      const index = y * width + x;
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      // The photographic shadows are often close to grey. Channel ordering
      // retains those folds where an HSV saturation threshold would drop them.
      const rose = row < .65
        ? coverageBetween(r - g, 8, 18) * coverageBetween(b - g, -15, -5) : 0;
      const sage = hasOuterwear && row < .56
        ? coverageBetween(g - r, -7, 1) * coverageBetween(g - b, 1, 5) : 0;
      const blue = row > .36
        ? coverageBetween(b - r, -1, 4) * coverageBetween(b - g, -2, 2) : 0;
      const coverage = Math.max(rose, sage, blue);
      if (coverage < .07) continue;
      const zone = coverage === blue ? 2 : coverage === sage || !hasOuterwear ? 1 : 0;
      masks[zone].push(index * 256 + Math.round(coverage * 255));
      if (coverage > .72) {
        histograms[zone][luminance(r, g, b)]++;
        count[zone]++;
      }
    }
  }

  const minPixels = width * height * .012;
  if (count[hasOuterwear ? 0 : 1] < minPixels || count[2] < minPixels) {
    throw new Error('Das Styling-Foto konnte nicht der Farbauswahl zugeordnet werden.');
  }
  return masks.map((mask, index) => ({
    pixels: Uint32Array.from(mask),
    baseShade: count[index] ? median(histograms[index], count[index]) : 100,
  }));
}

async function preparePlate(src, right, hasOuterwear) {
  const photo = await loadPhoto(src);
  const half = Math.floor(photo.naturalWidth / 2);
  const cropHeight = Math.min(photo.naturalHeight, Math.floor(half * 4 / 3));
  const cropWidth = Math.min(half, Math.round(cropHeight * 3 / 4));
  const scale = Math.min(1, 1080 / cropHeight);
  const work = document.createElement('canvas');
  work.width = Math.round(cropWidth * scale);
  work.height = Math.round(cropHeight * scale);
  const context = work.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Die Styling-Vorschau ist in diesem Browser nicht verfügbar.');
  const x = (right ? photo.naturalWidth - half : 0) + Math.floor((half - cropWidth) / 2);
  const y = Math.floor((photo.naturalHeight - cropHeight) / 2);
  context.drawImage(photo, x, y, cropWidth, cropHeight, 0, 0, work.width, work.height);
  const bitmap = context.getImageData(0, 0, work.width, work.height);
  return { bitmap, masks: masksFor(bitmap.data, work.width, work.height, hasOuterwear) };
}

function parseSwatch(value) {
  if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) return;
  return [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));
}

async function sampleShell(src) {
  const photo = await loadPhoto(src);
  const work = document.createElement('canvas');
  work.width = 24;
  work.height = 18;
  const context = work.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.drawImage(photo, photo.naturalWidth * .31, photo.naturalHeight * .39,
    photo.naturalWidth * .15, photo.naturalHeight * .2, 0, 0, work.width, work.height);
  const { data } = context.getImageData(0, 0, work.width, work.height);
  const histograms = [0, 1, 2].map(() => new Uint32Array(256));
  let count = 0;
  for (let index = 0; index < data.length; index += 4) {
    if (Math.min(data[index], data[index + 1], data[index + 2]) > 242) continue;
    for (let channel = 0; channel < 3; channel++) histograms[channel][data[index + channel]]++;
    count++;
  }
  if (count >= 80) return histograms.map(histogram => median(histogram, count));
}

function colorDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

async function chooseColor(garment, fallback) {
  const swatches = garment?.swatches?.map(parseSwatch).filter(Boolean) || [];
  const src = typeof garment === 'string' ? garment : garment?.src;
  const first = swatches[0] || fallback;
  if (swatches.length === 1 || !src) return first;
  const sampled = await cached(shellColorCache, src, () => sampleShell(src), 25).catch(() => null);
  if (!sampled) return first;
  return swatches.length === 2 && colorDistance(sampled, first) - colorDistance(sampled, swatches[1]) > 10
    ? swatches[1]
    : swatches.length ? first : sampled;
}

function colorTable(target, reference) {
  const table = new Uint8ClampedArray(256 * 3);
  const shadowCurve = .84 - .49 * coverageBetween(luminance(...target), 70, 220);
  for (let source = 0; source < 256; source++) {
    const light = Math.max(0, (source - reference) / Math.max(1, 255 - reference));
    const shadow = Math.min(1, source / Math.max(1, reference)) ** shadowCurve;
    for (let channel = 0; channel < 3; channel++) {
      const color = target[channel];
      table[source * 3 + channel] = color * shadow + (255 - color) * light * .86;
    }
  }
  return table;
}

function applyColor(output, mask, target) {
  const table = colorTable(target, mask.baseShade);
  for (const entry of mask.pixels) {
    const offset = (entry >>> 8) * 4;
    const opacity = (entry & 255) / 255;
    const shade = luminance(output[offset], output[offset + 1], output[offset + 2]) * 3;
    for (let channel = 0; channel < 3; channel++) {
      const index = offset + channel;
      output[index] += (table[shade + channel] - output[index]) * opacity;
    }
  }
}

/**
 * Colors designated garments in an on-model photograph. Body, background
 * and clothing geometry retain their original photographic pixels.
 */
export async function renderOutfitPreview(canvas, { model, trousers, shirt, jacket }) {
  const pose = typeof model === 'string' ? { src: model } : model;
  const paint = {};
  activePaint.set(canvas, paint);
  const right = pose.id ? pose.id === 'kit' : pose.src?.includes('model-kit') === true;
  const topKind = garmentKind(shirt, 't-shirt');
  const outerKind = jacket ? garmentKind(jacket, 'wool-jacket') : '';
  const kind = outerKind || topKind;
  if (!plateKinds.has(kind)) throw new Error('Für dieses Stück ist keine Styling-Vorschau verfügbar.');
  const plateName = kind === 'gilet' && topKind === 'longsleeve' ? 'gilet-longsleeve' : kind;
  const src = new URL(`style-plate-${plateName}.jpg`, import.meta.url).href;
  const key = `${plateName}:${right}`;
  const [{ bitmap, masks }, ...colors] = await Promise.all([
    cached(plateCache, key, () => preparePlate(src, right, Boolean(jacket)), 4),
    chooseColor(jacket, fallbackColors.outer),
    chooseColor(shirt, fallbackColors.shirt),
    chooseColor(trousers, fallbackColors.trousers),
  ]);
  if (activePaint.get(canvas) !== paint) return false;

  const output = new ImageData(new Uint8ClampedArray(bitmap.data), bitmap.width, bitmap.height);
  masks.forEach((mask, index) => applyColor(output.data, mask, colors[index]));
  if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
  if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Die Styling-Vorschau ist in diesem Browser nicht verfügbar.');
  context.putImageData(output, 0, 0);
  return true;
}
