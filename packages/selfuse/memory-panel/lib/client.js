window.__ModuleLoader__.load({
	id: "@dsh-selfuse/memory-panel",
	factory: (Re) => {
		var De = { exports: {} }, H = De.exports;
		Object.defineProperty(H, Symbol.toStringTag, { value: "Module" });
		let Z = Re("react"), p = Re("react/jsx-runtime");
		var Ue;
		function c(e, t, n) {
			function r(a, u) {
				if (a._zod || Object.defineProperty(a, "_zod", {
					value: {
						def: u,
						constr: s,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: !1
				}), a._zod.traits.has(e)) return;
				a._zod.traits.add(e), t(a, u);
				const l = s.prototype, d = Object.keys(l);
				for (let _ = 0; _ < d.length; _++) {
					const m = d[_];
					m in a || (a[m] = l[m].bind(a));
				}
			}
			const o = n?.Parent ?? Object;
			class i extends o {}
			Object.defineProperty(i, "name", { value: e });
			function s(a) {
				var u;
				const l = n?.Parent ? new i() : this;
				r(l, a), (u = l._zod).deferred ?? (u.deferred = []);
				for (const d of l._zod.deferred) d();
				return l;
			}
			return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, { value: (a) => n?.Parent && a instanceof n.Parent ? !0 : a?._zod?.traits?.has(e) }), Object.defineProperty(s, "name", { value: e }), s;
		}
		var K = class extends Error {
			constructor() {
				super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
			}
		}, Fe = class extends Error {
			constructor(e) {
				super("Encountered unidirectional transform during encode: ".concat(e)), this.name = "ZodEncodeError";
			}
		};
		(Ue = globalThis).__zod_globalConfig ?? (Ue.__zod_globalConfig = {});
		const oe = globalThis.__zod_globalConfig;
		function M(e) {
			return e && Object.assign(oe, e), oe;
		}
		function Me(e) {
			const t = Object.values(e).filter((n) => typeof n == "number");
			return Object.entries(e).filter(([n, r]) => t.indexOf(+n) === -1).map(([n, r]) => r);
		}
		function we(e, t) {
			return typeof t == "bigint" ? t.toString() : t;
		}
		function ze(e) {
			return { get value() {
				{
					const t = e();
					return Object.defineProperty(this, "value", { value: t }), t;
				}
				throw new Error("cached value already set");
			} };
		}
		function ke(e) {
			return e == null;
		}
		function $e(e) {
			const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
			return e.slice(t, n);
		}
		function Bt(e, t) {
			const n = e / t, r = Math.round(n), o = Number.EPSILON * Math.max(Math.abs(n), 1);
			return Math.abs(n - r) < o ? 0 : n - r;
		}
		const Je = Symbol("evaluating");
		function b(e, t, n) {
			let r;
			Object.defineProperty(e, t, {
				get() {
					if (r !== Je) return r === void 0 && (r = Je, r = n()), r;
				},
				set(o) {
					Object.defineProperty(e, t, { value: o });
				},
				configurable: !0
			});
		}
		function J(e, t, n) {
			Object.defineProperty(e, t, {
				value: n,
				writable: !0,
				enumerable: !0,
				configurable: !0
			});
		}
		function D(...e) {
			const t = {};
			for (const n of e) Object.assign(t, Object.getOwnPropertyDescriptors(n));
			return Object.defineProperties({}, t);
		}
		function Le(e) {
			return JSON.stringify(e);
		}
		function Gt(e) {
			return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const Ve = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
		function se(e) {
			return typeof e == "object" && e !== null && !Array.isArray(e);
		}
		const Kt = ze(() => {
			if (oe.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
			try {
				return new Function(""), !0;
			} catch {
				return !1;
			}
		});
		function Q(e) {
			if (se(e) === !1) return !1;
			const t = e.constructor;
			if (t === void 0 || typeof t != "function") return !0;
			const n = t.prototype;
			return !(se(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
		}
		function We(e) {
			return Q(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
		}
		const Yt = new Set([
			"string",
			"number",
			"symbol"
		]);
		function ie(e) {
			return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function U(e, t, n) {
			const r = new e._zod.constr(t ?? e._zod.def);
			return (!t || n?.parent) && (r._zod.parent = e), r;
		}
		function h(e) {
			const t = e;
			if (!t) return {};
			if (typeof t == "string") return { error: () => t };
			if (t?.message !== void 0) {
				if (t?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				t.error = t.message;
			}
			return delete t.message, typeof t.error == "string" ? {
				...t,
				error: () => t.error
			} : t;
		}
		function qt(e) {
			return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
		}
		const Xt = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function Ht(e, t) {
			const n = e._zod.def, r = n.checks;
			if (r && r.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return U(e, D(e._zod.def, {
				get shape() {
					const o = {};
					for (const i in t) {
						if (!(i in n.shape)) throw new Error("Unrecognized key: \"".concat(i, "\""));
						t[i] && (o[i] = n.shape[i]);
					}
					return J(this, "shape", o), o;
				},
				checks: []
			}));
		}
		function Qt(e, t) {
			const n = e._zod.def, r = n.checks;
			if (r && r.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return U(e, D(e._zod.def, {
				get shape() {
					const o = { ...e._zod.def.shape };
					for (const i in t) {
						if (!(i in n.shape)) throw new Error("Unrecognized key: \"".concat(i, "\""));
						t[i] && delete o[i];
					}
					return J(this, "shape", o), o;
				},
				checks: []
			}));
		}
		function en(e, t) {
			if (!Q(t)) throw new Error("Invalid input to extend: expected a plain object");
			const n = e._zod.def.checks;
			if (n && n.length > 0) {
				const r = e._zod.def.shape;
				for (const o in t) if (Object.getOwnPropertyDescriptor(r, o) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return U(e, D(e._zod.def, { get shape() {
				const r = {
					...e._zod.def.shape,
					...t
				};
				return J(this, "shape", r), r;
			} }));
		}
		function tn(e, t) {
			if (!Q(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return U(e, D(e._zod.def, { get shape() {
				const n = {
					...e._zod.def.shape,
					...t
				};
				return J(this, "shape", n), n;
			} }));
		}
		function nn(e, t) {
			if (e._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return U(e, D(e._zod.def, {
				get shape() {
					const n = {
						...e._zod.def.shape,
						...t._zod.def.shape
					};
					return J(this, "shape", n), n;
				},
				get catchall() {
					return t._zod.def.catchall;
				},
				checks: t._zod.def.checks ?? []
			}));
		}
		function rn(e, t, n) {
			const r = t._zod.def.checks;
			if (r && r.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return U(t, D(t._zod.def, {
				get shape() {
					const o = t._zod.def.shape, i = { ...o };
					if (n) for (const s in n) {
						if (!(s in o)) throw new Error("Unrecognized key: \"".concat(s, "\""));
						n[s] && (i[s] = e ? new e({
							type: "optional",
							innerType: o[s]
						}) : o[s]);
					}
					else for (const s in o) i[s] = e ? new e({
						type: "optional",
						innerType: o[s]
					}) : o[s];
					return J(this, "shape", i), i;
				},
				checks: []
			}));
		}
		function on(e, t, n) {
			return U(t, D(t._zod.def, { get shape() {
				const r = t._zod.def.shape, o = { ...r };
				if (n) for (const i in n) {
					if (!(i in o)) throw new Error("Unrecognized key: \"".concat(i, "\""));
					n[i] && (o[i] = new e({
						type: "nonoptional",
						innerType: r[i]
					}));
				}
				else for (const i in r) o[i] = new e({
					type: "nonoptional",
					innerType: r[i]
				});
				return J(this, "shape", o), o;
			} }));
		}
		function Y(e, t = 0) {
			if (e.aborted === !0) return !0;
			for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
			return !1;
		}
		function sn(e, t = 0) {
			if (e.aborted === !0) return !0;
			for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
			return !1;
		}
		function Be(e, t) {
			return t.map((n) => {
				var r;
				return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
			});
		}
		function ae(e) {
			return typeof e == "string" ? e : e?.message;
		}
		function L(e, t, n) {
			const r = e.message ? e.message : ae(e.inst?._zod.def?.error?.(e)) ?? ae(t?.error?.(e)) ?? ae(n.customError?.(e)) ?? ae(n.localeError?.(e)) ?? "Invalid input", { inst: o, continue: i, input: s, ...a } = e;
			return a.path ?? (a.path = []), a.message = r, t?.reportInput && (a.input = s), a;
		}
		function Ze(e) {
			return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
		}
		function ee(...e) {
			const [t, n, r] = e;
			return typeof t == "string" ? {
				message: t,
				code: "custom",
				input: n,
				inst: r
			} : { ...t };
		}
		const Ge = (e, t) => {
			e.name = "$ZodError", Object.defineProperty(e, "_zod", {
				value: e._zod,
				enumerable: !1
			}), Object.defineProperty(e, "issues", {
				value: t,
				enumerable: !1
			}), e.message = JSON.stringify(t, we, 2), Object.defineProperty(e, "toString", {
				value: () => e.message,
				enumerable: !1
			});
		}, Ke = c("$ZodError", Ge), Ye = c("$ZodError", Ge, { Parent: Error });
		function an(e, t = (n) => n.message) {
			const n = {}, r = [];
			for (const o of e.issues) o.path.length > 0 ? (n[o.path[0]] = n[o.path[0]] || [], n[o.path[0]].push(t(o))) : r.push(t(o));
			return {
				formErrors: r,
				fieldErrors: n
			};
		}
		function cn(e, t = (n) => n.message) {
			const n = { _errors: [] }, r = (o, i = []) => {
				for (const s of o.issues) if (s.code === "invalid_union" && s.errors.length) s.errors.map((a) => r({ issues: a }, [...i, ...s.path]));
				else if (s.code === "invalid_key") r({ issues: s.issues }, [...i, ...s.path]);
				else if (s.code === "invalid_element") r({ issues: s.issues }, [...i, ...s.path]);
				else {
					const a = [...i, ...s.path];
					if (a.length === 0) n._errors.push(t(s));
					else {
						let u = n, l = 0;
						for (; l < a.length;) {
							const d = a[l];
							l !== a.length - 1 ? u[d] = u[d] || { _errors: [] } : (u[d] = u[d] || { _errors: [] }, u[d]._errors.push(t(s))), u = u[d], l++;
						}
					}
				}
			};
			return r(e), n;
		}
		const Se = (e) => (t, n, r, o) => {
			const i = r ? {
				...r,
				async: !1
			} : { async: !1 }, s = t._zod.run({
				value: n,
				issues: []
			}, i);
			if (s instanceof Promise) throw new K();
			if (s.issues.length) {
				const a = new ((o?.Err) ?? e)(s.issues.map((u) => L(u, i, M())));
				throw Ve(a, o?.callee), a;
			}
			return s.value;
		}, Oe = (e) => async (t, n, r, o) => {
			const i = r ? {
				...r,
				async: !0
			} : { async: !0 };
			let s = t._zod.run({
				value: n,
				issues: []
			}, i);
			if (s instanceof Promise && (s = await s), s.issues.length) {
				const a = new ((o?.Err) ?? e)(s.issues.map((u) => L(u, i, M())));
				throw Ve(a, o?.callee), a;
			}
			return s.value;
		}, ce = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				async: !1
			} : { async: !1 }, i = t._zod.run({
				value: n,
				issues: []
			}, o);
			if (i instanceof Promise) throw new K();
			return i.issues.length ? {
				success: !1,
				error: new (e ?? Ke)(i.issues.map((s) => L(s, o, M())))
			} : {
				success: !0,
				data: i.value
			};
		}, un = ce(Ye), ue = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				async: !0
			} : { async: !0 };
			let i = t._zod.run({
				value: n,
				issues: []
			}, o);
			return i instanceof Promise && (i = await i), i.issues.length ? {
				success: !1,
				error: new e(i.issues.map((s) => L(s, o, M())))
			} : {
				success: !0,
				data: i.value
			};
		}, ln = ue(Ye), dn = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return Se(e)(t, n, o);
		}, fn = (e) => (t, n, r) => Se(e)(t, n, r), pn = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return Oe(e)(t, n, o);
		}, hn = (e) => async (t, n, r) => Oe(e)(t, n, r), mn = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return ce(e)(t, n, o);
		}, gn = (e) => (t, n, r) => ce(e)(t, n, r), _n = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return ue(e)(t, n, o);
		}, vn = (e) => async (t, n, r) => ue(e)(t, n, r), bn = /^[cC][0-9a-z]{6,}$/, yn = /^[0-9a-z]+$/, wn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, zn = /^[0-9a-vA-V]{20}$/, kn = /^[A-Za-z0-9]{27}$/, $n = /^[a-zA-Z0-9_-]{21}$/, Zn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Sn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, qe = (e) => e ? new RegExp("^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-".concat(e, "[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$")) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, On = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, jn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
		function En() {
			return new RegExp(jn, "u");
		}
		const Nn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, xn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Pn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, In = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Tn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Xe = /^[A-Za-z0-9_-]*$/, An = /^https?$/, Cn = /^\+[1-9]\d{6,14}$/, He = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Rn = new RegExp("^".concat(He, "$"));
		function Qe(e) {
			const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
			return typeof e.precision == "number" ? e.precision === -1 ? "".concat(t) : e.precision === 0 ? "".concat(t, ":[0-5]\\d") : "".concat(t, ":[0-5]\\d\\.\\d{").concat(e.precision, "}") : "".concat(t, "(?::[0-5]\\d(?:\\.\\d+)?)?");
		}
		function Dn(e) {
			return new RegExp("^".concat(Qe(e), "$"));
		}
		function Un(e) {
			const t = Qe({ precision: e.precision }), n = ["Z"];
			e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
			const r = "".concat(t, "(?:").concat(n.join("|"), ")");
			return new RegExp("^".concat(He, "T(?:").concat(r, ")$"));
		}
		const Fn = (e) => {
			const t = e ? "[\\s\\S]{".concat(e?.minimum ?? 0, ",").concat(e?.maximum ?? "", "}") : "[\\s\\S]*";
			return new RegExp("^".concat(t, "$"));
		}, Mn = /^-?\d+$/, Jn = /^-?\d+(?:\.\d+)?$/, Ln = /^[^A-Z]*$/, Vn = /^[^a-z]*$/, P = c("$ZodCheck", (e, t) => {
			var n;
			e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
		}), et = {
			number: "number",
			bigint: "bigint",
			object: "date"
		}, tt = c("$ZodCheckLessThan", (e, t) => {
			P.init(e, t);
			const n = et[typeof t.value];
			e._zod.onattach.push((r) => {
				const o = r._zod.bag, i = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				t.value < i && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
			}), e._zod.check = (r) => {
				(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
					origin: n,
					code: "too_big",
					maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
					input: r.value,
					inclusive: t.inclusive,
					inst: e,
					continue: !t.abort
				});
			};
		}), nt = c("$ZodCheckGreaterThan", (e, t) => {
			P.init(e, t);
			const n = et[typeof t.value];
			e._zod.onattach.push((r) => {
				const o = r._zod.bag, i = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				t.value > i && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
			}), e._zod.check = (r) => {
				(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
					origin: n,
					code: "too_small",
					minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
					input: r.value,
					inclusive: t.inclusive,
					inst: e,
					continue: !t.abort
				});
			};
		}), Wn = c("$ZodCheckMultipleOf", (e, t) => {
			P.init(e, t), e._zod.onattach.push((n) => {
				var r;
				(r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
			}), e._zod.check = (n) => {
				if (typeof n.value != typeof t.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Bt(n.value, t.value) === 0) || n.issues.push({
					origin: typeof n.value,
					code: "not_multiple_of",
					divisor: t.value,
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), Bn = c("$ZodCheckNumberFormat", (e, t) => {
			P.init(e, t), t.format = t.format || "float64";
			const n = t.format?.includes("int"), r = n ? "int" : "number", [o, i] = Xt[t.format];
			e._zod.onattach.push((s) => {
				const a = s._zod.bag;
				a.format = t.format, a.minimum = o, a.maximum = i, n && (a.pattern = Mn);
			}), e._zod.check = (s) => {
				const a = s.value;
				if (n) {
					if (!Number.isInteger(a)) {
						s.issues.push({
							expected: r,
							format: t.format,
							code: "invalid_type",
							continue: !1,
							input: a,
							inst: e
						});
						return;
					}
					if (!Number.isSafeInteger(a)) {
						a > 0 ? s.issues.push({
							input: a,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst: e,
							origin: r,
							inclusive: !0,
							continue: !t.abort
						}) : s.issues.push({
							input: a,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst: e,
							origin: r,
							inclusive: !0,
							continue: !t.abort
						});
						return;
					}
				}
				a < o && s.issues.push({
					origin: "number",
					input: a,
					code: "too_small",
					minimum: o,
					inclusive: !0,
					inst: e,
					continue: !t.abort
				}), a > i && s.issues.push({
					origin: "number",
					input: a,
					code: "too_big",
					maximum: i,
					inclusive: !0,
					inst: e,
					continue: !t.abort
				});
			};
		}), Gn = c("$ZodCheckMaxLength", (e, t) => {
			var n;
			P.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				t.maximum < o && (r._zod.bag.maximum = t.maximum);
			}), e._zod.check = (r) => {
				const o = r.value;
				if (o.length <= t.maximum) return;
				const i = Ze(o);
				r.issues.push({
					origin: i,
					code: "too_big",
					maximum: t.maximum,
					inclusive: !0,
					input: o,
					inst: e,
					continue: !t.abort
				});
			};
		}), Kn = c("$ZodCheckMinLength", (e, t) => {
			var n;
			P.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				t.minimum > o && (r._zod.bag.minimum = t.minimum);
			}), e._zod.check = (r) => {
				const o = r.value;
				if (o.length >= t.minimum) return;
				const i = Ze(o);
				r.issues.push({
					origin: i,
					code: "too_small",
					minimum: t.minimum,
					inclusive: !0,
					input: o,
					inst: e,
					continue: !t.abort
				});
			};
		}), Yn = c("$ZodCheckLengthEquals", (e, t) => {
			var n;
			P.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag;
				o.minimum = t.length, o.maximum = t.length, o.length = t.length;
			}), e._zod.check = (r) => {
				const o = r.value, i = o.length;
				if (i === t.length) return;
				const s = Ze(o), a = i > t.length;
				r.issues.push({
					origin: s,
					...a ? {
						code: "too_big",
						maximum: t.length
					} : {
						code: "too_small",
						minimum: t.length
					},
					inclusive: !0,
					exact: !0,
					input: r.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), le = c("$ZodCheckStringFormat", (e, t) => {
			var n, r;
			P.init(e, t), e._zod.onattach.push((o) => {
				const i = o._zod.bag;
				i.format = t.format, t.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(t.pattern));
			}), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
				t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
					origin: "string",
					code: "invalid_format",
					format: t.format,
					input: o.value,
					...t.pattern ? { pattern: t.pattern.toString() } : {},
					inst: e,
					continue: !t.abort
				});
			}) : (r = e._zod).check ?? (r.check = () => {});
		}), qn = c("$ZodCheckRegex", (e, t) => {
			le.init(e, t), e._zod.check = (n) => {
				t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: n.value,
					pattern: t.pattern.toString(),
					inst: e,
					continue: !t.abort
				});
			};
		}), Xn = c("$ZodCheckLowerCase", (e, t) => {
			t.pattern ?? (t.pattern = Ln), le.init(e, t);
		}), Hn = c("$ZodCheckUpperCase", (e, t) => {
			t.pattern ?? (t.pattern = Vn), le.init(e, t);
		}), Qn = c("$ZodCheckIncludes", (e, t) => {
			P.init(e, t);
			const n = ie(t.includes), r = new RegExp(typeof t.position == "number" ? "^.{".concat(t.position, "}").concat(n) : n);
			t.pattern = r, e._zod.onattach.push((o) => {
				const i = o._zod.bag;
				i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(r);
			}), e._zod.check = (o) => {
				o.value.includes(t.includes, t.position) || o.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: t.includes,
					input: o.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), er = c("$ZodCheckStartsWith", (e, t) => {
			P.init(e, t);
			const n = new RegExp("^".concat(ie(t.prefix), ".*"));
			t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
				const o = r._zod.bag;
				o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
			}), e._zod.check = (r) => {
				r.value.startsWith(t.prefix) || r.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: t.prefix,
					input: r.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), tr = c("$ZodCheckEndsWith", (e, t) => {
			P.init(e, t);
			const n = new RegExp(".*".concat(ie(t.suffix), "$"));
			t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
				const o = r._zod.bag;
				o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
			}), e._zod.check = (r) => {
				r.value.endsWith(t.suffix) || r.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: t.suffix,
					input: r.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), nr = c("$ZodCheckOverwrite", (e, t) => {
			P.init(e, t), e._zod.check = (n) => {
				n.value = t.tx(n.value);
			};
		});
		var rr = class {
			constructor(e = []) {
				this.content = [], this.indent = 0, this && (this.args = e);
			}
			indented(e) {
				this.indent += 1, e(this), this.indent -= 1;
			}
			write(e) {
				if (typeof e == "function") {
					e(this, { execution: "sync" }), e(this, { execution: "async" });
					return;
				}
				const t = e.split("\n").filter((o) => o), n = Math.min(...t.map((o) => o.length - o.trimStart().length)), r = t.map((o) => o.slice(n)).map((o) => " ".repeat(this.indent * 2) + o);
				for (const o of r) this.content.push(o);
			}
			compile() {
				const e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((r) => "  ".concat(r))];
				return new e(...t, n.join("\n"));
			}
		};
		const or = {
			major: 4,
			minor: 4,
			patch: 3
		}, S = c("$ZodType", (e, t) => {
			var n;
			e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = or;
			const r = [...e._zod.def.checks ?? []];
			e._zod.traits.has("$ZodCheck") && r.unshift(e);
			for (const o of r) for (const i of o._zod.onattach) i(e);
			if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
				e._zod.run = e._zod.parse;
			});
			else {
				const o = (s, a, u) => {
					let l = Y(s), d;
					for (const _ of a) {
						if (_._zod.def.when) {
							if (sn(s) || !_._zod.def.when(s)) continue;
						} else if (l) continue;
						const m = s.issues.length, g = _._zod.check(s);
						if (g instanceof Promise && u?.async === !1) throw new K();
						if (d || g instanceof Promise) d = (d ?? Promise.resolve()).then(async () => {
							await g, s.issues.length !== m && (l || (l = Y(s, m)));
						});
						else {
							if (s.issues.length === m) continue;
							l || (l = Y(s, m));
						}
					}
					return d ? d.then(() => s) : s;
				}, i = (s, a, u) => {
					if (Y(s)) return s.aborted = !0, s;
					const l = o(a, r, u);
					if (l instanceof Promise) {
						if (u.async === !1) throw new K();
						return l.then((d) => e._zod.parse(d, u));
					}
					return e._zod.parse(l, u);
				};
				e._zod.run = (s, a) => {
					if (a.skipChecks) return e._zod.parse(s, a);
					if (a.direction === "backward") {
						const l = e._zod.parse({
							value: s.value,
							issues: []
						}, {
							...a,
							skipChecks: !0
						});
						return l instanceof Promise ? l.then((d) => i(d, s, a)) : i(l, s, a);
					}
					const u = e._zod.parse(s, a);
					if (u instanceof Promise) {
						if (a.async === !1) throw new K();
						return u.then((l) => o(l, r, a));
					}
					return o(u, r, a);
				};
			}
			b(e, "~standard", () => ({
				validate: (o) => {
					try {
						const i = un(e, o);
						return i.success ? { value: i.data } : { issues: i.error?.issues };
					} catch {
						return ln(e, o).then((s) => s.success ? { value: s.data } : { issues: s.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		}), je = c("$ZodString", (e, t) => {
			S.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? Fn(e._zod.bag), e._zod.parse = (n, r) => {
				if (t.coerce) try {
					n.value = String(n.value);
				} catch {}
				return typeof n.value == "string" || n.issues.push({
					expected: "string",
					code: "invalid_type",
					input: n.value,
					inst: e
				}), n;
			};
		}), w = c("$ZodStringFormat", (e, t) => {
			le.init(e, t), je.init(e, t);
		}), sr = c("$ZodGUID", (e, t) => {
			t.pattern ?? (t.pattern = Sn), w.init(e, t);
		}), ir = c("$ZodUUID", (e, t) => {
			if (t.version) {
				const n = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[t.version];
				if (n === void 0) throw new Error("Invalid UUID version: \"".concat(t.version, "\""));
				t.pattern ?? (t.pattern = qe(n));
			} else t.pattern ?? (t.pattern = qe());
			w.init(e, t);
		}), ar = c("$ZodEmail", (e, t) => {
			t.pattern ?? (t.pattern = On), w.init(e, t);
		}), cr = c("$ZodURL", (e, t) => {
			w.init(e, t), e._zod.check = (n) => {
				try {
					const r = n.value.trim();
					if (!t.normalize && t.protocol?.source === An.source && !/^https?:\/\//i.test(r)) {
						n.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid URL format",
							input: n.value,
							inst: e,
							continue: !t.abort
						});
						return;
					}
					const o = new URL(r);
					t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(o.hostname) || n.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid hostname",
						pattern: t.hostname.source,
						input: n.value,
						inst: e,
						continue: !t.abort
					})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || n.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid protocol",
						pattern: t.protocol.source,
						input: n.value,
						inst: e,
						continue: !t.abort
					})), t.normalize ? n.value = o.href : n.value = r;
					return;
				} catch {
					n.issues.push({
						code: "invalid_format",
						format: "url",
						input: n.value,
						inst: e,
						continue: !t.abort
					});
				}
			};
		}), ur = c("$ZodEmoji", (e, t) => {
			t.pattern ?? (t.pattern = En()), w.init(e, t);
		}), lr = c("$ZodNanoID", (e, t) => {
			t.pattern ?? (t.pattern = $n), w.init(e, t);
		}), dr = c("$ZodCUID", (e, t) => {
			t.pattern ?? (t.pattern = bn), w.init(e, t);
		}), fr = c("$ZodCUID2", (e, t) => {
			t.pattern ?? (t.pattern = yn), w.init(e, t);
		}), pr = c("$ZodULID", (e, t) => {
			t.pattern ?? (t.pattern = wn), w.init(e, t);
		}), hr = c("$ZodXID", (e, t) => {
			t.pattern ?? (t.pattern = zn), w.init(e, t);
		}), mr = c("$ZodKSUID", (e, t) => {
			t.pattern ?? (t.pattern = kn), w.init(e, t);
		}), gr = c("$ZodISODateTime", (e, t) => {
			t.pattern ?? (t.pattern = Un(t)), w.init(e, t);
		}), _r = c("$ZodISODate", (e, t) => {
			t.pattern ?? (t.pattern = Rn), w.init(e, t);
		}), vr = c("$ZodISOTime", (e, t) => {
			t.pattern ?? (t.pattern = Dn(t)), w.init(e, t);
		}), br = c("$ZodISODuration", (e, t) => {
			t.pattern ?? (t.pattern = Zn), w.init(e, t);
		}), yr = c("$ZodIPv4", (e, t) => {
			t.pattern ?? (t.pattern = Nn), w.init(e, t), e._zod.bag.format = "ipv4";
		}), wr = c("$ZodIPv6", (e, t) => {
			t.pattern ?? (t.pattern = xn), w.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
				try {
					new URL("http://[".concat(n.value, "]"));
				} catch {
					n.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: n.value,
						inst: e,
						continue: !t.abort
					});
				}
			};
		}), zr = c("$ZodCIDRv4", (e, t) => {
			t.pattern ?? (t.pattern = Pn), w.init(e, t);
		}), kr = c("$ZodCIDRv6", (e, t) => {
			t.pattern ?? (t.pattern = In), w.init(e, t), e._zod.check = (n) => {
				const r = n.value.split("/");
				try {
					if (r.length !== 2) throw new Error();
					const [o, i] = r;
					if (!i) throw new Error();
					const s = Number(i);
					if ("".concat(s) !== i) throw new Error();
					if (s < 0 || s > 128) throw new Error();
					new URL("http://[".concat(o, "]"));
				} catch {
					n.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: n.value,
						inst: e,
						continue: !t.abort
					});
				}
			};
		});
		function rt(e) {
			if (e === "") return !0;
			if (/\s/.test(e) || e.length % 4 !== 0) return !1;
			try {
				return atob(e), !0;
			} catch {
				return !1;
			}
		}
		const $r = c("$ZodBase64", (e, t) => {
			t.pattern ?? (t.pattern = Tn), w.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
				rt(n.value) || n.issues.push({
					code: "invalid_format",
					format: "base64",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		});
		function Zr(e) {
			if (!Xe.test(e)) return !1;
			const t = e.replace(/[-_]/g, (n) => n === "-" ? "+" : "/");
			return rt(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
		}
		const Sr = c("$ZodBase64URL", (e, t) => {
			t.pattern ?? (t.pattern = Xe), w.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
				Zr(n.value) || n.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), Or = c("$ZodE164", (e, t) => {
			t.pattern ?? (t.pattern = Cn), w.init(e, t);
		});
		function jr(e, t = null) {
			try {
				const n = e.split(".");
				if (n.length !== 3) return !1;
				const [r] = n;
				if (!r) return !1;
				const o = JSON.parse(atob(r));
				return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
			} catch {
				return !1;
			}
		}
		const Er = c("$ZodJWT", (e, t) => {
			w.init(e, t), e._zod.check = (n) => {
				jr(n.value, t.alg) || n.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), ot = c("$ZodNumber", (e, t) => {
			S.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Jn, e._zod.parse = (n, r) => {
				if (t.coerce) try {
					n.value = Number(n.value);
				} catch {}
				const o = n.value;
				if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return n;
				const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
				return n.issues.push({
					expected: "number",
					code: "invalid_type",
					input: o,
					inst: e,
					...i ? { received: i } : {}
				}), n;
			};
		}), Nr = c("$ZodNumberFormat", (e, t) => {
			Bn.init(e, t), ot.init(e, t);
		}), xr = c("$ZodUnknown", (e, t) => {
			S.init(e, t), e._zod.parse = (n) => n;
		}), Pr = c("$ZodNever", (e, t) => {
			S.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
				expected: "never",
				code: "invalid_type",
				input: n.value,
				inst: e
			}), n);
		});
		function st(e, t, n) {
			e.issues.length && t.issues.push(...Be(n, e.issues)), t.value[n] = e.value;
		}
		const Ir = c("$ZodArray", (e, t) => {
			S.init(e, t), e._zod.parse = (n, r) => {
				const o = n.value;
				if (!Array.isArray(o)) return n.issues.push({
					expected: "array",
					code: "invalid_type",
					input: o,
					inst: e
				}), n;
				n.value = Array(o.length);
				const i = [];
				for (let s = 0; s < o.length; s++) {
					const a = o[s], u = t.element._zod.run({
						value: a,
						issues: []
					}, r);
					u instanceof Promise ? i.push(u.then((l) => st(l, n, s))) : st(u, n, s);
				}
				return i.length ? Promise.all(i).then(() => n) : n;
			};
		});
		function de(e, t, n, r, o, i) {
			const s = n in r;
			if (e.issues.length) {
				if (o && i && !s) return;
				t.issues.push(...Be(n, e.issues));
			}
			if (!s && !o) {
				e.issues.length || t.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [n]
				});
				return;
			}
			e.value === void 0 ? s && (t.value[n] = void 0) : t.value[n] = e.value;
		}
		function it(e) {
			const t = Object.keys(e.shape);
			for (const r of t) if (!e.shape?.[r]?._zod?.traits?.has("$ZodType")) throw new Error("Invalid element at key \"".concat(r, "\": expected a Zod schema"));
			const n = qt(e.shape);
			return {
				...e,
				keys: t,
				keySet: new Set(t),
				numKeys: t.length,
				optionalKeys: new Set(n)
			};
		}
		function at(e, t, n, r, o, i) {
			const s = [], a = o.keySet, u = o.catchall._zod, l = u.def.type, d = u.optin === "optional", _ = u.optout === "optional";
			for (const m in t) {
				if (m === "__proto__" || a.has(m)) continue;
				if (l === "never") {
					s.push(m);
					continue;
				}
				const g = u.run({
					value: t[m],
					issues: []
				}, r);
				g instanceof Promise ? e.push(g.then((v) => de(v, n, m, t, d, _))) : de(g, n, m, t, d, _);
			}
			return s.length && n.issues.push({
				code: "unrecognized_keys",
				keys: s,
				input: t,
				inst: i
			}), e.length ? Promise.all(e).then(() => n) : n;
		}
		const Tr = c("$ZodObject", (e, t) => {
			if (S.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
				const s = t.shape;
				Object.defineProperty(t, "shape", { get: () => {
					const a = { ...s };
					return Object.defineProperty(t, "shape", { value: a }), a;
				} });
			}
			const n = ze(() => it(t));
			b(e._zod, "propValues", () => {
				const s = t.shape, a = {};
				for (const u in s) {
					const l = s[u]._zod;
					if (l.values) {
						a[u] ?? (a[u] = /* @__PURE__ */ new Set());
						for (const d of l.values) a[u].add(d);
					}
				}
				return a;
			});
			const r = se, o = t.catchall;
			let i;
			e._zod.parse = (s, a) => {
				i ?? (i = n.value);
				const u = s.value;
				if (!r(u)) return s.issues.push({
					expected: "object",
					code: "invalid_type",
					input: u,
					inst: e
				}), s;
				s.value = {};
				const l = [], d = i.shape;
				for (const _ of i.keys) {
					const m = d[_], g = m._zod.optin === "optional", v = m._zod.optout === "optional", k = m._zod.run({
						value: u[_],
						issues: []
					}, a);
					k instanceof Promise ? l.push(k.then((F) => de(F, s, _, u, g, v))) : de(k, s, _, u, g, v);
				}
				return o ? at(l, u, s, a, n.value, e) : l.length ? Promise.all(l).then(() => s) : s;
			};
		}), Ar = c("$ZodObjectJIT", (e, t) => {
			Tr.init(e, t);
			const n = e._zod.parse, r = ze(() => it(t)), o = (m) => {
				const g = new rr([
					"shape",
					"payload",
					"ctx"
				]), v = r.value, k = (T) => {
					const y = Le(T);
					return "shape[".concat(y, "]._zod.run({ value: input[").concat(y, "], issues: [] }, ctx)");
				};
				g.write("const input = payload.value;");
				const F = Object.create(null);
				let _e = 0;
				for (const T of v.keys) F[T] = "key_".concat(_e++);
				g.write("const newResult = {};");
				for (const T of v.keys) {
					const y = F[T], j = Le(T), R = m[T], G = R?._zod?.optin === "optional", ve = R?._zod?.optout === "optional";
					g.write("const ".concat(y, " = ").concat(k(T), ";")), G && ve ? g.write("\n        if (".concat(y, ".issues.length) {\n          if (").concat(j, " in input) {\n            payload.issues = payload.issues.concat(").concat(y, ".issues.map(iss => ({\n              ...iss,\n              path: iss.path ? [").concat(j, ", ...iss.path] : [").concat(j, "]\n            })));\n          }\n        }\n        \n        if (").concat(y, ".value === undefined) {\n          if (").concat(j, " in input) {\n            newResult[").concat(j, "] = undefined;\n          }\n        } else {\n          newResult[").concat(j, "] = ").concat(y, ".value;\n        }\n        \n      ")) : G ? g.write("\n        if (".concat(y, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(y, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(j, ", ...iss.path] : [").concat(j, "]\n          })));\n        }\n        \n        if (").concat(y, ".value === undefined) {\n          if (").concat(j, " in input) {\n            newResult[").concat(j, "] = undefined;\n          }\n        } else {\n          newResult[").concat(j, "] = ").concat(y, ".value;\n        }\n        \n      ")) : g.write("\n        const ".concat(y, "_present = ").concat(j, " in input;\n        if (").concat(y, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(y, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(j, ", ...iss.path] : [").concat(j, "]\n          })));\n        }\n        if (!").concat(y, "_present && !").concat(y, ".issues.length) {\n          payload.issues.push({\n            code: \"invalid_type\",\n            expected: \"nonoptional\",\n            input: undefined,\n            path: [").concat(j, "]\n          });\n        }\n\n        if (").concat(y, "_present) {\n          if (").concat(y, ".value === undefined) {\n            newResult[").concat(j, "] = undefined;\n          } else {\n            newResult[").concat(j, "] = ").concat(y, ".value;\n          }\n        }\n\n      "));
				}
				g.write("payload.value = newResult;"), g.write("return payload;");
				const re = g.compile();
				return (T, y) => re(m, T, y);
			};
			let i;
			const s = se, a = !oe.jitless, l = a && Kt.value, d = t.catchall;
			let _;
			e._zod.parse = (m, g) => {
				_ ?? (_ = r.value);
				const v = m.value;
				return s(v) ? a && l && g?.async === !1 && g.jitless !== !0 ? (i || (i = o(t.shape)), m = i(m, g), d ? at([], v, m, g, _, e) : m) : n(m, g) : (m.issues.push({
					expected: "object",
					code: "invalid_type",
					input: v,
					inst: e
				}), m);
			};
		});
		function ct(e, t, n, r) {
			for (const i of e) if (i.issues.length === 0) return t.value = i.value, t;
			const o = e.filter((i) => !Y(i));
			return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
				code: "invalid_union",
				input: t.value,
				inst: n,
				errors: e.map((i) => i.issues.map((s) => L(s, r, M())))
			}), t);
		}
		const Cr = c("$ZodUnion", (e, t) => {
			S.init(e, t), b(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), b(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), b(e._zod, "values", () => {
				if (t.options.every((r) => r._zod.values)) return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
			}), b(e._zod, "pattern", () => {
				if (t.options.every((r) => r._zod.pattern)) {
					const r = t.options.map((o) => o._zod.pattern);
					return new RegExp("^(".concat(r.map((o) => $e(o.source)).join("|"), ")$"));
				}
			});
			const n = t.options.length === 1 ? t.options[0]._zod.run : null;
			e._zod.parse = (r, o) => {
				if (n) return n(r, o);
				let i = !1;
				const s = [];
				for (const a of t.options) {
					const u = a._zod.run({
						value: r.value,
						issues: []
					}, o);
					if (u instanceof Promise) s.push(u), i = !0;
					else {
						if (u.issues.length === 0) return u;
						s.push(u);
					}
				}
				return i ? Promise.all(s).then((a) => ct(a, r, e, o)) : ct(s, r, e, o);
			};
		}), Rr = c("$ZodIntersection", (e, t) => {
			S.init(e, t), e._zod.parse = (n, r) => {
				const o = n.value, i = t.left._zod.run({
					value: o,
					issues: []
				}, r), s = t.right._zod.run({
					value: o,
					issues: []
				}, r);
				return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([a, u]) => ut(n, a, u)) : ut(n, i, s);
			};
		});
		function Ee(e, t) {
			if (e === t) return {
				valid: !0,
				data: e
			};
			if (e instanceof Date && t instanceof Date && +e == +t) return {
				valid: !0,
				data: e
			};
			if (Q(e) && Q(t)) {
				const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = {
					...e,
					...t
				};
				for (const i of r) {
					const s = Ee(e[i], t[i]);
					if (!s.valid) return {
						valid: !1,
						mergeErrorPath: [i, ...s.mergeErrorPath]
					};
					o[i] = s.data;
				}
				return {
					valid: !0,
					data: o
				};
			}
			if (Array.isArray(e) && Array.isArray(t)) {
				if (e.length !== t.length) return {
					valid: !1,
					mergeErrorPath: []
				};
				const n = [];
				for (let r = 0; r < e.length; r++) {
					const o = e[r], i = t[r], s = Ee(o, i);
					if (!s.valid) return {
						valid: !1,
						mergeErrorPath: [r, ...s.mergeErrorPath]
					};
					n.push(s.data);
				}
				return {
					valid: !0,
					data: n
				};
			}
			return {
				valid: !1,
				mergeErrorPath: []
			};
		}
		function ut(e, t, n) {
			const r = /* @__PURE__ */ new Map();
			let o;
			for (const a of t.issues) if (a.code === "unrecognized_keys") {
				o ?? (o = a);
				for (const u of a.keys) r.has(u) || r.set(u, {}), r.get(u).l = !0;
			} else e.issues.push(a);
			for (const a of n.issues) if (a.code === "unrecognized_keys") for (const u of a.keys) r.has(u) || r.set(u, {}), r.get(u).r = !0;
			else e.issues.push(a);
			const i = [...r].filter(([, a]) => a.l && a.r).map(([a]) => a);
			if (i.length && o && e.issues.push({
				...o,
				keys: i
			}), Y(e)) return e;
			const s = Ee(t.value, n.value);
			if (!s.valid) throw new Error("Unmergable intersection. Error path: ".concat(JSON.stringify(s.mergeErrorPath)));
			return e.value = s.data, e;
		}
		const Dr = c("$ZodEnum", (e, t) => {
			S.init(e, t);
			const n = Me(t.entries), r = new Set(n);
			e._zod.values = r, e._zod.pattern = new RegExp("^(".concat(n.filter((o) => Yt.has(typeof o)).map((o) => typeof o == "string" ? ie(o) : o.toString()).join("|"), ")$")), e._zod.parse = (o, i) => {
				const s = o.value;
				return r.has(s) || o.issues.push({
					code: "invalid_value",
					values: n,
					input: s,
					inst: e
				}), o;
			};
		}), Ur = c("$ZodTransform", (e, t) => {
			S.init(e, t), e._zod.optin = "optional", e._zod.parse = (n, r) => {
				if (r.direction === "backward") throw new Fe(e.constructor.name);
				const o = t.transform(n.value, n);
				if (r.async) return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (n.value = i, n.fallback = !0, n));
				if (o instanceof Promise) throw new K();
				return n.value = o, n.fallback = !0, n;
			};
		});
		function lt(e, t) {
			return t === void 0 && (e.issues.length || e.fallback) ? {
				issues: [],
				value: void 0
			} : e;
		}
		const dt = c("$ZodOptional", (e, t) => {
			S.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", b(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), b(e._zod, "pattern", () => {
				const n = t.innerType._zod.pattern;
				return n ? new RegExp("^(".concat($e(n.source), ")?$")) : void 0;
			}), e._zod.parse = (n, r) => {
				if (t.innerType._zod.optin === "optional") {
					const o = n.value, i = t.innerType._zod.run(n, r);
					return i instanceof Promise ? i.then((s) => lt(s, o)) : lt(i, o);
				}
				return n.value === void 0 ? n : t.innerType._zod.run(n, r);
			};
		}), Fr = c("$ZodExactOptional", (e, t) => {
			dt.init(e, t), b(e._zod, "values", () => t.innerType._zod.values), b(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
		}), Mr = c("$ZodNullable", (e, t) => {
			S.init(e, t), b(e._zod, "optin", () => t.innerType._zod.optin), b(e._zod, "optout", () => t.innerType._zod.optout), b(e._zod, "pattern", () => {
				const n = t.innerType._zod.pattern;
				return n ? new RegExp("^(".concat($e(n.source), "|null)$")) : void 0;
			}), b(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
		}), Jr = c("$ZodDefault", (e, t) => {
			S.init(e, t), e._zod.optin = "optional", b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				if (n.value === void 0) return n.value = t.defaultValue, n;
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((i) => ft(i, t)) : ft(o, t);
			};
		});
		function ft(e, t) {
			return e.value === void 0 && (e.value = t.defaultValue), e;
		}
		const Lr = c("$ZodPrefault", (e, t) => {
			S.init(e, t), e._zod.optin = "optional", b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
		}), Vr = c("$ZodNonOptional", (e, t) => {
			S.init(e, t), b(e._zod, "values", () => {
				const n = t.innerType._zod.values;
				return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
			}), e._zod.parse = (n, r) => {
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((i) => pt(i, e)) : pt(o, e);
			};
		});
		function pt(e, t) {
			return !e.issues.length && e.value === void 0 && e.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: e.value,
				inst: t
			}), e;
		}
		const Wr = c("$ZodCatch", (e, t) => {
			S.init(e, t), e._zod.optin = "optional", b(e._zod, "optout", () => t.innerType._zod.optout), b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
					...n,
					error: { issues: i.issues.map((s) => L(s, r, M())) },
					input: n.value
				}), n.issues = [], n.fallback = !0), n)) : (n.value = o.value, o.issues.length && (n.value = t.catchValue({
					...n,
					error: { issues: o.issues.map((i) => L(i, r, M())) },
					input: n.value
				}), n.issues = [], n.fallback = !0), n);
			};
		}), Br = c("$ZodPipe", (e, t) => {
			S.init(e, t), b(e._zod, "values", () => t.in._zod.values), b(e._zod, "optin", () => t.in._zod.optin), b(e._zod, "optout", () => t.out._zod.optout), b(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, r) => {
				if (r.direction === "backward") {
					const i = t.out._zod.run(n, r);
					return i instanceof Promise ? i.then((s) => fe(s, t.in, r)) : fe(i, t.in, r);
				}
				const o = t.in._zod.run(n, r);
				return o instanceof Promise ? o.then((i) => fe(i, t.out, r)) : fe(o, t.out, r);
			};
		});
		function fe(e, t, n) {
			return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
				value: e.value,
				issues: e.issues,
				fallback: e.fallback
			}, n);
		}
		const Gr = c("$ZodReadonly", (e, t) => {
			S.init(e, t), b(e._zod, "propValues", () => t.innerType._zod.propValues), b(e._zod, "values", () => t.innerType._zod.values), b(e._zod, "optin", () => t.innerType?._zod?.optin), b(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then(ht) : ht(o);
			};
		});
		function ht(e) {
			return e.value = Object.freeze(e.value), e;
		}
		const Kr = c("$ZodCustom", (e, t) => {
			P.init(e, t), S.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
				const r = n.value, o = t.fn(r);
				if (o instanceof Promise) return o.then((i) => mt(i, n, r, e));
				mt(o, n, r, e);
			};
		});
		function mt(e, t, n, r) {
			if (!e) {
				const o = {
					code: "custom",
					input: n,
					inst: r,
					path: [...r._zod.def.path ?? []],
					continue: !r._zod.def.abort
				};
				r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(ee(o));
			}
		}
		var gt, Yr = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
			}
			add(e, ...t) {
				const n = t[0];
				return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
			}
			clear() {
				return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
			}
			remove(e) {
				const t = this._map.get(e);
				return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
			}
			get(e) {
				const t = e._zod.parent;
				if (t) {
					const n = { ...this.get(t) ?? {} };
					delete n.id;
					const r = {
						...n,
						...this._map.get(e)
					};
					return Object.keys(r).length ? r : void 0;
				}
				return this._map.get(e);
			}
			has(e) {
				return this._map.has(e);
			}
		};
		function qr() {
			return new Yr();
		}
		(gt = globalThis).__zod_globalRegistry ?? (gt.__zod_globalRegistry = qr());
		const te = globalThis.__zod_globalRegistry;
		function Xr(e, t) {
			return new e({
				type: "string",
				...h(t)
			});
		}
		function Hr(e, t) {
			return new e({
				type: "string",
				format: "email",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function _t(e, t) {
			return new e({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function Qr(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function eo(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v4",
				...h(t)
			});
		}
		function to(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v6",
				...h(t)
			});
		}
		function no(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v7",
				...h(t)
			});
		}
		function ro(e, t) {
			return new e({
				type: "string",
				format: "url",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function oo(e, t) {
			return new e({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function so(e, t) {
			return new e({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function io(e, t) {
			return new e({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function ao(e, t) {
			return new e({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function co(e, t) {
			return new e({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function uo(e, t) {
			return new e({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function lo(e, t) {
			return new e({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function fo(e, t) {
			return new e({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function po(e, t) {
			return new e({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function ho(e, t) {
			return new e({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function mo(e, t) {
			return new e({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function go(e, t) {
			return new e({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function _o(e, t) {
			return new e({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function vo(e, t) {
			return new e({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function bo(e, t) {
			return new e({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: !1,
				...h(t)
			});
		}
		function yo(e, t) {
			return new e({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: !1,
				local: !1,
				precision: null,
				...h(t)
			});
		}
		function wo(e, t) {
			return new e({
				type: "string",
				format: "date",
				check: "string_format",
				...h(t)
			});
		}
		function zo(e, t) {
			return new e({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...h(t)
			});
		}
		function ko(e, t) {
			return new e({
				type: "string",
				format: "duration",
				check: "string_format",
				...h(t)
			});
		}
		function $o(e, t) {
			return new e({
				type: "number",
				checks: [],
				...h(t)
			});
		}
		function Zo(e, t) {
			return new e({
				type: "number",
				check: "number_format",
				abort: !1,
				format: "safeint",
				...h(t)
			});
		}
		function So(e) {
			return new e({ type: "unknown" });
		}
		function Oo(e, t) {
			return new e({
				type: "never",
				...h(t)
			});
		}
		function vt(e, t) {
			return new tt({
				check: "less_than",
				...h(t),
				value: e,
				inclusive: !1
			});
		}
		function Ne(e, t) {
			return new tt({
				check: "less_than",
				...h(t),
				value: e,
				inclusive: !0
			});
		}
		function bt(e, t) {
			return new nt({
				check: "greater_than",
				...h(t),
				value: e,
				inclusive: !1
			});
		}
		function xe(e, t) {
			return new nt({
				check: "greater_than",
				...h(t),
				value: e,
				inclusive: !0
			});
		}
		function yt(e, t) {
			return new Wn({
				check: "multiple_of",
				...h(t),
				value: e
			});
		}
		function wt(e, t) {
			return new Gn({
				check: "max_length",
				...h(t),
				maximum: e
			});
		}
		function pe(e, t) {
			return new Kn({
				check: "min_length",
				...h(t),
				minimum: e
			});
		}
		function zt(e, t) {
			return new Yn({
				check: "length_equals",
				...h(t),
				length: e
			});
		}
		function jo(e, t) {
			return new qn({
				check: "string_format",
				format: "regex",
				...h(t),
				pattern: e
			});
		}
		function Eo(e) {
			return new Xn({
				check: "string_format",
				format: "lowercase",
				...h(e)
			});
		}
		function No(e) {
			return new Hn({
				check: "string_format",
				format: "uppercase",
				...h(e)
			});
		}
		function xo(e, t) {
			return new Qn({
				check: "string_format",
				format: "includes",
				...h(t),
				includes: e
			});
		}
		function Po(e, t) {
			return new er({
				check: "string_format",
				format: "starts_with",
				...h(t),
				prefix: e
			});
		}
		function Io(e, t) {
			return new tr({
				check: "string_format",
				format: "ends_with",
				...h(t),
				suffix: e
			});
		}
		function q(e) {
			return new nr({
				check: "overwrite",
				tx: e
			});
		}
		function To(e) {
			return q((t) => t.normalize(e));
		}
		function Ao() {
			return q((e) => e.trim());
		}
		function Co() {
			return q((e) => e.toLowerCase());
		}
		function Ro() {
			return q((e) => e.toUpperCase());
		}
		function Do() {
			return q((e) => Gt(e));
		}
		function Uo(e, t, n) {
			return new e({
				type: "array",
				element: t,
				...h(n)
			});
		}
		function Fo(e, t, n) {
			return new e({
				type: "custom",
				check: "custom",
				fn: t,
				...h(n)
			});
		}
		function Mo(e, t) {
			const n = Jo((r) => (r.addIssue = (o) => {
				if (typeof o == "string") r.issues.push(ee(o, r.value, n._zod.def));
				else {
					const i = o;
					i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), i.input ?? (i.input = r.value), i.inst ?? (i.inst = n), i.continue ?? (i.continue = !n._zod.def.abort), r.issues.push(ee(i));
				}
			}, e(r.value, r)), t);
			return n;
		}
		function Jo(e, t) {
			const n = new P({
				check: "custom",
				...h(t)
			});
			return n._zod.check = e, n;
		}
		function kt(e) {
			let t = e?.target ?? "draft-2020-12";
			return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
				processors: e.processors ?? {},
				metadataRegistry: e?.metadata ?? te,
				target: t,
				unrepresentable: e?.unrepresentable ?? "throw",
				override: e?.override ?? (() => {}),
				io: e?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: e?.cycles ?? "ref",
				reused: e?.reused ?? "inline",
				external: e?.external ?? void 0
			};
		}
		function E(e, t, n = {
			path: [],
			schemaPath: []
		}) {
			var r;
			const o = e._zod.def, i = t.seen.get(e);
			if (i) return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
			const s = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: n.path
			};
			t.seen.set(e, s);
			const a = e._zod.toJSONSchema?.();
			if (a) s.schema = a;
			else {
				const l = {
					...n,
					schemaPath: [...n.schemaPath, e],
					path: n.path
				};
				if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, s.schema, l);
				else {
					const _ = s.schema, m = t.processors[o.type];
					if (!m) throw new Error("[toJSONSchema]: Non-representable type encountered: ".concat(o.type));
					m(e, t, _, l);
				}
				const d = e._zod.parent;
				d && (s.ref || (s.ref = d), E(d, t, l), t.seen.get(d).isParent = !0);
			}
			const u = t.metadataRegistry.get(e);
			return u && Object.assign(s.schema, u), t.io === "input" && x(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
		}
		function $t(e, t) {
			const n = e.seen.get(t);
			if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const r = /* @__PURE__ */ new Map();
			for (const s of e.seen.entries()) {
				const a = e.metadataRegistry.get(s[0])?.id;
				if (a) {
					const u = r.get(a);
					if (u && u !== s[0]) throw new Error("Duplicate schema id \"".concat(a, "\" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together."));
					r.set(a, s[0]);
				}
			}
			const o = (s) => {
				const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
				if (e.external) {
					const d = e.external.registry.get(s[0])?.id, _ = e.external.uri ?? ((g) => g);
					if (d) return { ref: _(d) };
					const m = s[1].defId ?? s[1].schema.id ?? "schema".concat(e.counter++);
					return s[1].defId = m, {
						defId: m,
						ref: "".concat(_("__shared"), "#/").concat(a, "/").concat(m)
					};
				}
				if (s[1] === n) return { ref: "#" };
				const u = "#/".concat(a, "/"), l = s[1].schema.id ?? "__schema".concat(e.counter++);
				return {
					defId: l,
					ref: u + l
				};
			}, i = (s) => {
				if (s[1].schema.$ref) return;
				const a = s[1], { ref: u, defId: l } = o(s);
				a.def = { ...a.schema }, l && (a.defId = l);
				const d = a.schema;
				for (const _ in d) delete d[_];
				d.$ref = u;
			};
			if (e.cycles === "throw") for (const s of e.seen.entries()) {
				const a = s[1];
				if (a.cycle) throw new Error("Cycle detected: #/".concat(a.cycle?.join("/"), "/<root>\n\nSet the `cycles` parameter to `\"ref\"` to resolve cyclical schemas with defs."));
			}
			for (const s of e.seen.entries()) {
				const a = s[1];
				if (t === s[0]) {
					i(s);
					continue;
				}
				if (e.external) {
					const u = e.external.registry.get(s[0])?.id;
					if (t !== s[0] && u) {
						i(s);
						continue;
					}
				}
				if (e.metadataRegistry.get(s[0])?.id) {
					i(s);
					continue;
				}
				if (a.cycle) {
					i(s);
					continue;
				}
				if (a.count > 1 && e.reused === "ref") {
					i(s);
					continue;
				}
			}
		}
		function Zt(e, t) {
			const n = e.seen.get(t);
			if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const r = (a) => {
				const u = e.seen.get(a);
				if (u.ref === null) return;
				const l = u.def ?? u.schema, d = { ...l }, _ = u.ref;
				if (u.ref = null, _) {
					r(_);
					const g = e.seen.get(_), v = g.schema;
					if (v.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (l.allOf = l.allOf ?? [], l.allOf.push(v)) : Object.assign(l, v), Object.assign(l, d), a._zod.parent === _) for (const k in l) k === "$ref" || k === "allOf" || k in d || delete l[k];
					if (v.$ref && g.def) for (const k in l) k === "$ref" || k === "allOf" || k in g.def && JSON.stringify(l[k]) === JSON.stringify(g.def[k]) && delete l[k];
				}
				const m = a._zod.parent;
				if (m && m !== _) {
					r(m);
					const g = e.seen.get(m);
					if (g?.schema.$ref && (l.$ref = g.schema.$ref, g.def)) for (const v in l) v === "$ref" || v === "allOf" || v in g.def && JSON.stringify(l[v]) === JSON.stringify(g.def[v]) && delete l[v];
				}
				e.override({
					zodSchema: a,
					jsonSchema: l,
					path: u.path ?? []
				});
			};
			for (const a of [...e.seen.entries()].reverse()) r(a[0]);
			const o = {};
			if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
				const a = e.external.registry.get(t)?.id;
				if (!a) throw new Error("Schema is missing an `id` property");
				o.$id = e.external.uri(a);
			}
			Object.assign(o, n.def ?? n.schema);
			const i = e.metadataRegistry.get(t)?.id;
			i !== void 0 && o.id === i && delete o.id;
			const s = e.external?.defs ?? {};
			for (const a of e.seen.entries()) {
				const u = a[1];
				u.def && u.defId && (u.def.id === u.defId && delete u.def.id, s[u.defId] = u.def);
			}
			e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
			try {
				const a = JSON.parse(JSON.stringify(o));
				return Object.defineProperty(a, "~standard", {
					value: {
						...t["~standard"],
						jsonSchema: {
							input: he(t, "input", e.processors),
							output: he(t, "output", e.processors)
						}
					},
					enumerable: !1,
					writable: !1
				}), a;
			} catch {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function x(e, t) {
			const n = t ?? { seen: /* @__PURE__ */ new Set() };
			if (n.seen.has(e)) return !1;
			n.seen.add(e);
			const r = e._zod.def;
			if (r.type === "transform") return !0;
			if (r.type === "array") return x(r.element, n);
			if (r.type === "set") return x(r.valueType, n);
			if (r.type === "lazy") return x(r.getter(), n);
			if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return x(r.innerType, n);
			if (r.type === "intersection") return x(r.left, n) || x(r.right, n);
			if (r.type === "record" || r.type === "map") return x(r.keyType, n) || x(r.valueType, n);
			if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : x(r.in, n) || x(r.out, n);
			if (r.type === "object") {
				for (const o in r.shape) if (x(r.shape[o], n)) return !0;
				return !1;
			}
			if (r.type === "union") {
				for (const o of r.options) if (x(o, n)) return !0;
				return !1;
			}
			if (r.type === "tuple") {
				for (const o of r.items) if (x(o, n)) return !0;
				return !!(r.rest && x(r.rest, n));
			}
			return !1;
		}
		const Lo = (e, t = {}) => (n) => {
			const r = kt({
				...n,
				processors: t
			});
			return E(e, r), $t(r, e), Zt(r, e);
		}, he = (e, t, n = {}) => (r) => {
			const { libraryOptions: o, target: i } = r ?? {}, s = kt({
				...o ?? {},
				target: i,
				io: t,
				processors: n
			});
			return E(e, s), $t(s, e), Zt(s, e);
		}, Vo = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		}, Wo = (e, t, n, r) => {
			const o = n;
			o.type = "string";
			const { minimum: i, maximum: s, format: a, patterns: u, contentEncoding: l } = e._zod.bag;
			if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = Vo[a] ?? a, o.format === "" && delete o.format, a === "time" && delete o.format), l && (o.contentEncoding = l), u && u.size > 0) {
				const d = [...u];
				d.length === 1 ? o.pattern = d[0].source : d.length > 1 && (o.allOf = [...d.map((_) => ({
					...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: _.source
				}))]);
			}
		}, Bo = (e, t, n, r) => {
			const o = n, { minimum: i, maximum: s, format: a, multipleOf: u, exclusiveMaximum: l, exclusiveMinimum: d } = e._zod.bag;
			typeof a == "string" && a.includes("int") ? o.type = "integer" : o.type = "number";
			const _ = typeof d == "number" && d >= (i ?? Number.NEGATIVE_INFINITY), m = typeof l == "number" && l <= (s ?? Number.POSITIVE_INFINITY), g = t.target === "draft-04" || t.target === "openapi-3.0";
			_ ? g ? (o.minimum = d, o.exclusiveMinimum = !0) : o.exclusiveMinimum = d : typeof i == "number" && (o.minimum = i), m ? g ? (o.maximum = l, o.exclusiveMaximum = !0) : o.exclusiveMaximum = l : typeof s == "number" && (o.maximum = s), typeof u == "number" && (o.multipleOf = u);
		}, Go = (e, t, n, r) => {
			n.not = {};
		}, Yo = (e, t, n, r) => {
			const o = e._zod.def, i = Me(o.entries);
			i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
		}, qo = (e, t, n, r) => {
			if (t.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		}, Xo = (e, t, n, r) => {
			if (t.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		}, Ho = (e, t, n, r) => {
			const o = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
			typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = E(i.element, t, {
				...r,
				path: [...r.path, "items"]
			});
		}, Qo = (e, t, n, r) => {
			const o = n, i = e._zod.def;
			o.type = "object", o.properties = {};
			const s = i.shape;
			for (const l in s) o.properties[l] = E(s[l], t, {
				...r,
				path: [
					...r.path,
					"properties",
					l
				]
			});
			const a = new Set(Object.keys(s)), u = new Set([...a].filter((l) => {
				const d = i.shape[l]._zod;
				return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
			}));
			u.size > 0 && (o.required = Array.from(u)), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = E(i.catchall, t, {
				...r,
				path: [...r.path, "additionalProperties"]
			})) : t.io === "output" && (o.additionalProperties = !1);
		}, es = (e, t, n, r) => {
			const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, u) => E(a, t, {
				...r,
				path: [
					...r.path,
					i ? "oneOf" : "anyOf",
					u
				]
			}));
			i ? n.oneOf = s : n.anyOf = s;
		}, ts = (e, t, n, r) => {
			const o = e._zod.def, i = E(o.left, t, {
				...r,
				path: [
					...r.path,
					"allOf",
					0
				]
			}), s = E(o.right, t, {
				...r,
				path: [
					...r.path,
					"allOf",
					1
				]
			}), a = (u) => "allOf" in u && Object.keys(u).length === 1;
			n.allOf = [...a(i) ? i.allOf : [i], ...a(s) ? s.allOf : [s]];
		}, ns = (e, t, n, r) => {
			const o = e._zod.def, i = E(o.innerType, t, r), s = t.seen.get(e);
			t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
		}, rs = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType;
		}, os = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType, n.default = JSON.parse(JSON.stringify(o.defaultValue));
		}, ss = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
		}, is = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType;
			let s;
			try {
				s = o.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			n.default = s;
		}, as = (e, t, n, r) => {
			const o = e._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
			E(s, t, r);
			const a = t.seen.get(e);
			a.ref = s;
		}, cs = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType, n.readOnly = !0;
		}, St = (e, t, n, r) => {
			const o = e._zod.def;
			E(o.innerType, t, r);
			const i = t.seen.get(e);
			i.ref = o.innerType;
		}, us = c("ZodISODateTime", (e, t) => {
			gr.init(e, t), z.init(e, t);
		});
		function ls(e) {
			return yo(us, e);
		}
		const ds = c("ZodISODate", (e, t) => {
			_r.init(e, t), z.init(e, t);
		});
		function fs(e) {
			return wo(ds, e);
		}
		const ps = c("ZodISOTime", (e, t) => {
			vr.init(e, t), z.init(e, t);
		});
		function hs(e) {
			return zo(ps, e);
		}
		const ms = c("ZodISODuration", (e, t) => {
			br.init(e, t), z.init(e, t);
		});
		function gs(e) {
			return ko(ms, e);
		}
		const I = c("ZodError", (e, t) => {
			Ke.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
				format: { value: (n) => cn(e, n) },
				flatten: { value: (n) => an(e, n) },
				addIssue: { value: (n) => {
					e.issues.push(n), e.message = JSON.stringify(e.issues, we, 2);
				} },
				addIssues: { value: (n) => {
					e.issues.push(...n), e.message = JSON.stringify(e.issues, we, 2);
				} },
				isEmpty: { get() {
					return e.issues.length === 0;
				} }
			});
		}, { Parent: Error }), _s = Se(I), vs = Oe(I), bs = ce(I), ys = ue(I), ws = dn(I), zs = fn(I), ks = pn(I), $s = hn(I), Zs = mn(I), Ss = gn(I), Os = _n(I), js = vn(I), Ot = /* @__PURE__ */ new WeakMap();
		function ne(e, t, n) {
			const r = Object.getPrototypeOf(e);
			let o = Ot.get(r);
			if (o || (o = /* @__PURE__ */ new Set(), Ot.set(r, o)), !o.has(t)) {
				o.add(t);
				for (const i in n) {
					const s = n[i];
					Object.defineProperty(r, i, {
						configurable: !0,
						enumerable: !1,
						get() {
							const a = s.bind(this);
							return Object.defineProperty(this, i, {
								configurable: !0,
								writable: !0,
								enumerable: !0,
								value: a
							}), a;
						},
						set(a) {
							Object.defineProperty(this, i, {
								configurable: !0,
								writable: !0,
								enumerable: !0,
								value: a
							});
						}
					});
				}
			}
		}
		const O = c("ZodType", (e, t) => (S.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
			input: he(e, "input"),
			output: he(e, "output")
		} }), e.toJSONSchema = Lo(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (n, r) => _s(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => bs(e, n, r), e.parseAsync = async (n, r) => vs(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => ys(e, n, r), e.spa = e.safeParseAsync, e.encode = (n, r) => ws(e, n, r), e.decode = (n, r) => zs(e, n, r), e.encodeAsync = async (n, r) => ks(e, n, r), e.decodeAsync = async (n, r) => $s(e, n, r), e.safeEncode = (n, r) => Zs(e, n, r), e.safeDecode = (n, r) => Ss(e, n, r), e.safeEncodeAsync = async (n, r) => Os(e, n, r), e.safeDecodeAsync = async (n, r) => js(e, n, r), ne(e, "ZodType", {
			check(...n) {
				const r = this.def;
				return this.clone(D(r, { checks: [...r.checks ?? [], ...n.map((o) => typeof o == "function" ? { _zod: {
					check: o,
					def: { check: "custom" },
					onattach: []
				} } : o)] }), { parent: !0 });
			},
			with(...n) {
				return this.check(...n);
			},
			clone(n, r) {
				return U(this, n, r);
			},
			brand() {
				return this;
			},
			register(n, r) {
				return n.add(this, r), this;
			},
			refine(n, r) {
				return this.check(bi(n, r));
			},
			superRefine(n, r) {
				return this.check(yi(n, r));
			},
			overwrite(n) {
				return this.check(q(n));
			},
			optional() {
				return At(this);
			},
			exactOptional() {
				return ii(this);
			},
			nullable() {
				return Ct(this);
			},
			nullish() {
				return At(Ct(this));
			},
			nonoptional(n) {
				return fi(this, n);
			},
			array() {
				return ge(this);
			},
			or(n) {
				return ei([this, n]);
			},
			and(n) {
				return ni(this, n);
			},
			transform(n) {
				return Dt(this, oi(n));
			},
			default(n) {
				return ui(this, n);
			},
			prefault(n) {
				return di(this, n);
			},
			catch(n) {
				return hi(this, n);
			},
			pipe(n) {
				return Dt(this, n);
			},
			readonly() {
				return _i(this);
			},
			describe(n) {
				const r = this.clone();
				return te.add(r, { description: n }), r;
			},
			meta(...n) {
				if (n.length === 0) return te.get(this);
				const r = this.clone();
				return te.add(r, n[0]), r;
			},
			isOptional() {
				return this.safeParse(void 0).success;
			},
			isNullable() {
				return this.safeParse(null).success;
			},
			apply(n) {
				return n(this);
			}
		}), Object.defineProperty(e, "description", {
			get() {
				return te.get(e)?.description;
			},
			configurable: !0
		}), e)), jt = c("_ZodString", (e, t) => {
			je.init(e, t), O.init(e, t), e._zod.processJSONSchema = (r, o, i) => Wo(e, r, o, i);
			const n = e._zod.bag;
			e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, ne(e, "_ZodString", {
				regex(...r) {
					return this.check(jo(...r));
				},
				includes(...r) {
					return this.check(xo(...r));
				},
				startsWith(...r) {
					return this.check(Po(...r));
				},
				endsWith(...r) {
					return this.check(Io(...r));
				},
				min(...r) {
					return this.check(pe(...r));
				},
				max(...r) {
					return this.check(wt(...r));
				},
				length(...r) {
					return this.check(zt(...r));
				},
				nonempty(...r) {
					return this.check(pe(1, ...r));
				},
				lowercase(r) {
					return this.check(Eo(r));
				},
				uppercase(r) {
					return this.check(No(r));
				},
				trim() {
					return this.check(Ao());
				},
				normalize(...r) {
					return this.check(To(...r));
				},
				toLowerCase() {
					return this.check(Co());
				},
				toUpperCase() {
					return this.check(Ro());
				},
				slugify() {
					return this.check(Do());
				}
			});
		}), Es = c("ZodString", (e, t) => {
			je.init(e, t), jt.init(e, t), e.email = (n) => e.check(Hr(Ns, n)), e.url = (n) => e.check(ro(xs, n)), e.jwt = (n) => e.check(bo(Bs, n)), e.emoji = (n) => e.check(oo(Ps, n)), e.guid = (n) => e.check(_t(Et, n)), e.uuid = (n) => e.check(Qr(me, n)), e.uuidv4 = (n) => e.check(eo(me, n)), e.uuidv6 = (n) => e.check(to(me, n)), e.uuidv7 = (n) => e.check(no(me, n)), e.nanoid = (n) => e.check(so(Is, n)), e.guid = (n) => e.check(_t(Et, n)), e.cuid = (n) => e.check(io(Ts, n)), e.cuid2 = (n) => e.check(ao(As, n)), e.ulid = (n) => e.check(co(Cs, n)), e.base64 = (n) => e.check(go(Ls, n)), e.base64url = (n) => e.check(_o(Vs, n)), e.xid = (n) => e.check(uo(Rs, n)), e.ksuid = (n) => e.check(lo(Ds, n)), e.ipv4 = (n) => e.check(fo(Us, n)), e.ipv6 = (n) => e.check(po(Fs, n)), e.cidrv4 = (n) => e.check(ho(Ms, n)), e.cidrv6 = (n) => e.check(mo(Js, n)), e.e164 = (n) => e.check(vo(Ws, n)), e.datetime = (n) => e.check(ls(n)), e.date = (n) => e.check(fs(n)), e.time = (n) => e.check(hs(n)), e.duration = (n) => e.check(gs(n));
		});
		function N(e) {
			return Xr(Es, e);
		}
		const z = c("ZodStringFormat", (e, t) => {
			w.init(e, t), jt.init(e, t);
		}), Ns = c("ZodEmail", (e, t) => {
			ar.init(e, t), z.init(e, t);
		}), Et = c("ZodGUID", (e, t) => {
			sr.init(e, t), z.init(e, t);
		}), me = c("ZodUUID", (e, t) => {
			ir.init(e, t), z.init(e, t);
		}), xs = c("ZodURL", (e, t) => {
			cr.init(e, t), z.init(e, t);
		}), Ps = c("ZodEmoji", (e, t) => {
			ur.init(e, t), z.init(e, t);
		}), Is = c("ZodNanoID", (e, t) => {
			lr.init(e, t), z.init(e, t);
		}), Ts = c("ZodCUID", (e, t) => {
			dr.init(e, t), z.init(e, t);
		}), As = c("ZodCUID2", (e, t) => {
			fr.init(e, t), z.init(e, t);
		}), Cs = c("ZodULID", (e, t) => {
			pr.init(e, t), z.init(e, t);
		}), Rs = c("ZodXID", (e, t) => {
			hr.init(e, t), z.init(e, t);
		}), Ds = c("ZodKSUID", (e, t) => {
			mr.init(e, t), z.init(e, t);
		}), Us = c("ZodIPv4", (e, t) => {
			yr.init(e, t), z.init(e, t);
		}), Fs = c("ZodIPv6", (e, t) => {
			wr.init(e, t), z.init(e, t);
		}), Ms = c("ZodCIDRv4", (e, t) => {
			zr.init(e, t), z.init(e, t);
		}), Js = c("ZodCIDRv6", (e, t) => {
			kr.init(e, t), z.init(e, t);
		}), Ls = c("ZodBase64", (e, t) => {
			$r.init(e, t), z.init(e, t);
		}), Vs = c("ZodBase64URL", (e, t) => {
			Sr.init(e, t), z.init(e, t);
		}), Ws = c("ZodE164", (e, t) => {
			Or.init(e, t), z.init(e, t);
		}), Bs = c("ZodJWT", (e, t) => {
			Er.init(e, t), z.init(e, t);
		}), Nt = c("ZodNumber", (e, t) => {
			ot.init(e, t), O.init(e, t), e._zod.processJSONSchema = (r, o, i) => Bo(e, r, o, i), ne(e, "ZodNumber", {
				gt(r, o) {
					return this.check(bt(r, o));
				},
				gte(r, o) {
					return this.check(xe(r, o));
				},
				min(r, o) {
					return this.check(xe(r, o));
				},
				lt(r, o) {
					return this.check(vt(r, o));
				},
				lte(r, o) {
					return this.check(Ne(r, o));
				},
				max(r, o) {
					return this.check(Ne(r, o));
				},
				int(r) {
					return this.check(xt(r));
				},
				safe(r) {
					return this.check(xt(r));
				},
				positive(r) {
					return this.check(bt(0, r));
				},
				nonnegative(r) {
					return this.check(xe(0, r));
				},
				negative(r) {
					return this.check(vt(0, r));
				},
				nonpositive(r) {
					return this.check(Ne(0, r));
				},
				multipleOf(r, o) {
					return this.check(yt(r, o));
				},
				step(r, o) {
					return this.check(yt(r, o));
				},
				finite() {
					return this;
				}
			});
			const n = e._zod.bag;
			e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
		});
		function C(e) {
			return $o(Nt, e);
		}
		const Gs = c("ZodNumberFormat", (e, t) => {
			Nr.init(e, t), Nt.init(e, t);
		});
		function xt(e) {
			return Zo(Gs, e);
		}
		const Ks = c("ZodUnknown", (e, t) => {
			xr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => void 0;
		});
		function Pt() {
			return So(Ks);
		}
		const Ys = c("ZodNever", (e, t) => {
			Pr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Go(e, n, r, o);
		});
		function qs(e) {
			return Oo(Ys, e);
		}
		const Xs = c("ZodArray", (e, t) => {
			Ir.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ho(e, n, r, o), e.element = t.element, ne(e, "ZodArray", {
				min(n, r) {
					return this.check(pe(n, r));
				},
				nonempty(n) {
					return this.check(pe(1, n));
				},
				max(n, r) {
					return this.check(wt(n, r));
				},
				length(n, r) {
					return this.check(zt(n, r));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function ge(e, t) {
			return Uo(Xs, e, t);
		}
		const Hs = c("ZodObject", (e, t) => {
			Ar.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Qo(e, n, r, o), b(e, "shape", () => t.shape), ne(e, "ZodObject", {
				keyof() {
					return It(Object.keys(this._zod.def.shape));
				},
				catchall(n) {
					return this.clone({
						...this._zod.def,
						catchall: n
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: Pt()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: Pt()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: qs()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(n) {
					return en(this, n);
				},
				safeExtend(n) {
					return tn(this, n);
				},
				merge(n) {
					return nn(this, n);
				},
				pick(n) {
					return Ht(this, n);
				},
				omit(n) {
					return Qt(this, n);
				},
				partial(...n) {
					return rn(Tt, this, n[0]);
				},
				required(...n) {
					return on(Rt, this, n[0]);
				}
			});
		});
		function A(e, t) {
			return new Hs({
				type: "object",
				shape: e ?? {},
				...h(t)
			});
		}
		const Qs = c("ZodUnion", (e, t) => {
			Cr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => es(e, n, r, o), e.options = t.options;
		});
		function ei(e, t) {
			return new Qs({
				type: "union",
				options: e,
				...h(t)
			});
		}
		const ti = c("ZodIntersection", (e, t) => {
			Rr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => ts(e, n, r, o);
		});
		function ni(e, t) {
			return new ti({
				type: "intersection",
				left: e,
				right: t
			});
		}
		const Pe = c("ZodEnum", (e, t) => {
			Dr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (r, o, i) => Yo(e, r, o, i), e.enum = t.entries, e.options = Object.values(t.entries);
			const n = new Set(Object.keys(t.entries));
			e.extract = (r, o) => {
				const i = {};
				for (const s of r) if (n.has(s)) i[s] = t.entries[s];
				else throw new Error("Key ".concat(s, " not found in enum"));
				return new Pe({
					...t,
					checks: [],
					...h(o),
					entries: i
				});
			}, e.exclude = (r, o) => {
				const i = { ...t.entries };
				for (const s of r) if (n.has(s)) delete i[s];
				else throw new Error("Key ".concat(s, " not found in enum"));
				return new Pe({
					...t,
					checks: [],
					...h(o),
					entries: i
				});
			};
		});
		function It(e, t) {
			return new Pe({
				type: "enum",
				entries: Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e,
				...h(t)
			});
		}
		const ri = c("ZodTransform", (e, t) => {
			Ur.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Xo(e, n, r, o), e._zod.parse = (n, r) => {
				if (r.direction === "backward") throw new Fe(e.constructor.name);
				n.addIssue = (i) => {
					if (typeof i == "string") n.issues.push(ee(i, n.value, t));
					else {
						const s = i;
						s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ee(s));
					}
				};
				const o = t.transform(n.value, n);
				return o instanceof Promise ? o.then((i) => (n.value = i, n.fallback = !0, n)) : (n.value = o, n.fallback = !0, n);
			};
		});
		function oi(e) {
			return new ri({
				type: "transform",
				transform: e
			});
		}
		const Tt = c("ZodOptional", (e, t) => {
			dt.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => St(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function At(e) {
			return new Tt({
				type: "optional",
				innerType: e
			});
		}
		const si = c("ZodExactOptional", (e, t) => {
			Fr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => St(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function ii(e) {
			return new si({
				type: "optional",
				innerType: e
			});
		}
		const ai = c("ZodNullable", (e, t) => {
			Mr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => ns(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function Ct(e) {
			return new ai({
				type: "nullable",
				innerType: e
			});
		}
		const ci = c("ZodDefault", (e, t) => {
			Jr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => os(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
		});
		function ui(e, t) {
			return new ci({
				type: "default",
				innerType: e,
				get defaultValue() {
					return typeof t == "function" ? t() : We(t);
				}
			});
		}
		const li = c("ZodPrefault", (e, t) => {
			Lr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => ss(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function di(e, t) {
			return new li({
				type: "prefault",
				innerType: e,
				get defaultValue() {
					return typeof t == "function" ? t() : We(t);
				}
			});
		}
		const Rt = c("ZodNonOptional", (e, t) => {
			Vr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => rs(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function fi(e, t) {
			return new Rt({
				type: "nonoptional",
				innerType: e,
				...h(t)
			});
		}
		const pi = c("ZodCatch", (e, t) => {
			Wr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => is(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
		});
		function hi(e, t) {
			return new pi({
				type: "catch",
				innerType: e,
				catchValue: typeof t == "function" ? t : () => t
			});
		}
		const mi = c("ZodPipe", (e, t) => {
			Br.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => as(e, n, r, o), e.in = t.in, e.out = t.out;
		});
		function Dt(e, t) {
			return new mi({
				type: "pipe",
				in: e,
				out: t
			});
		}
		const gi = c("ZodReadonly", (e, t) => {
			Gr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => cs(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function _i(e) {
			return new gi({
				type: "readonly",
				innerType: e
			});
		}
		const vi = c("ZodCustom", (e, t) => {
			Kr.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => qo(e, n, r, o);
		});
		function bi(e, t = {}) {
			return Fo(vi, e, t);
		}
		function yi(e, t) {
			return Mo(e, t);
		}
		function wi({ api: e, t }) {
			const [n, r] = (0, Z.useState)(null), [o, i] = (0, Z.useState)(!1), [s, a] = (0, Z.useState)("pages"), [u, l] = (0, Z.useState)(null), [d, _] = (0, Z.useState)(0), [m, g] = (0, Z.useState)(0), [v, k] = (0, Z.useState)(null), [F, _e] = (0, Z.useState)(null), [re, T] = (0, Z.useState)(""), [y, j] = (0, Z.useState)(null), [R, G] = (0, Z.useState)(null), [ve, X] = (0, Z.useState)(null), [Jt, ji] = (0, Z.useState)(0), [Lt, Vt] = (0, Z.useState)(""), [Te, Wt] = (0, Z.useState)(""), be = (0, Z.useRef)(null), Ae = () => {
				ji((f) => f + 1);
			}, ye = (f) => f instanceof Error ? f.message : t("error");
			(0, Z.useEffect)(() => {
				const f = new AbortController();
				return be.current = f, () => {
					f.abort(), be.current = null;
				};
			}, []), (0, Z.useEffect)(() => {
				const f = new AbortController();
				return i(!1), r(null), e.status(f.signal).then(($) => {
					f.signal.aborted || r($);
				}, () => {
					f.signal.aborted || i(!0);
				}), () => {
					f.abort();
				};
			}, [e, Jt]), (0, Z.useEffect)(() => {
				const f = new AbortController();
				return l(null), s !== "search" && (s === "pages" ? e.pages(f.signal).then(($) => ({
					items: $.items,
					total: 0
				})) : e.notes(50, m, f.signal)).then(($) => {
					f.signal.aborted || (l($.items), _($.total));
				}, ($) => {
					f.signal.aborted || (l([]), X(ye($)));
				}), () => {
					f.abort();
				};
			}, [
				e,
				s,
				m,
				Jt
			]), (0, Z.useEffect)(() => {
				const f = new AbortController();
				return _e(null), v && (v.kind === "note" ? e.note(v.id, f.signal) : e.page(v.id, f.signal)).then(($) => {
					f.signal.aborted || _e("note" in $ ? $.note : $.page);
				}, ($) => {
					f.signal.aborted || X(ye($));
				}), () => {
					f.abort();
				};
			}, [e, v]);
			async function Ei() {
				const f = be.current?.signal;
				if (!(!f || R)) {
					G("save");
					try {
						const $ = await e.saveNote(Lt, Te, f);
						if (f.aborted) return;
						Vt(""), Wt(""), X(t("saved", { n: $.name })), Ae();
					} catch ($) {
						f.aborted || X(ye($));
					} finally {
						f.aborted || G(null);
					}
				}
			}
			async function Ni() {
				const f = be.current?.signal;
				if (!(!f || R)) {
					G("search"), j(null);
					try {
						const $ = await e.search(re, f);
						f.aborted || j($.results);
					} catch ($) {
						f.aborted || X(ye($));
					} finally {
						f.aborted || G(null);
					}
				}
			}
			function Ce(f) {
				a(f), k(null), X(null);
			}
			return (0, p.jsxs)("div", {
				"data-dsh-memory": "",
				"aria-busy": R !== null,
				children: [
					n ? (0, p.jsxs)("section", {
						className: "dsm-card",
						children: [(0, p.jsxs)("div", {
							className: "dsm-head",
							children: [
								(0, p.jsx)("h3", { children: t("statusTitle") }),
								(0, p.jsx)("span", { children: t("badgeOk") }),
								(0, p.jsx)("button", {
									type: "button",
									onClick: Ae,
									disabled: R !== null,
									children: t("refresh")
								})
							]
						}), (0, p.jsxs)("dl", { children: [
							(0, p.jsx)("dt", { children: t("store") }),
							(0, p.jsx)("dd", { children: n.store }),
							(0, p.jsx)("dt", { children: t("countPages") }),
							(0, p.jsx)("dd", { children: n.counts.pages }),
							(0, p.jsx)("dt", { children: t("countNotes") }),
							(0, p.jsx)("dd", { children: n.counts.notes }),
							(0, p.jsx)("dt", { children: t("bytes") }),
							(0, p.jsx)("dd", { children: t("size", { n: n.bytes }) })
						] })]
					}) : o ? (0, p.jsxs)("section", {
						className: "dsm-card",
						children: [(0, p.jsx)("p", {
							role: "alert",
							children: t("error")
						}), (0, p.jsx)("button", {
							type: "button",
							onClick: Ae,
							children: t("retry")
						})]
					}) : (0, p.jsx)("p", { children: t("loading") }),
					ve ? (0, p.jsx)("p", {
						role: "status",
						children: ve
					}) : null,
					(0, p.jsxs)("section", {
						className: "dsm-card",
						children: [(0, p.jsxs)("div", {
							className: "dsm-row",
							children: [
								(0, p.jsx)("button", {
									type: "button",
									"data-active": s === "pages",
									onClick: () => {
										Ce("pages");
									},
									children: t("viewPages")
								}),
								(0, p.jsx)("button", {
									type: "button",
									"data-active": s === "notes",
									onClick: () => {
										Ce("notes");
									},
									children: t("viewNotes")
								}),
								(0, p.jsx)("button", {
									type: "button",
									"data-active": s === "search",
									onClick: () => {
										Ce("search");
									},
									children: t("viewSearch")
								})
							]
						}), v ? (0, p.jsxs)("div", { children: [
							(0, p.jsx)("button", {
								type: "button",
								onClick: () => {
									k(null);
								},
								children: t("back")
							}),
							(0, p.jsx)("h3", { children: F?.name ?? t("pageDetail") }),
							(0, p.jsx)("pre", { children: F ? F.content || t("emptyContent") : t("loading") })
						] }) : s === "search" ? (0, p.jsxs)("div", { children: [(0, p.jsxs)("div", {
							className: "dsm-row",
							children: [(0, p.jsx)("input", {
								type: "text",
								value: re,
								placeholder: t("searchPlaceholder"),
								"aria-label": t("searchPlaceholder"),
								onChange: (f) => {
									T(f.target.value);
								}
							}), (0, p.jsx)("button", {
								type: "button",
								disabled: R !== null || !re.trim(),
								onClick: () => {
									Ni();
								},
								children: t("searchBtn")
							})]
						}), y === null ? (0, p.jsx)("p", {
							className: "dsm-empty",
							children: t("searchEmpty")
						}) : y.length === 0 ? (0, p.jsx)("p", { children: t("resultsNone") }) : (0, p.jsx)("ul", {
							className: "dsm-list",
							children: y.map((f) => (0, p.jsx)("li", { children: (0, p.jsxs)("button", {
								type: "button",
								className: "dsm-item",
								onClick: () => {
									k({
										kind: f.kind,
										id: f.id
									});
								},
								children: [(0, p.jsx)("strong", { children: f.name }), (0, p.jsx)("span", {
									className: "dsm-meta",
									children: f.snippet
								})]
							}) }, "".concat(f.kind, ":").concat(f.id)))
						})] }) : (0, p.jsxs)("div", { children: [
							s === "notes" ? (0, p.jsxs)("section", {
								className: "dsm-card",
								children: [
									(0, p.jsx)("h3", { children: t("writeNote") }),
									(0, p.jsx)("input", {
										type: "text",
										value: Lt,
										placeholder: t("writeTitlePlaceholder"),
										"aria-label": t("writeTitlePlaceholder"),
										onChange: (f) => {
											Vt(f.target.value);
										}
									}),
									(0, p.jsx)("textarea", {
										rows: 3,
										value: Te,
										placeholder: t("writeTextPlaceholder"),
										"aria-label": t("writeTextPlaceholder"),
										onChange: (f) => {
											Wt(f.target.value);
										}
									}),
									(0, p.jsx)("button", {
										type: "button",
										disabled: R !== null || !Te.trim(),
										onClick: () => {
											Ei();
										},
										children: t(R === "save" ? "loading" : "save")
									}),
									(0, p.jsx)("p", { children: t("noteTotal", { n: d }) })
								]
							}) : null,
							u === null ? (0, p.jsx)("p", { children: t("loading") }) : u.length === 0 ? (0, p.jsx)("p", { children: t(s === "notes" ? "notesEmpty" : "pagesEmpty") }) : (0, p.jsx)("ul", {
								className: "dsm-list",
								children: u.map((f) => (0, p.jsx)("li", { children: (0, p.jsxs)("button", {
									type: "button",
									className: "dsm-item",
									onClick: () => {
										k({
											kind: s === "notes" ? "note" : "page",
											id: f.id
										});
									},
									children: [(0, p.jsx)("strong", { children: f.name }), (0, p.jsx)("span", {
										className: "dsm-meta",
										children: f.id
									})]
								}) }, f.id))
							}),
							s === "notes" ? (0, p.jsxs)("div", {
								className: "dsm-row",
								children: [(0, p.jsx)("button", {
									type: "button",
									disabled: m === 0,
									onClick: () => {
										g((f) => Math.max(0, f - 50));
									},
									children: t("prev")
								}), (0, p.jsx)("button", {
									type: "button",
									disabled: m + 50 >= d,
									onClick: () => {
										g((f) => f + 50);
									},
									children: t("next")
								})]
							}) : null
						] })]
					})
				]
			});
		}
		const zi = {
			tab: "Memory",
			loading: "Loading…",
			error: "Failed to read memory",
			refresh: "Refresh",
			retry: "Retry",
			statusTitle: "Local memory",
			store: "Store",
			countPages: "Pages",
			countNotes: "Notes",
			bytes: "Size",
			size: "{n} bytes",
			viewPages: "Pages",
			viewNotes: "Notes",
			viewSearch: "Search",
			pagesEmpty: "No knowledge pages in the configured store.",
			notesEmpty: "No memory notes",
			noteTotal: "{n} notes",
			prev: "Previous",
			next: "Next",
			back: "Back to list",
			pageDetail: "Content",
			emptyContent: "(empty)",
			searchPlaceholder: "Search memory…",
			searchBtn: "Search",
			searchEmpty: "Type keywords to search pages and notes",
			resultsNone: "No matching memories",
			writeNote: "Write a note",
			writeTitlePlaceholder: "Title (optional)",
			writeTextPlaceholder: "Memory content…",
			save: "Save",
			saved: "Saved: {n}",
			badgeOk: "local"
		}, ki = {
			tab: "记忆",
			loading: "加载中…",
			error: "读取记忆失败",
			refresh: "刷新",
			retry: "重试",
			statusTitle: "本地记忆存储",
			store: "存储位置",
			countPages: "知识页",
			countNotes: "记忆条目",
			bytes: "占用空间",
			size: "{n} 字节",
			viewPages: "知识页",
			viewNotes: "记忆条目",
			viewSearch: "搜索",
			pagesEmpty: "配置的存储目录中暂无知识页。",
			notesEmpty: "暂无记忆条目",
			noteTotal: "共 {n} 条",
			prev: "上一页",
			next: "下一页",
			back: "返回列表",
			pageDetail: "内容",
			emptyContent: "（空）",
			searchPlaceholder: "搜索记忆内容…",
			searchBtn: "搜索",
			searchEmpty: "输入关键词搜索知识页与记忆条目",
			resultsNone: "没有匹配的记忆",
			writeNote: "写一条记忆",
			writeTitlePlaceholder: "标题（可选）",
			writeTextPlaceholder: "记忆内容…",
			save: "保存",
			saved: "已保存：{n}",
			badgeOk: "本地"
		}, $i = "\n[data-dsh-memory] { display:flex; flex-direction:column; gap:12px; max-width:860px; min-width:0; color:var(--dsw-alias-label-primary); }\n[data-dsh-memory] .dsm-card { border:1px solid var(--dsw-alias-border); border-radius:10px; padding:12px 14px; background:var(--dsw-alias-bg-layer-1); }\n[data-dsh-memory] .dsm-head, [data-dsh-memory] .dsm-row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }\n[data-dsh-memory] .dsm-head { justify-content:space-between; margin-bottom:8px; }\n[data-dsh-memory] h3 { margin:0; font-size:14px; }\n[data-dsh-memory] dl { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; margin:8px 0 0; font-size:13px; }\n[data-dsh-memory] dd { margin:0; overflow-wrap:anywhere; }\n[data-dsh-memory] dt, [data-dsh-memory] .dsm-meta, [data-dsh-memory] .dsm-empty { color:var(--dsw-alias-label-tertiary); }\n[data-dsh-memory] input, [data-dsh-memory] textarea, [data-dsh-memory] button { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); border:1px solid var(--dsw-alias-border); border-radius:6px; padding:6px 8px; font-size:13px; min-width:0; }\n[data-dsh-memory] input, [data-dsh-memory] textarea { width:100%; box-sizing:border-box; }\n[data-dsh-memory] textarea { resize:vertical; }\n[data-dsh-memory] button { cursor:pointer; }\n[data-dsh-memory] button:disabled { opacity:.5; cursor:default; }\n[data-dsh-memory] button[data-active=true] { border-color:var(--dsw-alias-primary); }\n[data-dsh-memory] .dsm-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }\n[data-dsh-memory] .dsm-item { width:100%; text-align:start; display:flex; flex-direction:column; overflow-wrap:anywhere; }\n[data-dsh-memory] pre { white-space:pre-wrap; overflow-wrap:anywhere; max-height:520px; overflow:auto; font-size:12px; }\n";
		function Zi() {
			const e = document.createElement("style");
			return e.dataset.dshMemory = "", e.textContent = $i, document.head.append(e), () => {
				e.remove();
			};
		}
		const V = "@dsh-selfuse/memory-panel", Si = [
			"slots",
			"locale",
			"remote"
		], Ie = "settings.memoryPanel", Ut = A({
			id: N(),
			name: N(),
			size: C().int().nonnegative()
		}), Ft = A({
			id: N(),
			name: N(),
			content: N()
		});
		function W(e, t, n) {
			return Object.freeze({
				id: "".concat(V, "#memoryPanel/").concat(e),
				service: "memoryPanel",
				namespace: "memoryPanel",
				method: e,
				invocation: Object.freeze({ kind: "direct" }),
				parameters: Object.freeze(Object.entries(t).map(([r, o]) => Object.freeze({
					name: r,
					wire: r,
					source: "json",
					codec: Object.freeze({
						mode: "strict",
						typeSymbol: "".concat(V, "/types#").concat(r),
						create: () => o
					})
				}))),
				cancellation: Object.freeze({ parameter: "signal" }),
				result: Object.freeze({
					mode: "strict",
					typeSymbol: "".concat(V, "/types#").concat(e),
					create: () => n
				})
			});
		}
		const Mt = Object.freeze({
			package: V,
			descriptors: Object.freeze([
				W("status", {}, A({
					store: N(),
					counts: A({
						pages: C().int(),
						notes: C().int()
					}),
					bytes: C().int()
				})),
				W("pages", {}, A({ items: ge(Ut) })),
				W("page", { id: N() }, A({ page: Ft })),
				W("notes", {
					limit: C().int().min(1).max(500),
					offset: C().int().min(0).max(1e5)
				}, A({
					items: ge(Ut.extend({ mtime: C() })),
					total: C().int(),
					limit: C().int(),
					offset: C().int()
				})),
				W("note", { id: N() }, A({ note: Ft })),
				W("search", { query: N().max(1024) }, A({ results: ge(A({
					id: N(),
					kind: It(["page", "note"]),
					name: N(),
					snippet: N()
				})) })),
				W("saveNote", {
					title: N(),
					text: N()
				}, A({
					id: N(),
					name: N(),
					path: N()
				}))
			])
		});
		function B(e) {
			if (!e.ok) throw new Error("".concat(e.error.code, ": ").concat(e.error.message));
			return e.value;
		}
		async function Oi(e) {
			e.effect(() => e.locale.register(Ie, {
				en: zi,
				zh: ki
			}), "".concat(V, ": dictionaries")), e.effect(() => Zi(), "".concat(V, ": stylesheet")), await e.remote.$mount(Mt), e.inject(["remote.memoryPanel"], (t) => {
				const n = t.remote.memoryPanel, r = {
					status: async (i) => B(await n.status(i)),
					pages: async (i) => B(await n.pages(i)),
					page: async (i, s) => B(await n.page(i, s)),
					notes: async (i, s, a) => B(await n.notes(i, s, a)),
					note: async (i, s) => B(await n.note(i, s)),
					search: async (i, s) => B(await n.search(i, s)),
					saveNote: async (i, s, a) => B(await n.saveNote(i, s, a))
				}, o = t.locale.bind(Ie);
				t.slots.inject("settings.plugins.tab", () => t.slots.register({
					name: "settings.plugins.tab",
					id: "memory",
					order: 45,
					label: () => o("tab"),
					locale: Ie,
					inject: () => ({ api: r })
				}, wi));
			});
		}
		return H.MEMORY_REMOTE = Mt, H.apply = Oi, H.inject = Si, H.name = V, De.exports;
	}
});

//# sourceMappingURL=client.js.map