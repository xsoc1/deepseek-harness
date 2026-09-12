window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-web-shell-bridge",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * 纯 web 环境的桌面壳桥（client half）。
		 *
		 * 在无 Electron 壳的 web 实例上提供 window.dshDesktop 等价物，把
		 * dsh-client-file-changes 依赖的壳能力
		 * 转发到宿主 webServer 的 /api/dsh-shell/* 路由：
		 *   - revertFiles    → 文件一键还原（内容精确匹配后替换）
		 *   - openPath       → 系统默认程序打开会话工作区文件
		 *   - openExternal   → 系统浏览器打开 http(s) URL
		 *   - getInfo        → { appVersion, staticPort: 0 }（0 → 回退宿主静态服务）
		 */
		function postJson(url, body) {
			return fetch(url, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body || {})
			}).then((r) => r.json());
		}

		function installBridge() {
			if (typeof window === "undefined") return;
			if (window.dshDesktop) return; // 桌面壳已存在时不覆盖
			window.dshDesktop = {
				getInfo: () => fetch("/api/dsh-shell/info").then((r) => r.json()),
				revertFiles: (changes) => postJson("/api/dsh-shell/revert", { changes }),
				openPath: (path) => postJson("/api/dsh-shell/open-path", { path }),
				openExternal: (url) => postJson("/api/dsh-shell/open-external", { url })
			};
		}

		function apply() {
			installBridge();
		}

		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
