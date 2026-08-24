window.__ModuleLoader__.load({ id: "@dsh-selfuse/file-upload", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/client/index.tsx
  var import_react = __require("react");
  var import_dsh_client_ui_primitives = __require("@deepseek-ai/dsh-client-ui-primitives");
  var import_jsx_runtime = __require("react/jsx-runtime");
  var SOURCE_NAME = "@dsh-selfuse/file-upload";
  var STYLE_TAG = "@dsh-selfuse/file-upload/style.css";
  var MAX_RECORD_SEC = 60;
  var uploadMeta = /* @__PURE__ */ new Map();
  var uploadError = null;
  var errorSeq = 0;
  var errorListeners = /* @__PURE__ */ new Set();
  function subscribeErrors(listener) {
    errorListeners.add(listener);
    return () => {
      errorListeners.delete(listener);
    };
  }
  function setUploadError(text) {
    uploadError = { seq: ++errorSeq, text };
    for (const listener of errorListeners) listener();
  }
  function clearUploadError() {
    uploadError = null;
    for (const listener of errorListeners) listener();
  }
  function badgeStyle(name) {
    const ext = name.slice(name.lastIndexOf(".") + 1).toUpperCase().slice(0, 4);
    const lower = ext.toLowerCase();
    if (lower === "pdf") return { bg: "#C93B2E", ext: "PDF" };
    if (lower === "docx" || lower === "doc") return { bg: "#2B579A", ext: "DOC" };
    if (lower === "xlsx" || lower === "xls") return { bg: "#217346", ext: "XLS" };
    if (lower === "csv" || lower === "tsv") return { bg: "#217346", ext: "CSV" };
    if (lower === "txt" || lower === "md" || lower === "markdown") return { bg: "#757575", ext: "TXT" };
    if (lower === "zip") return { bg: "#7A5BB0", ext: "ZIP" };
    if (lower === "json" || lower === "jsonl") return { bg: "#B8860B", ext: "JSON" };
    if (lower === "png" || lower === "jpg" || lower === "jpeg" || lower === "gif" || lower === "webp") return { bg: "#2E7D6B", ext: "IMG" };
    return { bg: "#5B7DB1", ext: ext === "" ? "FILE" : ext };
  }
  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }
  function injectCss() {
    if (typeof document === "undefined") return;
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return;
    const tag = document.createElement("style");
    tag.dataset.plugin = "@dsh-selfuse/file-upload";
    tag.dataset.pluginCss = STYLE_TAG;
    tag.textContent = `
.dsh-upload-btn{border:none;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);cursor:pointer;border-radius:6px;padding:4px;display:inline-flex;align-items:center;justify-content:center;line-height:0}
.dsh-upload-btn:hover:not(:disabled){color:var(--dsw-alias-label-primary,currentColor)}
.dsh-upload-btn:disabled{opacity:.45;cursor:default}
.dsh-upload-dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto 6px;padding:0 var(--dsh-composer-dock-inset);display:flex;flex-wrap:wrap;gap:8px;flex:none}
.dsh-upload-card{position:relative;flex-direction:column;align-items:center;gap:5px;width:88px;flex:none;border:1px solid var(--dsw-alias-border-l2-darkmode-thin,rgba(127,127,127,.22));background:var(--dsw-specific-input-major,var(--dsw-alias-surface-2,rgba(127,127,127,.08)));border-radius:12px;padding:12px 8px 9px;box-shadow:var(--dsw-shadow-lv1,0 1px 2px rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,inherit)}
.dsh-upload-badge{width:44px;height:56px;border-radius:6px;color:#fff;font-size:12px;font-weight:700;font-family:var(--ds-font-family-code,monospace);display:inline-flex;align-items:center;justify-content:center;letter-spacing:.5px;flex:none;box-shadow:inset 0 -10px 14px rgba(0,0,0,.14),inset 0 10px 12px rgba(255,255,255,.16)}
.dsh-upload-name{width:100%;font-size:12px;line-height:16px;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-all}
.dsh-upload-size{color:var(--dsw-alias-label-tertiary,inherit);font-size:10.5px;flex:none}
.dsh-upload-remove{border:none;background:transparent;color:var(--dsw-alias-label-tertiary,inherit);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;line-height:0;flex:none}
.dsh-upload-remove:hover{color:var(--dsw-alias-label-primary,inherit);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dsh-upload-card>.dsh-upload-remove{position:absolute;top:4px;right:4px}
.dsh-upload-error{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid var(--dsw-alias-border-l2-darkmode-thin,rgba(127,127,127,.22));background:var(--dsw-alias-interactive-bg-hover-danger,rgba(216,97,97,.14));color:var(--dsw-alias-state-error-primary,#d86161);border-radius:10px;padding:6px 8px 6px 10px;font-size:13px}
.dsh-upload-error-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}
.dsh-upload-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;background:color-mix(in srgb,var(--dsw-alias-surface-1,#101014) 72%,transparent);backdrop-filter:blur(2px);opacity:0;transition:opacity .12s ease}
.dsh-upload-overlay.active{opacity:1}
.dsh-upload-overlay-box{border:2px dashed var(--dsw-alias-border-accent,rgba(99,132,255,.55));border-radius:16px;padding:28px 44px;color:var(--dsw-alias-label-primary,inherit);font-size:15px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--dsw-specific-input-major,rgba(127,127,127,.08))}
.dsh-upload-overlay-hint{font-size:12px;color:var(--dsw-alias-label-tertiary,inherit)}
.dsh-mic-btn.recording{color:#e5484d;animation:dsh-mic-pulse 1s ease-in-out infinite}
@keyframes dsh-mic-pulse{0%,100%{opacity:1}50%{opacity:.35}}
`;
    document.head.appendChild(tag);
  }
  function httpErrorText(status) {
    if (status === 413) return "\u6587\u4EF6\u8D85\u8FC7\u5927\u5C0F\u9650\u5236";
    if (status === 415) return "\u6587\u4EF6\u7C7B\u578B\u4E0D\u88AB\u5141\u8BB8";
    if (status === 403) return "\u4F1A\u8BDD\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5";
    if (status === 429) return "\u4E0A\u4F20\u592A\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5";
    return `HTTP ${status}`;
  }
  async function uploadFile(actx, file, sessionId) {
    const conversation = actx.get("conversation");
    if (conversation === void 0) throw new Error("conversation service unavailable");
    const input = conversation.input.for(actx);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "x-file-name": encodeURIComponent(file.name),
        "x-session-id": sessionId
      },
      body: file
    });
    if (!res.ok) {
      let detail = httpErrorText(res.status);
      try {
        const payload2 = await res.json();
        if (typeof payload2.error === "string") detail = payload2.error;
      } catch {
      }
      throw new Error(`${file.name}: ${detail}`);
    }
    const payload = await res.json();
    if (typeof payload.path !== "string") throw new Error("missing path in response");
    const name = payload.name ?? file.name;
    const bytes = payload.bytes ?? file.size;
    uploadMeta.set(payload.path, {
      name,
      bytes,
      label: payload.label ?? name.slice(name.lastIndexOf(".") + 1).toUpperCase(),
      status: "ready"
    });
    clearUploadError();
    const state = input.state.getSnapshot();
    if (typeof payload.inlineText === "string") {
      const text = `[file: ${name}]
${payload.inlineText}`;
      actx.emit("slash/input-insert-text", {
        text,
        span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
      });
      return payload.path;
    }
    if (payload.sniffedType === "image" && payload.imageMode === "native") {
      const text = `[\u56FE\u7247: ${name}] \u5F53\u524D\u6A21\u578B\u652F\u6301\u56FE\u50CF\u8F93\u5165,\u8BF7\u7528 read_image \u5DE5\u5177\u67E5\u770B ${payload.path}`;
      actx.emit("slash/input-insert-text", {
        text,
        span: { start: state.draft.length, end: state.draft.length, draftRev: state.draftRev }
      });
      return payload.path;
    }
    const label = payload.preview !== void 0 ? `[file: ${name}] (preview) ${payload.preview}` : "";
    actx.emit("slash/input-insert-reference", {
      reference: {
        source: SOURCE_NAME,
        ref: payload.path,
        label,
        clipboardText: payload.path
      },
      span: {
        start: state.draft.length,
        end: state.draft.length,
        draftRev: state.draftRev
      }
    });
    return payload.path;
  }
  async function attachFiles(actx, files, sessionId) {
    for (const file of files) {
      try {
        await uploadFile(actx, file, sessionId);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : String(err));
      }
    }
  }
  function UploadButton({ attach }) {
    const [busy, setBusy] = (0, import_react.useState)(false);
    const inputRef = (0, import_react.useRef)(null);
    const pick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      document.body.appendChild(input);
      inputRef.current = input;
      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        input.remove();
        inputRef.current = null;
        if (files.length === 0) return;
        setBusy(true);
        void attach(files).finally(() => setBusy(false));
      };
      input.click();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Tooltip, { label: busy ? "\u4E0A\u4F20\u4E2D\u2026" : "\u4E0A\u4F20\u6587\u4EF6", side: "top", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-upload-btn", "aria-label": "\u4E0A\u4F20\u6587\u4EF6", disabled: busy, onClick: pick, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconPaperclipOutline16, { size: 14 }) }) });
  }
  function MicButton({
    attach,
    insert,
    maxSec
  }) {
    const [recording, setRecording] = (0, import_react.useState)(false);
    const recRef = (0, import_react.useRef)(null);
    const timeoutRef = (0, import_react.useRef)(null);
    const stop = () => {
      recRef.current?.stop();
      recRef.current = null;
      setRecording(false);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    const toggle = () => {
      if (recording) {
        stop();
        return;
      }
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (SR !== void 0) {
        const rec = new SR();
        rec.lang = navigator.language || "zh-CN";
        rec.continuous = true;
        rec.interimResults = true;
        let draft = "";
        const actx = null;
        rec.onresult = (event) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const item = event.results[i];
            if (item.length > 0) text += item[0].transcript;
          }
          draft = text;
        };
        rec.onend = () => {
          setRecording(false);
          if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (draft.trim() !== "") insert(draft.trim());
        };
        rec.onerror = () => {
          setRecording(false);
          setUploadError("\u8BED\u97F3\u8BC6\u522B\u4E0D\u53EF\u7528,\u5DF2\u5207\u6362\u4E3A\u5F55\u97F3\u6587\u4EF6\u4E0A\u4F20");
          void recordAndAttach(attach, maxSec);
        };
        recRef.current = { stop: () => rec.stop() };
        setRecording(true);
        rec.start();
        timeoutRef.current = setTimeout(stop, maxSec * 1e3);
        return;
      }
      void recordAndAttach(attach, maxSec);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Tooltip, { label: recording ? "\u505C\u6B62\u5F55\u97F3" : "\u8BED\u97F3\u8F93\u5165", side: "top", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: `dsh-upload-btn dsh-mic-btn${recording ? " recording" : ""}`,
        "aria-label": "\u8BED\u97F3\u8F93\u5165",
        onClick: toggle,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "path",
            {
              d: "M8 1.5a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0V4A2.5 2.5 0 0 0 8 1.5Z",
              fill: "currentColor"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "path",
            {
              d: "M3.5 7.5a.75.75 0 0 1 1.5 0 2.5 2.5 0 0 0 5 0 .75.75 0 0 1 1.5 0 4 4 0 0 1-3.25 3.94V13H10a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 6 13h1.75v-1.56A4 4 0 0 1 4.5 8a.75.75 0 0 1 .5-.75.75.75 0 0 1 .5-.5Z",
              fill: "currentColor",
              transform: "translate(0 -1)"
            }
          )
        ] })
      }
    ) });
  }
  async function recordAndAttach(attach, maxSec) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = window.MediaRecorder.isTypeSupported?.("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mime !== "" ? { mimeType: mime } : void 0);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mime || "audio/webm" });
        const ext = mime.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type });
        void attach([file]);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), maxSec * 1e3);
    } catch (err) {
      setUploadError(`\u65E0\u6CD5\u8BBF\u95EE\u9EA6\u514B\u98CE: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  function DragOverlay({ attach, sessionId }) {
    const [active, setActive] = (0, import_react.useState)(false);
    const depth = (0, import_react.useRef)(0);
    const overlayRef = (0, import_react.useRef)(null);
    (0, import_react.useEffect)(() => {
      const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
      const onDragEnter = (e) => {
        if (!hasFiles(e)) return;
        depth.current += 1;
        setActive(true);
      };
      const onDragOver = (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
      };
      const onDragLeave = (e) => {
        if (!hasFiles(e)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setActive(false);
      };
      const onDrop = (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        depth.current = 0;
        setActive(false);
        const files = Array.from(e.dataTransfer?.files ?? []);
        if (files.length > 0) void attach(files);
      };
      document.addEventListener("dragenter", onDragEnter);
      document.addEventListener("dragover", onDragOver);
      document.addEventListener("dragleave", onDragLeave);
      document.addEventListener("drop", onDrop);
      return () => {
        document.removeEventListener("dragenter", onDragEnter);
        document.removeEventListener("dragover", onDragOver);
        document.removeEventListener("dragleave", onDragLeave);
        document.removeEventListener("drop", onDrop);
      };
    }, [attach, sessionId]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: overlayRef, className: `dsh-upload-overlay${active ? " active" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-upload-overlay-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "\u677E\u5F00\u4EE5\u6DFB\u52A0\u6587\u4EF6" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-upload-overlay-hint", children: "\u6587\u4EF6\u5C06\u4E0A\u4F20\u5230\u5F53\u524D\u4F1A\u8BDD\uFF0Cagent \u53EF\u8BFB\u53D6\u5176\u5185\u5BB9" })
    ] }) });
  }
  function UploadDock({ attach, sessionId }) {
    const [metaVersion, setMetaVersion] = (0, import_react.useState)(0);
    const [error, setError] = (0, import_react.useState)(null);
    (0, import_react.useEffect)(() => {
      const offs = [
        subscribeErrors((next) => {
          setError(next);
          setMetaVersion((v) => v + 1);
        })
      ];
      return () => {
        for (const off of offs) off();
      };
    }, []);
    const removeCard = (ref) => {
      uploadMeta.delete(ref);
      setMetaVersion((v) => v + 1);
      void fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
          "x-file-path": ref
        }
      }).catch(() => void 0);
    };
    const entries = Array.from(uploadMeta.entries());
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-upload-dock", children: entries.map(([ref, meta]) => {
        const badge = badgeStyle(meta.name);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-upload-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-upload-badge", style: { background: badge.bg }, children: badge.ext }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-upload-name", title: meta.name, children: meta.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-upload-size", children: formatBytes(meta.bytes) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Tooltip, { label: "\u79FB\u9664", side: "top", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "dsh-upload-remove",
              "aria-label": "\u79FB\u9664",
              onClick: () => removeCard(ref),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCloseOutline16, { size: 12 })
            }
          ) })
        ] }, ref);
      }) }),
      error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-upload-error", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-upload-error-text", children: error.text }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-upload-remove",
            "aria-label": "\u5173\u95ED",
            onClick: () => setError(null),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCloseOutline16, { size: 12 })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { attach, sessionId })
    ] });
  }
  function apply(ctx) {
    injectCss();
    ctx.effect(
      () => ctx.inputTriggers.registerSource({
        trigger: "@",
        name: SOURCE_NAME,
        candidates: async () => [],
        onPick: () => void 0,
        codec: {
          clipboardText: (ref) => ref,
          serialize: async (ref) => ref
        }
      })
    );
    ctx.slots.inject(
      "conversation.input.left",
      () => ctx.slots.register(
        {
          name: "conversation.input.left",
          id: "@dsh-selfuse/file-upload-button",
          order: 0,
          inject: (sessionId) => ({
            attach: (files) => attachFiles(ctx.sessions.scope(sessionId), files, sessionId)
          })
        },
        UploadButton
      )
    );
    ctx.slots.inject(
      "conversation.input.left",
      () => ctx.slots.register(
        {
          name: "conversation.input.left",
          id: "@dsh-selfuse/file-upload-mic",
          order: 1,
          inject: (sessionId) => {
            const actx = ctx.sessions.scope(sessionId);
            return {
              attach: (files) => attachFiles(actx, files, sessionId),
              insert: (text) => {
                const conversation = actx.get("conversation");
                const input = conversation?.input.for(actx);
                const state = input?.state.getSnapshot();
                actx.emit("slash/input-insert-text", {
                  text,
                  span: { start: state?.draft.length ?? 0, end: state?.draft.length ?? 0, draftRev: state?.draftRev ?? 0 }
                });
              },
              maxSec: MAX_RECORD_SEC
            };
          }
        },
        MicButton
      )
    );
    ctx.slots.inject(
      "conversation.input.dock",
      () => ctx.slots.register(
        {
          name: "conversation.input.dock",
          id: "@dsh-selfuse/file-upload-dock",
          order: 5,
          inject: (sessionId) => ({
            attach: (files) => attachFiles(ctx.sessions.scope(sessionId), files, sessionId)
          })
        },
        UploadDock
      )
    );
  }
  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      apply,
      inject: ["slots", "inputTriggers", "sessions"]
    };
  }
})();
return module.exports; } });
//# sourceMappingURL=client.js.map
