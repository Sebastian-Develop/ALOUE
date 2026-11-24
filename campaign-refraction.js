// WebKit and Gecko can frost a live backdrop, but cannot bend it through an
// SVG backdrop filter. Sample the campaign image at the glass rim on those engines.
export function attachCampaignRefraction(bar) {
  const campaign = document.querySelector('.hero-image');
  const canvas = document.createElement('canvas');
  canvas.className = 'campaign-refraction';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  bar.prepend(canvas);

  const context = canvas.getContext('2d');
  const sourceContext = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context || !sourceContext) return;

  let source;
  let frame;
  let pixels;
  let rim;

  function cacheCampaign() {
    const width = campaign.naturalWidth;
    const height = campaign.naturalHeight;
    if (!width || !height) return;
    sourceContext.canvas.width = width;
    sourceContext.canvas.height = height;
    sourceContext.drawImage(campaign, 0, 0);
    try {
      source = sourceContext.getImageData(0, 0, width, height);
      schedulePaint();
    } catch {
      // Cross-origin images may disallow pixel reads. Keep the CSS glass.
    }
  }

  function sizeCanvas(width, height) {
    canvas.width = width;
    canvas.height = height;
    pixels = context.createImageData(width, height);
    rim = [];
    const radius = height / 2;
    const bevel = Math.min(20, radius);
    for (let y = 0; y < height; y++) {
      const dy = y + 0.5 - radius;
      for (let x = 0; x < width; x++) {
        const px = x + 0.5;
        const dx = px - Math.min(Math.max(px, radius), width - radius);
        const distance = Math.hypot(dx, dy);
        const depth = radius - distance;
        if (depth < 0 || depth >= bevel || distance === 0) continue;

        const slope = 1 - depth / bevel;
        const bend = (29 + 5 * Math.abs(dx) / distance) * slope ** 2 / distance;
        rim.push({
          index: (y * width + x) * 4,
          x: px - dx * bend,
          y: y + 0.5 - dy * bend,
          alpha: Math.round(238 * Math.min(1, slope * 1.45)),
        });
      }
    }
  }

  function paint() {
    frame = undefined;
    const glass = bar.getBoundingClientRect();
    const image = campaign.getBoundingClientRect();
    const visible = source && bar.classList.contains('liquid-glass') &&
      bar.parentElement.classList.contains('is-scrolled') &&
      glass.top < image.bottom && glass.bottom > image.top;
    canvas.hidden = !visible;
    bar.toggleAttribute('data-campaign-refraction', Boolean(visible));
    if (!visible) return;

    const lens = canvas.getBoundingClientRect();
    const width = Math.round(lens.width);
    const height = Math.round(lens.height);
    if (width < height || !height) return;
    if (width !== canvas.width || height !== canvas.height || !pixels) {
      sizeCanvas(width, height);
    }

    const { width: sourceWidth, height: sourceHeight, data } = source;
    const scale = Math.max(image.width / sourceWidth, image.height / sourceHeight);
    const [positionX, positionY] = getComputedStyle(campaign).objectPosition.split(' ').map(parseFloat);
    const imageLeft = image.left + (image.width - sourceWidth * scale) * positionX / 100;
    const imageTop = image.top + (image.height - sourceHeight * scale) * positionY / 100;
    const { data: destination } = pixels;

    for (const sample of rim) {
      const x = lens.left + sample.x;
      const y = lens.top + sample.y;
      const index = sample.index;
      if (x < image.left || x >= image.right || y < image.top || y >= image.bottom) {
        destination[index + 3] = 0;
        continue;
      }

      const sourceX = Math.min(sourceWidth - 1, Math.max(0, Math.floor((x - imageLeft) / scale)));
      const sourceY = Math.min(sourceHeight - 1, Math.max(0, Math.floor((y - imageTop) / scale)));
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
      destination[index] = data[sourceIndex];
      destination[index + 1] = data[sourceIndex + 1];
      destination[index + 2] = data[sourceIndex + 2];
      destination[index + 3] = sample.alpha;
    }
    context.putImageData(pixels, 0, 0);
  }

  function schedulePaint() {
    if (frame === undefined) frame = window.requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', schedulePaint, { passive: true });
  window.addEventListener('pageshow', schedulePaint);
  const resize = new ResizeObserver(schedulePaint);
  resize.observe(bar);
  resize.observe(campaign);
  campaign.addEventListener('load', cacheCampaign);
  if (campaign.complete) cacheCampaign();

  return schedulePaint;
}
