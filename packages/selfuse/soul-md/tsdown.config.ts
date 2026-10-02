/** Build the persona implementation; native ConfigForms owns its UI. */
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['lib/types/index.js'], outDir: 'lib', format: ['esm'], platform: 'node',
  fixedExtension: false, clean: false, dts: false, sourcemap: true,
})
