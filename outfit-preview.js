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

const unknownZone = 255;

function matteAt(data, index, core, directions, zone) {
  const pixel = index * 4;
  const r = data[pixel];
  const g = data[pixel + 1];
  const b = data[pixel + 2];
  let bestScore = 1050;
  let matte;
  for (const direction of directions) {
    let before = index - direction * 2;
    let after = index + direction * 2;
    for (let step = 1; step < 5 && core[before] === unknownZone; step++) before -= direction;
    for (let step = 1; step < 5 && core[after] === unknownZone; step++) after += direction;
    const first = core[before];
    const second = core[after];
    if (first === unknownZone || second === unknownZone || first === second || (zone && first !== zone && second !== zone)) continue;

    const from = before * 4;
    const to = after * 4;
    const red = data[to] - data[from];
    const green = data[to + 1] - data[from + 1];
    const blue = data[to + 2] - data[from + 2];
    const length = red * red + green * green + blue * blue;
    if (length < 420) continue;
    const deltaR = r - data[from];
    const deltaG = g - data[from + 1];
    const deltaB = b - data[from + 2];
    const brightnessDelta = red * .213 + green * .715 + blue * .072;
    const toneDelta = deltaR * .213 + deltaG * .715 + deltaB * .072;
    const colorMix = (deltaR * red + deltaG * green + deltaB * blue) / length;
    const blend = Math.abs(brightnessDelta) > 30 ? toneDelta / brightnessDelta : colorMix;
    const mix = Math.max(0, Math.min(1, blend));
    const toneError = toneDelta - mix * brightnessDelta;
    const score = (deltaR - mix * red) ** 2 + (deltaG - mix * green) ** 2 + (deltaB - mix * blue) ** 2
      + toneError ** 2 * 2 + 2 * (Math.abs(index - before) + Math.abs(index - after)) / Math.abs(direction);
    if (score >= bestScore) continue;
    bestScore = score;
    matte = [before, after, first, second, Math.round(mix * 255)];
  }
  return matte;
}

function surroundedBy(zones, index, width, zone) {
  const above = index - width;
  const below = index + width;
  return zones[index - 1] === zone && zones[index + 1] === zone
    && zones[above - 1] === zone && zones[above] === zone && zones[above + 1] === zone
    && zones[below - 1] === zone && zones[below] === zone && zones[below + 1] === zone;
}

function masksFor(data, width, height, hasOuterwear, preserveOuterwear) {
  const masks = [[], [], []];
  const edges = [];
  const boundaries = [];
  const histograms = masks.map(() => new Uint32Array(256));
  const count = [0, 0, 0];
  const zones = new Uint8Array(width * height);
  const weights = new Uint8Array(zones.length);
  const top = Math.round(height * .155);
  const bottom = Math.ceil(height * .948);
  const left = Math.round(width * .13);
  const right = Math.ceil(width * .87);

  // Photographic shadows keep the marker channel order even near grey.
  for (let y = top; y < bottom; y++) {
    const row = y / height;
    for (let x = left; x < right; x++) {
      const index = y * width + x;
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const rose = !preserveOuterwear && row < .65
        ? coverageBetween(r - g, 8, 18) * coverageBetween(b - g, -15, -5) : 0;
      const sage = hasOuterwear && row < .56 && (!preserveOuterwear || (x > width * .38 && x < width * .63))
        ? coverageBetween(g - r, preserveOuterwear ? -1 : -7, preserveOuterwear ? 2 : 1)
          * coverageBetween(g - b, 1, 5) : 0;
      const blue = row > .36
        ? coverageBetween(b - r, -1, 4) * coverageBetween(b - g, -2, 2) : 0;
      const coverage = Math.max(rose, sage, blue);
      if (coverage < .07) continue;
      const zone = coverage === blue ? 2 : coverage === sage || !hasOuterwear ? 1 : 0;
      zones[index] = zone + 1;
      weights[index] = Math.round(coverage * 255);
      if (coverage > .72) {
        histograms[zone][luminance(r, g, b)]++;
        count[zone]++;
      }
    }
  }

  const minPixels = width * height * .012;
  if (count[hasOuterwear && !preserveOuterwear ? 0 : 1] < minPixels || count[2] < minPixels) {
    throw new Error('Das Styling-Foto konnte nicht der Farbauswahl zugeordnet werden.');
  }

  const core = new Uint8Array(zones.length);
  const directions = [1, width, width - 1, width + 1, 2 * width - 1, 2 * width + 1, width - 2, width + 2];
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = y * width + x;
      const zone = zones[index];
      const interior = surroundedBy(zones, index, width, zone);
      core[index] = interior && (!zone || weights[index] >= 240) ? zone : unknownZone;
    }
  }

  for (let y = top - 1; y <= bottom; y++) {
    for (let x = left - 1; x <= right; x++) {
      const index = y * width + x;
      const zone = zones[index];
      const nearBoundary = !surroundedBy(zones, index, width, zone)
        || zones[index - 2] !== zone || zones[index + 2] !== zone
        || zones[index - width * 2] !== zone || zones[index + width * 2] !== zone;
      if (!nearBoundary) {
        if (zone) masks[zone - 1].push(index * 256 + 255);
        continue;
      }
      boundaries.push(index);
      const matte = matteAt(data, index, core, directions, zone);
      if (matte) {
        const [before, after, first, second, afterWeight] = matte;
        const dominant = afterWeight < 8 ? first : afterWeight > 247 ? second : -1;
        if (dominant === 0) continue;
        if (dominant < 0) edges.push(index, before, after, first, second, afterWeight);
        else masks[dominant - 1].push(index * 256 + 255);
      } else if (zone) {
        masks[zone - 1].push(index * 256 + weights[index]);
      }
    }
  }

  return {
    zones: masks.map((mask, index) => ({
      pixels: Uint32Array.from(mask),
      baseShade: count[index] ? median(histograms[index], count[index]) : 100,
    })),
    edges: Uint32Array.from(edges),
    boundaries: Uint32Array.from(boundaries),
  };
}

async function preparePlate(src, right, hasOuterwear, preserveOuterwear) {
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
  return { bitmap, masks: masksFor(bitmap.data, work.width, work.height, hasOuterwear, preserveOuterwear) };
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

function applyColor(output, mask, table) {
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

function applyEdges(output, source, pixels, tables, preserveDetail) {
  for (let edge = 0; edge < pixels.length; edge += 6) {
    const offset = pixels[edge] * 4;
    const first = pixels[edge + 1] * 4;
    const second = pixels[edge + 2] * 4;
    const firstTable = tables[pixels[edge + 3] - 1];
    const secondTable = tables[pixels[edge + 4] - 1];
    const mix = pixels[edge + 5] / 255;
    const firstShade = luminance(source[first], source[first + 1], source[first + 2]) * 3;
    const secondShade = luminance(source[second], source[second + 1], source[second + 2]) * 3;
    const changeInShade = (table, shade) => table
      ? Math.abs(luminance(table[shade], table[shade + 1], table[shade + 2]) - shade / 3) : 0;
    const detailStrength = preserveDetail
      ? 1 - .58 * coverageBetween(Math.max(changeInShade(firstTable, firstShade), changeInShade(secondTable, secondShade)), 20, 70)
      : .42;
    for (let channel = 0; channel < 3; channel++) {
      const firstShift = firstTable ? (firstTable[firstShade + channel] - source[first + channel]) * (1 - mix) : 0;
      const secondShift = secondTable ? (secondTable[secondShade + channel] - source[second + channel]) * mix : 0;
      const reconstructed = source[first + channel] * (1 - mix) + source[second + channel] * mix;
      const detail = source[offset + channel] - reconstructed;
      output[offset + channel] = reconstructed + detail * detailStrength + firstShift + secondShift;
    }
  }
}

function cleanOutline(output, source, boundary, width) {
  // Repair isolated dark pixels only where the original had a continuous
  // tonal transition, so genuine fabric seams and zipper details survive.
  const offsets = [4, width * 4, (width - 1) * 4, (width + 1) * 4];
  const corrections = [];
  const shade = (data, offset) => luminance(data[offset], data[offset + 1], data[offset + 2]);

  for (const index of boundary) {
    const offset = index * 4;
    const original = shade(source, offset);
    const dyed = shade(output, offset);
    let strongest = 13;
    let replacement;
    for (const step of offsets) {
      const first = offset - step;
      const second = offset + step;
      const firstDyed = shade(output, first);
      const secondDyed = shade(output, second);
      const gain = Math.min(firstDyed, secondDyed) - dyed;
      if (gain <= strongest) continue;
      const firstOriginal = shade(source, first);
      const secondOriginal = shade(source, second);
      if (original < Math.min(firstOriginal, secondOriginal) - 14
          || original > Math.max(firstOriginal, secondOriginal) + 6) continue;
      const contrast = secondOriginal - firstOriginal;
      const mix = Math.abs(contrast) > 6
        ? Math.max(0, Math.min(1, (original - firstOriginal) / contrast)) : .5;
      replacement = [first, second, mix];
      strongest = gain;
    }
    if (!replacement) continue;
    const [first, second, mix] = replacement;
    const channels = [0, 1, 2].map(channel => {
      const reconstructed = output[first + channel] * (1 - mix) + output[second + channel] * mix;
      return reconstructed * .9 + output[offset + channel] * .1;
    });
    corrections.push([offset, channels]);
  }
  for (const [offset, channels] of corrections) output.set(channels, offset);
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
  const preserveOuterwear = jacket?.id === 'wool-blend-jacket-beige';
  const plateName = preserveOuterwear ? 'wool-jacket-beige'
    : kind === 'gilet' && topKind === 'longsleeve' ? 'gilet-longsleeve' : kind;
  const src = new URL(`style-plate-${plateName}.jpg`, import.meta.url).href;
  const key = `${plateName}:${right}`;
  const [{ bitmap, masks }, ...colors] = await Promise.all([
    cached(plateCache, key, () => preparePlate(src, right, Boolean(jacket), preserveOuterwear), 4),
    preserveOuterwear ? fallbackColors.outer : chooseColor(jacket, fallbackColors.outer),
    chooseColor(shirt, fallbackColors.shirt),
    chooseColor(trousers, fallbackColors.trousers),
  ]);
  if (activePaint.get(canvas) !== paint) return false;

  const output = new ImageData(new Uint8ClampedArray(bitmap.data), bitmap.width, bitmap.height);
  const tables = masks.zones.map((zone, index) => colorTable(colors[index], zone.baseShade));
  masks.zones.forEach((zone, index) => applyColor(output.data, zone, tables[index]));
  applyEdges(output.data, bitmap.data, masks.edges, tables, preserveOuterwear);
  const brightenedFabric = masks.zones.some(({ pixels, baseShade }, index) =>
    pixels.length && luminance(...colors[index]) > baseShade + 30);
  if (brightenedFabric) cleanOutline(output.data, bitmap.data, masks.boundaries, bitmap.width);
  if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
  if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Die Styling-Vorschau ist in diesem Browser nicht verfügbar.');
  context.putImageData(output, 0, 0);
  return true;
}
