/**
 * dsh-easy-setup — browser half.
 *
 * Two sections inside the Web UI settings page:
 *
 *   1. 视觉模型（快速配置） — provider + model dropdowns over the
 *      `tool-vision` settings namespace (the dsh-tool-vision plugin's own
 *      section stays for advanced fields).
 *   2. 人设编辑 — a textarea over the real soul.md file through the
 *      easySetup remote; dsh-soul-md hot-reloads edits within ~300ms.
 *
 * Hand-written ModuleLoader bundle — no build step required.
 */
window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-easy-setup",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");
    var h = react.createElement;

    // ── CSS (theme tokens) ────────────────────────────────────────────────
    var CSS = ".__es_root{max-width:640px;display:flex;flex-direction:column;gap:10px}" +
      ".__es_field{display:flex;flex-direction:column;gap:4px}" +
      ".__es_label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}" +
      ".__es_hint{font-size:11px;color:var(--dsw-alias-label-tertiary)}" +
      ".__es_input,.__es_select,.__es_textarea{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 10px;font-size:13px;box-sizing:border-box;width:100%}" +
      ".__es_textarea{min-height:220px;resize:vertical;font-family:var(--dsw-alias-font-mono,monospace);line-height:1.5}" +
      ".__es_row{display:flex;align-items:center;gap:8px}" +
      ".__es_actions{display:flex;gap:8px;align-items:center;margin-top:4px}" +
      ".__es_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer}" +
      ".__es_btn:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}" +
      ".__es_btn:disabled{opacity:.5;cursor:default}" +
      ".__es_btnPrimary{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-on-accent)}" +
      ".__es_status{font-size:12px;color:var(--dsw-alias-label-tertiary)}" +
      ".__es_error{font-size:12px;color:var(--dsw-alias-state-error-primary)}" +
      ".__es_ok{font-size:12px;color:var(--dsw-alias-state-success-primary)}" +
      ".__es_path{font-size:11px;color:var(--dsw-alias-label-tertiary);word-break:break-all}" +
      ".__es_details{font-size:12px;color:var(--dsw-alias-label-tertiary)}" +
      ".__es_details summary{cursor:pointer;color:var(--dsw-alias-label-secondary)}" +
      ".__es_prompt{white-space:pre-wrap;font-family:var(--dsw-alias-font-mono,monospace);font-size:11px;line-height:1.5;max-height:240px;overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;background:var(--dsw-alias-bg-layer-2)}";
    var tagId = "dsh-easy-setup/main.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = "dsh-easy-setup";
      tag.dataset.pluginCss = tagId;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    // ── locale ────────────────────────────────────────────────────────────
    var NS = "easySetup";
    var zh = {
      visionNav: "视觉模型（快速配置）",
      visionIntro: "选择视觉模型提供商与模型，保存后即时生效。主模型保持不变，图片会自动交给这里的视觉模型分析（由 dsh-tool-vision 插件桥接）。",
      provider: "提供商",
      model: "视觉模型",
      modelCustom: "自定义模型 ID",
      apiKey: "API Key",
      apiKeyHint: "留空保持当前密钥；密钥只写不读。",
      save: "保存",
      saved: "已保存，即时生效",
      saving: "保存中…",
      error: "保存失败",
      unavailable: "视觉插件设置不可用（dsh-tool-vision 未启用？）",
      personaNav: "人设编辑",
      personaIntro: "直接编辑人设卡（soul.md）：保存后约 300ms 热重载生效，无需重启。文件变更也会被 dsh-soul-md 自动监听。",
      personaBraceWarn: "内容包含双花括号定界符（提示词变量语法，soul-md 无转义），保存后对话会渲染失败——请改写这些位置后再保存。",
      loadFail: "读取人设失败",
      saveFail: "保存失败",
      missing: "（文件尚不存在，保存时将创建）"
    };
    var en = {
      visionNav: "Vision (Quick Setup)",
      visionIntro: "Pick a vision provider and model; applies immediately. Your main model stays unchanged — images are bridged to this vision model by the dsh-tool-vision plugin.",
      provider: "Provider",
      model: "Vision model",
      modelCustom: "Custom model id",
      apiKey: "API Key",
      apiKeyHint: "Leave blank to keep the current key; write-only.",
      save: "Save",
      saved: "Saved — effective immediately",
      saving: "Saving…",
      error: "Save failed",
      unavailable: "Vision settings unavailable (dsh-tool-vision not enabled?)",
      personaNav: "Persona Editor",
      personaIntro: "Edit the persona card (soul.md) directly; hot-reloads within ~300ms of saving — no restart needed.",
      personaBraceWarn: "The content contains double-brace delimiters (prompt-variable syntax; soul-md has no escape) — sending will fail to render. Rewrite those spots before saving.",
      loadFail: "Failed to load persona",
      saveFail: "Save failed",
      missing: "(file missing; created on save)"
    };

    // ── vision provider presets (UI-side constant) ───────────────────────
    var PROVIDERS = [
      { id: "zhipu", label: "智谱 AI（GLM）", baseURL: "https://open.bigmodel.cn/api/paas/v4", keyEnv: "GLM_API_KEY", models: ["glm-4v-flash", "glm-4v-plus", "glm-4v"] },
      { id: "dashscope", label: "阿里云百炼（通义千问 VL）", baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", keyEnv: "DASHSCOPE_API_KEY", models: ["qwen-vl-plus", "qwen-vl-max", "qwen2.5-vl-72b-instruct"] },
      { id: "openai", label: "OpenAI", baseURL: "https://api.openai.com/v1", keyEnv: "OPENAI_API_KEY", models: ["gpt-4o-mini", "gpt-4o"] },
      { id: "siliconflow", label: "硅基流动 SiliconFlow", baseURL: "https://api.siliconflow.cn/v1", keyEnv: "SILICONFLOW_API_KEY", models: ["Qwen/Qwen2.5-VL-32B-Instruct", "Pro/Qwen/Qwen2.5-VL-7B-Instruct"] },
      { id: "moonshot", label: "月之暗面 Kimi", baseURL: "https://api.moonshot.cn/v1", keyEnv: "MOONSHOT_API_KEY", models: ["moonshot-v1-8k-vision-preview"] },
      { id: "custom", label: "自定义（手动填写）", baseURL: "", keyEnv: "VISION_API_KEY", models: [] }
    ];

    // ── remote face (easySetup) ───────────────────────────────────────────
    var looseCodec = () => ({
      mode: "strict",
      typeSymbol: "@deepseek-ai/dsh-easy-setup/types#Json",
      schema: { parse: (value) => value }
    });
    var descriptor = (method, parameters) => ({
      id: `@deepseek-ai/dsh-easy-setup#easySetup/${method}`,
      service: "easySetup",
      namespace: "easySetup",
      method,
      invocation: { kind: "direct" },
      parameters: parameters.map((name) => ({ name, wire: name, source: "json", codec: looseCodec() })),
      result: looseCodec()
    });
    var REMOTE = {
      package: "@deepseek-ai/dsh-easy-setup",
      descriptors: [
        descriptor("readPersona", []),
        descriptor("writePersona", ["content"])
      ]
    };

    // ── section 1: vision quick setup ────────────────────────────────────
    function VisionQuick(props) {
      var t = props.t;
      var scope = props.scope;
      // Minimal snapshot subscription (same pattern as the tool-vision UI).
      var state = react.useState(function () { return scope.getSnapshot(); });
      var snapshot = state[0];
      var setSnapshot = state[1];
      react.useEffect(function () {
        var alive = true;
        scope.load && scope.load();
        var sync = function () { if (alive) setSnapshot(scope.getSnapshot()); };
        var un = typeof scope.subscribe === "function" ? scope.subscribe(sync) : null;
        return function () { alive = false; if (un) un(); };
      }, [scope]);

      var value = snapshot.value || {};
      var currentProvider = PROVIDERS.find(function (p) { return p.baseURL && p.baseURL === value.baseURL; }) || PROVIDERS.find(function (p) { return p.id === "custom"; });
      var currentModel = typeof value.model === "string" ? value.model : "";
      var preset = PROVIDERS.find(function (p) { return p.models.indexOf(currentModel) >= 0 && p === currentProvider; });
      var provState = react.useState(currentProvider ? currentProvider.id : "custom");
      var providerId = provState[0];
      var setProviderId = provState[1];
      var modelState = react.useState(preset ? "" : currentModel);
      var customModel = modelState[0];
      var setCustomModel = modelState[1];
      var baseState = react.useState(value.baseURL || "");
      var customBase = baseState[0];
      var setCustomBase = baseState[1];
      var keyState = react.useState("");
      var apiKey = keyState[0];
      var setApiKey = keyState[1];
      var busyState = react.useState(null);
      var busy = busyState[0];
      var setBusy = busyState[1];

      react.useEffect(function () {
        setProviderId(currentProvider ? currentProvider.id : "custom");
        setCustomModel(preset ? "" : currentModel);
        setCustomBase(value.baseURL || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [snapshot.status === "ready"]);

      if (snapshot.status === "unavailable") {
        return h("p", { className: "__es_hint" }, t("unavailable"));
      }
      if (snapshot.status !== "ready") return h("p", { className: "__es_status" }, "…");

      var provider = PROVIDERS.find(function (p) { return p.id === providerId; }) || PROVIDERS[0];
      var model = customModel || (provider.models[0] || "");
      var baseURL = provider.id === "custom" ? customBase : provider.baseURL;

      function onSave() {
        setBusy("saving");
        var writes = [
          baseURL && baseURL !== value.baseURL ? scope.set("baseURL", baseURL) : Promise.resolve(),
          model && model !== value.model ? scope.set("model", model) : Promise.resolve(),
          provider.keyEnv && provider.keyEnv !== value.apiKeyEnv ? scope.set("apiKeyEnv", provider.keyEnv) : Promise.resolve(),
          apiKey ? scope.set("apiKey", apiKey) : Promise.resolve()
        ];
        Promise.all(writes).then(function () {
          setBusy("saved");
          setApiKey("");
          scope.load && scope.load();
        }).catch(function (e) {
          setBusy("error:" + String(e && e.message || e));
        });
      }

      return h("div", { className: "__es_root" },
        h("p", { className: "__es_hint", style: { margin: 0 } }, t("visionIntro")),
        h("label", { className: "__es_field" },
          h("span", { className: "__es_label" }, t("provider")),
          h("select", {
            className: "__es_select",
            value: providerId,
            onChange: function (e) {
              setProviderId(e.target.value);
              setCustomModel("");
              var next = PROVIDERS.find(function (p) { return p.id === e.target.value; });
              if (next && next.id !== "custom") setCustomBase(next.baseURL);
            }
          }, PROVIDERS.map(function (p) {
            return h("option", { key: p.id, value: p.id }, p.label);
          }))
        ),
        provider.id === "custom" ? h("label", { className: "__es_field" },
          h("span", { className: "__es_label" }, "API Base URL"),
          h("input", { className: "__es_input", value: customBase, placeholder: "https://api.example.com/v1", onChange: function (e) { setCustomBase(e.target.value); } })
        ) : null,
        provider.models.length > 0 ? h("label", { className: "__es_field" },
          h("span", { className: "__es_label" }, t("model")),
          h("select", {
            className: "__es_select",
            value: provider.models.indexOf(customModel) >= 0 || customModel === "" ? customModel || provider.models[0] : "__custom",
            onChange: function (e) { setCustomModel(e.target.value === "__custom" ? "" : e.target.value); }
          },
            provider.models.map(function (m) { return h("option", { key: m, value: m }, m); }),
            h("option", { key: "__custom", value: "__custom" }, t("modelCustom") + (provider.models.indexOf(currentModel) >= 0 && currentModel ? "（当前: " + currentModel + "）" : "")))
        ) : null,
        (provider.models.length === 0 || customModel === "") ? h("label", { className: "__es_field" },
          h("span", { className: "__es_label" }, provider.models.length > 0 ? t("modelCustom") : t("model")),
          h("input", { className: "__es_input", value: customModel, placeholder: "model-id", onChange: function (e) { setCustomModel(e.target.value); } })
        ) : null,
        h("label", { className: "__es_field" },
          h("span", { className: "__es_label" }, t("apiKey")),
          h("input", { className: "__es_input", type: "password", value: apiKey, placeholder: "sk-…", onChange: function (e) { setApiKey(e.target.value); } }),
          h("span", { className: "__es_hint" }, t("apiKeyHint"))
        ),
        h("div", { className: "__es_actions" },
          h("button", { className: "__es_btn __es_btnPrimary", disabled: busy === "saving" || !model || !baseURL, onClick: onSave }, busy === "saving" ? t("saving") : t("save")),
          busy === "saved" ? h("span", { className: "__es_ok" }, t("saved")) : null,
          typeof busy === "string" && busy.indexOf("error:") === 0 ? h("span", { className: "__es_error" }, t("error") + ": " + busy.slice(6)) : null
        )
      );
    }

    // ── section 2: persona editor ────────────────────────────────────────
    function PersonaEditor(props) {
      var t = props.t;
      var remote = props.remote;
      var state = react.useState({ status: "loading", path: "", content: "", exists: true });
      var data = state[0];
      var setData = state[1];
      var draftState = react.useState("");
      var draft = draftState[0];
      var setDraft = draftState[1];
      var busyState = react.useState(null);
      var busy = busyState[0];
      var setBusy = busyState[1];

      react.useEffect(function () {
        var alive = true;
        remote().then(function (svc) { return svc.readPersona(); }).then(function (res) {
          if (!alive) return;
          // typert 远程结果统一 { ok, value } 包装：host 方法的返回在 value 里。
          var data2 = res && res.ok ? res.value : null;
          if (!data2 || !data2.ok) { setData({ status: "error", path: "", content: "", exists: false }); return; }
          setData({ status: "ready", path: data2.path, content: data2.content || "", exists: data2.exists });
          setDraft(data2.content || "");
        }).catch(function () { if (alive) setData({ status: "error", path: "", content: "", exists: false }); });
        return function () { alive = false; };
      }, []);

      // soul-md 把 soul.md 当提示词模板渲染，双花括号是变量语法且无转义；
      // 含有它们的卡片会让整个对话渲染失败——保存前拦下并提示。
      var braces = /\{\{|\}\}/.test(draft);

      function onSave() {
        if (braces) return;
        setBusy("saving");
        remote().then(function (svc) { return svc.writePersona(draft); }).then(function (res) {
          var data2 = res && res.ok ? res.value : null;
          if (data2 && data2.ok) {
            setBusy("saved");
            setData(function (prev) { return { status: "ready", path: data2.path, content: draft, exists: true }; });
          } else {
            setBusy("error:" + ((data2 && data2.error) || (res && res.error && res.error.message) || "unknown"));
          }
        }).catch(function (e) { setBusy("error:" + String(e && e.message || e)); });
      }

      if (data.status === "loading") return h("p", { className: "__es_status" }, "…");
      if (data.status === "error") return h("p", { className: "__es_error" }, t("loadFail"));

      return h("div", { className: "__es_root" },
        h("p", { className: "__es_hint", style: { margin: 0 } }, t("personaIntro")),
        h("span", { className: "__es_path" }, data.path + (data.exists ? "" : " " + t("missing"))),
        h("textarea", {
          className: "__es_textarea",
          value: draft,
          onChange: function (e) { setDraft(e.target.value); setBusy(null); },
          spellCheck: false
        }),
        h("div", { className: "__es_actions" },
          h("button", { className: "__es_btn __es_btnPrimary", disabled: busy === "saving" || braces || draft === data.content, onClick: onSave }, busy === "saving" ? t("saving") : t("save")),
          braces ? h("span", { className: "__es_error" }, t("personaBraceWarn")) : null,
          busy === "saved" ? h("span", { className: "__es_ok" }, t("saved")) : null,
          typeof busy === "string" && busy.indexOf("error:") === 0 ? h("span", { className: "__es_error" }, t("saveFail") + ": " + busy.slice(6)) : null
        )
      );
    }

    // ── plugin ────────────────────────────────────────────────────────────
    var inject = ["slots", "locale", "remote", "settingsScope"];

    function apply(ctx) {
      var t = ctx.locale.bind(NS);
      ctx.effect(function () { return ctx.locale.register(NS, { zh: zh, en: en }); }, "dsh-easy-setup: dictionaries");

      var mountPromise = ctx.remote.$mount(REMOTE).then(function (dispose) {
        ctx.effect(function () { return dispose; }, "dsh-easy-setup: remote face");
        return null;
      }, function (error) {
        console.error("dsh-easy-setup: remote face mount failed", error);
        throw error;
      });
      var remote = function () {
        var service = ctx.get("remote.easySetup");
        if (service) return Promise.resolve(service);
        return mountPromise.catch(function () {}).then(function () {
          var retry = ctx.get("remote.easySetup");
          if (!retry) throw new Error("easySetup 远程接口未注册");
          return retry;
        });
      };

      var visionScope = ctx.settingsScope.bind({ namespace: "tool-vision" });
      ctx.slots.inject("settings.section", function () {
        return ctx.slots.register({
          name: "settings.section",
          id: "easy-vision",
          order: 24,
          label: function () { return t("visionNav"); },
          locale: NS
        }, function (props) {
          return h(VisionQuick, Object.assign({}, props, { scope: visionScope }));
        });
      });
      ctx.slots.inject("settings.section", function () {
        return ctx.slots.register({
          name: "settings.section",
          id: "easy-persona",
          order: 26,
          label: function () { return t("personaNav"); },
          locale: NS
        }, function (props) {
          return h(PersonaEditor, Object.assign({}, props, { remote: remote }));
        });
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
