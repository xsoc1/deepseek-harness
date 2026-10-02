import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { expect, it } from 'vitest'
import { en, zh } from '../src/client/locales.ts'

it('formats blur values using native locale interpolation in both languages', async () => {
  const ctx = new Context()
  const locale = new LocaleRuntime(ctx)
  const dispose = locale.register('skinCenter', { en, zh })
  try {
    const t = locale.bind('skinCenter')
    locale.setLocale('en')
    expect(t('pixelValue', { value: 0 })).toBe('0 px')
    expect(t('pixelValue', { value: 12 })).toBe('12 px')
    locale.setLocale('zh')
    expect(t('pixelValue', { value: 12 })).toBe('12 像素')
  } finally {
    dispose()
    await ctx.fiber.dispose()
  }
})
