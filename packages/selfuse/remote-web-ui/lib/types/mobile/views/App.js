import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Mobile surface root: the view state machine (workspaces → sessions →
 * chat) and the top-level data flows. Deliberately plain React state — no
 * router, no state library: the surface is three fixed levels with a back
 * affordance, and every piece of data is fetched on demand.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMobilePreferences, history as fetchHistory, listSessions, listWorkspaces, prompt } from "../api.js";
import { MuxClient } from "../mux.js";
import { RpcCallError, RpcTransportError } from "../rpc.js";
import { ChatView } from "./ChatView.js";
import { SessionListView } from "./SessionListView.js";
import { WorkspaceView as WorkspaceRoster } from "./WorkspaceView.js";
import { PairRequiredView } from "../PairRequiredView.js";
/** Read the optional workspace target carried from the pairing QR flow. */
export function mobileWorkspaceTarget(search) {
    const value = new URLSearchParams(search).get('workspace');
    return value === null || value === '' ? undefined : value;
}
/** Map a list row to the surface model; the title comes from projections when present. */
export function toSessionView(item) {
    const titleValue = item.projections?.values?.title;
    const title = typeof titleValue === 'string' && titleValue !== ''
        ? titleValue
        : item.cwd !== undefined ? item.cwd.split('/').filter(Boolean).at(-1) ?? item.cwd : '新会话';
    return {
        sessionId: item.sessionId,
        title,
        ...(item.cwd !== undefined ? { cwd: item.cwd } : {}),
        updatedAt: item.updatedAt,
        running: item.running,
        blank: item.blank,
    };
}
/** Human clock, e.g. "14:05" or "昨天 20:31". */
export function formatTime(epochMs) {
    const date = new Date(epochMs);
    const clock = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const today = new Date();
    if (date.toDateString() === today.toDateString())
        return clock;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString())
        return `昨天 ${clock}`;
    return `${String(date.getMonth() + 1)}月${String(date.getDate())}日 ${clock}`;
}
/** Whether the mobile gateway rejected this browser for lack of a paired cookie. */
export function isUnpairedMobileError(error) {
    return error instanceof RpcTransportError && error.message === 'HTTP 403';
}
/** Classify an initial mobile preference failure without treating outage as authorization. */
export function mobilePairStateForError(error) {
    return isUnpairedMobileError(error) ? 'unpaired' : 'unavailable';
}
/** Gate the independent mobile bundle until its own browser context is paired. */
export function App({ initialPairError }) {
    const [pairState, setPairState] = useState('checking');
    useEffect(() => {
        let current = true;
        void fetchMobilePreferences().then(() => { if (current)
            setPairState('paired'); }, (error) => { if (current)
            setPairState(mobilePairStateForError(error)); });
        return () => { current = false; };
    }, []);
    if (pairState === 'checking') {
        return _jsx("main", { className: "mobile mobile-empty", children: _jsx("p", { className: "mobile-muted", children: "\u6B63\u5728\u8FDE\u63A5..." }) });
    }
    if (pairState === 'unpaired') {
        return _jsx(PairRequiredView, { initialError: initialPairError, onPaired: (path) => { window.location.replace(path); } });
    }
    if (pairState === 'unavailable') {
        return (_jsxs("main", { className: "mobile mobile-empty", children: [_jsx("p", { className: "mobile-error", role: "alert", children: "\u65E0\u6CD5\u8FDE\u63A5\u5230\u8FD0\u884C\u4E2D\u7684 DSH host\u3002" }), _jsx("button", { className: "mobile-new", type: "button", onClick: () => { window.location.reload(); }, children: "\u91CD\u8BD5" })] }));
    }
    return _jsx(PairedApp, {});
}
/** The existing remote mobile surface, mounted only after device pairing succeeds. */
function PairedApp() {
    const [route, setRoute] = useState({ kind: 'workspaces' });
    const [initialWorkspaceId, setInitialWorkspaceId] = useState(() => mobileWorkspaceTarget(window.location.search));
    const muxRef = useRef(undefined);
    // The mux stream lives for the page lifetime: session events keep the
    // open chat live, and reconnect is automatic.
    useEffect(() => {
        const mux = new MuxClient();
        muxRef.current = mux;
        mux.start();
        return () => { mux.stop(); };
    }, []);
    // Keep the live-event client pointed at the session currently on screen so
    // its polling fallback can keep that chat fresh over SSE-impairing tunnels
    // (quick tunnel / Tailscale Serve do not forward Server-Sent Events).
    useEffect(() => {
        muxRef.current?.observe(route.kind === 'chat' ? route.session.sessionId : undefined);
    }, [route]);
    const back = useCallback(() => {
        setRoute(previous => {
            if (previous.kind === 'chat')
                return { kind: 'sessions', workspace: previous.workspace };
            if (previous.kind === 'sessions')
                return { kind: 'workspaces' };
            return previous;
        });
    }, []);
    const openChat = useCallback((session, workspace) => {
        setRoute({ kind: 'chat', session, workspace });
    }, []);
    const openWorkspace = useCallback((workspace) => {
        if (initialWorkspaceId !== undefined) {
            const url = new URL(window.location.href);
            url.searchParams.delete('workspace');
            window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
            setInitialWorkspaceId(undefined);
        }
        setRoute({ kind: 'sessions', workspace });
    }, [initialWorkspaceId]);
    return (_jsx("div", { className: "mobile", children: route.kind === 'workspaces'
            ? _jsx(WorkspaceRoster, { initialWorkspaceId: initialWorkspaceId, onPick: openWorkspace })
            : route.kind === 'sessions'
                ? (_jsx(SessionListView, { workspace: route.workspace, onBack: back, onPick: (session) => { openChat(session, route.workspace); } }))
                : _jsx(ChatView, { session: route.session, mux: muxRef.current, onBack: back }) }));
}
/** Shared error text for the surface's small failure affordances. */
export function errorText(error) {
    if (error instanceof RpcCallError)
        return error.error.message;
    if (error instanceof RpcTransportError)
        return error.message;
    if (error instanceof Error)
        return error.message;
    return String(error);
}
/**
 * Actionable hint for transport-level 403s on host-gated channels (model
 * picker, session creation): the phone's UI bundle is served fresh from disk
 * per request, while the host-side allowlist lives in the long-running
 * process — a rebuild without a restart shows the new surface against the
 * old allowlist (HTTP 403 forbidden).
 */
export function staleHostHint(message) {
    return /^HTTP 403/.test(message)
        ? '宿主端插件可能仍在运行旧版本：请重启 dsh web 后再试。'
        : undefined;
}
/** Fetch one history page (tail by default) — thin wrapper so views share the call shape. */
export function loadHistory(sessionId, beforeSeq, signal) {
    return fetchHistory(sessionId, beforeSeq, undefined, signal);
}
export { listSessions, listWorkspaces, prompt };
