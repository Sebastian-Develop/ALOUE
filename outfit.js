import { matchOutfit } from './outfit-match.js?v=look-refine';
import { initOutfitSize } from './outfit-size.js?v=size-advice-scroll';

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

function previewKind(slot, product) {
  if (slot === 'trousers') return product.id.includes('-l34-') ? 'trousers-l34' : 'trousers-l32';
  if (slot === 'shirt') return product.id.includes('-long-sleeves-') ? 'longsleeve' : 't-shirt';
  if (product.collections.includes('wendewesten')) return 'gilet';
  if (product.collections.includes('wendejacken')) return 'reversible-jacket';
  if (product.collections.includes('kapuzenjacken')) return 'parka';
  return 'wool-jacket';
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
  const match = root.querySelector('[data-outfit-match]');
  const matchNote = root.querySelector('[data-outfit-match-note]');
  const matchReset = root.querySelector('[data-outfit-match-reset]');
  const layerButton = root.querySelector('[data-outfit-layer]');
  const feedback = root.querySelector('[data-outfit-feedback]');
  const canvas = root.querySelector('[data-outfit-canvas]');
  const poster = root.querySelector('[data-outfit-poster]');
  const expand = root.querySelector('[data-outfit-expand]');
  const photo = root.querySelector('[data-outfit-photo]');
  const controls = root.querySelector('[data-outfit-controls]');
  const panelButtons = [...root.querySelectorAll('[data-outfit-panel-toggle]')];
  const stage = root.querySelector('.outfit-stage');
  const mobileStudio = window.matchMedia('(max-width: 790px)');
  const state = {
    model: models.has('espresso') ? 'espresso' : modelButtons[0].dataset.outfitModel,
    slot: 'jacket',
    items: Object.fromEntries(Object.keys(slots).map(slot => [
      slot, products.has(presets.espresso[slot]) ? presets.espresso[slot] : groups[slot][0]?.id || null,
    ])),
    anchor: '',
    pinned: new Set(),
    showJacket: true,
  };
  let previewVersion = 0;
  let previewActive = false;
  let previewModule;

  const selected = slot => products.get(state.items[slot]);
  const updateSizeAdvice = initOutfitSize(root.querySelector('[data-outfit-size]'), () =>
    Object.entries(slots).map(([slot, { label }]) => ({ slot, label, product: selected(slot) })));

  function setMobilePanel(panel) {
    if (panel) root.dataset.editorPanel = panel;
    else delete root.dataset.editorPanel;
    for (const button of panelButtons) {
      button.setAttribute('aria-expanded', button.dataset.outfitPanelToggle === panel);
    }
  }

  function returnToLook() {
    const previous = root.dataset.editorPanel;
    setMobilePanel();
    panelButtons.find(button => button.dataset.outfitPanelToggle === previous)?.focus({ preventScroll: true });
    stage.scrollIntoView({ block: 'start' });
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash !== '#styling') setMobilePanel();
  });

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
      noJacket.append(element('span', 'outfit-option-name', 'Ohne Jacke oder Weste'));
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
    const activeSlots = Object.keys(slots).filter(slot => state.items[slot]);
    const allPinned = activeSlots.length > 0 && activeSlots.every(slot => state.pinned.has(slot));
    match.disabled = allPinned;
    matchReset.hidden = !allPinned;
    matchNote.textContent = allPinned ? 'Alle Teile im Look sind fest gewählt.' :
      state.pinned.size ? 'Deine gewählten Teile bleiben im Look.' : '';
    matchNote.hidden = !matchNote.textContent;
    for (const button of presetButtons) {
      const preset = presets[button.dataset.outfitPreset];
      button.disabled = !preset || !Object.values(preset).every(id => products.has(id));
      button.setAttribute('aria-pressed', !button.disabled && Object.keys(slots).every(slot => state.items[slot] === preset[slot]));
    }
    summary.replaceChildren(...Object.entries(slots).map(([slot, { label }]) => {
      const row = element('li', 'outfit-selected');
      const product = selected(slot);
      row.append(element('span', 'outfit-selected-slot', label));
      const variant = element('div', 'outfit-selected-variant');
      if (!product) {
        const empty = element('span', 'outfit-selected-item', slot === 'jacket' ? 'Ohne Jacke oder Weste' : 'Nicht gewählt');
        if (slot === 'jacket') {
          empty.dataset.outfitEmptyJacket = '';
          empty.tabIndex = -1;
        }
        variant.append(empty);
      } else {
        const button = element('button', 'outfit-selected-item', product.name);
        button.type = 'button';
        button.dataset.product = product.id;
        button.append(element('small', '', product.tone));
        variant.append(button);
        if (slot === 'jacket') {
          const remove = element('button', 'outfit-remove');
          remove.type = 'button';
          remove.dataset.outfitRemoveJacket = '';
          remove.setAttribute('aria-label', `${product.name} in ${product.tone} aus dem Look entfernen`);
          const icon = element('span', '', '×');
          icon.setAttribute('aria-hidden', 'true');
          remove.append(icon);
          variant.append(remove);
        }
      }
      row.append(variant);
      return row;
    }));
    updateSizeAdvice();
  }

  function updateLayerButton() {
    if (!layerButton) return;
    const outerwear = selected('jacket');
    layerButton.hidden = !outerwear;
    layerButton.setAttribute('aria-pressed', state.showJacket);
    if (outerwear) {
      const name = outerwear.collections.includes('wendewesten') ? 'Weste' : 'Jacke';
      layerButton.textContent = `${name} in Vorschau zeigen`;
    }
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
    if (canvas.hidden) poster.hidden = false;
  }

  async function updatePreview() {
    if (!previewActive) return;
    const version = ++previewVersion;
    expand.disabled = true;
    const button = models.get(state.model);
    const garmentNames = [];
    const modelName = button.dataset.name || button.textContent.trim();
    const outfit = {
      model: { id: state.model, src: new URL(button.dataset.src, document.baseURI).href },
    };
    for (const slot of Object.keys(slots)) {
      if (slot === 'jacket' && !state.showJacket) continue;
      const product = selected(slot);
      if (!product) continue;
      outfit[slot] = {
        id: product.id,
        src: product.photo,
        kind: previewKind(slot, product),
        tone: product.tone,
        swatches: product.swatches,
      };
      garmentNames.push(`${product.name} in ${product.tone}`);
    }

    try {
      previewModule ??= import('./outfit-preview.js?v=beige-wool-plate');
      const { renderOutfitPreview } = await previewModule;
      if (version !== previewVersion) return;
      const rendered = await renderOutfitPreview(canvas, outfit);
      if (version !== previewVersion || rendered === false) return;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${modelName}, Stylingvorschau: ${garmentNames.join(', ')}`);
      canvas.hidden = false;
      poster.hidden = true;
      expand.disabled = false;
    } catch {
      if (version !== previewVersion) return;
      canvas.hidden = true;
      poster.hidden = false;
      expand.disabled = true;
      feedback.textContent = 'Die Bildvorschau ist gerade nicht verfügbar. Die gewählten Stücke stehen unter „Im Look“.';
    }
  }

  expand.addEventListener('click', () => {
    photo.width = canvas.width;
    photo.height = canvas.height;
    photo.getContext('2d').drawImage(canvas, 0, 0);
    photo.setAttribute('aria-label', canvas.getAttribute('aria-label'));
  });

  function commitOutfit(message) {
    feedback.textContent = message;
    renderSelection();
    updatePreview();
  }

  function chooseItem(slot, id) {
    const revealsJacket = slot === 'jacket' && id && !state.showJacket;
    if (state.items[slot] === id && (!id || state.pinned.has(slot)) && !revealsJacket) return;
    state.items[slot] = id;
    if (id) {
      state.pinned.add(slot);
      state.anchor = slot;
      if (slot === 'jacket') state.showJacket = true;
    } else {
      state.pinned.delete(slot);
      if (state.anchor === slot) state.anchor = '';
    }
    const product = selected(slot);
    commitOutfit(product ? `${product.name} in ${product.tone} ausgewählt.` : 'Jacke oder Weste aus dem Look entfernt.');
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    const { outfitSlot, outfitModel, outfitPreset, outfitChoice, outfitPanelToggle } = button.dataset;

    if (outfitPanelToggle) {
      if (root.dataset.editorPanel === outfitPanelToggle) return returnToLook();
      setMobilePanel(outfitPanelToggle);
      controls.focus({ preventScroll: true });
      controls.scrollIntoView({ block: 'start' });
      return;
    }
    if (button.hasAttribute('data-outfit-panel-back')) return returnToLook();

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
      state.pinned.clear();
      state.showJacket = true;
      state.items = { ...presets[outfitPreset] };
      commitOutfit('Kampagnenlook ausgewählt.');
      if (mobileStudio.matches && root.dataset.editorPanel) returnToLook();
    } else if (outfitChoice !== undefined) {
      chooseItem(state.slot, outfitChoice || null);
    } else if (button.hasAttribute('data-outfit-remove-jacket')) {
      chooseItem('jacket', null);
      summary.querySelector('[data-outfit-empty-jacket]')?.focus({ preventScroll: true });
    } else if (button === matchReset) {
      state.pinned.clear();
      state.anchor = '';
      renderSelection();
      feedback.textContent = 'Die Kombination ist für Vorschläge freigegeben.';
      match.focus({ preventScroll: true });
    } else if (button === match) {
      const preferred = presets[state.model] || presets.espresso;
      state.items = matchOutfit(groups, products, state.items, state.anchor, preferred, state.pinned);
      state.showJacket = true;
      commitOutfit('Passende Stücke für den Look ausgewählt.');
      if (mobileStudio.matches && root.dataset.editorPanel) returnToLook();
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
