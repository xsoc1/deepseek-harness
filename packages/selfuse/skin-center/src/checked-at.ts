/** Bounds-checked access for untrusted wallpaper binary input and decode buffers. */

/**
 * Read one initialized numeric/array entry, rejecting truncated input.
 * @param values - byte, pixel, lookup or decoded-entry array.
 * @param index - offset that the format decoder requires to exist.
 * @returns the present entry; absent entries never silently become zero.
 */
export function checkedAt<T>(values: ArrayLike<T>, index: number): T {
  const value = values[index]
  if (value === undefined) throw new RangeError(`wallpaper data is truncated at offset ${index}`)
  return value
}
