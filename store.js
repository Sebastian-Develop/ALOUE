const masthead = document.querySelector('.masthead');
const bar = masthead.querySelector('.bar');

function updateMasthead() {
  masthead.classList.toggle('is-scrolled', window.scrollY > 36);
}
window.addEventListener('scroll', updateMasthead, { passive: true });
window.addEventListener('pageshow', updateMasthead);
updateMasthead();

const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
function onTransparencyChange(callback) {
  if (reducedTransparency.addEventListener) reducedTransparency.addEventListener('change', callback);
  else reducedTransparency.addListener(callback);
}

const updateGlass = () => {
  bar.classList.toggle('liquid-glass', !reducedTransparency.matches);
};
onTransparencyChange(updateGlass);
updateGlass();

import('./nav-refraction.js?v=collections').then(async ({ attachNavRefraction }) => {
  const updateMap = await attachNavRefraction(bar);
  if (updateMap) {
    onTransparencyChange(updateMap);
    updateMap();
  }
}).catch(() => {
  // Keep the CSS glass surface if the optics module cannot load.
});

const catalog = JSON.parse(document.querySelector('#shop-catalog').textContent);
const products = new Map(catalog.map(product => [product.id, {
  ...product,
  photos: [product.image, ...(product.gallery || [])].map(image => new URL(image, import.meta.url).href),
}]));
const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const euros = cents => money.format(cents / 100);
const hasPrice = product => Number.isSafeInteger(product.price) && product.price >= 0;
const search = document.querySelector('#search');
const searchField = document.querySelector('#search-field');
const searchStatus = document.querySelector('#search-status');
const searchResults = document.querySelector('#search-results');
const productDialog = document.querySelector('#product');
const productForm = document.querySelector('#product-form');
const productSize = productForm.querySelector('select');
const detailImage = productDialog.querySelector('.detail-image');
const detailGallery = productDialog.querySelector('.detail-gallery');
const photoCount = productDialog.querySelector('[data-photo-count]');
const bag = document.querySelector('#bag');
const bagItems = document.querySelector('#bag-items');
const bagStatus = document.querySelector('#bag-status');
const bagFooter = bag.querySelector('.bag-footer');
const bagBrowse = bag.querySelector('.bag-browse');
const bagTrigger = document.querySelector('.bag-trigger');
const bagCount = bagTrigger.querySelector('[data-bag-count]');
const bagKey = 'aloue-preview-bag-v1';
const defaultSizes = ['S', 'M', 'L', 'XL'];
const sizesFor = product => product.sizes || defaultSizes;
let activeProduct;
let activePhoto = 0;
let returnFocus;

function loadBag(fallback = []) {
  try {
    const items = JSON.parse(localStorage.getItem(bagKey));
    return Array.isArray(items) ? items.filter(item =>
      item && products.has(item.id) && sizesFor(products.get(item.id)).includes(item.size) &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
    ) : [];
  } catch {
    return fallback;
  }
}
let items = loadBag();

function syncBag() {
  items = loadBag(items);
  renderBag();
}
window.addEventListener('pageshow', syncBag);
window.addEventListener('storage', event => {
  if (event.key === bagKey || event.key === null) syncBag();
});

function saveBag() {
  try {
    localStorage.setItem(bagKey, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
  renderBag();
}

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function renderBag() {
  const count = items.reduce((total, item) => total + item.quantity, 0);
  bagCount.textContent = count;
  bagTrigger.setAttribute('aria-label', `Tasche öffnen, ${count} Artikel`);
  bagFooter.hidden = count === 0;

  if (!count) {
    bagItems.replaceChildren(element('p', 'Deine Tasche ist leer.'));
    return;
  }

  let subtotal = 0;
  let allPriced = true;
  const rows = items.map((item, index) => {
    const product = products.get(item.id);
    const priced = hasPrice(product);
    const price = priced ? product.price * item.quantity : 0;
    const row = document.createElement('div');
    const variant = `${product.name}, ${product.tone}, Größe ${item.size}`;
    const remove = element('button', 'Entfernen');
    remove.type = 'button';
    remove.className = 'bag-remove';
    remove.setAttribute('aria-label', `${variant} entfernen`);
    remove.addEventListener('click', () => {
      items = items.filter(entry => entry !== item);
      saveBag();
      bagStatus.textContent = `${variant} aus der Tasche entfernt.`;
      const nextRow = bagItems.children[index] || bagItems.lastElementChild;
      (nextRow?.querySelector('.bag-remove') || bagBrowse).focus();
    });
    const quantity = document.createElement('div');
    quantity.className = 'bag-quantity';
    quantity.setAttribute('role', 'group');
    quantity.setAttribute('aria-label', `Menge für ${variant}`);
    const steps = [-1, 1].map(change => {
      const direction = change < 0 ? 'verringern' : 'erhöhen';
      const step = element('button', change < 0 ? '−' : '+');
      step.type = 'button';
      step.className = 'icon-button';
      step.dataset.quantity = direction;
      step.setAttribute('aria-label', `Menge ${direction} für ${variant}`);
      step.disabled = item.quantity + change < 1 || item.quantity + change > 99;
      step.addEventListener('click', () => {
        item.quantity += change;
        saveBag();
        bagStatus.textContent = `${variant}, Menge ${item.quantity}.`;
        const updatedRow = bagItems.children[index];
        const nextControl = updatedRow.querySelector(`[data-quantity="${direction}"]:not(:disabled)`);
        (nextControl || updatedRow.querySelector('[data-quantity]:not(:disabled)')).focus({ preventScroll: true });
      });
      return step;
    });
    quantity.append(steps[0], element('span', item.quantity), steps[1]);
    const actions = document.createElement('div');
    actions.className = 'bag-line-actions';
    actions.append(quantity, remove);
    const photo = document.createElement('img');
    photo.className = 'bag-photo';
    photo.src = product.photos[0];
    photo.alt = '';
    photo.width = 72;
    photo.height = 108;
    const details = document.createElement('div');
    details.className = 'bag-line-copy';
    const label = element('p', `${product.tone} · Größe ${item.size}`);
    label.className = 'bag-line-meta';
    details.append(
      element('h3', product.name),
      label,
      element('p', priced ? euros(price) : 'Preis folgt'),
      actions,
    );
    row.className = 'bag-row';
    row.append(photo, details);
    subtotal += price;
    allPriced = allPriced && priced;
    return row;
  });
  bagItems.replaceChildren(...rows);
  const subtotalValue = bagFooter.querySelector('[data-subtotal]');
  subtotalValue.parentElement.hidden = !allPriced;
  subtotalValue.textContent = allPriced ? euros(subtotal) : '';
}
renderBag();

function showDialog(dialog, trigger) {
  const previous = document.querySelector('dialog[open]');
  if (previous) previous.close();
  if (trigger) returnFocus = trigger;
  dialog.showModal();
}

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    returnFocus?.focus({ preventScroll: true });
    returnFocus = undefined;
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const { top, right, bottom, left } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
  });
}

function showProductPhoto(product) {
  detailImage.src = product.photos[activePhoto];
  detailImage.alt = product.alt;
  if (detailGallery) {
    detailGallery.hidden = product.photos.length < 2;
    photoCount.textContent = `Bild ${activePhoto + 1} von ${product.photos.length}`;
  }
}

for (const button of productDialog.querySelectorAll('[data-photo-step]')) {
  button.addEventListener('click', () => {
    const product = products.get(activeProduct);
    const count = product.photos.length;
    activePhoto = (activePhoto + Number(button.dataset.photoStep) + count) % count;
    showProductPhoto(product);
  });
}

function showProduct(id, trigger) {
  const product = products.get(id);
  if (!product) return;
  activeProduct = id;
  activePhoto = 0;
  productDialog.querySelector('h2').textContent = product.name;
  productDialog.querySelector('.detail-summary').textContent =
    `${product.tone} · ${hasPrice(product) ? euros(product.price) : 'Preis folgt'}`;
  for (const [selector, value] of [
    ['.detail-description', product.description],
    ['[data-product-material]', product.material],
    ['[data-product-fit]', product.fit],
  ]) {
    const field = productDialog.querySelector(selector);
    if (field) field.textContent = value || '';
  }
  showProductPhoto(product);
  productSize.replaceChildren(
    new Option('Größe wählen', ''),
    ...sizesFor(product).map(size => new Option(size, size)),
  );
  productForm.reset();
  showDialog(productDialog, trigger);
  productDialog.scrollTop = 0;
}

const searchCategories = [
  [/^wool-blend-jacket-/, 'jacke jacken jacket jackets blouson wolloptik wool look'],
  [/^men-gilet-reversible-/, 'weste westen wendewesten vest vests gilet gilets bodywarmer wendbar reversible travelstoff'],
  [/^men-jacket-reversible-/, 'jacke jacken jacket jackets wendejacken wendbar reversible travelstoff'],
  [/^men-parka-jacket-/, 'jacke jacken jacket jackets parkas kapuze kapuzenjacke kapuzenjacken hood hooded utility'],
  [/^men-cotton-shirt-long-sleeves-/, 'longsleeve langarm langarmshirt langarmshirts oberteil shirt shirts baumwolle lange armel'],
  [/^men-cotton-t-shirt-/, 'tshirt tee shirt shirts shortsleeve kurzarm kurzarmshirt kurzarmshirts oberteil baumwolle kurze armel'],
  [/^(men-trousers|tapered-chino)-/, 'hose hosen pantalon pants trouser trousers chino travelstoff'],
];
const searchColors = {
  Schwarz: 'black',
  Grau: 'gray grey',
  Dunkelgrau: 'grau gray grey dark charcoal anthrazit',
  Dunkelblau: 'blau blue dark navy',
  'Cloud Blue': 'blau hellblau light blue',
  'Teal Blue': 'blau petrol teal',
  Espresso: 'braun dunkelbraun brown',
  Bordeaux: 'burgundy bordeaux maroon weinrot',
  Oliv: 'olive grun gruen green',
  Beige: 'sand',
  Kit: 'ecru creme cream offwhite off-white',
  Falcon: 'taupe',
};
const exactCategoryTerms = new Set(['short', 'shorts', 'bermuda', 'bermudas', 'polo', 'polos']);

function normalizeSearch(value) {
  return value
    .toLocaleLowerCase('de')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\bt\s*shirts?\b/g, 'tshirt')
    .replace(/\blong\s*sleeves?\b/g, 'longsleeve')
    .replace(/\bshort\s*sleeves?\b/g, 'shortsleeve')
    .trim();
}

const searchIndex = [...products].map(([id, product]) => {
  const label = normalizeSearch(`${product.name} ${product.tone}`);
  const category = searchCategories.find(([pattern]) => pattern.test(id))?.[1] || '';
  const colors = product.tone.split(/\s*\/\s*/).map(tone => searchColors[tone] || '').join(' ');
  const titleWords = label.split(' ');
  const length = product.name.match(/\bL(\d{2})\b/)?.[1] || '';
  const alternateWords = normalizeSearch(`${category} ${colors} ${length}`).split(' ');
  return { id, product, label, titleWords, alternateWords, words: [...new Set([...titleWords, ...alternateWords])] };
});
const featuredSearchResults = searchIndex.filter(({ product }) => product.featured);

function differsByOneLetter(term, word) {
  if (Math.abs(term.length - word.length) > 1) return false;
  let i = 0;
  while (i < term.length && term[i] === word[i]) i += 1;
  if (i === term.length && i === word.length) return false;
  if (term.length > word.length) return term.slice(i + 1) === word.slice(i);
  if (word.length > term.length) return term.slice(i) === word.slice(i + 1);
  return term.slice(i + 1) === word.slice(i + 1) ||
    (term[i] === word[i + 1] && term[i + 1] === word[i] && term.slice(i + 2) === word.slice(i + 2));
}

function scoreSearchTerm(entry, term) {
  if (entry.titleWords.includes(term)) return 6;
  if (entry.alternateWords.includes(term)) return 5;
  if (exactCategoryTerms.has(term)) return 0;
  if (entry.titleWords.some(word => word.startsWith(term))) return 4;
  if (entry.alternateWords.some(word => word.startsWith(term))) return 3;
  if (term.length < 4) return 0;
  return entry.words.some(word => differsByOneLetter(term, word)) ? 1 : 0;
}

function findSearchResults(query) {
  const terms = query.split(' ');
  const matches = searchIndex.flatMap(entry => {
    const scores = terms.map(term => scoreSearchTerm(entry, term));
    if (scores.includes(0)) return [];
    const score = scores.reduce((total, value) => total + value, entry.label.includes(query) ? 6 : 0);
    return [{ ...entry, score, literal: !scores.includes(1) }];
  });
  const literalMatches = matches.filter(({ literal }) => literal);
  return (literalMatches.length ? literalMatches : matches).sort((left, right) => right.score - left.score);
}

function renderSearch() {
  const query = normalizeSearch(searchField.value);
  const featured = featuredSearchResults.length ? featuredSearchResults : searchIndex.slice(0, 6);
  const matches = query ? findSearchResults(query) : featured;
  if (!matches.length) searchStatus.textContent = 'Keine passenden Produkte gefunden.';
  else if (!query) searchStatus.textContent = 'Ausgewählte Produkte';
  else searchStatus.textContent = matches.length === 1 ? '1 Produkt gefunden' : `${matches.length} Produkte gefunden`;

  searchResults.replaceChildren(...matches.map(({ id, product }) => {
    const button = element('button');
    button.type = 'button';
    button.className = 'search-result';
    button.dataset.searchProduct = id;
    const photo = element('img');
    photo.className = 'search-result-photo';
    photo.src = product.photos[0];
    photo.alt = '';
    photo.width = 44;
    photo.height = 52;
    photo.loading = 'lazy';
    photo.decoding = 'async';
    const label = element('span', product.name);
    label.className = 'search-result-label';
    label.append(element('small', product.tone));
    button.append(photo, label);
    if (hasPrice(product)) button.append(element('span', euros(product.price)));
    return button;
  }));
}
searchField.addEventListener('input', renderSearch);
searchResults.addEventListener('click', event => {
  const button = event.target.closest('[data-search-product]');
  if (button) showProduct(button.dataset.searchProduct);
});
search.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.metaKey || event.ctrlKey) return;
  const atField = event.target === searchField;
  const buttons = [...searchResults.querySelectorAll('[data-search-product]')];
  const index = buttons.indexOf(event.target);
  if (!buttons.length || (!atField && index < 0)) return;
  if (atField && event.key === 'Enter') {
    event.preventDefault();
    buttons[0].click();
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? index + 1 : (atField ? buttons.length - 1 : index - 1);
    (buttons[next] || searchField).focus();
  }
});

document.addEventListener('click', event => {
  const open = event.target.closest('[data-open]');
  const close = event.target.closest('[data-close]');
  const product = event.target.closest('[data-product]');

  if (open) {
    const dialog = document.getElementById(open.dataset.open);
    if (dialog === search) renderSearch();
    showDialog(dialog, open);
    if (dialog === search) {
      search.scrollTop = 0;
      searchField.focus({ preventScroll: true });
    }
  }
  if (close) close.closest('dialog').close();
  if (product) showProduct(product.dataset.product, product);
});

const menswearTrigger = document.querySelector('.menswear-trigger');
const menswearMenu = document.querySelector('#menswear-menu');
const firstMenswearLink = menswearMenu.querySelector('a');

function setMenswearOpen(open) {
  menswearTrigger.setAttribute('aria-expanded', open);
  menswearMenu.hidden = !open;
  if (open) firstMenswearLink.focus({ preventScroll: true });
}

menswearTrigger.addEventListener('click', () => setMenswearOpen(menswearMenu.hidden));
function dismissMenswearOutside(event) {
  if (!menswearMenu.hidden && !menswearMenu.contains(event.target) && !menswearTrigger.contains(event.target)) {
    setMenswearOpen(false);
  }
}
document.addEventListener('click', dismissMenswearOutside);
document.addEventListener('focusin', dismissMenswearOutside);
document.addEventListener('keydown', event => {
  if (menswearMenu.hidden || event.key !== 'Escape') return;
  event.preventDefault();
  setMenswearOpen(false);
  menswearTrigger.focus({ preventScroll: true });
});
window.addEventListener('resize', () => {
  if (!menswearMenu.hidden && menswearTrigger.getClientRects().length === 0) setMenswearOpen(false);
}, { passive: true });

document.addEventListener('click', event => {
  const link = event.target.closest('[data-collection-link]');
  if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  link.closest('dialog')?.close();
  if (menswearMenu.contains(link)) setMenswearOpen(false);
});

if (document.body.hasAttribute('data-shop-home')) {
  const legacyCategoryLinks = new Map([...document.querySelectorAll('[data-legacy-category]')]
    .map(link => ['#menswear-' + link.dataset.legacyCategory, link.href]));
  const followLegacyCategory = () => {
    const location = legacyCategoryLinks.get(window.location.hash);
    if (location) window.location.replace(location);
  };
  window.addEventListener('hashchange', followLegacyCategory);
  followLegacyCategory();
}

productForm.addEventListener('submit', event => {
  event.preventDefault();
  const size = productSize.value;
  const product = products.get(activeProduct);
  if (!product || !sizesFor(product).includes(size)) return;
  const item = items.find(entry => entry.id === activeProduct && entry.size === size);

  if (item) {
    item.quantity = Math.min(item.quantity + 1, 99);
  } else {
    items.push({ id: activeProduct, size, quantity: 1 });
  }
  saveBag();
  showDialog(bag);
});
