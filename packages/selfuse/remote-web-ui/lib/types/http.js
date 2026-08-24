/**
 * Shared HTTP helpers for the route families: one JSON writer and one
 * bounded JSON body reader. Previously copy-pasted across routes.ts,
 * update-routes.ts, and mobile-api.ts with drifting failure contracts.
 */
/** One JSON response. */
export function writeJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer' });
    res.end(payload);
}
/**
 * Read a request body up to maxBytes and parse it as JSON.
 * @throws 'body too large' beyond the cap, or the JSON.parse error.
 */
export async function readBoundedJson(req, maxBytes) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = chunk;
        size += buffer.length;
        if (size > maxBytes)
            throw new Error('body too large');
        chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
