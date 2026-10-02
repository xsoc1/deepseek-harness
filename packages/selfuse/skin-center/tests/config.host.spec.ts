/** Native Loader validation of the two skin-center preference groups. */
import { expect, it } from 'vitest'
import { Config, SkinWallpaperConfigSchema } from '../src/index.ts'

it('applies background and wallpaper defaults without enabling video audio', () => {
  expect(Config({ background: {}, wallpaper: {} })).toMatchObject({
    background: { enabled: true, backgroundOpacity: 0 },
    wallpaper: { sound: false, volume: 100 },
  })
})

it('preserves explicit mute and zero volume, and rejects out-of-range volume', () => {
  expect(SkinWallpaperConfigSchema({ sound: false, volume: 0 })).toMatchObject({ sound: false, volume: 0 })
  expect(SkinWallpaperConfigSchema({ sound: true, volume: 42 })).toMatchObject({ sound: true, volume: 42 })
  expect(() => SkinWallpaperConfigSchema({ volume: -1 })).toThrow()
  expect(() => SkinWallpaperConfigSchema({ volume: 101 })).toThrow()
})
