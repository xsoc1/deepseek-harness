/** Build the native Host library and the settings-tab closure factory. */
import { clientBundle } from '../../client/tsdown.client.ts'
import { browserOutput } from '../../../scripts/selfuse/browser-output.ts'

const bundles = clientBundle('@dsh-selfuse/backup', ['lib/types/index.js'], { hostPhase: true })

/**
 * Minify only the browser artifact while retaining the native factory and source map.
 * @param options - Native build-face selection.
 * @returns Host configs unchanged and a minified Client config.
 */
export default (options: Parameters<typeof bundles>[0]) => bundles(options).map(config =>
  config.platform === 'browser' ? { ...config, plugins: [...(config.plugins ?? []), browserOutput()] } : config,
)
