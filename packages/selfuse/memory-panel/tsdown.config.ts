/** Native Host bundle and mapped, minified browser factory. */
import { clientBundle } from '../../client/tsdown.client.ts'
import { browserOutput } from '../../../scripts/selfuse/browser-output.ts'

const bundles = clientBundle('@dsh-selfuse/memory-panel', ['lib/types/index.js'], { hostPhase: true })
/**
 * Keep native build faces and minify only browser output.
 * @param options - Native build-face selection.
 * @returns Host configuration and a mapped Client factory configuration.
 */
export default (options: Parameters<typeof bundles>[0]) => bundles(options).map(config =>
  config.platform === 'browser' ? { ...config, plugins: [...(config.plugins ?? []), browserOutput()] } : config,
)
