/** Windows balloon notifications from committed main-session completion events. */
import { execFile } from 'node:child_process'
import { basename } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-session-title'

/** Cordis notification plugin identity. */
export const name = 'dsh-task-notify'
/** Events are observed without adding a model-facing service. */
export const inject = []

function psQuote(text: string): string {
  return "'" + text.replace(/'/g, "''") + "'"
}

function showWindowsNotification(title: string, body: string): void {
  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$n = New-Object System.Windows.Forms.NotifyIcon',
    '$n.Icon = [System.Drawing.SystemIcons]::Information',
    '$n.BalloonTipTitle = ' + psQuote(title),
    '$n.BalloonTipText = ' + psQuote(body),
    '$n.Visible = $true',
    '$n.ShowBalloonTip(10000)',
    'Start-Sleep -Seconds 12',
    '$n.Dispose()',
  ].join('; ')
  const encoded = Buffer.from(script, 'utf16le').toString('base64')
  const child = execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], {
    windowsHide: true,
  }, (error) => {
    // Notification delivery is best-effort; asynchronous spawn failures are contained.
    void error
  })
  child.unref()
}

/**
 * Observe recorded title and completion events; subagents and interrupted turns are excluded.
 * @param ctx - session event context; listeners and cached titles belong to this plugin fiber.
 */
export function apply(ctx: Context): void {
  const titles = new Map<SessionId, string>()
  ctx.effect(() => () =>{  titles.clear() }, 'task-notify: title cache')
  ctx.on('session/disposed', (session) => { titles.delete(session.id) })
  ctx.on('session/event', (session, event) => {
    if (event.type === 'session/title') {
      titles.set(session.id, event.data.title)
      return
    }
    if (event.type !== 'turn/end' || event.data.reason.kind === 'interrupted') return
    const header = session.header
    if ((header.delegationDepth ?? 0) > 0) return
    const title = titles.get(session.id) || 'DSH 任务完成'
    const cwdBase = header.cwd === undefined ? null : basename(header.cwd)
    const body = [cwdBase, '会话 ' + session.id.slice(-8)].filter(Boolean).join(' · ')
    showWindowsNotification(title, body)
  })
}
