/** Emit a reviewable source patch for numeric-array reads in the wallpaper decoder. */
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const path = 'packages/selfuse/skin-center/src/pkg-extract.ts'
const source = readFileSync(path, 'utf8')
const config = ts.getParsedCommandLineOfConfigFile('packages/selfuse/skin-center/tsconfig.host.json', {}, ts.sys)
const program = ts.createProgram(config.fileNames, config.options)
const checker = program.getTypeChecker()
const sf = program.getSourceFile(path)
const edits = []

function visit(node) {
  if (process.argv.includes('--omit-absent-fields') && ts.isCallExpression(node)
    && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'push'
    && node.arguments.length === 1 && ts.isObjectLiteralExpression(node.arguments[0])) {
    const argument = node.arguments[0]
    edits.push({ start: argument.getStart(sf), end: argument.end, text: 'definedFields(' + argument.getText(sf) + ')' })
    return
  }
  if (ts.isElementAccessExpression(node)) {
    const type = checker.typeToString(checker.getTypeAtLocation(node.expression))
    const parent = node.parent
    const write = ts.isBinaryExpression(parent) && parent.left === node
      && parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment
    if (!write && (/^(?:NonSharedBuffer|Buffer|(?:Uint|Int|Float)\d+(?:Clamped)?Array)(?:<|$)/.test(type) || type === 'number[]')) {
      edits.push({
        start: node.getStart(sf), end: node.end,
        text: 'checkedAt(' + node.expression.getText(sf) + ', ' + node.argumentExpression.getText(sf) + ')',
      })
      return
    }
  }
  ts.forEachChild(node, visit)
}

visit(sf)
let updated = source
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end)
}
if (!source.includes("import { checkedAt }")) {
  updated = updated.replace("import { Buffer } from", "import { checkedAt } from './checked-at.ts'\nimport { Buffer } from")
}
process.stdout.write(JSON.stringify({ path, source, updated, count: edits.length }))
