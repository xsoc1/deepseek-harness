// dsh-web-shell-bridge — host half.
//
// 纯 web 环境（无 Electron 桌面壳）下，为 EAC 配套插件补全桌面壳能力：
// 在 webServer 上提供与 DSH Desktop IPC 等价的回环路由，使
// dsh-balance（余额推送）、dsh-client-file-changes（一键还原 / 系统打开）
// 不再降级。
//
//   POST /api/dsh-shell/balance       DeepSeek 账户余额查询（15 分钟缓存）
//   POST /api/dsh-shell/revert        文件还原（内容精确匹配后替换，与桌面壳一致）
//   POST /api/dsh-shell/open-path     用系统默认程序打开会话工作区内文件
//   POST /api/dsh-shell/open-external 用系统浏览器打开 http(s) URL
//   GET  /api/dsh-shell/info          getInfo 等价物（staticPort: 0 → 客户端回退宿主静态服务）
//
// 全部路由仅接受回环地址请求；文件操作限定在会话工作区根目录内。

import { readFileSync, existsSync, writeFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, isAbsolute, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { zstdDecompressSync } from "node:zlib";

const execFileP = promisify(execFile);

// ---------------------------------------------------------------------------
// 余额查询（移植自 EAC 桌面壳 balance.js）
// ---------------------------------------------------------------------------

const DEFAULT_BASE = "https://api.deepseek.com";

const DEFAULT_PRICES = {
  "deepseek-chat": { cacheMiss: 2, cacheHit: 0.5, output: 8 },
  "deepseek-reasoner": { cacheMiss: 4, cacheHit: 1, output: 16 },
  "deepseek-v4-pro": { cacheMiss: 4, cacheHit: 1, output: 16 },
};
const FALLBACK_PRICES = { cacheMiss: 2, cacheHit: 0.5, output: 8 };

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}

function readApiKey() {
  const envKey = process.env.DEEPSEEK_API_KEY;
  if (envKey) return envKey.trim();
  try {
    const text = readFileSync(join(dshHome(), ".credentials.yaml"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*DEEPSEEK_API_KEY\s*:\s*["']?([^"'\s#]+)/);
      if (m) return m[1];
    }
  } catch {}
  return "";
}

function readActiveModel() {
  try {
    const text = readFileSync(join(dshHome(), "settings.yaml"), "utf8");
    const m = text.match(/^\s*model\s*:\s*(\S+)/m);
    if (m) return m[1];
  } catch {}
  return "";
}

function balanceEndpoint() {
  if (process.env.DEEPSEEK_BALANCE_URL) return process.env.DEEPSEEK_BALANCE_URL;
  const base = (process.env.DEEPSEEK_API_BASE || DEFAULT_BASE).replace(/\/+$/, "");
  return base + "/user/balance";
}

function fetchJson(url, apiKey, timeoutMs = 15000) {
  return new Promise((resolvePromise, reject) => {
    const req = fetch(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + apiKey, "User-Agent": "DSH-Web-Shell" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    req
      .then(async (res) => {
        const body = await res.text();
        if (res.status !== 200) {
          const hint = body.slice(0, 200).trim();
          throw new Error("HTTP " + res.status + (hint ? "：" + hint : ""));
        }
        try {
          resolvePromise(JSON.parse(body));
        } catch {
          reject(new Error("JSON 解析失败"));
        }
      })
      .catch(reject);
  });
}

let balanceCache = { at: 0, value: null };

async function queryBalance() {
  const key = readApiKey();
  if (!key) return { ok: false, error: "no-key", balances: [], prices: FALLBACK_PRICES };
  try {
    const data = await fetchJson(balanceEndpoint(), key);
    const balances = Array.isArray(data.balance_infos)
      ? data.balance_infos.map((b) => ({
          currency: String(b.currency || ""),
          total: Number(b.total_balance) || 0,
          granted: Number(b.granted_balance) || 0,
          toppedUp: Number(b.topped_up_balance) || 0,
        }))
      : [];
    return { ok: true, isAvailable: !!data.is_available, balances, prices: DEFAULT_PRICES };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err), balances: [], prices: DEFAULT_PRICES };
  }
}

async function refreshBalance() {
  const now = Date.now();
  if (balanceCache.value !== null && now - balanceCache.at < 15 * 60 * 1000) return balanceCache.value;
  const result = await queryBalance();
  // 按当前默认模型选择价格档（与桌面壳 main.js refreshBalance 一致）。
  const model = readActiveModel() || "deepseek-v4-pro";
  const table = result.prices || DEFAULT_PRICES;
  result.prices = { ...(table[model] || FALLBACK_PRICES) };
  balanceCache = { at: Date.now(), value: result };
  return result;
}

// ---------------------------------------------------------------------------
// 会话工作区根目录（移植自桌面壳 main.js fileRoots）
// ---------------------------------------------------------------------------

const ZSTD_MAGIC = 4247762216;

function scanFirstZstdFrame(buffer) {
  let offset = 0;
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== ZSTD_MAGIC) return null;
  offset += 4;
  if (offset === buffer.length) return null;
  const descriptor = buffer.readUInt8(offset++);
  if ((descriptor & 24) !== 0) return null;
  const contentSizeFlag = descriptor >>> 6;
  const singleSegment = (descriptor & 32) !== 0;
  const checksum = (descriptor & 4) !== 0;
  const dictionaryFlag = descriptor & 3;
  const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag;
  const contentSizeBytes = contentSizeFlag === 0 ? (singleSegment ? 1 : 0) : (1 << contentSizeFlag);
  const remainingHeaderBytes = (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes;
  if (buffer.length - offset < remainingHeaderBytes) return null;
  offset += remainingHeaderBytes;
  for (;;) {
    if (buffer.length - offset < 3) return null;
    const blockHeader = buffer.readUIntLE(offset, 3);
    offset += 3;
    const lastBlock = (blockHeader & 1) !== 0;
    const blockType = (blockHeader >>> 1) & 3;
    const blockSize = blockHeader >>> 3;
    if (blockType === 3) return null;
    const payloadBytes = blockType === 1 ? 1 : blockSize;
    if (buffer.length - offset < payloadBytes) return null;
    offset += payloadBytes;
    if (lastBlock) break;
  }
  if (checksum) offset += 4;
  return { start: 0, end: offset };
}

let fileRootsCache = { at: 0, roots: [] };

function fileRoots() {
  if (Date.now() - fileRootsCache.at < 5 * 60 * 1000) return fileRootsCache.roots;
  const roots = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (e.name !== "session.jsonl.zstd") continue;
      try {
        const buf = readFileSync(p);
        const frame = scanFirstZstdFrame(buf);
        if (!frame) continue;
        const text = zstdDecompressSync(buf.subarray(frame.start, frame.end)).toString("utf8");
        const header = JSON.parse(text.split("\n", 1)[0]);
        if (header && typeof header.cwd === "string" && header.cwd) roots.push(header.cwd);
      } catch {}
    }
  };
  walk(join(dshHome(), "sessions"));
  fileRootsCache.roots = [...new Set(roots)];
  fileRootsCache.at = Date.now();
  return fileRootsCache.roots;
}

function isUnderFileRoots(p) {
  const resolved = resolve(p);
  return fileRoots().some((r) => {
    const rp = resolve(r);
    return resolved === rp || resolved.startsWith(rp + "\\") || resolved.startsWith(rp + "/");
  });
}

const DANGEROUS_EXT = /\.(bat|cmd|com|exe|ps1|vbs|lnk|js|jse|msi|scr|pif|reg)$/i;

// ---------------------------------------------------------------------------
// webServer 路由
// ---------------------------------------------------------------------------

function isLoopback(req) {
  const ra = req.socket && req.socket.remoteAddress;
  return ra === "127.0.0.1" || ra === "::1" || ra === "::ffff:127.0.0.1";
}

function sendJson(res, status, body) {
  const data = Buffer.from(JSON.stringify(body), "utf8");
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": String(data.length),
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function requirePost(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { allow: "POST" });
    res.end();
    return false;
  }
  if (!isLoopback(req)) {
    res.writeHead(403);
    res.end("forbidden");
    return false;
  }
  return true;
}

async function handleBalanceRoute(req, res) {
  if (!requirePost(req, res)) return;
  try {
    const result = await refreshBalance();
    sendJson(res, 200, result);
  } catch (err) {
    sendJson(res, 500, { ok: false, error: String((err && err.message) || err), balances: [], prices: FALLBACK_PRICES });
  }
}

// 文件还原：与桌面壳 dsh:file-revert 完全一致的语义 —— 内容精确匹配后替换。
async function handleRevertRoute(req, res) {
  if (!requirePost(req, res)) return;
  let body;
  try {
    body = JSON.parse((await readBody(req)).replace(/^\uFEFF/, ""));
  } catch {
    sendJson(res, 400, { error: "invalid JSON body" });
    return;
  }
  const changes = body && body.changes;
  if (!Array.isArray(changes) || changes.length === 0 || changes.length > 300) {
    sendJson(res, 200, { results: [] });
    return;
  }
  const results = [];
  for (const c of changes) {
    const p = String((c && c.path) || "");
    const oldText = String((c && c.oldText) ?? "");
    const newText = String((c && c.newText) ?? "");
    if (!isAbsolute(p) || oldText.length > 400000 || newText.length > 400000) {
      results.push({ path: p, status: "invalid" });
      continue;
    }
    if (!isUnderFileRoots(p)) {
      results.push({ path: p, status: "forbidden" });
      continue;
    }
    try {
      const exists = existsSync(p);
      const content = exists ? readFileSync(p, "utf8") : null;
      if (oldText === "" && newText !== "") {
        // 新建 → 删除（内容必须仍是 agent 写入的原文）
        if (content !== null && content === newText) {
          rmSync(p);
          results.push({ path: p, status: "reverted" });
        } else results.push({ path: p, status: content === null ? "missing" : "conflict" });
      } else if (newText === "" && oldText !== "") {
        // 删除 → 恢复（文件必须仍不存在）
        if (content === null) {
          writeFileSync(p, oldText, "utf8");
          results.push({ path: p, status: "reverted" });
        } else results.push({ path: p, status: "conflict" });
      } else {
        if (content !== null && content.includes(newText)) {
          writeFileSync(p, content.replace(newText, oldText), "utf8");
          results.push({ path: p, status: "reverted" });
        } else if (content !== null && content === oldText) {
          results.push({ path: p, status: "skipped" });
        } else {
          results.push({ path: p, status: content === null ? "missing" : "conflict" });
        }
      }
    } catch (err) {
      results.push({ path: p, status: "failed", error: String((err && err.message) || err) });
    }
  }
  sendJson(res, 200, { results });
}

// 用系统默认程序打开（Windows：explorer 启动关联程序；其他平台：xdg-open）。
async function openWithSystem(p) {
  if (process.platform === "win32") {
    await execFileP("explorer.exe", [p], { windowsHide: true, timeout: 10000 });
  } else if (process.platform === "darwin") {
    await execFileP("open", [p], { timeout: 10000 });
  } else {
    await execFileP("xdg-open", [p], { timeout: 10000 });
  }
}

async function handleOpenPathRoute(req, res) {
  if (!requirePost(req, res)) return;
  let body;
  try {
    body = JSON.parse((await readBody(req)).replace(/^\uFEFF/, ""));
  } catch {
    sendJson(res, 400, { error: "invalid JSON body" });
    return;
  }
  const p = String((body && body.path) || "");
  if (!isAbsolute(p)) return sendJson(res, 200, { ok: false, error: "path must be absolute" });
  if (!isUnderFileRoots(p)) return sendJson(res, 200, { ok: false, error: "path outside session workspace" });
  if (DANGEROUS_EXT.test(p)) return sendJson(res, 200, { ok: false, error: "executable files are not openable from the file view" });
  try {
    if (!existsSync(p)) return sendJson(res, 200, { ok: false, error: "file not found" });
    await openWithSystem(p);
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return sendJson(res, 200, { ok: false, error: String((err && err.message) || err) });
  }
}

async function handleOpenExternalRoute(req, res) {
  if (!requirePost(req, res)) return;
  let body;
  try {
    body = JSON.parse((await readBody(req)).replace(/^\uFEFF/, ""));
  } catch {
    sendJson(res, 400, { error: "invalid JSON body" });
    return;
  }
  const url = String((body && body.url) || "");
  if (!/^https?:\/\//i.test(url)) return sendJson(res, 200, { ok: false, error: "invalid url" });
  try {
    await openWithSystem(url);
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return sendJson(res, 200, { ok: false, error: String((err && err.message) || err) });
  }
}

async function handleInfoRoute(req, res) {
  if (req.method !== "GET") {
    res.writeHead(405, { allow: "GET" });
    res.end();
    return;
  }
  if (!isLoopback(req)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  sendJson(res, 200, {
    appVersion: "web-shell-bridge",
    staticPort: 0, // 无独立静态端口 → 客户端回退到宿主 /dsh-files/static/
  });
}

const name = "dsh-web-shell-bridge";
const inject = ["webServer"];

function apply(ctx) {
  const disposers = [
    ctx.webServer.register({ kind: "exact", path: "/api/dsh-shell/balance", handler: handleBalanceRoute }),
    ctx.webServer.register({ kind: "exact", path: "/api/dsh-shell/revert", handler: handleRevertRoute }),
    ctx.webServer.register({ kind: "exact", path: "/api/dsh-shell/open-path", handler: handleOpenPathRoute }),
    ctx.webServer.register({ kind: "exact", path: "/api/dsh-shell/open-external", handler: handleOpenExternalRoute }),
    ctx.webServer.register({ kind: "exact", path: "/api/dsh-shell/info", handler: handleInfoRoute }),
  ];
  return () => {
    for (const d of disposers) d();
  };
}

export { apply, inject, name };
