import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'lib/types/index.js' }, outDir: 'lib', format: 'esm', unbundle: true,
  clean: false, dts: false, sourcemap: true, fixedExtension: false,
  deps: { neverBundle: [/^@deepseek-ai\//] },
})
