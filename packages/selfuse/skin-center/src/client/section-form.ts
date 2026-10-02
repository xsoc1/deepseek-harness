/** Nested preference views over a native, revision-fenced ConfigForm. */
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'

function section(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)[key] : undefined
}

/**
 * Project one nested section without introducing a second persistence store.
 * @param parent - native form whose schema validates the complete entry.
 * @param key - section field used for every read and atomic write.
 * @returns stable snapshots and mutations fenced by the parent's revision.
 */
export function sectionForm<T extends object, K extends string & keyof T>(parent: ConfigForm<T>, key: K): ConfigForm<T[K]> {
  let previous: ConfigFormSnapshot<T> | undefined
  let projected: ConfigFormSnapshot<T[K]>
  return {
    getSnapshot() {
      const current = parent.getSnapshot()
      if (current !== previous) {
        previous = current
        projected = {
          ...current,
          value: current.value?.[key],
          base: section(current.base, key),
          user: section(current.user, key),
        }
      }
      return projected
    },
    subscribe: listener => parent.subscribe(listener),
    set: (field, value) => parent.mutate([{ op: 'set', path: [key, field], value: value as JsonValue }]),
    unset: field => parent.mutate([{ op: 'unset', path: [key, field] }]),
    mutate: (ops, revision) => parent.mutate(ops.map(op => ({ ...op, path: [key, ...op.path] })), revision),
  }
}
