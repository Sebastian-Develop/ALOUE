import { a as e, c as t, d as n, i as r, l as i, o as a, s as o, u as s } from "./glass-sdk-styles-gBFLjtXD.js";
// \0rolldown/runtime.js
var c = Object.defineProperty, l = (e, t) => {
	let n = {};
	for (var r in e) c(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || c(n, Symbol.toStringTag, { value: "Module" }), n;
}, u = [
	0,
	0,
	0,
	0
], d = /* @__PURE__ */ new Map(), f = 4096, p = /^rgba?\(\s*([-+\d.e]+%?)[\s,]+([-+\d.e]+%?)[\s,]+([-+\d.e]+%?)(?:\s*[,/]\s*([-+\d.e]+%?))?\s*\)$/i, m = /^#([\da-f]{3,8})$/i, h = /^color\(srgb\s+([-+\d.e]+%?)\s+([-+\d.e]+%?)\s+([-+\d.e]+%?)(?:\s*\/\s*([-+\d.e]+%?))?\s*\)$/i, g = (e) => e <= 0 ? 0 : e >= 1 ? 1 : e, _ = (e) => e.endsWith("%") ? Number.parseFloat(e) / 100 : Number.parseFloat(e) / 255, v = (e) => e === void 0 ? 1 : e.endsWith("%") ? Number.parseFloat(e) / 100 : Number.parseFloat(e);
function y(e) {
	if (e.length !== 3 && e.length !== 4 && e.length !== 6 && e.length !== 8) return null;
	let t = e.length <= 4 ? [...e].map((e) => e + e).join("") : e, n = (e) => Number.parseInt(t.slice(e * 2, e * 2 + 2), 16) / 255;
	return [
		n(0),
		n(1),
		n(2),
		t.length === 8 ? n(3) : 1
	];
}
function b(e) {
	return e.every(Number.isFinite) ? [
		g(e[0]),
		g(e[1]),
		g(e[2]),
		g(e[3])
	] : null;
}
function x(e) {
	if (e === "transparent" || e === "rgba(0, 0, 0, 0)") return u;
	let t = p.exec(e);
	if (t) return b([
		_(t[1] ?? ""),
		_(t[2] ?? ""),
		_(t[3] ?? ""),
		v(t[4])
	]);
	let n = m.exec(e);
	if (n) return y(n[1] ?? "");
	let r = h.exec(e);
	if (r) return b([
		v(r[1]),
		v(r[2]),
		v(r[3]),
		v(r[4])
	]);
}
var S;
function C() {
	if (S !== void 0) return S;
	if (typeof OffscreenCanvas < "u") S = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: !0 });
	else if (typeof document < "u") {
		let e = document.createElement("canvas");
		e.width = 1, e.height = 1, S = e.getContext("2d", { willReadFrequently: !0 });
	} else S = null;
	return S;
}
function w(e) {
	let t = C();
	if (!t) return null;
	t.fillStyle = "#000", t.fillStyle = e;
	let n = t.fillStyle;
	if (t.fillStyle = "#fff", t.fillStyle = e, t.fillStyle !== n) return null;
	let r = typeof n == "string" ? x(n) : void 0;
	if (r !== void 0) return r;
	t.clearRect(0, 0, 1, 1), t.fillRect(0, 0, 1, 1);
	let [i = 0, a = 0, o = 0, s = 0] = t.getImageData(0, 0, 1, 1).data;
	return s === 0 ? u : [
		i / 255,
		a / 255,
		o / 255,
		s / 255
	];
}
function ee(e) {
	let t = e.trim(), n = d.get(t);
	if (n !== void 0) return n;
	let r = x(t), i = r === void 0 ? w(t) : r;
	return d.size >= f && d.clear(), d.set(t, i), i;
}
function T(e) {
	let t = (e) => Math.round(g(e) * 255);
	return `rgba(${t(e[0])}, ${t(e[1])}, ${t(e[2])}, ${g(e[3])})`;
}
function te(e, t) {
	if (!e.includes("var(")) return e;
	let n = getComputedStyle(t), r = "", i = 0;
	for (; i < e.length;) {
		let a = e.indexOf("var(", i);
		if (a < 0) {
			r += e.slice(i);
			break;
		}
		r += e.slice(i, a);
		let o = 0, s = a + 3;
		for (; s < e.length; s += 1) if (e[s] === "(") o += 1;
		else if (e[s] === ")" && --o === 0) break;
		let c = e.slice(a + 4, s), l = c.indexOf(","), u = (l < 0 ? c : c.slice(0, l)).trim(), d = n.getPropertyValue(u).trim();
		r += d || (l < 0 ? "" : te(c.slice(l + 1).trim(), t)), i = s + 1;
	}
	return r;
}
function ne(e, t) {
	return ee(te(e, t));
}
// src/core/adapt.ts
var E = [
	"luma",
	"contrast",
	"bright",
	"detail"
], D = {
	light: [.1, .3],
	dark: [.7, .9]
}, O = .35, k = .25, A = 1.5, j = .5, re = .29, ie = .3, ae = 88;
function oe(e) {
	return {
		target: null,
		shown: null,
		tone: e,
		mix: +(e === "dark")
	};
}
function se(e, t, n) {
	return !n && Math.min(e, t) <= ae;
}
function ce(e) {
	return {
		luma: e.luma,
		contrast: e.contrast,
		bright: e.bright,
		detail: e.detail
	};
}
function le(e, t, n) {
	if (!t) return e.kind === "clear" ? M(e.appearance, null) : e.appearance;
	if (e.kind === "clear") return M(n, t);
	if (!e.flips) return e.appearance;
	let [r, i] = D[e.appearance];
	return t.luma > i ? "light" : t.luma < r ? "dark" : n;
}
function M(e, t) {
	if (!t) return e;
	let n = t.luma > .7 && t.contrast < .22, r = t.luma < .6 || t.contrast > .32;
	return e === "light" ? r ? "dark" : "light" : n ? "light" : "dark";
}
function ue(e, t) {
	return !e || E.some((n) => Math.abs(t[n] - e[n]) > N);
}
var N = .03;
function de(e, t, n, r) {
	let i = Math.max(0, Math.min(n, .1)), a = e.target, o = e.shown, s = !1;
	if (a) {
		if (!o || r) o = a;
		else {
			let e = 1 - Math.exp(-i / re), t = o, n = { ...t };
			for (let r of E) n[r] = t[r] + (a[r] - t[r]) * e;
			E.some((e) => Math.abs(n[e] - a[e]) > .004) ? (o = n, s = !0) : o = a;
		}
	}
	let c = le(t, a ?? o, e.tone), l = +((t.kind === "clear" || !t.flips ? t.appearance : c) === "dark"), u = e.mix;
	if (r || !t.flips) u = l;
	else if (u !== l) {
		let e = i / ie;
		u = l > u ? Math.min(l, u + e) : Math.max(l, u - e), u !== l && (s = !0);
	}
	return {
		state: {
			target: a,
			shown: o,
			tone: c,
			mix: u
		},
		moving: s
	};
}
function fe(e, t, n) {
	if (n <= 0) return e;
	if (n >= 1) return t;
	let r = n * n * (3 - 2 * n), i = (e, t) => e + (t - e) * r, a = e.shadow && t.shadow ? {
		x: i(e.shadow.x, t.shadow.x),
		y: i(e.shadow.y, t.shadow.y),
		blur: i(e.shadow.blur, t.shadow.blur),
		spread: i(e.shadow.spread, t.shadow.spread),
		color: [
			0,
			0,
			0,
			i(e.shadow.color[3], t.shadow.color[3])
		]
	} : r < .5 ? e.shadow : t.shadow;
	return {
		...r < .5 ? e : t,
		frost: i(e.frost, t.frost),
		bezel: i(e.bezel, t.bezel),
		pull: i(e.pull, t.pull),
		falloff: i(e.falloff, t.falloff),
		sharp: i(e.sharp, t.sharp),
		rimSharp: i(e.rimSharp, t.rimSharp),
		lift: i(e.lift, t.lift),
		gain: i(e.gain, t.gain),
		curve: i(e.curve, t.curve),
		saturation: i(e.saturation, t.saturation),
		shine: i(e.shine, t.shine),
		sheen: i(e.sheen, t.sheen),
		hairline: i(e.hairline, t.hairline),
		hairlineCap: i(e.hairlineCap, t.hairlineCap),
		dim: i(e.dim, t.dim),
		shadow: a
	};
}
function pe(e, t, n) {
	if (!t) return e;
	let r = he(.1, .4, t.detail);
	if (e.kind === "clear") {
		let i = Math.max(e.frost, me(3 * r));
		if (n === "light") return P({
			...e,
			frost: i
		});
		let a = O * he(.3, .75, Math.max(t.luma, 2 * t.bright)) + k * r * he(.03, .2, t.bright);
		return P({
			...e,
			frost: i,
			dim: a
		});
	}
	let i = e, a = i.shadow;
	if (!a) return P(i);
	let o = t.luma * (1 - r) * (1 - he(.1, .4, t.contrast)), s = (1 + A * r) * (1 - j * he(.6, .95, o));
	return P({
		...i,
		shadow: {
			...a,
			color: [
				0,
				0,
				0,
				Math.min(1, a.color[3] * s)
			]
		}
	});
}
function P(e) {
	let t = (e, t) => Math.round(e / t) * t, n = e.shadow;
	return {
		...e,
		dim: t(e.dim, 1 / 128),
		shadow: n ? {
			...n,
			color: [
				0,
				0,
				0,
				t(n.color[3], 1 / 128)
			]
		} : null
	};
}
function me(e) {
	return Math.round(e / 1.5) * 1.5;
}
function he(e, t, n) {
	let r = Math.min(1, Math.max(0, (n - e) / (t - e)));
	return r * r * (3 - 2 * r);
}
var ge = (e) => Math.min(1, Math.max(0, e)), F = (e, t, n) => e + (t - e) * n;
function _e(e) {
	return e === "clear" ? 0 : e === "tinted" ? 1 : e === void 0 || e === "default" || !Number.isFinite(e) ? .5 : ge(e);
}
function ve(e) {
	return ge((e - 64) / 96);
}
// ALOUÉ: match the strength and falloff of the desktop navigation bevel.
var ye = {
	bezel: 21,
	pull: 1.12,
	falloff: 2,
	dispersion: .06
}, be = {
	light: {
		sharp: 0,
		rimSharp: 0
	},
	dark: {
		sharp: 0,
		rimSharp: 0
	}
}, xe = {
	light: {
		shine: .125,
		sheen: .075,
		hairline: .34,
		hairlineCap: .3
	},
	dark: {
		shine: .17,
		sheen: .055,
		hairline: .34,
		hairlineCap: 0
	}
}, I = {
	light: {
		frost: 10,
		lift: 151 / 255,
		gain: .4,
		curve: 0,
		saturation: .9
	},
	dark: {
		frost: 10,
		lift: 40 / 255,
		gain: .85,
		curve: .34,
		saturation: 1.2
	}
};
function Se(e) {
	let { kind: t, appearance: n, tint: r } = e, i = n === "dark", a = Math.max(1, Math.min(e.width, e.height)), o = e.floating ? 1 : ve(a), s = xe[n], c = ge(e.shadowLift ?? 0), l = e.floating ? Te(i) : c > 0 ? we(Ce(o), Te(i), c) : Ce(o);
	if (e.edge) return {
		kind: t,
		appearance: n,
		frost: 12,
		bezel: 0,
		pull: 0,
		falloff: 1,
		dispersion: 0,
		sharp: 0,
		rimSharp: 0,
		lift: 0,
		gain: 1,
		curve: 0,
		saturation: 1,
		shine: 0,
		sheen: 0,
		hairline: 0,
		hairlineCap: 0,
		tint: r,
		dim: 0,
		shadow: null,
		edge: e.edge
	};
	if (t === "clear") return {
		kind: t,
		appearance: n,
		frost: e.floating ? 3 : 0,
		...ye,
		sharp: 0,
		rimSharp: 0,
		lift: 0,
		gain: 1,
		curve: 0,
		saturation: 1,
		...s,
		tint: r,
		dim: 0,
		shadow: l,
		edge: null
	};
	let u = _e(e.tintAmount), d = I[n], f = u - .5;
	return {
		kind: t,
		appearance: n,
		frost: d.frost * (1 + .8 * f),
		...ye,
		dispersion: 0,
		...be[n],
		lift: i ? d.lift : ge(d.lift * (1 + .5 * f)),
		gain: i ? d.gain * (1 - .3 * f) : d.gain,
		curve: d.curve,
		saturation: d.saturation,
		...s,
		tint: r,
		dim: 0,
		shadow: l,
		edge: null
	};
}
function Ce(e) {
	let t = F(2.2, 12, e);
	return {
		x: 0,
		y: F(7, 8, e),
		blur: t * 2,
		spread: 0,
		color: [
			0,
			0,
			0,
			F(.012, .06, e)
		]
	};
}
function we(e, t, n) {
	return {
		x: F(e.x, t.x, n),
		y: F(e.y, t.y, n),
		blur: F(e.blur, t.blur, n),
		spread: F(e.spread, t.spread, n),
		color: [
			0,
			0,
			0,
			F(e.color[3], t.color[3], n)
		]
	};
}
function Te(e) {
	return {
		x: 0,
		y: 8,
		blur: 48,
		spread: 0,
		color: [
			0,
			0,
			0,
			e ? .18 : .12
		]
	};
}
function Ee(e, t = 0) {
	let n = 2, r = e.shadow;
	if (r && r.color[3] > 0) {
		let e = r.blur / 2;
		n = Math.max(n, 2.5 * e + Math.max(Math.abs(r.x), Math.abs(r.y)) + Math.max(0, r.spread));
	}
	if (t > 0) {
		let e = Math.min(1.5, Math.max(.25, t / 2 / 42));
		n = Math.max(n, 22.5 * e + 6 * e);
	}
	return Math.ceil(n);
}
// src/core/geometry.ts
var L = (e, t, n) => Math.min(n, Math.max(t, e)), De = (e, t, n) => e + (t - e) * n, Oe = (e) => ({
	x: e.x + e.width / 2,
	y: e.y + e.height / 2,
	width: e.width,
	height: e.height
}), R = (e) => ({
	x: e.x - e.width / 2,
	y: e.y - e.height / 2,
	width: e.width,
	height: e.height
}), z = (e, t, n = t) => ({
	x: e.x - t,
	y: e.y - n,
	width: Math.max(0, e.width + t * 2),
	height: Math.max(0, e.height + n * 2)
});
function B(e, t, n = t, r = {
	x: e.x + e.width / 2,
	y: e.y + e.height / 2
}) {
	return {
		x: r.x + (e.x - r.x) * t,
		y: r.y + (e.y - r.y) * n,
		width: e.width * t,
		height: e.height * n
	};
}
var ke = (e, t, n) => ({
	x: De(e.x, t.x, n),
	y: De(e.y, t.y, n),
	width: De(e.width, t.width, n),
	height: De(e.height, t.height, n)
}), Ae = (e) => ({
	x: e.x,
	y: e.y,
	width: e.width,
	height: e.height
}), je = (e) => [
	e,
	e,
	e,
	e
], Me = (e) => je(Math.max(0, Math.min(e.width, e.height) / 2));
function Ne(e, t) {
	let n = Math.max(0, e[0]), r = Math.max(0, e[1]), i = Math.max(0, e[2]), a = Math.max(0, e[3]), o = [
		n + r,
		r + i,
		i + a,
		a + n
	], s = [
		t.width,
		t.height,
		t.width,
		t.height
	], c = 1;
	for (let e = 0; e < 4; e += 1) {
		let t = o[e] ?? 0, n = s[e] ?? 0;
		t > n && (c = Math.min(c, t > 0 ? n / t : 0));
	}
	return c < 1 ? [
		n * c,
		r * c,
		i * c,
		a * c
	] : [
		n,
		r,
		i,
		a
	];
}
var Pe = (e, t) => [
	e[0] * t,
	e[1] * t,
	e[2] * t,
	e[3] * t
];
function V(e, t) {
	return e === "capsule" ? Me(t) : Ne(typeof e == "number" ? je(e) : e, t);
}
function Fe(e, t, n, r) {
	let i = e.x, a = e.y, o = t.width - e.x - e.width, s = t.height - e.y - e.height, c = (e, t, n) => Math.max(0, e - Math.max(t, n, 0)), l = [
		c(n[0], a, i),
		c(n[1], a, o),
		c(n[2], s, o),
		c(n[3], s, i)
	], u = l.map((e, t) => Math.max(e, r[t] ?? 0)), d = (e, t, n) => {
		let i = u[e] ?? 0, a = u[t] ?? 0;
		if (i + a <= n) return;
		let o = (l[e] ?? 0) >= i && i > (r[e] ?? 0), s = (l[t] ?? 0) >= a && a > (r[t] ?? 0);
		if (o && !s) u[t] = Math.max(0, n - Math.min(i, n));
		else if (s && !o) u[e] = Math.max(0, n - Math.min(a, n));
		else {
			let r = n / (i + a);
			u[e] = i * r, u[t] = a * r;
		}
		u[e] = Math.min(u[e] ?? 0, n), u[t] = Math.min(u[t] ?? 0, n);
	};
	return d(0, 3, e.height), d(1, 2, e.height), d(0, 1, e.width), d(3, 2, e.width), [
		u[0] ?? 0,
		u[1] ?? 0,
		u[2] ?? 0,
		u[3] ?? 0
	];
}
// src/scene/activity.ts
var Ie = 3;
function Le(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new WeakMap(), a = new AbortController(), o = {
		capture: !0,
		passive: !0,
		signal: a.signal
	}, s = -Infinity, c = 0, l = (e) => !e.closest("[data-lg-ignore]") && (e.hasAttribute("data-lg-surface") || e.querySelector("[data-lg-surface]") !== null), u = (e, r) => {
		if (!(e instanceof Element) || !l(e)) return;
		let i = n.get(e);
		i || (i = /* @__PURE__ */ new Set(), n.set(e, i)), i.add(r), t();
	}, d = (e, r) => {
		if (!(e instanceof Element)) return;
		let i = n.get(e);
		i && (i.delete(r), i.size === 0 && n.delete(e), t());
	}, f = (e) => {
		r.delete(e) && t();
	}, p = () => {
		if (s = performance.now(), typeof e.getAnimations != "function") return !1;
		let t = !1;
		for (let n of e.getAnimations()) {
			if ("animationName" in n || "transitionProperty" in n || n.playState !== "running" || r.has(n)) continue;
			let e = i.get(n);
			if (e === void 0) {
				let t = n.effect instanceof KeyframeEffect ? n.effect.target : null;
				if (e = t !== null && l(t), i.set(n, e), e) {
					let e = () => f(n);
					n.addEventListener("finish", e), n.addEventListener("cancel", e), n.addEventListener("remove", e);
				}
			}
			e && (r.add(n), t = !0);
		}
		for (let e of r) {
			let t = e.effect instanceof KeyframeEffect ? e.effect.target : null;
			e.playState === "running" && t?.isConnected || r.delete(e);
		}
		return t;
	};
	e.addEventListener("transitionrun", (e) => u(e.target, `t:${e.propertyName}`), o), e.addEventListener("transitionend", (e) => d(e.target, `t:${e.propertyName}`), o), e.addEventListener("transitioncancel", (e) => d(e.target, `t:${e.propertyName}`), o), e.addEventListener("animationstart", (e) => u(e.target, `a:${e.animationName}`), o), e.addEventListener("animationend", (e) => d(e.target, `a:${e.animationName}`), o), e.addEventListener("animationcancel", (e) => d(e.target, `a:${e.animationName}`), o);
	let m = () => {
		c ||= requestAnimationFrame(() => {
			c = 0, performance.now() - s >= Ie && p() && t();
		});
	};
	for (let t of [
		"pointerdown",
		"pointerup",
		"click",
		"keydown"
	]) e.addEventListener(t, m, o);
	return {
		get active() {
			if (performance.now() - s >= Ie && p(), n.size === 0) return r.size > 0;
			for (let e of n.keys()) e.isConnected || n.delete(e);
			return n.size > 0 || r.size > 0;
		},
		destroy() {
			a.abort(), cancelAnimationFrame(c), n.clear(), r.clear();
		}
	};
}
function Re(t = document.body) {
	let n = document.createElement("div");
	n.className = r, n.setAttribute("aria-hidden", "true"), n.setAttribute("data-lg-ignore", "");
	let i = document.createElement("div");
	i.className = a;
	let o = document.createElement("div");
	o.style.height = "400px", i.append(o), n.append(i), t.append(n);
	let s = document.createElement("span");
	s.className = e;
	let c = !0, l = -Infinity, u = !1;
	return {
		pace(e) {
			e - l < 250 || (l = e, i.scrollTo({
				top: c ? 200 : 0,
				behavior: "smooth"
			}), c = !c);
		},
		start() {
			u || (u = !0, n.append(s));
		},
		rest() {
			u = !1, l = -Infinity, s.remove();
		},
		remove() {
			s.remove(), n.remove();
		}
	};
}
// src/scene/ios/detect.ts
var ze = () => typeof window < "u" && "GestureEvent" in window;
function Be() {
	return typeof navigator > "u" ? !1 : /\b(iPhone|iPad|iPod)\b/.test(navigator.userAgent) ? !0 : navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
// src/scene/telemetry.ts
var Ve = {
	frame: "page.frame",
	measure: "page.measure",
	capture: "page.capture",
	captureItems: "page.capture.items",
	gap: "page.gap",
	inFlight: "page.inflight",
	inputSample: "input.sample",
	inputUnique: "input.unique",
	workerPresent: "worker.present",
	workerUnderlay: "worker.underlay",
	workerFrost: "worker.frost",
	workerGlass: "worker.glass",
	workerCopy: "worker.copy"
}, He = "liquid-glass", Ue = "worker.", We = /* @__PURE__ */ new Set();
function Ge(e) {
	let t = e.reportEveryMs ?? 1e3, n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map(), i = e.enabled, a, o = 0, s = (e, t, n) => {
		let i = r.get(e);
		i ? (i.count += t, i.ms += n) : r.set(e, {
			count: t,
			ms: n
		});
	}, c = () => {
		let e = performance.now(), t = {};
		for (let [e, n] of r) t[e] = n;
		r = /* @__PURE__ */ new Map();
		let i = {
			at: e,
			intervalMs: e - o,
			counters: t
		};
		o = e;
		for (let e of n) e(i);
	}, l = () => {
		let e = i && n.size > 0;
		e && a === void 0 ? (r = /* @__PURE__ */ new Map(), o = performance.now(), a = setInterval(c, t)) : !e && a !== void 0 && (clearInterval(a), a = void 0);
	};
	return {
		get enabled() {
			return i;
		},
		tick(e, t = 0) {
			i && s(e, 1, t);
		},
		time(e, t) {
			if (!i) return t();
			let n = performance.now();
			try {
				return t();
			} finally {
				s(e, 1, performance.now() - n);
			}
		},
		mark(e) {
			if (!We.has(e)) {
				We.add(e);
				try {
					performance.mark(e, { detail: { source: He } });
				} catch {
					performance.mark(e);
				}
			}
		},
		merge(e) {
			if (i) for (let t in e) {
				let n = e[t];
				n && s(t.startsWith(Ue) ? t : Ue + t, n.count, n.ms);
			}
		},
		subscribe(e) {
			return n.add(e), l(), () => {
				n.delete(e), l();
			};
		},
		setEnabled(e) {
			e !== i && (i = e, r = /* @__PURE__ */ new Map(), l());
		}
	};
}
// src/scene/ios/drag-pad.ts
var H = {
	extent: 4e5,
	period: 120,
	idleMs: 150,
	haltFrames: 1
};
function Ke(e, t) {
	let n = e.scrollLeft, r = e.scrollTop;
	e.style.overflow = "hidden", e.scrollLeft = n, e.scrollTop = r;
	let i = (t) => requestAnimationFrame(() => {
		t > 1 ? i(t - 1) : e.style.overflow = "";
	});
	i(t);
}
function qe(e, t, n) {
	let r = document.createElement("div");
	r.className = i, r.setAttribute("aria-hidden", "true"), r.setAttribute("data-lg-ignore", "");
	let a = document.createElement("div");
	a.className = s;
	let o = document.createElement("div");
	o.style.width = `${H.extent}px`, o.style.height = `${H.extent}px`, a.append(o), r.append(a), e.append(r);
	let c = H.extent / 2 - H.extent / 2 % H.period, l = new AbortController(), u = {
		passive: !0,
		signal: l.signal
	}, d = 1, f = 0, p = 0, m = null, h = !1, g = 0, _ = 0, v = {
		left: 0,
		top: 0
	}, y = null, b = !1, x = () => a.scrollLeft + f, S = () => a.scrollTop + p, C = () => m ? {
		x: m.x - (x() - m.left) / d,
		y: m.y - (S() - m.top) / d
	} : null, w = () => {
		d = Math.max(1, window.devicePixelRatio || 1), a.style.width = `${e.clientWidth * d}px`, a.style.height = `${e.clientHeight * d}px`, a.style.transform = `scale(${1 / d})`;
	}, ee = (e = !1) => {
		if (!e && (g > 0 || m || h)) return;
		let t = (e) => {
			let t = e - c;
			return t - t % H.period;
		}, n = t(a.scrollLeft), r = t(a.scrollTop);
		if (n === 0 && r === 0) return;
		let i = {
			left: a.scrollLeft,
			top: a.scrollTop
		};
		a.scrollLeft = i.left - n, a.scrollTop = i.top - r, f += i.left - a.scrollLeft, p += i.top - a.scrollTop;
	}, T = () => {
		window.clearTimeout(_), _ = window.setTimeout(() => {
			h && (h = !1, y?.(), y = null, m = null, t.rest?.()), ee();
		}, H.idleMs);
	}, te = () => {
		let e = C();
		if (n.telemetry.tick(Ve.inputSample), !e) return;
		let r = {
			left: x(),
			top: S()
		};
		(r.left !== v.left || r.top !== v.top) && (v = r, n.telemetry.tick(Ve.inputUnique), h ? t.coast?.(e) : t.move(e));
	}, ne = (e) => {
		window.clearTimeout(_), h = !1, m || ee(!0), m = {
			x: e.x,
			y: e.y,
			left: x(),
			top: S()
		}, v = {
			left: m.left,
			top: m.top
		}, y ??= n.addSampler(te), n.wake();
	}, E = (e) => {
		b && (b = !1, t.up(e), e && t.coast ? (h = !0, T()) : (m = null, y?.(), y = null, Ke(a, H.haltFrames), T()));
	}, D = (t) => {
		let n = e.getBoundingClientRect(), r = e.offsetWidth / (n.width || 1), i = e.offsetHeight / (n.height || 1);
		return {
			x: (t.clientX - n.left) * r,
			y: (t.clientY - n.top) * i
		};
	};
	a.addEventListener("pointerdown", (e) => {
		if (e.pointerType !== "touch" || b) return;
		let n = D(e);
		t.down(n) && (b = !0, ne(n));
	}, { signal: l.signal });
	let O = (e) => {
		g = e.targetTouches.length, g === 0 && (E(e.type === "touchend"), T());
	};
	a.addEventListener("touchstart", (e) => {
		g = e.targetTouches.length, n.wake();
	}, u), a.addEventListener("touchend", O, u), a.addEventListener("touchcancel", O, u), a.addEventListener("scroll", () => {
		T(), n.wake();
	}, u), a.addEventListener("contextmenu", (e) => e.preventDefault(), { signal: l.signal });
	let k = new ResizeObserver(w);
	k.observe(e);
	let A = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`), j = () => {
		A.removeEventListener("change", j), A = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`), A.addEventListener("change", j), w();
	};
	return A.addEventListener("change", j), w(), ee(!0), {
		element: r,
		get active() {
			return b;
		},
		destroy() {
			l.abort(), k.disconnect(), A.removeEventListener("change", j), window.clearTimeout(_), y?.(), r.remove();
		}
	};
}
// src/scene/tripwire.ts
var Je = 4, Ye = [.05, .95];
function Xe(e) {
	if (typeof IntersectionObserver > "u" || document.scrollingElement !== document.documentElement) return null;
	let t = document.createElement("div");
	t.className = n, t.setAttribute("aria-hidden", "true"), t.setAttribute("data-lg-ignore", ""), document.body.append(t);
	let r = !1, i = new IntersectionObserver((t) => {
		r && t.some((e) => e.intersectionRatio <= (Ye[0] ?? 0) || e.intersectionRatio >= (Ye[1] ?? 1)) && (r = !1, e());
	}, { threshold: Ye });
	return i.observe(t), {
		arm() {
			let e = Je / (window.devicePixelRatio || 1), n = parseFloat(t.style.top) || 0, i = t.getBoundingClientRect().top;
			t.style.top = `${n - i - e}px`, t.style.height = `${e * 2}px`, r = !0;
		},
		destroy() {
			i.disconnect(), t.remove();
		}
	};
}
// src/scene/pacer.ts
var U = {
	displayHz: 120,
	samplesPerFrame: 2,
	leadMs: 1,
	holdMs: 1e3,
	parkAfterMs: 400,
	framesInFlight: 2,
	stepCapFrames: 3
}, Ze = 1e3 / U.displayHz - 1e3 / U.displayHz / U.samplesPerFrame / 2, W = 1e3 / U.displayHz / U.samplesPerFrame;
function Qe(e) {
	let { gesture: t, boost: n, telemetry: r } = e, i = t ? new MessageChannel() : null, a = !1, o = !1, s = 0, c = 0, l = 0, u = -Infinity, d = performance.now(), f = !1, p = {
		active: !1,
		pinned: !1,
		frame: 0,
		at: 0,
		hold: 0
	}, m = (e) => {
		p.active && !a && (p.at = e, n?.pace(e), p.frame = requestAnimationFrame(m));
	}, h = () => {
		window.clearTimeout(p.hold), cancelAnimationFrame(p.frame), n?.rest(), p.active = !1;
	}, g = () => {
		t && !a && (window.clearTimeout(p.hold), p.active || (p.active = !0, n?.start(), n?.pace(performance.now()), p.frame = requestAnimationFrame(m)));
	}, _ = () => {
		p.active && !p.pinned && (window.clearTimeout(p.hold), p.hold = window.setTimeout(h, U.holdMs));
	}, v = () => {
		o = !1, e.park(), x?.arm(), _();
	}, y = (t) => {
		if (s = 0, a || !o) return;
		let n = t ?? performance.now();
		e.sample(n);
		let { draw: i, awake: c } = e.wants(n);
		if (i && n - u >= Ze && e.inFlight() < U.framesInFlight) {
			let t = Math.min(Math.max(0, n - d) / 1e3, U.stepCapFrames / U.displayHz);
			d = n;
			let i = u;
			u = n, e.draw(n, t) && (r.tick(Ve.frame), f && n - i >= 20 && Number.isFinite(i) && r.tick(Ve.gap, n - i)), l = n;
		} else !i && !c && (d = n);
		f = i, !i && !c && n - l > U.parkAfterMs ? v() : b();
	}, b = () => {
		a || (i ? i.port2.postMessage(0) : s = requestAnimationFrame(y));
	};
	if (i) {
		let e = (e, t) => e + Math.ceil((t - e + U.leadMs) / W) * W - U.leadMs;
		i.port1.addEventListener("message", () => {
			let t = performance.now();
			c = e(p.at, Math.max(t, c + W / 2)), window.setTimeout(() => y(), Math.max(0, c - t));
		}), i.port1.start();
	}
	let x = Xe(() => C.wake()), S = () => {
		document.visibilityState === "visible" ? C.wake() : o && (s && cancelAnimationFrame(s), s = 0, o = !1, h());
	};
	document.addEventListener("visibilitychange", S);
	let C = {
		get running() {
			return o;
		},
		wake() {
			a || document.visibilityState === "hidden" || (l = performance.now(), g(), o || (d = performance.now(), f = !1, o = !0, b()));
		},
		pin(e) {
			p.pinned = e, e ? g() : o || _();
		},
		destroy() {
			a = !0, o = !1, s && cancelAnimationFrame(s), h(), i?.port1.close(), i?.port2.close(), x?.destroy(), document.removeEventListener("visibilitychange", S);
		}
	};
	return C;
}
// src/scene/stacking.ts
var $e = (e, t) => e.position !== "static" || t !== null && /^(inline-)?(flex|grid)$/.test(t.display);
function et(e, t, n) {
	return !!(e === e.ownerDocument.documentElement || t.position === "fixed" || t.position === "sticky" || t.zIndex !== "auto" && $e(t, n) || parseFloat(t.opacity) < 1 || t.transform !== "none" || t.translate !== "none" || t.rotate !== "none" || t.scale !== "none" || t.filter !== "none" || (t.backdropFilter ?? "none") !== "none" || t.clipPath !== "none" || (t.maskImage ?? "none") !== "none" || t.mixBlendMode !== "normal" || t.isolation === "isolate" || /\b(transform|opacity|filter|translate|rotate|scale)\b/.test(t.willChange) || /\b(layout|paint|strict|content)\b/.test(t.contain) || t.containerType === "size" || t.containerType === "inline-size");
}
function tt(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e);
		return t || (t = getComputedStyle(e), n.set(e, t)), t;
	}, i = (e) => {
		let n = t.get(e);
		if (!n) {
			let i = r(e), a = e.parentElement ? r(e.parentElement) : null, o = i.zIndex !== "auto" && $e(i, a) && parseInt(i.zIndex, 10) || 0;
			n = {
				context: et(e, i, a),
				z: o
			}, t.set(e, n);
		}
		return n;
	}, a = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = [t];
		for (let n = t.parentElement; n; n = n.parentElement) i(n).context && e.push(n);
		a.set(t, e);
	}
	let o = (e, t) => {
		if (e === t) return 0;
		if (e.contains(t)) return -1;
		if (t.contains(e)) return 1;
		let n = a.get(e) ?? [e], r = a.get(t) ?? [t], o = new Set(r), s = 0;
		for (; s < n.length && !o.has(n[s]);) s += 1;
		let c = n[s], l = n[s - 1] ?? e, u = c ? r[r.indexOf(c) - 1] ?? t : r.at(-1) ?? t, d = i(l).z, f = i(u).z;
		return d === f ? l.compareDocumentPosition(u) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1 : d - f;
	}, s = [...e].sort(o);
	return new Map(s.map((e, t) => [e, t + 1]));
}
// src/scene/surface.ts
function nt(e, t, n) {
	let r = e.trim().split(/\s+/), i = (e, t) => {
		if (!e) return 0;
		let n = parseFloat(e);
		return Number.isFinite(n) ? e.endsWith("%") ? n / 100 * t : n : 0;
	}, a = i(r[0], t), o = r.length > 1 ? i(r[1], n) : r[0]?.endsWith("%") ? i(r[0], n) : a;
	return Math.min(a, o);
}
function rt(e, t, n) {
	return Ne([
		nt(e.borderTopLeftRadius, t, n),
		nt(e.borderTopRightRadius, t, n),
		nt(e.borderBottomRightRadius, t, n),
		nt(e.borderBottomLeftRadius, t, n)
	], {
		width: t,
		height: n
	});
}
function it(e, t) {
	let n = [], r = 1;
	for (let i = e; i; i = i.parentElement) {
		let e = t.get(i);
		if (e !== void 0) {
			r = e;
			break;
		}
		n.push(i);
	}
	for (let e = n.length - 1; e >= 0; --e) {
		let i = n[e], a = parseFloat(getComputedStyle(i).opacity);
		r *= Number.isFinite(a) ? a : 1, t.set(i, r);
	}
	return r;
}
function at(e) {
	let t = e.ownerDocument.createElement("canvas");
	return t.setAttribute("data-lg-canvas", ""), t.setAttribute("aria-hidden", "true"), t.setAttribute("data-lg-ignore", ""), t.tabIndex = -1, e.prepend(t), t;
}
function ot(e) {
	return e.overflowX !== "visible" || e.overflowY !== "visible";
}
function st(e, t, n) {
	n === "child" ? (e.parentNode !== t || t.firstChild !== e) && t.prepend(e) : e.nextSibling !== t && t.before(e);
}
var ct = [
	"position",
	"zIndex",
	"transform",
	"transformOrigin",
	"opacity",
	"visibility"
];
function lt(e) {
	for (let t of ct) e.style[t] = "";
}
function ut(e, t, n, r, i) {
	let [a, o, s, c] = n, l = r === "child" ? -t.left : i.left, u = r === "child" ? -t.top : i.top;
	return {
		left: l - c,
		top: u - a,
		width: e.width + c + o,
		height: e.height + a + s
	};
}
function dt(e, t, n) {
	let r = [], i = e.translate;
	if (i && i !== "none") {
		let [e = "0px", n = "0px", a = "0px"] = i.split(/\s+/), o = (e, t) => e.endsWith("%") ? `${parseFloat(e) / 100 * t}px` : e;
		r.push(`translate3d(${o(e, t.width)}, ${o(n, t.height)}, ${a})`);
	}
	let a = e.rotate;
	if (a && a !== "none") {
		let e = a.split(/\s+/), t = {
			x: "1, 0, 0",
			y: "0, 1, 0",
			z: "0, 0, 1"
		}[e[0] ?? ""];
		e.length === 1 ? r.push(`rotate(${e[0]})`) : t ? r.push(`rotate3d(${t}, ${e[1]})`) : r.push(`rotate3d(${e.join(", ")})`);
	}
	let o = e.scale;
	o && o !== "none" && r.push(`scale3d(${[
		...o.split(/\s+/),
		"1",
		"1"
	].slice(0, 3).join(", ")})`), e.transform && e.transform !== "none" && r.push(e.transform);
	let [s = "0px", c = "0px", l = "0px"] = e.transformOrigin.split(/\s+/), [u, , , d] = n;
	return {
		position: e.position === "fixed" ? "fixed" : "absolute",
		zIndex: e.zIndex,
		transform: r.join(" "),
		transformOrigin: `${parseFloat(s) + d}px ${parseFloat(c) + u}px ${l}`,
		opacity: e.opacity,
		visibility: e.visibility
	};
}
// src/scene/light.ts
var ft = /* @__PURE__ */ new WeakMap();
function pt(e, t) {
	let n = ft.get(e);
	if (!n) {
		let t = {}, r = /* @__PURE__ */ new Set(), i = () => r.forEach((e) => e()), a = (e) => {
			(e.pointerType !== "touch" || e.type !== "pointermove" || e.buttons) && (t.pointer = {
				x: e.clientX,
				y: e.clientY
			}, i());
		}, o = () => {
			t.pointer = void 0, i();
		}, s = (e) => {
			e.pointerType === "touch" && o();
		}, c = (e) => {
			e.relatedTarget || o();
		}, l, u = (e) => {
			e.beta !== null && e.gamma !== null && (l ??= {
				beta: e.beta,
				gamma: e.gamma
			}, l.beta += (e.beta - l.beta) * .02, l.gamma += (e.gamma - l.gamma) * .02, t.tilt = {
				x: e.gamma - l.gamma,
				y: e.beta - l.beta
			}, i());
		}, d = {
			capture: !0,
			passive: !0
		};
		e.addEventListener("pointermove", a, d), e.addEventListener("pointerdown", a, d), e.addEventListener("pointerup", s, d), e.addEventListener("pointercancel", s, d), e.document.addEventListener("mouseout", c, d), e.addEventListener("blur", o);
		let f = typeof e.DeviceOrientationEvent?.requestPermission != "function" && "DeviceOrientationEvent" in e;
		f && e.addEventListener("deviceorientation", u, { passive: !0 }), n = {
			light: t,
			wakes: r,
			dispose() {
				e.removeEventListener("pointermove", a, d), e.removeEventListener("pointerdown", a, d), e.removeEventListener("pointerup", s, d), e.removeEventListener("pointercancel", s, d), e.document.removeEventListener("mouseout", c, d), e.removeEventListener("blur", o), f && e.removeEventListener("deviceorientation", u);
			}
		}, ft.set(e, n);
	}
	let r = n;
	return r.wakes.add(t), {
		light: r.light,
		release() {
			r.wakes.delete(t), r.wakes.size === 0 && (r.dispose(), ft.delete(e));
		}
	};
}
var mt = -3 * Math.PI / 4;
function ht(e, t, n) {
	if (e.pointer) {
		let r = e.pointer.x - t, i = e.pointer.y - n;
		if (Math.hypot(r, i) > 1) return Math.atan2(i, r);
	}
	if (e.tilt) {
		let t = -Math.SQRT1_2 + e.tilt.x / 40, n = -Math.SQRT1_2 + e.tilt.y / 40;
		if (Math.hypot(t, n) > .05) return Math.atan2(n, t);
	}
	return mt;
}
function gt(e, t, n, r = .09) {
	let i = (t - e) % Math.PI;
	return i > Math.PI / 2 && (i -= Math.PI), i < -Math.PI / 2 && (i += Math.PI), Math.abs(i) < .002 ? {
		angle: e + i,
		moving: !1
	} : {
		angle: e + i * (1 - Math.exp(-Math.max(0, n) / r)),
		moving: !0
	};
}
// src/scene/scene.ts
var _t = (e) => e === void 0 || !Number.isFinite(e) ? 1 : Math.min(1, Math.max(0, e)), vt = 120, yt = (e) => !e || e[3] === 0;
function bt(e = {}) {
	let n = e.root ?? document.body, r = n.ownerDocument;
	t(r);
	let i = ze(), a = Ge({ enabled: e.telemetry ?? !1 });
	a.mark("liquid-glass:scene");
	let s = matchMedia("(prefers-color-scheme: dark)"), c = matchMedia("(prefers-reduced-motion: reduce)"), l = e.appearance ?? "auto", u = e.material ?? "regular", d = e.tintAmount, f = e.backdrop, p = e.adaptive ?? !0, m = e.specular ?? !1, h = (e) => e.options.specular ?? m, g = () => l === "auto" ? s.matches ? "dark" : "light" : l, _ = (e) => e.options.appearance ?? g(), v = (e) => e.options.adaptive ?? p, y = (e) => {
		let t = e.options.material ?? u;
		return {
			kind: t,
			appearance: _(e),
			flips: t === "regular" && e.options.appearance === null && e.options.tint === null && e.options.body && se(e.size.width, e.size.height, e.options.floating)
		};
	}, b = null, x = (e = !1) => {
		if (O || D || !N || !P) return;
		let t = S();
		b && t.every((e, t) => e === b?.[t]) && !e || (b = t, N.destroy(), N = P(n, _e, { backdrop: t }));
	}, S = () => {
		let e = f ? ne(f, n) : null;
		if (e) return e;
		for (let e = n; e; e = e.parentElement) {
			let t = ee(getComputedStyle(e).backgroundColor);
			if (t && !yt(t)) return t;
		}
		return g() === "dark" ? [
			0,
			0,
			0,
			1
		] : [
			1,
			1,
			1,
			1
		];
	}, C = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), te = 1, E = 0, D = !1, O = null, k = !0, A = !0, j = !0, re = !1, ie = !1, ae = -Infinity, le = /* @__PURE__ */ new Float32Array(), M = null, N = null, P = null, me = /* @__PURE__ */ new Set(), he = null, ge = null, F = /* @__PURE__ */ new Map(), _e = {
		surfaceOf(e) {
			let t = e instanceof HTMLElement ? C.get(e) : void 0;
			return t ? {
				id: t.id,
				labelsInGlass: t.options.labelsInGlass
			} : null;
		},
		send(e, t) {
			if (M) M.display(e, t);
			else for (let t of e.bitmaps) t.image.close();
		},
		requestFrame() {
			W.requestFrame();
		},
		telemetry: a
	}, ve = (e, t) => {
		if (!(D || O)) {
			a.mark("liquid-glass:engine"), P = t, M = e({
				desynchronized: Be(),
				telemetry: a,
				onError: (e) => queueMicrotask(() => Ze(e))
			}), he = M.onPresented(Te), ge = M.onBackdrop((e) => {
				let t = !1;
				for (let n of e) {
					let e = F.get(n.id);
					if (!e) continue;
					let r = ce(n);
					ue(e.adapt.target, r) && (e.adapt = {
						...e.adapt,
						target: r
					}, t = !0);
				}
				t && W.requestFrame();
			});
			for (let e of C.values()) M.attach(e.id, e.canvas);
			b = S(), N = P(n, _e, { backdrop: b });
			for (let e of me) e.stop = N.addSource(e.element);
			k = !0, A = !0, j = !0, I.wake();
		}
	};
	Promise.all([import("./glass-sdk-client-BsML7f9A.js"), import("./glass-sdk-capture-CzM22L8f.js")]).then(([e, t]) => ve(e.createRenderClient, t.createCapture), (e) => Ze(`The glass engine failed to load: ${e instanceof Error ? e.message : String(e)}`));
	let ye = i ? Re(r.body) : null, be = i ? r.createElement("div") : null;
	be && (be.className = o, be.setAttribute("aria-hidden", "true"), be.setAttribute("data-lg-ignore", ""), r.body.append(be));
	let xe = Le(r, () => {
		A = !0, W.requestFrame();
	}), I = Qe({
		gesture: i,
		boost: ye,
		telemetry: a,
		sample() {
			for (let e of T) e();
		},
		wants(e) {
			N && !xt(N.scrollDeltas(), le) && (k = !0, A = !0, ae = e);
			let t = k || re || xe.active;
			return {
				draw: t,
				awake: t || ie || e - ae < vt
			};
		},
		inFlight: () => M?.inFlight() ?? 0,
		draw: (e, t) => Xe(e, t),
		park() {
			re = !1;
		}
	}), Ce = 0, we = () => {
		Ce = 0;
		let e = !1;
		for (let t of C.values()) {
			let n = t.pendingGeometry;
			if (!n) continue;
			n.polls += 1;
			let r = t.canvas;
			Math.abs(r.width - n.width) <= 1 && Math.abs(r.height - n.height) <= 1 || n.polls > 12 ? (t.pendingGeometry = null, n.write()) : e = !0;
		}
		e && (Ce = requestAnimationFrame(we));
	};
	function Te(e) {
		for (let t of C.values()) !t.labelsShown && t.options.labelsInGlass && t.labelsFrom !== 0 && e >= t.labelsFrom && (t.labelsShown = !0, t.element.setAttribute("data-lg-labels", ""));
	}
	let L = (e) => e instanceof Element && (e.hasAttribute("data-lg-canvas") || e.closest("[data-lg-ignore]") !== null), De = new MutationObserver((e) => {
		let t = !1;
		for (let n of e) {
			if (L(n.target)) continue;
			t = !0;
			let e = n.target;
			if (n.type === "childList") j = !0;
			else if (e instanceof HTMLElement) {
				let t = C.get(e);
				t && (t.cssRadii = null), !t && e.querySelector("[data-lg-surface]") && (j = !0);
			}
		}
		t && (A = !0, W.requestFrame());
	});
	De.observe(n, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"style",
			"class",
			"hidden",
			"open",
			"dir"
		]
	});
	let Oe = new ResizeObserver((e) => {
		for (let t of e) {
			let e = t.target instanceof HTMLElement ? C.get(t.target) : void 0;
			e && (e.cssRadii = null);
		}
		A = !0, W.requestFrame();
	}), R = new AbortController(), z = {
		passive: !0,
		capture: !0,
		signal: R.signal
	}, B = () => {
		ae = performance.now(), A = !0, W.requestFrame();
	};
	window.addEventListener("scroll", B, z), window.addEventListener("resize", B, z), window.visualViewport?.addEventListener("resize", B, z), window.visualViewport?.addEventListener("scroll", B, z), window.addEventListener("touchstart", () => {
		ie = !0, I.pin(!0), I.wake();
	}, z);
	let ke = (e) => {
		e.touches.length > 0 || (ie = !1, I.pin(!1), I.wake());
	};
	window.addEventListener("touchend", ke, z), window.addEventListener("touchcancel", ke, z);
	let je = () => {
		if (l === "auto") {
			for (let e of C.values()) e.element.setAttribute("data-lg-appearance", _(e));
			W.requestFrame();
		}
	};
	s.addEventListener("change", je);
	let Ne = (e) => {
		let { size: t } = e;
		return e.options.radius === null ? (e.cssRadii ??= rt(getComputedStyle(e.element), t.width, t.height), e.cssRadii) : V(e.options.radius, t);
	}, Pe = (e, t) => {
		let { element: n } = e, r = n.offsetWidth, i = n.offsetHeight;
		if (e.visible = n.isConnected && r > 0 && i > 0, !e.visible) return;
		let a = r !== e.size.width || i !== e.size.height;
		if (e.size = {
			width: r,
			height: i
		}, a && (e.cssRadii = null), e.border = {
			left: n.clientLeft,
			top: n.clientTop
		}, e.screen = Ae(n.getBoundingClientRect()), e.cssRadii === null || e.host === "sibling") {
			let t = getComputedStyle(n);
			e.host = ot(t) && t.position !== "sticky" ? "sibling" : "child", e.style = e.host === "sibling" ? t : null, e.offset = {
				left: n.offsetLeft,
				top: n.offsetTop
			};
		}
		e.opacity = it(n, t);
		let o = Ne(e);
		(a || o.some((t, n) => t !== e.radii[n])) && (e.radii = o, e.shapes = null), e.measured = !0;
	}, Fe = (e) => {
		let t = e.options.material ?? u, n = _(e), r = Math.round(e.size.width), i = Math.round(e.size.height), a = e.options.tint ? ne(e.options.tint, e.element) : null, { floating: o, overhang: s, lensHeight: c, edge: l, shadowLift: f } = e.options, p = v(e), { mix: m, shown: h, tone: g } = e.adapt, b = p ? h : null, x = p && y(e.adaptParent ?? e).flips, S = b ? `${b.luma.toFixed(3)},${b.contrast.toFixed(3)},${b.bright.toFixed(3)},${b.detail.toFixed(3)}` : "", C = `${t}|${String(d)}|${n}|${r}|${i}|${a?.join(",") ?? ""}|${o}|${x ? m.toFixed(3) : ""}|${S}|${g}|${l ?? ""}|${f.toFixed(3)}`;
		if (!e.material || C !== e.materialKey) {
			let u = (e) => Se({
				kind: t,
				appearance: e,
				width: r,
				height: i,
				tint: a,
				floating: o,
				tintAmount: d,
				edge: l,
				shadowLift: f
			}), h = x ? fe(u("light"), u("dark"), m) : u(n);
			e.material = pe(h, b, g), e.materialKey = C, e.options.shadowLift > 0 && (e.lifted = !0);
			let _ = e.lifted ? Se({
				kind: t,
				appearance: n,
				width: r,
				height: i,
				tint: a,
				floating: !0,
				tintAmount: d,
				edge: l
			}) : h, v = p ? pe(_, {
				luma: 0,
				contrast: 1,
				bright: 0,
				detail: 1
			}, g) : _;
			e.reach = e.options.bleed ?? Ee(v, c) + Math.ceil(s);
		}
		return e.material;
	}, Ie = (e) => {
		if (e.shapes) return e.shapes;
		let t = [];
		for (let n of e.layers.values()) t.push(...n);
		let n = t.some((e) => e.role === "body"), r = e.options.smoothing;
		return e.shapes = [...e.options.body && !n ? [{
			role: "body",
			rect: {
				x: 0,
				y: 0,
				width: e.size.width,
				height: e.size.height
			},
			radii: e.radii,
			smoothing: r,
			lift: 0,
			magnify: 1,
			alpha: 1,
			merge: 0,
			tint: null,
			light: 0
		}] : [], ...t.map((e) => e.smoothing === void 0 ? {
			...e,
			smoothing: r
		} : e)], e.shapes;
	}, He = [], Ue = 0, We = 0, H = null, Ke = !1, Je = 1 / 60, Ye = () => {
		let e = [...C.values()].some(h);
		e && !H ? H = pt(window, () => W.requestFrame()) : !e && H && (H.release(), H = null);
	}, Xe = (e, t) => {
		Je = t, Ke = !1;
		let n = !1;
		for (let r of w) try {
			r(e, t) && (n = !0);
		} catch (e) {
			console.error(e);
		}
		if (re = n, k = !1, O || D || !M || !N) return !1;
		if (j) {
			j = !1;
			let e = tt([...C.keys()].filter((e) => e.isConnected));
			for (let t of C.values()) t.rank = e.get(t.element) ?? 0;
		}
		let i = A || n || xe.active;
		A = !1, a.time(Ve.measure, () => {
			let e = /* @__PURE__ */ new Map();
			for (let t of C.values()) (i || !t.measured) && Pe(t, e);
		});
		let o = /* @__PURE__ */ new Set(), s = (e) => {
			if (o.has(e)) return;
			o.add(e);
			let n = e.element.parentElement?.closest("[data-lg-surface]"), r = n instanceof HTMLElement ? C.get(n) : void 0;
			e.adaptParent = r?.visible && v(r) ? r : null, e.adaptParent && s(e.adaptParent);
			let i = y(e);
			if (!v(e)) (e.adapt.tone !== i.appearance || e.adapt.shown) && (e.adapt = oe(i.appearance));
			else {
				let n = de(e.adapt, i, t, c.matches), r = e.adaptParent;
				e.adapt = r ? {
					...n.state,
					tone: r.adapt.tone,
					mix: r.adapt.mix
				} : n.state, n.moving && (re = !0);
			}
			let a = v(e) ? e.adapt.tone : i.appearance;
			a !== e.tone && (e.tone = a, He.push(() => {
				e.element.setAttribute("data-lg-tone", a), N?.invalidate(e.element);
				for (let t of e.toneListeners) t(a);
			}));
		};
		for (let e of C.values()) e.visible && s(e);
		x(), N.flush();
		let l = N.scrollDeltas();
		le = l;
		let u = [], d = r.documentElement, f = d.scrollWidth - d.clientWidth <= Ue + 1, p = d.scrollHeight - d.clientHeight <= We + 1, m = 0, g = 0;
		for (let e of C.values()) {
			let t = e.element.hasAttribute("data-lg-hidden");
			if (!e.visible || t) {
				(t || e.host === "sibling") && e.canvas.style.display !== "none" && (He.push(() => e.canvas.style.display = "none"), e.canvasKey = "");
				continue;
			}
			let n = Fe(e);
			if (h(e)) {
				let t = e.screen, r = gt(e.lightAngle, ht(H?.light ?? {}, t.x + t.width / 2, t.y + t.height / 2), Je);
				e.lightAngle = r.angle, r.moving && (Ke = !0), n = {
					...n,
					lightAngle: Math.round(r.angle * 1e3) / 1e3
				};
			}
			let r = e.reach, i = e.size.width > 0 ? e.screen.width / e.size.width : 1, a = e.size.height > 0 ? e.screen.height / e.size.height : 1, o = r, s = r;
			if (e.style?.position !== "fixed") {
				let t = (d.clientWidth - (e.screen.x + e.screen.width)) / (i || 1);
				f && (o = Math.min(r, Math.max(0, Math.floor(t)))), m = Math.max(m, (r - Math.max(0, t)) * i);
				let n = (d.clientHeight - (e.screen.y + e.screen.height)) / (a || 1);
				p && (s = Math.min(r, Math.max(0, Math.floor(n)))), g = Math.max(g, (r - Math.max(0, n)) * a);
			}
			let c = [
				r,
				o,
				s,
				r
			];
			c.some((t, n) => t !== e.bleed[n]) && (e.bleed = c), u.push({
				id: e.id,
				rank: e.rank,
				screen: e.screen,
				size: e.size,
				shapes: Ie(e),
				material: n,
				opacity: e.opacity,
				bleed: e.bleed,
				labelsInGlass: e.options.labelsInGlass
			});
			let { canvas: l, element: _, host: v } = e, y = ut(e.size, e.border, e.bleed, v, e.offset), b = e.style ? dt(e.style, e.size, e.bleed) : null, x = `${v},${y.left},${y.top},${y.width},${y.height},${b ? Object.values(b).join(",") : ""}`, S = v === "child" ? l.parentNode !== _ || _.firstChild !== l : l.nextSibling !== _;
			if (x !== e.canvasKey || S) {
				let t = e.canvasKey !== "" && !S && l.style.display !== "none", n = e.canvasKey.split(",").slice(1, 5).join(",") !== `${y.left},${y.top},${y.width},${y.height}`;
				e.canvasKey = x;
				let r = () => {
					l.style.left = `${y.left}px`, l.style.top = `${y.top}px`, l.style.width = `${y.width}px`, l.style.height = `${y.height}px`;
				};
				He.push(() => {
					if (S && (st(l, _, v), v === "child" && lt(l)), b && Object.assign(l.style, b), l.style.display = "", t && n) {
						let t = window.devicePixelRatio || 1;
						e.pendingGeometry = {
							width: Math.min(8192, Math.max(1, Math.ceil(y.width * t))),
							height: Math.min(8192, Math.max(1, Math.ceil(y.height * t))),
							polls: 0,
							write: r
						}, Ce ||= requestAnimationFrame(we);
					} else e.pendingGeometry = null, r();
				});
			}
		}
		Ue = m, We = g, E += 1;
		for (let e of C.values()) e.visible && e.options.labelsInGlass && e.labelsFrom === 0 && (e.labelsFrom = E);
		M.frame({
			sequence: E,
			time: e,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				dpr: window.devicePixelRatio || 1
			},
			scroll: l,
			surfaces: u
		});
		for (let e of He.splice(0)) e();
		return Ke && (re = !0), !0;
	}, U = (e) => {
		e.element.removeAttribute("data-lg-labels"), e.options.body && e.element.setAttribute("data-lg-fallback", "");
	};
	function Ze(e) {
		if (!(O || D)) {
			O = e, console.warn(`Liquid Glass is unavailable, surfaces fall back to a translucent background: ${e}`), I.destroy(), N?.destroy();
			for (let e of C.values()) U(e);
		}
	}
	let W = {
		root: n,
		telemetry: a,
		get material() {
			return u;
		},
		get appearance() {
			return g();
		},
		get reducedMotion() {
			return c.matches;
		},
		controllers: i,
		get error() {
			return O;
		},
		addSurface: (e, t = {}) => {
			let n = C.get(e);
			if (n) return n.handle.update(t), n.handle;
			let r = te++, i = at(e), a = getComputedStyle(e).position === "static";
			a && (e.style.position = "relative"), e.style.isolation = "isolate", e.setAttribute("data-lg-surface", ""), e.setAttribute("data-lg-appearance", t.appearance ?? g());
			let o = t.appearance ?? g();
			e.setAttribute("data-lg-tone", o);
			let s = {
				id: r,
				element: e,
				get size() {
					return c.size;
				},
				get radii() {
					return c.radii;
				},
				get smoothing() {
					return c.options.smoothing;
				},
				get tone() {
					return c.tone;
				},
				onTone(e) {
					return c.toneListeners.add(e), () => {
						c.toneListeners.delete(e);
					};
				},
				setShapes(e, t = "") {
					e.length === 0 ? c.layers.delete(t) : c.layers.set(t, e), c.shapes = null, W.requestFrame();
				},
				update(t) {
					let n = c.options;
					"radius" in t && (n.radius = t.radius ?? null, c.cssRadii = null, c.measured = !1), "smoothing" in t && (n.smoothing = _t(t.smoothing)), "material" in t && (n.material = t.material ?? null), "tint" in t && (n.tint = t.tint ?? null), "bleed" in t && (n.bleed = t.bleed ?? null), "overhang" in t && (n.overhang = t.overhang ?? 0), "lensHeight" in t && (n.lensHeight = t.lensHeight ?? 0), "floating" in t && (n.floating = t.floating ?? !1), "appearance" in t && (n.appearance = t.appearance ?? null, e.setAttribute("data-lg-appearance", _(c))), "body" in t && (n.body = t.body ?? !0), "adaptive" in t && (n.adaptive = t.adaptive ?? null), "edge" in t && (n.edge = t.edge ?? null), "shadowLift" in t && (n.shadowLift = t.shadowLift ?? 0), "specular" in t && (n.specular = t.specular ?? null, Ye()), "labelsInGlass" in t && (t.labelsInGlass ?? !1) !== n.labelsInGlass && (n.labelsInGlass = t.labelsInGlass ?? !1, c.labelsShown = !1, c.labelsFrom = 0, e.removeAttribute("data-lg-labels"), N?.invalidate(e)), c.material = null, c.shapes = null, W.requestFrame();
				},
				remove() {
					if (C.has(e)) {
						C.delete(e), Ye(), F.delete(r), c.toneListeners.clear(), Oe.unobserve(e), !O && !D && M?.detach(r), i.remove(), e.style.isolation = "", a && (e.style.position = "");
						for (let t of [
							"data-lg-surface",
							"data-lg-labels",
							"data-lg-fallback",
							"data-lg-appearance",
							"data-lg-tone"
						]) e.removeAttribute(t);
						j = !0, D || N?.invalidate(e), W.requestFrame();
					}
				}
			}, c = {
				id: r,
				element: e,
				canvas: i,
				options: {
					radius: t.radius ?? null,
					smoothing: _t(t.smoothing),
					material: t.material ?? null,
					tint: t.tint ?? null,
					labelsInGlass: t.labelsInGlass ?? !1,
					bleed: t.bleed ?? null,
					overhang: t.overhang ?? 0,
					lensHeight: t.lensHeight ?? 0,
					floating: t.floating ?? !1,
					appearance: t.appearance ?? null,
					body: t.body ?? !0,
					adaptive: t.adaptive ?? null,
					edge: t.edge ?? null,
					shadowLift: t.shadowLift ?? 0,
					specular: t.specular ?? null
				},
				lightAngle: mt,
				lifted: t.liftable ?? !1,
				adapt: {
					...oe(t.appearance ?? g()),
					tone: o
				},
				tone: o,
				adaptParent: null,
				toneListeners: /* @__PURE__ */ new Set(),
				layers: /* @__PURE__ */ new Map(),
				shapes: null,
				cssRadii: null,
				radii: Me({
					width: 0,
					height: 0
				}),
				size: {
					width: 0,
					height: 0
				},
				border: {
					left: 0,
					top: 0
				},
				screen: {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},
				opacity: 1,
				visible: !1,
				measured: !1,
				material: null,
				materialKey: "",
				reach: 0,
				bleed: [
					0,
					0,
					0,
					0
				],
				host: "child",
				offset: {
					left: 0,
					top: 0
				},
				style: null,
				canvasKey: "",
				pendingGeometry: null,
				labelsShown: !1,
				labelsFrom: 0,
				rank: 0,
				handle: s
			};
			return C.set(e, c), Ye(), F.set(r, c), Oe.observe(e, { box: "border-box" }), j = !0, O ? U(c) : (M?.attach(r, i), N?.invalidate(e)), W.requestFrame(), s;
		},
		surfaceOf(e) {
			return e instanceof HTMLElement ? C.get(e)?.handle ?? null : null;
		},
		animate(e) {
			return w.add(e), W.requestFrame(), () => {
				w.delete(e);
			};
		},
		addSource(e) {
			if (N) return N.addSource(e);
			if (D || O) return () => {};
			let t = {
				element: e,
				stop: null
			};
			return me.add(t), () => {
				me.delete(t), t.stop?.();
			};
		},
		invalidate(e) {
			N?.invalidate(e), W.requestFrame();
		},
		requestFrame() {
			D || O || (k = !0, I.wake());
		},
		configure(e) {
			e.material !== void 0 && (u = e.material), "tintAmount" in e && (d = e.tintAmount), e.appearance !== void 0 && (l = e.appearance), e.telemetry !== void 0 && a.setEnabled(e.telemetry), e.adaptive !== void 0 && (p = e.adaptive), e.specular !== void 0 && (m = e.specular, Ye());
			for (let e of C.values()) e.material = null, e.element.setAttribute("data-lg-appearance", _(e));
			e.backdrop !== f && "backdrop" in e && (f = e.backdrop, x(!0)), W.requestFrame();
		},
		createDragPad(e, t) {
			return i ? qe(e, t, {
				addSampler(e) {
					return T.add(e), () => T.delete(e);
				},
				wake: () => I.wake(),
				telemetry: a
			}) : null;
		},
		destroy() {
			if (!D) {
				D = !0;
				for (let e of C.values()) e.handle.remove();
				I.destroy(), O || N?.destroy(), he?.(), ge?.(), M?.dispose(), De.disconnect(), Oe.disconnect(), xe.destroy(), R.abort(), s.removeEventListener("change", je), ye?.remove(), be?.remove(), w.clear(), T.clear();
			}
		}
	};
	return I.wake(), W;
}
function xt(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n += 1) if (e[n] !== t[n]) return !1;
	return !0;
}
// src/core/spring.ts
var St = {
	displacement: 1e-4,
	speed: .001
}, G = (e = 0) => ({
	value: e,
	velocity: 0,
	target: e,
	params: null,
	active: !1
}), Ct = (e) => ({
	...e,
	clamp: !0
});
function K(e, t, n, r) {
	e.target = t, e.params = n, e.active = !0, r !== void 0 && (e.velocity = r);
}
function q(e, t) {
	e.value = t, e.target = t, e.velocity = 0, e.active = !1;
}
function wt(e, t, n, r) {
	let i = 2 * Math.PI / e.response, a = e.dampingRatio;
	if (a < 1) {
		let e = i * Math.sqrt(1 - a * a), o = Math.exp(-a * i * r), s = (n + a * i * t) / e, c = Math.cos(e * r), l = Math.sin(e * r);
		return {
			offset: o * (t * c + s * l),
			velocity: o * ((s * e - a * i * t) * c - (t * e + a * i * s) * l)
		};
	}
	if (a === 1) {
		let e = n + i * t, a = Math.exp(-i * r);
		return {
			offset: (t + e * r) * a,
			velocity: (e - i * (t + e * r)) * a
		};
	}
	let o = i * Math.sqrt(a * a - 1), s = -a * i + o, c = -a * i - o, l = (n - s * t) / (c - s), u = t - l, d = Math.exp(s * r), f = Math.exp(c * r);
	return {
		offset: u * d + l * f,
		velocity: u * s * d + l * c * f
	};
}
function J(e, t) {
	if (!e.active || !e.params || !(t > 0)) return e.active;
	let n = e.value - e.target, { offset: r, velocity: i } = wt(e.params, n, e.velocity, t), a = e.params.clamp === !0 && (r === 0 || n !== 0 && Math.sign(r) !== Math.sign(n)), o = Math.abs(r) < St.displacement && Math.abs(i) < St.speed;
	return a || o ? (e.value = e.target, e.velocity = 0, e.active = !1) : (e.value = e.target + r, e.velocity = i), e.active;
}
function Tt(e, t, n, r, i) {
	let a = 2 * Math.PI / r.response, o = t + (a * a * (n - e) - 2 * r.dampingRatio * a * t) * i;
	return {
		value: e + o * i,
		rate: o
	};
}
function Et([e, t, n, r], i, a = 24) {
	if (i <= 0) return 0;
	if (i >= 1) return 1;
	let o = (e, t, n) => {
		let r = 1 - e;
		return 3 * r * r * e * t + 3 * r * e * e * n + e * e * e;
	}, s = 0, c = 1, l = i;
	for (let t = 0; t < a; t += 1) l = (s + c) / 2, o(l, e, n) < i ? s = l : c = l;
	return o(l, t, r);
}
var Dt = .99, Y = {
	rise: {
		dampingRatio: .8,
		response: .18
	},
	fall: {
		dampingRatio: 1,
		response: .44
	},
	slice: 1 / 120,
	gone: .001,
	restValue: 5e-4,
	restRate: .005
}, Ot = {
	limit: 5,
	resistance: .12,
	squeeze: .08,
	ease: 2
}, X = {
	lift: {
		rise: {
			dampingRatio: .75,
			response: .16
		},
		fall: {
			dampingRatio: .75,
			response: .26
		},
		fallsIfPeakedOnRelease: !0
	},
	scale: 1 + 2.5 / 66,
	pullLimit: 0,
	measuredSize: 66,
	minimumGrow: 2.5,
	follow: {
		dampingRatio: .75,
		response: .3
	},
	settle: {
		dampingRatio: .62,
		response: .33
	}
}, Z = {
	lift: {
		rise: {
			dampingRatio: 1,
			response: .25
		},
		fall: Ct({
			dampingRatio: 1,
			response: .2
		}),
		fallsIfPeakedOnRelease: !0
	},
	tap: Ct({
		dampingRatio: .8,
		response: .45
	}),
	snap: Ct({
		dampingRatio: 1,
		response: .3
	}),
	follow: {
		dampingRatio: .75,
		response: .3
	},
	barPress: {
		dampingRatio: .7,
		response: .34
	},
	growRise: {
		dampingRatio: .62,
		response: .33
	},
	growFall: {
		dampingRatio: .62,
		response: .33
	},
	pressWidth: 1.047,
	pressHeight: 1.073,
	held: 1.5,
	pressShare: .18,
	pillGoneAt: .5,
	departure: {
		curve: [
			0,
			0,
			.58,
			1
		],
		durationMs: 150,
		lingerDurations: 8,
		settledBelow: .01,
		solveSteps: 24
	},
	presenceStep: .2,
	followSlopDevicePx: .5,
	magnify: 1
}, kt = {
	spring: {
		dampingRatio: .45,
		response: .28
	},
	fastAt: 1600,
	fastest: .275,
	jolt: 9.125,
	narrowest: -.25,
	widest: .375,
	paceSmoothing: .03,
	stepLongest: 1 / 30,
	stepShortest: 1 / 240,
	holdFrames: 2.5,
	intervalBlend: .2,
	startInterval: 1 / 120,
	restShape: 5e-4,
	restRate: .005,
	restPace: 5e-4
}, Q = {
	lift: {
		rise: {
			dampingRatio: 1,
			response: .25
		},
		fall: {
			dampingRatio: 1,
			response: .4
		},
		fallsIfPeakedOnRelease: !0
	},
	tap: {
		dampingRatio: 1,
		response: .4
	},
	snap: {
		dampingRatio: 1,
		response: .4
	},
	follow: {
		dampingRatio: 1,
		response: .09
	},
	outsetAlong: 1 / 3,
	outsetAcross: .29,
	followSlopPx: 3,
	magnify: 1
}, At = {
	...kt,
	spring: {
		dampingRatio: .55,
		response: .38
	},
	fastAt: 529,
	fastest: .045,
	jolt: 0,
	narrowest: -.03,
	widest: .045
}, jt = 2.4, Mt = {
	fade: {
		dampingRatio: 1,
		response: .28
	},
	slide: {
		dampingRatio: .9,
		response: .15
	}
}, $ = {
	travel: {
		dampingRatio: .7,
		response: .47
	},
	liftMs: 210,
	liftCurve: [
		.42,
		0,
		.58,
		1
	],
	tapMs: 80,
	growX: .45,
	growY: .275,
	sliderGrow: .125,
	stretchMax: .025,
	stretchPerSpeed: 1e-4,
	stretchAcross: 1.25,
	stretchSpring: {
		dampingRatio: .55,
		response: .3
	},
	dragCommit: .4,
	dragSlop: 3,
	tapEnvelope: [
		[0, 0],
		[.06, 0],
		[.087, .120633],
		[.103, .204144],
		[.12, .280965],
		[.137, .334618],
		[.154, .353436],
		[.17, .333683],
		[.187, .281121],
		[.204, .209108],
		[.22, .133635],
		[.237, .068474],
		[.254, .02284],
		[.27, .001445],
		[.287, 0]
	]
}, Nt = () => ({
	phase: "resting",
	value: G(0)
}), Pt = (e, t) => {
	e.phase = "falling", K(e.value, 0, t.fall);
};
function Ft(e, t) {
	e.phase = "rising", K(e.value, 1, t.rise);
}
function It(e, t) {
	let n = e.phase === "rising" || e.phase === "waiting", r = t.fallsIfPeakedOnRelease && e.value.value >= .99;
	n && !r ? e.phase = "waiting" : Pt(e, t);
}
function Lt(e, t, n) {
	J(e.value, t);
	let r = e.value.value >= Dt;
	e.phase === "rising" && r ? e.phase = "peaked" : e.phase === "waiting" && r ? Pt(e, n) : e.phase === "falling" && !e.value.active && (e.phase = "resting");
}
var Rt = (e) => e.value.active || e.phase === "waiting", zt = () => ({
	state: { phase: "idle" },
	value: 0,
	rate: 0
}), Bt = (e) => e.state.phase === "rising" || e.state.phase === "full";
function Vt(e) {
	e.state = { phase: "rising" };
}
function Ht(e) {
	e.state.phase === "rising" ? e.state = { phase: "finishing" } : e.state.phase === "full" && (e.state = {
		phase: "lingering",
		wait: 0,
		waitRate: 0
	});
}
function Ut(e) {
	switch (e.state.phase) {
		case "rising":
		case "full": return Math.abs(e.value - 1) > Y.restValue || Math.abs(e.rate) > Y.restRate;
		case "lingering": return !0;
		case "idle":
		case "finishing":
		case "falling": return e.value > 0;
	}
}
var Wt = (e, t) => {
	let n = Tt(e.value, e.rate, 1, Y.rise, t);
	return e.value = n.value, e.rate = n.rate, e.value >= 1;
};
function Gt(e, t) {
	let { state: n } = e;
	switch (n.phase) {
		case "idle": return;
		case "rising":
			Wt(e, t) && (e.state = { phase: "full" });
			return;
		case "full":
			Wt(e, t);
			return;
		case "finishing":
			if (e.value <= 0) {
				e.state = { phase: "idle" };
				return;
			}
			Wt(e, t) && (e.state = { phase: "falling" });
			return;
		case "lingering": {
			Wt(e, t);
			let r = Tt(n.wait, n.waitRate, 1, Y.rise, t);
			e.state = r.value >= 1 ? { phase: "falling" } : {
				phase: "lingering",
				wait: r.value,
				waitRate: r.rate
			};
			return;
		}
		case "falling": {
			let n = Tt(e.value, e.rate, 0, Y.fall, t), r = n.value <= Y.gone;
			e.value = r ? 0 : n.value, e.rate = r ? 0 : n.rate, r && (e.state = { phase: "idle" });
			return;
		}
	}
}
function Kt(e, t) {
	for (let n = t; n > 0; n -= Y.slice) Gt(e, Math.min(Y.slice, n));
}
// src/motion/shape.ts
var qt = (e, t, n, r = {}) => ({
	role: e,
	rect: t,
	radii: n,
	lift: r.lift ?? 0,
	magnify: r.magnify ?? 1,
	alpha: r.alpha ?? 1,
	merge: r.merge ?? 0,
	tint: r.tint ?? null,
	light: r.light ?? 0,
	...r.smoothing === void 0 ? {} : { smoothing: r.smoothing }
});
function Jt(e, t, n = .001) {
	if (e.length !== t.length) return !1;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r], a = t[r];
		if (!i || !a || i.role !== a.role || i.tint !== a.tint || i.smoothing !== a.smoothing) return !1;
		let o = [
			i.rect.x - a.rect.x,
			i.rect.y - a.rect.y,
			i.rect.width - a.rect.width,
			i.rect.height - a.rect.height,
			i.radii[0] - a.radii[0],
			i.radii[1] - a.radii[1],
			i.radii[2] - a.radii[2],
			i.radii[3] - a.radii[3],
			i.lift - a.lift,
			i.magnify - a.magnify,
			i.alpha - a.alpha,
			i.merge - a.merge,
			i.light - a.light
		];
		for (let e of o) if (Math.abs(e) > n) return !1;
	}
	return !0;
}
// src/core/rubber-band.ts
function Yt(e, t, n = .55) {
	return !(t > 0) || e === 0 ? 0 : Math.sign(e) * (1 - 1 / (Math.abs(e) * n / t + 1)) * t;
}
function Xt(e, t, n = .55) {
	if (!(t > 0) || e === 0) return 0;
	let r = Math.abs(e);
	return r >= t ? Math.sign(e) * Infinity : Math.sign(e) * r / (n * (1 - r / t));
}
function Zt(e, t, n, r) {
	let i = e.x < t.x ? e.x - t.x : e.x > t.x + t.width ? e.x - t.x - t.width : 0, a = e.y < t.y ? e.y - t.y : e.y > t.y + t.height ? e.y - t.y - t.height : 0;
	return {
		x: Yt(i, n, r),
		y: Yt(a, n, r)
	};
}
// src/motion/stretch.ts
var Qt = () => ({
	x: G(0),
	y: G(0)
});
function $t(e, t, n, r, i = Ot.limit) {
	let a = Zt(t, n, i, Ot.resistance);
	(a.x !== e.x.target || e.x.active) && K(e.x, a.x, r), (a.y !== e.y.target || e.y.active) && K(e.y, a.y, r);
}
function en(e, t) {
	K(e.x, 0, t), K(e.y, 0, t);
}
function tn(e, t) {
	J(e.x, t), J(e.y, t);
}
var nn = (e) => e.x.active || e.y.active;
function rn(e, t, n, r) {
	let i = t.x.value, a = t.y.value, o = 1 / (1 + Math.abs(a) / Math.max(e.height, 1e-6) * Ot.squeeze), s = 1 / (1 + Math.abs(i) / Math.max(e.width, 1e-6) * Ot.squeeze);
	return {
		x: e.x + e.width / 2 + i / 2,
		y: e.y + e.height / 2 + a / 2,
		width: (e.width * n + Math.abs(i)) * o,
		height: (e.height * r + Math.abs(a)) * s
	};
}
function an(e, t, n, r, i) {
	let a = n.width * r, o = n.height * i, s = Math.min(1, Math.max(t.width - a, t.height - o) / Ot.ease), c = n.x + n.width / 2, l = n.y + n.height / 2;
	if (!(s > 0)) return {
		...e,
		x: e.x + (t.x - c),
		y: e.y + (t.y - l)
	};
	let u = 1 + s * (t.width / a - 1), d = 1 + s * (t.height / o - 1);
	return {
		x: c + (t.x - c) + (e.x - c) * u,
		y: l + (t.y - l) + (e.y - l) * d,
		width: e.width * u,
		height: e.height * d
	};
}
// src/motion/press.ts
function on(e) {
	return e > 0 ? 1 + L(e * (X.scale - 1), X.minimumGrow, X.measuredSize * (X.scale - 1)) / e : 1;
}
function sn(e = {}) {
	let t = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}, n = Nt(), r = zt(), i = Qt(), a = () => e.reducedMotion?.() ?? !1;
	return {
		get pressed() {
			return Bt(r);
		},
		size(e, n) {
			t = {
				x: 0,
				y: 0,
				width: e,
				height: n
			};
		},
		press() {
			Vt(r), a() || Ft(n, X.lift);
		},
		move(e) {
			Bt(r) && !a() && X.pullLimit > 0 && $t(i, e, t, X.follow, X.pullLimit);
		},
		release() {
			Bt(r) && (It(n, X.lift), en(i, X.settle)), Ht(r);
		},
		advance(a) {
			Kt(r, a), Lt(n, a, X.lift), tn(i, a);
			let o = 1 + ((e.scale ?? on(t.width)) - 1) * n.value.value;
			return {
				body: R(rn(t, i, o, o)),
				scale: o,
				light: r.value,
				moving: Ut(r) || Rt(n) || nn(i)
			};
		}
	};
}
var cn = (e, t) => [qt("body", e.body, Ne(Pe(t, e.scale), e.body), { light: e.light })], ln = {
	at: 0,
	pace: 0,
	rate: 0,
	shape: 0
}, un = (e = "", t = kt) => ({
	shape: ln,
	input: {
		since: 0,
		interval: t.startInterval
	},
	source: e,
	stretch: 0,
	params: t
});
function dn(e, t, n, r, i) {
	let a = (t) => L(t, e.stepShortest, e.stepLongest);
	if (n !== t.at) {
		let r = a(i.since), o = Math.abs(n - t.at) / r / e.fastAt;
		return i.interval += (Math.min(e.stepLongest, i.since) - i.interval) * e.intervalBlend, i.since = 0, t.pace + (o - t.pace) * (1 - Math.exp(-r / e.paceSmoothing));
	}
	return i.since > i.interval * e.holdFrames ? t.pace - t.pace * (1 - Math.exp(-a(r) / e.paceSmoothing)) : t.pace;
}
function fn(e, t, n, r, i) {
	i.since += r;
	let a = dn(e, t, n, r, i), o = L(r, e.stepShortest, e.stepLongest), s = 2 * Math.PI / e.spring.response, c = Math.min(1, a) * e.fastest, l = s * s * (c - t.shape) - 2 * e.spring.dampingRatio * s * t.rate, u = t.rate + l * o + e.jolt * Math.min(0, a - t.pace);
	return {
		at: n,
		pace: a,
		rate: u,
		shape: L(t.shape + u * o, e.narrowest, e.widest)
	};
}
function pn(e, t, n, r, i) {
	let a = e.shape;
	if (t !== e.source) {
		e.source = t, e.shape = {
			at: n,
			pace: a.pace,
			rate: a.rate,
			shape: a.shape
		};
		return;
	}
	if (!r && a.shape === 0 && a.rate === 0) {
		e.shape = {
			at: n,
			pace: 0,
			rate: 0,
			shape: 0
		};
		return;
	}
	let o = e.params, s = fn(o, a, n, i, e.input), c = !r && Math.abs(s.shape) < o.restShape && Math.abs(s.rate) < o.restRate;
	e.shape = c ? {
		at: n,
		pace: 0,
		rate: 0,
		shape: 0
	} : s, e.stretch = c ? 0 : s.shape;
}
var mn = (e) => Math.abs(e.shape.shape) > e.params.restShape || Math.abs(e.shape.rate) > e.params.restRate || e.shape.pace > e.params.restPace, hn = (e, t) => ({
	x: 1 + e,
	y: t === void 0 ? 1 / (1 + e) : 1 - t * e
}), gn = (Z.held - 1) * (1 - Z.pressShare);
function _n(e, t, n = {}) {
	let r = e, i = () => n.reducedMotion?.() ?? !1, a = n.profile === "segmented", o = a ? {
		lift: Q.lift,
		tap: Q.tap,
		snap: Q.snap,
		follow: Q.follow
	} : {
		lift: Z.lift,
		tap: Z.tap,
		snap: Z.snap,
		follow: Z.follow
	}, s = (e) => {
		let t = r.segments[L(e, 0, Math.max(0, r.segments.length - 1))];
		return t ? t.x + t.width / 2 : r.bar.x + r.bar.width / 2;
	}, c = () => s(0), l = () => s(r.segments.length - 1), u = (e) => {
		let t = r.segments, n = {
			width: r.bar.height,
			height: r.bar.height,
			y: r.bar.y + r.bar.height / 2
		};
		if (t.length === 0) return n;
		let i = (e) => {
			let n = t[e] ?? t[0];
			return {
				c: n.x + n.width / 2,
				width: n.width,
				height: n.height,
				y: n.y + n.height / 2
			};
		}, a = i(0);
		if (e <= a.c || t.length === 1) return a;
		for (let n = 1; n < t.length; n += 1) {
			let t = i(n);
			if (e <= t.c) {
				let n = t.c > a.c ? (e - a.c) / (t.c - a.c) : 0;
				return {
					width: a.width + (t.width - a.width) * n,
					height: a.height + (t.height - a.height) * n,
					y: a.y + (t.y - a.y) * n
				};
			}
			a = t;
		}
		return a;
	}, d = (e) => {
		let t = f.selected, n = Infinity;
		return r.segments.forEach((i, a) => {
			if (r.disabled?.[a]) return;
			let o = Math.abs(s(a) - e);
			o < n && (n = o, t = a);
		}), t;
	}, f = {
		selected: t,
		touch: { phase: "idle" },
		finger: {
			originX: 0,
			drag: 0,
			reach: 0,
			pointerY: null
		},
		x: G(s(t)),
		lift: Nt(),
		liftBefore: 0,
		bar: {
			phase: "down",
			pressed: G(0),
			grow: G(0),
			pull: Qt(),
			light: zt()
		},
		presence: {
			pillState: { phase: "resting" },
			lensState: { phase: "gone" },
			pill: 1,
			lens: 0
		},
		deform: un("lens", a ? At : void 0)
	}, p = () => f.touch.phase === "pressed" || f.touch.phase === "dragging", m = () => {
		if (a) return;
		let { finger: e } = f, t = {
			x: e.originX + e.drag,
			y: e.pointerY ?? r.bar.y + r.bar.height / 2
		};
		$t(f.bar.pull, t, r.bar, o.follow);
	}, h = (e, t) => {
		f.touch.phase === "dragging" ? f.touch = {
			phase: "pressed",
			index: f.touch.index
		} : f.touch.phase === "idle" && (f.touch = { phase: "settling" }), f.selected = e, K(f.x, s(e), t), It(f.lift, o.lift);
	}, g = (e) => Et(Z.departure.curve, e, Z.departure.solveSteps), _ = (e, t, n) => {
		let r = f.presence;
		e > t && e > 0 ? r.pillState = { phase: "following" } : r.pillState.phase === "following" && e < t && e <= Z.pillGoneAt && (r.pillState = {
			phase: "returning",
			at: n,
			from: r.pill
		});
		let i = r.pillState;
		if (i.phase === "following") {
			r.pill = Math.max(0, 1 - e / Z.pillGoneAt);
			return;
		}
		if (i.phase !== "returning") return;
		let a = L((n - i.at) / Z.departure.durationMs, 0, 1);
		r.pill = i.from + (1 - i.from) * g(a), a >= 1 && (r.pillState = { phase: "resting" });
	}, v = (e) => {
		let t = f.presence, n = t.lensState.phase === "shown", r = t.pillState.phase === "following";
		r && !n ? t.lensState = { phase: "shown" } : !r && n && (t.lensState = {
			phase: "departing",
			at: e,
			from: t.lens
		});
	}, y = (e, t, n) => {
		let r = f.presence, i = r.lensState;
		if (i.phase === "shown") {
			r.lens = Math.min(1, r.lens + Z.presenceStep * t * 120);
			return;
		}
		if (i.phase !== "departing") return;
		let { durationMs: a, settledBelow: o, lingerDurations: s } = Z.departure, c = n - i.at;
		r.lens = Math.max(i.from * (1 - g(L(c / a, 0, 1))), e), c >= a && (e <= o || c >= a * s) && (r.lens = 0, r.lensState = { phase: "gone" });
	}, b = () => {
		let e = f.presence;
		return e.pillState.phase === "returning" || e.lensState.phase === "departing" || e.lensState.phase === "shown" && e.lens < 1;
	}, x = (e) => {
		let { bar: t } = f;
		if (p()) {
			if (t.phase === "up") return;
			t.phase = "up", K(t.pressed, 1, Z.barPress);
		} else t.phase === "up" && (e <= 0 || e < f.liftBefore) && (t.phase = "down", K(t.pressed, 0, Z.barPress));
	};
	return {
		get selected() {
			return f.selected;
		},
		get touching() {
			return p();
		},
		get dragging() {
			return f.touch.phase === "dragging";
		},
		layout(e) {
			r = e, f.selected = L(f.selected, 0, Math.max(0, e.segments.length - 1)), !p() && !f.x.active ? q(f.x, s(f.selected)) : p() || K(f.x, s(f.selected), f.x.params ?? o.tap);
		},
		press(e, t) {
			if (f.touch = {
				phase: "pressed",
				index: e
			}, f.finger = {
				originX: t.x,
				drag: 0,
				reach: f.finger.reach,
				pointerY: null
			}, i() || (Ft(f.lift, o.lift), f.presence.pillState = { phase: "following" }), a) {
				let t = s(e);
				f.x.target !== t && K(f.x, t, o.tap);
				return;
			}
			let n = s(e);
			f.x.target !== n && K(f.x, n, o.tap), Vt(f.bar.light), K(f.bar.grow, 1, Z.growRise);
		},
		move(e) {
			let t = f.touch;
			if (t.phase !== "pressed" && t.phase !== "dragging") return;
			f.finger.pointerY = e.y;
			let n = t.index, i = e.x - f.finger.originX, u = a ? Q.followSlopPx : Z.followSlopDevicePx / Math.max(1, r.dpr);
			t.phase === "pressed" && Math.abs(i) < u || (f.touch = {
				phase: "dragging",
				index: n
			}, f.finger.drag = i, f.finger.reach = L(s(n) + i, c(), l()), K(f.x, f.finger.reach, o.follow)), m();
		},
		release(e) {
			let t = f.touch, n = t.phase === "dragging", i = t.phase === "pressed" || t.phase === "dragging" ? t.index : null;
			if (f.touch = { phase: "settling" }, Ht(f.bar.light), K(f.bar.grow, 0, Z.growFall), en(f.bar.pull, Z.growFall), It(f.lift, o.lift), !e || i === null) return K(f.x, s(f.selected), o.tap), f.selected;
			if (n) {
				let e = d(s(i) + f.finger.drag);
				h(e, o.snap);
			} else r.disabled?.[i] ? K(f.x, s(f.selected), o.tap) : h(i, o.tap);
			return f.selected;
		},
		select(e, t = !0) {
			p() || (!t || i() ? (f.selected = e, q(f.x, s(e))) : (e !== f.selected || f.x.target !== s(e)) && h(e, o.tap));
		},
		advance(e, t) {
			Lt(f.lift, e, o.lift);
			let n = f.lift.value.value;
			_(n, f.liftBefore, t), x(n), f.liftBefore = n, J(f.x, e), f.touch.phase === "settling" && !f.x.active && (f.touch = { phase: "idle" }), J(f.bar.pressed, e);
			let i = f.touch.phase === "dragging";
			pn(f.deform, i ? "reach" : "lens", i ? f.finger.reach : f.x.value, a ? i : n > 0, e), v(t), Kt(f.bar.light, e);
			let s = hn(f.deform.stretch, a ? jt : void 0), c = f.x.value, l = u(c), d, p, m;
			if (a) d = (1 + 2 * Q.outsetAlong * l.height * n / Math.max(l.width, 1)) * s.x, p = (1 + 2 * Q.outsetAcross * n) * s.y, m = n, f.presence.lens = +(n > .001), f.presence.pill = Math.max(0, 1 - n);
			else {
				let r = 1 + (Z.held - 1) * ((1 - Z.pressShare) * n + Z.pressShare * f.bar.pressed.value);
				d = r * s.x, p = r * s.y, m = L((Math.max(d, p) - 1) / gn, 0, 1), y(m, e, t);
			}
			J(f.bar.grow, e);
			let h = 1 + (Z.pressWidth - 1) * f.bar.grow.value, g = 1 + (Z.pressHeight - 1) * f.bar.grow.value;
			tn(f.bar.pull, e);
			let S = r.bar, C = rn(S, f.bar.pull, h, g), w = S.x + S.width / 2, ee = S.y + S.height / 2, T = an({
				x: w + (c - w) * h,
				y: l.y,
				width: l.width * d,
				height: l.height * p
			}, C, S, Z.pressWidth, Z.pressHeight), te = C.width / Math.max(S.width, 1e-6), ne = C.height / Math.max(S.height, 1e-6), E = a ? 1 : 1 + gn * n, D = {
				x: C.x + (c - w) * te,
				y: C.y + (l.y - ee) * ne,
				width: l.width * E * te,
				height: l.height * E * ne
			}, O = nn(f.bar.pull) || f.bar.grow.active || Rt(f.lift) || f.x.active || f.bar.pressed.active || !a && b() || Ut(f.bar.light) || n > 0 && mn(f.deform);
			return {
				bar: R(C),
				barLight: f.bar.light.value,
				pill: R(D),
				pillAlpha: f.presence.pill,
				lens: R(T),
				lensAlpha: f.presence.lens,
				lift: m,
				selected: f.selected,
				moving: O
			};
		}
	};
}
function vn(e, t) {
	let n = t.bar === "capsule" ? V("capsule", e.bar) : Pe(V(t.bar, t.restBar), Math.min(e.bar.width / Math.max(t.restBar.width, 1e-6), e.bar.height / Math.max(t.restBar.height, 1e-6))), r = [qt("body", e.bar, n, { light: e.barLight })];
	return e.pillAlpha > .001 && r.push(qt("pill", e.pill, yn(e, n, t.segment), { alpha: e.pillAlpha })), e.lensAlpha > .001 && r.push(qt("lens", e.lens, V("capsule", e.lens), {
		alpha: e.lensAlpha,
		lift: e.lift,
		magnify: 1 + (Z.magnify - 1) * e.lift
	})), r;
}
function yn(e, t, n) {
	if (n !== null) return V(n, e.pill);
	let { bar: r, pill: i } = e, a = Math.max(0, Math.min(i.y - r.y, r.y + r.height - i.y - i.height)), o = Math.min(i.width, i.height) / 2;
	return [
		Math.min(o, Math.max(0, t[0] - a)),
		Math.min(o, Math.max(0, t[1] - a)),
		Math.min(o, Math.max(0, t[2] - a)),
		Math.min(o, Math.max(0, t[3] - a))
	];
}
// src/motion/highlight.ts
function bn(e = {}) {
	let t = G(), n = G(), r = G(), i = G(), a = G(0), o = [
		t,
		n,
		r,
		i
	], s, c = !1, l = (e, t) => {
		let n = [
			e.x,
			e.y,
			e.width,
			e.height
		];
		o.forEach((e, r) => {
			let i = n[r] ?? 0;
			t ? K(e, i, Mt.slide) : q(e, i);
		});
	};
	return {
		target(o, u) {
			if (!o) {
				c && K(a, 0, Mt.fade), c = !1, s = void 0;
				return;
			}
			let d = e.reducedMotion?.() ?? !1;
			if (a.value < .01 && !c) l(o, !1);
			else if (u !== void 0 && u === s) {
				let e = o.x - t.target, a = o.y - n.target;
				(e !== 0 || a !== 0 || o.width !== r.target || o.height !== i.target) && (t.value += e, n.value += a, t.target = o.x, n.target = o.y, t.active || q(t, o.x), n.active || q(n, o.y), K(r, o.width, Mt.slide), K(i, o.height, Mt.slide), d && l(o, !1));
			} else l(o, !d);
			s = u, c || K(a, 1, Mt.fade), c = !0;
		},
		advance(e) {
			let s = !1;
			for (let t of o) s = J(t, e) || s;
			return s = J(a, e) || s, {
				rect: {
					x: t.value,
					y: n.value,
					width: r.value,
					height: i.value
				},
				alpha: Math.max(0, Math.min(1, a.value)),
				moving: s
			};
		}
	};
}
var xn = (e, t, n = null, r = null) => {
	if (e.alpha <= .001) return [];
	let i = V(t, e.rect), a = r ? Fe(e.rect, r.size, r.radii, i) : i;
	return [qt("pill", e.rect, a, {
		alpha: e.alpha,
		tint: n
	})];
};
// src/motion/thumb.ts
function Sn(e) {
	let t = $.tapEnvelope;
	for (let n = 1; n < t.length; n += 1) {
		let [r, i] = t[n];
		if (e <= r) {
			let [a, o] = t[n - 1];
			return o + (i - o) * Math.max(0, (e - a) / (r - a));
		}
	}
	return 0;
}
function Cn(e = {}) {
	let t = !1, n = 0, r = !1, i = 0, a = {
		at: -Infinity,
		from: 0,
		to: 0
	}, o = null, s = 0, c = G(0), l = () => e.reducedMotion?.() ?? !1;
	return {
		get pressed() {
			return t;
		},
		press(e) {
			t || (t = !0, n = e, r = !1, a = {
				at: e,
				from: i,
				to: 1
			});
		},
		release(e) {
			t && (t = !1, r = e - n < $.tapMs && i < .5, a = {
				at: e,
				from: i,
				to: 0
			});
		},
		advance(e, u, d) {
			let f;
			if (l()) i = +!!t, f = !1;
			else if (r) {
				let e = (u - n) / 1e3;
				i = Sn(e), f = e < ($.tapEnvelope.at(-1)?.[0] ?? 0), f || (r = !1);
			} else {
				let e = Math.min(1, (u - a.at) / $.liftMs);
				i = a.from + (a.to - a.from) * Et($.liftCurve, e, 16), f = e < 1;
			}
			return o !== null && e > 0 && (s += ((d - o) / e - s) * Math.min(1, e * 18)), o = d, l() && (s = 0), K(c, Math.min($.stretchMax, Math.abs(s) * $.stretchPerSpeed) * i, $.stretchSpring), J(c, e), Math.abs(s) <= 1 && (s = 0), {
				progress: i,
				stretch: c.value,
				moving: f || c.active || s !== 0
			};
		}
	};
}
function wn(e, t, n = !1, r = "switch") {
	let i = n ? e.height : e.width, a = n ? e.width : e.height, o = (r === "slider" ? $.sliderGrow * i : $.growX * a) * t.progress, s = (r === "slider" ? $.sliderGrow * a : $.growY * a) * t.progress, c = n ? {
		x: -s,
		y: -o,
		width: e.width + s * 2,
		height: e.height + o * 2
	} : {
		x: -o,
		y: -s,
		width: e.width + o * 2,
		height: e.height + s * 2
	}, l = 1 + t.stretch, u = 1 - $.stretchAcross * t.stretch;
	return n ? B(c, u, l) : B(c, l, u);
}
function Tn(e, t, n = !1, r = "switch") {
	if (t.progress <= .001) return [];
	let i = wn(e, t, n, r);
	return [qt("thumb", i, V("capsule", i), {
		alpha: Math.min(1, t.progress),
		lift: t.progress,
		magnify: 1 + (Z.magnify - 1) * t.progress
	})];
}
// src/motion/switch.ts
function En(e, t = {}) {
	let n = {
		width: 0,
		travel: 0,
		rtl: !1
	}, r = e, i = G(+!!e), a = Cn(t), o = null, s = () => t.reducedMotion?.() ?? !1, c = (e) => {
		s() ? q(i, +!!e) : K(i, +!!e, $.travel);
	}, l = (e) => {
		if (!o) return r;
		if (!o.oppositeHalf) return e >= n.width / 2 !== n.rtl;
		let t = (e - o.x) * (n.rtl ? -1 : 1);
		return o.start ? t >= -n.width * $.dragCommit : t > n.width * $.dragCommit;
	};
	return {
		get pressed() {
			return a.pressed;
		},
		layout(e) {
			n = e;
		},
		setChecked(e, t = !0) {
			r = e, o || (t ? c(e) : q(i, +!!e));
		},
		press(e, t) {
			let i = e >= n.width / 2 !== n.rtl;
			o = {
				x: e,
				start: r,
				oppositeHalf: i !== r,
				moved: !1,
				landing: r
			}, a.press(t);
		},
		drag(e) {
			if (!o || (o.moved ||= Math.abs(e - o.x) > $.dragSlop, !o.moved)) return;
			let t = l(e);
			t !== o.landing && (o.landing = t, c(t));
		},
		release(e, t) {
			let n = o;
			if (o = null, a.release(t), !n || !e) return c(r), null;
			let i = n.moved ? n.landing : !r;
			return c(i), i;
		},
		advance(e, t) {
			let s = J(i, e), c = i.value * n.travel * (n.rtl ? -1 : 1), l = a.advance(e, t, c);
			return {
				...l,
				position: i.value,
				offset: c,
				on: o?.moved ? o.landing : r,
				moving: s || l.moving
			};
		}
	};
}
// src/motion/slider.ts
var Dn = (e = {}) => Cn(e), On = /* @__PURE__ */ l({
	computedRadii: () => rt,
	createGlassScene: () => bt,
	createHighlightMachine: () => bn,
	createLensMachine: () => _n,
	createPressMachine: () => sn,
	createSliderMachine: () => Dn,
	createSwitchMachine: () => En,
	highlightShapes: () => xn,
	lensShapes: () => vn,
	press: () => X,
	pressShapes: () => cn,
	resolveColor: () => ne,
	resolveRadii: () => V,
	sameShapes: () => Jt,
	stretch: () => Ot,
	thumb: () => $,
	thumbShapes: () => Tn
});
export { Ne as A, ee as B, q as C, Ve as D, bt as E, B as F, Oe as I, je as L, ke as M, z as N, Me as O, V as P, u as R, wt as S, J as T, Jt as _, wn as a, G as b, xn as c, sn as d, on as f, Zt as g, Xt as h, Cn as i, R as j, Fe as k, _n as l, Yt as m, Dn as n, Tn as o, cn as p, En as r, bn as s, On as t, vn as u, qt as v, K as w, Et as x, Ct as y, T as z };
