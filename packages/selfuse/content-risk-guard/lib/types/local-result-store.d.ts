/** Private, session-scoped storage for tool text omitted from model history. */
export declare class LocalResultStore {
    private readonly root;
    private readonly retentionMs;
    private readonly maxStoredBytes;
    private lastSweep;
    constructor(root: string, retentionMs: number, maxStoredBytes: number);
    private ensureRoot;
    private sweep;
    /** Save text under an unpredictable handle; the handle contains no path or secret.
     * @param sessionId session permitted to retrieve this retained result.
     * @param callId tool call that produced the result.
     * @param raw complete private result retained on the local filesystem.
     * @returns an opaque handle bound to the owning session.
     */
    save(sessionId: string, callId: string, raw: string): Promise<string>;
    /** Return only the owning session's locally stored text to the in-process classifier.
     * @param sessionId session requesting its retained result.
     * @param handle opaque handle previously returned by save.
     * @returns original text when ownership, file mode, and retention checks pass.
     */
    load(sessionId: string, handle: string): Promise<string>;
}
//# sourceMappingURL=local-result-store.d.ts.map