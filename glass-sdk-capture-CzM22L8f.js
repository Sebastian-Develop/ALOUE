import { B as e, R as t, z as n } from "./glass-sdk-scene-DpJxQ9hU.js";
// src/capture/snapshot.ts
var r = /* @__PURE__ */ new WeakSet();
function i(e) {
	let t = e.transferToImageBitmap();
	return r.add(t), t;
}
function a(e) {
	return r.has(e);
}
// src/capture/bitmaps.ts
var o = 8388608, s = 512, c = class {
	onReady;
	byKey = /* @__PURE__ */ new Map();
	idle = /* @__PURE__ */ new Set();
	idlePixels = 0;
	nextId = 1;
	uploads = /* @__PURE__ */ new Map();
	releases = [];
	sent = /* @__PURE__ */ new Set();
	disposed = !1;
	constructor(e) {
		this.onReady = e;
	}
	get(e) {
		let t = this.byKey.get(e);
		return t && this.idle.delete(t) && (this.idlePixels -= t.width * t.height), t;
	}
	create(e, t, n) {
		let r = {
			key: e,
			keep: n,
			bitmap: this.nextId++,
			state: "pending",
			width: 0,
			height: 0,
			refs: 0,
			waiting: /* @__PURE__ */ new Set(),
			owned: t,
			meta: null,
			generation: 0
		};
		return t || this.byKey.set(e, r), r;
	}
	putSync(e, t) {
		let n = this.create(e, !1, !1);
		return this.ready(n, t), n;
	}
	putAsync(e, t) {
		let n = this.create(e, !1, !0);
		return t().then((t) => {
			if (!t) return this.fail(n);
			this.disposed || this.byKey.get(e) !== n ? t.close() : (this.ready(n, t), this.onReady(n));
		}, () => this.fail(n)), n;
	}
	owned(e) {
		return this.create(e, !0, !1);
	}
	replace(e, t) {
		if (this.disposed) {
			t.close();
			return;
		}
		let n = e.state === "ready", r = e.width !== t.width || e.height !== t.height;
		this.ready(e, t), r && n && (e.generation += 1), (!n || r) && this.onReady(e);
	}
	ready(e, t) {
		e.state = "ready", e.width = t.width, e.height = t.height;
		let n = this.uploads.get(e.bitmap);
		n && n !== t && n.close(), this.uploads.set(e.bitmap, t);
	}
	fail(e) {
		e.state = "failed", e.waiting.clear();
	}
	acquire(e) {
		e.refs += 1, e.refs === 1 && this.idle.delete(e) && (this.idlePixels -= e.width * e.height);
	}
	release(e) {
		--e.refs, e.refs > 0 || e.owned || (e.refs = 0, e.state === "failed" ? this.byKey.delete(e.key) : e.keep ? (this.idle.add(e), this.idlePixels += e.width * e.height, this.trim(o, s)) : this.free(e));
	}
	trim(e, t) {
		for (let n of this.idle) {
			if (this.idlePixels <= e && this.idle.size <= t) break;
			this.idle.delete(n), this.idlePixels -= n.width * n.height, this.free(n);
		}
	}
	drop(e) {
		this.free(e);
	}
	free(e) {
		this.byKey.get(e.key) === e && this.byKey.delete(e.key), e.waiting.clear();
		let t = this.uploads.get(e.bitmap);
		t && (t.close(), this.uploads.delete(e.bitmap)), this.sent.delete(e.bitmap) && this.releases.push(e.bitmap), e.state = "failed";
	}
	hasPending() {
		return this.uploads.size > 0 || this.releases.length > 0;
	}
	take() {
		let e = [], t = [];
		for (let [n, r] of this.uploads) e.push({
			id: n,
			image: r,
			snapshot: a(r)
		}), t.push(r), this.sent.add(n);
		this.uploads = /* @__PURE__ */ new Map();
		let n = this.releases;
		return this.releases = [], {
			bitmaps: e,
			transfer: t,
			releases: n
		};
	}
	dispose() {
		this.disposed = !0;
		for (let e of this.uploads.values()) e.close();
		this.uploads.clear(), this.byKey.clear(), this.idle.clear();
	}
}, l = [
	0,
	0,
	0,
	0
], u = (e) => {
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : 0;
};
function d(e, t) {
	let n = [], r = 0, i = "", a = 0;
	for (let o = 0; o < e.length; o += 1) {
		let s = e[o];
		if (i) s === i && (i = "");
		else if (s === "\"" || s === "'") i = s;
		else if (s === "(") r += 1;
		else if (s === ")") --r;
		else if (r === 0 && (t === " " ? s === " " || s === "\n" || s === "	" : s === t)) {
			let t = e.slice(a, o).trim();
			t && n.push(t), a = o + 1;
		}
	}
	let o = e.slice(a).trim();
	return o && n.push(o), n;
}
function f(e, t) {
	let n = /^(-?[\d.]+(?:e-?\d+)?)(px|%)?$/i.exec(e);
	if (!n) return null;
	let r = Number.parseFloat(n[1] ?? "");
	return Number.isFinite(r) ? n[2] === "%" ? r / 100 * t : r : null;
}
function p(e, t, n) {
	if (e === "0px" || e === "") return [0, 0];
	let [r = "0", i = r] = e.split(" ");
	return [Math.max(0, f(r, t) ?? u(r)), Math.max(0, f(i, n) ?? u(i))];
}
function m(e, t, n, r) {
	let i = e.borderTopLeftRadius, a = e.borderTopRightRadius, o = e.borderBottomRightRadius, s = e.borderBottomLeftRadius;
	if (i === "0px" && a === "0px" && o === "0px" && s === "0px") return l;
	let c = p(i, t, n), u = p(a, t, n), d = p(o, t, n), f = p(s, t, n), m = 1, h = (e, t) => {
		e > t && e > 0 && (m = Math.min(m, t / e));
	};
	h(c[0] + u[0], t), h(f[0] + d[0], t), h(c[1] + f[1], n), h(u[1] + d[1], n);
	let g = (e) => Math.min(e[0], e[1]) * m * r;
	return [
		g(c),
		g(u),
		g(d),
		g(f)
	];
}
function h(e, t, n, r, i) {
	return [
		Math.max(0, e[0] - Math.max(t, i)),
		Math.max(0, e[1] - Math.max(t, n)),
		Math.max(0, e[2] - Math.max(r, n)),
		Math.max(0, e[3] - Math.max(r, i))
	];
}
function g(e, t, n, r, i) {
	return {
		x: e.x + i,
		y: e.y + t,
		width: Math.max(0, e.width - i - n),
		height: Math.max(0, e.height - t - r)
	};
}
var _ = (e) => /^-?[\d.]+(?:e-?\d+)?(px)?$/i.test(e);
function v(t, n) {
	if (t === "none" || t === "") return [];
	let r = [];
	for (let i of d(t, ",")) {
		let t = d(i, " ");
		if (t.includes("inset")) continue;
		let a = [], o = "";
		for (let e of t) _(e) ? a.push(u(e) * n) : o = o ? `${o} ${e}` : e;
		let s = e(o || "currentcolor");
		!s || s[3] <= 0 || a.length < 2 || r.push({
			x: a[0] ?? 0,
			y: a[1] ?? 0,
			blur: Math.max(0, a[2] ?? 0),
			spread: a[3] ?? 0,
			color: s
		});
	}
	return r;
}
function y(t) {
	if (t === "none" || t === "") return [];
	let n = [];
	for (let r of d(t, ",")) {
		let t = [], i = "";
		for (let e of d(r, " ")) _(e) ? t.push(u(e)) : i = i ? `${i} ${e}` : e;
		let a = e(i || "currentcolor");
		!a || a[3] <= 0 || n.push([
			t[0] ?? 0,
			t[1] ?? 0,
			Math.max(0, t[2] ?? 0),
			i
		]);
	}
	return n.slice(0, 4);
}
var b = /^matrix\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),/, x = /^matrix3d\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^,]+,\s*([^,]+),\s*([^,]+),/;
function S(e, t, n) {
	let r = 1;
	if (e !== "none") {
		let t = b.exec(e);
		if (t) r = Math.hypot(Number(t[1]), Number(t[2])) || 1;
		else {
			let t = x.exec(e);
			t && (r = Math.hypot(Number(t[1]), Number(t[2])) || 1);
		}
	}
	if (t !== "none" && t !== "") {
		let e = Number.parseFloat(t);
		Number.isFinite(e) && e > 0 && (r *= t.trim().split(/\s+/)[0]?.endsWith("%") ? e / 100 : e);
	}
	if (n && n !== "1" && n !== "normal") {
		let e = Number.parseFloat(n);
		Number.isFinite(e) && e > 0 && (r *= n.endsWith("%") ? e / 100 : e);
	}
	return r;
}
var C = (e, t, n = .01) => Math.abs(e.x - t.x) < n && Math.abs(e.y - t.y) < n && Math.abs(e.width - t.width) < n && Math.abs(e.height - t.height) < n, w = (e, t) => e.x < t.x + t.width && t.x < e.x + e.width && e.y < t.y + t.height && t.y < e.y + e.height, T = (e, t) => t.x >= e.x && t.y >= e.y && t.x + t.width <= e.x + e.width && t.y + t.height <= e.y + e.height, E = (e, t, n) => ({
	x: e.x - t,
	y: e.y - n,
	width: e.width + t * 2,
	height: e.height + n * 2
}), D = (e, t, n) => ({
	x: e.x + t,
	y: e.y + n,
	width: e.width,
	height: e.height
}), O = (e, t) => e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3], k = class {
	scrollers = /* @__PURE__ */ new Map();
	scrollerOf = /* @__PURE__ */ new WeakMap();
	clips = /* @__PURE__ */ new Map();
	clipOf = /* @__PURE__ */ new WeakMap();
	nextScroller = 2;
	nextClip = 1;
	changedScrollers = /* @__PURE__ */ new Set();
	changedClips = /* @__PURE__ */ new Set();
	chains = /* @__PURE__ */ new Map();
	constructor() {
		this.scrollers.set(0, this.state(0, null, -1, 1)), this.scrollers.set(1, this.state(1, null, 0, 1)), this.changedScrollers.add(1);
	}
	state(e, t, n, r) {
		let i = t ? {
			x: t.scrollLeft,
			y: t.scrollTop
		} : e === 0 ? {
			x: scrollX,
			y: scrollY
		} : {
			x: 0,
			y: 0
		};
		return {
			id: e,
			el: t,
			parent: n,
			baseX: i.x,
			baseY: i.y,
			zoom: r,
			cull: null,
			clip: 0,
			sticky: /* @__PURE__ */ new Set(),
			moved: !1
		};
	}
	begin() {
		this.chains.clear();
	}
	own(e) {
		let t = this.scrollers.get(e);
		if (!t) return {
			x: 0,
			y: 0
		};
		if (e === 0) return {
			x: scrollX - t.baseX,
			y: scrollY - t.baseY
		};
		if (e === 1) {
			let e = this.own(0);
			return {
				x: -e.x,
				y: -e.y
			};
		}
		let n = t.el;
		return n ? {
			x: (n.scrollLeft - t.baseX) * t.zoom,
			y: (n.scrollTop - t.baseY) * t.zoom
		} : {
			x: 0,
			y: 0
		};
	}
	chain(e) {
		let t = this.chains.get(e);
		if (t) return t;
		let n = 0, r = 0, i = 0;
		for (let t = e; t >= 0 && i < 64; i += 1) {
			let e = this.own(t);
			n += e.x, r += e.y, t = this.scrollers.get(t)?.parent ?? -1;
		}
		let a = {
			x: n,
			y: r
		};
		return this.chains.set(e, a), a;
	}
	normalise(e, t) {
		let n = this.chain(t);
		return {
			x: e.left + n.x,
			y: e.top + n.y,
			width: e.width,
			height: e.height
		};
	}
	scrollerFor(e) {
		let t = this.scrollerOf.get(e);
		return t === void 0 ? void 0 : this.scrollers.get(t);
	}
	ensureScroller(e, t, n, r) {
		let i = this.scrollerOf.get(e), a = i === void 0 ? void 0 : this.scrollers.get(i);
		return a ? a.parent !== t && (a.parent = t, this.changedScrollers.add(a.id), this.chains.clear()) : (a = this.state(this.nextScroller++, e, t, n), this.scrollers.set(a.id, a), this.scrollerOf.set(e, a.id), this.changedScrollers.add(a.id)), a.zoom = n, a.clip = r, a;
	}
	ensureClip(e, t, n, r, i) {
		let a = this.clipOf.get(e), o = a === void 0 ? void 0 : this.clips.get(a);
		if (o) return o.parent === t && o.scroller === n && C(o.rect, r) && O(o.radii, i) || (o.parent = t, o.scroller = n, o.rect = r, o.radii = i, this.changedClips.add(o.id)), o.id;
		let s = this.nextClip++;
		return this.clips.set(s, {
			id: s,
			el: e,
			parent: t,
			scroller: n,
			rect: r,
			radii: i
		}), this.clipOf.set(e, s), this.changedClips.add(s), s;
	}
	clipRect(e) {
		return this.clips.get(e)?.rect ?? null;
	}
	clipScroller(e) {
		return this.clips.get(e)?.scroller ?? 0;
	}
	shiftClip(e, t, n) {
		let r = this.clips.get(e);
		r && (r.rect = {
			x: r.rect.x + t,
			y: r.rect.y + n,
			width: r.rect.width,
			height: r.rect.height
		}, this.changedClips.add(e));
	}
	deltas() {
		let e = new Float32Array(this.scrollers.size * 3), t = 0;
		for (let n of this.scrollers.values()) {
			let r, i;
			if (n.id === 0) r = scrollX - n.baseX, i = scrollY - n.baseY;
			else if (n.id === 1) {
				let e = this.scrollers.get(0);
				r = e ? e.baseX - scrollX : 0, i = e ? e.baseY - scrollY : 0;
			} else n.el ? (r = (n.el.scrollLeft - n.baseX) * n.zoom, i = (n.el.scrollTop - n.baseY) * n.zoom) : (r = 0, i = 0);
			e[t] = n.id, e[t + 1] = r, e[t + 2] = i, t += 3;
		}
		return e;
	}
	prune() {
		for (let [e, t] of this.scrollers) t.el && !t.el.isConnected && (this.scrollers.delete(e), this.scrollerOf.delete(t.el));
		for (let [e, t] of this.clips) t.el.isConnected || (this.clips.delete(e), this.clipOf.delete(t.el), this.changedClips.delete(e));
	}
	hasChanges() {
		return this.changedScrollers.size > 0 || this.changedClips.size > 0;
	}
	take(e) {
		let t = [], n = [], r = e ? this.scrollers.keys() : this.changedScrollers.values();
		for (let e of r) {
			let n = this.scrollers.get(e);
			n && e !== 0 && t.push({
				id: e,
				parent: n.parent
			});
		}
		let i = e ? this.clips.keys() : this.changedClips.values();
		for (let e of i) {
			let t = this.clips.get(e);
			t && n.push({
				id: e,
				parent: t.parent,
				scroller: t.scroller,
				rect: t.rect,
				radii: t.radii
			});
		}
		return this.changedScrollers.clear(), this.changedClips.clear(), {
			scrollers: t,
			clips: n
		};
	}
};
// src/capture/order.ts
function A(e) {
	let t = [], n = [];
	j(e, t, n);
	for (let e = 0; e < n.length; e += 1) {
		let r = n[e];
		r && j(r, t, n);
	}
	return t;
}
function j(e, t, n) {
	for (let n of e.drafts) t.push(n);
	let r = [], i = [];
	N(e, i, r, n), r.length > 1 && r.sort((e, t) => e.z - t.z);
	let a = 0;
	for (; a < r.length && (r[a]?.z ?? 0) < 0; a += 1) M(r[a], t, n);
	for (let e of i) t.push(e);
	for (; a < r.length; a += 1) M(r[a], t, n);
}
function M(e, t, n) {
	if (e.context) j(e, t, n);
	else {
		for (let n of e.drafts) t.push(n);
		N(e, t, null, n);
	}
}
function N(e, t, n, r) {
	for (let i of e.children) if (i.kind === "text") for (let e of i.drafts) t.push(e);
	else if (i.state === "drawn") {
		if (i.top) r.push(i);
		else if (i.layered) n && (n.push(i), i.context || P(i, n));
		else {
			for (let e of i.drafts) t.push(e);
			N(i, t, n, r);
		}
	}
}
function P(e, t) {
	for (let n of e.children) n.kind === "text" || n.state !== "drawn" || n.top || (n.layered ? (t.push(n), n.context || P(n, t)) : P(n, t));
}
var F = 1024, I = 1e-4, ee = 0xe8d4a51000;
function L(e, t) {
	let n = e.length, r = [], i = new Int32Array(n).fill(-1);
	for (let t = 0; t < n; t += 1) {
		let n = e[t]?.order ?? NaN;
		if (!Number.isFinite(n) || Math.abs(n) > ee) continue;
		let a = 0, o = r.length;
		for (; a < o;) {
			let t = a + o >> 1;
			(e[r[t] ?? 0]?.order ?? 0) < n ? a = t + 1 : o = t;
		}
		a > 0 && (i[t] = r[a - 1] ?? -1), r[a] = t;
	}
	let a = new Uint8Array(n);
	for (let e = r.length ? r[r.length - 1] ?? -1 : -1; e >= 0; e = i[e] ?? -1) a[e] = 1;
	let o = (e, n) => {
		e.order !== n && (e.order = n, t(e));
	}, s = (t, n, r, i) => {
		let a = n - t;
		if (a <= 0) return !0;
		let s, c;
		if (!Number.isFinite(r) && !Number.isFinite(i)) s = 0, c = F;
		else if (!Number.isFinite(r)) s = i - F * (a + 1), c = F;
		else if (!Number.isFinite(i)) s = r, c = F;
		else if (c = (i - r) / (a + 1), s = r, c < I) return !1;
		for (let n = 0; n < a; n += 1) {
			let r = e[t + n];
			r && o(r, s + c * (n + 1));
		}
		return !0;
	}, c = !0, l = -1, u = -Infinity;
	for (let t = 0; t < n && c; t += 1) {
		if (!a[t]) continue;
		let n = e[t]?.order ?? 0;
		c = s(l + 1, t, u, n), l = t, u = n;
	}
	if (c &&= s(l + 1, n, u, Infinity), !c) for (let t = 0; t < n; t += 1) {
		let n = e[t];
		n && o(n, (t + 1) * F);
	}
}
// src/capture/ledger.ts
var te = class {
	store;
	live = /* @__PURE__ */ new Map();
	sent = /* @__PURE__ */ new Map();
	touched = /* @__PURE__ */ new Map();
	retired = /* @__PURE__ */ new Set();
	released = [];
	structural = !1;
	upserts = /* @__PURE__ */ new Map();
	removes = /* @__PURE__ */ new Set();
	constructor(e) {
		this.store = e;
	}
	adopt(e) {
		let t = this.touched.get(e.key) ?? this.live.get(e.key);
		t && !Number.isFinite(e.order) && (e.order = t.order), this.touched.set(e.key, e), e.kind === "bitmap" && this.store.acquire(e.res), this.structural = !0;
	}
	retire(e) {
		this.touched.get(e.key) === e && this.touched.delete(e.key), this.retired.add(e.key), e.kind === "bitmap" && this.released.push(e.res), this.structural = !0;
	}
	touch(e) {
		this.touched.set(e.key, e);
	}
	get pending() {
		return this.touched.size > 0 || this.retired.size > 0 || this.upserts.size > 0 || this.removes.size > 0;
	}
	commit(e) {
		this.structural && e && L(A(e), (e) => this.touched.set(e.key, e));
		for (let e of this.retired) !this.touched.has(e) && this.live.has(e) && (this.live.delete(e), this.upserts.delete(e), this.sent.delete(e) && this.removes.add(e));
		for (let e of this.touched.values()) this.live.set(e.key, e), this.emit(e);
		for (let e of this.released) this.store.release(e);
		this.touched = /* @__PURE__ */ new Map(), this.retired = /* @__PURE__ */ new Set(), this.released = [], this.structural = !1;
	}
	ready(e) {
		let t = [...e.waiting];
		e.waiting.clear();
		for (let n of t) {
			let t = this.live.get(n);
			t && t.kind === "bitmap" && t.res === e && this.emit(t);
		}
	}
	emit(e) {
		if (!Number.isFinite(e.order)) return;
		if (e.kind === "bitmap" && e.res.state !== "ready") {
			e.res.state === "pending" && e.res.waiting.add(e.key);
			return;
		}
		let t = R(e), n = this.sent.get(e.key);
		n && B(n, t) || (this.sent.set(e.key, t), this.upserts.set(e.key, t), this.removes.delete(e.key));
	}
	take() {
		let e = [...this.upserts.values()], t = [...this.removes];
		return this.upserts = /* @__PURE__ */ new Map(), this.removes = /* @__PURE__ */ new Set(), {
			upsert: e,
			remove: t
		};
	}
	clearSent() {
		this.sent.clear(), this.upserts.clear(), this.removes.clear();
	}
};
function R(e) {
	let t = {
		key: e.key,
		owner: e.owner,
		order: e.order,
		scroller: e.scroller,
		clip: e.clip,
		opacity: e.opacity,
		rect: e.rect,
		radii: e.radii
	};
	return e.kind === "box" ? {
		kind: "box",
		...t,
		fill: e.fill,
		border: e.border,
		borderColor: e.borderColor,
		shadows: e.shadows
	} : {
		kind: "bitmap",
		...t,
		bitmap: e.res.bitmap,
		source: e.source
	};
}
var z = (e, t) => Math.abs(e - t) < .001;
function B(e, t) {
	return e.kind !== t.kind || e.owner !== t.owner || e.order !== t.order || e.scroller !== t.scroller || e.clip !== t.clip || !z(e.opacity, t.opacity) || !z(e.rect.x, t.rect.x) || !z(e.rect.y, t.rect.y) || !z(e.rect.width, t.rect.width) || !z(e.rect.height, t.rect.height) || e.radii.some((e, n) => !z(e, t.radii[n] ?? 0)) ? !1 : e.kind === "bitmap" && t.kind === "bitmap" ? e.bitmap === t.bitmap && z(e.source.x, t.source.x) && z(e.source.y, t.source.y) && z(e.source.width, t.source.width) && z(e.source.height, t.source.height) : e.kind === "box" && t.kind === "box" && e.fill.every((e, n) => e === t.fill[n]) && e.borderColor.every((e, n) => e === t.borderColor[n]) && e.border.every((e, n) => z(e, t.border[n] ?? 0)) && e.shadows.length === t.shadows.length && e.shadows.every((e, n) => {
		let r = t.shadows[n];
		return !!r && e.x === r.x && e.y === r.y && e.blur === r.blur && e.spread === r.spread && e.color.every((e, t) => e === r.color[t]);
	});
}
// src/capture/media.ts
var V = /* @__PURE__ */ new Map(), H, U = (e) => {
	if (e.startsWith("data:") || e.startsWith("blob:")) return !0;
	try {
		return new URL(e, location.href).origin === location.origin;
	} catch {
		return !1;
	}
};
function W(e, t) {
	if (U(t)) return !0;
	let n = V.get(t);
	if (n !== void 0) return n;
	H ??= new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: !0 });
	let r = !1;
	if (H) try {
		H.clearRect(0, 0, 1, 1), H.drawImage(e, 0, 0, 1, 1, 0, 0, 1, 1), H.getImageData(0, 0, 1, 1), r = !0;
	} catch {
		r = !1;
	}
	return V.size > 2048 && V.clear(), V.set(t, r), r;
}
function G(e) {
	if (e.srcObject) return !0;
	let t = e.currentSrc || e.src;
	return t ? U(t) || e.crossOrigin !== null : !1;
}
var ne = /* @__PURE__ */ new WeakMap(), re = 2e3;
function ie(e) {
	let t = ne.get(e);
	if (t === -1) return !1;
	let n = performance.now();
	if (t !== void 0 && n - t < re) return !0;
	let r = !0;
	try {
		let t = e.getContext("2d");
		t && e.width > 0 && e.height > 0 && t.getImageData(0, 0, 1, 1);
	} catch (e) {
		r = !(e instanceof DOMException && e.name === "SecurityError");
	}
	return ne.set(e, r ? n : -1), r;
}
function ae(e, t, n) {
	if (!e) return t / 2;
	switch (e) {
		case "left":
		case "top": return 0;
		case "right":
		case "bottom": return t;
		case "center": return t / 2;
	}
	let r = /^calc\(\s*(-?[\d.]+)%\s*([+-])\s*(-?[\d.]+)px\s*\)$/.exec(e);
	if (r) {
		let e = Number(r[3]) * n;
		return Number(r[1]) / 100 * t + (r[2] === "-" ? -e : e);
	}
	return e.endsWith("%") ? Number.parseFloat(e) / 100 * t : (f(e, t) ?? t / 2) * (e.endsWith("px") ? n : 1);
}
function K(e, t, n, r, i) {
	let a = r.width, o = r.height;
	if (!(a > 0 && o > 0 && n.width > 0 && n.height > 0)) return null;
	let s = n.width, c = n.height, l = Math.min(n.width / a, n.height / o), u = Math.max(n.width / a, n.height / o);
	switch (e) {
		case "contain":
			s = a * l, c = o * l;
			break;
		case "cover":
			s = a * u, c = o * u;
			break;
		case "none":
			s = a * i, c = o * i;
			break;
		case "scale-down": {
			let e = Math.min(l, i);
			s = a * e, c = o * e;
			break;
		}
	}
	let [f = "50%", p = "50%"] = d(t, " "), m = n.x + ae(f, n.width - s, i), h = n.y + ae(p, n.height - c, i), g = Math.max(n.x, m), _ = Math.max(n.y, h), v = Math.min(n.x + n.width, m + s), y = Math.min(n.y + n.height, h + c);
	if (v <= g || y <= _) return null;
	let b = a / s, x = o / c;
	return {
		dest: {
			x: g,
			y: _,
			width: v - g,
			height: y - _
		},
		source: {
			x: (g - m) * b,
			y: (_ - h) * x,
			width: (v - g) * b,
			height: (y - _) * x
		},
		object: {
			width: s,
			height: c
		}
	};
}
var oe = 4096;
function q(e, t, n, r) {
	let i = Math.max(1, t.width * n), a = r ? i / e.width : Math.min(1, i / e.width);
	return a = Math.min(a, oe / e.width, oe / e.height), {
		width: Math.max(1, Math.round(e.width * a)),
		height: Math.max(1, Math.round(e.height * a))
	};
}
var se = (e) => /\.svgz?(\?|#|$)/i.test(e) || e.startsWith("data:image/svg");
function ce(e, t) {
	let n = se(e.currentSrc || e.src);
	return e.naturalWidth > 0 && e.naturalHeight > 0 ? {
		width: e.naturalWidth,
		height: e.naturalHeight,
		vector: n
	} : {
		width: Math.max(1, t.width),
		height: Math.max(1, t.height),
		vector: !0
	};
}
async function J(e, t, n) {
	try {
		return await createImageBitmap(e, {
			resizeWidth: t,
			resizeHeight: n,
			resizeQuality: "high",
			premultiplyAlpha: "premultiply"
		});
	} catch {
		try {
			let r = new OffscreenCanvas(t, n), a = r.getContext("2d");
			return a ? (a.drawImage(e, 0, 0, t, n), i(r)) : null;
		} catch {
			return null;
		}
	}
}
var le = /* @__PURE__ */ new Map();
function ue(e, t, n) {
	let r = le.get(e);
	if (!r) {
		let t = new Image();
		U(e) || (t.crossOrigin = "anonymous"), t.decoding = "async";
		let i = {
			image: t,
			state: "loading",
			waiting: /* @__PURE__ */ new Set()
		};
		r = i, le.set(e, i), t.src = e, t.decode().then(() => {
			i.state = "ready";
			for (let e of i.waiting) n(e);
			i.waiting.clear();
		}, () => {
			i.state = "failed", i.waiting.clear();
		});
	}
	return r.state === "ready" ? r.image : (r.state === "loading" && r.waiting.add(t), null);
}
// src/capture/sources.ts
var de = class {
	store;
	onFrame;
	invalidate;
	bindings = /* @__PURE__ */ new Map();
	next = 1;
	constructor(e, t, n) {
		this.store = e, this.onFrame = t, this.invalidate = n;
	}
	resourceOf(e, t) {
		let n = this.bindings.get(e);
		return n ? (t && (n.size = t), n.resource) : null;
	}
	add(e) {
		let t = this.bindings.get(e);
		if (t) return () => this.remove(e, t);
		let n = this.store.owned(`source|${this.next++}`), r = !1, i = [], a = {
			element: e,
			resource: n,
			size: null,
			busy: !1,
			stop: () => {
				r = !0;
				for (let e of i) e();
			}
		};
		this.bindings.set(e, a);
		let o = () => {
			if (r || a.busy || n.state === "ready" && n.refs === 0) return;
			let t = e instanceof HTMLVideoElement ? e : null, i = t ? {
				width: t.videoWidth,
				height: t.videoHeight
			} : {
				width: e.width,
				height: e.height
			};
			if (!(i.width > 0 && i.height > 0) || (t ? !G(t) || t.readyState < 2 : !ie(e))) return;
			let o = a.size ?? i;
			a.busy = !0, J(e, o.width, o.height).then((t) => {
				if (a.busy = !1, !t) return;
				if (r) {
					t.close();
					return;
				}
				let i = n.state === "ready" && (n.width !== t.width || n.height !== t.height), o = n.state !== "ready";
				this.store.replace(n, t), (i || o) && this.invalidate(e), this.onFrame();
			}, () => {
				a.busy = !1;
			});
		};
		if (e instanceof HTMLVideoElement) {
			if (typeof e.requestVideoFrameCallback == "function") {
				let t = 0, n = () => {
					r || (t = e.requestVideoFrameCallback(n), o());
				};
				t = e.requestVideoFrameCallback(n), i.push(() => e.cancelVideoFrameCallback(t));
			} else {
				let t = 0, n = () => {
					t = 0, r || e.paused || e.ended || (o(), t = requestAnimationFrame(n));
				}, a = () => {
					t ||= requestAnimationFrame(n);
				};
				e.addEventListener("play", a), i.push(() => {
					e.removeEventListener("play", a), cancelAnimationFrame(t);
				}), a();
			}
			let t = () => o();
			e.addEventListener("seeked", t), e.addEventListener("loadeddata", t), i.push(() => {
				e.removeEventListener("seeked", t), e.removeEventListener("loadeddata", t);
			});
		} else {
			let t = 0, n = !0, a = () => {
				t = 0, !r && n && (o(), t = requestAnimationFrame(a));
			}, s = new IntersectionObserver((e) => {
				n = e.some((e) => e.isIntersecting), n && !t && (t = requestAnimationFrame(a));
			});
			s.observe(e), i.push(() => {
				s.disconnect(), cancelAnimationFrame(t);
			}), t = requestAnimationFrame(a);
		}
		return o(), this.invalidate(e), () => this.remove(e, a);
	}
	remove(e, t) {
		this.bindings.get(e) === t && (t.stop(), this.bindings.delete(e), this.store.drop(t.resource), this.invalidate(e));
	}
	dispose() {
		for (let e of this.bindings.values()) e.stop();
		this.bindings.clear();
	}
}, fe = /* @__PURE__ */ "fill.fill-opacity.fill-rule.stroke.stroke-width.stroke-opacity.stroke-linecap.stroke-linejoin.stroke-dasharray.stroke-dashoffset.stroke-miterlimit.opacity.color.stop-color.stop-opacity.flood-color.flood-opacity.clip-rule.paint-order.vector-effect.visibility.font-family.font-size.font-weight.font-style.text-anchor.dominant-baseline.letter-spacing".split("."), pe = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), he = null;
function ge(e) {
	pe.set(e, (pe.get(e) ?? 0) + 1);
}
var _e = /url\(\s*["']?#([^"')\s]+)["']?\s*\)/g;
function ve(e, t, n, r) {
	let i = [
		pe.get(e) ?? 0,
		t.color,
		t.fill,
		t.stroke,
		t.strokeWidth,
		t.opacity,
		Math.round(n * 100),
		Math.round(r * 100)
	].join("|"), a = me.get(e);
	if (a && a.signature === i) return a.markup;
	let o = e.cloneNode(!0), s = [e, ...e.querySelectorAll("*")], c = [o, ...o.querySelectorAll("*")];
	for (let e = 0; e < s.length; e += 1) {
		let n = s[e], r = c[e];
		if (!n || !r || !(r instanceof SVGElement)) continue;
		let i = e === 0 ? t : getComputedStyle(n);
		if (i.display === "none") {
			r.setAttribute("display", "none");
			continue;
		}
		let a = e === 0 ? "" : n.getAttribute("style") ?? "";
		a && !a.trimEnd().endsWith(";") && (a += ";");
		for (let e of fe) {
			let t = i.getPropertyValue(e);
			t && (a += `${e}:${t};`);
		}
		e > 0 && !n.hasAttribute("transform") && i.transform !== "none" && (a += `transform:${i.transform};transform-origin:${i.transformOrigin};transform-box:${i.transformBox};`), r.setAttribute("style", a);
	}
	o.setAttribute("xmlns", "http://www.w3.org/2000/svg"), o.setAttribute("width", `${n}`), o.setAttribute("height", `${r}`), o.removeAttribute("class");
	let l = /* @__PURE__ */ new Set();
	for (let e of o.querySelectorAll("use")) {
		let t = e.getAttribute("href") ?? e.getAttribute("xlink:href") ?? "";
		t.startsWith("#") && l.add(t.slice(1));
	}
	let u = o.outerHTML;
	for (let e of u.matchAll(_e)) e[1] && l.add(e[1]);
	let d = [];
	for (let t of l) {
		if (o.querySelector(`#${CSS.escape(t)}`)) continue;
		let n = e.ownerDocument.getElementById(t);
		n && n !== e && !n.contains(e) && d.push(n.cloneNode(!0));
	}
	if (d.length) {
		let t = e.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs");
		for (let e of d) t.appendChild(e);
		o.insertBefore(t, o.firstChild);
	}
	he ??= new XMLSerializer();
	let f = he.serializeToString(o);
	return me.set(e, {
		signature: i,
		markup: f
	}), f;
}
async function ye(e, t, n) {
	let r = new Image();
	r.decoding = "async", r.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`;
	try {
		await r.decode();
	} catch {
		return null;
	}
	let a = new OffscreenCanvas(t, n), o = a.getContext("2d");
	return o ? (o.drawImage(r, 0, 0, t, n), i(a)) : null;
}
// src/capture/text.ts
var be = {
	"50%": "ultra-condensed",
	"62.5%": "extra-condensed",
	"75%": "condensed",
	"87.5%": "semi-condensed",
	"100%": "normal",
	"112.5%": "semi-expanded",
	"125%": "expanded",
	"150%": "extra-expanded",
	"200%": "ultra-expanded"
};
function xe(t, n) {
	let r = t.webkitTextFillColor || t.color, i = e(r);
	if (!i || i[3] <= 0) return null;
	let a = u(t.fontSize);
	if (!(a > 0)) return null;
	let o = t.fontStyle.startsWith("oblique") ? "oblique" : t.fontStyle, s = t.fontVariantCaps || "normal", c = be[t.fontStretch] ?? (t.fontStretch.endsWith("%") ? "normal" : t.fontStretch || "normal"), l = t.fontWeight, d = `${o} ${s === "small-caps" ? "small-caps " : ""}${l} ${a}px ${t.fontFamily}`, f = t.letterSpacing === "normal" ? 0 : u(t.letterSpacing), p = t.wordSpacing === "normal" ? 0 : u(t.wordSpacing), m = t.textAlign, h = m === "justify", g = t.whiteSpace, _ = t.textTransform, v = t.direction === "rtl" ? "rtl" : "ltr", b = t.fontKerning || "auto", x = y(t.textShadow), S = Number.parseFloat(t.tabSize) || 8, C = n.map((e) => `${e.underline ? "u" : ""}${e.overline ? "o" : ""}${e.lineThrough ? "s" : ""}${e.color}/${e.thickness}/${e.offset}`).join(";");
	return {
		font: d,
		size: a,
		color: r,
		direction: v,
		letterSpacing: f,
		wordSpacing: p,
		justify: h,
		align: m,
		whiteSpace: g,
		transform: _,
		stretch: c,
		caps: s,
		kerning: b,
		shadows: x,
		decorations: n,
		tabSize: S,
		key: [
			d,
			r,
			v,
			f,
			p,
			c,
			s,
			b,
			x.map((e) => e.join(" ")).join(","),
			C
		].join("|")
	};
}
var Se = null, Ce = "";
function we() {
	return Se ||= new OffscreenCanvas(1, 1).getContext("2d"), Se;
}
function Te(e, t) {
	e.font = t.font, e.fontKerning = t.kerning === "none" ? "none" : t.kerning === "normal" ? "normal" : "auto", t.stretch !== "normal" && (e.fontStretch = t.stretch), t.caps !== "normal" && t.caps !== "small-caps" && (e.fontVariantCaps = t.caps), e.letterSpacing = `${t.letterSpacing}px`, e.wordSpacing = `${t.wordSpacing}px`;
}
var Ee = () => {
	let e = we();
	return !!e && "letterSpacing" in e && "wordSpacing" in e;
}, De = null, Oe = () => De ??= Ee(), ke = /* @__PURE__ */ new Map();
function Ae(e) {
	let t = ke.get(e.font);
	if (t) return t;
	let n = we(), r = {
		ascent: e.size * .8,
		descent: e.size * .2,
		xHeight: e.size * .5
	};
	if (n) {
		n.font = e.font, Ce = "";
		let t = n.measureText("Hxg"), i = n.measureText("x"), a = t.fontBoundingBoxAscent, o = t.fontBoundingBoxDescent;
		r = {
			ascent: Number.isFinite(a) && a > 0 ? a : t.actualBoundingBoxAscent || e.size * .8,
			descent: Number.isFinite(o) && o >= 0 ? o : t.actualBoundingBoxDescent || e.size * .2,
			xHeight: i.actualBoundingBoxAscent || e.size * .5
		};
	}
	return ke.size > 512 && ke.clear(), ke.set(e.font, r), r;
}
function Y(e, t) {
	let n = we();
	if (!n) return e.length * t.size * .5;
	Ce !== t.key && (Te(n, t), Ce = t.key);
	let r = n.measureText(e).width;
	return Oe() ? r : r + t.letterSpacing * [...e].length;
}
function je() {
	ke.clear(), Ce = "";
}
function Me(e) {
	let t = [], n = null;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r];
		!i || i.width <= 0 || i.height <= 0 || (n && Math.min(n.bottom, i.bottom) - Math.max(n.top, i.top) > Math.min(n.bottom - n.top, i.height) * .5 ? (n.left = Math.min(n.left, i.left), n.right = Math.max(n.right, i.right), n.top = Math.min(n.top, i.top), n.bottom = Math.max(n.bottom, i.bottom)) : (n = {
			left: i.left,
			right: i.right,
			top: i.top,
			bottom: i.bottom
		}, t.push(n)));
	}
	return t;
}
var Ne = /\s/, Pe = /\S/gu;
function Fe(e, t, n, r, i) {
	let a = t.data, o = n.length, s = Array(o + 1).fill(-1);
	if (s[0] = 0, s[o] = a.length, o <= 1) return s;
	let c = i === "pre" ? Ie(a, n.length) : null;
	if (c) return c;
	let l = [];
	for (let e of a.matchAll(Pe)) l.push(e.index);
	let u = l.length, d = /* @__PURE__ */ new Map(), f = (e) => {
		let t = 0, r = o - 1;
		for (; t < r;) {
			let i = t + r + 1 >> 1;
			(n[i]?.top ?? 0) <= e ? t = i : r = i - 1;
		}
		return t;
	}, p = (n) => {
		let r = d.get(n);
		if (r !== void 0) return r;
		let i = l[n] ?? a.length, o = a.codePointAt(i) ?? 0;
		e.setStart(t, i), e.setEnd(t, Math.min(a.length, i + (o > 65535 ? 2 : 1)));
		let s = e.getClientRects(), c = -1;
		for (let e = 0; e < s.length; e += 1) {
			let t = s[e];
			if (t && t.height > 0) {
				c = f((t.top + t.bottom) / 2);
				break;
			}
		}
		return d.set(n, c), c;
	}, m = (e, t, n) => {
		let r = t, i = u;
		if (r >= u) return u;
		let a = Math.min(u - 1, Math.max(r, n));
		if (p(a) >= e) {
			i = a;
			for (let t = 1;; t *= 2) {
				let n = a - t;
				if (n < r) break;
				if (p(n) < e) {
					r = n + 1;
					break;
				}
				i = n, a = n;
			}
		} else {
			r = a + 1;
			for (let t = 1;; t *= 2) {
				let n = a + t;
				if (n >= u) break;
				if (p(n) >= e) {
					i = n;
					break;
				}
				r = n + 1, a = n;
			}
		}
		for (; r < i;) {
			let t = r + i >> 1;
			p(t) >= e ? i = t : r = t + 1;
		}
		return r;
	}, h = u / o, g = /* @__PURE__ */ new Set();
	for (let e of r) e > 0 && g.add(e), e + 1 < o && g.add(e + 1);
	let _ = [...g].sort((e, t) => e - t), v = 0, y = 0;
	for (let e of _) {
		let t = v + Math.round(h * (e - y)), n = m(e, v, t);
		s[e] = n < u ? l[n] ?? a.length : a.length, v = n, y = e;
	}
	return s;
}
function Ie(e, t) {
	if (!e.includes("\n")) return null;
	let n = [], r = 0;
	for (let t of e.split("\n")) t.length > 0 && n.push(r), r += t.length + 1;
	return n.length === t ? (n.push(e.length), n) : null;
}
function Le(e, t, n) {
	e.setStart(t, n), e.setEnd(t, n + 1);
	let r = e.getClientRects();
	for (let e = 0; e < r.length; e += 1) if ((r[e]?.width ?? 0) > .5) return !0;
	return !1;
}
var Re = /[\t\n\r\f ]+/g;
function ze(e, t, n, r) {
	let i = e, a = t.whiteSpace;
	if (a === "pre" || a === "pre-wrap" || a === "break-spaces" ? (i = i.replace(/\r?\n/g, ""), i.includes("	") && (i = Be(i, t.tabSize))) : (i = i.replace(Re, " "), !n && i.startsWith(" ") && (i = i.slice(1))), i = i.replace(/\s+$/u, ""), i.includes("­")) {
		let e = !r && i.endsWith("­");
		i = i.replaceAll("­", "") + (e ? "-" : "");
	}
	return tt(i, t.transform);
}
function Be(e, t) {
	let n = "", r = 0;
	for (let i of e) if (i === "	") {
		let e = t - r % t;
		n += " ".repeat(e), r += e;
	} else n += i, r += 1;
	return n;
}
function Ve(e, t, n) {
	if (Y(e, t) <= n + .5) return e;
	let r = [...e], i = 0, a = r.length;
	for (; i < a;) {
		let e = i + a + 1 >> 1;
		Y(`${r.slice(0, e).join("")}…`, t) <= n + .5 ? i = e : a = e - 1;
	}
	return `${r.slice(0, i).join("")}…`;
}
var He = (e) => {
	for (let t = 0; t < e.length; t += 1) if (!Ne.test(e[t] ?? "")) return !0;
	return !1;
};
function Ue(e, t) {
	return t * (Math.abs(e - 1) < .01 ? 1 : Math.min(4, Math.max(.125, Math.round(e * 8) / 8)));
}
var We = (e, t) => {
	let n = e * t;
	return Math.round((n - Math.floor(n)) * 4) / 4;
};
function Ge(e) {
	let t = Ue(e.zoom, e.dpr), n = Math.round(e.box.width / e.zoom * 4), r = Math.round(e.box.height / e.zoom * 4), i = Math.abs(e.zoom - 1) < .01 ? We(e.box.x, e.dpr) : 0;
	return `t|${e.text}|${e.style.key}|${t}|${n}x${r}|${i}|${+!!e.fill}`;
}
var X = null, Ke = null, qe = 8192;
function Je(e) {
	let { style: t, zoom: n } = e, r = Ue(n, e.dpr), a = e.box.width / n, o = e.box.height / n, s = Ae(t), c = o * (s.ascent / (s.ascent + s.descent || 1)), l = 0, u = 0, d = 0, f = 0;
	for (let [e, n, r] of t.shadows) l = Math.max(l, r - e), u = Math.max(u, r + e), d = Math.max(d, r - n), f = Math.max(f, r + n);
	let p = t.size * .35, m = t.size * .3 + d, h = t.size * .4 + f;
	(a + p * 2 + l + u) * r > qe && (r = qe / (a + p * 2 + l + u));
	let g = Math.ceil((p + l) * r), _ = Math.ceil(m * r), v = Math.abs(n - 1) < .01 ? We(e.box.x, e.dpr) : 0, y = Math.max(1, g + Math.ceil(a * r + v) + Math.ceil((p + u) * r)), b = _ + Math.round(c * r), x = Math.max(1, b + Math.ceil((o - c + h) * r));
	if (x > qe) return null;
	X ? (X.width = y, X.height = x) : (X = new OffscreenCanvas(y, x), Ke = X.getContext("2d"));
	let S = Ke;
	if (!X || !S) return null;
	S.setTransform(r, 0, 0, r, 0, 0), Te(S, t), S.textBaseline = "alphabetic", S.direction = t.direction, S.textAlign = "start", S.fillStyle = t.color;
	let C = (g + v) / r, w = b / r, T = t.direction === "rtl", E = T ? C + a : C, D = e.text, O = 0;
	if (e.fill && D.includes(" ")) {
		let e = Y(D, t), n = D.split(" ").length - 1;
		a - e > .5 && n > 0 && (O = (a - e) / n);
	}
	let k = (e) => {
		O > 0 && !Oe() ? Ze(S, D, t, E + e, w, O, T) : (O > 0 && (S.wordSpacing = `${t.wordSpacing + O}px`), t.letterSpacing !== 0 && !Oe() && !T ? $e(S, D, t, E + e, w) : S.fillText(D, E + e, w));
	};
	if (t.shadows.length) {
		for (let e = t.shadows.length - 1; e >= 0; --e) {
			let n = t.shadows[e];
			n && (S.shadowColor = n[3], S.shadowBlur = n[2] * r, S.shadowOffsetX = (n[0] + 4096) * r, S.shadowOffsetY = n[1] * r, k(-4096));
		}
		S.shadowColor = "transparent", S.shadowBlur = 0, S.shadowOffsetX = 0, S.shadowOffsetY = 0;
	}
	k(0), D = "";
	for (let e of t.decorations) {
		S.fillStyle = e.color;
		let n = e.thickness > 0 ? e.thickness : Math.max(1 / r, t.size / 14), i = C;
		if (e.underline) {
			let o = w + Math.max(1 / r, t.size * .09) + e.offset;
			S.fillRect(i, Ye(o, r), a, Xe(n, r));
		}
		e.overline && S.fillRect(i, Ye(w - s.ascent, r), a, Xe(n, r)), e.lineThrough && S.fillRect(i, Ye(w - s.xHeight / 2 - n / 2, r), a, Xe(n, r));
	}
	return {
		image: i(X),
		meta: {
			left: C,
			baseline: b,
			ascent: c,
			scale: r
		}
	};
}
var Ye = (e, t) => Math.round(e * t) / t, Xe = (e, t) => Math.max(1, Math.round(e * t)) / t;
function Ze(e, t, n, r, i, a, o) {
	let s = t.split(" "), c = Y(" ", n) + a, l = r;
	for (let t of s) {
		t && e.fillText(t, l, i);
		let r = Y(t, n) + c;
		l += o ? -r : r;
	}
}
var Qe = typeof Intl < "u" && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
function $e(e, t, n, r, i) {
	let a = Qe ? Array.from(Qe.segment(t), (e) => e.segment) : [...t], o = r;
	for (let t of a) e.fillText(t, o, i), o += Y(t, n);
}
function et(e, t, n, r, i) {
	let a = t / r.scale, o = e.x - r.left * t, s = e.y + r.ascent * t - r.baseline * a;
	return Math.abs(t - 1) < .01 && (o = Math.round(o * n) / n, s = Math.round((e.y + r.ascent) * n) / n - r.baseline / r.scale), {
		x: o,
		y: s,
		width: i.width * a,
		height: i.height * a
	};
}
function tt(e, t) {
	switch (t) {
		case "uppercase": return e.toUpperCase();
		case "lowercase": return e.toLowerCase();
		case "capitalize": return e.replace(/(^|[\s\p{P}])(\p{Ll})/gu, (e, t, n) => t + n.toUpperCase());
		default: return e;
	}
}
// src/capture/paint.ts
var nt = /^url\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^)]*))\s*\)$/, rt = /^(repeating-)?(linear|radial|conic)-gradient\(/, it = 4194304, Z = (e, t) => e[t] ?? e[t % Math.max(1, e.length)] ?? "";
function at(e, t, n, r, a, o, s, c, l) {
	let f = d(n, ",");
	if (!f.length || !(r > 0 && a > 0)) return null;
	let p = d(t.backgroundSize, ","), m = d(t.backgroundPositionX, ","), h = d(t.backgroundPositionY, ","), g = d(t.backgroundRepeat, ","), _ = d(t.backgroundOrigin, ","), v = d(t.backgroundClip, ","), y = [], b = "";
	for (let t = 0; t < f.length; t += 1) {
		let n = f[t] ?? "none", r = Z(v, t) || "border-box";
		if (n === "none" || r === "text") continue;
		let i = null, a = null, o = nt.exec(n);
		if (o) {
			if (i = (o[1] ?? o[2] ?? o[3] ?? "").replace(/\\(.)/g, "$1").trim(), !i || (a = ue(i, e, l), !a)) continue;
			b += `${a.naturalWidth}x${a.naturalHeight};`;
		} else if (!rt.test(n)) continue;
		y.push({
			text: n,
			url: i,
			image: a,
			size: Z(p, t) || "auto",
			x: Z(m, t) || "0%",
			y: Z(h, t) || "0%",
			repeat: Z(g, t) || "repeat",
			origin: Z(_, t) || "padding-box",
			clip: r
		});
	}
	if (!y.length) return null;
	let x = r / s, S = a / s, C = o.map((e) => e / s), w = [
		u(t.paddingTop),
		u(t.paddingRight),
		u(t.paddingBottom),
		u(t.paddingLeft)
	], T = c * s;
	x * S * T * T > it && (T = Math.sqrt(it / (x * S))), T = Math.min(T, 4096 / x, 4096 / S);
	let E = [
		"bg",
		n,
		b,
		t.backgroundSize,
		t.backgroundPositionX,
		t.backgroundPositionY,
		t.backgroundRepeat,
		t.backgroundOrigin,
		t.backgroundClip,
		Math.round(x * 4),
		Math.round(S * 4),
		C.join(","),
		w.join(","),
		T.toFixed(3)
	].join("|"), D = (e) => {
		if (e === "border-box") return {
			x: 0,
			y: 0,
			width: x,
			height: S
		};
		let t = e === "content-box" ? [
			C[0] + w[0],
			C[1] + w[1],
			C[2] + w[2],
			C[3] + w[3]
		] : C;
		return {
			x: t[3] ?? 0,
			y: t[0] ?? 0,
			width: Math.max(0, x - (t[1] ?? 0) - (t[3] ?? 0)),
			height: Math.max(0, S - (t[0] ?? 0) - (t[2] ?? 0))
		};
	};
	return {
		key: E,
		draw: () => {
			let e = new OffscreenCanvas(Math.max(1, Math.ceil(x * T)), Math.max(1, Math.ceil(S * T))), t = e.getContext("2d");
			if (!t) return null;
			t.scale(T, T);
			for (let e = y.length - 1; e >= 0; --e) {
				let n = y[e];
				n && ct(t, n, D(n.origin), D(n.clip), T);
			}
			return i(e);
		}
	};
}
function ot(e, t) {
	let n = e.split(" ");
	if (n.length === 2) {
		let e = f(n[1] ?? "", t) ?? 0;
		return n[0] === "right" || n[0] === "bottom" ? t - e : e;
	}
	switch (e) {
		case "left":
		case "top": return 0;
		case "right":
		case "bottom": return t;
		case "center": return t / 2;
	}
	let r = /^calc\(\s*(-?[\d.]+)%\s*([+-])\s*(-?[\d.]+)px\s*\)$/.exec(e);
	return r ? Number(r[1]) / 100 * t + (r[2] === "-" ? -1 : 1) * Number(r[3]) : f(e, t) ?? 0;
}
function st(e, t, n) {
	if (e === "cover" || e === "contain") {
		if (!n) return {
			width: t.width,
			height: t.height
		};
		let r = e === "cover" ? Math.max(t.width / n.width, t.height / n.height) : Math.min(t.width / n.width, t.height / n.height);
		return {
			width: n.width * r,
			height: n.height * r
		};
	}
	let [r = "auto", i = "auto"] = e.split(" "), a = r === "auto" ? null : f(r, t.width), o = i === "auto" ? null : f(i, t.height);
	return n ? a === null && o === null ? {
		width: n.width,
		height: n.height
	} : (a === null && (a = (o ?? 0) * n.width / n.height), o === null && (o = a * n.height / n.width), {
		width: a,
		height: o
	}) : {
		width: a ?? t.width,
		height: o ?? t.height
	};
}
function ct(e, t, n, r, i) {
	if (r.width <= 0 || r.height <= 0) return;
	let a = t.image ? {
		width: t.image.naturalWidth || 1,
		height: t.image.naturalHeight || 1
	} : null, o = st(t.size, n, a);
	if (!(o.width > 0 && o.height > 0)) return;
	let s = n.x + ot(t.x, n.width - o.width), c = n.y + ot(t.y, n.height - o.height), [l, u] = lt(t.repeat);
	if (e.save(), e.beginPath(), e.rect(r.x, r.y, r.width, r.height), e.clip(), !l && !u) {
		t.image ? e.drawImage(t.image, s, c, o.width, o.height) : (e.translate(s, c), Et(e, t.text, o.width, o.height)), e.restore();
		return;
	}
	let d = t.image, f = a?.width ?? 1, p = a?.height ?? 1;
	if (!d) {
		f = Math.max(1, Math.round(o.width * i)), p = Math.max(1, Math.round(o.height * i));
		let n = new OffscreenCanvas(f, p), r = n.getContext("2d");
		if (!r) {
			e.restore();
			return;
		}
		r.scale(f / o.width, p / o.height), Et(r, t.text, o.width, o.height), d = n;
	}
	let m = e.createPattern(d, l && u ? "repeat" : l ? "repeat-x" : "repeat-y");
	m && (m.setTransform(new DOMMatrix().translateSelf(s, c).scaleSelf(o.width / f, o.height / p)), e.fillStyle = m, e.fillRect(r.x, r.y, r.width, r.height)), e.restore();
}
function lt(e) {
	switch (e) {
		case "no-repeat": return [!1, !1];
		case "repeat-x": return [!0, !1];
		case "repeat-y": return [!1, !0];
	}
	let [t = "repeat", n = t] = e.split(" ");
	return [t !== "no-repeat", n !== "no-repeat"];
}
var ut = /* @__PURE__ */ new Set([
	"to",
	"at",
	"from",
	"in",
	"circle",
	"ellipse",
	"closest-side",
	"closest-corner",
	"farthest-side",
	"farthest-corner"
]), dt = /^-?[\d.]+(?:e-?\d+)?(deg|rad|grad|turn|px|%)?$/i;
function ft(e) {
	let t = /^(-?[\d.]+(?:e-?\d+)?)(deg|rad|grad|turn)?$/i.exec(e);
	if (!t) return null;
	let n = Number(t[1]);
	switch ((t[2] ?? "deg").toLowerCase()) {
		case "rad": return n;
		case "grad": return n * Math.PI / 200;
		case "turn": return n * Math.PI * 2;
		default: return n * Math.PI / 180;
	}
}
function pt(e, t) {
	if (e.endsWith("%")) return Number.parseFloat(e) / 100;
	if (e.endsWith("px")) return t > 0 ? Number.parseFloat(e) / t : 0;
	let n = ft(e);
	if (n !== null && /[a-z]$/i.test(e)) return n / (Math.PI * 2);
	let r = Number.parseFloat(e);
	return Number.isFinite(r) && r === 0 ? 0 : null;
}
function mt(t, n) {
	let r = [];
	for (let i of t) {
		let t = d(i, " "), a = [];
		for (; t.length > 1 && dt.test(t[t.length - 1] ?? "");) a.unshift(t.pop() ?? "");
		if (t.length === 1 && dt.test(t[0] ?? "")) continue;
		let o = e(t.join(" "));
		if (o) {
			a.length || r.push({
				color: o,
				pos: null
			});
			for (let e of a) r.push({
				color: o,
				pos: pt(e, n)
			});
		}
	}
	return r;
}
function ht(e) {
	if (!e.length) return [];
	let t = e[0], n = e[e.length - 1];
	t && t.pos === null && (t.pos = 0), n && n.pos === null && (n.pos = 1);
	let r = -Infinity;
	for (let t of e) t.pos !== null && (t.pos = Math.max(t.pos, r), r = t.pos);
	let i = 0;
	for (let t = 1; t < e.length; t += 1) if (e[t]?.pos !== null) {
		let n = e[i]?.pos ?? 0, r = e[t]?.pos ?? n;
		for (let a = i + 1; a < t; a += 1) {
			let o = e[a];
			o && (o.pos = n + (r - n) * (a - i) / (t - i));
		}
		i = t;
	}
	return e.map((e) => ({
		color: e.color,
		pos: e.pos ?? 0
	}));
}
function gt(e, t, n) {
	let r = e[0]?.pos ?? 0, i = (e[e.length - 1]?.pos ?? 0) - r;
	if (!(i > 1e-6)) return e;
	let a = Math.floor((t - r) / i), o = Math.ceil((n - r) / i), s = [];
	for (let t = a; t <= o && s.length < 2048; t += 1) for (let n of e) s.push({
		color: n.color,
		pos: n.pos + t * i
	});
	return s;
}
var _t = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, vt = (e) => e <= .0031308 ? e * 12.92 : 1.055 * Math.max(0, e) ** (1 / 2.4) - .055;
function yt([e, t, n]) {
	let r = _t(e), i = _t(t), a = _t(n), o = Math.cbrt(.4122214708 * r + .5363325363 * i + .0514459929 * a), s = Math.cbrt(.2119034982 * r + .6806995451 * i + .1073969566 * a), c = Math.cbrt(.0883024619 * r + .2817188376 * i + .6299787005 * a);
	return [
		.2104542553 * o + .793617785 * s - .0040720468 * c,
		1.9779984951 * o - 2.428592205 * s + .4505937099 * c,
		.0259040371 * o + .7827717662 * s - .808675766 * c
	];
}
function bt([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		vt(4.0767416621 * r - 3.3077115913 * i + .2309699292 * a),
		vt(-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a),
		vt(-.0041960863 * r - .7034186147 * i + 1.707614701 * a)
	];
}
function xt(e, t, n, r) {
	let i = e[3] + (t[3] - e[3]) * n;
	if (i <= 0) return [
		0,
		0,
		0,
		0
	];
	if (r) {
		let r = yt(e), a = yt(t), [o, s, c] = bt([
			0,
			1,
			2
		].map((o) => ((r[o] ?? 0) * e[3] + ((a[o] ?? 0) * t[3] - (r[o] ?? 0) * e[3]) * n) / i));
		return [
			o,
			s,
			c,
			i
		];
	}
	let a = (r) => (e[r] * e[3] + (t[r] * t[3] - e[r] * e[3]) * n) / i;
	return [
		a(0),
		a(1),
		a(2),
		i
	];
}
var St = 8, Ct = (e, t) => e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3];
function wt(e, t, r, i, a) {
	let o = i - r || 1, s = (e) => Math.min(1, Math.max(0, (e - r) / o));
	for (let o = 0; o < t.length; o += 1) {
		let c = t[o];
		if (!c) continue;
		e.addColorStop(s(c.pos), n(c.color));
		let l = t[o + 1];
		if (!(!l || l.pos <= c.pos || Ct(c.color, l.color)) && !(c.pos < r && l.pos < r || c.pos > i && l.pos > i)) for (let t = 1; t < St; t += 1) {
			let r = t / St;
			e.addColorStop(s(c.pos + (l.pos - c.pos) * r), n(xt(c.color, l.color, r, a)));
		}
	}
}
function Tt(e) {
	let t = e.indexOf("in");
	if (t < 0) return !1;
	let n = e[t + 1] ?? "", r = t + 2;
	return e[r + 1] === "hue" && (r += 2), e.splice(t, r - t), n === "oklab" || n === "oklch";
}
function Et(e, t, n, r) {
	let i = rt.exec(t);
	if (!i) return;
	let a = !!i[1], o = i[2], s = d(t.slice(i[0].length, t.lastIndexOf(")")), ","), c = d(s[0] ?? "", " "), l = ut.has(c[0] ?? "") || dt.test(c[0] ?? ""), u = l ? c : [], p = l ? s.slice(1) : s, m = Tt(u);
	if (o === "linear") {
		let t = Math.PI;
		if (u[0] === "to") {
			let e = new Set(u.slice(1)), i = e.has("right") ? 1 : e.has("left") ? -1 : 0, a = e.has("bottom") ? 1 : e.has("top") ? -1 : 0;
			t = i && a ? Math.atan2(i * r, -(a * n)) : i > 0 ? Math.PI / 2 : i < 0 ? -Math.PI / 2 : a < 0 ? 0 : Math.PI;
		} else u[0] && (t = ft(u[0]) ?? Math.PI);
		let i = Math.sin(t), o = Math.cos(t), s = Math.abs(n * i) + Math.abs(r * o), c = ht(mt(p, s));
		if (!c.length) return;
		a && (c = gt(c, 0, 1));
		let l = c[0]?.pos ?? 0, d = c[c.length - 1]?.pos ?? 1;
		d - l < 1e-6 && (d = l + 1e-6);
		let f = n / 2, h = r / 2, g = (e) => [f + i * s * (e - .5), h - o * s * (e - .5)], [_, v] = g(l), [y, b] = g(d), x = e.createLinearGradient(_, v, y, b);
		wt(x, c, l, d, m), e.fillStyle = x, e.fillRect(0, 0, n, r);
		return;
	}
	let h = u.indexOf("at"), g = n / 2, _ = r / 2;
	if (h >= 0) {
		let [e = "center", t = "center"] = u.slice(h + 1);
		(e === "top" || e === "bottom" || t === "left" || t === "right") && ([e, t] = [t, e]), g = ot(e, n), _ = ot(t, r);
	}
	let v = h >= 0 ? u.slice(0, h) : u;
	if (o === "conic") {
		let t = v.indexOf("from"), i = t >= 0 ? ft(v[t + 1] ?? "0") ?? 0 : 0, o = ht(mt(p, 1));
		if (!o.length) return;
		a && (o = gt(o, 0, 1));
		let s = e.createConicGradient(i - Math.PI / 2, g, _);
		wt(s, o, 0, 1, m), e.fillStyle = s, e.fillRect(0, 0, n, r);
		return;
	}
	let y = v.includes("circle") || !v.includes("ellipse") && v.filter((e) => dt.test(e)).length === 1, b = v.filter((e) => dt.test(e)), x = v.find((e) => e.startsWith("closest-") || e.startsWith("farthest-")) ?? "farthest-corner", S = [g, n - g].map(Math.abs), C = [_, r - _].map(Math.abs), w = {
		x: Math.min(...S),
		y: Math.min(...C)
	}, T = {
		x: Math.max(...S),
		y: Math.max(...C)
	}, E, D;
	if (b.length) E = f(b[0] ?? "0", n) ?? 0, D = y ? E : f(b[1] ?? b[0] ?? "0", r) ?? E;
	else {
		let e = x.endsWith("side"), t = x.startsWith("closest") ? w : T;
		y ? (E = D = e ? Math.min(t.x, t.y) : Math.hypot(t.x, t.y), e && x.startsWith("farthest") && (E = D = Math.max(t.x, t.y))) : e ? (E = t.x, D = t.y) : (E = t.x * Math.SQRT2, D = t.y * Math.SQRT2);
	}
	E = Math.max(E, .001), D = Math.max(D, .001);
	let O = ht(mt(p, E));
	if (!O.length) return;
	for (let e of O) e.pos = Math.max(0, e.pos);
	if (a) {
		let e = Math.max(...[0, n].flatMap((e) => [0, r].map((t) => Math.hypot((e - g) / E, (t - _) / D))));
		O = gt(O, 0, e);
	}
	let k = O[0]?.pos ?? 0, A = O[O.length - 1]?.pos ?? 1;
	A - k < 1e-6 && (A = k + 1e-6);
	let j = e.createRadialGradient(g, _, k * E, g, _, A * E);
	wt(j, O, k, A, m);
	let M = D / E;
	e.save(), e.translate(0, _), e.scale(1, M), e.translate(0, -_), e.fillStyle = j, e.fillRect(0, _ - _ / M, n, r / M), e.restore();
}
// src/capture/walk.ts
var Dt = /* @__PURE__ */ new Set([
	"SCRIPT",
	"STYLE",
	"LINK",
	"META",
	"TITLE",
	"HEAD",
	"BASE",
	"NOSCRIPT",
	"TEMPLATE",
	"SOURCE",
	"TRACK",
	"PARAM",
	"AREA",
	"MAP",
	"DATALIST",
	"BR",
	"WBR",
	"AUDIO",
	"OPTION",
	"OPTGROUP"
]), Ot = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"hidden",
	"image"
]), kt = /* @__PURE__ */ new Set([
	"button",
	"submit",
	"reset"
]), At = [
	.5,
	.5,
	.5,
	.18
], jt = 1e7, Mt = "data-lg-labels", Nt = 0, Pt = 1, Ft = 2, It = (e) => e === 0 ? Nt : 4 + e * 2, Q = (e) => 3 + e * 2, Lt = (e) => e.nodeType === 1, Rt = (e) => e.nodeType === 3;
function zt(e, t) {
	try {
		return e.matches(t);
	} catch {
		return !1;
	}
}
function Bt(e, t) {
	return e.owner === t.owner && e.flow.scroller === t.flow.scroller && e.flow.clip === t.flow.clip && e.abs.scroller === t.abs.scroller && e.abs.clip === t.abs.clip && e.fixed.scroller === t.fixed.scroller && e.fixed.clip === t.fixed.clip && Math.abs(e.opacity - t.opacity) < 1e-4 && Math.abs(e.zoom - t.zoom) < 1e-4 && e.flexItem === t.flexItem && e.decorations.length === t.decorations.length && e.decorations.every((e, n) => {
		let r = t.decorations[n];
		return !!r && e.underline === r.underline && e.overline === r.overline && e.lineThrough === r.lineThrough && e.color === r.color && e.thickness === r.thickness && e.offset === r.offset;
	}) && (e.ellipsis === t.ellipsis || !!e.ellipsis && !!t.ellipsis && e.ellipsis.left === t.ellipsis.left && e.ellipsis.right === t.ellipsis.right);
}
function Vt() {
	let e = {
		scroller: 0,
		clip: 0
	};
	return {
		owner: 0,
		flow: e,
		abs: e,
		fixed: {
			scroller: 1,
			clip: 0
		},
		opacity: 1,
		zoom: 1,
		decorations: [],
		ellipsis: null,
		flexItem: !1
	};
}
function Ht(e) {
	if (e.shadowRoot) return e.shadowRoot.childNodes;
	if (e instanceof HTMLSlotElement) {
		let t = e.assignedNodes({ flatten: !0 });
		return t.length ? t : e.childNodes;
	}
	return e.childNodes;
}
var Ut = class {
	root;
	frames;
	store;
	ledger;
	host;
	records = /* @__PURE__ */ new Map();
	surfaces = /* @__PURE__ */ new Set();
	labelHosts = /* @__PURE__ */ new Set();
	forms = /* @__PURE__ */ new Set();
	keys = /* @__PURE__ */ new WeakMap();
	nextKey = 1;
	range = document.createRange();
	lifted = [];
	snapshots = /* @__PURE__ */ new WeakMap();
	dpr = 1;
	epoch = 0;
	constructor(e, t, n, r, i) {
		this.root = e, this.frames = t, this.store = n, this.ledger = r, this.host = i;
	}
	begin(e, t) {
		this.dpr = devicePixelRatio || 1, this.frames.begin();
		let n = this.frames.scrollers.get(0), r = this.frames.scrollers.get(1);
		if (n && (t || !n.cull)) {
			let e = this.frames.chain(0), t = innerWidth, r = innerHeight;
			n.cull = E({
				x: e.x,
				y: e.y,
				width: t,
				height: r
			}, t, r);
		}
		r && (t || !r.cull) && (r.cull = E({
			x: 0,
			y: 0,
			width: innerWidth,
			height: innerHeight
		}, innerWidth / 4, innerHeight / 4));
		for (let t of this.labelHosts) t.isConnected ? e.some((e) => t.contains(e) || e.contains(t)) && this.lift(t) : this.labelHosts.delete(t);
	}
	end() {
		for (let e of this.lifted) e.setAttribute(Mt, "");
		this.lifted = [];
	}
	lift(e) {
		e.hasAttribute(Mt) && (e.removeAttribute(Mt), this.lifted.push(e));
	}
	key(e, t) {
		let n = this.keys.get(e);
		n || this.keys.set(e, n = []);
		let r = n[t];
		return r === void 0 && (r = this.nextKey++, n[t] = r), r;
	}
	cullOf(e) {
		return this.frames.scrollers.get(e)?.cull ?? null;
	}
	visible(e, t) {
		let n = this.cullOf(t.scroller);
		if (n && !w(e, n)) return !1;
		if (t.clip && this.frames.clipScroller(t.clip) === t.scroller) {
			let n = this.frames.clipRect(t.clip);
			if (n && !w(e, n)) return !1;
		}
		return !0;
	}
	walk(e, t, n, r) {
		let i = this.records.get(e), a = i ? i.children : [];
		if (i ? (this.retireOwn(i), i.parent = n, i.input = t) : (i = {
			kind: "element",
			el: e,
			parent: n,
			input: t,
			state: "hidden",
			rect: {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			},
			boxScroller: 0,
			drafts: [],
			children: [],
			layered: !1,
			context: !1,
			z: 0,
			top: !1,
			fixed: !1,
			scroller: 0,
			clip: 0,
			value: null
		}, this.records.set(e, i)), i.drafts = [], i.children = [], i.layered = !1, i.context = !1, i.z = 0, i.top = !1, i.fixed = !1, i.scroller = 0, i.clip = 0, i.value = null, this.fill(i, r), a.length) {
			let e = new Set(i.children);
			for (let t of a) e.has(t) || (t.kind !== "element" || t.parent === i) && this.drop(t);
		}
		return i;
	}
	reconcile(e) {
		if (e.state === "hidden") return;
		let t = e.el.getBoundingClientRect(), n = this.frames.normalise(t, e.boxScroller);
		if (e.state === "culled") {
			let t = this.cullOf(e.boxScroller);
			!t || w(n, t) ? this.walk(e.el, e.input, e.parent, !0) : e.rect = n;
		} else C(n, e.rect) || (Math.abs(n.width - e.rect.width) < .01 && Math.abs(n.height - e.rect.height) < .01 ? this.translate(e, n.x - e.rect.x, n.y - e.rect.y) : this.walk(e.el, e.input, e.parent, !1));
	}
	translate(e, t, n) {
		e.rect = D(e.rect, t, n);
		for (let r of e.drafts) this.move(r, t, n);
		if (e.clip && this.frames.shiftClip(e.clip, t, n), e.scroller) {
			let r = this.frames.scrollers.get(e.scroller);
			r?.cull && (r.cull = D(r.cull, t, n));
		}
		for (let r of e.children) if (r.kind === "text") {
			for (let e of r.drafts) this.move(e, t, n);
			r.covered &&= {
				top: r.covered.top + n,
				bottom: r.covered.bottom + n
			};
		} else !r.fixed && !r.top && this.translate(r, t, n);
	}
	move(e, t, n) {
		e.rect = D(e.rect, t, n), this.ledger.touch(e);
	}
	retireOwn(e) {
		for (let t of e.drafts) this.ledger.retire(t);
		e.drafts = [], this.frames.scrollers.get(e.boxScroller)?.sticky.delete(e), this.forms.delete(e);
	}
	drop(e) {
		if (e.kind === "text") {
			for (let t of e.drafts) this.ledger.retire(t);
			e.drafts = [];
		} else {
			this.records.get(e.el) === e && this.records.delete(e.el), this.retireOwn(e);
			for (let t of e.children) (t.kind !== "element" || t.parent === e) && this.drop(t);
			e.children = [], this.surfaces.delete(e.el);
		}
	}
	adopt(e, t) {
		t.drafts.push(e), this.ledger.adopt(e);
	}
	fill(e, t) {
		let n = e.el, r = e.input, i = this.host.surfaceOf(n);
		i?.labelsInGlass && (this.labelHosts.add(n), this.lift(n));
		let a = getComputedStyle(n), o = a.position, s = n.tagName;
		e.top = s === "DIALOG" && zt(n, ":modal") || n.hasAttribute("popover") && zt(n, ":popover-open");
		let c = e.top ? {
			scroller: 1,
			clip: 0
		} : o === "absolute" ? r.abs : o === "fixed" ? r.fixed : r.flow;
		e.boxScroller = c.scroller, e.fixed = o === "fixed" || e.top;
		let l = n.getBoundingClientRect(), d = this.frames.normalise(l, c.scroller);
		e.rect = d;
		let f = a.display;
		if (f === "none") {
			e.state = "hidden";
			return;
		}
		if (l.width > 0 && l.height > 0 && !this.visible(d, c)) {
			e.state = "culled";
			return;
		}
		let p = a.visibility, _ = Number.parseFloat(a.opacity);
		if (p !== "visible" || !(_ > 0)) {
			e.state = "hidden";
			return;
		}
		e.state = "drawn", i && this.surfaces.add(n);
		let v = a.transform, y = a.scale, b = a.rotate, x = a.translate, C = r.zoom * S(v, y, a.zoom), w = o !== "static", T = a.zIndex, O = (w || r.flexItem) && T !== "auto" ? Number.parseInt(T, 10) || 0 : null, k = (e) => !!e && e !== "none", A = v !== "none" || k(y) || k(b) || k(x), j = a.filter, M = a.contain, N = M !== "none" && /paint|strict|content|layout/.test(M);
		e.context = n === this.root || O !== null || o === "fixed" || o === "sticky" || _ < 1 || A || j !== "none" || a.isolation === "isolate" || a.mixBlendMode !== "normal" || N, e.layered = n !== this.root && (w || e.context), e.z = O ?? 0, o === "sticky" && this.frames.scrollers.get(c.scroller)?.sticky.add(e);
		let P = r.opacity * _, F = {
			owner: r.owner,
			scroller: c.scroller,
			clip: c.clip,
			opacity: P
		}, I = [
			u(a.borderTopWidth) * C,
			u(a.borderRightWidth) * C,
			u(a.borderBottomWidth) * C,
			u(a.borderLeftWidth) * C
		], ee = null, L = () => ee ??= m(a, d.width / C, d.height / C, C), te = n === document.documentElement || n === document.body;
		this.box(e, a, d, I, F, f, C, L, te);
		let R = a.backgroundImage;
		R !== "none" && !te && this.background(e, a, R, d, I, F, C, L);
		let z = i ? i.id : r.owner;
		if (f === "list-item" && this.marker(e, a, d, I, {
			...F,
			owner: z
		}, C), this.content(e, a, s, d, I, F, C, L)) return;
		let B = c, V = a.overflowX, H = a.overflowY, U = f === "inline" ? r.ellipsis : null;
		if ((V !== "visible" || H !== "visible") && !te) {
			let t = g(d, I[0], I[1], I[2], I[3]), r = {
				x: V === "visible" ? t.x - jt : t.x,
				y: H === "visible" ? t.y - jt : t.y,
				width: V === "visible" ? t.width + jt * 2 : t.width,
				height: H === "visible" ? t.height + jt * 2 : t.height
			}, i = this.frames.ensureClip(n, c.clip, c.scroller, r, h(L(), I[0], I[1], I[2], I[3]));
			e.clip = i;
			let o = /^(auto|scroll)$/.test(V) || /^(auto|scroll)$/.test(H), s = (V === "hidden" || H === "hidden") && (n.scrollTop !== 0 || n.scrollLeft !== 0 || !!this.frames.scrollerFor(n));
			if (o || s) {
				let r = this.frames.ensureScroller(n, c.scroller, C, i);
				e.scroller = r.id;
				let a = this.frames.chain(c.scroller), o = this.frames.chain(r.id), s = D(t, o.x - a.x, o.y - a.y);
				r.cull = E(s, Math.max(s.width, 256), Math.max(s.height, 256)), B = {
					scroller: r.id,
					clip: i
				}, this.host.watch(n);
			} else if (B = {
				scroller: c.scroller,
				clip: i
			}, a.textOverflow === "ellipsis" && V !== "visible") {
				let e = g(t, u(a.paddingTop) * C, u(a.paddingRight) * C, u(a.paddingBottom) * C, u(a.paddingLeft) * C);
				U = {
					scroller: c.scroller,
					left: e.x,
					right: e.x + e.width
				};
			}
		}
		let W = a.textDecorationLine, G = f.startsWith("inline-") || o === "absolute" || o === "fixed" ? [] : r.decorations;
		if (W && W !== "none") {
			let e = {
				underline: W.includes("underline"),
				overline: W.includes("overline"),
				lineThrough: W.includes("line-through"),
				color: a.textDecorationColor,
				thickness: a.textDecorationThickness.endsWith("px") ? u(a.textDecorationThickness) : 0,
				offset: a.textUnderlineOffset.endsWith("px") ? u(a.textUnderlineOffset) : 0
			};
			G = [...G, e];
		}
		let ne = {
			owner: z,
			flow: B,
			abs: w || e.top ? B : r.abs,
			fixed: A || j !== "none" || N || e.top ? B : r.fixed,
			opacity: P,
			zoom: C,
			decorations: G,
			ellipsis: U,
			flexItem: /flex|grid/.test(f)
		};
		n.shadowRoot && this.host.shadow(n.shadowRoot), this.children(e, a, ne, t);
	}
	children(e, t, n, r) {
		let i = Ht(e.el), a;
		for (let o = 0; o < i.length; o += 1) {
			let s = i[o];
			if (!s) continue;
			if (Rt(s)) {
				if (!He(s.data) || (a === void 0 && (a = xe(t, n.decorations)), !a)) continue;
				e.children.push(this.text(s, a, n));
				continue;
			}
			if (!Lt(s) || Dt.has(s.tagName) || s.hasAttribute("data-lg-ignore") || s.hasAttribute("data-lg-canvas")) continue;
			let c = this.records.get(s);
			!r && c && c.parent === e && Bt(c.input, n) ? (this.reconcile(c), e.children.push(c)) : e.children.push(this.walk(s, n, e, !0));
		}
	}
	box(n, r, i, a, o, s, c, u, d) {
		let f = e(r.backgroundColor) ?? t, p = t, h = [
			"Top",
			"Right",
			"Bottom",
			"Left"
		];
		for (let n = 0; n < 4; n += 1) {
			if ((a[n] ?? 0) <= 0) continue;
			let i = h[n] ?? "Top";
			p = e(r.getPropertyValue(`border-${i.toLowerCase()}-color`)) ?? t;
			break;
		}
		let g = p[3] > 0, _ = d ? [] : v(r.boxShadow, c);
		if (f[3] <= 0 && !g && !_.length) return;
		let y = (e, t, n) => ({
			kind: "box",
			key: e,
			...o,
			order: NaN,
			rect: t,
			radii: n,
			fill: f,
			border: g ? a : [
				0,
				0,
				0,
				0
			],
			borderColor: p,
			shadows: _
		});
		if (d) {
			if (f[3] <= 0) return;
			let e = y(this.key(n.el, Nt), {
				x: 0,
				y: 0,
				width: innerWidth,
				height: innerHeight
			}, l);
			e.scroller = 1, e.clip = 0, e.kind === "box" && (e.border = [
				0,
				0,
				0,
				0
			]), this.adopt(e, n);
		} else {
			if (s === "inline") {
				let e = n.el.getClientRects();
				if (e.length > 1) {
					for (let t = 0; t < e.length; t += 1) {
						let i = e[t];
						if (!i || i.width <= 0 || i.height <= 0) continue;
						let a = this.frames.normalise(i, o.scroller);
						this.adopt(y(this.key(n.el, It(t)), a, m(r, a.width / c, a.height / c, c)), n);
					}
					return;
				}
			}
			i.width <= 0 || i.height <= 0 || this.adopt(y(this.key(n.el, Nt), i, u()), n);
		}
	}
	background(e, t, n, r, i, a, o, s) {
		if (r.width <= 0 || r.height <= 0) return;
		let c = at(e.el, t, n, r.width, r.height, i, o, this.dpr, (e) => this.host.loaded(e));
		if (!c) return;
		let l = this.store.get(c.key);
		if (!l) {
			let e = c.draw();
			if (!e) return;
			l = this.store.putSync(c.key, e);
		}
		this.adopt(this.bitmap(this.key(e.el, Pt), a, r, s(), l), e);
	}
	bitmap(e, t, n, r, i, a) {
		return {
			kind: "bitmap",
			key: e,
			...t,
			order: NaN,
			rect: n,
			radii: r,
			res: i,
			source: a ?? {
				x: 0,
				y: 0,
				width: i.width,
				height: i.height
			}
		};
	}
	text(e, t, n) {
		let r = n.flow, i = {
			kind: "text",
			node: e,
			drafts: [],
			covered: null,
			scroller: r.scroller
		}, a = this.range;
		a.selectNodeContents(e);
		let o = Me(a.getClientRects());
		if (!o.length) return i;
		let s = this.frames.chain(r.scroller), c = this.cullOf(r.scroller), l = r.clip && this.frames.clipScroller(r.clip) === r.scroller ? this.frames.clipRect(r.clip) : null, u = [], d = [];
		for (let e = 0; e < o.length; e += 1) {
			let t = o[e];
			if (!t) continue;
			let n = {
				x: t.left + s.x,
				y: t.top + s.y,
				width: t.right - t.left,
				height: t.bottom - t.top
			};
			u.push(n), c && !w(n, c) || l && !w(n, l) || d.push(e);
		}
		if (d.length < o.length && c && (i.covered = {
			top: c.y,
			bottom: c.y + c.height
		}), !d.length) return i;
		let f = e.data, p = o.length === 1 ? [0, f.length] : Fe(a, e, o, d, t.whiteSpace), m = !/^(pre|pre-wrap|break-spaces)$/.test(t.whiteSpace), h = {
			owner: n.owner,
			scroller: r.scroller,
			clip: r.clip,
			opacity: n.opacity
		};
		for (let s of d) {
			let c = p[s] ?? -1, l = p[s + 1] ?? -1, d = u[s];
			if (c < 0 || l <= c || !d) continue;
			let g = f.slice(c, l), _ = ze(g, t, m && /^\s/.test(g) && Le(a, e, c), s === o.length - 1);
			if (!_) continue;
			let v = n.ellipsis;
			if (v && v.scroller === r.scroller) {
				if (t.direction === "ltr" && d.x + d.width > v.right + .5) {
					let e = Math.max(0, v.right - d.x);
					_ = Ve(_, t, e / n.zoom), d = {
						...d,
						width: e
					};
				} else if (t.direction === "rtl" && d.x < v.left - .5) {
					let e = Math.max(0, d.x + d.width - v.left);
					_ = Ve(_, t, e / n.zoom), d = {
						...d,
						x: v.left,
						width: e
					};
				}
			}
			let y = t.justify && s < o.length - 1, b = this.run(this.key(e, s), _, t, d, n.zoom, h, y);
			b && this.adopt(b, i);
		}
		return i;
	}
	run(e, t, n, r, i, a, o) {
		if (r.width <= 0 || r.height <= 0) return null;
		let s = {
			text: t,
			style: n,
			box: r,
			zoom: i,
			dpr: this.dpr,
			fill: o
		}, c = `${this.epoch}${Ge(s)}`, u = this.store.get(c);
		if (!u) {
			let e = Je(s);
			if (!e) return null;
			u = this.store.putSync(c, e.image), u.meta = e.meta;
		}
		let d = u.meta;
		return d ? this.bitmap(e, a, et(r, i, this.dpr, d, u), l, u) : null;
	}
	marker(n, r, i, a, o, s) {
		let c = r.listStyleType;
		if (c === "none") return;
		let d = xe(getComputedStyle(n.el, "::marker"), []) ?? xe(r, []);
		if (!d) return;
		let f = Ae(d), p = i.y + a[0] + u(r.paddingTop) * s, m = (f.ascent + f.descent) * s, h = Wt(n.el);
		if (h) {
			this.range.selectNodeContents(h);
			let e = Me(this.range.getClientRects())[0];
			e && (p = e.top + this.frames.chain(o.scroller).y, m = e.bottom - e.top);
		}
		let g = r.listStylePosition === "inside", _ = r.direction === "rtl", v = i.x + a[3] + u(r.paddingLeft) * s, y = i.x + i.width - a[1] - u(r.paddingRight) * s, b = this.key(n.el, Ft);
		if (c === "disc" || c === "circle" || c === "square") {
			let r = f.ascent, i = (r * 2 / 3 + 1) / 2, a = p + m * (r / (r + f.descent || 1)), u = d.size * .78, h = i * s, x = _ ? g ? y - h : y + u * s : g ? v : v - (i + u) * s, S = a - r / 2 * s, C = e(d.color) ?? t, w = c === "circle", T = Math.max(1, i / 5) * s;
			this.adopt({
				kind: "box",
				key: b,
				...o,
				order: NaN,
				rect: {
					x,
					y: S,
					width: h,
					height: h
				},
				radii: c === "square" ? l : [
					h / 2,
					h / 2,
					h / 2,
					h / 2
				],
				fill: w ? t : C,
				border: w ? [
					T,
					T,
					T,
					T
				] : [
					0,
					0,
					0,
					0
				],
				borderColor: w ? C : t,
				shadows: []
			}, n);
			return;
		}
		let x = Jt(n.el, c);
		if (!x) return;
		let S = Y(x, d) * s, C = Y(" ", d) * s, w = _ ? g ? y - S : y + C : g ? v : v - C - S, T = this.run(b, x, d, {
			x: w,
			y: p,
			width: S,
			height: m
		}, s, o, !1);
		T && this.adopt(T, n);
	}
	content(e, t, n, r, i, a, o, s) {
		let c = e.el, l = () => g(r, i[0] + u(t.paddingTop) * o, i[1] + u(t.paddingRight) * o, i[2] + u(t.paddingBottom) * o, i[3] + u(t.paddingLeft) * o), d = (e) => h(s(), e.y - r.y, r.x + r.width - e.x - e.width, r.y + r.height - e.y - e.height, e.x - r.x);
		return c instanceof HTMLImageElement ? (this.image(e, c, t, l(), a, o, d), !0) : c instanceof SVGSVGElement ? (this.svg(e, c, t, r, a, o), !0) : c instanceof HTMLVideoElement || c instanceof HTMLCanvasElement ? (this.media(e, c, t, l(), a, o, d), !0) : c instanceof HTMLInputElement || c instanceof HTMLTextAreaElement || c instanceof HTMLSelectElement ? (this.form(e, c, t, r, i, l(), a, o, s), !0) : n === "IFRAME" || n === "OBJECT" || n === "EMBED" || c instanceof SVGElement;
	}
	placeholder(e, n, r, i) {
		this.host.tainted(), this.adopt({
			kind: "box",
			key: this.key(e.el, Q(0)),
			...i,
			order: NaN,
			rect: n,
			radii: r,
			fill: At,
			border: [
				0,
				0,
				0,
				0
			],
			borderColor: t,
			shadows: []
		}, e);
	}
	image(e, t, n, r, i, a, o) {
		let s = t.currentSrc || t.src;
		if (!s || !t.complete) return;
		let c = ce(t, r);
		if (t.naturalWidth === 0 && !c.vector) return;
		let u = K(n.objectFit, n.objectPosition, r, c, a);
		if (!u) return;
		let d = C(u.dest, r) ? o(r) : l;
		if (!W(t, s)) {
			this.placeholder(e, u.dest, d, i);
			return;
		}
		let f = q(c, u.object, this.dpr, c.vector), p = `img|${f.width}x${f.height}|${s}`, m = this.store.get(p) ?? this.store.putAsync(p, () => J(t, f.width, f.height)), h = f.width / c.width, g = {
			x: u.source.x * h,
			y: u.source.y * h,
			width: u.source.width * h,
			height: u.source.height * h
		};
		this.adopt(this.bitmap(this.key(t, Q(0)), i, u.dest, d, m, g), e);
	}
	svg(e, t, n, r, i, a) {
		let o = r.width / a, s = r.height / a;
		if (!(o > 0 && s > 0)) return;
		let c = Math.min(Ue(a, this.dpr), 4096 / o, 4096 / s), u = Math.max(1, Math.round(o * c)), d = Math.max(1, Math.round(s * c)), f = ve(t, n, o, s), p = `svg|${u}x${d}|${f}`, m = this.store.get(p) ?? this.store.putAsync(p, () => ye(f, u, d)), h = {
			x: 0,
			y: 0,
			width: u,
			height: d
		};
		this.adopt(this.bitmap(this.key(t, Q(0)), i, r, l, m, h), e);
	}
	media(e, t, n, r, i, a, o) {
		let s = t instanceof HTMLVideoElement ? t : null, c = s ? {
			width: s.videoWidth,
			height: s.videoHeight
		} : {
			width: t.width,
			height: t.height
		};
		if (!(c.width > 0 && c.height > 0)) {
			s?.poster && this.poster(e, s, n, r, i, a, o);
			return;
		}
		let u = K(n.objectFit, n.objectPosition, r, c, a);
		if (!u) return;
		let d = C(u.dest, r) ? o(r) : l, f = this.key(t, Q(0)), p = q(c, u.object, this.dpr, !1), m = this.host.sourceOf(t, p);
		if (m) {
			let t = m.state === "ready" ? m.width / c.width : 0, n = {
				x: u.source.x * t,
				y: u.source.y * t,
				width: u.source.width * t,
				height: u.source.height * t
			};
			this.adopt(this.bitmap(f, i, u.dest, d, m, n), e);
			return;
		}
		if (!(s ? G(s) && s.readyState >= 2 : ie(t))) {
			s?.poster ? this.poster(e, s, n, r, i, a, o) : s && this.placeholder(e, u.dest, d, i);
			return;
		}
		let h = (this.snapshots.get(t) ?? 0) + 1;
		this.snapshots.set(t, h);
		let g = this.store.putAsync(`still|${f}|${h}`, () => J(t, p.width, p.height)), _ = p.width / c.width, v = {
			x: u.source.x * _,
			y: u.source.y * _,
			width: u.source.width * _,
			height: u.source.height * _
		};
		this.adopt(this.bitmap(f, i, u.dest, d, g, v), e);
	}
	poster(e, t, n, r, i, a, o) {
		let s = ue(t.poster, t, (e) => this.host.loaded(e));
		if (!s) return;
		let c = {
			width: s.naturalWidth,
			height: s.naturalHeight
		}, u = K(n.objectFit, n.objectPosition, r, c, a);
		if (!u) return;
		let d = q(c, u.object, this.dpr, !1), f = `img|${d.width}x${d.height}|${t.poster}`, p = this.store.get(f) ?? this.store.putAsync(f, () => J(s, d.width, d.height)), m = d.width / c.width, h = {
			x: u.source.x * m,
			y: u.source.y * m,
			width: u.source.width * m,
			height: u.source.height * m
		}, g = C(u.dest, r) ? o(r) : l;
		this.adopt(this.bitmap(this.key(t, Q(0)), i, u.dest, g, p, h), e);
	}
	form(e, t, n, r, i, a, o, s, c) {
		let l;
		if (t instanceof HTMLSelectElement) l = t.selectedOptions[0]?.text ?? "";
		else if (t instanceof HTMLInputElement) {
			if (Ot.has(t.type)) return;
			l = t.value, kt.has(t.type) && !l ? l = t.type === "reset" ? "Reset" : t.type === "submit" ? "Submit" : "" : t.type === "password" && (l = "•".repeat([...l].length));
		} else l = t.value;
		e.value = t instanceof HTMLSelectElement ? `${t.selectedIndex}` : t.value, this.forms.add(e);
		let d = !l && !(t instanceof HTMLSelectElement) ? t.placeholder : "", f = l || d;
		if (!f) return;
		let p = xe(d ? getComputedStyle(t, "::placeholder") : n, []);
		if (!p) return;
		let m = g(r, i[0], i[1], i[2], i[3]), _ = this.frames.ensureClip(t, o.clip, o.scroller, m, h(c(), i[0], i[1], i[2], i[3]));
		e.clip = _;
		let v = {
			...o,
			clip: _
		}, y = Ae(p), b = (y.ascent + y.descent) * s, x = p.direction === "rtl", S = p.align, C = (n, r, i) => {
			let o = Y(n, p) * s, c = S === "center" ? a.x + (a.width - o) / 2 : S === "right" || S === "end" && !x || S === "start" && x ? a.x + a.width - o : a.x;
			c -= t.scrollLeft * s;
			let l = this.run(this.key(t, Q(i)), n, p, {
				x: c,
				y: r,
				width: o,
				height: b
			}, s, v, !1);
			l && this.adopt(l, e);
		}, w = tt(f, p.transform);
		if (!(t instanceof HTMLTextAreaElement)) {
			C(w.replace(/[\r\n]+/g, " "), a.y + (a.height - b) / 2, 0);
			return;
		}
		let T = (n.lineHeight === "normal" ? p.size * 1.2 : u(n.lineHeight)) * s, E = Yt(w, p, a.width / s), D = a.y - t.scrollTop * s + (T - b) / 2;
		for (let e = 0; e < E.length; e += 1) {
			let t = D + e * T;
			if (t > a.y + a.height) break;
			t + b < a.y || C(E[e] ?? "", t, e);
		}
	}
	recull(e, t) {
		let n = this.cullOf(t);
		if (!n) return;
		let r = E(n, n.width / 3, n.height / 3), i = (e) => {
			for (let a of e.children) if (a.kind !== "text") {
				if (a.boxScroller === t) {
					if (a.state === "culled" && w(a.rect, n)) {
						this.walk(a.el, a.input, a.parent, !0);
						continue;
					}
					if (a.state === "drawn" && a.rect.width > 0 && a.rect.height > 0 && !w(a.rect, r)) {
						this.release(a);
						continue;
					}
					if (a.state === "drawn" && this.partial(a, n)) {
						this.walk(a.el, a.input, a.parent, !1);
						continue;
					}
				}
				a.state === "drawn" && i(a);
			}
		};
		this.partial(e, n) && this.walk(e.el, e.input, e.parent, !1), i(e);
	}
	partial(e, t) {
		for (let n of e.children) if (n.kind === "text" && n.covered && (n.covered.top > t.y || n.covered.bottom < t.y + t.height)) return !0;
		return !1;
	}
	release(e) {
		for (let t of e.children) (t.kind !== "element" || t.parent === e) && this.drop(t);
		this.retireOwn(e), e.children = [], e.state = "culled";
	}
};
function Wt(e) {
	let t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: (e) => He(e.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP }).nextNode();
	return t instanceof Text ? t : null;
}
function Gt(e, t) {
	let n = "", r = e;
	for (; r > 0;) --r, n = String.fromCharCode(97 + r % 26) + n, r = Math.floor(r / 26);
	return t ? n.toUpperCase() : n;
}
function Kt(e, t) {
	if (e <= 0 || e >= 4e3) return `${e}`;
	let n = [
		[1e3, "m"],
		[900, "cm"],
		[500, "d"],
		[400, "cd"],
		[100, "c"],
		[90, "xc"],
		[50, "l"],
		[40, "xl"],
		[10, "x"],
		[9, "ix"],
		[5, "v"],
		[4, "iv"],
		[1, "i"]
	], r = "", i = e;
	for (let [e, t] of n) for (; i >= e;) r += t, i -= e;
	return t ? r.toUpperCase() : r;
}
function qt(e) {
	let t = e.parentElement;
	if (e instanceof HTMLLIElement && e.hasAttribute("value")) return e.value;
	if (!t) return 1;
	let n = [...t.children].filter((e) => e.tagName === "LI"), r = t instanceof HTMLOListElement && t.reversed, i = t instanceof HTMLOListElement && t.hasAttribute("start") ? t.start : r ? n.length : 1;
	for (let t of n) {
		if (t instanceof HTMLLIElement && t.hasAttribute("value") && (i = t.value), t === e) return i;
		i += r ? -1 : 1;
	}
	return i;
}
function Jt(e, t) {
	switch (t) {
		case "disc": return "•";
		case "circle": return "◦";
		case "square": return "▪";
		case "disclosure-closed": return "▸";
		case "disclosure-open": return "▾";
	}
	if (t.startsWith("\"") || t.startsWith("'")) return t.slice(1, -1);
	let n = qt(e);
	switch (t) {
		case "decimal-leading-zero": return `${n < 10 && n >= 0 ? "0" : ""}${n}.`;
		case "lower-alpha":
		case "lower-latin": return `${Gt(n, !1)}.`;
		case "upper-alpha":
		case "upper-latin": return `${Gt(n, !0)}.`;
		case "lower-roman": return `${Kt(n, !1)}.`;
		case "upper-roman": return `${Kt(n, !0)}.`;
		default: return `${n}.`;
	}
}
function Yt(e, t, n) {
	let r = [];
	for (let i of e.split(/\r?\n/)) {
		if (!i) {
			r.push("");
			continue;
		}
		let e = "";
		for (let a of i.split(/(?<=\s)/)) {
			let i = e + a;
			e && Y(i.trimEnd(), t) > n ? (r.push(e.trimEnd()), e = a) : e = i;
		}
		if (r.push(e.trimEnd()), r.length > 500) break;
	}
	return r;
}
// src/capture/index.ts
var Xt = 32, Zt = 3, Qt = [
	"class",
	"style",
	"dir",
	"lang",
	"data-theme",
	"data-mode",
	"data-color-scheme"
];
function $t(e) {
	if (!(e instanceof SVGElement)) return null;
	let t = e instanceof SVGSVGElement ? e : e.ownerSVGElement;
	for (; t?.ownerSVGElement;) t = t.ownerSVGElement;
	return t;
}
var $ = (e) => {
	if (e.assignedSlot) return e.assignedSlot;
	if (e.parentElement) return e.parentElement;
	let t = e.parentNode;
	return t instanceof ShadowRoot ? t.host : null;
};
function en(e, t, n) {
	let r = t.telemetry, i = n.backdrop, a = !1, o = !0, s = new k(), l = new c((e) => {
		u.ready(e), t.requestFrame();
	}), u = new te(l), d = new de(l, () => t.requestFrame(), (e) => he(e)), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new WeakSet(), _ = /* @__PURE__ */ new WeakSet(), v = /* @__PURE__ */ new WeakSet(), y = new AbortController(), b = y.signal, x = new Ut(e, s, l, u, {
		surfaceOf: (e) => t.surfaceOf(e),
		sourceOf: (e, t) => d.resourceOf(e, t),
		loaded: (e) => {
			S(e, "deep"), j();
		},
		shadow: (e) => {
			v.has(e) || (v.add(e), R.observe(e, N));
		},
		watch: (e) => {
			g.has(e) || (g.add(e), B.observe(e));
		},
		tainted: () => r.tick("page.capture.tainted")
	});
	function S(t, n) {
		if (a || !t) return null;
		let r = t.nodeType === 1 ? t : t instanceof ShadowRoot ? t.host : t.parentElement, i = n;
		for (; r && !x.records.has(r);) r = $(r), i = "shallow";
		return r ? (f.get(r) !== "deep" && f.set(r, i), r) : x.records.has(e) ? null : (f.set(e, "deep"), e);
	}
	let O = null, A = typeof requestIdleCallback == "function";
	function j() {
		a || O !== null || (O = A ? requestIdleCallback(pe, { timeout: 250 }) : window.setTimeout(pe, 50));
	}
	function M() {
		O !== null && (A ? cancelIdleCallback(O) : clearTimeout(O), O = null);
	}
	let N = {
		subtree: !0,
		childList: !0,
		attributes: !0,
		characterData: !0
	}, P = (e) => e.nodeType === 1 ? e.hasAttribute("data-lg-canvas") || e.hasAttribute("data-lg-ignore") : e.nodeType === 8, F = (e) => !!(e.nodeType === 1 ? e : e.parentElement)?.closest("[data-lg-ignore],[data-lg-canvas]"), I = /* @__PURE__ */ new WeakMap();
	function ee(e) {
		if (e.drafts.length) return !1;
		for (let n of e.children) {
			if (n.kind !== "element") return !1;
			if (t.surfaceOf(n.el)) {
				if (n.drafts.length) return !1;
			} else if (!ee(n)) return !1;
		}
		return !0;
	}
	function L(e) {
		if (!(e instanceof HTMLElement)) return !1;
		let t = x.records.get(e);
		if (!t || t.state !== "drawn" || !ee(t)) return !1;
		let n = getComputedStyle(e), r = [
			n.display,
			n.visibility,
			n.opacity,
			n.backgroundColor,
			n.backgroundImage,
			n.borderTopWidth,
			n.borderRightWidth,
			n.borderBottomWidth,
			n.borderLeftWidth,
			n.borderTopColor,
			n.boxShadow,
			n.outlineStyle,
			n.filter,
			n.clipPath,
			n.overflow,
			n.zIndex,
			n.position,
			e.offsetWidth,
			e.offsetHeight
		].join("|"), i = I.get(e);
		return I.set(e, r), i === r;
	}
	let R = new MutationObserver((e) => {
		let t = !1;
		for (let n of e) {
			let e = n.target;
			if (!F(e)) {
				if (n.type === "attributes") {
					let r = n.attributeName ?? "";
					if (r.startsWith("data-lg-") || (r === "style" || r === "class") && L(e)) continue;
					let i = $t(e);
					i && ge(i), t = S(i ?? e, "deep") !== null || t;
				} else if (n.type === "characterData") {
					let n = $t(e.parentElement);
					n && ge(n), t = S(n ?? e.parentElement, n ? "deep" : "shallow") !== null || t;
				} else {
					let r = [...n.addedNodes, ...n.removedNodes];
					if (r.length && r.every(P)) continue;
					let i = $t(e);
					i && ge(i), t = S(i ?? e, i ? "deep" : "shallow") !== null || t;
				}
			}
		}
		t && j();
	});
	R.observe(e, N);
	let z = new MutationObserver(() => {
		S(e, "deep"), j();
	});
	for (let t of [document.documentElement, document.body]) t && !e.contains(t) && t !== e && z.observe(t, {
		attributes: !0,
		attributeFilter: Qt
	});
	let B = new ResizeObserver((t) => {
		let n = !1;
		for (let r of t) _.has(r.target) ? n = S(r.target, r.target === e ? "deep" : "shallow") !== null || n : _.add(r.target);
		n && j();
	});
	g.add(e), B.observe(e);
	let V = (e, t, n) => e.addEventListener(t, n, {
		capture: !0,
		passive: !0,
		signal: b
	}), H = (e) => {
		let t = e.composedPath()[0] ?? e.target;
		return t instanceof Element ? t : null;
	}, U = (e) => !!e.closest("[data-lg-ignore]"), W = (e) => {
		let t = H(e);
		t && !U(t) && S(t, "deep") && j();
	};
	for (let t of [
		"load",
		"error",
		"input",
		"change",
		"toggle",
		"focusin",
		"focusout"
	]) V(e, t, W);
	let G = (e) => {
		let n = H(e);
		n && !U(n) && (m.add(n), t.requestFrame());
	}, ne = (e) => {
		let n = H(e);
		if (!n || !m.delete(n)) return;
		let r = S(n, "deep");
		r && (K = null, q(r) && p.add(r), j(), t.requestFrame());
	};
	V(e, "transitionrun", G), V(e, "animationstart", G);
	for (let t of [
		"transitionend",
		"transitioncancel",
		"animationend",
		"animationcancel"
	]) V(e, t, ne);
	let re = (t) => {
		let n = H(t);
		if (!n || U(n)) return;
		let r = t.relatedTarget, i = n;
		if (r instanceof Node) {
			let t = 0;
			for (let a = $(n); a && a !== e && !a.contains(r) && t < Zt; a = $(a)) i = a, t += 1;
		}
		S(i, "deep") && j();
	};
	V(e, "pointerover", re), V(e, "pointerout", re);
	let ie = (e) => {
		e.moved = !0;
		for (let t of e.sticky) h.add(t);
		t.requestFrame();
	};
	V(e, "scroll", (e) => {
		let n = e.target;
		if (n === document || n === document.documentElement || n === document.body || !(n instanceof Element) || U(n)) return;
		let r = s.scrollerFor(n);
		r ? ie(r) : x.records.has(n) && S(n, "deep") && (p.add(n), t.requestFrame());
	}), window.addEventListener("scroll", () => {
		let e = s.scrollers.get(0);
		e && ie(e);
	}, {
		passive: !0,
		signal: b
	}), window.visualViewport?.addEventListener("scroll", () => t.requestFrame(), {
		passive: !0,
		signal: b
	}), window.visualViewport?.addEventListener("resize", () => t.requestFrame(), {
		passive: !0,
		signal: b
	}), window.addEventListener("resize", () => {
		S(e, "deep"), j();
	}, {
		passive: !0,
		signal: b
	});
	let ae = () => {
		matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener("change", () => {
			x.epoch += 1, S(e, "deep"), p.add(e), t.requestFrame(), ae();
		}, {
			once: !0,
			signal: b
		});
	};
	ae(), document.fonts?.addEventListener("loadingdone", () => {
		x.epoch += 1, je(), S(e, "deep"), j();
	}, { signal: b });
	let K = null;
	function oe() {
		if (K) return K;
		K = [];
		for (let e of x.surfaces) {
			if (!e.isConnected) {
				x.surfaces.delete(e);
				continue;
			}
			let t = e.getBoundingClientRect();
			t.width > 0 && t.height > 0 && K.push(E({
				x: t.left,
				y: t.top,
				width: t.width,
				height: t.height
			}, Xt, Xt));
		}
		return K;
	}
	function q(e) {
		let n = x.records.get(e);
		for (let t = e; !n && t; t = $(t)) n = x.records.get(t);
		if (!n) return !1;
		if (n.input.owner !== 0 || t.surfaceOf(n.el)) return !0;
		let r = n.rect, i = n.boxScroller;
		for (let e = n.parent; (r.width <= 0 || r.height <= 0) && e; e = e.parent) r = e.rect, i = e.boxScroller;
		let a = s.chain(i), o = D(r, -a.x, -a.y);
		return oe().some((e) => w(e, o));
	}
	let se = (e) => {
		let t = 0;
		for (let n = $(e); n; n = $(n)) t += 1;
		return t;
	};
	function ce(e) {
		let t = s.chain(e.id);
		if (e.id === 0) return {
			x: t.x,
			y: t.y,
			width: innerWidth,
			height: innerHeight
		};
		let n = s.clipRect(e.clip);
		if (!n) return null;
		let r = s.chain(e.parent);
		return D(n, t.x - r.x, t.y - r.y);
	}
	function J(e) {
		let t = ce(e);
		if (!t || !e.cull) return 0;
		let n = Math.max(t.width, 256), r = Math.max(t.height, 256);
		return T(E(e.cull, -n * .85, -r * .85), t) ? +!T(E(e.cull, -n * .5, -r * .5), t) : 2;
	}
	function le(t) {
		let n = ce(t), r = t.id === 0 ? x.records.get(e) : t.el ? x.records.get(t.el) : void 0;
		n && r && (t.cull = E(n, Math.max(n.width, 256), Math.max(n.height, 256)), x.recull(r, t.id));
	}
	function ue(t, n, i) {
		r.time("page.capture", () => {
			let r = !x.records.has(e), a = r || t.some(([t, n]) => t === e && n === "deep"), o = t.map(([e]) => e);
			for (let t of n) o.push(t.el ?? e);
			for (let e of i) o.push(e.el);
			x.begin(o, a);
			try {
				if (r) x.walk(e, Vt(), null, !0);
				else {
					let e = t.map(([e, t]) => ({
						element: e,
						mode: t,
						depth: se(e)
					}));
					e.sort((e, t) => e.depth - t.depth);
					let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
					for (let { element: t, mode: i } of e) {
						let e = !1;
						for (let r = $(t); r && !e; r = $(r)) e = n.has(r);
						if (e) continue;
						let a = x.records.get(t);
						if (!a) continue;
						let o = a.rect;
						x.walk(t, a.input, a.parent, i === "deep"), i === "deep" && n.add(t), a.parent && !C(o, a.rect) && r.add(a.parent);
					}
					let i = [...r].sort((e, t) => se(t.el) - se(e.el)), a = /* @__PURE__ */ new Set();
					for (let e of i) for (let t = e; t && !a.has(t) && (a.add(t), x.records.get(t.el) === t); t = t.parent) {
						let e = t.rect;
						if (x.walk(t.el, t.input, t.parent, !1), C(e, t.rect)) break;
					}
				}
				for (let e of i) x.records.get(e.el) === e && e.state !== "hidden" && x.reconcile(e);
				for (let e of n) le(e);
				u.commit(x.records.get(e) ?? null);
			} finally {
				x.end();
			}
		});
	}
	function fe() {
		if (!x.records.has(e)) return !1;
		let { upsert: n, remove: a } = u.take(), { bitmaps: c, transfer: d, releases: f } = l.take(), { scrollers: p, clips: m } = s.take(o);
		if (!o && !n.length && !a.length && !c.length && !f.length && !p.length && !m.length) return !1;
		let h = {
			reset: o,
			scrollers: p,
			clips: m,
			upsert: n,
			remove: a,
			bitmaps: c,
			releaseBitmaps: f,
			backdrop: i
		};
		return o = !1, r.tick("page.capture.items", n.length), t.send(h, d), !0;
	}
	function pe() {
		if (O = null, a) return;
		K = null, s.begin();
		let e = [...f];
		f.clear(), p.clear();
		let n = [];
		for (let e of s.scrollers.values()) e.moved && (e.moved = !1, J(e) > 0 && n.push(e));
		let r = [...h];
		h.clear(), (e.length || n.length || r.length) && ue(e, n, r), s.prune(), fe() && t.requestFrame();
	}
	function me() {
		if (a) return;
		K = null, s.begin();
		for (let e of x.forms) {
			let t = e.el;
			!t.isConnected || x.records.get(t) !== e ? x.forms.delete(e) : (t instanceof HTMLSelectElement ? `${t.selectedIndex}` : t.value) !== e.value && S(t, "deep") && (q(t) && p.add(t), j());
		}
		let n = !1;
		for (let e of m) {
			if (!e.isConnected) {
				m.delete(e);
				continue;
			}
			if (!q(e)) continue;
			let t = S(e, "deep");
			t && (p.add(t), n = !0);
		}
		let r = [];
		for (let [t, n] of f) (t === e && !x.records.has(e) || p.has(t) || q(t)) && r.push([t, n]);
		for (let [e] of r) f.delete(e), p.delete(e);
		let i = [], o = !1;
		for (let e of s.scrollers.values()) {
			if (!e.moved) continue;
			let t = J(e);
			t === 2 ? (e.moved = !1, i.push(e)) : t === 1 ? o = !0 : e.moved = !1;
		}
		let c = [...h];
		h.clear(), (r.length || i.length || c.length) && ue(r, i, c), (o || f.size) && j(), fe(), n && t.requestFrame();
	}
	function he(n) {
		if (a) return;
		let r = S(n ?? e, "deep");
		r && p.add(r), j(), t.requestFrame();
	}
	return f.set(e, "deep"), p.add(e), j(), {
		scrollDeltas: () => s.deltas(),
		invalidate: he,
		flush: me,
		addSource: (e) => d.add(e),
		destroy() {
			a || (a = !0, M(), y.abort(), R.disconnect(), z.disconnect(), B.disconnect(), d.dispose(), l.dispose(), f.clear(), p.clear(), m.clear(), h.clear());
		}
	};
}
export { en as createCapture };
