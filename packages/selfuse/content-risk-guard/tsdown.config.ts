/** Build the privacy observer from the same strict Host project as native packages. */
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['lib/types/index.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  fixedExtension: false,
  clean: false,
  dts: false,
})
