import { describe, expect, it } from 'vitest'
import { BUILD_SCRIPTS } from '../build.ts'
import { collectActiveSelfuseBuilds } from './build-active.ts'

describe('selfuse build integration', () => {
  it('builds active private packages after the official libraries', () => {
    expect(BUILD_SCRIPTS.indexOf('build:selfuse')).toBeGreaterThan(BUILD_SCRIPTS.indexOf('build:lib'))
    expect(BUILD_SCRIPTS.indexOf('build:selfuse')).toBeLessThan(BUILD_SCRIPTS.indexOf('build:web'))

    const builds = collectActiveSelfuseBuilds()
    expect(builds).toContainEqual({ name: '@dsh-selfuse/content-risk-guard', script: 'build' })
    expect(builds).toHaveLength(1)
  })
})
