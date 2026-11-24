import { attachCanvasRefraction } from './campaign-refraction.js?v=clear-rim';

const vertexSource = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif
  uniform sampler2D strip;
  uniform vec2 size;
  uniform float density;
  uniform vec4 textureBox;
  uniform vec4 clipBox;
  void main() {
    vec2 point = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
    float radius = size.y * 0.5;
    vec2 normal = vec2(point.x - clamp(point.x, radius, size.x - radius), point.y - radius);
    float distance = length(normal);
    float depth = radius - distance;
    float bevel = min(density * 21.0, radius);
    if (depth < 0.0 || depth >= bevel || distance == 0.0) discard;

    float slope = 1.0 - depth / bevel;
    float curvature = abs(normal.x) / distance;
    float bend = (0.43 + 0.06 * curvature) * 76.0 * density * slope * slope;
    vec2 refracted = point - (normal / distance) * bend;
    if (any(lessThan(refracted, clipBox.xy)) ||
        any(greaterThanEqual(refracted, clipBox.xy + clipBox.zw))) discard;
    vec2 uv = (refracted - textureBox.xy) / textureBox.zw;
    vec4 color = texture2D(strip, uv);
    float edge = smoothstep(0.8, 5.0, bend / density);
    gl_FragColor = color * edge;
  }
`;

function createLens(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return;
  const program = gl.createProgram();
  for (const [kind, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const textures = new WeakMap();
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform1i(gl.getUniformLocation(program, 'strip'), 0);
  const resolution = gl.getUniformLocation(program, 'size');
  const pixelDensity = gl.getUniformLocation(program, 'density');
  const textureBox = gl.getUniformLocation(program, 'textureBox');
  const clipBox = gl.getUniformLocation(program, 'clipBox');

  function textureFor(source) {
    if (textures.has(source)) return textures.get(source);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } catch {
      gl.deleteTexture(texture);
      textures.set(source, null);
      return null;
    }
    textures.set(source, texture);
    return texture;
  }

  return {
    prepare: textureFor,
    draw(width, height, density, layers) {
      if (gl.isContextLost()) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(pixelDensity, density);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const { source, textureRect, clipRect } of layers) {
        const texture = textureFor(source);
        if (!texture) continue;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform4f(textureBox, ...textureRect);
        gl.uniform4f(clipBox, ...clipRect);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    },
  };
}

function traceBox(context, x, y, width, height, radius) {
  context.beginPath();
  if (context.roundRect && radius) context.roundRect(x, y, width, height, radius);
  else context.rect(x, y, width, height);
}

function textLines(node, range) {
  const text = node.textContent;
  range.selectNodeContents(node);
  const boxes = range.getClientRects();
  if (boxes.length === 1) return [{ text, box: boxes[0] }];

  const lines = [];
  let start = 0;
  let previousTop;
  for (let end = 1; end <= text.length; end++) {
    range.setStart(node, end - 1);
    range.setEnd(node, end);
    const top = range.getBoundingClientRect().top;
    if (previousTop !== undefined && Math.abs(top - previousTop) > 1) {
      range.setStart(node, start);
      range.setEnd(node, end - 1);
      lines.push({ text: text.slice(start, end - 1), box: range.getBoundingClientRect() });
      start = end - 1;
    }
    previousTop = top;
  }
  range.setStart(node, start);
  range.setEnd(node, text.length);
  lines.push({ text: text.slice(start), box: range.getBoundingClientRect() });
  return lines;
}

function paintText(context, section, root) {
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim() || node.parentElement.closest('[hidden]')) continue;
    const style = getComputedStyle(node.parentElement);
    if (style.visibility !== 'visible') continue;
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.fillStyle = style.color;
    if ('letterSpacing' in context) {
      context.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    }

    for (const { text, box } of textLines(node, range)) {
      if (!box.width || !box.height || !text.trim()) continue;
      const label = style.textTransform === 'uppercase' ? text.toLocaleUpperCase('de') : text;
      const metrics = context.measureText(label);
      const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
      const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.2;
      const baseline = (box.height + ascent - descent) / 2;
      context.fillText(label, box.left - root.left, box.top - root.top + baseline, box.width);
    }
  }
}

function paintControls(context, section, root) {
  for (const element of section.querySelectorAll('.filters, .filters button, .action, .hero-editorial')) {
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    const style = getComputedStyle(element);
    traceBox(context, box.left - root.left, box.top - root.top, box.width, box.height,
      Math.min(box.height / 2, parseFloat(style.borderTopLeftRadius) || 0));
    context.fillStyle = style.backgroundColor;
    context.fill();
    const border = parseFloat(style.borderTopWidth);
    if (border > 0) {
      context.lineWidth = border;
      context.strokeStyle = style.borderTopColor;
      context.stroke();
    }
  }
}

function captureSection(section, photos, density) {
  const bounds = section.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const canvas = document.createElement('canvas');
  const scale = Math.min(density, Math.sqrt(3000000 / (bounds.width * bounds.height)));
  canvas.width = Math.ceil(bounds.width * scale);
  canvas.height = Math.ceil(bounds.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return;
  context.scale(scale, scale);
  const style = getComputedStyle(section);
  context.fillStyle = getComputedStyle(document.body).backgroundColor;
  context.fillRect(0, 0, bounds.width, bounds.height);
  traceBox(context, 0, 0, bounds.width, bounds.height, parseFloat(style.borderTopLeftRadius));
  context.clip();
  context.fillStyle = style.backgroundColor;
  context.fill();

  const sectionTop = bounds.top + window.scrollY;
  for (const photo of photos) {
    context.save();
    const radius = parseFloat(getComputedStyle(photo.image.parentElement).borderTopLeftRadius);
    traceBox(context, photo.left - bounds.left, photo.top - sectionTop, photo.width, photo.height, radius);
    context.clip();
    context.drawImage(photo.image, photo.x - bounds.left, photo.y - sectionTop, photo.drawWidth, photo.drawHeight);
    context.restore();
  }

  if (section.classList.contains('hero')) {
    const width = bounds.width;
    const height = bounds.height;
    const mobile = window.matchMedia('(max-width: 780px)').matches;
    const scrim = mobile ? context.createLinearGradient(0, 0, 0, height) :
      context.createLinearGradient(0, 0, width, 0);
    const stops = mobile ? [[0.2, '#211a1610'], [0.49, '#211a1660'], [1, '#211a16e6']] :
      [[0, '#1b1713c9'], [0.36, '#221b1580'], [0.59, '#231c1720'], [0.78, '#231c1700']];
    for (const [offset, color] of stops) scrim.addColorStop(offset, color);
    context.fillStyle = scrim;
    context.fillRect(0, 0, width, height);
  }
  paintControls(context, section, bounds);
  paintText(context, section, bounds);
  return canvas;
}

export function attachSceneRefraction(bar, rimDisplacement) {
  const canvas = document.createElement('canvas');
  const lens = createLens(canvas);
  if (!lens) return attachCanvasRefraction(bar, rimDisplacement);

  canvas.className = 'refraction-layer';
  canvas.setAttribute('aria-hidden', 'true');
  bar.prepend(canvas);
  bar.setAttribute('data-renderer', 'canvas');
  const sections = [...document.querySelectorAll('main > section, .footer')];
  const photos = sections.map(section => [...section.querySelectorAll('img')]);
  const snapshots = new Map();
  const density = Math.min(window.devicePixelRatio || 1, 1.5);
  let positions = [];
  let photoPositions = [];
  let layoutDirty = true;
  let frame;
  let capturing = false;
  let captureTimer;
  let lastScroll = -Infinity;
  let fallbackActive = false;

  function measure() {
    const scroll = window.scrollY;
    positions = sections.map(section => {
      const { left, top, width, height } = section.getBoundingClientRect();
      return { left, top: top + scroll, width, height };
    });
    photoPositions = photos.map(images => images.flatMap(image => {
      if (!image.complete || !image.naturalWidth || image.closest('[hidden]')) return [];
      const { left, top, width, height } = image.getBoundingClientRect();
      if (!width || !height) return [];
      const style = getComputedStyle(image);
      const cover = style.objectFit === 'cover';
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = cover ? image.naturalWidth * scale : width;
      const drawHeight = cover ? image.naturalHeight * scale : height;
      const [x = '50%', y = '50%'] = style.objectPosition.split(' ');
      return [{
        image, left, top: top + scroll, width, height, drawWidth, drawHeight,
        x: left + (width - drawWidth) * parseFloat(x) / 100,
        y: top + scroll + (height - drawHeight) * parseFloat(y) / 100,
      }];
    }));
    layoutDirty = false;
  }

  function captureNext() {
    captureTimer = undefined;
    if (capturing || fallbackActive) return;
    if (performance.now() - lastScroll < 175) {
      queueCapture();
      return;
    }
    if (layoutDirty) measure();
    const scroll = window.scrollY;
    const section = sections
      .filter(item => !snapshots.has(item))
      .sort((a, b) => Math.abs(positions[sections.indexOf(a)].top - scroll) -
        Math.abs(positions[sections.indexOf(b)].top - scroll))[0];
    if (!section) return;
    const entry = {};
    snapshots.set(section, entry);
    capturing = true;
    try {
      const bitmap = captureSection(section, photoPositions[sections.indexOf(section)], 2);
      if (bitmap && lens.prepare(bitmap)) entry.bitmap = bitmap;
    } finally {
      capturing = false;
      schedulePaint();
      if (snapshots.size < sections.length) queueCapture();
    }
  }

  function queueCapture() {
    if (captureTimer === undefined && !capturing) captureTimer = window.setTimeout(captureNext, 180);
  }

  function paint() {
    frame = undefined;
    if (fallbackActive || !bar.classList.contains('liquid-glass') || !bar.parentElement.classList.contains('is-scrolled')) return;
    if (layoutDirty) measure();
    const bounds = canvas.getBoundingClientRect();
    const top = bounds.top + window.scrollY;
    const width = Math.round(bounds.width * density);
    const height = Math.round(bounds.height * density);
    if (width < height || !height) return;
    const layerRect = (left, layerTop, layerWidth, layerHeight) => [
      (left - bounds.left) * density, (layerTop - top) * density,
      layerWidth * density, layerHeight * density,
    ];
    const layers = [];
    for (let index = 0; index < sections.length; index++) {
      const section = positions[index];
      if (section.top >= top + bounds.height || section.top + section.height <= top) continue;
      const bitmap = snapshots.get(sections[index])?.bitmap;
      if (bitmap) {
        const rect = layerRect(section.left, section.top, section.width, section.height);
        layers.push({ source: bitmap, textureRect: rect, clipRect: rect });
        continue;
      }

      for (const photo of photoPositions[index]) {
        if (photo.top >= top + bounds.height || photo.top + photo.height <= top) continue;
        layers.push({
          source: photo.image,
          textureRect: layerRect(photo.x, photo.y, photo.drawWidth, photo.drawHeight),
          clipRect: layerRect(photo.left, photo.top, photo.width, photo.height),
        });
      }
    }

    lens.draw(width, height, density, layers);
    if (!bar.hasAttribute('data-refraction')) bar.setAttribute('data-refraction', 'canvas');
  }

  function schedulePaint() {
    if (frame === undefined) frame = requestAnimationFrame(paint);
  }
  function refreshLayout() {
    layoutDirty = true;
    schedulePaint();
  }
  function rebuildSnapshots() {
    snapshots.clear();
    refreshLayout();
    queueCapture();
  }

  let viewportWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== viewportWidth) {
      viewportWidth = window.innerWidth;
      rebuildSnapshots();
    } else refreshLayout();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    lastScroll = performance.now();
    schedulePaint();
  }, { passive: true });
  window.addEventListener('pageshow', refreshLayout);
  bar.addEventListener('transitionend', schedulePaint);
  if (typeof ResizeObserver !== 'undefined') {
    const resize = new ResizeObserver(refreshLayout);
    resize.observe(document.querySelector('main'));
    resize.observe(bar);
  }
  for (const image of photos.flat()) {
    const prepareImage = () => {
      if (image.naturalWidth && !fallbackActive) lens.prepare(image);
      const owner = sections.find(section => section.contains(image));
      if (owner) snapshots.delete(owner);
      refreshLayout();
      queueCapture();
    };
    image.addEventListener('load', prepareImage);
    if (image.complete) prepareImage();
  }
  const collection = sections.find(section => section.classList.contains('collection'));
  if (collection) {
    new MutationObserver(() => {
      snapshots.delete(collection);
      refreshLayout();
      queueCapture();
    }).observe(collection, { subtree: true, attributeFilter: ['hidden'] });
  }
  document.fonts?.ready.then(rebuildSnapshots);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fallbackActive = true;
    bar.removeAttribute('data-refraction');
    canvas.remove();
    snapshots.clear();
    attachCanvasRefraction(bar, rimDisplacement);
  }, { once: true });
  queueCapture();
  schedulePaint();
  return schedulePaint;
}
