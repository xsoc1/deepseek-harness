import { fileURLToPath } from 'node:url'
import { build } from 'tsdown'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))

await build({
  config: false,
  cwd: packageRoot,
  entry: { index: 'src/index.ts' },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2024',
  sourcemap: true,
  clean: false,
  fixedExtension: false,
  dts: false,
  deps: { neverBundle: [/^@deepseek-ai\//] },
})
