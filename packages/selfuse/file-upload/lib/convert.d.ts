/** Document → Markdown conversion chain.
 *
 * Two backends:
 *   - built-in JS parsers (text / PDF / DOCX / XLSX) — zero external tooling,
 *     matching the official `read` tool's decoding chain;
 *   - optional Microsoft MarkItDown CLI (`markitdown <file>`) — when
 *     `markitdownBin` is configured (or auto-detected) it wins, because the
 *     official tool covers more formats (PPTX, HTML, EPUB, images with OCR,
 *     audio via Whisper) and renders everything as clean Markdown.
 *
 * The chain never trusts the file extension: every parser re-verifies the
 * sniffed category before reading bytes.
 */
import type { SniffResult } from './detect.ts';
export interface ConvertOptions {
    /** Byte cap for one document read (PDF parsing amplifies memory severalfold). */
    maxFileBytes: number;
    /** Rows kept per worksheet. */
    sheetRowLimit: number;
    /** Sheets read per workbook (the rest are reported as truncated). */
    maxSheets: number;
    /** Absolute path to the `markitdown` CLI; empty disables the external backend. */
    markitdownBin?: string;
    /** CLI timeout in milliseconds. */
    markitdownTimeoutMs?: number;
}
export interface ConvertResult {
    /** Markdown text extracted from the document. */
    markdown: string;
    /** True when the extraction had to cut content (paging / limits). */
    truncated: boolean;
    /** Which backend produced the result. */
    backend: 'js' | 'markitdown';
    /** Optional human note (e.g. truncated sheets). */
    note?: string;
}
/** Detect whether the markitdown CLI is runnable at the given path. */
export declare function probeMarkitdown(bin: string): Promise<boolean>;
/** Decode bytes as text using the sniffed encoding. */
export declare function decodeText(data: Buffer, encoding: 'utf8' | 'utf16le' | 'gb18030' | undefined): string;
/** Convert document bytes to Markdown with the built-in JS parsers. */
export declare function convertJs(data: Buffer, sniff: SniffResult, options: ConvertOptions): Promise<ConvertResult>;
/**
 * Convert document bytes to Markdown via the Microsoft MarkItDown CLI.
 * The CLI accepts the file on disk and prints Markdown to stdout.
 */
export declare function convertMarkitdown(bin: string, filePath: string, timeoutMs: number): Promise<ConvertResult>;
