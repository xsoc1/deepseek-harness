/**
 * Shared HTTP helpers for the route families: one JSON writer and one
 * bounded JSON body reader. Previously copy-pasted across routes.ts,
 * update-routes.ts, and mobile-api.ts with drifting failure contracts.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** One JSON response. */
export declare function writeJson(res: ServerResponse, status: number, body: unknown): void;
/**
 * Read a request body up to maxBytes and parse it as JSON.
 * @throws 'body too large' beyond the cap, or the JSON.parse error.
 */
export declare function readBoundedJson(req: IncomingMessage, maxBytes: number): Promise<unknown>;
//# sourceMappingURL=http.d.ts.map