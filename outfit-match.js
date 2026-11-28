const slots = ['jacket', 'shirt', 'trousers'];

// These catalogue photos show the reverse side. The preview samples the same shell.
const reverseSidePhotos = new Set([
  'men-gilet-reversible-falcon-espresso',
  'men-jacket-reversible-falcon-espresso',
  'men-jacket-reversible-beige-kit',
]);

function colorFromSwatch(swatch) {
  if (typeof swatch !== 'string' || !/^#[0-9a-f]{6}$/i.test(swatch)) return null;
  const [red, green, blue] = [1, 3, 5].map(index => {
    const channel = Number.parseInt(swatch.slice(index, index + 2), 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });

  // Linear sRGB to Oklab, https://bottosson.github.io/posts/oklab/
  const l = Math.cbrt(.4122214708 * red + .5363325363 * green + .0514459929 * blue);
  const m = Math.cbrt(.2119034982 * red + .6806995451 * green + .1073969566 * blue);
  const s = Math.cbrt(.0883024619 * red + .2817188376 * green + .6299787005 * blue);
  const lightness = .2104542553 * l + .7936177850 * m - .0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + .4505937099 * s;
  const b = .0259040371 * l + .7827717662 * m - .8086757660 * s;
  return { lightness, a, b, chroma: Math.hypot(a, b) };
}

function formality(product, slot) {
  if (slot === 'trousers') return .62;
  if (slot === 'shirt') return product.id.includes('-long-sleeves-') ? .52 : .43;
  const categories = product.collections || [];
  if (categories.includes('wendewesten')) return .33;
  if (categories.includes('kapuzenjacken')) return .3;
  return categories.includes('wendejacken') ? .54 : .76;
}

function piece(slot, id, product) {
  if (!product) return { id, color: null, formality: null, material: '' };
  const side = reverseSidePhotos.has(id) ? 1 : 0;
  return {
    id,
    color: colorFromSwatch(product.swatches?.[side] || product.swatches?.[0]),
    formality: formality(product, slot),
    material: product.material || '',
  };
}

function pairScore(left, right, targetContrast) {
  if (!left.id || !right.id) return 0;
  let score = 0;
  if (left.color && right.color) {
    const first = left.color;
    const second = right.color;
    const contrast = Math.abs(first.lightness - second.lightness);
    // Close values make the garment boundaries disappear. Allow stronger contrasts,
    // such as a light shirt under a dark jacket, when there is enough separation.
    score += 1 - Math.max(0, targetContrast - contrast) * 2.4 - Math.max(0, contrast - targetContrast) * .85;
    const separation = Math.hypot(contrast, first.a - second.a, first.b - second.b);
    if (separation < .08) score -= .48 * (1 - separation / .08);
    const chroma = Math.min(first.chroma, second.chroma);
    if (chroma > .023) {
      const hueAgreement = (first.a * second.a + first.b * second.b) / (first.chroma * second.chroma);
      score += Math.min(1, (chroma - .023) / .035) * hueAgreement * .35;
    }
  }

  if (left.formality !== null && right.formality !== null) {
    score += .16 * (1 - Math.abs(left.formality - right.formality));
  }
  if (left.material && left.material === right.material) score += .14;
  return score;
}

export function matchOutfit(groups, products, selection, anchor, preferredLook, pinned = new Set()) {
  const options = Object.fromEntries(slots.map(slot => {
    const id = selection[slot] ?? null;
    const keep = pinned.has(slot) || slot === anchor || (slot === 'jacket' && selection.jacket === null);
    const candidates = groups[slot] || [];
    if (keep || !candidates.length) return [slot, [piece(slot, id, products.get(id))]];
    const ranked = candidates.map(product => piece(slot, product.id, product));
    ranked.sort((left, right) => left.id.localeCompare(right.id, 'en'));
    return [slot, ranked];
  }));

  let best = { ...selection };
  let bestScore = -Infinity;
  for (const jacket of options.jacket) {
    for (const shirt of options.shirt) {
      for (const trousers of options.trousers) {
        const matched = { jacket: jacket.id, shirt: shirt.id, trousers: trousers.id };
        const preference = slots.filter(slot => matched[slot] && matched[slot] === preferredLook?.[slot]).length * .07;
        const accentCount = [jacket, shirt, trousers].filter(item => item.color?.chroma > .045).length;
        const neutralShirt = shirt.color ? .18 * (1 - Math.min(1, shirt.color.chroma / .05)) : 0;
        const score = pairScore(jacket, shirt, .29) +
          pairScore(shirt, trousers, .24) +
          pairScore(jacket, trousers, .28) * 1.2 +
          neutralShirt - Math.max(0, accentCount - 1) * .2 + preference;
        if (score > bestScore) {
          best = { ...selection, ...matched };
          bestScore = score;
        }
      }
    }
  }
  return best;
}
