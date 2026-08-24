import type { IncomingMessage, ServerResponse } from 'node:http';
import type { SniffResult } from './detect.ts';
export interface UploadOptions {
    /** Byte cap for one upload body. */
    maxBytes: number;
    /** Lowercase extension allowlist; empty array means every extension is allowed. */
    allowedExtensions: string[];
    /** How long an uploaded file may live before the sweep removes it. */
    ttlMs: number;
    /** Sweep interval; 0 disables the periodic sweep. */
    sweepIntervalMs: number;
    /** Concurrent upload bodies admitted at once. */
    maxConcurrent: number;
    /** Byte cap for one inline text payload returned to the client. */
    inlineTextLimit: number;
    /** Byte cap for the preview returned to the client. */
    previewTextLimit: number;
    /**
     * Resolve a session id to its workspace cwd. When the resolver exists but
     * returns undefined the request is rejected (unauthenticated session);
     * when the resolver is absent (no sessions service injected) requests fall
     * back to `defaultDir`.
     */
    sessionCwd?: (sessionId: string) => string | undefined | Promise<string | undefined>;
    /** Fallback storage root when no sessions service is available. */
    defaultDir: string;
    now?: () => number;
}
export interface UploadedMeta {
    path: string;
    name: string;
    bytes: number;
    sessionId: string;
    sniff: SniffResult;
    inlineText?: string;
    preview?: string;
    deduplicated?: boolean;
}
/** Control chars, path separators, dot segments and leading dots stripped. */
export declare function sanitizeFileName(raw: string): string;
/** Session ids are opaque tokens; still constrain them to a safe alphabet. */
export declare function sanitizeSessionId(id: string): string;
/** Decode text bytes for inline/preview payloads (UTF-16 BOM aware). */
export declare function decodeForInline(data: Buffer, encoding: 'utf8' | 'utf16le' | 'gb18030' | undefined): string;
export declare function createUploadHandler(options: UploadOptions): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
/** Periodically remove upload directories older than the TTL. */
export declare function createSweeper(rootDir: string, ttlMs: number, intervalMs: number, now?: () => number): () => void;
