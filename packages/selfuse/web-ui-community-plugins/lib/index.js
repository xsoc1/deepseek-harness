import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "schemastery";
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
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
const name = "ui-community-plugins";
/** Services the settings registration needs (the settings seam is optional). */
const inject = [];
/**
* Settings namespace of the card's enable switch — the section the web
* settings surface edits. Spelled here rather than imported: the browser half
* spells the same value and must not depend on a Host package.
*/
const COMMUNITY_PLUGINS_SETTINGS_NAMESPACE = settingsNamespace("community-plugins");
const Config = z.object({ enabled: z.boolean().default(true) });
/**
* Register the community-plugins settings namespace. The application of the
* value is browser-side (the card hides its list while off), so the hooks
* only keep the source reachable; installSettingsSection is a no-op when no
* settings service is mounted (pure community-card installs skip it).
* @param ctx - cordis context.
*/
const apply = mountOnce("@dsh-selfuse/web-ui-community-plugins", applyImpl);
function applyImpl(ctx) {
	installSettingsSection(ctx, COMMUNITY_PLUGINS_SETTINGS_NAMESPACE, Config, {}, {
		setSource: () => {},
		onChange: () => {}
	});
}
//#endregion
export { COMMUNITY_PLUGINS_SETTINGS_NAMESPACE, Config, apply, inject, name };
