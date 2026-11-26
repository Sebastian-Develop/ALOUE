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
const searchResults = document.querySelector('#search-results');
const productDialog = document.querySelector('#product');
const productForm = document.querySelector('#product-form');
const productSize = productForm.querySelector('select');
const detailImage = productDialog.querySelector('.detail-image');
const detailGallery = productDialog.querySelector('.detail-gallery');
const photoCount = productDialog.querySelector('[data-photo-count]');
const bag = document.querySelector('#bag');
const bagItems = document.querySelector('#bag-items');
const bagFooter = bag.querySelector('.bag-footer');
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
  const rows = items.map(item => {
    const product = products.get(item.id);
    const priced = hasPrice(product);
    const price = priced ? product.price * item.quantity : 0;
    const row = document.createElement('div');
    const remove = element('button', 'Entfernen');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${product.name}, ${product.tone}, Größe ${item.size}, entfernen`);
    remove.addEventListener('click', () => {
      items = items.filter(entry => entry !== item);
      saveBag();
      (bagItems.querySelector('button') || bag.querySelector('[data-close]')).focus();
    });
    row.className = 'bag-row';
    row.append(
      element('h3', product.name),
      element('p', priced ? euros(price) : 'Preis folgt'),
      element('p', `${product.tone} · Größe ${item.size} · Menge ${item.quantity}`),
      remove
    );
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
}

function renderSearch() {
  const terms = searchField.value.trim().toLocaleLowerCase('de').split(/\s+/);
  const matches = [...products].filter(([, product]) => {
    const searchable = `${product.name} ${product.tone}`.toLocaleLowerCase('de');
    return terms.every(term => searchable.includes(term));
  });
  searchResults.replaceChildren(...matches.map(([id, product]) => {
    const button = element('button');
    button.type = 'button';
    button.className = 'search-result';
    const label = element('span', product.name);
    label.append(element('small', product.tone));
    button.append(label);
    if (hasPrice(product)) button.append(element('span', euros(product.price)));
    button.addEventListener('click', () => showProduct(id));
    return button;
  }));
  if (!matches.length) searchResults.append(element('p', 'Keine passenden Stücke gefunden.'));
}
searchField.addEventListener('input', renderSearch);

document.addEventListener('click', event => {
  const open = event.target.closest('[data-open]');
  const close = event.target.closest('[data-close]');
  const product = event.target.closest('[data-product]');

  if (open) {
    const dialog = document.getElementById(open.dataset.open);
    if (dialog === search) {
      searchField.value = '';
      renderSearch();
    }
    showDialog(dialog, open);
  }
  if (close) close.closest('dialog').close();
  if (product) showProduct(product.closest('.product').dataset.id, product);
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
