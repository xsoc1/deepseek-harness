/**
 * Mobile remote control — browser half. Registers the `remote` dictionaries,
 * the sidebar-foot entry (phone trigger + pairing panel) into the
 * ui-sidebar-declared `sidebar.remote` seat, and runs the phone-side boot
 * flow (pair accept + workspace deep-link + presence heartbeats) plus the
 * one-time failed-pair notice. Export discipline: packages/client/AGENTS.md
 * — the /client surface carries only what cordis loading needs plus types.
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { FooterRemoteEntry } from "./FooterRemoteEntry.js";
import { RemoteEntry } from "./RemoteEntry.js";
import { PairFailedNotice } from "./PairFailedNotice.js";
import { RemoteSettingsCard, RemoteSettingsCardController } from "./RemoteSettingsCard.js";
import { en, zh } from "./locales.js";
import { PAIR_FAILED_MARKER, runPairBootFlow } from "./deep-link.js";
import { sendHeartbeat } from "./pair-api.js";
import { channelTransition, installRemoteChannel, isLoopbackHostname } from "./remote-channel.js";
import { FenceNotice } from "./FenceNotice.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'remote';
/** Settings namespace the remote-control card edits (the Host plugin registers it). */
const REMOTE_WEB_UI_NS = 'remote-web-ui';
/** Heartbeat cadence from a paired phone (presence + revocation liveness). */
const HEARTBEAT_INTERVAL_MS = 10_000;
/** Services required by this plugin. */
export const inject = ['slots', 'locale', 'connection', 'settingsScope', 'remote'];
/**
 * Register the remote-control surface.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'remote-web-ui: dictionaries');
    const t = ctx.locale.bind(NS);
    const binder = ctx.get('webUiSettings') ?? ctx.settingsScope;
    const settingsScope = binder.bind({ namespace: REMOTE_WEB_UI_NS });
    const enabled = () => {
        const snapshot = settingsScope.getSnapshot();
        return snapshot.status === 'ready'
            ? snapshot.value?.enabled ?? true
            : snapshot.status === 'unavailable';
    };
    // Sidebar foot entry: the shell declares 'sidebar.remote' in unconstrained
    // order, so registration is declaration-aware — slots.inject waits on the
    // declaration, removes the contribution when it collapses, and re-runs
    // after a redeclaration. The entry follows the plugin's enabled setting:
    // toggling it off removes the trigger, toggling it back on re-registers it.
    ctx.slots.inject('sidebar.remote', () => {
        let disposeEntry;
        const syncEntry = () => {
            if (enabled() && disposeEntry === undefined) {
                disposeEntry = ctx.slots.register({ name: 'sidebar.remote', locale: NS }, RemoteEntry);
            }
            else if (!enabled() && disposeEntry !== undefined) {
                disposeEntry();
                disposeEntry = undefined;
            }
        };
        const unsubscribe = settingsScope.subscribe(syncEntry);
        syncEntry();
        return () => {
            unsubscribe();
            disposeEntry?.();
        };
    });
    // Current shells declare `sidebar.footer.action` instead of the legacy
    // `sidebar.remote` seat; this fallback registers the same entry there when
    // the legacy seat never arrives (declaration-aware: only one of the two
    // injects ever fires, so the trigger can never render twice).
    ctx.slots.inject('sidebar.footer.action', () => {
        let disposeEntry;
        const syncEntry = () => {
            if (enabled() && disposeEntry === undefined) {
                disposeEntry = ctx.slots.register({ name: 'sidebar.footer.action', id: 'remote-web-ui', locale: NS }, FooterRemoteEntry);
            }
            else if (!enabled() && disposeEntry !== undefined) {
                disposeEntry();
                disposeEntry = undefined;
            }
        };
        const unsubscribe = settingsScope.subscribe(syncEntry);
        syncEntry();
        return () => {
            unsubscribe();
            disposeEntry?.();
        };
    });
    // Plugin configuration card: one staged form over the `remote-web-ui`
    // settings namespace, contributed to the Web UI plugin group.
    const remoteSettings = new RemoteSettingsCardController(settingsScope);
    ctx.slots.inject('web-ui.plugin.item', () => {
        const unregister = ctx.slots.register({
            name: 'web-ui.plugin.item',
            id: 'remote-web-ui',
            order: 90,
            locale: NS,
            inject: () => remoteSettings.inject(),
        }, RemoteSettingsCard);
        return () => {
            remoteSettings.dispose();
            unregister();
        };
    });
    // Phone-side boot flow + heartbeats. Loopback pages (the desktop) never
    // heartbeat; the server ignores unpaired heartbeats anyway. Both run only
    // while the plugin is enabled.
    let disposeRuntime;
    const syncRuntime = () => {
        if (enabled() && disposeRuntime === undefined) {
            disposeRuntime = ctx.effect(() => {
                const connection = ctx.get('connection');
                const loopback = connection?.isLoopback ?? true;
                runPairBootFlow(ctx, window.location.search);
                if (loopback)
                    return () => { };
                const timer = window.setInterval(() => { void sendHeartbeat().catch(() => { }); }, HEARTBEAT_INTERVAL_MS);
                return () => { window.clearInterval(timer); };
            }, 'remote-web-ui: pair flow + heartbeats');
        }
        else if (!enabled() && disposeRuntime !== undefined) {
            disposeRuntime();
            disposeRuntime = undefined;
        }
    };
    settingsScope.subscribe(syncRuntime);
    syncRuntime();
    // Remote desktop channel: on a non-loopback origin (LAN address or public
    // tunnel) the connection plugin's /api fence refuses this desktop Web GUI,
    // and pairing is the access control — so the SDK client's /api traffic is
    // rewritten onto this plugin's gated /remote/api prefix (remote-channel.ts)
    // while the fence setting demands it. Loopback origins are untouched.
    let disposeChannel;
    let fenceNotice;
    const showFenceNotice = () => {
        if (fenceNotice !== undefined)
            return;
        const node = document.createElement('div');
        document.body.appendChild(node);
        const root = createRoot(node);
        root.render(createElement(FenceNotice, { t, onRetry: () => { window.location.reload(); } }));
        fenceNotice = { unmount: () => { root.unmount(); node.remove(); }, node };
    };
    const hideFenceNotice = () => {
        fenceNotice?.unmount();
        fenceNotice = undefined;
    };
    const channelActive = () => {
        if (isLoopbackHostname(window.location.hostname))
            return false;
        // A not-yet-loaded (or unavailable) settings snapshot falls back to the
        // schema defaults — enabled and requirePairingForLan are both true, and
        // on a remote origin the snapshot may never load (its own transport is
        // what the channel gates), so waiting for 'ready' here would deadlock
        // the channel off exactly where it is needed most.
        const snapshot = settingsScope.getSnapshot();
        const value = snapshot.status === 'ready' ? snapshot.value : undefined;
        return (value?.enabled ?? true) && (value?.requirePairingForLan ?? true);
    };
    const syncChannel = () => {
        const transition = channelTransition(channelActive(), disposeChannel !== undefined);
        if (transition === 'install') {
            disposeChannel = ctx.effect(() => {
                const restore = installRemoteChannel(window, { onUnpaired: showFenceNotice, onPaired: hideFenceNotice });
                return restore;
            }, 'remote-web-ui: remote desktop channel');
        }
        else if (transition === 'retire' && disposeChannel !== undefined) {
            disposeChannel();
            disposeChannel = undefined;
            // Retire the notice with the channel: once requirePairingForLan turns
            // off (or the plugin is disabled) the desktop rides plain /api again,
            // so an unpaired notice raised while the channel was briefly active
            // (the settings snapshot loads after boot) must not outlive it. The
            // installed channel is the only path that raises the notice, so with
            // the channel gone nothing can re-raise it (issue #808).
            hideFenceNotice();
        }
    };
    settingsScope.subscribe(syncChannel);
    syncChannel();
    // One-time failed-pair toast. The accept result lands asynchronously, so
    // the marker check is deferred past the accept round trip.
    ctx.effect(() => {
        const timer = window.setTimeout(() => {
            if (sessionStorage.getItem(PAIR_FAILED_MARKER) === null)
                return;
            sessionStorage.removeItem(PAIR_FAILED_MARKER);
            const mount = document.createElement('div');
            document.body.appendChild(mount);
            const root = createRoot(mount);
            root.render(createElement(PairFailedNotice, { t }));
            // The toast owns its dismissal; the root lives for the page lifetime.
            void root;
        }, 1500);
        return () => { window.clearTimeout(timer); };
    }, 'remote-web-ui: failed-pair notice');
}
