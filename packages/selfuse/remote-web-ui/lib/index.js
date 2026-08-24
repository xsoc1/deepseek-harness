import { createRequire } from "node:module";
import { dirname, isAbsolute, join } from "node:path";
import { setInterval as setInterval$1, setTimeout as setTimeout$1 } from "node:timers";
import { Service } from "@deepseek-ai/cordis";
import z from "schemastery";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir, networkInterfaces } from "node:os";
import { z as z$1 } from "zod";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { RpcId } from "@deepseek-ai/dsh-host-apiproxy/api/rpc";
import http, { request } from "node:http";
import { connect } from "node:net";
import { Tunnel, bin, install } from "cloudflared";
import { spawn } from "node:child_process";
//#region ../../node_modules/.pnpm/@deepseek-ai+dsh-settings@0.1.1-rc.1_@deepseek-ai+cordis@4.0.1_@deepseek-ai+dsh-brand@0_8fb97b2935e1a5982886bc1738874e4d/node_modules/@deepseek-ai/dsh-settings/lib/index.js
/**
* Structural secret redaction for settings values. `role('secret')` fields are
* removed from a value before it crosses a wire boundary; a sidecar records
* each schema-declared secret position and whether it currently holds a value,
* so a configuration surface can render a write-only input without ever
* receiving the secret itself.
* @module @deepseek-ai/dsh-settings/redact
*/
/** Whether a value is a plain data object the walker may recurse into. */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function walk(node, value, path, secrets) {
	if (node === void 0) return value;
	if (node.meta?.role === "secret") {
		secrets.push({
			path,
			set: value !== void 0
		});
		return;
	}
	switch (node.type) {
		case "object": {
			const properties = node.dict ?? {};
			const source = isRecord(value) ? value : void 0;
			const rebuilt = {};
			if (source !== void 0) for (const [key, entry] of Object.entries(source)) {
				if (key in properties) continue;
				rebuilt[key] = entry;
			}
			for (const [key, child] of Object.entries(properties)) {
				const stripped = walk(child, source?.[key], [...path, key], secrets);
				if (stripped !== void 0) rebuilt[key] = stripped;
			}
			return source === void 0 && Object.keys(rebuilt).length === 0 ? value : rebuilt;
		}
		case "dict": {
			if (!isRecord(value)) return value;
			const rebuilt = {};
			for (const [key, entry] of Object.entries(value)) {
				const stripped = walk(node.inner, entry, [...path, key], secrets);
				if (stripped !== void 0) rebuilt[key] = stripped;
			}
			return rebuilt;
		}
		case "array":
			if (!Array.isArray(value)) return value;
			return value.map((entry, index) => walk(node.inner, entry, [...path, String(index)], secrets));
		default: return value;
	}
}
/**
* Service Definition for the user-settings capability seam (`ctx.settings`). Providers store one raw document of
* per-namespace sections; plugins register a namespace schema and read the
* resolved value, which layers schema defaults, the registrant's composition
* `base`, and the user document section, in that order.
* @module @deepseek-ai/dsh-settings
*/
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/;
/**
* Brand a raw string as a {@link SettingsNamespace}.
* @param value - candidate namespace; lowercase kebab-case, as in plugin short names.
* @returns the branded namespace.
*/
function settingsNamespace(value) {
	if (!NAMESPACE_PATTERN.test(value)) throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`);
	return value;
}
/**
* Deep equality over JSON-compatible data (objects, arrays, primitives) — the
* Service Definition's single change-detection predicate, exported so the invariant
* companion checks exactly the implementation's relation.
* @param a - one JSON-compatible value.
* @param b - the other JSON-compatible value.
* @returns whether the two values are structurally equal.
*/
function deepEqualJson(a, b) {
	if (a === b) return true;
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((entry, index) => deepEqualJson(entry, b[index]));
	}
	const left = a;
	const right = b;
	const keys = Object.keys(left);
	if (keys.length !== Object.keys(right).length) return false;
	return keys.every((key) => key in right && deepEqualJson(left[key], right[key]));
}
/** Whether a value is a plain data object (not an array, null, or class instance). */
function isPlainObject(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
/** Apply one path op to a detached section, returning the next section. */
function applyPathOp(section, op) {
	const [head, ...rest] = op.path;
	if (head === void 0) {
		if (op.op === "unset") return {};
		if (!isPlainObject(op.value)) throw new TypeError("settings mutate: setting the section root requires a plain object");
		return { ...op.value };
	}
	if (rest.length === 0) {
		if (op.op === "set") return {
			...section,
			[head]: op.value
		};
		const { [head]: _removed, ...kept } = section;
		return kept;
	}
	const child = section[head];
	if (!isPlainObject(child)) {
		if (op.op === "unset") return section;
		return {
			...section,
			[head]: applyPathOp({}, {
				...op,
				path: rest
			})
		};
	}
	return {
		...section,
		[head]: applyPathOp(child, {
			...op,
			path: rest
		})
	};
}
/**
* Layer `over` onto `under`: plain objects merge recursively, every other
* value (arrays included) replaces the lower layer wholesale. `over` never
* carries `undefined` entries — sections come from parsed documents and write
* snapshots pass {@link cloneJsonShaped}, which strips them so a sparse patch
* cannot erase lower keys.
*/
function mergeLayers(under, over) {
	if (over === void 0) return under;
	if (!isPlainObject(under) || !isPlainObject(over)) return over;
	const merged = { ...under };
	for (const [key, value] of Object.entries(over)) merged[key] = key in merged ? mergeLayers(merged[key], value) : value;
	return merged;
}
/** Recursively freeze one resolved value so handed-out snapshots stay immutable. */
function deepFreeze(value) {
	if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
	for (const entry of Object.values(value)) deepFreeze(entry);
	return Object.freeze(value);
}
Service.init;
/**
* Value mirror of the `FiberState` members {@link isUnloading} compares
* against: a const enum has no runtime object to import, and the value is
* needed at runtime (same rationale as the CLI boot driver's mirror).
*/
const FIBER_DISPOSED = 4;
const FIBER_UNLOADING = 5;
/** Whether the consumer's own fiber is tearing down (not just losing the settings service). */
function isUnloading(ctx) {
	const state = ctx.fiber.state;
	return state === FIBER_UNLOADING || state === FIBER_DISPOSED;
}
/**
* Install the canonical optional-settings consumer wiring: while a settings
* service exists, register `ns` with the consumer's composition entry as the
* `base` layer and point the source thunk at the resolved scope; when the
* service goes away (disposal, provider reload), fall back to the entry so
* the consumer keeps working exactly as composed. The registration rides the
* scoped fiber, so no settings service ever mounted means none of this runs.
* @param ctx - consumer plugin context owning the wiring.
* @param ns - the consumer-owned settings namespace.
* @param schema - schema resolving the namespace (typically the plugin Config).
* @param entry - the consumer's composition entry config, used as `base`.
* @param hooks - source sink and change notification.
*/
function installSettingsSection(ctx, ns, schema, entry, hooks) {
	ctx.inject(["settings"], (sctx) => {
		const scope = sctx.settings.register(ns, schema, {
			base: entry,
			...hooks.validate === void 0 ? {} : { validate: hooks.validate }
		});
		hooks.setSource(() => scope.get());
		sctx.effect(() => () => {
			if (isUnloading(ctx)) return;
			hooks.setSource(() => entry);
			hooks.onChange();
		});
		hooks.onChange();
		scope.watch(() => {
			if (isUnloading(ctx)) return;
			hooks.onChange();
		});
	});
}
//#endregion
//#region src/pairing.ts
/**
* Pairing state machine: one active one-time token, a device-session table,
* and presence tracking. Pure TypeScript with injected clock/randomness so
* the whole security semantics are unit-testable without cordis. The
* cordis-facing surfaces (routes, the api/gate listener) live next door.
*
* Security invariants:
* - One active token at a time; `issue()` replaces it, so a refreshed QR
*   immediately invalidates the previous link.
* - A token is consumed by the first successful `accept()` — reuse is
*   refused with `'used'`.
* - Tokens expire; `accept()` on an expired token is refused like an
*   unknown one (no oracle for validity).
* - `stop()` revokes every device session and clears the token, so paired
*   devices are cut off on their next gated request.
* - `revoke()` drops one device session; idle sessions older than
*   `idleExpireMs` are deleted on sweep, load, and the next gated request.
*/
/** Default idle-expiry window: 7 days without heartbeat or a gated request. */
const DEFAULT_IDLE_EXPIRE_MS = 10080 * 60 * 1e3;
/** Cap on the persisted/displayed User-Agent string. */
const MAX_USER_AGENT_CHARS = 180;
/** Thrown by issue() for an address outside the sampled LAN literals. */
var UnknownLanAddressError = class extends Error {
	/**
	* @param address - the offending literal.
	*/
	constructor(address) {
		super(`remote-web-ui: unknown LAN address ${JSON.stringify(address)}`);
		this.name = "UnknownLanAddressError";
	}
};
/** Real clock/entropy: 32 random hex chars per token. */
const defaultClock = {
	now: () => Date.now(),
	randomToken: () => randomBytes(16).toString("hex")
};
/**
* The pairing state machine. All mutations notify state listeners after the
* commit point that makes them true, and notification dedupes against the
* last emitted snapshot — time-driven transitions (a device aging offline)
* surface on the next sweep without any mutation.
*/
var PairingService = class {
	config;
	clock;
	tokens = /* @__PURE__ */ new Map();
	devices = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	lastEmitted;
	stopped = false;
	tokenSerial = 0;
	/** LAN base URLs keyed by the advertised IP literal (interface order). */
	lanBases = /* @__PURE__ */ new Map();
	/** Public (tunneled) base URL, e.g. a Cloudflare Tunnel quick URL. */
	publicBase;
	/** Auto-tunnel status, while the auto-tunnel feature is active. */
	tunnelStatus;
	posture;
	/** True when lastSeenAt changed since the last persist (flushed on sweep). */
	dirty = false;
	/**
	* @param config - tunables. The settings surface replaces the object (a
	* fresh literal) when a committed section changes; every operation reads
	* the current one.
	* @param clock - clock/entropy source (injectable for tests).
	*/
	constructor(config, clock = defaultClock) {
		this.config = config;
		this.clock = clock;
		this.loadPersisted();
	}
	/**
	* Restore device sessions persisted by a previous process run. A corrupt
	* or missing file is tolerated (an empty device table, never a throw) —
	* persistence is an availability convenience, not a security boundary.
	*/
	loadPersisted() {
		const file = this.config.devicesFile;
		if (file === void 0) return;
		try {
			const saved = JSON.parse(readFileSync(file, "utf8"));
			if (typeof saved !== "object" || saved === null) return;
			for (const [deviceId, session] of Object.entries(saved)) {
				if (typeof deviceId !== "string") continue;
				if (typeof session !== "object" || session === null) continue;
				const { createdAt, lastSeenAt, userAgent } = session;
				if (typeof createdAt !== "number" || typeof lastSeenAt !== "number") continue;
				const label = typeof userAgent === "string" ? sanitizeUserAgent(userAgent) : void 0;
				this.devices.set(deviceId, {
					createdAt,
					lastSeenAt,
					...label !== void 0 ? { userAgent: label } : {}
				});
			}
			this.clampToMaxDevices();
			if (this.evictIdle()) this.persist();
		} catch {}
	}
	/** FIFO-cap the device table (a persisted file may outlive a lowered cap). */
	clampToMaxDevices() {
		if (this.devices.size <= this.config.maxDevices) return;
		const overflow = this.devices.size - this.config.maxDevices;
		const ordered = [...this.devices.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
		for (const [id] of ordered.slice(0, overflow)) this.devices.delete(id);
	}
	/** Drop sessions whose lastSeenAt is older than idleExpireMs. */
	evictIdle() {
		const now = this.clock.now();
		const limit = this.config.idleExpireMs ?? 6048e5;
		let removed = false;
		for (const [id, session] of [...this.devices]) if (now - session.lastSeenAt > limit) {
			this.devices.delete(id);
			removed = true;
		}
		return removed;
	}
	/**
	* Write the current device table to the configured file. Called on the
	* mutation boundaries that change the set of live sessions (accept, stop,
	* revoke, idle eviction) and, throttled, from sweep() so lastSeenAt
	* survives a restart without a write per request.
	*
	* Device ids are session credentials (the gate authorizes requests by the
	* cookie's device id), so the file is written 0600 via a temp file and
	* atomic rename; a crash mid-write can never leave a half-written store.
	*/
	persist() {
		const file = this.config.devicesFile;
		if (file === void 0) return;
		try {
			mkdirSync(dirname(file), { recursive: true });
			const temp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
			const payload = {};
			for (const [id, session] of this.devices) payload[id] = session;
			writeFileSync(temp, JSON.stringify(payload), { mode: 384 });
			renameSync(temp, file);
			this.dirty = false;
		} catch (error) {
			console.error("remote-web-ui: failed to persist paired devices", error);
		}
	}
	/** The default LAN base URL (the first interface; undefined when not LAN-reachable). */
	get lanBaseUrl() {
		return this.lanBases.values().next().value;
	}
	/** The LAN base URL for one specific literal (undefined when not constructible). */
	lanBaseUrlFor(address) {
		return this.lanBases.get(address);
	}
	/** The LAN IP literals QR links can be built from (interface order). */
	get lanAddresses() {
		return [...this.lanBases.keys()];
	}
	/** Set the LAN base URLs once the server bind is known (interface order). */
	setLanBases(entries) {
		this.lanBases = new Map(entries.map((entry) => [entry.address, entry.base]));
		this.notify();
	}
	/** The configured public (tunneled) base URL, when present. */
	get publicBaseUrl() {
		return this.publicBase;
	}
	/** Set or clear the public base URL (a tunnel in front of this server). */
	setPublicBaseUrl(url) {
		this.publicBase = url;
		this.notify();
	}
	/** Set or clear the auto-tunnel status frame (undefined when the feature is off). */
	setTunnelStatus(status) {
		this.tunnelStatus = status;
		this.notify();
	}
	/** Set the latest /api posture probe result (see posture.ts). */
	setPosture(snapshot) {
		this.posture = snapshot;
		this.notify();
	}
	/**
	* Issue a fresh token, replacing (invalidating) any previous one. A
	* stopped service re-arms through this call (the panel's refresh button).
	* @param workspaceId - optional workspace the QR link should land in.
	* @param address - optional LAN IP literal the QR must be built from; the
	* default is the public base (when configured) or the first interface.
	* Unknown addresses are refused.
	* @returns the token secret and its expiry.
	* @throws {Error} when no reachable base exists (no all-interfaces bind and
	* no public base) — callers surface this as the lan-required state instead
	* of minting an unusable QR.
	*/
	issue(workspaceId, address) {
		if (this.lanBases.size === 0 && this.publicBase === void 0) throw new Error("remote-web-ui: pairing requires a reachable bind (--host 0.0.0.0 or publicBaseUrl)");
		if (address !== void 0 && !this.lanBases.has(address)) throw new UnknownLanAddressError(address);
		const now = this.clock.now();
		const token = this.clock.randomToken();
		this.tokens.clear();
		this.stopped = false;
		this.tokenSerial += 1;
		this.tokens.set(token, {
			id: `t${this.tokenSerial}`,
			issuedAt: now,
			expiresAt: now + this.config.tokenTtlMs,
			consumed: false,
			...workspaceId !== void 0 ? { workspaceId } : {},
			...address !== void 0 ? { address } : {}
		});
		this.notify();
		return {
			token,
			expiresAt: now + this.config.tokenTtlMs
		};
	}
	/**
	* Consume a token and bind a device session. One-time: the second
	* successful call for the same token is impossible because the first
	* consumes it.
	* @param token - the token secret from the QR link.
	* @param userAgent - optional User-Agent header captured at accept.
	* @returns the new device id, or a refusal code.
	*/
	accept(token, userAgent) {
		const record = this.tokens.get(token);
		if (record === void 0 || record.consumed || this.stopped || this.clock.now() > record.expiresAt) return {
			ok: false,
			code: record?.consumed === true ? "used" : "invalid"
		};
		record.consumed = true;
		const deviceId = this.clock.randomToken();
		const now = this.clock.now();
		if (this.devices.size >= this.config.maxDevices) {
			let oldest;
			for (const [id, session] of this.devices) if (oldest === void 0 || session.createdAt < oldest.createdAt) oldest = {
				id,
				createdAt: session.createdAt
			};
			if (oldest !== void 0) this.devices.delete(oldest.id);
		}
		const label = sanitizeUserAgent(userAgent);
		this.devices.set(deviceId, {
			createdAt: now,
			lastSeenAt: now,
			...label !== void 0 ? { userAgent: label } : {}
		});
		this.persist();
		this.notify();
		return {
			ok: true,
			deviceId
		};
	}
	/**
	* Stop remote control: revoke every device session and clear the token.
	* The phone's next gated /api request 403s; the panel falls back to
	* stopped until a fresh QR is issued.
	*/
	stop() {
		this.tokens.clear();
		this.devices.clear();
		this.persist();
		this.stopped = true;
		this.notify();
	}
	/**
	* Revoke one paired device. The next gated request from that cookie is
	* refused; other sessions stay live. Unknown ids are a no-op.
	* @param deviceId - the cookie value of the device to drop.
	* @returns true when a live session was removed.
	*/
	revoke(deviceId) {
		if (this.stopped) return false;
		if (!this.devices.delete(deviceId)) return false;
		this.persist();
		this.notify();
		return true;
	}
	/**
	* The api/gate path: record activity for a device id and report whether
	* the request may proceed. Unknown or revoked ids (including any device
	* after stop() or idle expiry) are refused.
	* @param deviceId - the cookie value of the requesting device.
	* @returns true when the device session is live and was refreshed.
	*/
	touchDevice(deviceId) {
		const session = this.liveSession(deviceId);
		if (session === void 0) return false;
		session.lastSeenAt = this.clock.now();
		this.dirty = true;
		this.notify();
		return true;
	}
	/** Explicit presence heartbeat (the phone's client sends these). */
	heartbeat(deviceId) {
		return this.touchDevice(deviceId);
	}
	/**
	* Periodic sweep: drop idle sessions, flush a dirty lastSeenAt, and
	* re-evaluate the derived snapshot (a device aging past the offline
	* window flips the phase to disconnected). Emits only when the snapshot
	* actually changed.
	*/
	sweep() {
		if (this.evictIdle() || this.dirty) this.persist();
		this.notify();
	}
	/** The current snapshot (fresh object per call — stable between emits). */
	snapshot() {
		const now = this.clock.now();
		const devices = [...this.devices.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt).map(([id, session]) => this.toDeviceSnapshot(id, session, now));
		const onlineCount = devices.filter((device) => device.online).length;
		const token = this.activeToken();
		return {
			phase: this.derivePhase(onlineCount, token !== void 0),
			lanAvailable: this.lanBases.size > 0,
			lanAddresses: [...this.lanBases.keys()],
			...this.publicBase !== void 0 ? { publicUrl: this.publicBase } : {},
			...this.tunnelStatus !== void 0 ? { tunnel: this.tunnelStatus } : {},
			...this.posture !== void 0 ? { posture: this.posture } : {},
			...token !== void 0 ? {
				tokenId: token.record.id,
				tokenExpiresAt: token.record.expiresAt
			} : {},
			deviceCount: this.devices.size,
			onlineCount,
			devices
		};
	}
	/** Whether a cookie value names a currently live (non-idle) device session. */
	hasDevice(deviceId) {
		return this.liveSession(deviceId) !== void 0;
	}
	/** Subscribe to snapshot changes (each emit passes a fresh snapshot). */
	onState(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	activeToken() {
		for (const [token, record] of this.tokens) {
			if (this.stopped) return void 0;
			if (this.clock.now() > record.expiresAt) continue;
			return {
				token,
				record
			};
		}
	}
	/**
	* Return a live session, deleting it first when idle-expired. Side-effecting
	* so a stale cookie cannot pass the gate between sweeps.
	*/
	liveSession(deviceId) {
		if (this.stopped) return void 0;
		const session = this.devices.get(deviceId);
		if (session === void 0) return void 0;
		const limit = this.config.idleExpireMs ?? 6048e5;
		if (this.clock.now() - session.lastSeenAt > limit) {
			this.devices.delete(deviceId);
			this.persist();
			this.notify();
			return;
		}
		return session;
	}
	toDeviceSnapshot(id, session, now) {
		return {
			id,
			createdAt: session.createdAt,
			lastSeenAt: session.lastSeenAt,
			online: this.isOnlineAt(session, now),
			...session.userAgent !== void 0 ? { userAgent: session.userAgent } : {}
		};
	}
	derivePhase(onlineCount, hasToken) {
		if (this.lanBases.size === 0 && this.publicBase === void 0) return "lan-required";
		if (this.stopped) return "stopped";
		if (onlineCount > 0) return "connected";
		if (this.devices.size > 0) return "disconnected";
		if (hasToken) return "waiting";
		return "stopped";
	}
	isOnlineAt(session, now) {
		return now - session.lastSeenAt <= this.config.offlineAfterMs;
	}
	notify() {
		const snapshot = this.snapshot();
		if (this.lastEmitted !== void 0 && snapshotsEqual(this.lastEmitted, snapshot)) return;
		this.lastEmitted = snapshot;
		for (const listener of this.listeners) try {
			listener(snapshot);
		} catch (error) {
			console.error("remote-web-ui: pairing state listener failed", error);
		}
	}
};
/** Structural equality over the snapshot's wire fields. */
function snapshotsEqual(a, b) {
	return a.phase === b.phase && a.lanAvailable === b.lanAvailable && sameStrings(a.lanAddresses, b.lanAddresses) && a.publicUrl === b.publicUrl && tunnelEqual(a.tunnel, b.tunnel) && a.tokenId === b.tokenId && a.tokenExpiresAt === b.tokenExpiresAt && a.deviceCount === b.deviceCount && a.onlineCount === b.onlineCount && devicesEqual(a.devices, b.devices);
}
/** Per-device roster equality (order is pairing time). */
function devicesEqual(a, b) {
	return a.length === b.length && a.every((device, index) => {
		const other = b[index];
		return other !== void 0 && device.id === other.id && device.createdAt === other.createdAt && device.lastSeenAt === other.lastSeenAt && device.online === other.online && device.userAgent === other.userAgent;
	});
}
/** Tunnel frame equality (undefined equals undefined; fields compared shallowly). */
function tunnelEqual(a, b) {
	return a === b || a !== void 0 && b !== void 0 && a.state === b.state && a.url === b.url && a.error === b.error;
}
/** Element-wise string list equality (interface order is meaningful). */
function sameStrings(a, b) {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}
/** Strip control characters and cap the User-Agent stored with a session. */
function sanitizeUserAgent(raw) {
	if (raw === void 0) return void 0;
	const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
	if (cleaned === "") return void 0;
	return cleaned.length <= MAX_USER_AGENT_CHARS ? cleaned : cleaned.slice(0, MAX_USER_AGENT_CHARS);
}
//#endregion
//#region src/dsh-home.ts
/**
* DSH_HOME resolution shared by the plugin family's Host halves: the
* environment override wins, the platform home fallback follows. Mirrors
* what dsh-pet and dsh-liangshen each used to implement locally.
*/
/** Expand a leading ~ (or ~user) in a path, platform-style. */
function expandHome(path, home = homedir()) {
	if (path === "~") return home;
	if (path.startsWith("~/") || path.startsWith("~\\")) return join(home, path.slice(2));
	return path;
}
/**
* Resolve the DSH home directory.
* @param env - process environment to read DSH_HOME from.
* @param home - platform home directory fallback (test seam).
* @returns the absolute DSH home path.
*/
function resolveDshHome(env = process.env, home = homedir()) {
	const raw = env.DSH_HOME;
	if (raw !== void 0 && raw.trim() !== "") {
		const expanded = expandHome(raw.trim(), home);
		return isAbsolute(expanded) ? expanded : join(process.cwd(), expanded);
	}
	return join(home, ".dsh");
}
/** Resolve the DSH home directory from the live environment. */
function dshHome() {
	return resolveDshHome();
}
//#endregion
//#region src/loopback.ts
/** IPv4 127/8 predicate (four decimal octets, first == 127). */
function isIPv4Loopback(v4) {
	const parts = v4.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** Whether a socket remote address names the loopback range (127/8, ::1, IPv4-mapped). */
function isLoopbackAddress(address) {
	if (address === void 0) return false;
	const normalized = address.toLowerCase();
	if (normalized === "::1") return true;
	if (normalized.startsWith("::ffff:")) return isIPv4Loopback(normalized.slice(7));
	return isIPv4Loopback(normalized);
}
/** Whether a normalized URL hostname names the loopback authority (localhost, [::1], 127/8). */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	return isIPv4Loopback(hostname);
}
//#endregion
//#region src/gate.ts
/**
* Loopback classification for the desktop client. The predicates now live in
* the shared synced copy (shared/host/loopback.ts, mirrored to ./loopback.ts
* by scripts/sync-shared.mjs): localhost, IPv6 loopback, and any IPv4 address
* in 127/8.
* @param hostname - WHATWG URL hostname (IPv6 literals retain brackets).
* @returns true for localhost, IPv6 loopback, or any IPv4 address in 127/8.
*/
/**
* Read one cookie value from a Cookie header.
* @param header - the raw Cookie header value (or undefined).
* @param name - the cookie name.
* @returns the value, or undefined when absent.
*/
function readCookie(header, name) {
	if (header === void 0) return void 0;
	for (const part of header.split(";")) {
		const eq = part.indexOf("=");
		if (eq < 0) continue;
		if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
	}
}
/**
* The effective Host hostname of a request.
* @param request - node HTTP request.
* @returns the normalized hostname, or undefined when unparsable.
*/
function hostnameOf(request) {
	const host = request.headers.host;
	if (typeof host !== "string") return void 0;
	try {
		return new URL(`http://${host}`).hostname;
	} catch {
		return;
	}
}
/** Whether a request comes from the desktop loopback client (loopback socket AND loopback Host). */
function isLoopbackClient(request) {
	const hostname = hostnameOf(request);
	if (hostname === void 0 || !isLoopbackHostname(hostname)) return false;
	const socket = request.socket;
	return isLoopbackAddress(socket?.remoteAddress);
}
/**
* Build the api/gate listener for one pairing service.
* @param service - the pairing service.
* @param requirePairingForLan - when false, non-loopback requests pass
* without a device cookie (the feature then only manages tokens/status;
* revocation of paired devices still holds). A function is re-read per
* request, so a settings edit takes effect without a restart. Defaults to true.
* @param enabled - when false, every non-loopback request is vetoed while
* loopback stays available. A function is re-read per request so the fence
* stays mounted for the plugin lifetime and disabling the plugin cannot open
* a LAN-exposed /api. Defaults to true.
* @returns the cordis waterfall listener: call `next()` to delegate,
* return false (without calling it) to veto with 403.
*/
function makeGateListener(service, requirePairingForLan = true, enabled = true) {
	return (request, _method, next) => {
		if (isLoopbackClient(request)) return next();
		if (!(typeof enabled === "function" ? enabled() : enabled)) return false;
		if (!(typeof requirePairingForLan === "function" ? requirePairingForLan() : requirePairingForLan)) return next();
		return isPairedDeviceRequest(service, request) ? next() : false;
	};
}
/**
* Whether a request carries a live, non-revoked paired-device cookie for
* this service. Sibling host routes outside /api (aionui-panel, etc.) use
* the same check via the remoteWebUiPairing service.
* @param service - the pairing service that owns the device table.
* @param request - the incoming HTTP request.
* @returns true when the cookie names a live session (and lastSeenAt was refreshed).
*/
function isPairedDeviceRequest(service, request) {
	const deviceId = readCookie(request.headers.cookie, service.config.cookieName);
	if (deviceId === void 0) return false;
	return service.touchDevice(deviceId);
}
//#endregion
//#region src/pairing-access.ts
/** Named lookup key sibling plugins pass to ctx.get. */
const REMOTE_WEB_UI_PAIRING = "remoteWebUiPairing";
/**
* Pairing identity for one HTTP request. Structural: consumers must not
* import this class, only the method shape.
*/
var RemoteWebUiPairing = class extends Service {
	check;
	/**
	* @param ctx - host plugin context.
	* @param check - live cookie + session predicate (re-read per request).
	*/
	constructor(ctx, check) {
		super(ctx, REMOTE_WEB_UI_PAIRING);
		this.check = check;
	}
	/**
	* Whether the request carries a live paired-device cookie.
	* @param request - the incoming HTTP request.
	* @returns true when the session is live and was refreshed.
	*/
	isPairedDevice(request) {
		return this.check(request);
	}
};
//#endregion
//#region src/http.ts
/** One JSON response. */
function writeJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"referrer-policy": "no-referrer"
	});
	res.end(payload);
}
/**
* Read a request body up to maxBytes and parse it as JSON.
* @throws 'body too large' beyond the cap, or the JSON.parse error.
*/
async function readBoundedJson(req, maxBytes) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = chunk;
		size += buffer.length;
		if (size > maxBytes) throw new Error("body too large");
		chunks.push(buffer);
	}
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
//#endregion
//#region src/routes.ts
/**
* Browser-trust fence for the /api/pair routes, mirroring the connection
* package's internal fence semantics (Host/Origin based, DNS-rebinding and
* cross-site defense). The connection package no longer exports its trust
* predicate — the fence for the /api prefix lives inside the connection
* plugin — so the pairing routes, which must stay reachable from LAN phones
* ahead of the connection prefix route (exact routes match first), carry
* their own copy scoped to the literals the QR links advertise.
* @param request - the node HTTP request.
* @param trustedHosts - non-loopback authorities this surface serves: exact
* `host:port`, or port-less `host` matching any port.
* @returns true when the Host is ours (loopback or trusted) and any attached
* browser markers are same-origin.
*/
function isTrustedApiRequest(request, trustedHosts) {
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL(`http://${host}`);
	} catch {
		return false;
	}
	const hostname = hostUrl.hostname;
	if (!(isLoopbackClient(request) || trustedHosts.some((entry) => {
		const entryUrl = new URL(`http://${entry}`);
		return entryUrl.port === "" ? entryUrl.hostname === hostname : entryUrl.host === hostUrl.host;
	}))) return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
/** Cap on pairing request bodies (tokens and workspace ids are tiny). */
const MAX_BODY_BYTES = 4096;
/**
* The host authority of a configured public base URL, e.g. `foo.trycloudflare.com`
* from `https://foo.trycloudflare.com`. Undefined when the URL does not parse —
* a malformed config then simply contributes no fence entry (and the panel
* falls back to LAN-only URLs).
* @param url - the configured public base URL (or undefined).
* @returns the `host[:port]` authority the fence should trust.
*/
function publicHostOf(url) {
	if (url === void 0) return void 0;
	try {
		return new URL(url).host;
	} catch {
		return;
	}
}
/** Cookie lifetime: one year; revoked sessions die at the gate regardless. */
const COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;
/** Route paths (exact matches under /api). */
const PAIR_PATHS = {
	issue: "/api/pair/issue",
	accept: "/api/pair/accept",
	stop: "/api/pair/stop",
	revoke: "/api/pair/revoke",
	heartbeat: "/api/pair/heartbeat",
	status: "/api/pair/status",
	events: "/api/pair/events"
};
/**
* /api/pair request payload contracts. Each POST endpoint validates its body
* against one of these instead of reaching into a hand-parsed object: the
* control-plane endpoints that carry no meaningful payload use the permissive
* pairActionPayloadSchema so their smoke calls keep working unchanged, while
* issue/accept enforce their optional/required fields. Unknown (extra) keys
* are tolerated exactly as the previous manual reads ignored them.
*/
const issuePayloadSchema = z$1.object({
	workspaceId: z$1.string().min(1).optional(),
	address: z$1.string().min(1).optional()
});
const acceptPayloadSchema = z$1.object({ token: z$1.string().default("") });
const revokePayloadSchema = z$1.object({ deviceId: z$1.string().min(1) });
const pairActionPayloadSchema = z$1.object({}).passthrough();
/**
* Parse a pair request body through schema. A missing/empty or non-object
* body is treated as an empty object (the same way the previous manual reads
* yielded absent fields), and a value that fails the schema returns
* `undefined` so the caller can answer with the existing error shape.
*/
function parsePairPayload(schema, body) {
	const result = schema.safeParse(body ?? {});
	return result.success ? result.data : void 0;
}
/** Read a request body up to MAX_BODY_BYTES and parse it as JSON (undefined on failure). */
async function readJsonBody$1(req) {
	try {
		const parsed = await readBoundedJson(req, MAX_BODY_BYTES);
		return typeof parsed === "object" && parsed !== null ? parsed : void 0;
	} catch {
		return;
	}
}
/** The SSE fan-out for desktop panel status. */
var PairingEventsStream = class {
	streams = /* @__PURE__ */ new Set();
	/**
	* @param service - the pairing service whose snapshots are fanned out.
	*/
	constructor(service) {
		service.onState((snapshot) => {
			this.push(snapshot);
		});
	}
	/** Open one stream; the response is owned to completion. */
	open(req, res) {
		res.writeHead(200, {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache",
			connection: "keep-alive"
		});
		const stream = {
			res,
			closed: false
		};
		this.streams.add(stream);
		const close = () => {
			if (stream.closed) return;
			stream.closed = true;
			this.streams.delete(stream);
		};
		res.on("close", close);
		req.on("close", close);
	}
	/** Push one frame to every open stream (contained per stream). */
	push(snapshot) {
		const frame = `data: ${JSON.stringify({
			type: "state",
			...snapshot
		})}\n\n`;
		for (const stream of this.streams) try {
			stream.res.write(frame);
		} catch {
			stream.closed = true;
			this.streams.delete(stream);
		}
	}
	/** Stream count (tests/diagnostics). */
	get size() {
		return this.streams.size;
	}
};
/**
* Build the /api/pair route family.
* @param deps - service + fence inputs.
* @returns the exact routes to register on webServer.
*/
function makeRoutes(deps) {
	const { service, lanAddresses } = deps;
	const events = new PairingEventsStream(service);
	/** Loopback-only fence: the desktop panel's control endpoints. */
	const loopbackFence = (req) => isTrustedApiRequest(req, []);
	/** Phone-facing fence: loopback, the derived LAN literals, or the configured public host. */
	const lanFence = (req) => {
		const publicHost = publicHostOf(service.publicBaseUrl);
		return isTrustedApiRequest(req, publicHost === void 0 ? lanAddresses : [...lanAddresses, publicHost]);
	};
	const requireMethod = (req, res, method) => {
		if (req.method === method) return true;
		res.writeHead(405);
		res.end();
		return false;
	};
	/** Per-source-IP accept rate limit (brute-force defense in depth). */
	const acceptAttempts = /* @__PURE__ */ new Map();
	const ACCEPT_MAX_ATTEMPTS = 10;
	const ACCEPT_WINDOW_MS = 3e4;
	const rateLimitAccept = (req) => {
		const socketIp = req.socket?.remoteAddress ?? "unknown";
		const forwarded = typeof req.headers["x-forwarded-for"] === "string" ? (req.headers["x-forwarded-for"].split(",")[0] ?? "").trim() : void 0;
		const ip = forwarded === void 0 || forwarded === "" ? socketIp : socketIp + "|" + forwarded;
		const nowMs = Date.now();
		if (acceptAttempts.size > 256) {
			for (const [key, attempt] of acceptAttempts) if (nowMs - attempt.windowStart > ACCEPT_WINDOW_MS) acceptAttempts.delete(key);
		}
		const entry = acceptAttempts.get(ip);
		if (entry === void 0 || nowMs - entry.windowStart > ACCEPT_WINDOW_MS) {
			acceptAttempts.set(ip, {
				count: 1,
				windowStart: nowMs
			});
			return false;
		}
		entry.count += 1;
		return entry.count > ACCEPT_MAX_ATTEMPTS;
	};
	const handleIssue = async (req, res) => {
		if (!requireMethod(req, res, "POST")) return;
		if (!loopbackFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		const body = await readJsonBody$1(req);
		const payload = parsePairPayload(issuePayloadSchema, body);
		if (payload === void 0) {
			writeJson(res, 400, {
				ok: false,
				code: "bad-payload"
			});
			return;
		}
		const { workspaceId, address } = payload;
		try {
			const { token, expiresAt } = service.issue(workspaceId, address);
			const base = address === void 0 ? service.publicBaseUrl ?? service.lanBaseUrl : service.lanBaseUrlFor(address);
			if (base === void 0) throw new Error("remote-web-ui: base unavailable");
			writeJson(res, 200, {
				ok: true,
				url: `${base}/m/?pair=${token}${workspaceId === void 0 ? "" : `&workspace=${encodeURIComponent(workspaceId)}`}`,
				token,
				expiresAt,
				lanAddresses: service.lanAddresses,
				...service.publicBaseUrl !== void 0 ? { publicBaseUrl: service.publicBaseUrl } : {}
			});
		} catch (error) {
			const unknownAddress = error instanceof UnknownLanAddressError;
			writeJson(res, unknownAddress ? 400 : 409, {
				ok: false,
				code: unknownAddress ? "unknown-address" : "lan-required"
			});
		}
	};
	const handleAccept = async (req, res) => {
		if (!requireMethod(req, res, "POST")) return;
		if (!lanFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		if (rateLimitAccept(req)) {
			writeJson(res, 429, {
				ok: false,
				code: "rate-limited"
			});
			return;
		}
		const body = await readJsonBody$1(req);
		const payload = parsePairPayload(acceptPayloadSchema, body);
		if (payload === void 0) {
			writeJson(res, 400, {
				ok: false,
				code: "bad-payload"
			});
			return;
		}
		const ua = req.headers["user-agent"];
		const result = service.accept(payload.token, typeof ua === "string" ? ua : void 0);
		if (!result.ok) {
			writeJson(res, result.code === "used" ? 409 : 404, {
				ok: false,
				code: result.code
			});
			return;
		}
		res.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"set-cookie": [`${service.config.cookieName}=${result.deviceId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${String(COOKIE_MAX_AGE_SEC)}`]
		});
		res.end(JSON.stringify({
			ok: true,
			deviceId: result.deviceId
		}));
	};
	const handleStop = async (req, res) => {
		if (!requireMethod(req, res, "POST")) return;
		if (!loopbackFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		const body = await readJsonBody$1(req);
		if (parsePairPayload(pairActionPayloadSchema, body) === void 0) {
			writeJson(res, 400, {
				ok: false,
				code: "bad-payload"
			});
			return;
		}
		service.stop();
		writeJson(res, 200, { ok: true });
	};
	const handleRevoke = async (req, res) => {
		if (!requireMethod(req, res, "POST")) return;
		if (!loopbackFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		const body = await readJsonBody$1(req);
		const payload = parsePairPayload(revokePayloadSchema, body);
		if (payload === void 0) {
			writeJson(res, 400, {
				ok: false,
				code: "bad-payload"
			});
			return;
		}
		if (!service.revoke(payload.deviceId)) {
			writeJson(res, 404, {
				ok: false,
				code: "unknown-device"
			});
			return;
		}
		writeJson(res, 200, { ok: true });
	};
	const handleHeartbeat = async (req, res) => {
		if (!requireMethod(req, res, "POST")) return;
		if (!lanFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		const body = await readJsonBody$1(req);
		if (parsePairPayload(pairActionPayloadSchema, body) === void 0) {
			writeJson(res, 400, {
				ok: false,
				code: "bad-payload"
			});
			return;
		}
		const deviceId = readCookie(req.headers.cookie, service.config.cookieName);
		if (deviceId === void 0 || !service.heartbeat(deviceId)) {
			writeJson(res, 401, {
				ok: false,
				code: "unpaired"
			});
			return;
		}
		writeJson(res, 200, { ok: true });
	};
	const handleStatus = async (req, res) => {
		if (!requireMethod(req, res, "GET")) return;
		if (!lanFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		const deviceId = readCookie(req.headers.cookie, service.config.cookieName);
		const paired = deviceId !== void 0 && service.hasDevice(deviceId);
		const snapshot = service.snapshot();
		const { devices: _devices, ...rest } = snapshot;
		writeJson(res, 200, {
			ok: true,
			paired,
			...paired ? rest : {
				phase: snapshot.phase,
				lanAvailable: snapshot.lanAvailable,
				lanAddresses: snapshot.lanAddresses
			}
		});
	};
	const handleEvents = (req, res) => {
		if (!requireMethod(req, res, "GET")) return;
		if (!loopbackFence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		events.open(req, res);
		events.push(service.snapshot());
	};
	return [
		{
			kind: "exact",
			path: PAIR_PATHS.issue,
			handler: handleIssue
		},
		{
			kind: "exact",
			path: PAIR_PATHS.accept,
			handler: handleAccept
		},
		{
			kind: "exact",
			path: PAIR_PATHS.stop,
			handler: handleStop
		},
		{
			kind: "exact",
			path: PAIR_PATHS.revoke,
			handler: handleRevoke
		},
		{
			kind: "exact",
			path: PAIR_PATHS.heartbeat,
			handler: handleHeartbeat
		},
		{
			kind: "exact",
			path: PAIR_PATHS.status,
			handler: handleStatus
		},
		{
			kind: "exact",
			path: PAIR_PATHS.events,
			handler: handleEvents
		}
	];
}
//#endregion
//#region src/mobile-routes.ts
/**
* The mobile surface's page routes: /m canonicalizes to /m/, which serves the
* standalone phone UI. The page and worker live in the /m/ scope so the PWA
* can cache only its static shell; the paired-device data channel remains at
* /m/api and is never handled by the worker.
*/
const MOBILE_ROOT = "/m/";
const MOBILE_BUNDLE_URL = "/m/mobile.js";
const MOBILE_MANIFEST_URL = "/m/manifest.webmanifest";
const MOBILE_WORKER_URL = "/m/service-worker.js";
const MOBILE_OFFLINE_URL = "/m/offline.html";
/** The standalone mobile bundle (built artifact, next to this file's own lib output). */
function mobileBundlePath() {
	return fileURLToPath(new URL("../lib/mobile.js", import.meta.url));
}
/** A package asset available to the host after a registry or git install. */
function mobileAssetPath(name) {
	return fileURLToPath(new URL("../assets/" + name, import.meta.url));
}
/** The mobile page shell: self-contained, with no document-level user data. */
function pageHtml(bundleUrl) {
	return [
		"<!doctype html>",
		"<html lang=\"zh-CN\">",
		"<head>",
		"<meta charset=\"utf-8\">",
		"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover\">",
		"<meta name=\"theme-color\" content=\"#f3f5f9\">",
		"<meta name=\"referrer\" content=\"no-referrer\">",
		"<meta name=\"mobile-web-app-capable\" content=\"yes\">",
		"<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">",
		"<meta name=\"apple-mobile-web-app-title\" content=\"DSH Remote\">",
		"<link rel=\"manifest\" href=\"/m/manifest.webmanifest\">",
		"<link rel=\"apple-touch-icon\" href=\"/m/apple-touch-icon.png\">",
		"<title>远程访问</title>",
		"</head>",
		"<body>",
		"<div id=\"root\"></div>",
		"<script type=\"module\" src=\"" + bundleUrl + "\"><\/script>",
		"</body>",
		"</html>"
	].join("");
}
/** The installable app identity and icon declarations for the /m scope. */
function manifestJson() {
	return JSON.stringify({
		id: MOBILE_ROOT,
		name: "DSH Remote",
		short_name: "DSH Remote",
		start_url: MOBILE_ROOT,
		scope: MOBILE_ROOT,
		display: "standalone",
		background_color: "#151424",
		theme_color: "#f3f5f9",
		icons: [{
			src: "/m/icon-192.png",
			sizes: "192x192",
			type: "image/png",
			purpose: "any"
		}, {
			src: "/m/icon-512.png",
			sizes: "512x512",
			type: "image/png",
			purpose: "any maskable"
		}]
	}, null, 2);
}
/** A static fallback that contains no paired-device, session, or workspace data. */
function offlineHtml() {
	return [
		"<!doctype html>",
		"<html lang=\"zh-CN\">",
		"<head>",
		"<meta charset=\"utf-8\">",
		"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">",
		"<meta name=\"theme-color\" content=\"#151424\">",
		"<title>DSH Remote</title>",
		"<style>body{margin:0;background:#151424;color:#f3f5f9;font:16px system-ui,sans-serif}main{box-sizing:border-box;display:grid;min-height:100vh;place-content:center;padding:32px;text-align:center}h1{margin:0 0 12px;font-size:24px}p{margin:0;color:#c4c7d8;line-height:1.5}</style>",
		"</head>",
		"<body><main><h1>DSH Remote</h1><p>Cannot reach the running DSH host. Restore the connection and reopen the app.</p></main></body>",
		"</html>"
	].join("");
}
/** Send a small static UTF-8 body with revalidation headers. */
function writeStatic(res, status, type, body) {
	res.writeHead(status, {
		"content-type": type + "; charset=utf-8",
		"cache-control": "no-cache",
		"referrer-policy": "no-referrer"
	});
	res.end(body);
}
/** Send the worker with the same scope it registers for, without HTTP caching. */
function writeServiceWorker(res, body) {
	res.writeHead(200, {
		"content-type": "text/javascript; charset=utf-8",
		"cache-control": "no-cache",
		"referrer-policy": "no-referrer",
		"service-worker-allowed": MOBILE_ROOT
	});
	res.end(body);
}
/** Send a PNG body without decoding it to UTF-8. */
function writePng(res, status, body) {
	res.writeHead(status, {
		"content-type": "image/png",
		"cache-control": "public, max-age=31536000, immutable",
		"referrer-policy": "no-referrer"
	});
	res.end(body);
}
/** Canonicalize the old /m route while retaining pair and workspace query parameters. */
function redirectToMobileRoot(req, res) {
	const url = new URL(req.url ?? "/m", "http://x");
	res.writeHead(308, {
		location: MOBILE_ROOT + url.search,
		"cache-control": "no-store",
		"referrer-policy": "no-referrer"
	});
	res.end();
}
/**
* Build the mobile page routes.
* @returns Exact routes for the canonical page, static shell, and PWA assets.
*/
function makeMobileRoutes() {
	const handlePage = (_req, res) => {
		writeStatic(res, 200, "text/html", pageHtml(MOBILE_BUNDLE_URL));
	};
	const handleManifest = (_req, res) => {
		writeStatic(res, 200, "application/manifest+json", manifestJson());
	};
	const handleOffline = (_req, res) => {
		writeStatic(res, 200, "text/html", offlineHtml());
	};
	let bundleBody;
	const handleBundle = async (_req, res) => {
		if (bundleBody === void 0) {
			const path = mobileBundlePath();
			if (!existsSync(path)) {
				writeStatic(res, 503, "text/plain", "mobile bundle not built: run pnpm --filter @dsh-selfuse/remote-web-ui build");
				return;
			}
			try {
				bundleBody = await readFile(path, "utf8");
			} catch {
				writeStatic(res, 500, "text/plain", "failed to read the mobile bundle");
				return;
			}
		}
		writeStatic(res, 200, "text/javascript", bundleBody);
	};
	let workerBody;
	const handleWorker = async (_req, res) => {
		if (workerBody === void 0) {
			const path = mobileAssetPath("mobile-service-worker.js");
			if (!existsSync(path)) {
				writeStatic(res, 503, "text/plain", "mobile service worker not found");
				return;
			}
			try {
				workerBody = await readFile(path, "utf8");
			} catch {
				writeStatic(res, 500, "text/plain", "failed to read the mobile service worker");
				return;
			}
		}
		writeServiceWorker(res, workerBody);
	};
	const makeIconHandler = (asset) => async (_req, res) => {
		const path = mobileAssetPath(asset);
		if (!existsSync(path)) {
			writeStatic(res, 404, "text/plain", asset + " not found");
			return;
		}
		try {
			writePng(res, 200, await readFile(path));
		} catch {
			writeStatic(res, 500, "text/plain", "failed to read " + asset);
		}
	};
	return [
		{
			kind: "exact",
			path: "/m",
			handler: redirectToMobileRoot
		},
		{
			kind: "exact",
			path: MOBILE_ROOT,
			handler: handlePage
		},
		{
			kind: "exact",
			path: MOBILE_BUNDLE_URL,
			handler: handleBundle
		},
		{
			kind: "exact",
			path: MOBILE_MANIFEST_URL,
			handler: handleManifest
		},
		{
			kind: "exact",
			path: MOBILE_WORKER_URL,
			handler: handleWorker
		},
		{
			kind: "exact",
			path: MOBILE_OFFLINE_URL,
			handler: handleOffline
		},
		{
			kind: "exact",
			path: "/m/apple-touch-icon.png",
			handler: makeIconHandler("apple-touch-icon.png")
		},
		{
			kind: "exact",
			path: "/m/icon-192.png",
			handler: makeIconHandler("mobile-icon-192.png")
		},
		{
			kind: "exact",
			path: "/m/icon-512.png",
			handler: makeIconHandler("mobile-icon-512.png")
		}
	];
}
//#endregion
//#region src/mobile-api.ts
/**
* Methods the phone surface may call. Everything else is refused HERE — but
* note the paired-device cookie also passes the global api/gate for the full
* ApiProxy surface (gate.ts), so a paired phone is a full-control credential:
* the allowlist only constrains this /m/api proxy, not the cookie's reach.
* stop() revokes every device; the loopback panel can also revoke one
* device at a time.
*/
const MOBILE_ALLOWLIST = /* @__PURE__ */ new Set([
	"workspace.list",
	"agentPreset.list",
	"session.create",
	"session.list",
	"session.history",
	"session.search",
	"session.prompt",
	"session.models",
	"session.selectModel",
	"session.rename"
]);
/**
* Locally answered display-preference method (the phone's read-only
* surface preferences; never proxied to the host ApiProxy and never a
* settings-domain write).
*/
const MOBILE_PREFERENCES_METHOD = "mobile.preferences";
/** One session.list page (thin phones load incrementally). */
const SESSION_PAGE_SIZE = 20;
/** SSE keep-alive ping cadence for the live mux stream (single connection). */
const DEFAULT_EVENTS_HEARTBEAT_MS = 15e3;
/** Encode one list position as an opaque continuation cursor. */
function sessionListCursor(updatedAt, sessionId) {
	return `${updatedAt}:${sessionId}`;
}
/** Parse a cursor; malformed cursors mean "start over" (safe failure mode). */
function parseSessionListCursor(cursor) {
	const separator = cursor.indexOf(":");
	if (separator < 0) return void 0;
	const updatedAt = Number(cursor.slice(0, separator));
	if (!Number.isFinite(updatedAt)) return void 0;
	return {
		updatedAt,
		sessionId: cursor.slice(separator + 1)
	};
}
/** Whether a row comes strictly after the cursor position. */
function afterCursor(row, position) {
	return row.updatedAt < position.updatedAt || row.updatedAt === position.updatedAt && row.sessionId > position.sessionId;
}
/** Mobile API route paths. */
const MOBILE_API_PATHS = { events: "/m/api/events.mux" };
/** The mobile-api prefix (every other path under it is a method name). */
const MOBILE_API_PREFIX = "/m/api";
/** Method extraction: the prefix plus one slash. */
const MOBILE_API_METHOD_PREFIX = `${MOBILE_API_PREFIX}/`;
/**
* Build the mobile data-channel routes.
* @param deps - pairing service + apiProxy.
* @returns the routes to register on webServer.
*/
function makeMobileApiRoutes(deps) {
	const { service, apiProxy, mobileEnterToSend, requirePairingForLan } = deps;
	const eventsHeartbeatMs = deps.eventsHeartbeatMs ?? DEFAULT_EVENTS_HEARTBEAT_MS;
	/**
	* Refresh the paired device's presence and report whether it is live.
	* The mobile surface (unlike the desktop Web UI) has no `/api/pair/heartbeat`
	* sender, so any activity on the mobile channel — a gated RPC, or the live
	* SSE stream staying open — must count as presence. Without this, an
	* idle-but-connected phone ages past `offlineAfterMs` and the desktop panel
	* wrongly reports it as disconnected.
	*/
	const touchDeviceFor = (req) => {
		const deviceId = readCookie(req.headers.cookie, service.config.cookieName);
		if (deviceId === void 0) return false;
		return service.touchDevice(deviceId);
	};
	/** The phone gate: a live paired-device cookie, or nothing else proceeds. */
	const gateOk = (req) => {
		if (requirePairingForLan?.() === false) return true;
		return touchDeviceFor(req);
	};
	const handleMethod = async (req, res) => {
		if (req.method !== "POST") {
			res.writeHead(405);
			res.end();
			return;
		}
		if (!gateOk(req)) {
			writeJson(res, 403, {
				ok: false,
				error: {
					code: "unpaired",
					message: "mobile session is not paired"
				}
			});
			return;
		}
		const pathname = new URL(req.url ?? "/", "http://x").pathname;
		if (!pathname.startsWith(MOBILE_API_METHOD_PREFIX)) {
			writeJson(res, 404, {
				ok: false,
				error: {
					code: "not-found",
					message: "unknown mobile api path"
				}
			});
			return;
		}
		const method = pathname.slice(MOBILE_API_METHOD_PREFIX.length);
		const local = method === MOBILE_PREFERENCES_METHOD;
		if (!MOBILE_ALLOWLIST.has(method) && !local) {
			writeJson(res, 403, {
				ok: false,
				error: {
					code: "forbidden",
					message: `method ${method} is not exposed to the mobile surface`
				}
			});
			return;
		}
		let envelope;
		try {
			envelope = await readJsonBody(req);
		} catch {
			writeJson(res, 400, {
				ok: false,
				error: {
					code: "bad-request",
					message: "invalid json body"
				}
			});
			return;
		}
		const parsed = envelope;
		const rpcId = typeof parsed?.rpcId === "string" ? parsed.rpcId : "";
		if (rpcId === "") {
			writeJson(res, 400, {
				ok: false,
				error: {
					code: "bad-request",
					message: "missing rpcId"
				}
			});
			return;
		}
		if (local) {
			writeJson(res, 200, {
				type: "server-response",
				rpcId,
				result: {
					ok: true,
					value: { mobileEnterToSend: mobileEnterToSend() }
				}
			});
			return;
		}
		try {
			const abort = new AbortController();
			res.on("close", () => {
				if (!res.writableEnded) abort.abort();
			});
			writeJson(res, 200, await dispatch(apiProxy, method, parsed?.payload, rpcId, abort.signal));
		} catch (error) {
			writeJson(res, 200, {
				type: "server-response",
				rpcId,
				result: {
					ok: false,
					error: {
						code: "internal",
						message: error instanceof Error ? error.message : String(error)
					}
				}
			});
		}
	};
	/** Bridge the host mux stream over SSE: one `data:` frame per mux frame. */
	const handleEvents = async (req, res) => {
		if (req.method !== "GET") {
			res.writeHead(405);
			res.end();
			return;
		}
		if (!gateOk(req)) {
			res.writeHead(403);
			res.end("forbidden");
			return;
		}
		res.writeHead(200, {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache",
			connection: "keep-alive"
		});
		const controller = new AbortController();
		let closed = false;
		const heartbeat = setInterval(() => {
			if (closed) return;
			touchDeviceFor(req);
			try {
				res.write(": ping\n\n");
			} catch {}
		}, eventsHeartbeatMs);
		const onClose = () => {
			if (closed) return;
			closed = true;
			controller.abort();
			clearInterval(heartbeat);
		};
		res.on("close", onClose);
		req.on("close", onClose);
		try {
			const frames = apiProxy.events.mux({
				rpcId: RpcId(`mobile-mux-${Date.now().toString(36)}`),
				payload: {}
			}, controller.signal);
			for await (const frame of frames) {
				if (closed) break;
				res.write(`data: ${JSON.stringify(frame)}\n\n`);
			}
		} catch {} finally {
			controller.abort();
			clearInterval(heartbeat);
		}
		if (!closed) res.end();
	};
	return [{
		kind: "prefix",
		path: MOBILE_API_PREFIX,
		handler: handleMethod
	}, {
		kind: "exact",
		path: MOBILE_API_PATHS.events,
		handler: handleEvents
	}];
}
/** Read a request body as JSON (bounded). */
async function readJsonBody(req) {
	return readBoundedJson(req, 64 * 1024);
}
/** Dispatch one allowlisted method through the host ApiProxy. */
async function dispatch(apiProxy, method, payload, rpcId, signal) {
	const request = {
		rpcId: RpcId(rpcId),
		payload
	};
	if (method === "session.list") {
		const full = await apiProxy.sessions.list(request);
		if (!full.result.ok) return {
			type: "server-response",
			rpcId,
			result: full.result
		};
		const items = full.result.value.items;
		const cursor = payload?.cursor;
		items.sort((a, b) => b.updatedAt - a.updatedAt || (a.sessionId < b.sessionId ? -1 : a.sessionId > b.sessionId ? 1 : 0));
		const position = cursor === void 0 ? void 0 : parseSessionListCursor(cursor);
		const from = position === void 0 ? 0 : items.findIndex((row) => afterCursor(row, position));
		const start = from < 0 ? items.length : from;
		const page = items.slice(start, start + SESSION_PAGE_SIZE);
		const last = page[page.length - 1];
		const nextCursor = last !== void 0 && start + page.length < items.length ? sessionListCursor(last.updatedAt, last.sessionId) : void 0;
		return {
			type: "server-response",
			rpcId,
			result: {
				ok: true,
				value: {
					items: page,
					hasMore: nextCursor !== void 0,
					...nextCursor !== void 0 ? { nextCursor } : {}
				}
			}
		};
	}
	const wrap = (response) => ({
		type: "server-response",
		rpcId,
		result: response.result
	});
	if (method === "workspace.list") return wrap(await apiProxy.workspace.list(request));
	if (method === "agentPreset.list") return wrap(await apiProxy.agentPresets.list(request));
	if (method === "session.create") return wrap(await apiProxy.sessions.create(request));
	if (method === "session.history") return wrap(await apiProxy.sessions.history(request));
	if (method === "session.search") return wrap(await apiProxy.sessions.search(request, signal ?? new AbortController().signal));
	if (method === "session.prompt") return wrap(await apiProxy.sessions.prompt(request));
	if (method === "session.models") return wrap(await apiProxy.sessions.models(request));
	if (method === "session.selectModel") return wrap(await apiProxy.sessions.selectModel(request));
	if (method === "session.rename") return wrap(await apiProxy.sessions.rename(request));
	throw new Error(`unhandled allowlisted method ${method}`);
}
//#endregion
//#region src/loopback-proxy.ts
/** WebSocket handshake headers forwarded to the loopback upstream. */
const WS_FORWARD_HEADERS = [
	"sec-websocket-key",
	"sec-websocket-version",
	"sec-websocket-extensions",
	"sec-websocket-protocol"
];
/** Response headers copied from the loopback upstream (no hop-by-hop). */
const HTTP_FORWARD_RESPONSE_HEADERS = [
	"content-type",
	"content-length",
	"content-disposition",
	"cache-control",
	"etag",
	"last-modified"
];
/**
* Pipe one HTTP request to loopback and stream the response back.
* @param req - the already-gated outer request.
* @param res - the outer response.
* @param port - local webServer port.
* @param upstreamPath - path + query on 127.0.0.1 (must start with `/`).
*/
function proxyLoopbackHttp(req, res, port, upstreamPath) {
	const headers = {
		host: `127.0.0.1:${String(port)}`,
		"sec-fetch-site": "same-origin"
	};
	const contentType = req.headers["content-type"];
	if (typeof contentType === "string") headers["content-type"] = contentType;
	const contentLength = req.headers["content-length"];
	if (typeof contentLength === "string") headers["content-length"] = contentLength;
	const accept = req.headers.accept;
	if (typeof accept === "string") headers.accept = accept;
	const upstream = request({
		host: "127.0.0.1",
		port,
		path: upstreamPath,
		method: req.method,
		headers
	}, (upstreamRes) => {
		const out = {};
		for (const name of HTTP_FORWARD_RESPONSE_HEADERS) {
			const value = upstreamRes.headers[name];
			if (value !== void 0) out[name] = value;
		}
		res.writeHead(upstreamRes.statusCode ?? 502, out);
		upstreamRes.pipe(res);
	});
	upstream.on("error", () => {
		if (!res.headersSent) {
			writeJson(res, 502, {
				ok: false,
				error: {
					code: "upstream-failure",
					message: "upstream request failed"
				}
			});
			return;
		}
		res.destroy();
	});
	req.pipe(upstream);
}
/**
* Rebuild a WebSocket handshake as loopback-shaped and pipe both directions.
* @param req - the already-gated upgrade request.
* @param socket - the client duplex.
* @param head - bytes already read past the handshake.
* @param port - local webServer port.
* @param upstreamPath - path + query on 127.0.0.1.
*/
function proxyLoopbackUpgrade(req, socket, head, port, upstreamPath) {
	const lines = [
		`GET ${upstreamPath} HTTP/1.1`,
		`Host: 127.0.0.1:${String(port)}`,
		"Upgrade: websocket",
		"Connection: Upgrade"
	];
	for (const name of WS_FORWARD_HEADERS) {
		const value = req.headers[name];
		if (value === void 0) continue;
		lines.push(`${name}: ${Array.isArray(value) ? value.join(", ") : value}`);
	}
	const handshake = `${lines.join("\r\n")}\r\n\r\n`;
	const upstream = connect(port, "127.0.0.1");
	const tearDown = () => {
		upstream.destroy();
		socket.destroy();
	};
	upstream.on("error", tearDown);
	socket.on("error", tearDown);
	upstream.on("close", () => {
		socket.destroy();
	});
	socket.on("close", () => {
		upstream.destroy();
	});
	upstream.on("connect", () => {
		upstream.write(handshake);
		if (head.length > 0) upstream.write(head);
		socket.pipe(upstream);
		upstream.pipe(socket);
	});
}
//#endregion
//#region src/remote-methods.ts
/**
* Remote desktop channel constants — SDK-independent so tests and the
* client half can pin them without importing the host SDK graph.
*/
/** Gated mirror of same-origin fenced paths (`/remote` + original pathname). */
const REMOTE_PREFIX = "/remote";
/** Connection-plugin method prefix under the gated channel. */
const REMOTE_API_PREFIX = `${REMOTE_PREFIX}/api`;
/** WebSocket event-stream paths served by the channel (client rewrites to these). */
const REMOTE_API_PATHS = {
	mux: `${REMOTE_API_PREFIX}/events.mux`,
	host: `${REMOTE_API_PREFIX}/events.host`
};
/**
* Exact upgrade paths registered on webServer (the SDK matches upgrades by
* exact path, not prefix). Query strings ride on the request URL.
*/
const REMOTE_UPGRADE_PATHS = [
	REMOTE_API_PATHS.mux,
	REMOTE_API_PATHS.host,
	`${REMOTE_PREFIX}/sidebar/ws/terminal`,
	`${REMOTE_PREFIX}/sidebar/ws/agent-terminals`,
	`${REMOTE_API_PREFIX}/dsh-ssh/terminal`
];
/**
* Loopback-only methods of the host API surface, mirrored from
* client-connection's `PRIVILEGED_METHODS` (pinned by
* tests/remote-contract.spec.ts against the installed SDK). They stay
* unreachable from a paired remote desktop, matching the SDK's own stance
* that the configuration plane is loopback-same-origin only.
*/
const LOOPBACK_ONLY_METHODS = /* @__PURE__ */ new Set([
	"agentPreset.read",
	"agentPreset.copy",
	"agentPreset.openDocument",
	"agentPreset.remove",
	"host.pickDirectory",
	"host.openPath",
	"settings.describe",
	"settings.openDocument",
	"settings.update",
	"settings.replace",
	"settings.mutate",
	"credentials.describe",
	"credentials.set",
	"credentials.unset",
	"llm.discoverModels"
]);
//#endregion
//#region src/remote-api.ts
const ALLOWED_METHODS = /* @__PURE__ */ new Set([
	"GET",
	"HEAD",
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
]);
/** Reject traversal and empty segments; allow plugin file-path characters. */
function isSafeSegment(segment) {
	if (segment === "") return false;
	let decoded;
	try {
		decoded = decodeURIComponent(segment);
	} catch {
		return false;
	}
	return decoded !== "." && decoded !== ".." && !decoded.includes("/") && !decoded.includes("\\") && !decoded.includes("\0");
}
/** One SDK-shaped error envelope (keeps the desktop client's parse path intact). */
function envelopeError(res, status, rpcId, code, message) {
	writeJson(res, status, {
		type: "server-response",
		rpcId,
		result: {
			ok: false,
			error: {
				code,
				message,
				details: { issues: [] }
			}
		}
	});
}
/**
* Map `/remote/...` to the inner path, or undefined when the outer path is
* not a safe rewrite target.
*/
function innerPathOf(pathname) {
	if (pathname === "/remote" || pathname === `/remote/`) return void 0;
	if (!pathname.startsWith(`/remote/`)) return void 0;
	const rest = pathname.slice(7);
	if (!rest.startsWith("/")) return void 0;
	const segments = rest.slice(1).split("/");
	if (segments.length === 0 || segments.some((segment) => !isSafeSegment(segment))) return;
	return rest;
}
/**
* Whether a paired inner path must stay physically local.
* @returns a denial message, or undefined when the path may be proxied.
*/
function loopbackOnlyDenial(innerPath) {
	if (innerPath === "/api/pair" || innerPath.startsWith("/api/pair/")) return "pairing endpoints stay loopback-only and stay unreachable from a paired remote desktop";
	if (innerPath === "/api/update" || innerPath.startsWith("/api/update/")) return "update endpoints stay loopback-only and stay unreachable from a paired remote desktop";
	if (innerPath === "/api/plugin-manager" || innerPath.startsWith(`/api/plugin-manager/`)) return "plugin-manager stays loopback-only and stays unreachable from a paired remote desktop";
	if (innerPath === "/api/dsh-desktop-launcher" || innerPath.startsWith(`/api/dsh-desktop-launcher/`)) return "desktop-launcher endpoints stay loopback-only and stay unreachable from a paired remote desktop";
	if (innerPath === "/api/dsh-web-ui-settings" || innerPath.startsWith(`/api/dsh-web-ui-settings/`)) return "settings-bridge endpoints stay loopback-only and stay unreachable from a paired remote desktop";
	if (!innerPath.startsWith("/api/")) return void 0;
	const method = innerPath.slice(5);
	if (method !== "" && !method.includes("/") && LOOPBACK_ONLY_METHODS.has(method)) return `${method} is loopback-only and stays unreachable from a paired remote desktop`;
}
/**
* Build the remote desktop channel HTTP routes.
* @param deps - pairing service + local port.
* @returns the routes to register on webServer.
*/
function makeRemoteApiRoutes(deps) {
	const { service, port, requirePairingForLan } = deps;
	const handler = (req, res) => {
		const deviceId = readCookie(req.headers.cookie, service.config.cookieName);
		if (requirePairingForLan?.() !== false && !(deviceId !== void 0 && service.touchDevice(deviceId))) {
			req.resume();
			envelopeError(res, 403, "invalid-request", "unpaired", "this device is not paired with the desktop");
			return;
		}
		const method = req.method ?? "GET";
		if (!ALLOWED_METHODS.has(method)) {
			req.resume();
			res.writeHead(405).end();
			return;
		}
		const url = new URL(req.url ?? "/", "http://127.0.0.1");
		const inner = innerPathOf(url.pathname);
		if (inner === void 0) {
			req.resume();
			res.writeHead(404).end();
			return;
		}
		const denied = loopbackOnlyDenial(inner);
		if (denied !== void 0) {
			req.resume();
			envelopeError(res, 403, "invalid-request", "forbidden", denied);
			return;
		}
		proxyLoopbackHttp(req, res, port, `${inner}${url.search}`);
	};
	return [{
		kind: "prefix",
		path: REMOTE_PREFIX,
		handler
	}];
}
/**
* Map one outer upgrade URL onto the loopback path (query string included).
*/
function upgradeInnerPath(reqUrl, fallbackPath) {
	if (reqUrl === void 0 || reqUrl === "") return fallbackPath;
	let url;
	try {
		url = new URL(reqUrl, "http://127.0.0.1");
	} catch {
		return fallbackPath;
	}
	const inner = innerPathOf(url.pathname);
	if (inner === void 0) return fallbackPath;
	return `${inner}${url.search}`;
}
/**
* Build the WebSocket upgrade routes for the event streams and known plugin
* sockets. webServer matches upgrades by exact path.
* @param deps - pairing service + local port.
* @returns the upgrade routes to register on webServer.
*/
function makeRemoteApiUpgradeRoutes(deps) {
	const { service, port, requirePairingForLan } = deps;
	const handlerFor = (fallbackPath) => (req, socket, head) => {
		const deviceId = readCookie(req.headers.cookie, service.config.cookieName);
		if (requirePairingForLan?.() !== false && (deviceId === void 0 || !service.touchDevice(deviceId))) {
			socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
			socket.destroy();
			return;
		}
		const inner = upgradeInnerPath(req.url, fallbackPath);
		if (loopbackOnlyDenial(inner.split("?")[0] ?? inner) !== void 0) {
			socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
			socket.destroy();
			return;
		}
		proxyLoopbackUpgrade(req, socket, head, port, inner);
	};
	return REMOTE_UPGRADE_PATHS.map((path) => ({
		path,
		handler: handlerFor(path.slice(7))
	}));
}
//#endregion
//#region src/posture.ts
/**
* Build the forged Host values to probe: the public base authority (host or
* host:port as written in the URL) plus every LAN base literal.
* @param publicBaseUrl - the configured public base URL (or undefined).
* @param lanAddresses - the LAN interface addresses the QR advertises.
* @param port - the local webServer port (LAN hosts are probed as host:port).
* @returns Host header values, de-duplicated.
*/
function postureTargets(publicBaseUrl, lanAddresses, port) {
	const targets = [];
	if (publicBaseUrl !== void 0) try {
		const url = new URL(publicBaseUrl);
		const authority = url.port === "" ? url.hostname : `${url.hostname}:${url.port}`;
		if (authority !== "") targets.push(authority);
	} catch {}
	for (const address of lanAddresses) targets.push(`${address}:${String(port)}`);
	return [...new Set(targets)];
}
const defaultRequest = (options, onStatus) => {
	const request = http.request(options, (response) => {
		onStatus(response.statusCode ?? 0);
	});
	request.on("error", () => {
		onStatus(0);
	});
	return request;
};
/**
* Probe one forged Host against the local `/api` fence.
* @param port - the local webServer port.
* @param hostHeader - the Host header to forge.
* @param request - transport seam.
* @param timeoutMs - give up after this long (counts as not exposed; the
* fence being unreachable is not evidence it is open).
* @returns true when the probe got past the fence.
*/
async function probeHost(port, hostHeader, request, timeoutMs) {
	return await new Promise((resolve) => {
		let settled = false;
		const finish = (exposed) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			handle.destroy();
			resolve(exposed);
		};
		const handle = request({
			host: "127.0.0.1",
			port,
			method: "POST",
			path: "/api/session.list",
			headers: {
				host: hostHeader,
				"content-type": "application/json"
			},
			timeout: timeoutMs
		}, (status) => {
			finish(status !== 403);
		});
		const timer = setTimeout(() => {
			finish(false);
		}, timeoutMs + 1e3);
		handle.on("error", () => {
			finish(false);
		});
		handle.end("{}");
	});
}
/**
* Run one posture probe round.
* @returns the snapshot for this round.
*/
async function probePosture(options) {
	const { port, targets } = options;
	const request = options.request ?? defaultRequest;
	const timeoutMs = options.timeoutMs ?? 3e3;
	const now = options.now ?? (() => Date.now());
	const hosts = [];
	for (const target of targets) hosts.push({
		host: target,
		exposed: await probeHost(port, target, request, timeoutMs)
	});
	return {
		checkedAt: now(),
		hosts
	};
}
/**
* Reserve an advertised-target key so a second trigger with the same set
* does not overlap an in-flight round. Pair with {@link releasePostureKey}
* on failure — otherwise that key never retries.
*/
function claimPostureKey(current, key) {
	if (current === key) return {
		run: false,
		next: current
	};
	return {
		run: true,
		next: key
	};
}
/**
* Drop a failed in-flight key so the next trigger re-probes the same targets.
* A newer key that started meanwhile is left alone.
*/
function releasePostureKey(current, attempted) {
	return current === attempted ? void 0 : current;
}
//#endregion
//#region src/lan.ts
/**
* LAN address derivation for the pairing URLs. Mirrors the dsh CLI's
* boot-time sampling (apps/cli/src/app-cli-entry.ts `resolveLanTrust`): the
* pairing links may only name addresses the /api trust fence was configured
* with, so the same non-internal IPv4 derivation applies here — an external
* plugin cannot read the CLI's sampled snapshot, but the fence accepts
* exactly these literals, which is the property that matters.
*/
/**
* Non-internal IPv4 interface addresses of this machine — the IP-literal
* authorities an all-interfaces bind is reachable by on the LAN.
* @returns the addresses in interface order (possibly empty).
*/
function lanIPv4Addresses() {
	return Object.values(networkInterfaces()).flat().filter((iface) => {
		return iface !== void 0 && iface.family === "IPv4" && !iface.internal;
	}).map((iface) => iface.address);
}
//#endregion
//#region src/tunnel.ts
/**
* Auto-tunnel manager: spawns a Cloudflare quick tunnel (`cloudflared
* tunnel --url <local>`) through the `cloudflared` npm package — its
* postinstall downloads the platform binary, so no user-side tooling is
* involved — surfaces the minted `https://xxx.trycloudflare.com` URL, and
* restarts the process after unexpected exits with exponential backoff.
*
* The cloudflared package's Tunnel is a thin spawn wrapper; this manager
* owns the lifecycle policy (binary readiness, URL timeout, restart
* backoff) around it. All seams — the tunnel factory, binary readiness,
* timers — are injectable so the whole lifecycle is unit-testable without
* a real binary or network.
*/
/** Default binary readiness: download the platform binary on first use. */
async function defaultEnsureBinary() {
	if (existsSync(bin)) return;
	await install(bin);
}
/** Default factory: the cloudflared package's quick tunnel (no account). */
function defaultFactory(targetUrl) {
	return Tunnel.quick(targetUrl, { "--no-autoupdate": true });
}
/** Node timers. */
const nodeTimer = {
	setTimeout,
	clearTimeout
};
/**
* Own the lifecycle of one auto-tunnel: start/stop, URL surfacing, and
* crash-restart backoff.
*/
var TunnelManager = class {
	factory;
	ensureBinary;
	urlTimeoutMs;
	restartBaseMs;
	restartMaxMs;
	timer;
	phase = "stopped";
	url;
	error;
	targetUrl;
	handle;
	urlTimer;
	restartTimer;
	attempts = 0;
	generation = 0;
	stopping = false;
	urlListeners = /* @__PURE__ */ new Set();
	phaseListeners = /* @__PURE__ */ new Set();
	/**
	* @param options - seams; defaults spawn the real quick tunnel.
	*/
	constructor(options = {}) {
		this.factory = options.factory ?? defaultFactory;
		this.ensureBinary = options.ensureBinary ?? defaultEnsureBinary;
		this.urlTimeoutMs = options.urlTimeoutMs ?? 3e4;
		this.restartBaseMs = options.restartBaseMs ?? 5e3;
		this.restartMaxMs = options.restartMaxMs ?? 6e4;
		this.timer = options.timer ?? nodeTimer;
	}
	/** The current status frame. */
	get info() {
		return {
			phase: this.phase,
			...this.url !== void 0 ? { url: this.url } : {},
			...this.error !== void 0 ? { error: this.error } : {}
		};
	}
	/**
	* Start (or keep) a quick tunnel toward `targetUrl`. Restarting with a
	* different target tears the old tunnel down first; restarting with the
	* same target while running is a no-op.
	* @param targetUrl - the local URL to expose, e.g. `http://127.0.0.1:3080`.
	*/
	start(targetUrl) {
		if (this.targetUrl === targetUrl && (this.phase === "starting" || this.phase === "running")) return;
		this.teardown();
		this.stopping = false;
		this.targetUrl = targetUrl;
		this.attempts = 0;
		this.generation += 1;
		this.attempt();
	}
	/** Stop the tunnel for good: no restarts, no state. */
	stop() {
		this.teardown();
		this.stopping = false;
		this.targetUrl = void 0;
		this.setPhase("stopped");
	}
	/** Alias of {@link stop} for plugin-effect disposal. */
	dispose() {
		this.stop();
	}
	/** Subscribe to minted tunnel URLs (fire-and-forget duplicates dropped). */
	onUrl(listener) {
		this.urlListeners.add(listener);
		return () => {
			this.urlListeners.delete(listener);
		};
	}
	/** Subscribe to every phase change. */
	onPhase(listener) {
		this.phaseListeners.add(listener);
		return () => {
			this.phaseListeners.delete(listener);
		};
	}
	attempt() {
		if (this.stopping || this.targetUrl === void 0) return;
		const gen = this.generation;
		this.setPhase("starting");
		this.handle = void 0;
		this.url = void 0;
		this.error = void 0;
		this.ensureBinary().then(() => {
			if (this.stopping || this.targetUrl === void 0 || gen !== this.generation) return;
			const handle = this.factory(this.targetUrl);
			this.handle = handle;
			this.urlTimer = this.timer.setTimeout(() => {
				this.fail("timed out waiting for the tunnel URL");
			}, this.urlTimeoutMs);
			handle.on("url", (value) => {
				if (this.handle !== handle) return;
				this.handleUrl(value);
			});
			handle.on("exit", () => {
				if (this.handle !== handle) return;
				this.handleExit();
			});
			handle.on("error", (value) => {
				if (this.handle !== handle || this.phase !== "starting") return;
				this.error = value instanceof Error ? value.message : String(value);
			});
		}).catch((value) => {
			if (this.stopping || this.targetUrl === void 0 || gen !== this.generation) return;
			const message = value instanceof Error ? value.message : String(value);
			this.fail(`could not obtain the cloudflared binary: ${message}`);
		});
	}
	handleUrl(value) {
		if (this.urlTimer !== void 0) {
			this.timer.clearTimeout(this.urlTimer);
			this.urlTimer = void 0;
		}
		this.url = value;
		this.error = void 0;
		this.attempts = 0;
		this.setPhase("running");
		for (const listener of this.urlListeners) try {
			listener(value);
		} catch {}
	}
	handleExit() {
		if (this.stopping) return;
		this.fail("the tunnel process exited unexpectedly");
	}
	fail(message) {
		if (this.stopping) return;
		this.url = void 0;
		this.error = message;
		if (this.handle !== void 0) {
			this.handle.stop();
			this.handle = void 0;
		}
		if (this.urlTimer !== void 0) {
			this.timer.clearTimeout(this.urlTimer);
			this.urlTimer = void 0;
		}
		this.setPhase("failed");
		this.attempts += 1;
		const delay = Math.min(this.restartBaseMs * 2 ** (this.attempts - 1), this.restartMaxMs);
		this.restartTimer = this.timer.setTimeout(() => {
			this.restartTimer = void 0;
			this.attempt();
		}, delay);
	}
	/** Stop the current process and cancel every pending timer (no phase change). */
	teardown() {
		this.stopping = true;
		if (this.urlTimer !== void 0) {
			this.timer.clearTimeout(this.urlTimer);
			this.urlTimer = void 0;
		}
		if (this.restartTimer !== void 0) {
			this.timer.clearTimeout(this.restartTimer);
			this.restartTimer = void 0;
		}
		if (this.handle !== void 0) {
			this.handle.stop();
			this.handle = void 0;
		}
	}
	setPhase(phase) {
		this.phase = phase;
		const info = this.info;
		for (const listener of this.phaseListeners) try {
			listener(info);
		} catch {}
	}
};
/** The aggregate package that is the canonical update entry point. */
const AGGREGATE_PACKAGE = "@dsh-selfuse/web-ui-all";
/** Fallback anchor: this plugin's own package when the aggregate is absent. */
const SELF_PACKAGE = "@dsh-selfuse/remote-web-ui";
/** A profile manifest `name` prefix (e.g. `dsh-profile-web`). */
const PROFILE_NAME_PREFIX = "dsh-profile-";
/** How many ancestor directories a profile search walks before giving up. */
const PROFILE_WALK_DEPTH = 12;
/**
* Parse a semantic version string (leading `v` tolerated, build metadata
* ignored). Returns undefined for unparseable input.
* @param value - the version string, e.g. `0.1.10` or `0.1.11-rc.1`.
* @returns the parsed parts, or undefined.
*/
function parseSemver(value) {
	const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value.trim());
	if (match === null) return void 0;
	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		prerelease: match[4] === void 0 ? [] : match[4].split(".")
	};
}
/**
* Compare two semantic versions per the semver precedence rules (a release
* outranks any of its prereleases; numeric prerelease identifiers compare
* numerically and sort below alphanumeric ones). An unparseable version sorts
* below every parseable one; two unparseable versions compare equal.
* @param a - first version.
* @param b - second version.
* @returns negative when a < b, 0 when equal, positive when a > b.
*/
function compareVersions(a, b) {
	const pa = parseSemver(a);
	const pb = parseSemver(b);
	if (pa === void 0 && pb === void 0) return 0;
	if (pa === void 0) return -1;
	if (pb === void 0) return 1;
	for (const key of [
		"major",
		"minor",
		"patch"
	]) if (pa[key] !== pb[key]) return pa[key] < pb[key] ? -1 : 1;
	if (pa.prerelease.length === 0 && pb.prerelease.length === 0) return 0;
	if (pa.prerelease.length === 0) return 1;
	if (pb.prerelease.length === 0) return -1;
	for (let index = 0; index < Math.max(pa.prerelease.length, pb.prerelease.length); index++) {
		const ra = pa.prerelease[index];
		const rb = pb.prerelease[index];
		if (ra === void 0) return -1;
		if (rb === void 0) return 1;
		if (ra === rb) continue;
		const numericA = /^\d+$/.test(ra);
		const numericB = /^\d+$/.test(rb);
		if (numericA && numericB) return Number(ra) < Number(rb) ? -1 : 1;
		if (numericA) return -1;
		if (numericB) return 1;
		return ra < rb ? -1 : 1;
	}
	return 0;
}
/** Read a package.json at a path, tolerating any parse/IO failure. */
function readManifest(path) {
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8"));
		return typeof parsed === "object" && parsed !== null ? parsed : void 0;
	} catch {
		return;
	}
}
/**
* Locate the owning dsh profile by walking up from an installed package's
* manifest until a manifest named `dsh-profile-*` appears (the profile
* directory is the first ancestor whose package.json carries that name).
* @param anchorManifestPath - absolute path of the anchor package.json.
* @returns the profile name/dir, or undefined when not profile-installed.
*/
function findProfile(anchorManifestPath) {
	let dir = dirname(anchorManifestPath);
	for (let depth = 0; depth < PROFILE_WALK_DEPTH; depth++) {
		const name = readManifest(join(dir, "package.json"))?.name;
		if (typeof name === "string" && name.startsWith(PROFILE_NAME_PREFIX)) return {
			name: name.slice(12),
			dir
		};
		const parent = dirname(dir);
		if (parent === dir) return void 0;
		dir = parent;
	}
}
/** Whether a dependency spec is a local link/file/dev-mode install. */
function isLinkedSpec(spec) {
	if (typeof spec !== "string") return false;
	return /^(?:link|file):|^\.{1,2}(?:[/\\]|$)/.test(spec);
}
/** Whether a direct local dependency overrides one of the aggregate's children. */
function hasLinkedFamilyOverride(anchorManifest, profileManifest) {
	const dependencies = profileManifest?.dependencies;
	if (typeof dependencies !== "object" || dependencies === null) return false;
	return familyChildren(anchorManifest).some((name) => isLinkedSpec(dependencies[name]));
}
/**
* Resolve the anchor package's manifest path. The aggregate package is the
* canonical entry point; this plugin's own package is the fallback. Both a
* throwing resolve and an undefined return mean "not installed" and move on
* to the next candidate.
* @param resolve - a Node resolve implementation scoped to the host process.
* @returns the absolute manifest path, or undefined when neither is installed.
*/
function resolveAnchorManifest(resolve) {
	for (const name of [AGGREGATE_PACKAGE, SELF_PACKAGE]) try {
		const path = resolve(name + "/package.json");
		if (path !== void 0) return path;
	} catch {}
}
/**
* Resolve what an update would touch: the owning profile directory and the
* family package list. Fails with an error code when the anchor is missing
* ('not-found') or is a local dev install ('link').
* @param deps - the anchor manifest path (resolveAnchorManifest output).
* @returns the target, or the failure code.
*/
function resolveUpdateTarget(deps) {
	const manifestPath = deps.anchorManifestPath;
	if (manifestPath === void 0) return { error: "not-found" };
	const manifest = readManifest(manifestPath);
	if (manifest === void 0) return { error: "not-found" };
	const anchor = typeof manifest.name === "string" ? manifest.name : void 0;
	if (anchor === void 0) return { error: "not-found" };
	const profile = findProfile(manifestPath);
	if (profile === void 0) return { error: "link" };
	const profileManifest = readManifest(join(profile.dir, "package.json"));
	const spec = (profileManifest?.dependencies)?.[anchor];
	if (isLinkedSpec(spec) || hasLinkedFamilyOverride(manifest, profileManifest)) return { error: "link" };
	return {
		profileName: profile.name,
		profileDir: profile.dir,
		packages: familyUpdatePackages(anchor, manifest, profileManifest)
	};
}
/** Family children of the anchor: its dependencies under the family scope. */
function familyChildren(anchorManifest) {
	const dependencies = anchorManifest.dependencies;
	if (typeof dependencies !== "object" || dependencies === null) return [];
	const names = [];
	for (const [name, spec] of Object.entries(dependencies)) if (name.startsWith("@dsh-selfuse/") && typeof spec === "string") names.push(name);
	return names;
}
/** Registry-managed family packages covered by one update operation. */
function familyUpdatePackages(anchor, anchorManifest, profileManifest) {
	const names = /* @__PURE__ */ new Set([anchor, ...familyChildren(anchorManifest)]);
	const dependencies = profileManifest?.dependencies;
	if (typeof dependencies !== "object" || dependencies === null) return [...names];
	for (const [name, spec] of Object.entries(dependencies)) if (name.startsWith("@dsh-selfuse/") && typeof spec === "string" && !isLinkedSpec(spec)) names.add(name);
	return [...names];
}
/**
* Probe the npm registry for one package's latest release.
* @param name - the package name (scope slash URL-encoded).
* @param fetchImpl - the fetch implementation (global fetch in the host).
* @param timeoutMs - probe timeout.
* @returns the latest version string, or undefined on any failure.
*/
async function fetchLatestVersion(name, fetchImpl, timeoutMs = 1e4) {
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			controller.abort();
		}, timeoutMs);
		try {
			const response = await fetchImpl("https://registry.npmjs.org/" + name.replace("/", "%2F") + "/latest", { signal: controller.signal });
			if (!response.ok) return void 0;
			const body = await response.json();
			if (typeof body !== "object" || body === null) return void 0;
			const version = body.version;
			return typeof version === "string" ? version : void 0;
		} finally {
			clearTimeout(timer);
		}
	} catch {
		return;
	}
}
/**
* Sentinel for an installed version that could not be read (missing manifest
* or resolve failure). It is a real-looking version so `checkUpdates` can
* render the affected row, but the verified-update comparison must never
* treat it as evidence — a read failure is not a version that "moved".
*/
const VERSION_UNKNOWN = "0.0.0";
/** The resolved current version of one family package (probe failure tolerated). */
function readInstalledVersion(resolve, name, profileDir) {
	try {
		const path = resolve(name + "/package.json");
		const version = path === void 0 ? void 0 : readManifest(path)?.version;
		if (typeof version === "string") return version;
	} catch {}
	if (profileDir === void 0 || !/^@dsh-selfuse\/[a-z0-9][a-z0-9._-]*$/.test(name)) return VERSION_UNKNOWN;
	const version = readManifest(join(profileDir, "node_modules", ...name.split("/"), "package.json"))?.version;
	return typeof version === "string" ? version : VERSION_UNKNOWN;
}
/**
* Build the update status: locate the anchor, detect the install mode, and
* compare every family package against the npm registry.
* @param deps - manifest resolution + registry probe seams.
* @returns the status snapshot.
*/
async function checkUpdates(deps) {
	const manifestPath = deps.anchorManifestPath;
	if (manifestPath === void 0) return {
		mode: "missing",
		packages: [],
		outdated: false
	};
	const manifest = readManifest(manifestPath);
	if (manifest === void 0) return {
		mode: "missing",
		packages: [],
		outdated: false
	};
	const anchor = typeof manifest.name === "string" ? manifest.name : void 0;
	if (anchor === void 0) return {
		mode: "missing",
		packages: [],
		outdated: false
	};
	const profile = findProfile(manifestPath);
	const profileManifest = profile === void 0 ? void 0 : readManifest(join(profile.dir, "package.json"));
	const linked = profile === void 0 || isLinkedSpec((profileManifest?.dependencies)?.[anchor]) || hasLinkedFamilyOverride(manifest, profileManifest);
	if (profile === void 0) return {
		mode: "link",
		packages: [],
		outdated: false
	};
	const names = familyUpdatePackages(anchor, manifest, profileManifest);
	const latestList = await Promise.all(names.map((name) => deps.fetchLatest(name)));
	const packages = [];
	let probeFailures = 0;
	names.forEach((name, index) => {
		const latest = latestList[index];
		if (latest === void 0) probeFailures++;
		const current = readInstalledVersion(deps.resolve, name, profile.dir);
		packages.push({
			name,
			current,
			latest,
			outdated: latest !== void 0 && latest !== current && compareVersions(latest, current) > 0
		});
	});
	const error = probeFailures === names.length && names.length > 0 ? "registry-unreachable" : void 0;
	return {
		mode: linked ? "link" : "npm",
		profileName: profile.name,
		anchor,
		packages,
		outdated: packages.some((packageStatus) => packageStatus.outdated),
		...error !== void 0 ? { error } : {}
	};
}
/** Cap on captured pnpm output (keeps error payloads bounded). */
const OUTPUT_CAP = 16 * 1024;
/**
* Windows cmd command-not-found stderr. With shell:true a missing shim
* exits with code 1 (cmd cannot report ENOENT), so the fallback chain
* detects this message instead of the spawn error event.
*/
const WIN_CMD_MISSING_RE = /not recognized as an internal or external command/i;
/**
* Bypass for pnpm 11's supply-chain gate: `minimumReleaseAge` (default 24 h)
* silently skips same-day releases — `pnpm update --latest` then exits 0
* without moving anything and the post-run verification would misreport a
* stale no-op. The update here is explicitly user-initiated and the panel
* shows exactly which versions are being installed, so the gate only adds a
* confusing silent no-op; override it per-invocation instead of asking every
* user to edit the profile's pnpm-workspace.yaml.
*/
const MIN_RELEASE_AGE_OVERRIDE = "--config.minimumReleaseAge=0";
/**
* Run the update inside the profile directory. Tries pnpm first, falls back
* to corepack and then npx when the previous command is missing (ENOENT);
* all candidates share one hard timeout and keep accumulating output.
* @param deps - profile dir, package list, and spawn/timeout seams.
* @returns the outcome with captured output.
*/
function runUpdate(deps) {
	return new Promise((resolve) => {
		const spawnImpl = deps.spawnImpl ?? spawn;
		const packages = deps.packages;
		const platform = deps.platform ?? process.platform;
		const spawnOptions = {
			cwd: deps.profileDir,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			],
			...platform === "win32" ? { shell: true } : {}
		};
		const candidates = [
			{
				command: "pnpm",
				args: [
					"update",
					"--latest",
					MIN_RELEASE_AGE_OVERRIDE,
					...packages
				]
			},
			{
				command: "corepack",
				args: [
					"pnpm",
					"update",
					"--latest",
					MIN_RELEASE_AGE_OVERRIDE,
					...packages
				]
			},
			{
				command: "npx",
				args: [
					"--yes",
					"pnpm",
					"update",
					"--latest",
					MIN_RELEASE_AGE_OVERRIDE,
					...packages
				]
			}
		];
		let output = "";
		let currentOutput = "";
		const append = (chunk) => {
			output += chunk.toString("utf8");
			if (output.length > OUTPUT_CAP) output = output.slice(output.length - OUTPUT_CAP);
			currentOutput += chunk.toString("utf8");
			if (currentOutput.length > OUTPUT_CAP) currentOutput = currentOutput.slice(currentOutput.length - OUTPUT_CAP);
		};
		let currentChild;
		let finished = false;
		const finish = (result) => {
			if (finished) return;
			finished = true;
			clearTimeout(timer);
			resolve(result);
		};
		const timer = setTimeout(() => {
			if (finished) return;
			if (platform === "win32") {
				const pid = currentChild?.pid;
				if (pid !== void 0 && pid > 0) try {
					spawnImpl("taskkill", [
						"/pid",
						String(pid),
						"/t",
						"/f"
					], { stdio: "ignore" });
				} catch {}
			} else currentChild?.kill("SIGTERM");
			finish({
				ok: false,
				exitCode: null,
				output,
				error: "update timed out; install process killed",
				errorCode: "timeout"
			});
		}, deps.timeoutMs ?? 10 * 6e4);
		const runCandidate = (index) => {
			if (finished) return;
			if (index >= candidates.length) {
				finish({
					ok: false,
					exitCode: null,
					output,
					error: "pnpm not found on PATH (tried pnpm, corepack, npx); install pnpm and restart the app",
					errorCode: "pnpm-missing"
				});
				return;
			}
			const candidate = candidates[index];
			currentOutput = "";
			const child = spawnImpl(candidate.command, candidate.args, spawnOptions);
			currentChild = child;
			let settled = false;
			const once = (fn) => {
				if (settled) return;
				settled = true;
				fn();
			};
			child.stdout?.on("data", append);
			child.stderr?.on("data", append);
			child.on("error", (error) => {
				once(() => {
					if (error.code === "ENOENT") runCandidate(index + 1);
					else finish({
						ok: false,
						exitCode: null,
						output,
						error: error.message,
						errorCode: void 0
					});
				});
			});
			child.on("close", (code) => {
				if (settled || finished) return;
				if (platform === "win32" && code !== 0 && WIN_CMD_MISSING_RE.test(currentOutput)) {
					runCandidate(index + 1);
					return;
				}
				settled = true;
				finish({
					ok: code === 0,
					exitCode: code,
					output,
					error: code === 0 ? void 0 : "pnpm exited with code " + String(code),
					...code === 0 ? {} : { errorCode: "pnpm-failed" }
				});
			});
		};
		runCandidate(0);
	});
}
/**
* Run the update, then verify the installed versions actually moved. pnpm
* exits 0 even when it silently kept the installed versions — runUpdate
* overrides pnpm 11's `minimumReleaseAge` gate (default 24 h) with
* `--config.minimumReleaseAge=0`, but an older pnpm without the override or
* another silent no-op can still keep versions in place — so a green exit
* alone must not report a misleading "update complete". Re-read the
* installed versions afterwards and surface a `stale` failure (with the
* captured pnpm output) when nothing moved, so the panel can tell the user
* how to unblock the gate instead of claiming success.
*
* The stale decision anchors on the pre-run installed versions, not on the
* registry latest: under a lenient gate pnpm may move 0.1.12 -> 0.1.13 while
* latest stays 0.1.15 — that is a real update, not stale. The post-run anchor
* path is re-resolved rather than reused from boot time: pnpm removes the old
* version's .pnpm directory on update, so a boot-time captured path would
* fail to read and collapse a successful update into a bogus 'missing'.
*
* A green exit whose verification has nothing to compare (registry probe
* outage, missing anchor, non-npm mode) is reported as `verify-failed` — it
* must never read as success. A green exit where no package moved but the
* post-run check could not prove the install is fully current (a partial
* probe failure hides whether a gate kept something back) is also
* `verify-failed`: it must not collapse into a success either.
* @param deps - the run and check seams.
* @returns the run result; `stale` when exit 0 left every version in place,
* `verify-failed` when the post-run check could not verify anything.
*/
async function runUpdateVerified(deps) {
	const before = /* @__PURE__ */ new Map();
	for (const name of deps.run.packages) {
		const version = readInstalledVersion(deps.check.resolve, name, deps.run.profileDir);
		if (version !== VERSION_UNKNOWN) before.set(name, version);
	}
	const result = await runUpdate(deps.run);
	if (!result.ok) return result;
	const anchorManifestPath = resolveAnchorManifest(deps.check.resolve) ?? deps.check.anchorManifestPath;
	const status = await checkUpdates({
		...deps.check,
		anchorManifestPath
	});
	if (status.error !== void 0 || status.mode !== "npm") return {
		...result,
		ok: false,
		errorCode: "verify-failed",
		error: "pnpm exited 0 but the post-run version check could not verify the install"
	};
	if (status.packages.some((packageStatus) => {
		const beforeVersion = before.get(packageStatus.name);
		if (beforeVersion === void 0 || packageStatus.current === VERSION_UNKNOWN) return false;
		return packageStatus.current !== beforeVersion;
	})) return result;
	if (status.outdated) return {
		...result,
		ok: false,
		errorCode: "stale",
		error: "pnpm exited 0 but the installed versions did not change"
	};
	if (status.packages.some((packageStatus) => packageStatus.latest === void 0)) return {
		...result,
		ok: false,
		errorCode: "verify-failed",
		error: "pnpm exited 0 but the post-run version check could not verify the install"
	};
	return result;
}
//#endregion
//#region src/update-routes.ts
/** Route paths (exact matches under /api). */
const UPDATE_PATHS = {
	status: "/api/update/status",
	run: "/api/update/run"
};
/**
* Build the /api/update route family.
* @param deps - fence + check/run seams.
* @returns the exact routes to register on webServer.
*/
function makeUpdateRoutes(deps) {
	const handleStatus = async (req, res) => {
		if (req.method !== "GET") {
			res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
			res.end("method not allowed");
			return;
		}
		if (!deps.fence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		writeJson(res, 200, await deps.check());
	};
	const handleRun = async (req, res) => {
		if (req.method !== "POST") {
			res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
			res.end("method not allowed");
			return;
		}
		if (!deps.fence(req)) {
			writeJson(res, 403, {
				ok: false,
				code: "forbidden"
			});
			return;
		}
		writeJson(res, 200, await deps.run());
	};
	return [{
		kind: "exact",
		path: UPDATE_PATHS.status,
		handler: handleStatus
	}, {
		kind: "exact",
		path: UPDATE_PATHS.run,
		handler: handleRun
	}];
}
//#endregion
//#region src/mount-once.ts
/**
* Host single-instance guard shared by the plugin family. The family bundle
* (dsh-web-ui-all / dsh-skins) namespaces every child row id (web-ui-*), so
* the loader accepts a standalone install of the same package side by side;
* without this guard the second instance would still re-register the same
* webserver routes, tools, settings namespaces, and system-prompt sections
* and fail the boot. mountOnce makes the second host apply a no-op for the
* lifetime of the first instance (the browser half is already deduped by
* package name in the client module host).
*
* The registry rides a global symbol so two module instances of the same
* package (npm copy vs repository link) still share one verdict. cordis
* `ctx.effect` runs its callback immediately and treats the callback's
* return value as the fiber disposer, so the unmarker is returned, not run.
*/
const MOUNTED = Symbol.for("dsh-web-ui.mounted-plugins");
function mountedSet() {
	const registry = globalThis;
	return registry[MOUNTED] ??= /* @__PURE__ */ new Set();
}
/**
* Wrap a cordis plugin apply so the package runs at most once per process.
* The first mount registers normally and unmarks when its fiber disposes;
* any later mount of the same package name is a no-op.
* @param packageName - npm package identity shared by every install source.
* @param fn - the original plugin apply.
* @returns an apply of the same shape.
*/
function mountOnce(packageName, fn) {
	return ((...args) => {
		const mounted = mountedSet();
		if (mounted.has(packageName)) return;
		mounted.add(packageName);
		args[0]?.effect?.(() => () => {
			mounted.delete(packageName);
		});
		return fn(...args);
	});
}
//#endregion
//#region src/index.ts
/**
* Mobile remote control for the dsh web GUI — host half. Mounts the pairing
* service (one-time tokens, device sessions, revocation), the /api/pair
* route family (issue/accept/stop/heartbeat/status/events), the api/gate
* listener that enforces pairing on every other /api request from
* non-loopback hosts, and the presence sweep. The browser half (the
* `./client` entry) renders the sidebar entry, the pairing panel, and the
* phone-side pair/accept + deep-link flow.
*/
/** Stable cordis plugin name. */
const name = "remote-web-ui";
/** Services required before the pairing surfaces can mount. */
const inject = ["webServer", "apiProxy"];
/**
* Settings namespace of the remote-control capability — the section the web
* settings surface edits. Spelled here rather than imported: the browser
* half spells the same value and must not depend on a Host package.
*/
const REMOTE_WEB_UI_SETTINGS_NAMESPACE = settingsNamespace("remote-web-ui");
const Config = z.object({
	tokenTtlMs: z.number().step(1).min(6e4).default(10 * 6e4),
	offlineAfterMs: z.number().step(1).min(5e3).default(25e3),
	maxDevices: z.number().step(1).min(1).max(64).default(4),
	idleExpireMs: z.number().step(1).min(6e4).default(DEFAULT_IDLE_EXPIRE_MS),
	cookieName: z.string().min(1).default("dsh_pair"),
	requirePairingForLan: z.boolean().default(true),
	publicBaseUrl: z.string(),
	devicesFile: z.string(),
	autoTunnel: z.boolean().default(false),
	mobileEnterToSend: z.boolean().default(true),
	enabled: z.boolean().default(true)
});
/** Presence sweep cadence (a stale device flips to disconnected within two sweeps). */
const SWEEP_INTERVAL_MS = 1e4;
/**
* The single mapping from resolved plugin config to the pairing service
* config. Both the constructed service and every live settings sync reuse
* it, so no field can be silently dropped when the web settings surface
* pushes a new value into the running service.
*/
function pairingConfigOf(resolved) {
	return {
		tokenTtlMs: resolved.tokenTtlMs,
		offlineAfterMs: resolved.offlineAfterMs,
		maxDevices: resolved.maxDevices,
		idleExpireMs: resolved.idleExpireMs,
		cookieName: resolved.cookieName,
		devicesFile: resolved.devicesFile
	};
}
/** Default paired-session store: `$DSH_HOME/remote-web-ui-devices.json`. */
function defaultDevicesFile(home = dshHome()) {
	return join(home, "remote-web-ui-devices.json");
}
/** Schema defaults, re-read for hand-built test contexts (the loader applies them normally). */
const DEFAULTS = {
	tokenTtlMs: 10 * 6e4,
	offlineAfterMs: 25e3,
	maxDevices: 4,
	idleExpireMs: DEFAULT_IDLE_EXPIRE_MS,
	cookieName: "dsh_pair",
	requirePairingForLan: true,
	publicBaseUrl: void 0,
	devicesFile: defaultDevicesFile(),
	autoTunnel: false,
	mobileEnterToSend: true,
	enabled: true
};
/**
* Mount the pairing service, routes, gate listener, and presence sweep.
* @param ctx - host plugin context carrying webServer.
* @param config - resolved plugin config (schema defaults applied by the loader).
*/
const apply = mountOnce("@dsh-selfuse/remote-web-ui", applyImpl);
function applyImpl(ctx, config) {
	const resolved = {
		tokenTtlMs: config?.tokenTtlMs ?? DEFAULTS.tokenTtlMs,
		offlineAfterMs: config?.offlineAfterMs ?? DEFAULTS.offlineAfterMs,
		maxDevices: config?.maxDevices ?? DEFAULTS.maxDevices,
		idleExpireMs: config?.idleExpireMs ?? DEFAULTS.idleExpireMs,
		cookieName: config?.cookieName ?? DEFAULTS.cookieName,
		requirePairingForLan: config?.requirePairingForLan ?? DEFAULTS.requirePairingForLan,
		publicBaseUrl: config?.publicBaseUrl,
		devicesFile: config?.devicesFile ?? DEFAULTS.devicesFile,
		autoTunnel: config?.autoTunnel ?? DEFAULTS.autoTunnel,
		mobileEnterToSend: config?.mobileEnterToSend ?? DEFAULTS.mobileEnterToSend,
		enabled: config?.enabled ?? DEFAULTS.enabled
	};
	let current = () => config ?? {};
	const resolve = () => {
		const value = current();
		return {
			tokenTtlMs: value.tokenTtlMs ?? DEFAULTS.tokenTtlMs,
			offlineAfterMs: value.offlineAfterMs ?? DEFAULTS.offlineAfterMs,
			maxDevices: value.maxDevices ?? DEFAULTS.maxDevices,
			idleExpireMs: value.idleExpireMs ?? DEFAULTS.idleExpireMs,
			cookieName: value.cookieName ?? DEFAULTS.cookieName,
			requirePairingForLan: value.requirePairingForLan ?? DEFAULTS.requirePairingForLan,
			publicBaseUrl: value.publicBaseUrl,
			devicesFile: value.devicesFile ?? DEFAULTS.devicesFile,
			autoTunnel: value.autoTunnel ?? DEFAULTS.autoTunnel,
			mobileEnterToSend: value.mobileEnterToSend ?? DEFAULTS.mobileEnterToSend,
			enabled: value.enabled ?? DEFAULTS.enabled
		};
	};
	const service = new PairingService(pairingConfigOf(resolved));
	const tunnel = new TunnelManager();
	let autoTunnel = resolved.autoTunnel;
	tunnel.onPhase((info) => {
		if (!autoTunnel) return;
		if (info.phase === "running" && info.url !== void 0) {
			service.setPublicBaseUrl(info.url);
			service.setTunnelStatus({
				state: "running",
				url: info.url
			});
			runPostureProbe();
		} else if (info.phase === "starting") {
			service.setPublicBaseUrl(void 0);
			service.setTunnelStatus({ state: "starting" });
		} else if (info.phase === "failed") {
			service.setPublicBaseUrl(void 0);
			service.setTunnelStatus(info.error === void 0 ? { state: "failed" } : {
				state: "failed",
				error: info.error
			});
		}
	});
	ctx.effect(() => () => {
		tunnel.dispose();
	}, "remote-web-ui: auto tunnel");
	const lanBases = ctx.webServer.host === "0.0.0.0" ? lanIPv4Addresses().map((address) => ({
		address,
		base: `http://${address}:${String(ctx.webServer.port)}`
	})) : [];
	service.setLanBases(lanBases);
	const lanAddresses = lanBases.map((entry) => entry.address);
	let disposeRoutes;
	let disposeSweep;
	const apiProxy = ctx.get("apiProxy");
	if (apiProxy === void 0) console.warn("remote-web-ui: apiProxy service unavailable — the mobile data channel is disabled");
	const requireFromHost = createRequire(import.meta.url);
	const resolveAnchorPath = () => resolveAnchorManifest((specifier) => {
		try {
			return requireFromHost.resolve(specifier);
		} catch {
			return;
		}
	});
	const updateRoutes = makeUpdateRoutes({
		fence: (request) => isTrustedApiRequest(request, []),
		check: () => checkUpdates({
			anchorManifestPath: resolveAnchorPath(),
			resolve: (specifier) => {
				try {
					return requireFromHost.resolve(specifier);
				} catch {
					return;
				}
			},
			fetchLatest: (name) => fetchLatestVersion(name, fetch)
		}),
		run: async () => {
			const target = resolveUpdateTarget({ anchorManifestPath: resolveAnchorPath() });
			if ("error" in target) {
				const code = target.error;
				return {
					ok: false,
					exitCode: null,
					output: "",
					error: code === "not-found" ? "dsh-web-ui aggregate not installed" : "local link install — update unavailable",
					errorCode: code
				};
			}
			return runUpdateVerified({
				run: {
					profileDir: target.profileDir,
					packages: target.packages
				},
				check: {
					anchorManifestPath: resolveAnchorPath(),
					resolve: (specifier) => {
						try {
							return requireFromHost.resolve(specifier);
						} catch {
							return;
						}
					},
					fetchLatest: (name) => fetchLatestVersion(name, fetch)
				}
			});
		}
	});
	const routes = [
		...makeRoutes({
			service,
			lanAddresses
		}),
		...makeMobileRoutes(),
		...apiProxy !== void 0 ? makeMobileApiRoutes({
			service,
			apiProxy,
			mobileEnterToSend: () => resolve().mobileEnterToSend,
			requirePairingForLan: () => resolve().requirePairingForLan
		}) : [],
		...makeRemoteApiRoutes({
			service,
			port: ctx.webServer.port,
			requirePairingForLan: () => resolve().requirePairingForLan
		}),
		...updateRoutes
	];
	const upgrades = makeRemoteApiUpgradeRoutes({
		service,
		port: ctx.webServer.port,
		requirePairingForLan: () => resolve().requirePairingForLan
	});
	const gate = makeGateListener(service, () => resolve().requirePairingForLan, () => resolve().enabled);
	ctx.effect(() => ctx.on("api/gate", gate), "remote-web-ui: api gate");
	let postureKey;
	let postureWasExposed = false;
	const runPostureProbe = () => {
		if (!resolve().enabled) return;
		const targets = postureTargets(service.publicBaseUrl, service.lanAddresses, ctx.webServer.port);
		if (targets.length === 0) {
			postureKey = void 0;
			service.setPosture(void 0);
			return;
		}
		const key = targets.join("|");
		const claim = claimPostureKey(postureKey, key);
		if (!claim.run) return;
		postureKey = claim.next;
		probePosture({
			port: ctx.webServer.port,
			targets
		}).then((snapshot) => {
			service.setPosture(snapshot);
			const exposedHosts = snapshot.hosts.filter((host) => host.exposed).map((host) => host.host);
			const exposed = exposedHosts.length > 0;
			if (exposed && !postureWasExposed) console.error(`remote-web-ui: CRITICAL — the /api fence is OPEN for [${exposedHosts.join(", ")}]: unpaired clients reach the full host API. Remove --trusted-host for these hosts (pairing covers them) or bind loopback.`);
			else if (!exposed && postureWasExposed) console.log("remote-web-ui: the /api posture probe is clean again (every advertised origin refused with 403).");
			postureWasExposed = exposed;
		}).catch(() => {
			postureKey = releasePostureKey(postureKey, key);
		});
	};
	const initialPostureTimer = setTimeout$1(() => {
		runPostureProbe();
	}, 5e3);
	initialPostureTimer.unref();
	ctx.effect(() => () => {
		clearTimeout(initialPostureTimer);
	}, "remote-web-ui: posture probe boot");
	new RemoteWebUiPairing(ctx, (request) => {
		if (!resolve().enabled) return false;
		return isPairedDeviceRequest(service, request);
	});
	const sync = () => {
		const value = resolve();
		service.config = pairingConfigOf(value);
		autoTunnel = value.autoTunnel === true;
		if (autoTunnel) {
			if (value.publicBaseUrl !== void 0) console.warn("remote-web-ui: autoTunnel is on — ignoring the manually configured publicBaseUrl");
			tunnel.start(`http://127.0.0.1:${String(ctx.webServer.port)}`);
		} else {
			tunnel.stop();
			if (value.publicBaseUrl !== void 0 && !isHttpUrl(value.publicBaseUrl)) {
				console.warn(`remote-web-ui: ignoring malformed publicBaseUrl ${JSON.stringify(value.publicBaseUrl)} (expected https://host[:port])`);
				service.setPublicBaseUrl(void 0);
			} else service.setPublicBaseUrl(value.publicBaseUrl);
		}
		const enabled = value.enabled;
		if (!enabled) service.stop();
		if (disposeRoutes === void 0 && enabled) disposeRoutes = ctx.effect(() => {
			const disposers = [...routes.map((route) => ctx.webServer.register(route)), ...upgrades.map((route) => ctx.webServer.registerUpgrade(route))];
			return () => {
				for (const dispose of disposers) dispose();
			};
		}, "remote-web-ui: pairing routes");
		else if (disposeRoutes !== void 0 && !enabled) {
			disposeRoutes();
			disposeRoutes = void 0;
		}
		if (disposeSweep === void 0 && enabled) disposeSweep = ctx.effect(() => {
			const timer = setInterval$1(() => {
				service.sweep();
			}, SWEEP_INTERVAL_MS);
			timer.unref();
			return () => {
				clearInterval(timer);
			};
		}, "remote-web-ui: presence sweep");
		else if (disposeSweep !== void 0 && !enabled) {
			disposeSweep();
			disposeSweep = void 0;
		}
		runPostureProbe();
	};
	installSettingsSection(ctx, REMOTE_WEB_UI_SETTINGS_NAMESPACE, Config, config ?? {}, {
		setSource: (source) => {
			current = source;
			sync();
		},
		onChange: sync
	});
	sync();
}
/** Whether a configured public base is a parseable http(s) URL with a host. */
function isHttpUrl(value) {
	try {
		const url = new URL(value);
		return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "";
	} catch {
		return false;
	}
}
//#endregion
export { Config, REMOTE_WEB_UI_SETTINGS_NAMESPACE, apply, defaultDevicesFile, inject, name, pairingConfigOf };
