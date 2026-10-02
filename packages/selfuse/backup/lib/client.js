window.__ModuleLoader__.load({
	id: "@dsh-selfuse/backup",
	factory: (Pe) => {
		var Te = { exports: {} }, Y = Te.exports;
		Object.defineProperty(Y, Symbol.toStringTag, { value: "Module" });
		let A = Pe("react"), p = Pe("react/jsx-runtime");
		var Ae;
		function c(e, t, n) {
			function r(a, u) {
				if (a._zod || Object.defineProperty(a, "_zod", {
					value: {
						def: u,
						constr: i,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: !1
				}), a._zod.traits.has(e)) return;
				a._zod.traits.add(e), t(a, u);
				const l = i.prototype, d = Object.keys(l);
				for (let g = 0; g < d.length; g++) {
					const m = d[g];
					m in a || (a[m] = l[m].bind(a));
				}
			}
			const o = n?.Parent ?? Object;
			class s extends o {}
			Object.defineProperty(s, "name", { value: e });
			function i(a) {
				var u;
				const l = n?.Parent ? new s() : this;
				r(l, a), (u = l._zod).deferred ?? (u.deferred = []);
				for (const d of l._zod.deferred) d();
				return l;
			}
			return Object.defineProperty(i, "init", { value: r }), Object.defineProperty(i, Symbol.hasInstance, { value: (a) => n?.Parent && a instanceof n.Parent ? !0 : a?._zod?.traits?.has(e) }), Object.defineProperty(i, "name", { value: e }), i;
		}
		var q = class extends Error {
			constructor() {
				super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
			}
		}, Re = class extends Error {
			constructor(e) {
				super("Encountered unidirectional transform during encode: ".concat(e)), this.name = "ZodEncodeError";
			}
		};
		(Ae = globalThis).__zod_globalConfig ?? (Ae.__zod_globalConfig = {});
		const ie = globalThis.__zod_globalConfig;
		function G(e) {
			return e && Object.assign(ie, e), ie;
		}
		function Ce(e) {
			const t = Object.values(e).filter((n) => typeof n == "number");
			return Object.entries(e).filter(([n, r]) => t.indexOf(+n) === -1).map(([n, r]) => r);
		}
		function ve(e, t) {
			return typeof t == "bigint" ? t.toString() : t;
		}
		function ye(e) {
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
		function we(e) {
			const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
			return e.slice(t, n);
		}
		function Ct(e, t) {
			const n = e / t, r = Math.round(n), o = Number.EPSILON * Math.max(Math.abs(n), 1);
			return Math.abs(n - r) < o ? 0 : n - r;
		}
		const De = Symbol("evaluating");
		function _(e, t, n) {
			let r;
			Object.defineProperty(e, t, {
				get() {
					if (r !== De) return r === void 0 && (r = De, r = n()), r;
				},
				set(o) {
					Object.defineProperty(e, t, { value: o });
				},
				configurable: !0
			});
		}
		function W(e, t, n) {
			Object.defineProperty(e, t, {
				value: n,
				writable: !0,
				enumerable: !0,
				configurable: !0
			});
		}
		function J(...e) {
			const t = {};
			for (const n of e) Object.assign(t, Object.getOwnPropertyDescriptors(n));
			return Object.defineProperties({}, t);
		}
		function Ue(e) {
			return JSON.stringify(e);
		}
		function Dt(e) {
			return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const Fe = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
		function ae(e) {
			return typeof e == "object" && e !== null && !Array.isArray(e);
		}
		const Ut = ye(() => {
			if (ie.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
			try {
				return new Function(""), !0;
			} catch {
				return !1;
			}
		});
		function te(e) {
			if (ae(e) === !1) return !1;
			const t = e.constructor;
			if (t === void 0 || typeof t != "function") return !0;
			const n = t.prototype;
			return !(ae(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
		}
		function Me(e) {
			return te(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
		}
		const Ft = new Set([
			"string",
			"number",
			"symbol"
		]);
		function ce(e) {
			return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function B(e, t, n) {
			const r = new e._zod.constr(t ?? e._zod.def);
			return (!t || n?.parent) && (r._zod.parent = e), r;
		}
		function f(e) {
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
		function Mt(e) {
			return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
		}
		const Lt = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function Jt(e, t) {
			const n = e._zod.def, r = n.checks;
			if (r && r.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return B(e, J(e._zod.def, {
				get shape() {
					const o = {};
					for (const s in t) {
						if (!(s in n.shape)) throw new Error("Unrecognized key: \"".concat(s, "\""));
						t[s] && (o[s] = n.shape[s]);
					}
					return W(this, "shape", o), o;
				},
				checks: []
			}));
		}
		function Bt(e, t) {
			const n = e._zod.def, r = n.checks;
			if (r && r.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return B(e, J(e._zod.def, {
				get shape() {
					const o = { ...e._zod.def.shape };
					for (const s in t) {
						if (!(s in n.shape)) throw new Error("Unrecognized key: \"".concat(s, "\""));
						t[s] && delete o[s];
					}
					return W(this, "shape", o), o;
				},
				checks: []
			}));
		}
		function Vt(e, t) {
			if (!te(t)) throw new Error("Invalid input to extend: expected a plain object");
			const n = e._zod.def.checks;
			if (n && n.length > 0) {
				const r = e._zod.def.shape;
				for (const o in t) if (Object.getOwnPropertyDescriptor(r, o) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return B(e, J(e._zod.def, { get shape() {
				const r = {
					...e._zod.def.shape,
					...t
				};
				return W(this, "shape", r), r;
			} }));
		}
		function Gt(e, t) {
			if (!te(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return B(e, J(e._zod.def, { get shape() {
				const n = {
					...e._zod.def.shape,
					...t
				};
				return W(this, "shape", n), n;
			} }));
		}
		function Wt(e, t) {
			if (e._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return B(e, J(e._zod.def, {
				get shape() {
					const n = {
						...e._zod.def.shape,
						...t._zod.def.shape
					};
					return W(this, "shape", n), n;
				},
				get catchall() {
					return t._zod.def.catchall;
				},
				checks: t._zod.def.checks ?? []
			}));
		}
		function Ht(e, t, n) {
			const r = t._zod.def.checks;
			if (r && r.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return B(t, J(t._zod.def, {
				get shape() {
					const o = t._zod.def.shape, s = { ...o };
					if (n) for (const i in n) {
						if (!(i in o)) throw new Error("Unrecognized key: \"".concat(i, "\""));
						n[i] && (s[i] = e ? new e({
							type: "optional",
							innerType: o[i]
						}) : o[i]);
					}
					else for (const i in o) s[i] = e ? new e({
						type: "optional",
						innerType: o[i]
					}) : o[i];
					return W(this, "shape", s), s;
				},
				checks: []
			}));
		}
		function Kt(e, t, n) {
			return B(t, J(t._zod.def, { get shape() {
				const r = t._zod.def.shape, o = { ...r };
				if (n) for (const s in n) {
					if (!(s in o)) throw new Error("Unrecognized key: \"".concat(s, "\""));
					n[s] && (o[s] = new e({
						type: "nonoptional",
						innerType: r[s]
					}));
				}
				else for (const s in r) o[s] = new e({
					type: "nonoptional",
					innerType: r[s]
				});
				return W(this, "shape", o), o;
			} }));
		}
		function X(e, t = 0) {
			if (e.aborted === !0) return !0;
			for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
			return !1;
		}
		function Yt(e, t = 0) {
			if (e.aborted === !0) return !0;
			for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
			return !1;
		}
		function Le(e, t) {
			return t.map((n) => {
				var r;
				return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
			});
		}
		function ue(e) {
			return typeof e == "string" ? e : e?.message;
		}
		function H(e, t, n) {
			const r = e.message ? e.message : ue(e.inst?._zod.def?.error?.(e)) ?? ue(t?.error?.(e)) ?? ue(n.customError?.(e)) ?? ue(n.localeError?.(e)) ?? "Invalid input", { inst: o, continue: s, input: i, ...a } = e;
			return a.path ?? (a.path = []), a.message = r, t?.reportInput && (a.input = i), a;
		}
		function ze(e) {
			return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
		}
		function ne(...e) {
			const [t, n, r] = e;
			return typeof t == "string" ? {
				message: t,
				code: "custom",
				input: n,
				inst: r
			} : { ...t };
		}
		const Je = (e, t) => {
			e.name = "$ZodError", Object.defineProperty(e, "_zod", {
				value: e._zod,
				enumerable: !1
			}), Object.defineProperty(e, "issues", {
				value: t,
				enumerable: !1
			}), e.message = JSON.stringify(t, ve, 2), Object.defineProperty(e, "toString", {
				value: () => e.message,
				enumerable: !1
			});
		}, Be = c("$ZodError", Je), Ve = c("$ZodError", Je, { Parent: Error });
		function qt(e, t = (n) => n.message) {
			const n = {}, r = [];
			for (const o of e.issues) o.path.length > 0 ? (n[o.path[0]] = n[o.path[0]] || [], n[o.path[0]].push(t(o))) : r.push(t(o));
			return {
				formErrors: r,
				fieldErrors: n
			};
		}
		function Xt(e, t = (n) => n.message) {
			const n = { _errors: [] }, r = (o, s = []) => {
				for (const i of o.issues) if (i.code === "invalid_union" && i.errors.length) i.errors.map((a) => r({ issues: a }, [...s, ...i.path]));
				else if (i.code === "invalid_key") r({ issues: i.issues }, [...s, ...i.path]);
				else if (i.code === "invalid_element") r({ issues: i.issues }, [...s, ...i.path]);
				else {
					const a = [...s, ...i.path];
					if (a.length === 0) n._errors.push(t(i));
					else {
						let u = n, l = 0;
						for (; l < a.length;) {
							const d = a[l];
							l !== a.length - 1 ? u[d] = u[d] || { _errors: [] } : (u[d] = u[d] || { _errors: [] }, u[d]._errors.push(t(i))), u = u[d], l++;
						}
					}
				}
			};
			return r(e), n;
		}
		const $e = (e) => (t, n, r, o) => {
			const s = r ? {
				...r,
				async: !1
			} : { async: !1 }, i = t._zod.run({
				value: n,
				issues: []
			}, s);
			if (i instanceof Promise) throw new q();
			if (i.issues.length) {
				const a = new ((o?.Err) ?? e)(i.issues.map((u) => H(u, s, G())));
				throw Fe(a, o?.callee), a;
			}
			return i.value;
		}, Ze = (e) => async (t, n, r, o) => {
			const s = r ? {
				...r,
				async: !0
			} : { async: !0 };
			let i = t._zod.run({
				value: n,
				issues: []
			}, s);
			if (i instanceof Promise && (i = await i), i.issues.length) {
				const a = new ((o?.Err) ?? e)(i.issues.map((u) => H(u, s, G())));
				throw Fe(a, o?.callee), a;
			}
			return i.value;
		}, le = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				async: !1
			} : { async: !1 }, s = t._zod.run({
				value: n,
				issues: []
			}, o);
			if (s instanceof Promise) throw new q();
			return s.issues.length ? {
				success: !1,
				error: new (e ?? Be)(s.issues.map((i) => H(i, o, G())))
			} : {
				success: !0,
				data: s.value
			};
		}, Qt = le(Ve), de = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				async: !0
			} : { async: !0 };
			let s = t._zod.run({
				value: n,
				issues: []
			}, o);
			return s instanceof Promise && (s = await s), s.issues.length ? {
				success: !1,
				error: new e(s.issues.map((i) => H(i, o, G())))
			} : {
				success: !0,
				data: s.value
			};
		}, en = de(Ve), tn = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return $e(e)(t, n, o);
		}, nn = (e) => (t, n, r) => $e(e)(t, n, r), rn = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return Ze(e)(t, n, o);
		}, on = (e) => async (t, n, r) => Ze(e)(t, n, r), sn = (e) => (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return le(e)(t, n, o);
		}, an = (e) => (t, n, r) => le(e)(t, n, r), cn = (e) => async (t, n, r) => {
			const o = r ? {
				...r,
				direction: "backward"
			} : { direction: "backward" };
			return de(e)(t, n, o);
		}, un = (e) => async (t, n, r) => de(e)(t, n, r), ln = /^[cC][0-9a-z]{6,}$/, dn = /^[0-9a-z]+$/, pn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, fn = /^[0-9a-vA-V]{20}$/, hn = /^[A-Za-z0-9]{27}$/, mn = /^[a-zA-Z0-9_-]{21}$/, bn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, gn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Ge = (e) => e ? new RegExp("^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-".concat(e, "[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$")) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, _n = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, vn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
		function yn() {
			return new RegExp(vn, "u");
		}
		const kn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, wn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, zn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, $n = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Zn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, We = /^[A-Za-z0-9_-]*$/, Sn = /^https?$/, xn = /^\+[1-9]\d{6,14}$/, He = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", On = new RegExp("^".concat(He, "$"));
		function Ke(e) {
			const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
			return typeof e.precision == "number" ? e.precision === -1 ? "".concat(t) : e.precision === 0 ? "".concat(t, ":[0-5]\\d") : "".concat(t, ":[0-5]\\d\\.\\d{").concat(e.precision, "}") : "".concat(t, "(?::[0-5]\\d(?:\\.\\d+)?)?");
		}
		function jn(e) {
			return new RegExp("^".concat(Ke(e), "$"));
		}
		function Nn(e) {
			const t = Ke({ precision: e.precision }), n = ["Z"];
			e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
			const r = "".concat(t, "(?:").concat(n.join("|"), ")");
			return new RegExp("^".concat(He, "T(?:").concat(r, ")$"));
		}
		const En = (e) => {
			const t = e ? "[\\s\\S]{".concat(e?.minimum ?? 0, ",").concat(e?.maximum ?? "", "}") : "[\\s\\S]*";
			return new RegExp("^".concat(t, "$"));
		}, In = /^-?\d+$/, Pn = /^-?\d+(?:\.\d+)?$/, Tn = /^(?:true|false)$/i, An = /^[^A-Z]*$/, Rn = /^[^a-z]*$/, N = c("$ZodCheck", (e, t) => {
			var n;
			e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
		}), Ye = {
			number: "number",
			bigint: "bigint",
			object: "date"
		}, qe = c("$ZodCheckLessThan", (e, t) => {
			N.init(e, t);
			const n = Ye[typeof t.value];
			e._zod.onattach.push((r) => {
				const o = r._zod.bag, s = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				t.value < s && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
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
		}), Xe = c("$ZodCheckGreaterThan", (e, t) => {
			N.init(e, t);
			const n = Ye[typeof t.value];
			e._zod.onattach.push((r) => {
				const o = r._zod.bag, s = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				t.value > s && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
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
		}), Cn = c("$ZodCheckMultipleOf", (e, t) => {
			N.init(e, t), e._zod.onattach.push((n) => {
				var r;
				(r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
			}), e._zod.check = (n) => {
				if (typeof n.value != typeof t.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Ct(n.value, t.value) === 0) || n.issues.push({
					origin: typeof n.value,
					code: "not_multiple_of",
					divisor: t.value,
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), Dn = c("$ZodCheckNumberFormat", (e, t) => {
			N.init(e, t), t.format = t.format || "float64";
			const n = t.format?.includes("int"), r = n ? "int" : "number", [o, s] = Lt[t.format];
			e._zod.onattach.push((i) => {
				const a = i._zod.bag;
				a.format = t.format, a.minimum = o, a.maximum = s, n && (a.pattern = In);
			}), e._zod.check = (i) => {
				const a = i.value;
				if (n) {
					if (!Number.isInteger(a)) {
						i.issues.push({
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
						a > 0 ? i.issues.push({
							input: a,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst: e,
							origin: r,
							inclusive: !0,
							continue: !t.abort
						}) : i.issues.push({
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
				a < o && i.issues.push({
					origin: "number",
					input: a,
					code: "too_small",
					minimum: o,
					inclusive: !0,
					inst: e,
					continue: !t.abort
				}), a > s && i.issues.push({
					origin: "number",
					input: a,
					code: "too_big",
					maximum: s,
					inclusive: !0,
					inst: e,
					continue: !t.abort
				});
			};
		}), Un = c("$ZodCheckMaxLength", (e, t) => {
			var n;
			N.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				t.maximum < o && (r._zod.bag.maximum = t.maximum);
			}), e._zod.check = (r) => {
				const o = r.value;
				if (o.length <= t.maximum) return;
				const s = ze(o);
				r.issues.push({
					origin: s,
					code: "too_big",
					maximum: t.maximum,
					inclusive: !0,
					input: o,
					inst: e,
					continue: !t.abort
				});
			};
		}), Fn = c("$ZodCheckMinLength", (e, t) => {
			var n;
			N.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				t.minimum > o && (r._zod.bag.minimum = t.minimum);
			}), e._zod.check = (r) => {
				const o = r.value;
				if (o.length >= t.minimum) return;
				const s = ze(o);
				r.issues.push({
					origin: s,
					code: "too_small",
					minimum: t.minimum,
					inclusive: !0,
					input: o,
					inst: e,
					continue: !t.abort
				});
			};
		}), Mn = c("$ZodCheckLengthEquals", (e, t) => {
			var n;
			N.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
				const o = r.value;
				return !ke(o) && o.length !== void 0;
			}), e._zod.onattach.push((r) => {
				const o = r._zod.bag;
				o.minimum = t.length, o.maximum = t.length, o.length = t.length;
			}), e._zod.check = (r) => {
				const o = r.value, s = o.length;
				if (s === t.length) return;
				const i = ze(o), a = s > t.length;
				r.issues.push({
					origin: i,
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
		}), pe = c("$ZodCheckStringFormat", (e, t) => {
			var n, r;
			N.init(e, t), e._zod.onattach.push((o) => {
				const s = o._zod.bag;
				s.format = t.format, t.pattern && (s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(t.pattern));
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
		}), Ln = c("$ZodCheckRegex", (e, t) => {
			pe.init(e, t), e._zod.check = (n) => {
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
		}), Jn = c("$ZodCheckLowerCase", (e, t) => {
			t.pattern ?? (t.pattern = An), pe.init(e, t);
		}), Bn = c("$ZodCheckUpperCase", (e, t) => {
			t.pattern ?? (t.pattern = Rn), pe.init(e, t);
		}), Vn = c("$ZodCheckIncludes", (e, t) => {
			N.init(e, t);
			const n = ce(t.includes), r = new RegExp(typeof t.position == "number" ? "^.{".concat(t.position, "}").concat(n) : n);
			t.pattern = r, e._zod.onattach.push((o) => {
				const s = o._zod.bag;
				s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(r);
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
		}), Gn = c("$ZodCheckStartsWith", (e, t) => {
			N.init(e, t);
			const n = new RegExp("^".concat(ce(t.prefix), ".*"));
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
		}), Wn = c("$ZodCheckEndsWith", (e, t) => {
			N.init(e, t);
			const n = new RegExp(".*".concat(ce(t.suffix), "$"));
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
		}), Hn = c("$ZodCheckOverwrite", (e, t) => {
			N.init(e, t), e._zod.check = (n) => {
				n.value = t.tx(n.value);
			};
		});
		var Kn = class {
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
		const Yn = {
			major: 4,
			minor: 4,
			patch: 3
		}, $ = c("$ZodType", (e, t) => {
			var n;
			e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Yn;
			const r = [...e._zod.def.checks ?? []];
			e._zod.traits.has("$ZodCheck") && r.unshift(e);
			for (const o of r) for (const s of o._zod.onattach) s(e);
			if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
				e._zod.run = e._zod.parse;
			});
			else {
				const o = (i, a, u) => {
					let l = X(i), d;
					for (const g of a) {
						if (g._zod.def.when) {
							if (Yt(i) || !g._zod.def.when(i)) continue;
						} else if (l) continue;
						const m = i.issues.length, b = g._zod.check(i);
						if (b instanceof Promise && u?.async === !1) throw new q();
						if (d || b instanceof Promise) d = (d ?? Promise.resolve()).then(async () => {
							await b, i.issues.length !== m && (l || (l = X(i, m)));
						});
						else {
							if (i.issues.length === m) continue;
							l || (l = X(i, m));
						}
					}
					return d ? d.then(() => i) : i;
				}, s = (i, a, u) => {
					if (X(i)) return i.aborted = !0, i;
					const l = o(a, r, u);
					if (l instanceof Promise) {
						if (u.async === !1) throw new q();
						return l.then((d) => e._zod.parse(d, u));
					}
					return e._zod.parse(l, u);
				};
				e._zod.run = (i, a) => {
					if (a.skipChecks) return e._zod.parse(i, a);
					if (a.direction === "backward") {
						const l = e._zod.parse({
							value: i.value,
							issues: []
						}, {
							...a,
							skipChecks: !0
						});
						return l instanceof Promise ? l.then((d) => s(d, i, a)) : s(l, i, a);
					}
					const u = e._zod.parse(i, a);
					if (u instanceof Promise) {
						if (a.async === !1) throw new q();
						return u.then((l) => o(l, r, a));
					}
					return o(u, r, a);
				};
			}
			_(e, "~standard", () => ({
				validate: (o) => {
					try {
						const s = Qt(e, o);
						return s.success ? { value: s.data } : { issues: s.error?.issues };
					} catch {
						return en(e, o).then((i) => i.success ? { value: i.data } : { issues: i.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		}), Se = c("$ZodString", (e, t) => {
			$.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? En(e._zod.bag), e._zod.parse = (n, r) => {
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
		}), k = c("$ZodStringFormat", (e, t) => {
			pe.init(e, t), Se.init(e, t);
		}), qn = c("$ZodGUID", (e, t) => {
			t.pattern ?? (t.pattern = gn), k.init(e, t);
		}), Xn = c("$ZodUUID", (e, t) => {
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
				t.pattern ?? (t.pattern = Ge(n));
			} else t.pattern ?? (t.pattern = Ge());
			k.init(e, t);
		}), Qn = c("$ZodEmail", (e, t) => {
			t.pattern ?? (t.pattern = _n), k.init(e, t);
		}), er = c("$ZodURL", (e, t) => {
			k.init(e, t), e._zod.check = (n) => {
				try {
					const r = n.value.trim();
					if (!t.normalize && t.protocol?.source === Sn.source && !/^https?:\/\//i.test(r)) {
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
		}), tr = c("$ZodEmoji", (e, t) => {
			t.pattern ?? (t.pattern = yn()), k.init(e, t);
		}), nr = c("$ZodNanoID", (e, t) => {
			t.pattern ?? (t.pattern = mn), k.init(e, t);
		}), rr = c("$ZodCUID", (e, t) => {
			t.pattern ?? (t.pattern = ln), k.init(e, t);
		}), or = c("$ZodCUID2", (e, t) => {
			t.pattern ?? (t.pattern = dn), k.init(e, t);
		}), sr = c("$ZodULID", (e, t) => {
			t.pattern ?? (t.pattern = pn), k.init(e, t);
		}), ir = c("$ZodXID", (e, t) => {
			t.pattern ?? (t.pattern = fn), k.init(e, t);
		}), ar = c("$ZodKSUID", (e, t) => {
			t.pattern ?? (t.pattern = hn), k.init(e, t);
		}), cr = c("$ZodISODateTime", (e, t) => {
			t.pattern ?? (t.pattern = Nn(t)), k.init(e, t);
		}), ur = c("$ZodISODate", (e, t) => {
			t.pattern ?? (t.pattern = On), k.init(e, t);
		}), lr = c("$ZodISOTime", (e, t) => {
			t.pattern ?? (t.pattern = jn(t)), k.init(e, t);
		}), dr = c("$ZodISODuration", (e, t) => {
			t.pattern ?? (t.pattern = bn), k.init(e, t);
		}), pr = c("$ZodIPv4", (e, t) => {
			t.pattern ?? (t.pattern = kn), k.init(e, t), e._zod.bag.format = "ipv4";
		}), fr = c("$ZodIPv6", (e, t) => {
			t.pattern ?? (t.pattern = wn), k.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
		}), hr = c("$ZodCIDRv4", (e, t) => {
			t.pattern ?? (t.pattern = zn), k.init(e, t);
		}), mr = c("$ZodCIDRv6", (e, t) => {
			t.pattern ?? (t.pattern = $n), k.init(e, t), e._zod.check = (n) => {
				const r = n.value.split("/");
				try {
					if (r.length !== 2) throw new Error();
					const [o, s] = r;
					if (!s) throw new Error();
					const i = Number(s);
					if ("".concat(i) !== s) throw new Error();
					if (i < 0 || i > 128) throw new Error();
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
		function Qe(e) {
			if (e === "") return !0;
			if (/\s/.test(e) || e.length % 4 !== 0) return !1;
			try {
				return atob(e), !0;
			} catch {
				return !1;
			}
		}
		const br = c("$ZodBase64", (e, t) => {
			t.pattern ?? (t.pattern = Zn), k.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
				Qe(n.value) || n.issues.push({
					code: "invalid_format",
					format: "base64",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		});
		function gr(e) {
			if (!We.test(e)) return !1;
			const t = e.replace(/[-_]/g, (n) => n === "-" ? "+" : "/");
			return Qe(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
		}
		const _r = c("$ZodBase64URL", (e, t) => {
			t.pattern ?? (t.pattern = We), k.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
				gr(n.value) || n.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), vr = c("$ZodE164", (e, t) => {
			t.pattern ?? (t.pattern = xn), k.init(e, t);
		});
		function yr(e, t = null) {
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
		const kr = c("$ZodJWT", (e, t) => {
			k.init(e, t), e._zod.check = (n) => {
				yr(n.value, t.alg) || n.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
			};
		}), et = c("$ZodNumber", (e, t) => {
			$.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Pn, e._zod.parse = (n, r) => {
				if (t.coerce) try {
					n.value = Number(n.value);
				} catch {}
				const o = n.value;
				if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return n;
				const s = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
				return n.issues.push({
					expected: "number",
					code: "invalid_type",
					input: o,
					inst: e,
					...s ? { received: s } : {}
				}), n;
			};
		}), wr = c("$ZodNumberFormat", (e, t) => {
			Dn.init(e, t), et.init(e, t);
		}), zr = c("$ZodBoolean", (e, t) => {
			$.init(e, t), e._zod.pattern = Tn, e._zod.parse = (n, r) => {
				if (t.coerce) try {
					n.value = !!n.value;
				} catch {}
				const o = n.value;
				return typeof o == "boolean" || n.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input: o,
					inst: e
				}), n;
			};
		}), $r = c("$ZodUnknown", (e, t) => {
			$.init(e, t), e._zod.parse = (n) => n;
		}), Zr = c("$ZodNever", (e, t) => {
			$.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
				expected: "never",
				code: "invalid_type",
				input: n.value,
				inst: e
			}), n);
		});
		function tt(e, t, n) {
			e.issues.length && t.issues.push(...Le(n, e.issues)), t.value[n] = e.value;
		}
		const Sr = c("$ZodArray", (e, t) => {
			$.init(e, t), e._zod.parse = (n, r) => {
				const o = n.value;
				if (!Array.isArray(o)) return n.issues.push({
					expected: "array",
					code: "invalid_type",
					input: o,
					inst: e
				}), n;
				n.value = Array(o.length);
				const s = [];
				for (let i = 0; i < o.length; i++) {
					const a = o[i], u = t.element._zod.run({
						value: a,
						issues: []
					}, r);
					u instanceof Promise ? s.push(u.then((l) => tt(l, n, i))) : tt(u, n, i);
				}
				return s.length ? Promise.all(s).then(() => n) : n;
			};
		});
		function fe(e, t, n, r, o, s) {
			const i = n in r;
			if (e.issues.length) {
				if (o && s && !i) return;
				t.issues.push(...Le(n, e.issues));
			}
			if (!i && !o) {
				e.issues.length || t.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [n]
				});
				return;
			}
			e.value === void 0 ? i && (t.value[n] = void 0) : t.value[n] = e.value;
		}
		function nt(e) {
			const t = Object.keys(e.shape);
			for (const r of t) if (!e.shape?.[r]?._zod?.traits?.has("$ZodType")) throw new Error("Invalid element at key \"".concat(r, "\": expected a Zod schema"));
			const n = Mt(e.shape);
			return {
				...e,
				keys: t,
				keySet: new Set(t),
				numKeys: t.length,
				optionalKeys: new Set(n)
			};
		}
		function rt(e, t, n, r, o, s) {
			const i = [], a = o.keySet, u = o.catchall._zod, l = u.def.type, d = u.optin === "optional", g = u.optout === "optional";
			for (const m in t) {
				if (m === "__proto__" || a.has(m)) continue;
				if (l === "never") {
					i.push(m);
					continue;
				}
				const b = u.run({
					value: t[m],
					issues: []
				}, r);
				b instanceof Promise ? e.push(b.then((y) => fe(y, n, m, t, d, g))) : fe(b, n, m, t, d, g);
			}
			return i.length && n.issues.push({
				code: "unrecognized_keys",
				keys: i,
				input: t,
				inst: s
			}), e.length ? Promise.all(e).then(() => n) : n;
		}
		const xr = c("$ZodObject", (e, t) => {
			if ($.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
				const i = t.shape;
				Object.defineProperty(t, "shape", { get: () => {
					const a = { ...i };
					return Object.defineProperty(t, "shape", { value: a }), a;
				} });
			}
			const n = ye(() => nt(t));
			_(e._zod, "propValues", () => {
				const i = t.shape, a = {};
				for (const u in i) {
					const l = i[u]._zod;
					if (l.values) {
						a[u] ?? (a[u] = /* @__PURE__ */ new Set());
						for (const d of l.values) a[u].add(d);
					}
				}
				return a;
			});
			const r = ae, o = t.catchall;
			let s;
			e._zod.parse = (i, a) => {
				s ?? (s = n.value);
				const u = i.value;
				if (!r(u)) return i.issues.push({
					expected: "object",
					code: "invalid_type",
					input: u,
					inst: e
				}), i;
				i.value = {};
				const l = [], d = s.shape;
				for (const g of s.keys) {
					const m = d[g], b = m._zod.optin === "optional", y = m._zod.optout === "optional", x = m._zod.run({
						value: u[g],
						issues: []
					}, a);
					x instanceof Promise ? l.push(x.then((D) => fe(D, i, g, u, b, y))) : fe(x, i, g, u, b, y);
				}
				return o ? rt(l, u, i, a, n.value, e) : l.length ? Promise.all(l).then(() => i) : i;
			};
		}), Or = c("$ZodObjectJIT", (e, t) => {
			xr.init(e, t);
			const n = e._zod.parse, r = ye(() => nt(t)), o = (m) => {
				const b = new Kn([
					"shape",
					"payload",
					"ctx"
				]), y = r.value, x = (E) => {
					const w = Ue(E);
					return "shape[".concat(w, "]._zod.run({ value: input[").concat(w, "], issues: [] }, ctx)");
				};
				b.write("const input = payload.value;");
				const D = Object.create(null);
				let ee = 0;
				for (const E of y.keys) D[E] = "key_".concat(ee++);
				b.write("const newResult = {};");
				for (const E of y.keys) {
					const w = D[E], S = Ue(E), C = m[E], T = C?._zod?.optin === "optional", Ie = C?._zod?.optout === "optional";
					b.write("const ".concat(w, " = ").concat(x(E), ";")), T && Ie ? b.write("\n        if (".concat(w, ".issues.length) {\n          if (").concat(S, " in input) {\n            payload.issues = payload.issues.concat(").concat(w, ".issues.map(iss => ({\n              ...iss,\n              path: iss.path ? [").concat(S, ", ...iss.path] : [").concat(S, "]\n            })));\n          }\n        }\n        \n        if (").concat(w, ".value === undefined) {\n          if (").concat(S, " in input) {\n            newResult[").concat(S, "] = undefined;\n          }\n        } else {\n          newResult[").concat(S, "] = ").concat(w, ".value;\n        }\n        \n      ")) : T ? b.write("\n        if (".concat(w, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(w, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(S, ", ...iss.path] : [").concat(S, "]\n          })));\n        }\n        \n        if (").concat(w, ".value === undefined) {\n          if (").concat(S, " in input) {\n            newResult[").concat(S, "] = undefined;\n          }\n        } else {\n          newResult[").concat(S, "] = ").concat(w, ".value;\n        }\n        \n      ")) : b.write("\n        const ".concat(w, "_present = ").concat(S, " in input;\n        if (").concat(w, ".issues.length) {\n          payload.issues = payload.issues.concat(").concat(w, ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [").concat(S, ", ...iss.path] : [").concat(S, "]\n          })));\n        }\n        if (!").concat(w, "_present && !").concat(w, ".issues.length) {\n          payload.issues.push({\n            code: \"invalid_type\",\n            expected: \"nonoptional\",\n            input: undefined,\n            path: [").concat(S, "]\n          });\n        }\n\n        if (").concat(w, "_present) {\n          if (").concat(w, ".value === undefined) {\n            newResult[").concat(S, "] = undefined;\n          } else {\n            newResult[").concat(S, "] = ").concat(w, ".value;\n          }\n        }\n\n      "));
				}
				b.write("payload.value = newResult;"), b.write("return payload;");
				const K = b.compile();
				return (E, w) => K(m, E, w);
			};
			let s;
			const i = ae, a = !ie.jitless, l = a && Ut.value, d = t.catchall;
			let g;
			e._zod.parse = (m, b) => {
				g ?? (g = r.value);
				const y = m.value;
				return i(y) ? a && l && b?.async === !1 && b.jitless !== !0 ? (s || (s = o(t.shape)), m = s(m, b), d ? rt([], y, m, b, g, e) : m) : n(m, b) : (m.issues.push({
					expected: "object",
					code: "invalid_type",
					input: y,
					inst: e
				}), m);
			};
		});
		function ot(e, t, n, r) {
			for (const s of e) if (s.issues.length === 0) return t.value = s.value, t;
			const o = e.filter((s) => !X(s));
			return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
				code: "invalid_union",
				input: t.value,
				inst: n,
				errors: e.map((s) => s.issues.map((i) => H(i, r, G())))
			}), t);
		}
		const jr = c("$ZodUnion", (e, t) => {
			$.init(e, t), _(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), _(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), _(e._zod, "values", () => {
				if (t.options.every((r) => r._zod.values)) return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
			}), _(e._zod, "pattern", () => {
				if (t.options.every((r) => r._zod.pattern)) {
					const r = t.options.map((o) => o._zod.pattern);
					return new RegExp("^(".concat(r.map((o) => we(o.source)).join("|"), ")$"));
				}
			});
			const n = t.options.length === 1 ? t.options[0]._zod.run : null;
			e._zod.parse = (r, o) => {
				if (n) return n(r, o);
				let s = !1;
				const i = [];
				for (const a of t.options) {
					const u = a._zod.run({
						value: r.value,
						issues: []
					}, o);
					if (u instanceof Promise) i.push(u), s = !0;
					else {
						if (u.issues.length === 0) return u;
						i.push(u);
					}
				}
				return s ? Promise.all(i).then((a) => ot(a, r, e, o)) : ot(i, r, e, o);
			};
		}), Nr = c("$ZodIntersection", (e, t) => {
			$.init(e, t), e._zod.parse = (n, r) => {
				const o = n.value, s = t.left._zod.run({
					value: o,
					issues: []
				}, r), i = t.right._zod.run({
					value: o,
					issues: []
				}, r);
				return s instanceof Promise || i instanceof Promise ? Promise.all([s, i]).then(([a, u]) => st(n, a, u)) : st(n, s, i);
			};
		});
		function xe(e, t) {
			if (e === t) return {
				valid: !0,
				data: e
			};
			if (e instanceof Date && t instanceof Date && +e == +t) return {
				valid: !0,
				data: e
			};
			if (te(e) && te(t)) {
				const n = Object.keys(t), r = Object.keys(e).filter((s) => n.indexOf(s) !== -1), o = {
					...e,
					...t
				};
				for (const s of r) {
					const i = xe(e[s], t[s]);
					if (!i.valid) return {
						valid: !1,
						mergeErrorPath: [s, ...i.mergeErrorPath]
					};
					o[s] = i.data;
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
					const o = e[r], s = t[r], i = xe(o, s);
					if (!i.valid) return {
						valid: !1,
						mergeErrorPath: [r, ...i.mergeErrorPath]
					};
					n.push(i.data);
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
		function st(e, t, n) {
			const r = /* @__PURE__ */ new Map();
			let o;
			for (const a of t.issues) if (a.code === "unrecognized_keys") {
				o ?? (o = a);
				for (const u of a.keys) r.has(u) || r.set(u, {}), r.get(u).l = !0;
			} else e.issues.push(a);
			for (const a of n.issues) if (a.code === "unrecognized_keys") for (const u of a.keys) r.has(u) || r.set(u, {}), r.get(u).r = !0;
			else e.issues.push(a);
			const s = [...r].filter(([, a]) => a.l && a.r).map(([a]) => a);
			if (s.length && o && e.issues.push({
				...o,
				keys: s
			}), X(e)) return e;
			const i = xe(t.value, n.value);
			if (!i.valid) throw new Error("Unmergable intersection. Error path: ".concat(JSON.stringify(i.mergeErrorPath)));
			return e.value = i.data, e;
		}
		const Er = c("$ZodEnum", (e, t) => {
			$.init(e, t);
			const n = Ce(t.entries), r = new Set(n);
			e._zod.values = r, e._zod.pattern = new RegExp("^(".concat(n.filter((o) => Ft.has(typeof o)).map((o) => typeof o == "string" ? ce(o) : o.toString()).join("|"), ")$")), e._zod.parse = (o, s) => {
				const i = o.value;
				return r.has(i) || o.issues.push({
					code: "invalid_value",
					values: n,
					input: i,
					inst: e
				}), o;
			};
		}), Ir = c("$ZodTransform", (e, t) => {
			$.init(e, t), e._zod.optin = "optional", e._zod.parse = (n, r) => {
				if (r.direction === "backward") throw new Re(e.constructor.name);
				const o = t.transform(n.value, n);
				if (r.async) return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n.fallback = !0, n));
				if (o instanceof Promise) throw new q();
				return n.value = o, n.fallback = !0, n;
			};
		});
		function it(e, t) {
			return t === void 0 && (e.issues.length || e.fallback) ? {
				issues: [],
				value: void 0
			} : e;
		}
		const at = c("$ZodOptional", (e, t) => {
			$.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", _(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), _(e._zod, "pattern", () => {
				const n = t.innerType._zod.pattern;
				return n ? new RegExp("^(".concat(we(n.source), ")?$")) : void 0;
			}), e._zod.parse = (n, r) => {
				if (t.innerType._zod.optin === "optional") {
					const o = n.value, s = t.innerType._zod.run(n, r);
					return s instanceof Promise ? s.then((i) => it(i, o)) : it(s, o);
				}
				return n.value === void 0 ? n : t.innerType._zod.run(n, r);
			};
		}), Pr = c("$ZodExactOptional", (e, t) => {
			at.init(e, t), _(e._zod, "values", () => t.innerType._zod.values), _(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
		}), Tr = c("$ZodNullable", (e, t) => {
			$.init(e, t), _(e._zod, "optin", () => t.innerType._zod.optin), _(e._zod, "optout", () => t.innerType._zod.optout), _(e._zod, "pattern", () => {
				const n = t.innerType._zod.pattern;
				return n ? new RegExp("^(".concat(we(n.source), "|null)$")) : void 0;
			}), _(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
		}), Ar = c("$ZodDefault", (e, t) => {
			$.init(e, t), e._zod.optin = "optional", _(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				if (n.value === void 0) return n.value = t.defaultValue, n;
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((s) => ct(s, t)) : ct(o, t);
			};
		});
		function ct(e, t) {
			return e.value === void 0 && (e.value = t.defaultValue), e;
		}
		const Rr = c("$ZodPrefault", (e, t) => {
			$.init(e, t), e._zod.optin = "optional", _(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
		}), Cr = c("$ZodNonOptional", (e, t) => {
			$.init(e, t), _(e._zod, "values", () => {
				const n = t.innerType._zod.values;
				return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
			}), e._zod.parse = (n, r) => {
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((s) => ut(s, e)) : ut(o, e);
			};
		});
		function ut(e, t) {
			return !e.issues.length && e.value === void 0 && e.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: e.value,
				inst: t
			}), e;
		}
		const Dr = c("$ZodCatch", (e, t) => {
			$.init(e, t), e._zod.optin = "optional", _(e._zod, "optout", () => t.innerType._zod.optout), _(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then((s) => (n.value = s.value, s.issues.length && (n.value = t.catchValue({
					...n,
					error: { issues: s.issues.map((i) => H(i, r, G())) },
					input: n.value
				}), n.issues = [], n.fallback = !0), n)) : (n.value = o.value, o.issues.length && (n.value = t.catchValue({
					...n,
					error: { issues: o.issues.map((s) => H(s, r, G())) },
					input: n.value
				}), n.issues = [], n.fallback = !0), n);
			};
		}), Ur = c("$ZodPipe", (e, t) => {
			$.init(e, t), _(e._zod, "values", () => t.in._zod.values), _(e._zod, "optin", () => t.in._zod.optin), _(e._zod, "optout", () => t.out._zod.optout), _(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, r) => {
				if (r.direction === "backward") {
					const s = t.out._zod.run(n, r);
					return s instanceof Promise ? s.then((i) => he(i, t.in, r)) : he(s, t.in, r);
				}
				const o = t.in._zod.run(n, r);
				return o instanceof Promise ? o.then((s) => he(s, t.out, r)) : he(o, t.out, r);
			};
		});
		function he(e, t, n) {
			return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
				value: e.value,
				issues: e.issues,
				fallback: e.fallback
			}, n);
		}
		const Fr = c("$ZodReadonly", (e, t) => {
			$.init(e, t), _(e._zod, "propValues", () => t.innerType._zod.propValues), _(e._zod, "values", () => t.innerType._zod.values), _(e._zod, "optin", () => t.innerType?._zod?.optin), _(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (n, r) => {
				if (r.direction === "backward") return t.innerType._zod.run(n, r);
				const o = t.innerType._zod.run(n, r);
				return o instanceof Promise ? o.then(lt) : lt(o);
			};
		});
		function lt(e) {
			return e.value = Object.freeze(e.value), e;
		}
		const Mr = c("$ZodCustom", (e, t) => {
			N.init(e, t), $.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
				const r = n.value, o = t.fn(r);
				if (o instanceof Promise) return o.then((s) => dt(s, n, r, e));
				dt(o, n, r, e);
			};
		});
		function dt(e, t, n, r) {
			if (!e) {
				const o = {
					code: "custom",
					input: n,
					inst: r,
					path: [...r._zod.def.path ?? []],
					continue: !r._zod.def.abort
				};
				r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(ne(o));
			}
		}
		var pt, Lr = class {
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
		function Jr() {
			return new Lr();
		}
		(pt = globalThis).__zod_globalRegistry ?? (pt.__zod_globalRegistry = Jr());
		const re = globalThis.__zod_globalRegistry;
		function Br(e, t) {
			return new e({
				type: "string",
				...f(t)
			});
		}
		function Vr(e, t) {
			return new e({
				type: "string",
				format: "email",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function ft(e, t) {
			return new e({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function Gr(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function Wr(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v4",
				...f(t)
			});
		}
		function Hr(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v6",
				...f(t)
			});
		}
		function Kr(e, t) {
			return new e({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: !1,
				version: "v7",
				...f(t)
			});
		}
		function Yr(e, t) {
			return new e({
				type: "string",
				format: "url",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function qr(e, t) {
			return new e({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function Xr(e, t) {
			return new e({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function Qr(e, t) {
			return new e({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function eo(e, t) {
			return new e({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function to(e, t) {
			return new e({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function no(e, t) {
			return new e({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function ro(e, t) {
			return new e({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function oo(e, t) {
			return new e({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function so(e, t) {
			return new e({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function io(e, t) {
			return new e({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function ao(e, t) {
			return new e({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function co(e, t) {
			return new e({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function uo(e, t) {
			return new e({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function lo(e, t) {
			return new e({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function po(e, t) {
			return new e({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: !1,
				...f(t)
			});
		}
		function fo(e, t) {
			return new e({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: !1,
				local: !1,
				precision: null,
				...f(t)
			});
		}
		function ho(e, t) {
			return new e({
				type: "string",
				format: "date",
				check: "string_format",
				...f(t)
			});
		}
		function mo(e, t) {
			return new e({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...f(t)
			});
		}
		function bo(e, t) {
			return new e({
				type: "string",
				format: "duration",
				check: "string_format",
				...f(t)
			});
		}
		function go(e, t) {
			return new e({
				type: "number",
				checks: [],
				...f(t)
			});
		}
		function _o(e, t) {
			return new e({
				type: "number",
				check: "number_format",
				abort: !1,
				format: "safeint",
				...f(t)
			});
		}
		function vo(e, t) {
			return new e({
				type: "boolean",
				...f(t)
			});
		}
		function yo(e) {
			return new e({ type: "unknown" });
		}
		function ko(e, t) {
			return new e({
				type: "never",
				...f(t)
			});
		}
		function ht(e, t) {
			return new qe({
				check: "less_than",
				...f(t),
				value: e,
				inclusive: !1
			});
		}
		function Oe(e, t) {
			return new qe({
				check: "less_than",
				...f(t),
				value: e,
				inclusive: !0
			});
		}
		function mt(e, t) {
			return new Xe({
				check: "greater_than",
				...f(t),
				value: e,
				inclusive: !1
			});
		}
		function je(e, t) {
			return new Xe({
				check: "greater_than",
				...f(t),
				value: e,
				inclusive: !0
			});
		}
		function bt(e, t) {
			return new Cn({
				check: "multiple_of",
				...f(t),
				value: e
			});
		}
		function gt(e, t) {
			return new Un({
				check: "max_length",
				...f(t),
				maximum: e
			});
		}
		function me(e, t) {
			return new Fn({
				check: "min_length",
				...f(t),
				minimum: e
			});
		}
		function _t(e, t) {
			return new Mn({
				check: "length_equals",
				...f(t),
				length: e
			});
		}
		function wo(e, t) {
			return new Ln({
				check: "string_format",
				format: "regex",
				...f(t),
				pattern: e
			});
		}
		function zo(e) {
			return new Jn({
				check: "string_format",
				format: "lowercase",
				...f(e)
			});
		}
		function $o(e) {
			return new Bn({
				check: "string_format",
				format: "uppercase",
				...f(e)
			});
		}
		function Zo(e, t) {
			return new Vn({
				check: "string_format",
				format: "includes",
				...f(t),
				includes: e
			});
		}
		function So(e, t) {
			return new Gn({
				check: "string_format",
				format: "starts_with",
				...f(t),
				prefix: e
			});
		}
		function xo(e, t) {
			return new Wn({
				check: "string_format",
				format: "ends_with",
				...f(t),
				suffix: e
			});
		}
		function Q(e) {
			return new Hn({
				check: "overwrite",
				tx: e
			});
		}
		function Oo(e) {
			return Q((t) => t.normalize(e));
		}
		function jo() {
			return Q((e) => e.trim());
		}
		function No() {
			return Q((e) => e.toLowerCase());
		}
		function Eo() {
			return Q((e) => e.toUpperCase());
		}
		function Io() {
			return Q((e) => Dt(e));
		}
		function Po(e, t, n) {
			return new e({
				type: "array",
				element: t,
				...f(n)
			});
		}
		function To(e, t, n) {
			return new e({
				type: "custom",
				check: "custom",
				fn: t,
				...f(n)
			});
		}
		function Ao(e, t) {
			const n = Ro((r) => (r.addIssue = (o) => {
				if (typeof o == "string") r.issues.push(ne(o, r.value, n._zod.def));
				else {
					const s = o;
					s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = r.value), s.inst ?? (s.inst = n), s.continue ?? (s.continue = !n._zod.def.abort), r.issues.push(ne(s));
				}
			}, e(r.value, r)), t);
			return n;
		}
		function Ro(e, t) {
			const n = new N({
				check: "custom",
				...f(t)
			});
			return n._zod.check = e, n;
		}
		function vt(e) {
			let t = e?.target ?? "draft-2020-12";
			return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
				processors: e.processors ?? {},
				metadataRegistry: e?.metadata ?? re,
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
		function O(e, t, n = {
			path: [],
			schemaPath: []
		}) {
			var r;
			const o = e._zod.def, s = t.seen.get(e);
			if (s) return s.count++, n.schemaPath.includes(e) && (s.cycle = n.path), s.schema;
			const i = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: n.path
			};
			t.seen.set(e, i);
			const a = e._zod.toJSONSchema?.();
			if (a) i.schema = a;
			else {
				const l = {
					...n,
					schemaPath: [...n.schemaPath, e],
					path: n.path
				};
				if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, i.schema, l);
				else {
					const g = i.schema, m = t.processors[o.type];
					if (!m) throw new Error("[toJSONSchema]: Non-representable type encountered: ".concat(o.type));
					m(e, t, g, l);
				}
				const d = e._zod.parent;
				d && (i.ref || (i.ref = d), O(d, t, l), t.seen.get(d).isParent = !0);
			}
			const u = t.metadataRegistry.get(e);
			return u && Object.assign(i.schema, u), t.io === "input" && j(e) && (delete i.schema.examples, delete i.schema.default), t.io === "input" && "_prefault" in i.schema && ((r = i.schema).default ?? (r.default = i.schema._prefault)), delete i.schema._prefault, t.seen.get(e).schema;
		}
		function yt(e, t) {
			const n = e.seen.get(t);
			if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const r = /* @__PURE__ */ new Map();
			for (const i of e.seen.entries()) {
				const a = e.metadataRegistry.get(i[0])?.id;
				if (a) {
					const u = r.get(a);
					if (u && u !== i[0]) throw new Error("Duplicate schema id \"".concat(a, "\" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together."));
					r.set(a, i[0]);
				}
			}
			const o = (i) => {
				const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
				if (e.external) {
					const d = e.external.registry.get(i[0])?.id, g = e.external.uri ?? ((b) => b);
					if (d) return { ref: g(d) };
					const m = i[1].defId ?? i[1].schema.id ?? "schema".concat(e.counter++);
					return i[1].defId = m, {
						defId: m,
						ref: "".concat(g("__shared"), "#/").concat(a, "/").concat(m)
					};
				}
				if (i[1] === n) return { ref: "#" };
				const u = "#/".concat(a, "/"), l = i[1].schema.id ?? "__schema".concat(e.counter++);
				return {
					defId: l,
					ref: u + l
				};
			}, s = (i) => {
				if (i[1].schema.$ref) return;
				const a = i[1], { ref: u, defId: l } = o(i);
				a.def = { ...a.schema }, l && (a.defId = l);
				const d = a.schema;
				for (const g in d) delete d[g];
				d.$ref = u;
			};
			if (e.cycles === "throw") for (const i of e.seen.entries()) {
				const a = i[1];
				if (a.cycle) throw new Error("Cycle detected: #/".concat(a.cycle?.join("/"), "/<root>\n\nSet the `cycles` parameter to `\"ref\"` to resolve cyclical schemas with defs."));
			}
			for (const i of e.seen.entries()) {
				const a = i[1];
				if (t === i[0]) {
					s(i);
					continue;
				}
				if (e.external) {
					const u = e.external.registry.get(i[0])?.id;
					if (t !== i[0] && u) {
						s(i);
						continue;
					}
				}
				if (e.metadataRegistry.get(i[0])?.id) {
					s(i);
					continue;
				}
				if (a.cycle) {
					s(i);
					continue;
				}
				if (a.count > 1 && e.reused === "ref") {
					s(i);
					continue;
				}
			}
		}
		function kt(e, t) {
			const n = e.seen.get(t);
			if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const r = (a) => {
				const u = e.seen.get(a);
				if (u.ref === null) return;
				const l = u.def ?? u.schema, d = { ...l }, g = u.ref;
				if (u.ref = null, g) {
					r(g);
					const b = e.seen.get(g), y = b.schema;
					if (y.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (l.allOf = l.allOf ?? [], l.allOf.push(y)) : Object.assign(l, y), Object.assign(l, d), a._zod.parent === g) for (const x in l) x === "$ref" || x === "allOf" || x in d || delete l[x];
					if (y.$ref && b.def) for (const x in l) x === "$ref" || x === "allOf" || x in b.def && JSON.stringify(l[x]) === JSON.stringify(b.def[x]) && delete l[x];
				}
				const m = a._zod.parent;
				if (m && m !== g) {
					r(m);
					const b = e.seen.get(m);
					if (b?.schema.$ref && (l.$ref = b.schema.$ref, b.def)) for (const y in l) y === "$ref" || y === "allOf" || y in b.def && JSON.stringify(l[y]) === JSON.stringify(b.def[y]) && delete l[y];
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
			const s = e.metadataRegistry.get(t)?.id;
			s !== void 0 && o.id === s && delete o.id;
			const i = e.external?.defs ?? {};
			for (const a of e.seen.entries()) {
				const u = a[1];
				u.def && u.defId && (u.def.id === u.defId && delete u.def.id, i[u.defId] = u.def);
			}
			e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? o.$defs = i : o.definitions = i);
			try {
				const a = JSON.parse(JSON.stringify(o));
				return Object.defineProperty(a, "~standard", {
					value: {
						...t["~standard"],
						jsonSchema: {
							input: be(t, "input", e.processors),
							output: be(t, "output", e.processors)
						}
					},
					enumerable: !1,
					writable: !1
				}), a;
			} catch {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function j(e, t) {
			const n = t ?? { seen: /* @__PURE__ */ new Set() };
			if (n.seen.has(e)) return !1;
			n.seen.add(e);
			const r = e._zod.def;
			if (r.type === "transform") return !0;
			if (r.type === "array") return j(r.element, n);
			if (r.type === "set") return j(r.valueType, n);
			if (r.type === "lazy") return j(r.getter(), n);
			if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return j(r.innerType, n);
			if (r.type === "intersection") return j(r.left, n) || j(r.right, n);
			if (r.type === "record" || r.type === "map") return j(r.keyType, n) || j(r.valueType, n);
			if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : j(r.in, n) || j(r.out, n);
			if (r.type === "object") {
				for (const o in r.shape) if (j(r.shape[o], n)) return !0;
				return !1;
			}
			if (r.type === "union") {
				for (const o of r.options) if (j(o, n)) return !0;
				return !1;
			}
			if (r.type === "tuple") {
				for (const o of r.items) if (j(o, n)) return !0;
				return !!(r.rest && j(r.rest, n));
			}
			return !1;
		}
		const Co = (e, t = {}) => (n) => {
			const r = vt({
				...n,
				processors: t
			});
			return O(e, r), yt(r, e), kt(r, e);
		}, be = (e, t, n = {}) => (r) => {
			const { libraryOptions: o, target: s } = r ?? {}, i = vt({
				...o ?? {},
				target: s,
				io: t,
				processors: n
			});
			return O(e, i), yt(i, e), kt(i, e);
		}, Do = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		}, Uo = (e, t, n, r) => {
			const o = n;
			o.type = "string";
			const { minimum: s, maximum: i, format: a, patterns: u, contentEncoding: l } = e._zod.bag;
			if (typeof s == "number" && (o.minLength = s), typeof i == "number" && (o.maxLength = i), a && (o.format = Do[a] ?? a, o.format === "" && delete o.format, a === "time" && delete o.format), l && (o.contentEncoding = l), u && u.size > 0) {
				const d = [...u];
				d.length === 1 ? o.pattern = d[0].source : d.length > 1 && (o.allOf = [...d.map((g) => ({
					...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: g.source
				}))]);
			}
		}, Fo = (e, t, n, r) => {
			const o = n, { minimum: s, maximum: i, format: a, multipleOf: u, exclusiveMaximum: l, exclusiveMinimum: d } = e._zod.bag;
			typeof a == "string" && a.includes("int") ? o.type = "integer" : o.type = "number";
			const g = typeof d == "number" && d >= (s ?? Number.NEGATIVE_INFINITY), m = typeof l == "number" && l <= (i ?? Number.POSITIVE_INFINITY), b = t.target === "draft-04" || t.target === "openapi-3.0";
			g ? b ? (o.minimum = d, o.exclusiveMinimum = !0) : o.exclusiveMinimum = d : typeof s == "number" && (o.minimum = s), m ? b ? (o.maximum = l, o.exclusiveMaximum = !0) : o.exclusiveMaximum = l : typeof i == "number" && (o.maximum = i), typeof u == "number" && (o.multipleOf = u);
		}, Mo = (e, t, n, r) => {
			n.type = "boolean";
		}, Lo = (e, t, n, r) => {
			n.not = {};
		}, Bo = (e, t, n, r) => {
			const o = e._zod.def, s = Ce(o.entries);
			s.every((i) => typeof i == "number") && (n.type = "number"), s.every((i) => typeof i == "string") && (n.type = "string"), n.enum = s;
		}, Vo = (e, t, n, r) => {
			if (t.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		}, Go = (e, t, n, r) => {
			if (t.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		}, Wo = (e, t, n, r) => {
			const o = n, s = e._zod.def, { minimum: i, maximum: a } = e._zod.bag;
			typeof i == "number" && (o.minItems = i), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = O(s.element, t, {
				...r,
				path: [...r.path, "items"]
			});
		}, Ho = (e, t, n, r) => {
			const o = n, s = e._zod.def;
			o.type = "object", o.properties = {};
			const i = s.shape;
			for (const l in i) o.properties[l] = O(i[l], t, {
				...r,
				path: [
					...r.path,
					"properties",
					l
				]
			});
			const a = new Set(Object.keys(i)), u = new Set([...a].filter((l) => {
				const d = s.shape[l]._zod;
				return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
			}));
			u.size > 0 && (o.required = Array.from(u)), s.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : s.catchall ? s.catchall && (o.additionalProperties = O(s.catchall, t, {
				...r,
				path: [...r.path, "additionalProperties"]
			})) : t.io === "output" && (o.additionalProperties = !1);
		}, Ko = (e, t, n, r) => {
			const o = e._zod.def, s = o.inclusive === !1, i = o.options.map((a, u) => O(a, t, {
				...r,
				path: [
					...r.path,
					s ? "oneOf" : "anyOf",
					u
				]
			}));
			s ? n.oneOf = i : n.anyOf = i;
		}, Yo = (e, t, n, r) => {
			const o = e._zod.def, s = O(o.left, t, {
				...r,
				path: [
					...r.path,
					"allOf",
					0
				]
			}), i = O(o.right, t, {
				...r,
				path: [
					...r.path,
					"allOf",
					1
				]
			}), a = (u) => "allOf" in u && Object.keys(u).length === 1;
			n.allOf = [...a(s) ? s.allOf : [s], ...a(i) ? i.allOf : [i]];
		}, qo = (e, t, n, r) => {
			const o = e._zod.def, s = O(o.innerType, t, r), i = t.seen.get(e);
			t.target === "openapi-3.0" ? (i.ref = o.innerType, n.nullable = !0) : n.anyOf = [s, { type: "null" }];
		}, Xo = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType;
		}, Qo = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType, n.default = JSON.parse(JSON.stringify(o.defaultValue));
		}, es = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
		}, ts = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType;
			let i;
			try {
				i = o.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			n.default = i;
		}, ns = (e, t, n, r) => {
			const o = e._zod.def, s = o.in._zod.traits.has("$ZodTransform"), i = t.io === "input" ? s ? o.out : o.in : o.out;
			O(i, t, r);
			const a = t.seen.get(e);
			a.ref = i;
		}, rs = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType, n.readOnly = !0;
		}, wt = (e, t, n, r) => {
			const o = e._zod.def;
			O(o.innerType, t, r);
			const s = t.seen.get(e);
			s.ref = o.innerType;
		}, os = c("ZodISODateTime", (e, t) => {
			cr.init(e, t), z.init(e, t);
		});
		function ss(e) {
			return fo(os, e);
		}
		const is = c("ZodISODate", (e, t) => {
			ur.init(e, t), z.init(e, t);
		});
		function as(e) {
			return ho(is, e);
		}
		const cs = c("ZodISOTime", (e, t) => {
			lr.init(e, t), z.init(e, t);
		});
		function us(e) {
			return mo(cs, e);
		}
		const ls = c("ZodISODuration", (e, t) => {
			dr.init(e, t), z.init(e, t);
		});
		function ds(e) {
			return bo(ls, e);
		}
		const P = c("ZodError", (e, t) => {
			Be.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
				format: { value: (n) => Xt(e, n) },
				flatten: { value: (n) => qt(e, n) },
				addIssue: { value: (n) => {
					e.issues.push(n), e.message = JSON.stringify(e.issues, ve, 2);
				} },
				addIssues: { value: (n) => {
					e.issues.push(...n), e.message = JSON.stringify(e.issues, ve, 2);
				} },
				isEmpty: { get() {
					return e.issues.length === 0;
				} }
			});
		}, { Parent: Error }), ps = $e(P), fs = Ze(P), hs = le(P), ms = de(P), bs = tn(P), gs = nn(P), _s = rn(P), vs = on(P), ys = sn(P), ks = an(P), ws = cn(P), zs = un(P), zt = /* @__PURE__ */ new WeakMap();
		function oe(e, t, n) {
			const r = Object.getPrototypeOf(e);
			let o = zt.get(r);
			if (o || (o = /* @__PURE__ */ new Set(), zt.set(r, o)), !o.has(t)) {
				o.add(t);
				for (const s in n) {
					const i = n[s];
					Object.defineProperty(r, s, {
						configurable: !0,
						enumerable: !1,
						get() {
							const a = i.bind(this);
							return Object.defineProperty(this, s, {
								configurable: !0,
								writable: !0,
								enumerable: !0,
								value: a
							}), a;
						},
						set(a) {
							Object.defineProperty(this, s, {
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
		const Z = c("ZodType", (e, t) => ($.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
			input: be(e, "input"),
			output: be(e, "output")
		} }), e.toJSONSchema = Co(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (n, r) => ps(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => hs(e, n, r), e.parseAsync = async (n, r) => fs(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => ms(e, n, r), e.spa = e.safeParseAsync, e.encode = (n, r) => bs(e, n, r), e.decode = (n, r) => gs(e, n, r), e.encodeAsync = async (n, r) => _s(e, n, r), e.decodeAsync = async (n, r) => vs(e, n, r), e.safeEncode = (n, r) => ys(e, n, r), e.safeDecode = (n, r) => ks(e, n, r), e.safeEncodeAsync = async (n, r) => ws(e, n, r), e.safeDecodeAsync = async (n, r) => zs(e, n, r), oe(e, "ZodType", {
			check(...n) {
				const r = this.def;
				return this.clone(J(r, { checks: [...r.checks ?? [], ...n.map((o) => typeof o == "function" ? { _zod: {
					check: o,
					def: { check: "custom" },
					onattach: []
				} } : o)] }), { parent: !0 });
			},
			with(...n) {
				return this.check(...n);
			},
			clone(n, r) {
				return B(this, n, r);
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
				return this.check(gi(n, r));
			},
			overwrite(n) {
				return this.check(Q(n));
			},
			optional() {
				return Nt(this);
			},
			exactOptional() {
				return ri(this);
			},
			nullable() {
				return Et(this);
			},
			nullish() {
				return Nt(Et(this));
			},
			nonoptional(n) {
				return ui(this, n);
			},
			array() {
				return se(this);
			},
			or(n) {
				return Ys([this, n]);
			},
			and(n) {
				return Xs(this, n);
			},
			transform(n) {
				return Pt(this, ti(n));
			},
			default(n) {
				return ii(this, n);
			},
			prefault(n) {
				return ci(this, n);
			},
			catch(n) {
				return di(this, n);
			},
			pipe(n) {
				return Pt(this, n);
			},
			readonly() {
				return hi(this);
			},
			describe(n) {
				const r = this.clone();
				return re.add(r, { description: n }), r;
			},
			meta(...n) {
				if (n.length === 0) return re.get(this);
				const r = this.clone();
				return re.add(r, n[0]), r;
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
				return re.get(e)?.description;
			},
			configurable: !0
		}), e)), $t = c("_ZodString", (e, t) => {
			Se.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (r, o, s) => Uo(e, r, o, s);
			const n = e._zod.bag;
			e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, oe(e, "_ZodString", {
				regex(...r) {
					return this.check(wo(...r));
				},
				includes(...r) {
					return this.check(Zo(...r));
				},
				startsWith(...r) {
					return this.check(So(...r));
				},
				endsWith(...r) {
					return this.check(xo(...r));
				},
				min(...r) {
					return this.check(me(...r));
				},
				max(...r) {
					return this.check(gt(...r));
				},
				length(...r) {
					return this.check(_t(...r));
				},
				nonempty(...r) {
					return this.check(me(1, ...r));
				},
				lowercase(r) {
					return this.check(zo(r));
				},
				uppercase(r) {
					return this.check($o(r));
				},
				trim() {
					return this.check(jo());
				},
				normalize(...r) {
					return this.check(Oo(...r));
				},
				toLowerCase() {
					return this.check(No());
				},
				toUpperCase() {
					return this.check(Eo());
				},
				slugify() {
					return this.check(Io());
				}
			});
		}), $s = c("ZodString", (e, t) => {
			Se.init(e, t), $t.init(e, t), e.email = (n) => e.check(Vr(Zs, n)), e.url = (n) => e.check(Yr(Ss, n)), e.jwt = (n) => e.check(po(Ms, n)), e.emoji = (n) => e.check(qr(xs, n)), e.guid = (n) => e.check(ft(Zt, n)), e.uuid = (n) => e.check(Gr(ge, n)), e.uuidv4 = (n) => e.check(Wr(ge, n)), e.uuidv6 = (n) => e.check(Hr(ge, n)), e.uuidv7 = (n) => e.check(Kr(ge, n)), e.nanoid = (n) => e.check(Xr(Os, n)), e.guid = (n) => e.check(ft(Zt, n)), e.cuid = (n) => e.check(Qr(js, n)), e.cuid2 = (n) => e.check(eo(Ns, n)), e.ulid = (n) => e.check(to(Es, n)), e.base64 = (n) => e.check(co(Ds, n)), e.base64url = (n) => e.check(uo(Us, n)), e.xid = (n) => e.check(no(Is, n)), e.ksuid = (n) => e.check(ro(Ps, n)), e.ipv4 = (n) => e.check(oo(Ts, n)), e.ipv6 = (n) => e.check(so(As, n)), e.cidrv4 = (n) => e.check(io(Rs, n)), e.cidrv6 = (n) => e.check(ao(Cs, n)), e.e164 = (n) => e.check(lo(Fs, n)), e.datetime = (n) => e.check(ss(n)), e.date = (n) => e.check(as(n)), e.time = (n) => e.check(us(n)), e.duration = (n) => e.check(ds(n));
		});
		function v(e) {
			return Br($s, e);
		}
		const z = c("ZodStringFormat", (e, t) => {
			k.init(e, t), $t.init(e, t);
		}), Zs = c("ZodEmail", (e, t) => {
			Qn.init(e, t), z.init(e, t);
		}), Zt = c("ZodGUID", (e, t) => {
			qn.init(e, t), z.init(e, t);
		}), ge = c("ZodUUID", (e, t) => {
			Xn.init(e, t), z.init(e, t);
		}), Ss = c("ZodURL", (e, t) => {
			er.init(e, t), z.init(e, t);
		}), xs = c("ZodEmoji", (e, t) => {
			tr.init(e, t), z.init(e, t);
		}), Os = c("ZodNanoID", (e, t) => {
			nr.init(e, t), z.init(e, t);
		}), js = c("ZodCUID", (e, t) => {
			rr.init(e, t), z.init(e, t);
		}), Ns = c("ZodCUID2", (e, t) => {
			or.init(e, t), z.init(e, t);
		}), Es = c("ZodULID", (e, t) => {
			sr.init(e, t), z.init(e, t);
		}), Is = c("ZodXID", (e, t) => {
			ir.init(e, t), z.init(e, t);
		}), Ps = c("ZodKSUID", (e, t) => {
			ar.init(e, t), z.init(e, t);
		}), Ts = c("ZodIPv4", (e, t) => {
			pr.init(e, t), z.init(e, t);
		}), As = c("ZodIPv6", (e, t) => {
			fr.init(e, t), z.init(e, t);
		}), Rs = c("ZodCIDRv4", (e, t) => {
			hr.init(e, t), z.init(e, t);
		}), Cs = c("ZodCIDRv6", (e, t) => {
			mr.init(e, t), z.init(e, t);
		}), Ds = c("ZodBase64", (e, t) => {
			br.init(e, t), z.init(e, t);
		}), Us = c("ZodBase64URL", (e, t) => {
			_r.init(e, t), z.init(e, t);
		}), Fs = c("ZodE164", (e, t) => {
			vr.init(e, t), z.init(e, t);
		}), Ms = c("ZodJWT", (e, t) => {
			kr.init(e, t), z.init(e, t);
		}), St = c("ZodNumber", (e, t) => {
			et.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (r, o, s) => Fo(e, r, o, s), oe(e, "ZodNumber", {
				gt(r, o) {
					return this.check(mt(r, o));
				},
				gte(r, o) {
					return this.check(je(r, o));
				},
				min(r, o) {
					return this.check(je(r, o));
				},
				lt(r, o) {
					return this.check(ht(r, o));
				},
				lte(r, o) {
					return this.check(Oe(r, o));
				},
				max(r, o) {
					return this.check(Oe(r, o));
				},
				int(r) {
					return this.check(xt(r));
				},
				safe(r) {
					return this.check(xt(r));
				},
				positive(r) {
					return this.check(mt(0, r));
				},
				nonnegative(r) {
					return this.check(je(0, r));
				},
				negative(r) {
					return this.check(ht(0, r));
				},
				nonpositive(r) {
					return this.check(Oe(0, r));
				},
				multipleOf(r, o) {
					return this.check(bt(r, o));
				},
				step(r, o) {
					return this.check(bt(r, o));
				},
				finite() {
					return this;
				}
			});
			const n = e._zod.bag;
			e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
		});
		function F(e) {
			return go(St, e);
		}
		const Ls = c("ZodNumberFormat", (e, t) => {
			wr.init(e, t), St.init(e, t);
		});
		function xt(e) {
			return _o(Ls, e);
		}
		const Js = c("ZodBoolean", (e, t) => {
			zr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Mo(e, n, r, o);
		});
		function I(e) {
			return vo(Js, e);
		}
		const Bs = c("ZodUnknown", (e, t) => {
			$r.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => void 0;
		});
		function Ot() {
			return yo(Bs);
		}
		const Vs = c("ZodNever", (e, t) => {
			Zr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Lo(e, n, r, o);
		});
		function Gs(e) {
			return ko(Vs, e);
		}
		const Ws = c("ZodArray", (e, t) => {
			Sr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Wo(e, n, r, o), e.element = t.element, oe(e, "ZodArray", {
				min(n, r) {
					return this.check(me(n, r));
				},
				nonempty(n) {
					return this.check(me(1, n));
				},
				max(n, r) {
					return this.check(gt(n, r));
				},
				length(n, r) {
					return this.check(_t(n, r));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function se(e, t) {
			return Po(Ws, e, t);
		}
		const Hs = c("ZodObject", (e, t) => {
			Or.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ho(e, n, r, o), _(e, "shape", () => t.shape), oe(e, "ZodObject", {
				keyof() {
					return Qs(Object.keys(this._zod.def.shape));
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
						catchall: Ot()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: Ot()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: Gs()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(n) {
					return Vt(this, n);
				},
				safeExtend(n) {
					return Gt(this, n);
				},
				merge(n) {
					return Wt(this, n);
				},
				pick(n) {
					return Jt(this, n);
				},
				omit(n) {
					return Bt(this, n);
				},
				partial(...n) {
					return Ht(jt, this, n[0]);
				},
				required(...n) {
					return Kt(It, this, n[0]);
				}
			});
		});
		function R(e, t) {
			return new Hs({
				type: "object",
				shape: e ?? {},
				...f(t)
			});
		}
		const Ks = c("ZodUnion", (e, t) => {
			jr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ko(e, n, r, o), e.options = t.options;
		});
		function Ys(e, t) {
			return new Ks({
				type: "union",
				options: e,
				...f(t)
			});
		}
		const qs = c("ZodIntersection", (e, t) => {
			Nr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Yo(e, n, r, o);
		});
		function Xs(e, t) {
			return new qs({
				type: "intersection",
				left: e,
				right: t
			});
		}
		const Ne = c("ZodEnum", (e, t) => {
			Er.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (r, o, s) => Bo(e, r, o, s), e.enum = t.entries, e.options = Object.values(t.entries);
			const n = new Set(Object.keys(t.entries));
			e.extract = (r, o) => {
				const s = {};
				for (const i of r) if (n.has(i)) s[i] = t.entries[i];
				else throw new Error("Key ".concat(i, " not found in enum"));
				return new Ne({
					...t,
					checks: [],
					...f(o),
					entries: s
				});
			}, e.exclude = (r, o) => {
				const s = { ...t.entries };
				for (const i of r) if (n.has(i)) delete s[i];
				else throw new Error("Key ".concat(i, " not found in enum"));
				return new Ne({
					...t,
					checks: [],
					...f(o),
					entries: s
				});
			};
		});
		function Qs(e, t) {
			return new Ne({
				type: "enum",
				entries: Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e,
				...f(t)
			});
		}
		const ei = c("ZodTransform", (e, t) => {
			Ir.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Go(e, n, r, o), e._zod.parse = (n, r) => {
				if (r.direction === "backward") throw new Re(e.constructor.name);
				n.addIssue = (s) => {
					if (typeof s == "string") n.issues.push(ne(s, n.value, t));
					else {
						const i = s;
						i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), i.input ?? (i.input = n.value), i.inst ?? (i.inst = e), n.issues.push(ne(i));
					}
				};
				const o = t.transform(n.value, n);
				return o instanceof Promise ? o.then((s) => (n.value = s, n.fallback = !0, n)) : (n.value = o, n.fallback = !0, n);
			};
		});
		function ti(e) {
			return new ei({
				type: "transform",
				transform: e
			});
		}
		const jt = c("ZodOptional", (e, t) => {
			at.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => wt(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function Nt(e) {
			return new jt({
				type: "optional",
				innerType: e
			});
		}
		const ni = c("ZodExactOptional", (e, t) => {
			Pr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => wt(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function ri(e) {
			return new ni({
				type: "optional",
				innerType: e
			});
		}
		const oi = c("ZodNullable", (e, t) => {
			Tr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => qo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function Et(e) {
			return new oi({
				type: "nullable",
				innerType: e
			});
		}
		const si = c("ZodDefault", (e, t) => {
			Ar.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Qo(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
		});
		function ii(e, t) {
			return new si({
				type: "default",
				innerType: e,
				get defaultValue() {
					return typeof t == "function" ? t() : Me(t);
				}
			});
		}
		const ai = c("ZodPrefault", (e, t) => {
			Rr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => es(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function ci(e, t) {
			return new ai({
				type: "prefault",
				innerType: e,
				get defaultValue() {
					return typeof t == "function" ? t() : Me(t);
				}
			});
		}
		const It = c("ZodNonOptional", (e, t) => {
			Cr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Xo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function ui(e, t) {
			return new It({
				type: "nonoptional",
				innerType: e,
				...f(t)
			});
		}
		const li = c("ZodCatch", (e, t) => {
			Dr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => ts(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
		});
		function di(e, t) {
			return new li({
				type: "catch",
				innerType: e,
				catchValue: typeof t == "function" ? t : () => t
			});
		}
		const pi = c("ZodPipe", (e, t) => {
			Ur.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => ns(e, n, r, o), e.in = t.in, e.out = t.out;
		});
		function Pt(e, t) {
			return new pi({
				type: "pipe",
				in: e,
				out: t
			});
		}
		const fi = c("ZodReadonly", (e, t) => {
			Fr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => rs(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
		});
		function hi(e) {
			return new fi({
				type: "readonly",
				innerType: e
			});
		}
		const mi = c("ZodCustom", (e, t) => {
			Mr.init(e, t), Z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Vo(e, n, r, o);
		});
		function bi(e, t = {}) {
			return To(mi, e, t);
		}
		function gi(e, t) {
			return Ao(e, t);
		}
		function _i(e) {
			const t = /^dsh-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(e);
			return t === null ? null : "".concat(t[1], "-").concat(t[2], "-").concat(t[3], " ").concat(t[4], ":").concat(t[5], ":").concat(t[6]);
		}
		function vi(e, t) {
			return typeof e != "number" ? t("sizeUnknown") : e >= 1048576 ? "".concat((e / 1048576).toFixed(1), " MB") : "".concat(Math.max(1, Math.round(e / 1024)), " KB");
		}
		function yi({ panel: e, t }) {
			const [n, r] = (0, A.useState)(null), [o, s] = (0, A.useState)(null), [i, a] = (0, A.useState)(!1), [u, l] = (0, A.useState)(0), [d, g] = (0, A.useState)(""), [m, b] = (0, A.useState)(null), [y, x] = (0, A.useState)(""), [D, ee] = (0, A.useState)(null), [K, E] = (0, A.useState)(""), [w, S] = (0, A.useState)(null), C = () => {
				l((h) => h + 1);
			};
			(0, A.useEffect)(() => {
				let h = !0;
				return a(!1), Promise.all([e.status(), e.githubStatus()]).then(([V, U]) => {
					h && (r(V), s(U), U.repoRaw !== null && E(U.repoRaw));
				}, () => {
					h && (a(!0), r(null));
				}), () => {
					h = !1;
				};
			}, [e, u]);
			const T = async (h, V) => {
				g(h);
				try {
					const U = await V();
					b({
						ok: U.ok,
						text: U.summary || ""
					});
				} catch (U) {
					b({
						ok: !1,
						text: U instanceof Error ? U.message : String(U)
					});
				} finally {
					g("");
				}
			}, Ie = () => {
				T("backup", () => e.backup()).then(C);
			}, Mi = () => {
				T("verify-all", () => e.verify("all")).then(C);
			}, Li = (h) => {
				T("verify:".concat(h), () => e.verify(h));
			}, At = (h) => {
				T("auto", () => e.setAuto(h)).then(C);
			}, Ji = () => {
				T("github-sync", () => e.githubSyncNow()).then(C);
			}, Rt = (h) => {
				S(null), T("github-repo", () => e.setGithubRepo(h)).then(C);
			}, Bi = (h) => {
				S(null), T("delete:".concat(h), () => e.remove(h)).then(C);
			}, Vi = (h) => {
				ee(null), T("restore:".concat(h), async () => {
					const V = await e.restore(h, !0);
					return V.ok && ee({
						name: h,
						files: V.files ?? 0,
						sample: V.sample || []
					}), V;
				});
			}, Gi = () => {
				const h = D;
				h !== null && (ee(null), T("restore:".concat(h.name), () => e.restore(h.name, !1)).then(C));
			}, Wi = (h) => typeof window < "u" ? "".concat(window.location.origin, "/backup-download/").concat(encodeURIComponent(h)) : "", Hi = o === null || o.repo === null ? void 0 : o.tokenSet ? "ok" : "warn";
			return (0, p.jsxs)("div", {
				"data-dsh-backup": "",
				"aria-busy": d !== "",
				children: [
					n === null && !i ? (0, p.jsx)("p", {
						className: "dsb-status",
						children: t("loading")
					}) : null,
					i ? (0, p.jsxs)("div", {
						className: "dsb-failure",
						children: [(0, p.jsx)("p", {
							role: "alert",
							children: t("error")
						}), (0, p.jsx)("button", {
							type: "button",
							className: "dsb-btn-secondary",
							onClick: C,
							children: t("retry")
						})]
					}) : null,
					n !== null ? (0, p.jsxs)(p.Fragment, { children: [
						(0, p.jsxs)("div", {
							className: "dsb-card",
							children: [
								(0, p.jsxs)("h3", {
									className: "dsb-heading",
									children: [(0, p.jsx)("span", { children: t("overview") }), (0, p.jsx)("span", {
										className: "dsb-badge",
										"data-tone": n.autoHours > 0 ? "ok" : void 0,
										children: n.autoHours > 0 ? t("autoOnEvery").replace("{n}", String(n.autoHours)) : t("autoOff")
									})]
								}),
								(0, p.jsxs)("dl", {
									className: "dsb-kv",
									children: [
										(0, p.jsx)("dt", { children: t("dshHome") }),
										(0, p.jsx)("dd", { children: n.dshHome }),
										(0, p.jsx)("dt", { children: t("destination") }),
										(0, p.jsx)("dd", { children: n.destination }),
										(0, p.jsx)("dt", { children: t("keepDefault") }),
										(0, p.jsxs)("dd", { children: [
											n.keepDefault,
											" ",
											t("copies")
										] }),
										(0, p.jsx)("dt", { children: t("lastAuto") }),
										(0, p.jsx)("dd", { children: n.lastAuto ?? t("none") })
									]
								}),
								(0, p.jsx)("div", { className: "dsb-divider" }),
								(0, p.jsxs)("div", {
									className: "dsb-row",
									children: [
										n.autoHours > 0 ? (0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "",
											onClick: () => {
												At(0);
											},
											children: t("disable")
										}) : (0, p.jsxs)(p.Fragment, { children: [(0, p.jsxs)("label", { children: [t("autoHoursLabel"), (0, p.jsx)("input", {
											type: "number",
											min: "1",
											max: "720",
											value: y,
											onChange: (h) => {
												x(h.target.value);
											}
										})] }), (0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "" || !(Number(y) >= 1 && Number(y) <= 720),
											onClick: () => {
												At(Math.floor(Number(y)));
											},
											children: t("enable")
										})] }),
										(0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "",
											onClick: Mi,
											children: t(d === "verify-all" ? "busy" : "verifyAll")
										}),
										(0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-primary",
											disabled: d !== "",
											onClick: Ie,
											children: t(d === "backup" ? "busy" : "backupNow")
										})
									]
								})
							]
						}),
						o !== null ? (0, p.jsxs)("div", {
							className: "dsb-card",
							children: [
								(0, p.jsxs)("h3", {
									className: "dsb-heading",
									children: [(0, p.jsx)("span", { children: t("githubTitle") }), o.repo !== null ? (0, p.jsx)("span", {
										className: "dsb-badge",
										"data-tone": Hi,
										children: o.tokenSet ? t("githubTokenSet") : t("githubTokenMissing")
									}) : null]
								}),
								o.repo === null && K === "" ? (0, p.jsx)("p", {
									className: "dsb-status",
									children: t("githubNotConfigured")
								}) : null,
								(0, p.jsxs)("dl", {
									className: "dsb-kv",
									children: [
										(0, p.jsx)("dt", { children: t("githubRepo") }),
										(0, p.jsx)("dd", { children: o.repo ?? t("none") }),
										(0, p.jsx)("dt", { children: t("githubLastPush") }),
										(0, p.jsx)("dd", { children: o.lastPush ?? t("none") }),
										o.lastError !== null ? (0, p.jsxs)(p.Fragment, { children: [(0, p.jsx)("dt", { children: t("githubError") }), (0, p.jsx)("dd", { children: o.lastError })] }) : null
									]
								}),
								(0, p.jsxs)("div", {
									className: "dsb-row",
									children: [
										(0, p.jsxs)("label", { children: [t("githubRepoLabel"), (0, p.jsx)("input", {
											type: "text",
											placeholder: t("githubRepoPlaceholder"),
											value: K,
											onChange: (h) => {
												E(h.target.value);
											},
											style: { width: "18em" }
										})] }),
										(0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "" || K.trim() === "",
											onClick: () => {
												Rt(K.trim());
											},
											children: t("save")
										}),
										(0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "" || K.trim() === "",
											onClick: () => {
												E(""), Rt("");
											},
											children: t("clear")
										}),
										(0, p.jsx)("button", {
											type: "button",
											className: "dsb-btn-secondary",
											disabled: d !== "",
											onClick: Ji,
											children: t(d === "github-sync" ? "githubBusy" : "githubSyncNow")
										})
									]
								})
							]
						}) : null,
						m !== null ? (0, p.jsx)("p", {
							className: "dsb-banner",
							role: "status",
							"data-ok": m.ok ? "true" : "false",
							children: m.text
						}) : null,
						D !== null ? (0, p.jsxs)("div", {
							className: "dsb-preview",
							children: [
								(0, p.jsxs)("strong", { children: [
									t("restorePreviewTitle"),
									" — ",
									D.name,
									" · ",
									t("restoreEntries").replace("{n}", String(D.files))
								] }),
								(0, p.jsx)("ul", { children: D.sample.slice(0, 10).map((h) => (0, p.jsx)("li", { children: h }, h)) }),
								(0, p.jsx)("p", {
									className: "dsb-status",
									children: t("restartHint")
								}),
								(0, p.jsxs)("div", {
									className: "dsb-row",
									children: [(0, p.jsx)("button", {
										type: "button",
										className: "dsb-btn-danger",
										disabled: d !== "",
										onClick: Gi,
										children: t("confirmRestore")
									}), (0, p.jsx)("button", {
										type: "button",
										className: "dsb-btn-secondary",
										disabled: d !== "",
										onClick: () => {
											ee(null);
										},
										children: t("cancel")
									})]
								})
							]
						}) : null,
						(0, p.jsxs)("div", {
							className: "dsb-card",
							children: [(0, p.jsxs)("h3", {
								className: "dsb-heading",
								children: [(0, p.jsx)("span", { children: t("backupsTitle") }), (0, p.jsx)("span", {
									className: "dsb-badge",
									children: n.backups.length
								})]
							}), n.backups.length === 0 ? (0, p.jsx)("p", {
								className: "dsb-empty",
								children: t("noBackups")
							}) : (0, p.jsx)("ul", {
								className: "dsb-list",
								children: n.backups.map((h) => (0, p.jsxs)("li", {
									className: "dsb-item",
									children: [
										(0, p.jsx)("span", {
											className: "dsb-item-name",
											title: h.name,
											children: h.name
										}),
										(0, p.jsx)("span", {
											className: "dsb-item-meta",
											children: _i(h.name) ?? t("sizeUnknown")
										}),
										(0, p.jsx)("span", {
											className: "dsb-item-meta",
											children: vi(h.size, t)
										}),
										(0, p.jsxs)("span", {
											className: "dsb-item-actions",
											children: [
												n.downloadAvailable ? (0, p.jsx)("a", {
													href: Wi(h.name),
													download: h.name,
													children: t("download")
												}) : null,
												(0, p.jsx)("button", {
													type: "button",
													className: "dsb-btn-secondary",
													disabled: d !== "",
													onClick: () => {
														Li(h.name);
													},
													children: d === "verify:".concat(h.name) ? t("busy") : t("verify")
												}),
												(0, p.jsx)("button", {
													type: "button",
													className: "dsb-btn-secondary",
													disabled: d !== "",
													onClick: () => {
														Vi(h.name);
													},
													children: d === "restore:".concat(h.name) ? t("busy") : t("restore")
												}),
												w === h.name ? (0, p.jsx)("button", {
													type: "button",
													className: "dsb-btn-danger",
													disabled: d !== "",
													onClick: () => {
														Bi(h.name);
													},
													children: d === "delete:".concat(h.name) ? t("busy") : t("confirmDelete")
												}) : (0, p.jsx)("button", {
													type: "button",
													className: "dsb-btn-danger",
													disabled: d !== "",
													onClick: () => {
														S(h.name);
													},
													children: t("delete")
												})
											]
										})
									]
								}, h.name))
							})]
						})
					] }) : null
				]
			});
		}
		const ki = {
			tab: "备份",
			loading: "正在读取备份状态…",
			error: "暂时无法读取备份状态。",
			retry: "重试",
			overview: "备份总览",
			destination: "备份目录",
			dshHome: "数据目录",
			keepDefault: "默认保留",
			copies: "份",
			autoTitle: "定时自动备份",
			autoOnEvery: "每 {n} 小时一次（已持久化，重启续跑）",
			autoOff: "未开启",
			lastAuto: "上次自动备份",
			none: "—",
			autoHoursLabel: "间隔（小时，1~720）",
			enable: "开启",
			disable: "关闭",
			backupNow: "立即备份",
			verifyAll: "校验全部",
			backupsTitle: "已有备份",
			noBackups: "暂无备份。点击「立即备份」执行首次备份。",
			name: "名称",
			size: "大小",
			time: "时间",
			actions: "操作",
			verify: "校验",
			restore: "恢复",
			restorePreviewTitle: "恢复预览（未写入）",
			restoreEntries: "共 {n} 项",
			confirmRestore: "确认恢复",
			cancel: "取消",
			restartHint: "恢复完成后请重启 dsh 使会话与配置生效。",
			sizeUnknown: "—",
			busy: "处理中…",
			download: "下载",
			githubTitle: "GitHub 同步",
			githubRepo: "仓库",
			githubToken: "Token",
			githubTokenSet: "已配置",
			githubTokenMissing: "未配置（https 远端需要）",
			githubLastPush: "上次推送",
			githubError: "上次错误",
			githubNotConfigured: "未配置：在下方填写仓库地址，或在 cordis.yml 的 config.githubRepo 设置。",
			githubSyncNow: "立即同步",
			githubBusy: "同步中…",
			githubRepoLabel: "仓库地址",
			githubRepoPlaceholder: "owner/repo",
			save: "保存",
			clear: "清除",
			delete: "删除",
			confirmDelete: "确认删除？"
		}, wi = {
			tab: "Backup",
			loading: "Loading backup status…",
			error: "Failed to read backup status.",
			retry: "Retry",
			overview: "Overview",
			destination: "Destination",
			dshHome: "Data directory",
			keepDefault: "Default keep",
			copies: "copies",
			autoTitle: "Scheduled auto-backup",
			autoOnEvery: "Every {n} hours (persisted, survives restarts)",
			autoOff: "Off",
			lastAuto: "Last auto-backup",
			none: "—",
			autoHoursLabel: "Interval (hours, 1–720)",
			enable: "Enable",
			disable: "Disable",
			backupNow: "Back up now",
			verifyAll: "Verify all",
			backupsTitle: "Backups",
			noBackups: "No backups yet. Click \"Back up now\" for the first one.",
			name: "Name",
			size: "Size",
			time: "Time",
			actions: "Actions",
			verify: "Verify",
			restore: "Restore",
			restorePreviewTitle: "Restore preview (nothing written)",
			restoreEntries: "{n} entries",
			confirmRestore: "Confirm restore",
			cancel: "Cancel",
			restartHint: "Restart dsh after restore so sessions and settings take effect.",
			sizeUnknown: "—",
			busy: "Working…",
			download: "Download",
			githubTitle: "GitHub sync",
			githubRepo: "Repository",
			githubToken: "Token",
			githubTokenSet: "Configured",
			githubTokenMissing: "Missing (needed for https remotes)",
			githubLastPush: "Last push",
			githubError: "Last error",
			githubNotConfigured: "Not configured: enter a repository below, or set config.githubRepo in cordis.yml.",
			githubSyncNow: "Sync now",
			githubBusy: "Syncing…",
			githubRepoLabel: "Repository",
			githubRepoPlaceholder: "owner/repo",
			save: "Save",
			clear: "Clear",
			delete: "Delete",
			confirmDelete: "Confirm delete?"
		};
		function zi() {
			if (document.querySelector("style[data-dsh-backup]") !== null) return () => {};
			const e = document.createElement("style");
			return e.dataset.dshBackup = "", e.textContent = $i, document.head.append(e), () => {
				e.remove();
			};
		}
		const $i = "\n[data-dsh-backup] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 760px;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n}\n[data-dsh-backup] .dsb-status {\n  margin: 0;\n  font-size: 13px;\n  color: var(--dsw-alias-label-tertiary);\n}\n[data-dsh-backup] .dsb-failure {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  align-items: flex-start;\n}\n\n/* ── 卡片 ─────────────────────────────────────────────── */\n[data-dsh-backup] .dsb-card {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 14px 16px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n  transition: border-color .16s, background .16s;\n}\n[data-dsh-backup] .dsb-card:hover {\n  border-color: var(--dsw-alias-label-dimmed);\n}\n[data-dsh-backup] .dsb-heading {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n}\n[data-dsh-backup] .dsb-kv {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 6px 14px;\n  margin: 0;\n  font-size: 13px;\n}\n[data-dsh-backup] .dsb-kv dt {\n  color: var(--dsw-alias-label-tertiary);\n}\n[data-dsh-backup] .dsb-kv dd {\n  margin: 0;\n  min-width: 0;\n  word-break: break-all;\n  color: var(--dsw-alias-label-secondary);\n}\n[data-dsh-backup] .dsb-divider {\n  height: 1px;\n  background: var(--dsw-alias-border-l2);\n}\n\n/* ── 徽章 ─────────────────────────────────────────────── */\n[data-dsh-backup] .dsb-badge {\n  flex: none;\n  border-radius: 999px;\n  padding: 1px 9px;\n  font-size: 11px;\n  line-height: 18px;\n  font-weight: 500;\n  white-space: nowrap;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n}\n[data-dsh-backup] .dsb-badge[data-tone='ok'] {\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);\n  color: var(--dsw-alias-state-business-primary);\n}\n[data-dsh-backup] .dsb-badge[data-tone='warn'] {\n  background: color-mix(in srgb, var(--dsw-alias-label-error) 12%, transparent);\n  color: var(--dsw-alias-label-error);\n}\n\n/* ── 按钮 ─────────────────────────────────────────────── */\n[data-dsh-backup] button {\n  appearance: none;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  padding: 5px 14px;\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  cursor: pointer;\n}\n[data-dsh-backup] .dsb-btn-secondary {\n  border-color: var(--dsw-alias-border-l2);\n  background: none;\n  color: var(--dsw-alias-label-secondary);\n}\n[data-dsh-backup] .dsb-btn-secondary:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n[data-dsh-backup] .dsb-btn-primary {\n  background: var(--dsw-alias-label-primary);\n  color: var(--dsw-alias-bg-layer-3);\n}\n[data-dsh-backup] .dsb-btn-danger {\n  border-color: color-mix(in srgb, var(--dsw-alias-label-error) 45%, transparent);\n  background: none;\n  color: var(--dsw-alias-label-error);\n}\n[data-dsh-backup] button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n[data-dsh-backup] button:focus-visible,\n[data-dsh-backup] a:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 1px;\n}\n\n/* ── 操作行 ───────────────────────────────────────────── */\n[data-dsh-backup] .dsb-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n}\n[data-dsh-backup] .dsb-row input {\n  width: 8em;\n  font: inherit;\n  font-size: 13px;\n  padding: 4px 10px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  color: inherit;\n  background: var(--dsw-alias-bg-layer-2);\n}\n[data-dsh-backup] .dsb-row input:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 1px;\n}\n[data-dsh-backup] .dsb-row label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 13px;\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* ── 备份列表（卡片行，非表格） ─────────────────────────── */\n[data-dsh-backup] .dsb-list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n}\n[data-dsh-backup] .dsb-item {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto auto;\n  align-items: center;\n  gap: 14px;\n  padding: 10px 2px;\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n[data-dsh-backup] .dsb-item:first-child {\n  border-top: 0;\n}\n[data-dsh-backup] .dsb-item:hover {\n  background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);\n  margin: 0 -8px;\n  padding-left: 10px;\n  padding-right: 10px;\n  border-radius: 8px;\n}\n[data-dsh-backup] .dsb-item-name {\n  min-width: 0;\n  font-size: 13px;\n  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;\n  word-break: break-all;\n  color: var(--dsw-alias-label-primary);\n}\n[data-dsh-backup] .dsb-item-meta {\n  font-size: 12px;\n  white-space: nowrap;\n  color: var(--dsw-alias-label-tertiary);\n}\n[data-dsh-backup] .dsb-item-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n[data-dsh-backup] .dsb-item-actions button,\n[data-dsh-backup] .dsb-item-actions a {\n  padding: 3px 10px;\n  font-size: 12px;\n}\n[data-dsh-backup] .dsb-item-actions a {\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  text-decoration: none;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  line-height: 1.5;\n}\n[data-dsh-backup] .dsb-item-actions a:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n[data-dsh-backup] .dsb-empty {\n  margin: 0;\n  padding: 12px 0 4px;\n  font-size: 13px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* ── 结果横幅 ─────────────────────────────────────────── */\n[data-dsh-backup] .dsb-banner {\n  margin: 0;\n  padding: 10px 14px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-3);\n  font-size: 13px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n[data-dsh-backup] .dsb-banner[data-ok='true'] {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);\n  color: var(--dsw-alias-label-primary);\n}\n[data-dsh-backup] .dsb-banner[data-ok='false'] {\n  border-color: color-mix(in srgb, var(--dsw-alias-label-error) 45%, transparent);\n  color: var(--dsw-alias-label-error);\n}\n\n/* ── 恢复预览 ─────────────────────────────────────────── */\n[data-dsh-backup] .dsb-preview {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 14px;\n  border: 1px dashed var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-2);\n  font-size: 13px;\n}\n[data-dsh-backup] .dsb-preview strong {\n  font-weight: 600;\n}\n[data-dsh-backup] .dsb-preview ul {\n  margin: 0;\n  padding-left: 1.2em;\n  color: var(--dsw-alias-label-secondary);\n  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;\n  font-size: 12px;\n  max-height: 10em;\n  overflow: auto;\n}\n", _e = "settings.backupPanel", Zi = "@dsh-selfuse/backup", Si = [
			"slots",
			"locale",
			"remote"
		], xi = R({
			destination: v(),
			dshHome: v(),
			keepDefault: F().int(),
			autoHours: F().int(),
			lastAuto: v().nullable(),
			downloadAvailable: I(),
			backups: se(R({
				name: v(),
				size: F().int().nullable()
			}))
		}), Oi = R({
			ok: I(),
			summary: v(),
			path: v(),
			sha: v(),
			stale: F().int(),
			keep: F().int()
		}), ji = R({
			ok: I(),
			summary: v(),
			results: se(R({
				name: v(),
				ok: I(),
				note: v()
			}))
		}), Ni = R({
			ok: I(),
			dryRun: I(),
			summary: v(),
			archive: v().nullable().optional(),
			files: F().int().nullable().optional(),
			aside: v().nullable().optional(),
			snapshotPath: v().nullable().optional(),
			sample: se(v()).optional()
		}), Ei = R({
			ok: I(),
			hours: F().int(),
			summary: v()
		}), Ii = R({
			repoRaw: v().nullable(),
			repo: v().nullable(),
			tokenSet: I(),
			syncDir: v(),
			lastPush: v().nullable(),
			lastError: v().nullable()
		}), Pi = R({
			ok: I(),
			summary: v(),
			pushed: I(),
			tooBig: se(v())
		}), Ti = R({
			ok: I(),
			summary: v()
		}), Ai = R({
			ok: I(),
			repo: v().nullable(),
			summary: v()
		}), Ri = {
			name: "keep",
			wire: "keep",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "@dsh-selfuse/backup/types#keep",
				create: () => F().int().positive().optional()
			},
			acceptsUndefined: !0
		}, Ee = {
			name: "selector",
			wire: "selector",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "@dsh-selfuse/backup/types#selector",
				create: () => v().optional()
			},
			acceptsUndefined: !0
		}, Ci = {
			name: "dryRun",
			wire: "dryRun",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "@dsh-selfuse/backup/types#dryRun",
				create: () => I().optional()
			},
			acceptsUndefined: !0
		}, Di = {
			name: "hours",
			wire: "hours",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "@dsh-selfuse/backup/types#hours",
				create: () => F().int().min(0).max(720)
			},
			acceptsUndefined: !0
		}, Ui = {
			name: "repo",
			wire: "repo",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "@dsh-selfuse/backup/types#repo",
				create: () => v().optional()
			},
			acceptsUndefined: !0
		};
		function M(e, t, n, r) {
			return Object.freeze({
				id: "@dsh-selfuse/backup#backupPanel/".concat(e),
				service: "backupPanel",
				namespace: "backupPanel",
				method: e,
				invocation: Object.freeze({ kind: "direct" }),
				parameters: Object.freeze(t.map((o) => Object.freeze({
					...o,
					codec: Object.freeze(o.codec)
				}))),
				...r ? { cancellation: Object.freeze({ parameter: "signal" }) } : {},
				result: Object.freeze({
					mode: "strict",
					typeSymbol: "@dsh-selfuse/backup/types#".concat(e, "Result"),
					create: () => n
				})
			});
		}
		const Tt = Object.freeze({
			package: "@dsh-selfuse/backup",
			descriptors: Object.freeze([
				M("status", [], xi, !1),
				M("backup", [Ri], Oi, !0),
				M("verify", [Ee], ji, !0),
				M("restore", [Ee, Ci], Ni, !0),
				M("setAuto", [Di], Ei, !1),
				M("githubStatus", [], Ii, !1),
				M("githubSyncNow", [], Pi, !0),
				M("deleteBackup", [Ee], Ti, !0),
				M("setGithubRepo", [Ui], Ai, !1)
			])
		});
		function L(e) {
			if (!e.ok) {
				const t = e.error;
				throw new Error("".concat(t.code, ": ").concat(t.message));
			}
			return e.value;
		}
		async function Fi(e) {
			e.effect(() => e.locale.register(_e, {
				zh: ki,
				en: wi
			}), "@dsh-selfuse/backup: dictionaries"), e.effect(() => zi(), "@dsh-selfuse/backup: stylesheet"), await e.remote.$mount(Tt), e.inject(["remote.backupPanel"], (t) => {
				const n = t.locale.bind(_e), r = () => t.remote.backupPanel, o = {
					status: async () => L(await r().status()),
					backup: async (s) => L(await r().backup(s)),
					verify: async (s) => L(await r().verify(s)),
					restore: async (s, i) => L(await r().restore(s, i)),
					setAuto: async (s) => L(await r().setAuto(s)),
					githubStatus: async () => L(await r().githubStatus()),
					githubSyncNow: async () => L(await r().githubSyncNow()),
					remove: async (s) => L(await r().deleteBackup(s)),
					setGithubRepo: async (s) => L(await r().setGithubRepo(s))
				};
				t.slots.inject("settings.plugins.tab", () => t.slots.register({
					name: "settings.plugins.tab",
					id: "backup",
					order: 35,
					label: () => n("tab"),
					locale: _e,
					inject: () => ({ panel: o })
				}, yi));
			});
		}
		return Y.BACKUP_REMOTE = Tt, Y.NS = _e, Y.apply = Fi, Y.inject = Si, Y.name = Zi, Te.exports;
	}
});

//# sourceMappingURL=client.js.map