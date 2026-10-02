/** Omit absent optional fields when constructing wallpaper JSON records. */

/** Required fields remain required; possibly absent values become optional. */
type DefinedFields<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K]
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>
}

/**
 * Drop only undefined, preserving false, zero, empty text and explicit null.
 * @param fields - one constructed wire record, not recursively transformed.
 * @returns exactly the fields whose values are present.
 */
export function definedFields<T extends object>(fields: T): DefinedFields<T> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as DefinedFields<T>
}
