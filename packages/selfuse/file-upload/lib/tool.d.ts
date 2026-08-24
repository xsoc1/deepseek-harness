/** read_document tool: page through uploaded documents with on-demand
 * conversion to Markdown (built-in JS parsers or the MarkItDown CLI when
 * configured). Results are cached with a byte-budgeted LRU keyed by
 * (path + size + mtime), so re-reads after an edit re-parse while identical
 * files hit the cache.
 */
export interface ReadDocumentConfig {
    readLimit: number;
    maxFileBytes: number;
    sheetRowLimit: number;
    maxSheets: number;
    markitdownBin?: string;
    markitdownTimeoutMs?: number;
}
export interface CacheEntry {
    markdown: string;
    bytes: number;
}
/** Byte-budgeted LRU cache keyed by path+size+mtime. */
export declare class ParseCache {
    private readonly maxEntries;
    private readonly maxBytes;
    private readonly entries;
    private totalBytes;
    constructor(maxEntries: number, maxBytes: number);
    get(key: string): string | undefined;
    set(key: string, markdown: string): void;
    get size(): number;
}
interface ToolContext {
    fs: {
        root: string;
    };
}
export declare function defineReadDocumentTool(ctx: ToolContext, config: ReadDocumentConfig, cache: ParseCache): import("@deepseek-ai/dsh-tools").ToolDefinition;
export {};
