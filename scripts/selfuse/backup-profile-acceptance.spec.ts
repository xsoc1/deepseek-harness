/** Native CLI installation and removal in a disposable profile. */
import { it } from 'vitest'
import { acceptProfileLayer } from './profile-layer-acceptance.ts'

it('adds and removes the backup layer using native CLI activation metadata', async () => {
  await acceptProfileLayer('backup')
}, 60_000)
