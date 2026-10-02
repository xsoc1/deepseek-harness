import { Context } from '@deepseek-ai/cordis'
import { expect, it, onTestFinished, vi } from 'vitest'
import { mountOnce as skinMount } from '../../packages/selfuse/skin-center/src/mount-once.ts'
import { mountOnce as gitMount } from '../../packages/selfuse/web-ui-git-graph/src/mount-once.ts'

it('deduplicates copies per root and releases only the owning fiber marker', async () => {
  const first = new Context()
  const second = new Context()
  onTestFinished(async () => { await Promise.all([first.fiber.dispose(), second.fiber.dispose()]) })
  const apply = vi.fn<(ctx: Context, config: number) => void>()
  const skin = skinMount('mount-fixture', apply)
  const git = gitMount('mount-fixture', apply)
  const owner = await first.plugin(skin, 1)
  const duplicate = await first.plugin(git, 2)
  await second.plugin(git, 3)
  expect(apply.mock.calls.map(call => call[1])).toEqual([1, 3])
  await duplicate.dispose()
  await first.plugin(git, 4)
  expect(apply.mock.calls.map(call => call[1])).toEqual([1, 3])
  await owner.dispose()
  const remount = await first.plugin((ctx: Context) => { skin(ctx, 5) })
  expect(apply.mock.calls.map(call => call[1])).toEqual([1, 3, 5])
  await remount.dispose()
})
