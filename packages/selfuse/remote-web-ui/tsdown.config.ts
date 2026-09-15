import { isBuiltin } from 'node:module'
import { clientBundle } from '../../client/tsdown.client.ts'

const packageId = '@dsh-selfuse/remote-web-ui'
const packageRuntime = /^(?:cloudflared|clsx|qrcode\.react|react|react-dom|schemastery|zod)(?:\/|$)/
const harnessRuntime = /^@deepseek-ai\/cordis(?:\/|$)/

/** Runtime identities supplied by the installed profile rather than bundled copies. */
function isHostExternal(specifier: string): boolean {
  return packageRuntime.test(specifier) || harnessRuntime.test(specifier)
}

const pluginBundles = clientBundle(packageId, ['lib/types/index.js', 'lib/types/invariant.js'], {
  lib: {
    deps: {
      neverBundle: isHostExternal,
      alwaysBundle: (specifier: string) => !isBuiltin(specifier) && !isHostExternal(specifier),
    },
  },
})

export default pluginBundles
