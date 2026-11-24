// A clipped copy of the shop provides the same SVG lens input on browsers that
// support SVG element filters but cannot apply them directly to a backdrop.
export function attachSceneRefraction(bar) {
  const main = document.querySelector('main');
  const footer = document.querySelector('.footer');
  const hero = main.querySelector('.hero');
  const layer = document.createElement('div');
  layer.className = 'refraction-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;

  const scene = document.createElement('div');
  scene.className = 'refraction-scene';
  const mainCopy = main.cloneNode(true);
  scene.append(mainCopy, footer.cloneNode(true));
  for (const element of scene.querySelectorAll('[id]')) element.removeAttribute('id');
  for (const image of scene.querySelectorAll('img[loading]')) image.loading = 'eager';
  const cards = [...main.querySelectorAll('.product')];
  const cardCopies = [...mainCopy.querySelectorAll('.product')];
  const heroCopy = mainCopy.querySelector('.hero');
  layer.append(scene);
  bar.prepend(layer);

  let frame;
  let sceneWidth;

  function alignScene() {
    frame = undefined;
    const visible = bar.classList.contains('liquid-glass') &&
      bar.parentElement.classList.contains('is-scrolled');
    if (!visible) return;

    const width = main.offsetWidth;
    if (width !== sceneWidth) {
      scene.style.width = width + 'px';
      sceneWidth = width;
    }
    const glass = bar.getBoundingClientRect();
    const original = hero.getBoundingClientRect();
    scene.style.transform = `translate(${original.left - glass.left - heroCopy.offsetLeft}px, ${original.top - glass.top - heroCopy.offsetTop}px)`;
  }

  function scheduleAlignment() {
    if (frame === undefined) frame = requestAnimationFrame(alignScene);
  }

  new MutationObserver(() => {
    cards.forEach((card, index) => { cardCopies[index].hidden = card.hidden; });
    scheduleAlignment();
  }).observe(main, { subtree: true, attributeFilter: ['hidden'] });

  const resize = new ResizeObserver(scheduleAlignment);
  resize.observe(main);
  resize.observe(bar);
  window.addEventListener('scroll', scheduleAlignment, { passive: true });
  window.addEventListener('resize', scheduleAlignment, { passive: true });
  window.addEventListener('pageshow', scheduleAlignment);
  scheduleAlignment();
  return scheduleAlignment;
}
