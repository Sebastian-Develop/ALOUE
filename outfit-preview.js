const productPhotoCache = new Map();
const modelPhotoCache = new Map();
const activePaint = new WeakMap();
const photoCacheLimit = 16;

const defaultSlots = {
  trousers: { x: .35, y: .412, width: .30, height: .502 },
  shirt: { x: .305, y: .172, width: .39, height: .292 },
  jacket: { x: .291, y: .154, width: .418, height: .318 },
};

function loadPhoto(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'));
    image.src = src;
  });
}

function cachedPhoto(cache, key, prepare, limit) {
  if (cache.has(key)) {
    const pending = cache.get(key);
    cache.delete(key);
    cache.set(key, pending);
    return pending;
  }

  const pending = prepare().catch(error => {
    if (cache.get(key) === pending) cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  if (cache.size > limit) cache.delete(cache.keys().next().value);
  return pending;
}

function colorDistance(r, g, b, reference) {
  return Math.max(Math.abs(r - reference[0]), Math.abs(g - reference[1]), Math.abs(b - reference[2]));
}

function studioBackground(pixels, width, height) {
  const corners = [0, width - 1, width * (height - 1), width * height - 1];
  return [0, 1, 2].map(channel => {
    const samples = corners.map(corner => pixels[corner * 4 + channel]).sort((a, b) => a - b);
    return (samples[1] + samples[2]) / 2;
  });
}

function removeStudioBackground(photo, width, height) {
  const count = width * height;
  const background = studioBackground(photo, width, height);
  const queue = new Uint32Array(count);
  const cleared = new Uint8Array(count);
  let tail = 0;

  function clear(index) {
    if (cleared[index]) return;
    cleared[index] = 1;
    const offset = index * 4;
    if (colorDistance(photo[offset], photo[offset + 1], photo[offset + 2], background) > 12) return;
    photo[offset + 3] = 0;
    queue[tail++] = index;
  }

  for (let x = 0; x < width; x++) {
    clear(x);
    clear((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y++) {
    clear(y * width);
    clear(y * width + width - 1);
  }

  // Flood inwards from the edges. Pale highlights enclosed by the garment
  // retain their pixels, while spaces between sleeves and legs are cleared.
  for (let head = 0; head < tail; head++) {
    const index = queue[head];
    const x = index % width;
    if (x > 0) clear(index - 1);
    if (x < width - 1) clear(index + 1);
    if (index >= width) clear(index - width);
    if (index < count - width) clear(index + width);
  }

  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    if (!photo[offset + 3]) continue;
    const x = index % width;
    const y = Math.floor(index / width);
    const touchesBackground = cleared[index] && (
      (x > 0 && !photo[offset - 1])
      || (x < width - 1 && !photo[offset + 7])
      || (y > 0 && !photo[offset - width * 4 + 3])
      || (y < height - 1 && !photo[offset + width * 4 + 3])
    );
    if (touchesBackground) {
      const distance = colorDistance(photo[offset], photo[offset + 1], photo[offset + 2], background);
      const alpha = Math.min(1, (distance - 10) / 28);
      photo[offset + 3] = Math.round(alpha * 255);

      // Unmix white from the antialiased outline so a pale studio halo
      // does not appear over the warmer background of the lookbook.
      for (let channel = 0; channel < 3; channel++) {
        photo[offset + channel] = (photo[offset + channel] - background[channel] * (1 - alpha)) / alpha;
      }
    }
    if (photo[offset + 3] < 32) continue;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  if (right < left || bottom < top) throw new Error('Kein Kleidungsstück im Produktbild erkannt.');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function detectCollar(pixels, stride, crop, kind) {
  if (kind !== 'gilet' && kind !== 'reversible') return;
  const sample = (x, y) => {
    const offset = ((crop.top + Math.round(y * (crop.height - 1))) * stride
      + crop.left + Math.round(x * (crop.width - 1))) * 4;
    return pixels.subarray(offset, offset + 3);
  };
  const lining = sample(.5, .09);
  const front = sample(.25, .24);
  if (colorDistance(...lining, front) < 26) return;

  // The lining may only show along the edge of a zipped collar. Cut into
  // that lining only when its colour persists down the open centre.
  let depth = .1;
  for (; depth < .36; depth += .02) {
    const center = sample(.5, depth);
    if (colorDistance(...center, lining) > 27) break;
  }
  if (depth < .18) return;
  return { width: kind === 'gilet' ? .31 : .19, depth: depth - .025 };
}

async function prepareGarment(src, kind) {
  const image = await loadPhoto(src);
  const scale = Math.min(1, 640 / Math.max(image.naturalHeight, image.naturalWidth));
  const source = document.createElement('canvas');
  source.width = Math.max(1, Math.round(image.naturalWidth * scale));
  source.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const sourceContext = source.getContext('2d', { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0, source.width, source.height);
  const bitmap = sourceContext.getImageData(0, 0, source.width, source.height);
  const crop = removeStudioBackground(bitmap.data, source.width, source.height);
  const collar = detectCollar(bitmap.data, source.width, crop, kind);
  sourceContext.putImageData(bitmap, 0, 0);

  const cutout = document.createElement('canvas');
  cutout.width = crop.width;
  cutout.height = crop.height;
  const context = cutout.getContext('2d');
  context.drawImage(source, crop.left, crop.top, crop.width, crop.height, 0, 0, crop.width, crop.height);

  if (collar) {
    const center = crop.width / 2;
    const halfWidth = crop.width * collar.width / 2;
    const depth = crop.height * collar.depth;
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(center - halfWidth, -2);
    context.lineTo(center + halfWidth, -2);
    context.bezierCurveTo(center + halfWidth * .94, depth * .55, center + halfWidth * .34, depth * .8, center, depth);
    context.bezierCurveTo(center - halfWidth * .34, depth * .8, center - halfWidth * .94, depth * .55, center - halfWidth, -2);
    context.fill();
  }

  return cutout;
}

function garmentKind(slot, item) {
  if (typeof item !== 'string' && item.kind) return item.kind;
  const src = typeof item === 'string' ? item : item.src;
  if (src.includes('gilet')) return 'gilet';
  if (src.includes('parka')) return 'parka';
  if (src.includes('jacket-reversible')) return 'reversible';
  if (src.includes('long-sleeves')) return 'longsleeve';
  return slot;
}

function slotFor(model, slot, kind) {
  const base = model.slots?.[slot] || defaultSlots[slot];
  if (model.slots?.[kind]) return model.slots[kind];
  if (kind === 'gilet') {
    return { x: base.x + base.width * .1, y: base.y + .006, width: base.width * .8, height: base.height * .97 };
  }
  if (kind === 'parka') return { ...base, height: base.height * 1.09 };
  if (kind === 'longsleeve') return { ...base, height: base.height * 1.11 };
  return base;
}

/**
 * Renders catalogue photos over a front-facing editorial model in a chosen
 * outfit. Slot rectangles are relative to model image dimensions.
 * Returns false only if a newer render has taken over this canvas.
 */
export async function renderOutfitPreview(canvas, { model, trousers, shirt, jacket }) {
  const pose = typeof model === 'string' ? { src: model } : model;
  const paint = {};
  activePaint.set(canvas, paint);
  const sources = Object.entries({ trousers, shirt, jacket }).filter(([, item]) => item);
  const [background, garments] = await Promise.all([
    cachedPhoto(modelPhotoCache, pose.src, () => loadPhoto(pose.src), 3),
    Promise.all(sources.map(async ([slot, item]) => {
      const src = typeof item === 'string' ? item : item.src;
      const kind = garmentKind(slot, item);
      const photo = await cachedPhoto(productPhotoCache, kind + ':' + src, () => prepareGarment(src, kind), photoCacheLimit);
      return { photo, slot: slotFor(pose, slot, kind) };
    })),
  ]);
  if (activePaint.get(canvas) !== paint) return false;

  const scale = Math.min(1, 1200 / Math.max(background.naturalHeight, background.naturalWidth));
  const width = Math.round(background.naturalWidth * scale);
  const height = Math.round(background.naturalHeight * scale);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height);
  context.drawImage(background, 0, 0, width, height);

  context.save();
  context.shadowColor = 'rgb(31 24 19 / .21)';
  context.shadowBlur = 3;
  context.shadowOffsetY = 2;
  for (const { photo, slot } of garments) {
    context.drawImage(photo, slot.x * width, slot.y * height, slot.width * width, slot.height * height);
  }
  context.restore();
  return true;
}
