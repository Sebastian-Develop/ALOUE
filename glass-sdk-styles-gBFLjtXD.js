// src/scene/styles.ts
var e = "lg-boost", t = "lg-boost-pacer", n = "lg-boost-mark", r = "lg-pad", i = "lg-pad-scroller", a = "lg-tripwire", o = "lg-fresh", s = `
[data-lg-canvas]{position:absolute;display:block;z-index:-1;pointer-events:none;margin:0;padding:0;border:0;max-width:none;max-height:none;background:none}
[data-lg-surface]{isolation:isolate}
[data-lg-fallback]>[data-lg-canvas]{display:none}
.${e}{position:fixed;top:0;left:0;width:1px;height:1px;pointer-events:none}
.${t}{position:absolute;top:0;left:0;width:8px;height:8px;overflow:scroll;scrollbar-width:none;pointer-events:none}
.${t}::-webkit-scrollbar{display:none}
.${t}>*{visibility:hidden}
.${n}{position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;background:color-mix(in srgb,currentColor 1%,transparent);animation:lg-rate 1s linear infinite}
@keyframes lg-rate{to{transform:translateX(1px)}}
.${o}{position:fixed;top:0;left:0;width:1px;height:1px;pointer-events:none;animation:lg-scroll-fresh linear both;animation-timeline:scroll(root)}
@keyframes lg-scroll-fresh{from,to{outline-color:transparent}}
.${a}{position:absolute;left:0;width:1px;pointer-events:none;opacity:0;contain:strict}
.${r}{position:absolute;inset:0;z-index:1;overflow:hidden;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.${i}{position:absolute;top:0;left:0;transform-origin:0 0;overflow:scroll;overscroll-behavior:contain;touch-action:pan-x pan-y;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.${i}::-webkit-scrollbar{display:none}
.${i}>*{visibility:hidden}
@layer liquid-glass{
[data-lg-labels],[data-lg-labels] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}
[data-lg-labels] svg,[data-lg-labels] svg *{fill:transparent!important;stroke:transparent!important}
[data-lg-labels] :is(img,picture,video){opacity:0!important}
:where([data-lg-fallback]){background-color:var(--lg-fallback-light,rgb(250 250 252 / .78))}
:where([data-lg-fallback][data-lg-appearance=dark]){background-color:var(--lg-fallback-dark,rgb(44 44 46 / .78))}
:where([data-lg-button]){-webkit-appearance:none;appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:var(--lg-button-gap,4px);box-sizing:border-box;min-height:var(--lg-button-height,28px);padding:0 var(--lg-button-padding,10px);margin:0;border:0;border-radius:var(--lg-button-radius,999px);background:none;color:inherit;font:inherit;line-height:1.2;white-space:nowrap;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
:where([data-lg-button]):disabled{cursor:default;opacity:var(--lg-disabled-opacity,.45)}
:where([data-lg-button]):focus-visible{outline:var(--lg-focus-ring,2px solid Highlight);outline-offset:2px}
:where([data-lg-segmented]){display:inline-flex;align-items:stretch;box-sizing:border-box;padding:var(--lg-segmented-padding,3px);border-radius:var(--lg-segmented-radius,999px);-webkit-tap-highlight-color:transparent;touch-action:pan-y}
:where([data-lg-segment]){display:inline-flex;align-items:center;justify-content:center;gap:var(--lg-segment-gap,6px);flex:1 1 0;min-width:0;min-height:var(--lg-segment-height,26px);box-sizing:border-box;padding:0 var(--lg-segment-padding,10px);margin:0;border:0;border-radius:999px;background:none;color:inherit;font:inherit;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;outline-offset:-3px}
:where([data-lg-segment]):disabled{cursor:default;opacity:var(--lg-disabled-opacity,.45)}
:where([data-lg-switch]){position:relative;display:inline-block;flex:none;box-sizing:border-box;width:var(--lg-switch-width,54px);height:var(--lg-switch-height,24px);padding:0;margin:0;border:0;border-radius:999px;background:var(--lg-switch-off,rgb(120 120 128 / .32));transition:background-color .2s ease-in-out;cursor:pointer;vertical-align:middle;-webkit-tap-highlight-color:transparent;touch-action:pan-y}
:where([data-lg-switch][data-lg-on]){background:var(--lg-switch-on,#8e8e93)}
:where([data-lg-switch]){background-image:linear-gradient(rgb(255 255 255 / calc(.1 * var(--lg-switch-held,0))),rgb(255 255 255 / calc(.1 * var(--lg-switch-held,0))))}
:where([data-lg-switch]):disabled{opacity:var(--lg-disabled-opacity,.45);cursor:default}
:where([data-lg-switch]):focus-visible{outline:var(--lg-focus-ring,2px solid Highlight);outline-offset:2px}
:where([data-lg-switch-thumb]){position:absolute;top:var(--lg-switch-inset,2px);inset-inline-start:var(--lg-switch-inset,2px);width:var(--lg-switch-thumb-width,32px);height:calc(100% - 2 * var(--lg-switch-inset,2px));border-radius:999px;pointer-events:none}
:where([data-lg-thumb-face]){position:absolute;inset:0;border-radius:inherit;background:#fff;box-shadow:var(--lg-thumb-shadow,0 1px 2px rgb(0 0 0 / .1),0 3px 12px rgb(0 0 0 / .1));pointer-events:none}
:where([data-lg-switch-thumb]>[data-lg-thumb-face]){background:var(--lg-switch-thumb,#fff)}
:where([data-lg-slider]){position:relative;display:block;box-sizing:border-box;min-width:80px;height:var(--lg-slider-height,28px);-webkit-tap-highlight-color:transparent;touch-action:pan-y;-webkit-user-select:none;user-select:none}
:where([data-lg-slider][data-disabled]){opacity:var(--lg-disabled-opacity,.45)}
:where([data-lg-slider-track]){position:absolute;inset-inline:0;top:0;bottom:0;height:var(--lg-slider-track-height,6px);margin-block:auto;border-radius:999px;background:var(--lg-slider-track,rgb(120 120 128 / .2));overflow:hidden;pointer-events:none}
:where([data-lg-slider-fill]){height:100%;background:var(--lg-slider-fill,#8e8e93);border-radius:inherit}
:where([data-lg-slider-rail]){position:absolute;top:0;bottom:0;inset-inline:calc(var(--lg-slider-thumb-width,20px) / 2);pointer-events:none}
:where([data-lg-slider-thumb]){position:absolute;top:0;bottom:0;width:var(--lg-slider-thumb-width,20px);height:var(--lg-slider-thumb-height,16px);margin-block:auto;margin-inline-start:calc(var(--lg-slider-thumb-width,20px) / -2);border-radius:999px;cursor:grab;pointer-events:auto}
:where([data-lg-slider-thumb]>[data-lg-thumb-face]){background:var(--lg-slider-thumb,#fff)}
:where([data-lg-slider-ticks]){position:absolute;inset-inline:calc(var(--lg-slider-thumb-width,20px) / 2 - 1px);top:calc(50% + 7px);display:flex;justify-content:space-between;pointer-events:none}
:where([data-lg-slider-ticks]>span){width:2px;height:2px;border-radius:50%;background:currentColor;opacity:.5}
:where([data-lg-slider-thumb]):focus-visible{outline:var(--lg-focus-ring,2px solid Highlight);outline-offset:2px}
:where([data-lg-toolbar]){display:inline-flex;align-items:center;gap:var(--lg-toolbar-gap,4px);box-sizing:border-box;padding:var(--lg-toolbar-padding,3px);border-radius:999px;--icon-size:14px}
:where([data-lg-toolbar][data-orientation=vertical]){flex-direction:column}
:where([data-lg-toolbar-item]){-webkit-appearance:none;appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;min-width:var(--lg-toolbar-item-size,22px);height:var(--lg-toolbar-item-size,22px);padding:0 var(--lg-toolbar-item-padding,0px);margin:0;border:0;border-radius:999px;background:none;color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;outline-offset:-2px}
:where([data-lg-toolbar-item][aria-pressed=true]){background:color-mix(in srgb,currentColor 12%,transparent)}
:where([data-lg-toolbar-item]>svg){width:14px;height:14px}
:where([data-lg-toolbar-item]):disabled{cursor:default;opacity:var(--lg-disabled-opacity,.45)}
:where([data-lg-toolbar-spacer]){flex:1 0 var(--lg-toolbar-space,8px);align-self:stretch;pointer-events:none}
:where([data-lg-toolbar-spacer][data-sizing=fixed]){flex-grow:0}
:where([data-lg-toolbar-separator]){flex:none;align-self:stretch;width:1px;margin:5px 2px;background:currentColor;opacity:.14}
:where([data-lg-tabbar]){--lg-segmented-padding:4.5px;--lg-segment-height:57px;--lg-segment-padding:6px;--lg-segment-gap:0px;font-size:10.5px;font-weight:600;letter-spacing:.005em}
:where([data-lg-tab]){flex:1 1 0;flex-direction:column;gap:var(--lg-tab-gap,1px);min-width:var(--lg-tab-width,100px);padding-top:2px}
:where([data-lg-tab-icon]){display:inline-flex;align-items:center;justify-content:center;width:var(--lg-tab-icon-size,26px);height:var(--lg-tab-icon-size,26px);--icon-size:var(--lg-tab-icon-size,26px)}
:where([data-lg-tab-icon] svg){width:100%;height:100%}
:where([data-lg-tab-label]){line-height:1.1;white-space:nowrap}
:where([data-lg-menu-popup]){display:flex;flex-direction:column;box-sizing:border-box;min-width:var(--lg-menu-width,128px);padding:var(--lg-menu-padding,4px);outline:none;font-size:12px;line-height:16px}
:where([data-lg-menu-content]){min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none}
:where([data-lg-menu-content])::-webkit-scrollbar{display:none}
:where([data-lg-menu-popup]>*:not([data-lg-canvas])){opacity:var(--lg-menu-content,1)}
:where([aria-haspopup=menu]) :where(svg,img){opacity:var(--lg-menu-icon,1);scale:var(--lg-menu-icon-scale,1);translate:var(--lg-menu-icon-x,0px) var(--lg-menu-icon-y,0px)}
:where([data-lg-menu]>[data-lg-button][aria-haspopup=menu][aria-expanded=true]){position:relative;z-index:51}
:where([data-lg-menu-item]){display:flex;align-items:center;gap:8px;min-height:var(--lg-menu-row,28px);box-sizing:border-box;padding:4px var(--lg-menu-row-padding,8px);border-radius:var(--lg-menu-row-radius,8px);cursor:default;outline:none;-webkit-user-select:none;user-select:none}
:where([data-lg-menu-item][aria-disabled=true]){opacity:var(--lg-disabled-opacity,.45)}
:where([data-lg-menu-icon]){display:inline-flex;width:14px;height:14px;align-items:center;justify-content:center;flex:none}
:where([data-lg-menu-icon]>svg){width:100%;height:100%}
:where([data-lg-menu-label]){flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
:where([data-lg-menu-detail]){flex:none;text-align:end;font-size:11px;opacity:.65}
:where([data-lg-menu-subtrigger]){display:grid;grid-template-columns:minmax(0,1fr) auto 14px;gap:12px}
:where([data-lg-menu-subtrigger]>[data-lg-menu-icon]){display:none}
:where([data-lg-menu-check]){flex:none;width:14px;height:14px;margin-inline-start:auto;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
:where([role=menuitemradio],[role=menuitemcheckbox]){gap:12px}
:where([data-lg-menu-chevron]){flex:none;width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
:where([dir=rtl] [data-lg-menu-chevron]){transform:scaleX(-1)}
:where([data-lg-menu-heading]){padding:6px 8px 2px;font-size:11px;font-weight:600;opacity:.5}
:where([data-lg-menu-separator]){height:1px;margin:4px 8px;background:currentColor;opacity:.15}
:where([data-lg-color-picker]){position:relative;display:inline-block;width:var(--lg-color-wheel-size,240px);height:var(--lg-color-wheel-size,240px);-webkit-tap-highlight-color:transparent}
:where([data-lg-color-picker][data-disabled]){opacity:var(--lg-disabled-opacity,.45);pointer-events:none}
:where([data-lg-color-wheel-colors],[data-lg-color-wheel]){position:absolute;inset:0;border-radius:50%}
:where([data-lg-color-wheel-colors]){background:radial-gradient(closest-side,#fff,rgb(255 255 255 / 0)),conic-gradient(from 90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);box-shadow:0 10px 34px rgb(0 0 0 / .1)}
:where([data-lg-color-wheel]){cursor:crosshair;touch-action:none;-webkit-user-select:none;user-select:none;outline:none}
:where([data-lg-color-wheel]):focus-visible{outline:var(--lg-focus-ring,2px solid Highlight);outline-offset:4px}
:where([data-lg-color-knob],[data-lg-color-point]){position:absolute;translate:-50% -50%;border-radius:50%;pointer-events:none}
:where([data-lg-color-knob]){width:14px;height:14px;background:var(--lg-color);box-shadow:0 0 0 2px #fff,0 1px 4px rgb(0 0 0 / .3)}
:where([data-lg-color-point]){width:6px;height:6px;background:var(--lg-color);box-shadow:0 0 0 1.5px rgb(255 255 255 / .95),0 0 0 2.5px rgb(0 0 0 / .16)}
[data-lg-surface][data-lg-appearance=dark][data-lg-tone=light]:not([data-lg-labels]){color:var(--lg-label-light,#000)!important}
[data-lg-surface][data-lg-appearance=light][data-lg-tone=dark]:not([data-lg-labels]){color:var(--lg-label-dark,#fff)!important}
}
`, c = /* @__PURE__ */ new WeakSet();
function l(e = document) {
	if (c.has(e)) return;
	c.add(e);
	let t = e.createElement("style");
	t.setAttribute("data-lg-styles", ""), t.textContent = s, u(e, "liquid-glass") ? e.head.append(t) : e.head.prepend(t);
}
function u(e, t) {
	let n = (e) => {
		for (let n of e) if (n instanceof CSSLayerStatementRule && n.nameList.includes(t) || n instanceof CSSLayerBlockRule && n.name === t) return !0;
		return !1;
	};
	for (let t of e.styleSheets) try {
		if (n(t.cssRules)) return !0;
	} catch {}
	return !1;
}
// src/motion/range.ts
var d = (e, t, n) => Math.min(Math.max(e, t), n);
function f(e, { min: t, max: n, step: r }) {
	if (!(n > t)) return t;
	let i = d(e, t, n);
	if (r > 0) {
		i = t + Math.round((i - t) / r) * r;
		let e = (String(r).split(".")[1] ?? "").length;
		i = d(Number(i.toFixed(e)), t, n);
	}
	return i;
}
var p = (e, { min: t, max: n }) => n > t ? d((e - t) / (n - t), 0, 1) : 0, m = (e, t, n) => f(n.min + (t > 0 ? d(e / t, 0, 1) : 0) * (n.max - n.min), n);
export { n as a, l as c, a as d, e as i, r as l, m as n, t as o, p as r, o as s, f as t, i as u };
