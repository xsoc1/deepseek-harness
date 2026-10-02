/** Native CLI installation and removal in a disposable profile. */
import { it } from 'vitest'
import { acceptProfileLayer } from './profile-layer-acceptance.ts'

it('adds and removes the memory-panel layer using native CLI activation metadata', async () => {
  await acceptProfileLayer('memory-panel')
}, 60_000)
