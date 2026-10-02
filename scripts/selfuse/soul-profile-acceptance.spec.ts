import { it } from 'vitest'
import { acceptProfileLayer } from './profile-layer-acceptance.ts'

it('adds and removes the persona layer using native CLI activation metadata', async () => {
  await acceptProfileLayer('soul-md')
}, 60_000)
