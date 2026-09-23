/** Private, session-scoped storage for tool text omitted from model history. */
export declare class LocalResultStore {
    private readonly root;
    private readonly retentionMs;
    private readonly maxStoredBytes;
    private lastSweep;
    constructor(root: string, retentionMs: number, maxStoredBytes: number);
    private ensureRoot;
    private sweep;
    /** Save text under an unpredictable handle; the handle contains no path or secret. */
    save(sessionId: string, callId: string, raw: string): Promise<string>;
    /** Return only the owning session's locally stored text to the in-process classifier. */
    load(sessionId: string, handle: string): Promise<string>;
}
//# sourceMappingURL=local-result-store.d.ts.map