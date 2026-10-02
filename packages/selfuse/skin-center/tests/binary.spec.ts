import { expect, it } from 'vitest'
import { checkedAt } from '../src/checked-at.ts'
import { definedFields } from '../src/defined-fields.ts'
import { decodePngToRgba, encodePng } from '../src/pkg-extract.ts'

it('keeps initialized zero and rejects truncated byte/palette reads', () => {
  expect(checkedAt(new Uint8Array([0, 255]), 0)).toBe(0)
  expect(() => checkedAt(new Uint8Array(0), 0)).toThrow(RangeError)
  expect(() => checkedAt([10], -1)).toThrow(RangeError)
  expect(() => checkedAt([10], 1)).toThrow(RangeError)
})

it('omits only absent fields from wire records', () => {
  expect(definedFields({ missing: undefined, off: false, zero: 0, text: '', nothing: null }))
    .toEqual({ off: false, zero: 0, text: '', nothing: null })
})

it('round-trips actual PNG pixels and rejects incomplete input', () => {
  const pixels = new Uint8Array([1, 2, 3, 255, 200, 100, 50, 0])
  const png = encodePng(2, 1, pixels)
  expect(decodePngToRgba(png)).toEqual({ width: 2, height: 1, rgba: pixels })
  expect(() => decodePngToRgba(png.subarray(0, 18))).toThrow()
})
