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

import('./nav-refraction.js?v=live-glass').then(({ attachNavRefraction }) => {
  const updateMap = attachNavRefraction(bar);
  if (updateMap) {
    onTransparencyChange(updateMap);
    updateMap();
  }
}).catch(() => {
  // Keep the CSS glass surface if the optics module cannot load.
});

const cards = [...document.querySelectorAll('.product')];
const products = new Map(cards.map(card => {
  const image = card.querySelector('img');
  return [card.dataset.id, {
    name: card.querySelector('h3').textContent,
    tone: card.querySelector('.product-tone').textContent.trim(),
    price: Number(card.dataset.price),
    image: image.getAttribute('src'),
    alt: image.alt,
  }];
}));
const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const euros = cents => money.format(cents / 100);
const search = document.querySelector('#search');
const searchField = document.querySelector('#search-field');
const searchResults = document.querySelector('#search-results');
const productDialog = document.querySelector('#product');
const productForm = document.querySelector('#product-form');
const bag = document.querySelector('#bag');
const bagItems = document.querySelector('#bag-items');
const bagFooter = bag.querySelector('.bag-footer');
const bagTrigger = document.querySelector('.bag-trigger');
const bagCount = bagTrigger.querySelector('[data-bag-count]');
const bagKey = 'aloue-preview-bag-v1';
const sizes = new Set(['S', 'M', 'L', 'XL']);
let activeProduct;
let returnFocus;

function loadBag() {
  try {
    const items = JSON.parse(localStorage.getItem(bagKey));
    return Array.isArray(items) ? items.filter(item =>
      item && products.has(item.id) && sizes.has(item.size) &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
    ) : [];
  } catch {
    return [];
  }
}
let items = loadBag();

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
  const rows = items.map(item => {
    const product = products.get(item.id);
    const price = product.price * item.quantity;
    const row = document.createElement('div');
    const remove = element('button', 'Entfernen');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${product.name}, Größe ${item.size}, entfernen`);
    remove.addEventListener('click', () => {
      items = items.filter(entry => entry !== item);
      saveBag();
      (bagItems.querySelector('button') || bag.querySelector('[data-close]')).focus();
    });
    row.className = 'bag-row';
    row.append(
      element('h3', product.name),
      element('p', euros(price)),
      element('p', `Größe ${item.size} · Menge ${item.quantity}`),
      remove
    );
    subtotal += price;
    return row;
  });
  bagItems.replaceChildren(...rows);
  bagFooter.querySelector('[data-subtotal]').textContent = euros(subtotal);
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

function showProduct(id, trigger) {
  const product = products.get(id);
  const image = productDialog.querySelector('.detail-image');
  activeProduct = id;
  productDialog.querySelector('h2').textContent = product.name;
  productDialog.querySelector('.detail-summary').textContent = `${product.tone} · ${euros(product.price)}`;
  image.src = product.image;
  image.alt = product.alt;
  productForm.reset();
  showDialog(productDialog, trigger);
}

function renderSearch() {
  const query = searchField.value.trim().toLocaleLowerCase('de');
  const matches = [...products].filter(([, product]) =>
    `${product.name} ${product.tone}`.toLocaleLowerCase('de').includes(query)
  );
  searchResults.replaceChildren(...matches.map(([id, product]) => {
    const button = element('button', product.name);
    button.type = 'button';
    button.className = 'search-result';
    button.append(element('span', euros(product.price)));
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

const filters = [...document.querySelectorAll('[data-filter]')];
for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) button.setAttribute('aria-pressed', button === filter);
    for (const card of cards) {
      card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
    }
  });
}

productForm.addEventListener('submit', event => {
  event.preventDefault();
  const size = productForm.querySelector('select').value;
  if (!products.has(activeProduct) || !sizes.has(size)) return;
  const item = items.find(entry => entry.id === activeProduct && entry.size === size);

  if (item) {
    item.quantity = Math.min(item.quantity + 1, 99);
  } else {
    items.push({ id: activeProduct, size, quantity: 1 });
  }
  saveBag();
  showDialog(bag);
});
