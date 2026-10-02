/** Browser serialization that preserves generated string bytes without multiline source whitespace. */
import { transform } from 'esbuild'
import type { TsdownPlugin } from 'tsdown'

/**
 * Serialize one browser chunk without altering literal values.
 * @param code - complete native factory source.
 * @param fileName - original chunk name for source-map composition.
 * @returns compiler-owned code and its source map.
 */
export async function serializeBrowserChunk(code: string, fileName: string): Promise<{ code: string; map: string }> {
  const result = await transform(code, {
    sourcefile: fileName, loader: 'js', minify: true, sourcemap: 'external',
    supported: { 'template-literal': false },
  })
  return { code: result.code, map: result.map }
}

/**
 * Minify the final native closure factory and compose its source map.
 * @returns A post-render compiler pass; template strings are lowered, not trimmed.
 */
export function browserOutput(): TsdownPlugin {
  return {
    name: 'selfuse-browser-output',
    renderChunk: {
      order: 'post',
      async handler(code, chunk) {
        return serializeBrowserChunk(code, chunk.fileName)
      },
    },
  }
}
