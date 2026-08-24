// dsh-task-notify — 任务完成通知（host half）。
//
// 纯 web 环境（无 Electron 桌面壳）下的任务完成通知：
// 订阅 Cordis 事件流 `session/event`，在 `turn/end` 时弹 Windows 系统通知。
// 与 EAC 桌面壳 session-watcher.js 相同的语义：
//   - 子代理会话（delegationDepth > 0）不通知，避免刷屏；
//   - 标题优先使用会话标题（session/title 事件），否则 "DSH 任务完成"；
//   - 正文含工作目录名与短会话 ID。
//
// 相比桌面壳的文件轮询，这里直接消费实时事件流，零延迟、无重复。

import { execFile } from "node:child_process";
import { basename } from "node:path";

const name = "dsh-task-notify";
const inject = [];

// PowerShell 单引号字符串字面量（转义内部单引号）。
function psQuote(text) {
  return "'" + String(text).replace(/'/g, "''") + "'";
}

// 弹 Windows 气球通知（NotifyIcon.ShowBalloonTip，10 秒自动消失）。
// 用 -EncodedCommand 传递 UTF-16LE base64 脚本，规避中文编码问题。
function showWindowsNotification(title, body) {
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$n = New-Object System.Windows.Forms.NotifyIcon",
    "$n.Icon = [System.Drawing.SystemIcons]::Information",
    "$n.BalloonTipTitle = " + psQuote(title),
    "$n.BalloonTipText = " + psQuote(body),
    "$n.Visible = $true",
    "$n.ShowBalloonTip(10000)",
    "Start-Sleep -Seconds 12",
    "$n.Dispose()",
  ].join("; ");
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  try {
    const child = execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], {
      windowsHide: true,
    });
    if (child.unref) child.unref();
  } catch {
    // 通知失败不影响宿主；静默忽略。
  }
}

function apply(ctx) {
  // sessionId -> 最近一次会话标题。
  const titles = new Map();

  ctx.on("session/event", (session, event) => {
    if (!event || typeof event !== "object") return;
    // 记录会话标题（turn 进行中可能更新）。
    if (event.type === "session/title" && event.data && typeof event.data.title === "string") {
      const id = String(session?.id ?? "");
      if (id) titles.set(id, event.data.title);
      return;
    }
    if (event.type !== "turn/end") return;

    // 子代理会话不通知（与桌面壳一致）。
    const header = session?.header;
    if (!header || (header.delegationDepth ?? 0) > 0) return;
    // 崩溃恢复补写的 interrupted 标记不是真实完成，不通知。
    const reason = event.data?.reason;
    if (reason && reason.kind === "interrupted") return;

    const id = String(header.id ?? "");
    const title = (id && titles.get(id)) || "DSH 任务完成";
    const cwdBase = header.cwd ? basename(header.cwd) : null;
    const shortId = id ? id.slice(-8) : null;
    const body = [cwdBase, shortId ? "会话 " + shortId : null].filter(Boolean).join(" · ");
    showWindowsNotification(title, body);
  });
}

export { apply, inject, name };
