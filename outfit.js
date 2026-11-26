const slots = {
  jacket: { label: 'Jacke oder Weste', categories: ['jacken', 'wendewesten'] },
  shirt: { label: 'Oberteil', categories: ['t-shirts-longsleeves'] },
  trousers: { label: 'Hose', categories: ['hosen-shorts'] },
};

const presets = {
  espresso: {
    jacket: 'wool-blend-jacket-espresso',
    shirt: 'men-cotton-t-shirt-black',
    trousers: 'men-trousers-l32-dark-grey',
  },
  kit: {
    jacket: 'men-jacket-reversible-beige-kit',
    shirt: 'men-cotton-t-shirt-kit',
    trousers: 'men-trousers-l32-beige',
  },
  contrast: {
    jacket: 'men-jacket-reversible-teal-blue-falcon',
    shirt: 'men-cotton-t-shirt-kit',
    trousers: 'men-trousers-l32-falcon',
  },
};

const palette = {
  Espresso: ['Kit', 'Dunkelgrau', 'Beige', 'Falcon'],
  Beige: ['Falcon', 'Kit', 'Espresso', 'Dunkelblau'],
  Kit: ['Falcon', 'Dunkelgrau', 'Espresso', 'Beige'],
  Falcon: ['Kit', 'Espresso', 'Teal Blue', 'Beige'],
  Schwarz: ['Kit', 'Grau', 'Dunkelgrau', 'Beige'],
  Grau: ['Kit', 'Dunkelblau', 'Schwarz', 'Espresso'],
  Dunkelgrau: ['Kit', 'Espresso', 'Beige', 'Dunkelblau'],
  Dunkelblau: ['Kit', 'Dunkelgrau', 'Beige', 'Cloud Blue'],
  'Cloud Blue': ['Kit', 'Dunkelblau', 'Dunkelgrau', 'Beige'],
  'Teal Blue': ['Falcon', 'Kit', 'Dunkelgrau', 'Beige'],
  Oliv: ['Kit', 'Beige', 'Espresso', 'Falcon'],
  'Deep Depth': ['Kit', 'Falcon', 'Beige', 'Dunkelgrau'],
  Bordeaux: ['Kit', 'Dunkelgrau', 'Falcon', 'Schwarz'],
};

function element(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function normalize(value) {
  return value.toLocaleLowerCase('de')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\bt\s*shirts?\b/g, 'tshirt')
    .replace(/\blong\s*sleeves?\b/g, 'longsleeve')
    .trim();
}

function tones(product) {
  return product.tone.split(/\s*\/\s*/);
}

function affinity(product, reference) {
  let best = 0;
  for (const a of tones(product)) {
    for (const b of tones(reference)) {
      const rank = palette[a]?.indexOf(b) ?? -1;
      const reverse = palette[b]?.indexOf(a) ?? -1;
      const points = Math.max(rank < 0 ? 0 : 4 - rank, reverse < 0 ? 0 : 4 - reverse, a === b ? 1 : 0);
      best = Math.max(points, best);
    }
  }
  return best;
}

function matchOutfit(groups, products, selection, anchor, preferredLook) {
  const next = { ...selection };
  const references = [];
  if (products.has(selection[anchor])) references.push(products.get(selection[anchor]));

  for (const slot of Object.keys(slots)) {
    if (slot === anchor || (slot === 'jacket' && !selection.jacket)) continue;
    let bestScore = -Infinity;
    for (const product of groups[slot]) {
      const preference = product.id === preferredLook[slot] ? 0.5 : 0;
      const score = references.reduce((total, reference) => total + affinity(product, reference), preference);
      if (score > bestScore) {
        next[slot] = product.id;
        bestScore = score;
      }
    }
    if (products.has(next[slot])) references.push(products.get(next[slot]));
  }
  return next;
}

function initOutfitBuilder(root, catalog) {
  const inventory = catalog.map(product => ({
    ...product,
    photo: new URL(product.image, import.meta.url).href,
    search: normalize(`${product.name} ${product.tone} ${product.id}`),
  }));
  const products = new Map(inventory.map(product => [product.id, product]));
  const groups = Object.fromEntries(Object.entries(slots).map(([key, { categories }]) => [
    key,
    inventory.filter(product => product.collections.some(collection => categories.includes(collection))),
  ]));
  const modelButtons = [...root.querySelectorAll('[data-outfit-model]')];
  const models = new Map(modelButtons.map(button => [button.dataset.outfitModel, button]));
  const slotButtons = [...root.querySelectorAll('[data-outfit-slot]')];
  const presetButtons = [...root.querySelectorAll('[data-outfit-preset]')];
  const list = root.querySelector('[data-outfit-list]');
  const search = root.querySelector('[data-outfit-search]');
  const count = root.querySelector('[data-outfit-count]');
  const summary = root.querySelector('[data-outfit-summary]');
  const layerButton = root.querySelector('[data-outfit-layer]');
  const feedback = root.querySelector('[data-outfit-feedback]');
  const canvas = root.querySelector('[data-outfit-canvas]');
  const poster = root.querySelector('[data-outfit-poster]');
  const state = {
    model: models.has('espresso') ? 'espresso' : modelButtons[0].dataset.outfitModel,
    slot: 'jacket',
    items: Object.fromEntries(Object.keys(slots).map(slot => [
      slot, products.has(presets.espresso[slot]) ? presets.espresso[slot] : groups[slot][0]?.id || null,
    ])),
    anchor: '',
    showJacket: true,
  };
  let previewVersion = 0;
  let previewActive = false;
  let previewModule;

  const selected = slot => products.get(state.items[slot]);

  function renderChoices() {
    slotButtons.forEach(button => button.setAttribute('aria-pressed', button.dataset.outfitSlot === state.slot));
    const query = normalize(search.value);
    const terms = query ? query.split(' ') : [];
    const matches = groups[state.slot].filter(product => terms.every(term => product.search.includes(term)));
    const choices = matches.map(product => {
      const button = element('button', 'outfit-option');
      button.type = 'button';
      button.dataset.outfitChoice = product.id;
      const photo = element('img', 'outfit-option-image');
      photo.src = product.photo;
      photo.alt = '';
      photo.width = 44;
      photo.height = 54;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      const copy = element('span', 'outfit-option-copy');
      copy.append(element('span', 'outfit-option-name', product.name), element('small', 'outfit-option-tone', product.tone));
      button.append(photo, copy);
      return button;
    });
    if (state.slot === 'jacket' && !query) {
      const noJacket = element('button', 'outfit-option outfit-option--none');
      noJacket.type = 'button';
      noJacket.dataset.outfitChoice = '';
      noJacket.append(element('span', 'outfit-option-name', 'Ohne Jacke'));
      choices.unshift(noJacket);
    }
    if (!choices.length) choices.push(element('p', 'outfit-empty', 'Keine passenden Stücke gefunden.'));
    list.replaceChildren(...choices);
    list.scrollTop = 0;
    count.textContent = matches.length === 1 ? '1 Stück' : `${matches.length} Stücke`;
    markSelectedChoices();
  }

  function markSelectedChoices() {
    for (const button of list.querySelectorAll('[data-outfit-choice]')) {
      button.setAttribute('aria-pressed', (button.dataset.outfitChoice || null) === state.items[state.slot]);
    }
  }

  function renderSelection() {
    markSelectedChoices();
    updateLayerButton();
    for (const button of presetButtons) {
      const preset = presets[button.dataset.outfitPreset];
      button.disabled = !preset || !Object.values(preset).every(id => products.has(id));
      button.setAttribute('aria-pressed', !button.disabled && Object.keys(slots).every(slot => state.items[slot] === preset[slot]));
    }
    summary.replaceChildren(...Object.entries(slots).map(([slot, { label }]) => {
      const row = element('li', 'outfit-selected');
      const product = selected(slot);
      row.append(element('span', 'outfit-selected-slot', label));
      if (!product) {
        row.append(element('span', 'outfit-selected-item', slot === 'jacket' ? 'Ohne Jacke' : 'Nicht gewählt'));
      } else {
        const button = element('button', 'outfit-selected-item', product.name);
        button.type = 'button';
        button.dataset.product = product.id;
        button.append(element('small', '', product.tone));
        row.append(button);
      }
      return row;
    }));
  }

  function updateLayerButton() {
    if (!layerButton) return;
    layerButton.hidden = !selected('jacket');
    layerButton.setAttribute('aria-pressed', state.showJacket);
  }

  function showJacketInPreview(show) {
    if (state.showJacket === show) return;
    state.showJacket = show;
    updateLayerButton();
    updatePreview();
  }

  function updateModel() {
    const button = models.get(state.model);
    for (const model of modelButtons) {
      model.setAttribute('aria-pressed', model === button);
    }
    poster.src = button.dataset.src;
    const name = button.dataset.name || button.textContent.trim();
    poster.alt = button.dataset.alt || `${name} aus der ALOUÉ-Kampagne`;
    poster.hidden = false;
    canvas.hidden = true;
  }

  async function updatePreview() {
    if (!previewActive) return;
    const version = ++previewVersion;
    const button = models.get(state.model);
    const garmentNames = [];
    const modelName = button.dataset.name || button.textContent.trim();
    const outfit = { model: { src: new URL(button.dataset.src, document.baseURI).href } };
    for (const slot of Object.keys(slots)) {
      if (slot === 'jacket' && !state.showJacket) continue;
      const product = selected(slot);
      if (!product) continue;
      outfit[slot] = product.photo;
      garmentNames.push(`${product.name} in ${product.tone}`);
    }

    try {
      if (button.dataset.previewSlots) outfit.model.slots = JSON.parse(button.dataset.previewSlots);
      previewModule ??= import('./outfit-preview.js');
      const { renderOutfitPreview } = await previewModule;
      if (version !== previewVersion) return;
      const rendered = await renderOutfitPreview(canvas, outfit);
      if (version !== previewVersion || rendered === false) return;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${modelName}, Stylingvorschau: ${garmentNames.join(', ')}`);
      canvas.hidden = false;
      poster.hidden = true;
    } catch {
      if (version !== previewVersion) return;
      canvas.hidden = true;
      poster.hidden = false;
      feedback.textContent = 'Die Bildvorschau ist gerade nicht verfügbar. Die gewählten Stücke stehen darunter.';
    }
  }

  function commitOutfit(message) {
    feedback.textContent = message;
    renderSelection();
    updatePreview();
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    const { outfitSlot, outfitModel, outfitPreset, outfitChoice } = button.dataset;

    if (outfitSlot && Object.hasOwn(slots, outfitSlot) && state.slot !== outfitSlot) {
      state.slot = outfitSlot;
      search.value = '';
      renderChoices();
      showJacketInPreview(outfitSlot !== 'shirt');
    } else if (outfitModel && models.has(outfitModel) && state.model !== outfitModel) {
      state.model = outfitModel;
      updateModel();
      updatePreview();
    } else if (outfitPreset && presets[outfitPreset] && !button.disabled) {
      state.anchor = '';
      state.showJacket = true;
      state.items = { ...presets[outfitPreset] };
      commitOutfit('Kampagnenlook ausgewählt.');
    } else if (outfitChoice !== undefined) {
      const id = outfitChoice || null;
      if (id === state.items[state.slot]) return;
      state.items[state.slot] = id;
      state.anchor = state.slot;
      if (state.slot === 'jacket' && id) state.showJacket = true;
      const product = selected(state.slot);
      commitOutfit(product ? `${product.name} in ${product.tone} ausgewählt.` : 'Jacke entfernt.');
    } else if (button.hasAttribute('data-outfit-match')) {
      const preferred = presets[state.model] || presets.espresso;
      state.items = matchOutfit(groups, products, state.items, state.anchor, preferred);
      state.showJacket = true;
      commitOutfit('Passende Stücke für den Look ausgewählt.');
    } else if (button === layerButton && selected('jacket')) {
      showJacketInPreview(!state.showJacket);
    }
  });

  search.addEventListener('input', renderChoices);
  search.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    const first = list.querySelector('[data-outfit-choice]');
    if (!first) return;
    event.preventDefault();
    first.focus({ preventScroll: true });
    list.scrollTop = 0;
  });

  function startPreview() {
    previewActive = true;
    updatePreview();
  }

  renderChoices();
  renderSelection();
  updateModel();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      startPreview();
    }, { rootMargin: '240px' });
    observer.observe(root);
  } else {
    startPreview();
  }
}

const builder = document.querySelector('[data-outfit]');
const catalog = document.querySelector('#shop-catalog');
if (builder && catalog) initOutfitBuilder(builder, JSON.parse(catalog.textContent));
