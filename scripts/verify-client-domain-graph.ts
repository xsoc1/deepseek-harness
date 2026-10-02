/**
 * Enforce intra-package domain layering inside `packages/client/*\/src/client/`.
 * verify-module-graph covers package-level edges; this gate covers the
 * directory level: domain directories may import `contract/` and never each
 * other, and only the assembly point (`apply.ts` / `index.ts`) may import
 * across domains.
 *
 * Layer model (lower may not import higher):
 *   0  contract/            shared contract API (types + slot declarations)
 *   1  <domain>/ + service  domain implementations (skeleton/, chat/, ...)
 *   2  apply.ts, index.ts   assembly point and re-export shell
 *
 * Run directly:
 *   pnpm exec tsx scripts/verify-client-domain-graph.ts
 */

import { existsSync, globSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix, resolve, sep } from 'node:path'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const CLIENT_DIR = join(root, 'packages/client')

/** Directory names treated as the shared contract layer (importable by all). */
const CONTRACT_DIRS = new Set(['contract'])
/** Top-level client files allowed to import across domains (assembly layer). */
const ASSEMBLY_FILES = new Set(['apply.ts', 'index.ts', 'index.tsx'])

interface Violation { file: string; imported: string; reason: string }

/** Recursively list .ts/.tsx files under dir (relative paths). */
function listSources(dir: string): string[] {
  return globSync('**/*.{ts,tsx}', { cwd: dir })
    .map(rel => rel.split(sep).join('/'))
    .filter(rel => !/\.legacy\./.test(rel.slice(rel.lastIndexOf('/') + 1)))
    .sort()
}

/** First path segment of a client-relative file, or '' for top-level files. */
function domainOf(rel: string): string {
  const ix = rel.indexOf('/')
  return ix === -1 ? '' : rel.slice(0, ix)
}

function moduleSpecifiers(file: string, text: string): string[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const imports: string[] = []
  const visit = (node: ts.Node): void => {
    let specifier: ts.Node | undefined
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) specifier = node.argument.literal
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) specifier = node.arguments[0]
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      specifier = node.moduleReference.expression
    }
    if (specifier !== undefined && ts.isStringLiteralLike(specifier)) imports.push(specifier.text)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

/**
 * Resolve one relative import to a client-directory-relative path.
 * @param file - Importing file relative to `src/client`.
 * @param specifier - Relative module specifier from that file.
 * @returns Normalized path, preserving leading `..` segments outside `src/client`.
 */
export function resolveClientImport(file: string, specifier: string): string {
  return posix.normalize(posix.join(posix.dirname(file), specifier))
}

/**
 * Inspect all Client source imports in one package.
 * @param pkgName - Package directory used in diagnostics.
 * @param clientDir - Absolute source directory, including owned assets.
 * @returns All intra-package domain-layer violations.
 */
export function checkClientPackage(pkgName: string, clientDir: string): Violation[] {
  const violations: Violation[] = []
  const files = listSources(clientDir)
  for (const rel of files) {
    const fromDomain = domainOf(rel)
    const isAssembly = fromDomain === '' && ASSEMBLY_FILES.has(rel)
    if (isAssembly) continue
    const source = readFileSync(join(clientDir, rel), 'utf8')
    for (const spec of moduleSpecifiers(rel, source)) {
      if (!spec.startsWith('.')) continue
      const target = resolveClientImport(rel, spec)
      if (target === '..' || target.startsWith('../')) continue // package-level rules govern
      // The shared asset folder owns literal image resources, not implementations.
      // Missing images, source files and CSS still receive the ordinary layering check.
      if (target.startsWith('assets/') && /\.(?:png|svg)$/.test(target)) {
        const asset = join(clientDir, target)
        if (existsSync(asset) && statSync(asset).isFile()) continue
      }
      const toDomain = domainOf(target)
      if (toDomain === '' || CONTRACT_DIRS.has(toDomain)) continue // top-level shared file or contract layer
      if (fromDomain === toDomain) continue // inside one domain
      violations.push({
        file: `${pkgName}/src/client/${rel}`,
        imported: spec,
        reason: fromDomain === ''
          ? `top-level non-assembly file imports domain "${toDomain}" (only apply/index may assemble)`
          : `domain "${fromDomain}" imports sibling domain "${toDomain}" (route shared API through contract/)`,
      })
    }
  }
  return violations
}

function main(): void {
  const violations: Violation[] = []
  for (const pkg of readdirSync(CLIENT_DIR)) {
    const clientDir = join(CLIENT_DIR, pkg, 'src/client')
    try {
      if (!statSync(clientDir).isDirectory()) continue
    } catch {
      // No client half in this package — nothing to layer-check.
      continue
    }
    violations.push(...checkClientPackage(pkg, clientDir))
  }

  if (violations.length > 0) {
    console.error(`verify-client-domain-graph: ${violations.length} violation(s):`)
    for (const v of violations) console.error(`  ${v.file} -> ${v.imported}\n    ${v.reason}`)
    process.exitCode = 1
    return
  }
  console.log('verify-client-domain-graph: client domain layering clean.')
}

if (import.meta.filename === resolve(process.argv[1] ?? '')) main()
