import z from '@deepseek-ai/schemastery';
/** Cordis plugin name — must match the row id in cordis.patch.yml. */
export declare const name = "@dsh-selfuse/file-upload";
/** Services required by this plugin. */
export declare const inject: string[];
/** Plugin config, mirroring the schemastery schema below. */
export interface FileUploadConfig {
    uploadMaxBytes: number;
    allowedExtensions: string[];
    uploadTtlMs: number;
    sweepIntervalMs: number;
    maxConcurrentUploads: number;
    inlineTextLimit: number;
    previewTextLimit: number;
    maxFileBytes: number;
    readLimit: number;
    sheetRowLimit: number;
    maxSheets: number;
    cacheEntries: number;
    cacheMaxBytes: number;
    markitdownBin: string;
    markitdownTimeoutMs: number;
    uploadDir: string;
}
export declare const Config: z<Schemastery.ObjectS<{
    /** Byte cap for one upload body. */
    uploadMaxBytes: z<number, number>;
    /** Lowercase extension allowlist; empty means all allowed. */
    allowedExtensions: z<string[], string[]>;
    /** Uploaded files older than this are swept away. */
    uploadTtlMs: z<number, number>;
    /** Sweep interval; 0 disables the periodic sweep. */
    sweepIntervalMs: z<number, number>;
    /** Concurrent upload bodies admitted at once. */
    maxConcurrentUploads: z<number, number>;
    /** Byte cap for text inlined straight into the composer. */
    inlineTextLimit: z<number, number>;
    /** Byte cap for the preview returned alongside a large text file. */
    previewTextLimit: z<number, number>;
    /** Byte cap for one document read (PDF parsing amplifies memory severalfold). */
    maxFileBytes: z<number, number>;
    /** Default and maximum number of lines returned by one read_document call. */
    readLimit: z<number, number>;
    /** Rows kept per worksheet. */
    sheetRowLimit: z<number, number>;
    /** Sheets read per workbook (the rest are reported as truncated). */
    maxSheets: z<number, number>;
    /** Parse-cache capacity (path + size + mtime fingerprints). */
    cacheEntries: z<number, number>;
    /** Parse-cache byte budget; large PDFs dominate retained memory. */
    cacheMaxBytes: z<number, number>;
    /** Absolute path to a MarkItDown CLI (`markitdown`); empty = auto-detect on PATH. */
    markitdownBin: z<string, string>;
    /** Timeout for one MarkItDown CLI invocation. */
    markitdownTimeoutMs: z<number, number>;
    /** Upload storage root when no sessions service is available. */
    uploadDir: z<string, string>;
}>, Schemastery.ObjectT<{
    /** Byte cap for one upload body. */
    uploadMaxBytes: z<number, number>;
    /** Lowercase extension allowlist; empty means all allowed. */
    allowedExtensions: z<string[], string[]>;
    /** Uploaded files older than this are swept away. */
    uploadTtlMs: z<number, number>;
    /** Sweep interval; 0 disables the periodic sweep. */
    sweepIntervalMs: z<number, number>;
    /** Concurrent upload bodies admitted at once. */
    maxConcurrentUploads: z<number, number>;
    /** Byte cap for text inlined straight into the composer. */
    inlineTextLimit: z<number, number>;
    /** Byte cap for the preview returned alongside a large text file. */
    previewTextLimit: z<number, number>;
    /** Byte cap for one document read (PDF parsing amplifies memory severalfold). */
    maxFileBytes: z<number, number>;
    /** Default and maximum number of lines returned by one read_document call. */
    readLimit: z<number, number>;
    /** Rows kept per worksheet. */
    sheetRowLimit: z<number, number>;
    /** Sheets read per workbook (the rest are reported as truncated). */
    maxSheets: z<number, number>;
    /** Parse-cache capacity (path + size + mtime fingerprints). */
    cacheEntries: z<number, number>;
    /** Parse-cache byte budget; large PDFs dominate retained memory. */
    cacheMaxBytes: z<number, number>;
    /** Absolute path to a MarkItDown CLI (`markitdown`); empty = auto-detect on PATH. */
    markitdownBin: z<string, string>;
    /** Timeout for one MarkItDown CLI invocation. */
    markitdownTimeoutMs: z<number, number>;
    /** Upload storage root when no sessions service is available. */
    uploadDir: z<string, string>;
}>>;
export declare function apply(ctx: any, config: FileUploadConfig): void;
