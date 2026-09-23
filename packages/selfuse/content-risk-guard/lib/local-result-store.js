import { randomBytes } from 'node:crypto';
import { mkdir, lstat, open, readFile, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
const HANDLE_PATTERN = /^[a-f0-9]{32}$/;
const FILE_PATTERN = /^[a-f0-9]{32}\.json$/;
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
/** Private, session-scoped storage for tool text omitted from model history. */
export class LocalResultStore {
    root;
    retentionMs;
    maxStoredBytes;
    lastSweep = 0;
    constructor(root, retentionMs, maxStoredBytes) {
        this.root = root;
        this.retentionMs = retentionMs;
        this.maxStoredBytes = maxStoredBytes;
    }
    async ensureRoot() {
        await mkdir(this.root, { recursive: true, mode: 0o700 });
        const info = await lstat(this.root);
        if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) !== 0
            || (process.getuid !== undefined && info.uid !== process.getuid())) {
            throw new Error('local result directory is not private');
        }
    }
    async sweep(now) {
        if (now - this.lastSweep < SWEEP_INTERVAL_MS)
            return;
        this.lastSweep = now;
        for (const name of await readdir(this.root)) {
            if (!FILE_PATTERN.test(name))
                continue;
            const path = join(this.root, name);
            const info = await lstat(path);
            if (!info.isFile() || info.isSymbolicLink())
                continue;
            if (now - info.mtimeMs > this.retentionMs)
                await unlink(path);
        }
    }
    /** Save text under an unpredictable handle; the handle contains no path or secret. */
    async save(sessionId, callId, raw) {
        const value = { sessionId, callId, createdAt: Date.now(), raw };
        const payload = JSON.stringify(value);
        if (Buffer.byteLength(payload, 'utf8') > this.maxStoredBytes) {
            throw new Error('local result record exceeds the configured size limit');
        }
        await this.ensureRoot();
        await this.sweep(Date.now());
        const handle = randomBytes(16).toString('hex');
        const path = join(this.root, `${handle}.json`);
        const file = await open(path, 'wx', 0o600);
        try {
            await file.writeFile(payload);
        }
        finally {
            await file.close();
        }
        return handle;
    }
    /** Return only the owning session's locally stored text to the in-process classifier. */
    async load(sessionId, handle) {
        if (!HANDLE_PATTERN.test(handle))
            throw new Error('invalid local result handle');
        await this.ensureRoot();
        const path = join(this.root, `${handle}.json`);
        const info = await lstat(path);
        if (!info.isFile() || info.isSymbolicLink() || info.size > this.maxStoredBytes || (info.mode & 0o077) !== 0
            || (process.getuid !== undefined && info.uid !== process.getuid())) {
            throw new Error('local result file is unsafe');
        }
        let value;
        try {
            value = JSON.parse(await readFile(path, 'utf8'));
            if (typeof value.sessionId !== 'string' || typeof value.raw !== 'string'
                || !Number.isSafeInteger(value.createdAt) || typeof value.callId !== 'string') {
                throw new Error('invalid local result record');
            }
        }
        catch {
            throw new Error('local result record is unavailable');
        }
        if (value.sessionId !== sessionId)
            throw new Error('local result belongs to another session');
        if (value.createdAt > Date.now() || Date.now() - value.createdAt > this.retentionMs) {
            throw new Error('local result expired');
        }
        return value.raw;
    }
}
//# sourceMappingURL=local-result-store.js.map