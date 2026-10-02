/**
 * Fork-owned Host mount guard. Linked and installed copies share a registry,
 * but independent Cordis roots never suppress one another. The first fiber
 * releases its package marker on disposal; duplicate mounts do not own it.
 */

import type { Context } from '@deepseek-ai/cordis'

const MOUNTED = Symbol.for('dsh-selfuse.mounted-plugins')

interface MountRegistry {
  [MOUNTED]?: WeakMap<object, Set<string>>
}

function mountedSet(ctx: Context): Set<string> {
  const registry = globalThis as MountRegistry
  let roots = registry[MOUNTED]
  if (roots === undefined) {
    roots = new WeakMap()
    registry[MOUNTED] = roots
  }
  let mounted = roots.get(ctx.root)
  if (!mounted) { mounted = new Set(); roots.set(ctx.root, mounted) }
  return mounted
}

/**
 * Wrap a Cordis plugin apply so the package runs at most once per root.
 * The first mount registers normally and unmarks when its fiber disposes;
 * any later mount of the same package name is a no-op.
 * @param packageName - npm package identity shared by every install source.
 * @param fn - the original plugin apply.
 * @returns an apply of the same shape.
 */
export function mountOnce<C>(packageName: string, fn: (ctx: Context, config: C) => void): (ctx: Context, config: C) => void {
  return (ctx, config) => {
    const mounted = mountedSet(ctx)
    if (mounted.has(packageName)) return
    mounted.add(packageName)
    ctx.effect(() => () => {
      mounted.delete(packageName)
    })
    fn(ctx, config)
  }
}
