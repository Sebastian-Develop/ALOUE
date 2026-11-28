const sizeLabels = ['S', 'M', 'L', 'XL', 'XXL'];

// Published menswear reference body measurements in cm. Brand-specific fit
// data can override these per product when it is available.
const referenceRanges = {
  jacket: { chest: [[88, 94], [95, 101], [102, 108], [109, 115], [116, 122]] },
  shirt: { chest: [[86, 94], [95, 102], [103, 110], [111, 118], [119, 126]] },
  trousers: {
    waist: [[74, 80], [81, 86], [87, 92], [93, 98], [99, 104]],
    hip: [[90, 94], [95, 99], [100, 104], [105, 109], [110, 114]],
  },
};
const demoProduct = /^(wool-blend-jacket-|men-(gilet-reversible|jacket-reversible|parka-jacket|cotton-shirt-long-sleeves|cotton-t-shirt|trousers-l3[24])-|tapered-chino-)/;

export function estimateSizeMeasures(height, weight) {
  if (!Number.isFinite(height) || !Number.isFinite(weight)) return null;
  const weightToHeight = weight / (height / 100) ** 2;
  if (height < 155 || height > 195 || weight < 48 || weight > 125 || weightToHeight < 17 || weightToHeight > 38) return null;
  const h = (height - 175) / 10;
  const w = (weight - 80) / 10;
  // Linear fits against measured stature, mass, chest and seat in ANSUR II.
  return { chest: 102.6072 - 2.9094 * h + 6.2349 * w, hip: 99.0858 - 1.4014 * h + 5.3462 * w };
}

function sizeRanges(product, slot, measure) {
  if (product.sizeGuide) return Object.entries(product.sizeGuide[measure] || {});
  const ranges = referenceRanges[slot]?.[measure];
  return ranges && demoProduct.test(product.id) ? ranges.map((range, index) => [sizeLabels[index], range]) : [];
}

export function recommendSize(product, slot, profile) {
  const trousers = slot === 'trousers';
  const measured = Boolean(trousers ? profile.waist : profile.chest);
  const measure = trousers ? (measured ? 'waist' : 'hip') : 'chest';
  const value = measured ? profile[measure] : profile.estimated?.[measure];
  const ranges = sizeRanges(product, slot, measure);
  if (!ranges.length) return { note: 'Keine Größentabelle für dieses Maß.' };
  if (!Number.isFinite(value)) return { note: trousers ? 'Taillenumfang ergänzen.' : 'Brustumfang ergänzen.' };

  const distance = ([, [min, max]]) => Math.max(min - value, value - max, 0);
  const nearby = ranges.filter(range => distance(range) <= (measured ? .5 : trousers ? 3.5 : 4));
  nearby.sort((a, b) => distance(a) - distance(b));
  const primary = nearby[0];
  if (!primary) return { note: measured ? 'Außerhalb der Größentabelle.' : 'Mit Maßband verfeinern.' };
  const [size] = primary;
  if (!product.sizes?.includes(size)) return { note: `Größe ${size} ist für dieses Stück nicht gelistet.` };

  const alternative = nearby.find(([candidate]) => candidate !== size && product.sizes.includes(candidate));
  const basis = measured ? 'Nach Maßband' : 'Geschätzt';
  return { size, note: alternative ? `${basis} · auch ${alternative[0]} prüfen` : basis };
}

export function initOutfitSize(section, getItems) {
  const editor = section.querySelector('[data-size-editor]');
  const form = section.querySelector('[data-size-form]');
  const extra = section.querySelector('[data-size-extra]');
  const fields = Object.fromEntries([...form.querySelectorAll('[data-size-field]')].map(input => [input.dataset.sizeField, input]));
  const result = section.querySelector('[data-size-result]');
  const title = section.querySelector('[data-size-result-title]');
  const recommendations = section.querySelector('[data-size-recommendations]');
  const basis = section.querySelector('[data-size-basis]');
  const refine = section.querySelector('[data-size-refine]');
  const clear = section.querySelector('[data-size-clear]');
  let profile;

  function render() {
    result.hidden = !profile;
    if (!profile) {
      recommendations.replaceChildren();
      return;
    }

    const rows = getItems().filter(({ product }) => product).map(({ slot, label, product }) => {
      const recommendation = recommendSize(product, slot, profile);
      const row = document.createElement('li');
      const item = document.createElement('div');
      const detail = document.createElement('small');
      item.textContent = label;
      detail.textContent = product.name;
      item.append(detail);
      const advice = document.createElement('div');
      advice.className = 'outfit-size-advice';
      if (recommendation.size) {
        const size = document.createElement('strong');
        size.textContent = recommendation.size;
        size.setAttribute('aria-label', `Größe ${recommendation.size}`);
        advice.append(size);
      }
      const note = document.createElement('small');
      note.textContent = recommendation.note;
      advice.append(note);
      row.append(item, advice);
      return row;
    });
    recommendations.replaceChildren(...rows);
    basis.textContent = profile.chest && profile.waist
      ? 'Abgleich mit den Größentabellen. Bei Hosen die Beinlänge separat prüfen.'
      : 'Erste Orientierung. Mit Brust- und Taillenumfang wird die Empfehlung genauer.';
    refine.textContent = profile.chest && profile.waist ? 'Maße bearbeiten' : 'Maße ergänzen';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    profile = {
      estimated: estimateSizeMeasures(fields.height.valueAsNumber, fields.weight.valueAsNumber),
      chest: fields.chest.valueAsNumber,
      waist: fields.waist.valueAsNumber,
    };
    render();
    editor.open = false;
    title.focus();
  });
  form.addEventListener('input', () => {
    clear.hidden = !Object.values(fields).some(input => input.value !== '');
    if (!profile) return;
    profile = null;
    render();
  });
  form.addEventListener('invalid', event => {
    if (extra.contains(event.target)) extra.open = true;
  }, true);
  form.addEventListener('reset', () => {
    profile = null;
    clear.hidden = true;
    extra.open = false;
    render();
    fields.height.focus();
  });
  refine.addEventListener('click', () => {
    editor.open = true;
    extra.open = true;
    (profile.chest && !profile.waist ? fields.waist : fields.chest).focus();
  });
  section.hidden = false;
  return render;
}
