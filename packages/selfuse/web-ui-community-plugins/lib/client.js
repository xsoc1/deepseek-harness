window.__ModuleLoader__.load({
	id: "@dsh-selfuse/web-ui-community-plugins",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime");
		//#region \0dsh-css:packages/dsh-community-plugins/src/client/settings-card.module.css.mjs
		const css$1 = ".hX6Abq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.hX6Abq_card:hover{border-color:var(--dsw-alias-label-dimmed)}.hX6Abq_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.hX6Abq_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.hX6Abq_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.hX6Abq_headerStatic{border-radius:12px;align-items:center;gap:12px;width:100%;padding:14px 16px;display:flex}.hX6Abq_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.hX6Abq_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.hX6Abq_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.hX6Abq_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.hX6Abq_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.hX6Abq_chevronOpen{transform:rotate(180deg)}.hX6Abq_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.hX6Abq_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.hX6Abq_notExposed{color:var(--dsw-alias-state-warn-primary);margin:12px 0 0;font-size:12px;line-height:1.5}.hX6Abq_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.hX6Abq_failed{min-width:0;color:var(--dsw-alias-label-error);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:12px;line-height:1.5;overflow:hidden}.hX6Abq_discard,.hX6Abq_save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.hX6Abq_discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.hX6Abq_discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.hX6Abq_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.hX6Abq_discard:disabled,.hX6Abq_save:disabled{opacity:.4;cursor:default}.hX6Abq_discard:focus-visible,.hX6Abq_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.hX6Abq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.hX6Abq_field+.hX6Abq_field{border-top:1px solid var(--dsw-alias-border-l2)}.hX6Abq_head{align-items:center;gap:8px;display:flex}.hX6Abq_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.hX6Abq_badges{align-items:center;gap:8px;display:inline-flex}.hX6Abq_badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.hX6Abq_reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}.hX6Abq_reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.hX6Abq_reset:disabled{cursor:default}.hX6Abq_reset:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.hX6Abq_input,.hX6Abq_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.hX6Abq_input:focus-visible,.hX6Abq_select:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.hX6Abq_input:disabled,.hX6Abq_select:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.hX6Abq_inputInvalid{border:1px solid var(--dsw-alias-label-error);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.hX6Abq_inputInvalid:focus-visible{outline:2px solid var(--dsw-alias-label-error);outline-offset:1px;border-color:var(--dsw-alias-label-error)}.hX6Abq_selectWrap{position:relative}.hX6Abq_selectButton{appearance:none;text-align:left;cursor:pointer;justify-content:space-between;align-items:center;gap:8px;width:100%;display:flex}.hX6Abq_selectLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.hX6Abq_selectChevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.hX6Abq_selectChevronOpen{transform:rotate(180deg)}.hX6Abq_selectPopup{z-index:40;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);max-height:240px;box-shadow:0 8px 24px var(--dsw-alias-bg-mask-2);opacity:0;border-radius:8px;flex-direction:column;padding:4px;transition:opacity .1s,transform .1s;display:flex;position:absolute;top:calc(100% + 4px);left:0;right:0;overflow-y:auto;transform:translateY(-4px)}.hX6Abq_selectPopupOpen{opacity:1;transform:none}.hX6Abq_selectPopupClose{opacity:0;pointer-events:none;transform:translateY(-4px)}.hX6Abq_selectOption{color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;text-overflow:ellipsis;border-radius:6px;flex-shrink:0;padding:6px 10px;font-size:13px;line-height:1.5;overflow:hidden}.hX6Abq_selectOption:hover,.hX6Abq_selectOptionActive{background:var(--dsw-alias-interactive-bg-hover)}.hX6Abq_selectOptionSelected{color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color) 10%, transparent);font-weight:500}.hX6Abq_invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.hX6Abq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}@media (prefers-reduced-motion:reduce){.hX6Abq_card,.hX6Abq_header,.hX6Abq_chevron,.hX6Abq_chevronOpen,.hX6Abq_discard,.hX6Abq_save,.hX6Abq_selectChevron,.hX6Abq_selectChevronOpen,.hX6Abq_selectPopup{transition:none}}";
		const tagId$1 = "@dsh-selfuse/web-ui-community-plugins/settings-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-selfuse/web-ui-community-plugins";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var settings_card_module_css_default = {
			"badge": "hX6Abq_badge",
			"badges": "hX6Abq_badges",
			"body": "hX6Abq_body",
			"card": "hX6Abq_card",
			"cardOpen": "hX6Abq_cardOpen",
			"chevron": "hX6Abq_chevron",
			"chevronOpen": "hX6Abq_chevronOpen",
			"description": "hX6Abq_description",
			"discard": "hX6Abq_discard",
			"failed": "hX6Abq_failed",
			"field": "hX6Abq_field",
			"footer": "hX6Abq_footer",
			"head": "hX6Abq_head",
			"headText": "hX6Abq_headText",
			"header": "hX6Abq_header",
			"headerStatic": "hX6Abq_headerStatic",
			"hint": "hX6Abq_hint",
			"input": "hX6Abq_input",
			"inputInvalid": "hX6Abq_inputInvalid",
			"invalid": "hX6Abq_invalid",
			"label": "hX6Abq_label",
			"name": "hX6Abq_name",
			"notExposed": "hX6Abq_notExposed",
			"pending": "hX6Abq_pending",
			"readOnly": "hX6Abq_readOnly",
			"reset": "hX6Abq_reset",
			"save": "hX6Abq_save",
			"select": "hX6Abq_select",
			"selectButton": "hX6Abq_selectButton",
			"selectChevron": "hX6Abq_selectChevron",
			"selectChevronOpen": "hX6Abq_selectChevronOpen",
			"selectLabel": "hX6Abq_selectLabel",
			"selectOption": "hX6Abq_selectOption",
			"selectOptionActive": "hX6Abq_selectOptionActive",
			"selectOptionSelected": "hX6Abq_selectOptionSelected",
			"selectPopup": "hX6Abq_selectPopup",
			"selectPopupClose": "hX6Abq_selectPopupClose",
			"selectPopupOpen": "hX6Abq_selectPopupOpen",
			"selectWrap": "hX6Abq_selectWrap"
		};
		//#endregion
		//#region src/client/PluginSettingsCard.tsx
		/**
		* Family-shared chrome for plugin settings cards: a disclosure header naming
		* the plugin and what its settings govern, the controls inside, and the save
		* that writes them. Renders nothing while the namespace is unavailable — a
		* deployment that does not compose the owning plugin should show no trace of
		* it. Inlined into each consumer's client bundle; mirrors the official
		* ui-plugin-config PluginCard in a self-contained slice.
		*/
		/**
		* Render one plugin settings card.
		* @param props - the plugin's copy keys, its form state, and its controls.
		* @returns the card, or nothing while the namespace is still loading.
		*/
		function PluginSettingsCard(props) {
			const [open, setOpen] = (0, react.useState)(props.defaultOpen ?? true);
			const { state, alwaysOpen } = props;
			if (!state.available) return null;
			const title = props.t(props.titleKey);
			const description = props.t(props.descriptionKey);
			const blocked = !state.dirty || state.invalid || state.saving;
			const expanded = alwaysOpen === true || open;
			const cardClass = expanded ? `${settings_card_module_css_default.cardOpen} ${settings_card_module_css_default.card}` : settings_card_module_css_default.card;
			const header = alwaysOpen === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.headerStatic,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: settings_card_module_css_default.headText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.name,
						title,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.description,
						title: description,
						children: description
					})]
				}), state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: settings_card_module_css_default.pending,
					title: props.t("settings.unsaved"),
					children: props.t("settings.unsaved")
				}) : null]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: settings_card_module_css_default.header,
				"aria-expanded": open,
				"aria-label": `${props.t(open ? "settings.collapse" : "settings.expand")}: ${title}`,
				onClick: () => {
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							title,
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							title: description,
							children: description
						})]
					}),
					state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.pending,
						title: props.t("settings.unsaved"),
						children: props.t("settings.unsaved")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg",
						className: open ? `${settings_card_module_css_default.chevron} ${settings_card_module_css_default.chevronOpen}` : settings_card_module_css_default.chevron,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
							fill: "currentColor"
						})
					})
				]
			});
			if (!state.exposed) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: cardClass,
				children: [header, expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: settings_card_module_css_default.body,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.notExposed,
						role: "status",
						children: props.t("settings.notExposed")
					})
				}) : null]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: cardClass,
				children: [header, expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.readOnly,
							role: "status",
							children: props.t("settings.readOnly")
						}) : null,
						props.children,
						props.hideFooter === true ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.footer,
							children: [
								state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: settings_card_module_css_default.failed,
									role: "status",
									children: [props.t("settings.saveFailed"), state.failedReason ? " - " + state.failedReason : ""]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: settings_card_module_css_default.discard,
									disabled: !state.dirty || state.saving,
									onClick: props.onDiscard,
									children: props.t("settings.discard")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: settings_card_module_css_default.save,
									disabled: blocked,
									onClick: props.onSave,
									children: props.t(!state.saving ? "settings.save" : "settings.saving")
								})
							]
						})
					]
				}) : null]
			});
		}
		const NON_SKIN_BODY_MARKERS = /* @__PURE__ */ new Set(["dshSkinCenter", "dshSidebarCollapsed"]);
		function isSkinActive() {
			return Object.keys(document.body.dataset).some((key) => key.startsWith("dsh") && !NON_SKIN_BODY_MARKERS.has(key));
		}
		const SELECT_CLOSE_MS = 100;
		/**
		* The shared dual-mode select control. While an appearance skin is active it
		* renders the legacy native `<select>` untouched, so element-level skin
		* selectors keep working; under the default appearance it renders a
		* self-drawn `role="listbox"` popup whose open/close is transition-animated.
		* Staged cards reach it through BooleanField/ChoiceField; immediate-apply
		* editors (the side-card prefs) bind it directly through onEdit.
		* 双模式下拉框：皮肤激活时用原生 select，默认外观用自绘动画弹层。
		*/
		function SelectField(props) {
			const { id, options, value } = props;
			const [open, setOpen] = (0, react.useState)(false);
			const [closing, setClosing] = (0, react.useState)(false);
			const [phase, setPhase] = (0, react.useState)("initial");
			const [activeIndex, setActiveIndex] = (0, react.useState)(0);
			const closeTimer = (0, react.useRef)(void 0);
			const wrapRef = (0, react.useRef)(null);
			const popupRef = (0, react.useRef)(null);
			const currentIndex = () => {
				const index = options.findIndex((option) => option.value === value);
				return index >= 0 ? index : 0;
			};
			const close = (0, react.useCallback)(() => {
				if (closeTimer.current !== void 0) clearTimeout(closeTimer.current);
				setClosing(true);
				closeTimer.current = setTimeout(() => {
					setClosing(false);
					setOpen(false);
				}, SELECT_CLOSE_MS);
			}, []);
			const openPopup = () => {
				if (closeTimer.current !== void 0) clearTimeout(closeTimer.current);
				setActiveIndex(currentIndex());
				setPhase("initial");
				setClosing(false);
				setOpen(true);
			};
			const commit = (index) => {
				const option = options[index];
				if (option) props.onEdit(option.value);
				close();
			};
			const onTriggerClick = () => {
				if (props.disabled) return;
				if (open && !closing) close();
				else openPopup();
			};
			const onKeyDown = (event) => {
				if (props.disabled) return;
				const count = options.length;
				switch (event.key) {
					case "ArrowDown":
					case "ArrowUp":
					case "Enter":
					case " ":
						event.preventDefault();
						if (!open) openPopup();
						else if (!closing) if (event.key === "ArrowDown") setActiveIndex((index) => (index + 1) % count);
						else if (event.key === "ArrowUp") setActiveIndex((index) => (index - 1 + count) % count);
						else commit(activeIndex);
						break;
					case "Escape":
						if (open) {
							event.preventDefault();
							event.stopPropagation();
							close();
						}
						break;
					case "Tab":
						if (open) close();
						break;
				}
			};
			(0, react.useEffect)(() => () => {
				if (closeTimer.current !== void 0) clearTimeout(closeTimer.current);
			}, []);
			(0, react.useLayoutEffect)(() => {
				if (open && !closing && phase === "initial") {
					popupRef.current?.offsetHeight;
					setPhase("open");
				}
			}, [
				open,
				closing,
				phase
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onPointerDown = (event) => {
					const target = event.target;
					if (target instanceof Node && !wrapRef.current?.contains(target)) close();
				};
				document.addEventListener("pointerdown", onPointerDown);
				return () => document.removeEventListener("pointerdown", onPointerDown);
			}, [open, close]);
			(0, react.useEffect)(() => {
				if (props.disabled && open) close();
			}, [
				props.disabled,
				open,
				close
			]);
			if (isSkinActive()) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
				id,
				className: settings_card_module_css_default.select,
				value,
				disabled: props.disabled,
				onChange: (event) => {
					props.onEdit(event.target.value);
				},
				children: options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
					value: option.value,
					children: option.label
				}, option.value))
			});
			const label = options.find((option) => option.value === value)?.label ?? "";
			const popupClass = closing ? `${settings_card_module_css_default.selectPopup} ${settings_card_module_css_default.selectPopupClose}` : phase === "open" ? `${settings_card_module_css_default.selectPopup} ${settings_card_module_css_default.selectPopupOpen}` : settings_card_module_css_default.selectPopup;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.selectWrap,
				ref: wrapRef,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					id,
					className: `${settings_card_module_css_default.select} ${settings_card_module_css_default.selectButton}`,
					disabled: props.disabled,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					"aria-activedescendant": open ? `${id}-o${activeIndex}` : void 0,
					"aria-invalid": props.invalid || void 0,
					onClick: onTriggerClick,
					onKeyDown,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.selectLabel,
						children: label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg",
						className: open ? `${settings_card_module_css_default.selectChevron} ${settings_card_module_css_default.selectChevronOpen}` : settings_card_module_css_default.selectChevron,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
							fill: "currentColor"
						})
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: popupClass,
					role: "listbox",
					ref: popupRef,
					children: options.map((option, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id: `${id}-o${index}`,
						role: "option",
						"aria-selected": option.value === value,
						className: `${settings_card_module_css_default.selectOption}${option.value === value ? ` ${settings_card_module_css_default.selectOptionSelected}` : ""}${index === activeIndex && !closing ? ` ${settings_card_module_css_default.selectOptionActive}` : ""}`,
						onClick: () => {
							commit(index);
						},
						children: option.label
					}, option.value))
				}) : null]
			});
		}
		/** A staged boolean field: 继承 / 开 / 关. */
		function BooleanField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: settings_card_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: settings_card_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: settings_card_module_css_default.badges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: settings_card_module_css_default.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
						id: props.id,
						options: [
							{
								value: "",
								label: props.inheritLabel
							},
							{
								value: "true",
								label: props.onLabel
							},
							{
								value: "false",
								label: props.offLabel
							}
						],
						value: props.text,
						disabled: props.disabled,
						invalid: props.invalid,
						onEdit: props.onEdit
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.hint,
						children: props.hint
					})
				]
			});
		}
		//#endregion
		//#region src/client/settings-form.ts
		/** A boolean field, edited through true/false draft text. */
		function booleanField(field) {
			return {
				field,
				format: (value) => typeof value === "boolean" ? String(value) : "",
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					if (trimmed === "true") return {
						kind: "set",
						value: true
					};
					if (trimmed === "false") return {
						kind: "set",
						value: false
					};
				}
			};
		}
		/**
		* Stages one card's edits over one settings namespace and writes them on save.
		*
		* The Host is the only authority on whether a value was accepted — its
		* validators own the constraints no schema can express — so the outcome is
		* read back from the section rather than predicted here. A save that did not
		* land keeps its drafts, so the user can correct them instead of retyping.
		*/
		var CardForm = class {
			scope;
			specs;
			staged = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			/** The scope subscription installed in the constructor; released by dispose(). */
			disposeScope;
			disposed = false;
			saving = false;
			failed = false;
			failedReason;
			/** @param scope - the bound settings scope for this card's namespace. */
			constructor(scope, specs) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.disposeScope = scope.subscribe(() => {
					this.publish();
				});
			}
			/**
			* Release the scope subscription and every bound store listener. The card
			* must call this on teardown; later calls are no-ops.
			*/
			dispose() {
				if (this.disposed) return;
				this.disposed = true;
				this.disposeScope();
				this.listeners.clear();
			}
			/** Publish a projection of this form, rebuilt whenever the scope or a draft changes. */
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
				this.listeners.add(() => {
					store.set(project());
				});
				return store;
			}
			/** Read the card-level state: what the Host serves, and what a save would do. */
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status !== "loading",
					exposed: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === void 0),
					saving: this.saving,
					failed: this.failed,
					...this.failedReason === void 0 ? {} : { failedReason: this.failedReason }
				};
			}
			/** Read one field's state from the effective section and its staged draft. */
			field(field) {
				const spec = this.specOf(field);
				const staged = this.staged.get(field);
				if (staged === void 0) return {
					text: spec.format(this.sectionValue(field)),
					overridden: this.stored(field),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === void 0
				};
			}
			/** The actions the card's slot registration injects. */
			actions() {
				return {
					edit: (field, text) => {
						this.stage(field, {
							text,
							clear: false
						});
					},
					resetField: (field) => {
						this.stage(field, {
							text: this.specOf(field).format(this.baseValue(field)),
							clear: true
						});
					},
					save: () => {
						this.save();
					},
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.failedReason = void 0;
						this.publish();
					}
				};
			}
			/**
			* Write every staged edit, then re-seed from what the Host accepted.
			*
			* When the scope carries the optional batch surface (the dsh-web-ui
			* bridge scope), every planned write rides one mutation so cross-field
			* validate hooks (baseURL+model) judge the batch as a unit instead of
			* deadlocking on per-field writes. Otherwise the per-field loop runs.
			* A field lands only when the Host reports it held the staged value; a
			* landed field's draft is dropped, a failed one stays staged for the user.
			* @returns settlement after every write and the read-back.
			*/
			async save() {
				const plan = this.plan();
				const valid = plan.filter((item) => item.run !== void 0);
				if (plan.length === 0 || this.saving || valid.length !== plan.length) return;
				const plannedWrites = valid.map((item) => item.op);
				const pending = /* @__PURE__ */ new Map();
				for (const item of plan) pending.set(item.field, this.staged.get(item.field));
				this.saving = true;
				this.failed = false;
				this.failedReason = void 0;
				this.publish();
				const landed = /* @__PURE__ */ new Set();
				const batch = this.batchedScope();
				if (batch !== void 0) {
					const result = await batch.mutate(plannedWrites);
					if (result.ok) {
						for (const field of result.fields) if (field.landed) landed.add(field.field);
					} else this.failedReason = result.message;
				} else for (const item of valid) if (await item.run()) landed.add(item.field);
				for (const [field, before] of pending) if (landed.has(field) && this.staged.get(field) === before) this.staged.delete(field);
				this.saving = false;
				this.failed = landed.size !== pending.size;
				this.publish();
			}
			/** The scope's batch surface when it supports one; undefined conservatively otherwise. */
			batchedScope() {
				const candidate = this.scope;
				return typeof candidate?.mutate === "function" ? candidate : void 0;
			}
			/**
			* Every staged edit a save would write. An entry whose draft is not a value
			* its field accepts carries no write: the form is still dirty, and the save
			* refuses rather than dropping the edit. A staged edit that matches the
			* effective section is not a write at all.
			* @returns the planned writes, in the order the fields were staged.
			*/
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					const spec = this.specOf(field);
					if (staged.clear) {
						if (this.stored(field)) plan.push({
							field,
							op: {
								field,
								op: "unset"
							},
							run: () => this.clear(field)
						});
						continue;
					}
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === void 0) plan.push({
						field,
						op: {
							field,
							op: "unset"
						},
						run: void 0
					});
					else if (write.kind === "clear") plan.push({
						field,
						op: {
							field,
							op: "unset"
						},
						run: () => this.clear(field)
					});
					else plan.push({
						field,
						op: {
							field,
							op: "set",
							value: write.value
						},
						run: () => this.store(field, write.value)
					});
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				if (this.specOf(field).secret) return true;
				return this.userLayer()?.[field] === value;
			}
			stage(field, edit) {
				this.staged.set(field, edit);
				this.failed = false;
				this.failedReason = void 0;
				this.publish();
			}
			specOf(field) {
				const spec = this.specs.get(field);
				if (spec === void 0) throw new Error(`settings card has no field ${field}`);
				return spec;
			}
			snapshotOf() {
				return this.scope.getSnapshot();
			}
			sectionValue(field) {
				return this.snapshotOf().value?.[field];
			}
			baseValue(field) {
				return this.snapshotOf().base?.[field];
			}
			userLayer() {
				return this.snapshotOf().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== void 0 && Object.hasOwn(user, field);
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/generated/community.ts
		/**
		* AUTO-GENERATED by scripts/community-index — do not edit by hand.
		* Community plugin index for the settings page: every entry links to the
		* contributor's own repository. This repository never vendors the listed
		* plugins — it only points users at them.
		* Regenerate with `node scripts/community-index`.
		*/
		/** Stable category ids rendered as marketplace-style filter pills (the runtime guard imports this). */
		const COMMUNITY_CATEGORIES = [
			"ui",
			"agent",
			"tools",
			"knowledge",
			"integration",
			"security",
			"utility"
		];
		/** Every community plugin, in community.json order. */
		const COMMUNITY_PLUGINS = [
			{
				"id": "dsh-data-agent",
				"name": "Data Agent",
				"nameEn": "Data Agent",
				"author": "omdsh-dev",
				"repo": "https://github.com/omdsh-dev/dsh-data-agent",
				"description": "为 DSH 定义专用 Data Agent 预设，让 AI 帮你查询、更新、分析数据。",
				"descriptionEn": "Defines a dedicated Data Agent preset for DSH so the AI can query, update and analyze data.",
				"category": "agent"
			},
			{
				"id": "dsh-tui",
				"name": "dsh-TUI",
				"nameEn": "dsh-TUI",
				"author": "ccch1mneyyy",
				"repo": "https://github.com/ccch1mneyyy/dsh-TUI",
				"description": "Claude Code 风格全屏交互终端插件：像素鲸鱼顶栏、实时工作状态行、思考流式展开、双击 Esc 回滚、上下文进度条与 TPS 仪表。",
				"descriptionEn": "A Claude Code style fullscreen interactive terminal plugin: pixel-whale header, live working-state line, streaming reasoning expansion, double-Esc rollback, context progress bar and TPS gauges.",
				"category": "ui"
			},
			{
				"id": "dsh-tianshu-tui",
				"name": "天书 TUI",
				"nameEn": "Tianshu TUI",
				"author": "huiliyi37",
				"repo": "https://github.com/huiliyi37/dsh-tianshu-tui",
				"description": "基于官方 DeepSeek Harness 的交互式终端 UI 插件，在官方基础上增加 TDD 与证据门等工作流。",
				"descriptionEn": "An interactive terminal UI plugin for DeepSeek Harness that adds TDD and evidence-gate workflows on top of the official base.",
				"category": "ui"
			},
			{
				"id": "dsh-chat-summary",
				"name": "Chat Summary",
				"nameEn": "Chat Summary",
				"author": "v833",
				"repo": "https://github.com/v833/dsh-chat-summary",
				"description": "总结当前对话并导出为 Markdown / DOCX / PDF，可选 LLM 智能总结（用户自配 API Key）。",
				"descriptionEn": "Summarize the current conversation and export it as Markdown / DOCX / PDF, with optional LLM summarization using your own API key.",
				"category": "knowledge"
			},
			{
				"id": "dsh-builtin-toggles",
				"name": "内置能力检查器",
				"nameEn": "Built-in Capability Inspector",
				"author": "Starfie1d1272",
				"repo": "https://github.com/Starfie1d1272/dsh-builtin-toggles",
				"description": "Evidence-backed 内置 capability Inspector：展示 DSH Web built-in capability 的 provenance、compatibility 与 structural drift；仅对 9 个经过审阅的 UI leaves 提供 fail-closed 开关。",
				"descriptionEn": "Evidence-backed built-in capability Inspector: surfaces provenance, compatibility and structural drift of DSH Web built-ins, with fail-closed toggles for only the nine reviewed UI leaves.",
				"npm": "dsh-builtin-toggles",
				"category": "tools"
			},
			{
				"id": "dsh-pilot",
				"name": "Pilot 浏览器驾驶舱",
				"nameEn": "Pilot Browser Cockpit",
				"author": "guo6x",
				"repo": "https://github.com/guo6x/dsh-pilot",
				"description": "给 agent 一双会开车的手：零依赖 CDP 浏览器操控（8 个 pilot_* 工具：导航/点击/输入/按键/JS/截图）+ Web GUI 可拖拽驾驶舱面板，无需 Playwright、无需 API key。",
				"descriptionEn": "Give your agent hands: zero-dependency CDP browser control (8 pilot_* tools: navigate/click/type/keys/eval/screenshot) plus a draggable cockpit panel in the Web GUI - no Playwright, no API key.",
				"category": "tools"
			},
			{
				"id": "dsh-housekeeper",
				"name": "环境管家",
				"nameEn": "Environment Housekeeper",
				"author": "guo6x",
				"repo": "https://github.com/guo6x/dsh-housekeeper",
				"description": "管住 agent 的脏手：工具链台账（node/pnpm/git/gh/ffmpeg 等自动探测）、缓存与临时目录扫描 + 白名单安全一键清理、机器规则 AGENTS.md 查看编辑，全在设置面板完成。",
				"descriptionEn": "Keep your agent's hands clean: toolchain inventory, scratch/cache scan with whitelist-guarded one-click cleanup, and the machine rules file (AGENTS.md) view/edit - all in the settings panel.",
				"category": "utility"
			},
			{
				"id": "dsh-deepread",
				"name": "DeepRead 精读助手",
				"nameEn": "DeepRead Assistant",
				"author": "xiehuan123",
				"repo": "https://github.com/xiehuan123/dsh-deepread",
				"description": "五种模式精读插件（quick / deep / map / feynman / book），支持公众号链接与文件输入、批量对比、预算预检与后台任务进度透明，导出 md / mm / html，Web UI 提供工具结果卡片与精读面板。",
				"descriptionEn": "A five-mode deep reading plugin (quick / deep / map / feynman / book) for links and files, with batch comparison, budget preflight, transparent background-job progress, md / mm / html exports, and Web UI tool-result cards plus a reading panel.",
				"npm": "dsh-deepread",
				"category": "knowledge"
			},
			{
				"id": "dsh-mnemon",
				"name": "Mnemon 记忆系统",
				"nameEn": "Mnemon Memory",
				"author": "omdsh-dev",
				"repo": "https://github.com/omdsh-dev/dsh-mnemon",
				"description": "与 Mnemon CLI 集成的跨 Agent、本地优先持久记忆插件：用户画像 / 工作记忆 / 项目档案与长期 Memory Spaces，支持导入导出。",
				"descriptionEn": "A cross-agent, local-first persistent memory plugin integrating the Mnemon CLI: profiles, working memory, project documents and long-term Memory Spaces, with import and export.",
				"npm": "dsh-mnemon",
				"category": "knowledge"
			},
			{
				"id": "dsh-genui",
				"name": "GenUI 生成式 UI",
				"nameEn": "GenUI",
				"author": "omdsh-dev",
				"repo": "https://github.com/omdsh-dev/dsh-genui",
				"description": "给模型输出配交互式 UI：助手回复内联渲染 dsh-ui fence（布局、图表、表单、Mermaid、3D），支持流式渲染与面板停靠，组件交互可回传模型。",
				"descriptionEn": "Interactive UI inside assistant replies via the dsh-ui fence: layouts, charts, forms, Mermaid and 3D with streaming rendering, panel docking and actions that loop back to the model.",
				"category": "ui"
			},
			{
				"id": "dsh-annotation",
				"name": "选中批注",
				"nameEn": "Selection Annotation",
				"author": "omdsh-dev",
				"repo": "https://github.com/omdsh-dev/dsh-annotation",
				"description": "选中助手文字即可批注，回车随消息发送；自己的气泡只显示问题与「批注 ×N」标签，模型按 Annotation N 逐条对照回复（悬浮芯片）。",
				"descriptionEn": "Select text in an assistant reply to annotate it; annotations are sent with your next message, hidden from your own bubble behind an Annotations xN chip, and the model replies per Annotation N with hoverable chips.",
				"category": "ui"
			},
			{
				"id": "deepseek-harness-auth",
				"name": "DeepSeek Harness Auth",
				"nameEn": "DeepSeek Harness Auth",
				"author": "taichuy",
				"repo": "https://github.com/taichuy/deepseek-harness-auth",
				"description": "为 DSH Web 公网部署提供登录认证前置代理，支持账号密码、验证码、失败锁定和 IP/CIDR 白名单。",
				"descriptionEn": "An authentication proxy for public DSH Web deployments with password login, captcha, failed-attempt locking, and IP/CIDR allowlists.",
				"npm": "deepseek-harness-auth",
				"category": "security"
			},
			{
				"id": "dsh-cloud-sync",
				"name": "云同步服务",
				"nameEn": "Cloud Sync",
				"author": "dickpy",
				"repo": "https://github.com/dickpy/dsh-cloud-sync",
				"description": "支持 WebDAV、S3、阿里云 OSS、腾讯云 COS 与 MinIO 的 DSH 云同步插件，可同步 profile、插件配置及本地插件源码归档。",
				"descriptionEn": "DSH cloud sync for WebDAV, S3, Alibaba Cloud OSS, Tencent Cloud COS and MinIO, syncing profiles, plugin settings and local plugin source archives.",
				"npm": "@dickpy/dsh-cloud-sync",
				"category": "integration"
			},
			{
				"id": "dsh-auto-memory",
				"name": "自动记忆",
				"nameEn": "Auto Memory",
				"author": "Aik358",
				"repo": "https://github.com/Aik358/dsh-auto-memory",
				"description": "三层自动记忆插件：用户级/项目笔记/每日日志自动注入与检索、每轮自动沉淀、AI 时段问候、智能检索、日历与工作区思维导图，支持继承 WorkBuddy/CodeBuddy/Claude Code/Codex 等其他 AI 工具的记忆。",
				"descriptionEn": "Three-layer auto memory for DSH: user-level/project-notes/daily-logs with automatic injection and retrieval, per-turn auto-consolidation, AI greetings, smart search, calendar, workspace mind map, and inheritance from WorkBuddy/CodeBuddy/Claude Code/Codex.",
				"npm": "@a9i5k4/dsh-auto-memory",
				"category": "knowledge"
			},
			{
				"id": "dsh-memoir",
				"name": "项目记忆 Memoir",
				"nameEn": "Project Memory Memoir",
				"author": "Qinling-Melon-Farmers",
				"repo": "https://github.com/Qinling-Melon-Farmers/dsh-memoir",
				"description": "项目持久化记忆与会话经验沉淀：memoir_record / memoir_read 工具（BM25 相关度排序检索）、每轮工作自动蒸馏、记忆诊断面板与跨项目全局检索，纯本地零外部依赖。",
				"descriptionEn": "Project persistent memory and session-lessons distillation: memoir_record / memoir_read tools with BM25-ranked retrieval, per-turn auto-distill, a memory diagnostics panel and cross-project search - fully local, no external dependency.",
				"npm": "dsh-memoir",
				"category": "knowledge"
			},
			{
				"id": "dsh-worktime-board",
				"name": "牛马修仙看板",
				"nameEn": "Worktime Cultivation Board",
				"author": "spacexun2",
				"repo": "https://github.com/spacexun2/dsh-worktime-board",
				"description": "DeepSeek Harness 工时统计 × 修仙养成：日/周/月/学年四档汇总 agent 活跃时长、token、输入与工具调用，十二重境界（炼气→宇宙洪荒）量化进度，纯本地存储。",
				"descriptionEn": "Worktime statistics meets cultivation: daily / weekly / monthly / yearly agent activity, token, input and tool-call summaries with a twelve-realm progression (Qi Refining to Cosmic Chaos), fully local.",
				"npm": "dsh-worktime-board",
				"category": "utility"
			},
			{
				"id": "dsh-skill-explorer",
				"name": "技能中心（Skill Explorer）",
				"nameEn": "Skill Explorer",
				"author": "wingsky-1",
				"repo": "https://github.com/wingsky-1/dsh-skill-explorer",
				"description": "DSH 技能中心：按来源分级浏览已加载 skill（系统内置 / 项目 / 用户 / 自定义 / 运行时），支持启用/禁用、创建与删除（移入 .trash）。",
				"descriptionEn": "DSH skill center: browse loaded skills grouped by source (bundled / project / user / custom / runtime), with enable/disable, create and delete (move to .trash).",
				"npm": "@linxin666/dsh-client-ui-skill-explorer",
				"category": "tools"
			},
			{
				"id": "dsh-friendly-steps",
				"name": "过程精简 Friendly Steps",
				"nameEn": "Friendly Steps",
				"author": "dongwenxiu83-web",
				"repo": "https://github.com/dongwenxiu83-web/dsh-friendly-steps",
				"description": "面向文字工作者的过程精简：纯 CSS 折叠 Think / 工具调用等技术过程行，右下角浮条「已完成 N 步」一键展开收起，失败步骤红色计数反馈；不注入 React 列表、无全量扫描，零侵入。",
				"descriptionEn": "Writer-friendly process collapse: hides Think / tool-call rows via pure CSS behind a floating 'N steps done' pill with red failure counts and one-click expand/collapse. No foreign nodes in React lists, no full-DOM scans — zero interference.",
				"category": "ui"
			},
			{
				"id": "dsh-full-remote",
				"name": "全功能远程访问",
				"nameEn": "Full Remote Access",
				"author": "JUANWANG-BUAA",
				"repo": "https://github.com/JUANWANG-BUAA/dsh-full-remote",
				"description": "令牌门控反向代理：公网隧道或局域网下，在手机等设备上远程使用 DeepSeek Harness，设置、凭据与文件访问保持可用，支持按设备会话。",
				"descriptionEn": "Token-gated reverse proxy for remote access: use DeepSeek Harness over public tunnels or LAN from phones and other devices, with settings, credentials and file access kept working and per-device sessions.",
				"npm": "dsh-full-remote",
				"category": "integration"
			},
			{
				"id": "dsh-palate",
				"name": "Palate 品味训练",
				"nameEn": "Palate Design Taste",
				"author": "guo6x",
				"repo": "https://github.com/guo6x/dsh-palate",
				"description": "会长大的眼：可积累的设计品味语料库（好/坏例子 + 编码原则），喂得越多评审越准；6 个 palate_* 工具（review/add/learn/list/principles/stats）+ 成长面板，node:sqlite + 人可读 Markdown 镜像，零运行时依赖。",
				"descriptionEn": "An eye that grows: an accumulated design-taste corpus (good/bad examples plus codified principles) that sharpens with every example you feed; six palate_* tools (review/add/learn/list/principles/stats) plus a growth panel, node:sqlite with human-readable Markdown mirrors, zero runtime dependencies.",
				"category": "knowledge"
			},
			{
				"id": "dsh-archive-manager",
				"name": "归档管理",
				"nameEn": "Archive Manager",
				"author": "z953218350",
				"repo": "https://github.com/z953218350/dsh-archive-manager",
				"description": "设置页 Codex 风格会话归档管理：按项目分组、搜索筛选、预览对话内容、一键恢复与彻底物理删除，内置 zstd 解压引擎。",
				"descriptionEn": "Codex-style archived session manager in settings: group by project, search and filter, preview conversation history, restore to sidebar, and permanently delete from disk; built-in zstd decompression.",
				"npm": "@mlgbnb/dsh-archive-manager",
				"category": "utility"
			},
			{
				"id": "dsh-history-tree",
				"name": "历史树",
				"nameEn": "History Tree",
				"author": "z953218350",
				"repo": "https://github.com/z953218350/dsh-history-tree",
				"description": "在聊天消息左侧提供 Codex 风格对话轮次时间线点阵与悬浮历史概览卡片，支持鱼眼放大动效与点击直达对应轮次。",
				"descriptionEn": "Codex-style conversation turn timeline rail and hover overview cards beside chat messages, with fish-eye magnification and click-to-jump navigation.",
				"npm": "dsh-history-tree",
				"category": "ui"
			},
			{
				"id": "dsh-gzip",
				"name": "dsh-gzip",
				"nameEn": "dsh-gzip",
				"author": "wingsky-1",
				"repo": "https://github.com/wingsky-1/dsh-plugin-hub/tree/main/packages/dsh-gzip",
				"description": "/api 响应 gzip 压缩插件：为远程 / 低带宽链路开启 /api 响应压缩，解决会话历史因大响应无压缩而超时加载失败的问题；SSE / zip / 已编码响应自动豁免，无全局副作用。",
				"descriptionEn": "API response gzip plugin for DSH Web GUI: enables gzip on /api responses for remote / low-bandwidth links, fixing session-history loads that fail on the timeout of large uncompressed responses; SSE, zip and already-encoded responses are passed through untouched, with no global side effects.",
				"npm": "@wingsky-1/dsh-gzip"
			},
			{
				"id": "dsh-wsl-bridge",
				"name": "WSL Windows 桥",
				"nameEn": "WSL Windows Bridge",
				"author": "ch1bug",
				"repo": "https://github.com/ch1bug/dsh-wsl-bridge",
				"description": "让 WSL 里的 agent 访问 Windows 侧：读写 C:\\ 文件、运行 .exe、Explorer 打开、wslpath 路径互转与盘符枚举（win_ls/read/write/run/open/path/drives）。",
				"descriptionEn": "Lets a WSL agent reach the Windows host: read/write C:\\ files, run .exe programs, open in Explorer, convert paths via wslpath and list drives (win_ls/read/write/run/open/path/drives).",
				"category": "integration"
			},
			{
				"id": "dsh-mimo-agent-tools",
				"name": "MiMo 多模态工具",
				"nameEn": "MiMo Multimodal Tools",
				"author": "ch1bug",
				"repo": "https://github.com/ch1bug/dsh-mimo-agent-tools",
				"description": "把小米 MiMo API 封装为 agent 工具：联网搜索、图像/音频/视频理解、语音转写、语音合成与音色克隆（mimo_search/vision/audio/video/asr/tts/voiceclone）。",
				"descriptionEn": "Turns the Xiaomi MiMo API into agent tools: web search, image/audio/video understanding, speech-to-text, text-to-speech and voice cloning (mimo_search/vision/audio/video/asr/tts/voiceclone).",
				"category": "tools"
			},
			{
				"id": "dsh-skill-fuzzy",
				"name": "技能模糊搜索",
				"nameEn": "Skill Fuzzy Search",
				"author": "ch1bug",
				"repo": "https://github.com/ch1bug/dsh-skill-fuzzy",
				"description": "Codex 风格模糊技能搜索：/bug、/diag、/regression 都能在 / 技能菜单里命中 diagnosing-bugs（名称子序列 + 描述连续子串匹配）。",
				"descriptionEn": "Codex-style fuzzy skill search: /bug, /diag and /regression all find diagnosing-bugs in the / skill menu (name subsequence + description substring matching).",
				"category": "ui"
			},
			{
				"id": "dsh-secret-redactor",
				"name": "敏感信息脱敏",
				"nameEn": "Secret Redactor",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-secret-redactor",
				"description": "自动掩码工具输出中的 API key、token、JWT、私钥与配置密钥。",
				"descriptionEn": "Auto-masks API keys, tokens, JWTs and private keys in tool results shown to the model."
			},
			{
				"id": "dsh-approve-for-me",
				"name": "自动审批审核",
				"nameEn": "Approve for Me",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-approve-for-me",
				"description": "只读工具自动放行、危险命令自动拒绝，可配置全自动模式。",
				"descriptionEn": "Auto-approves read-only tools, auto-denies dangerous commands, optional full-auto mode."
			},
			{
				"id": "dsh-mcp-client-v2",
				"name": "MCP 客户端 v2",
				"nameEn": "MCP Client v2",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-mcp-client-v2",
				"description": "MCP 客户端增强：分页工具发现、非阻塞启动、工具搜索。",
				"descriptionEn": "Enhanced MCP client: paginated tool discovery, non-blocking startup, tool search."
			},
			{
				"id": "dsh-memories",
				"name": "项目记忆",
				"nameEn": "Project Memories",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-memories",
				"description": "按项目作用域持久化的键值记忆，支持增删查列与搜索。",
				"descriptionEn": "Project-scoped persistent key-value memories with set/get/list/delete/search."
			},
			{
				"id": "dsh-system-proxy",
				"name": "系统代理",
				"nameEn": "System Proxy",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-system-proxy",
				"description": "检测系统代理（scutil/环境变量/PAC）并为子进程导出代理环境变量。",
				"descriptionEn": "Detects system proxy (scutil/env/PAC) and exports proxy env for child processes."
			},
			{
				"id": "dsh-usage-cost",
				"name": "用量成本提醒",
				"nameEn": "Usage & Cost",
				"author": "DamonKoy",
				"repo": "https://github.com/DamonKoy/dsh-plugins/tree/main/packages/dsh-usage-cost",
				"description": "统计会话与每日 token 用量和估算成本，超预算提醒。",
				"descriptionEn": "Tracks token usage and estimated cost per session/day with budget alerts."
			},
			{
				"id": "dsh-notifier",
				"name": "dsh-notifier",
				"nameEn": "dsh-notifier",
				"author": "wingsky-1",
				"repo": "https://github.com/wingsky-1/dsh-plugin-hub/tree/main/packages/dsh-notifier",
				"description": "审批/完成/错误事件通知：浏览器 Notification + 系统原生 toast（Windows PowerShell WinRT / Linux·macOS notify-send，零依赖）；提示音可配、错误同类合并、免打扰时段、通知历史与配置面板；非安全上下文自动降级横幅。",
				"descriptionEn": "Approval / completion / error event notifications: browser Notification API plus native OS toasts (Windows PowerShell WinRT, Linux and macOS notify-send, zero dependencies); configurable sound, error merging, quiet hours, notification history and a settings panel; falls back to in-page banners outside secure contexts.",
				"npm": "@wingsky-1/dsh-notifier",
				"category": "utility"
			},
			{
				"id": "dsh-logicprobe",
				"name": "逻辑探针",
				"nameEn": "Logic Probe",
				"author": "AmethystLuna",
				"repo": "https://github.com/AmethystLuna/logicprobe",
				"description": "AI 智能体声明核查技能：枚举设计文档与重构计划中的每个可验证声明，对照代码库事实逐条核验；行为类声明升级为逻辑原语验证（7 项结构检查 + 7 项对抗探针），重构前后模型对比做回归检测，输出 file:line 证据。",
				"descriptionEn": "Claim verification for AI coding agents: enumerate every verifiable claim in design docs and refactoring plans, verify against codebase facts, then escalate behavioral claims to logic-primitive verification (7 structural checks + 7 adversarial probes), with before/after model comparison for refactoring regression detection.",
				"category": "tools"
			},
			{
				"id": "dsh-session-delete",
				"name": "会话删除",
				"nameEn": "Session Delete",
				"author": "xohmai",
				"repo": "https://github.com/xohmai/dsh-session-delete",
				"description": "真正删除会话磁盘日志：归档清理、批量删除、回收站还原；官方归档只隐藏不删盘。",
				"descriptionEn": "Real session deletion with trash and restore, archived cleanup and batch delete. Official archive only hides sessions.",
				"category": "utility"
			},
			{
				"id": "dsh-chatgpt-subscription",
				"name": "子代理管理",
				"nameEn": "Subagent Management",
				"author": "Aa728848",
				"repo": "https://github.com/Aa728848/dsh-chatgpt-subscription",
				"description": "让 DSH 通过 ChatGPT 订阅使用 GPT 系列模型：PKCE OAuth 登录、DPAPI/钥匙串/0600 凭据存储、流式 Responses、图片生成、Codex 搜索、额度展示与子代理管理。",
				"descriptionEn": "Use GPT models in DSH through your ChatGPT subscription: PKCE OAuth login, DPAPI/keychain/0600 credential storage, streaming Responses, image generation, Codex search, quota display and subagent management.",
				"npm": "@eddyskywalker/dsh-chatgpt-subscription",
				"category": "integration"
			}
		];
		//#endregion
		//#region src/client/community-guard.ts
		/**
		* Runtime guard for the generated community index entries. The index is
		* build-time generated data, but the card renders whatever the module
		* carries; a hand-written narrowing keeps one malformed entry from breaking
		* the whole list at render time.
		*/
		/** Category ids the card knows how to label; others are treated as uncategorized. */
		const KNOWN_CATEGORIES = COMMUNITY_CATEGORIES;
		/**
		* The install command is pasted into a shell, so repo/npm must be free of
		* shell metacharacters: repo is a plain https URL of path-safe characters,
		* npm a standard (optionally scoped) package name.
		*/
		const REPO_SAFE_RE = /^https:\/\/[A-Za-z0-9._~\/-]+$/;
		const NPM_SAFE_RE = /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
		/** True when the value is a well-formed community plugin entry. */
		function isCommunityPluginEntry(value) {
			if (typeof value !== "object" || value === null) return false;
			const entry = value;
			if (typeof entry.id !== "string" || entry.id === "") return false;
			if (typeof entry.name !== "string" || typeof entry.nameEn !== "string") return false;
			if (typeof entry.author !== "string" || entry.author === "") return false;
			if (typeof entry.repo !== "string" || !REPO_SAFE_RE.test(entry.repo)) return false;
			if (entry.description !== void 0 && typeof entry.description !== "string") return false;
			if (entry.descriptionEn !== void 0 && typeof entry.descriptionEn !== "string") return false;
			if (entry.npm !== void 0 && (typeof entry.npm !== "string" || !NPM_SAFE_RE.test(entry.npm))) return false;
			if (entry.category !== void 0 && (typeof entry.category !== "string" || !KNOWN_CATEGORIES.includes(entry.category))) return false;
			return true;
		}
		//#endregion
		//#region src/client/plugin-manager-bridge.ts
		let snapshot = {
			face: null,
			version: 0
		};
		const listeners = /* @__PURE__ */ new Set();
		/** Replace the held face and notify subscribers. */
		function setFace(face) {
			snapshot = {
				face,
				version: snapshot.version + 1
			};
			for (const listener of listeners) listener();
		}
		/** Current bridge snapshot (cached reference, safe for useSyncExternalStore). */
		function getPluginManagerSnapshot() {
			return snapshot;
		}
		/** Subscribe to face changes; returns the unsubscribe function. */
		function subscribePluginManager(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		/**
		* Bridge the optional 'pluginManager' service into the module store. Uses
		* ctx.inject (NOT the plugin's module-level inject array) so the service
		* stays optional: the inner callback runs when the sibling plugin provides
		* the face and is disposed when it goes away, which clears the store.
		* @param ctx - the client root context.
		*/
		function bridgePluginManager(ctx) {
			ctx.inject(["pluginManager"], (inner) => {
				inner.effect(() => {
					setFace(inner.pluginManager ?? null);
					return () => {
						setFace(null);
					};
				}, "community-plugins: pluginManager bridge");
			});
		}
		//#endregion
		//#region src/client/install-source.ts
		/**
		* The spec handed to pluginManager.install(): the npm package name when the
		* entry is published there, else the repository URL (git install).
		* @param entry - the community index entry.
		* @returns the install spec.
		*/
		function installSpec(entry) {
			return entry.npm ?? entry.repo;
		}
		/**
		* Normalize a git remote for comparison: lowercase, drop the transport
		* prefix ('git+' wrapper, 'https://', 'http://', 'git://', 'ssh://git@', the
		* scp-style 'git@host:' userinfo, and the pnpm host shorthands 'github:' /
		* 'gitlab:' / 'bitbucket:' that package.json records for shorthand installs),
		* then strip trailing slashes and one trailing '.git'
		* suffix (repeated, so 'x/.git/' and 'x.git' converge). Conservative on
		* purpose: no path rewriting beyond those steps, so distinct repositories
		* never collapse onto each other.
		* @param url - the repository URL as recorded by either side.
		* @returns the comparison key.
		*/
		function normalizeGitUrl(url) {
			let key = url.trim().toLowerCase();
			key = key.replace(/^git[+]/, "");
			key = key.replace(/^(github|gitlab):/, "$1.com/");
			key = key.replace(/^bitbucket:/, "bitbucket.org/");
			key = key.replace(/^(?:https?|git):[/][/]/, "");
			key = key.replace(/^ssh:[/][/]git@/, "");
			key = key.replace(/^git@([^/:]+):/, "$1/");
			for (;;) {
				const next = key.replace(/[/]+$/, "").replace(/[.]git$/, "");
				if (next === key) return key;
				key = next;
			}
		}
		/**
		* Match one community entry against the installed snapshot. npm-published
		* entries match on the installed row's package identity (id/name): the npm
		* source spec records the dependency RANGE ('^0.3.2') or an install-time
		* spec, not necessarily the bare package name, so it is only a fallback.
		* Repository entries match on the normalized git URL. An entry with an npm
		* field ONLY matches npm installs — a same-repository git install is a
		* different source and stays unmatched (the card then offers install, which
		* the host reconciles).
		* @param entry - the community index entry.
		* @param installed - the installed snapshot from the pluginManager service.
		* @returns the matching installed row, or null.
		*/
		function entryInstalled(entry, installed) {
			if (entry.npm !== void 0) return installed.find((item) => item.source.kind === "npm" && (item.id === entry.npm || item.name === entry.npm || item.source.spec === entry.npm)) ?? null;
			const key = normalizeGitUrl(entry.repo);
			return installed.find((item) => item.source.kind === "git" && normalizeGitUrl(item.source.spec) === key) ?? null;
		}
		//#endregion
		//#region \0dsh-css:packages/dsh-community-plugins/src/client/community.module.css.mjs
		const css = ".z0J_8a_sectionList{margin:0;padding:0;list-style:none}.z0J_8a_market{flex-direction:column;gap:10px;margin-top:12px;display:flex}.z0J_8a_toolbar{display:flex}.z0J_8a_search{min-width:0;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;flex:1;padding:6px 10px;font-size:13px;line-height:1.5}.z0J_8a_search::placeholder{color:var(--dsw-alias-label-tertiary)}.z0J_8a_search:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.z0J_8a_search:disabled{opacity:.5}.z0J_8a_filters{flex-wrap:wrap;gap:6px;display:flex}.z0J_8a_pill{font:inherit;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);cursor:pointer;border-radius:999px;padding:2px 10px;font-size:12px;line-height:1.6}.z0J_8a_pill:hover:enabled{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.z0J_8a_pill:disabled{opacity:.5;cursor:default}.z0J_8a_pillActive{color:var(--dsw-alias-bg-layer-3);background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);font-weight:600}.z0J_8a_pillActive:hover:enabled{color:var(--dsw-alias-bg-layer-3);border-color:var(--dsw-alias-label-primary)}.z0J_8a_resultCount{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.4}.z0J_8a_grid{grid-template-columns:repeat(auto-fill,minmax(256px,1fr));gap:8px;margin:0;padding:0;list-style:none;display:grid}.z0J_8a_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;flex-direction:column;gap:6px;min-width:0;padding:12px;display:flex}.z0J_8a_card:hover{border-color:var(--dsw-alias-label-dimmed)}.z0J_8a_cardHead{justify-content:space-between;align-items:baseline;gap:8px;min-width:0;display:flex}.z0J_8a_cardBadges{flex:none;align-items:center;gap:4px;min-width:0;display:flex}.z0J_8a_cardName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-weight:600;overflow:hidden}.z0J_8a_badge{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;border-radius:999px;flex:none;padding:0 8px;font-size:11px;line-height:1.6}.z0J_8a_badgePublished{color:var(--dsw-alias-link-primary,var(--dsw-alias-button-info-fill));border-color:var(--dsw-alias-link-primary,var(--dsw-alias-button-info-fill))}.z0J_8a_badgeInstalled{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed);background:var(--dsw-alias-bg-layer-2)}.z0J_8a_cardMeta{min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;gap:6px;margin:0;font-size:12px;line-height:1.4;display:flex}.z0J_8a_cardCategory{color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none}.z0J_8a_cardDot{flex:none}.z0J_8a_cardAuthor{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.z0J_8a_cardDescription{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;overflow-wrap:anywhere;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:1.45;display:-webkit-box;overflow:hidden}.z0J_8a_cardFooter{flex-direction:column;gap:6px;margin-top:auto;padding-top:6px;display:flex}.z0J_8a_cardTop{justify-content:space-between;align-items:center;gap:8px;min-width:0;display:flex}.z0J_8a_cardLink{color:var(--dsw-alias-link-primary,var(--dsw-alias-button-info-fill));font-size:13px;text-decoration:none}.z0J_8a_cardLink:hover{text-decoration:underline}.z0J_8a_cardCommand{box-sizing:border-box;width:100%;min-width:0;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;text-overflow:ellipsis;border-radius:4px;padding:2px 6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden}.z0J_8a_installButton{font:inherit;color:var(--dsw-alias-bg-layer-3);background:var(--dsw-alias-button-info-fill);border:1px solid var(--dsw-alias-button-info-fill);cursor:pointer;white-space:nowrap;border-radius:6px;flex:none;padding:4px 12px;font-size:12px;font-weight:600;line-height:1.5}.z0J_8a_installButton:hover:enabled{opacity:.88}.z0J_8a_installButton:disabled{opacity:.5;cursor:default}.z0J_8a_installButtonCopied{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed);background:0 0}.z0J_8a_installButtonSecondary{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2);background:0 0}.z0J_8a_installButtonSecondary:hover:enabled{border-color:var(--dsw-alias-label-dimmed)}.z0J_8a_cardActions{flex:none;align-items:center;gap:6px;display:flex}.z0J_8a_progress{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.4}.z0J_8a_error{color:var(--dsw-alias-label-error,#c53030);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:1.4}.z0J_8a_confirmBody{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.5}.z0J_8a_modalActions{justify-content:flex-end;gap:8px;margin-top:16px;display:flex}.z0J_8a_dangerButton{background:var(--dsw-alias-label-error,#c53030);border-color:var(--dsw-alias-label-error,#c53030)}.z0J_8a_installNote{color:var(--dsw-alias-label-tertiary);margin:8px 2px 0;font-size:12px;line-height:1.4}.z0J_8a_empty{color:var(--dsw-alias-label-tertiary);margin:0;padding:8px 2px;font-size:13px}.z0J_8a_off{color:var(--dsw-alias-label-tertiary);margin:8px 2px 0;font-size:13px}.z0J_8a_notice{color:var(--dsw-alias-label-tertiary);margin:10px 2px 0;font-size:12px;line-height:1.4}";
		const tagId = "@dsh-selfuse/web-ui-community-plugins/community.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-selfuse/web-ui-community-plugins";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var community_module_css_default = {
			"badge": "z0J_8a_badge",
			"badgeInstalled": "z0J_8a_badgeInstalled",
			"badgePublished": "z0J_8a_badgePublished",
			"card": "z0J_8a_card",
			"cardActions": "z0J_8a_cardActions",
			"cardAuthor": "z0J_8a_cardAuthor",
			"cardBadges": "z0J_8a_cardBadges",
			"cardCategory": "z0J_8a_cardCategory",
			"cardCommand": "z0J_8a_cardCommand",
			"cardDescription": "z0J_8a_cardDescription",
			"cardDot": "z0J_8a_cardDot",
			"cardFooter": "z0J_8a_cardFooter",
			"cardHead": "z0J_8a_cardHead",
			"cardLink": "z0J_8a_cardLink",
			"cardMeta": "z0J_8a_cardMeta",
			"cardName": "z0J_8a_cardName",
			"cardTop": "z0J_8a_cardTop",
			"confirmBody": "z0J_8a_confirmBody",
			"dangerButton": "z0J_8a_dangerButton",
			"empty": "z0J_8a_empty",
			"error": "z0J_8a_error",
			"filters": "z0J_8a_filters",
			"grid": "z0J_8a_grid",
			"installButton": "z0J_8a_installButton",
			"installButtonCopied": "z0J_8a_installButtonCopied",
			"installButtonSecondary": "z0J_8a_installButtonSecondary",
			"installNote": "z0J_8a_installNote",
			"market": "z0J_8a_market",
			"modalActions": "z0J_8a_modalActions",
			"notice": "z0J_8a_notice",
			"off": "z0J_8a_off",
			"pill": "z0J_8a_pill",
			"pillActive": "z0J_8a_pillActive",
			"progress": "z0J_8a_progress",
			"resultCount": "z0J_8a_resultCount",
			"search": "z0J_8a_search",
			"sectionList": "z0J_8a_sectionList",
			"toolbar": "z0J_8a_toolbar"
		};
		//#endregion
		//#region src/client/CommunityPluginsCard.tsx
		/**
		* The community plugin index card: a first-level settings section that is
		* always open. Its own enable switch (backed by the community-plugins
		* settings namespace) gates the list, which is presented marketplace-style:
		* a search box, category filter pills with counts, and a two-column card grid
		* whose entries link to contributors' own repositories — this package only
		* indexes them, it never vendors their code.
		*/
		/** Bridges the community-plugins scope onto the card's staged form. */
		var CommunityPluginsCardController = class {
			form;
			store;
			/** @param scope - the bound settings scope for the community-plugins namespace. */
			constructor(scope) {
				this.form = new CardForm(scope, [booleanField("enabled")]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					enabled: this.form.field("enabled")
				};
			}
			/**
			* Build the face the card's slot registration injects.
			* @returns the card's snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { communityPluginsCard: this.store },
					...this.form.actions()
				};
			}
			/**
			* Release the card's scope subscription and bound stores; the slot
			* disposer calls this on teardown.
			*/
			dispose() {
				this.form.dispose();
			}
		};
		/** The one-line install command for an entry: npm package when published, else the contributor repository URL. */
		function installCommand(entry) {
			return `dsh plugin --profile web add ${entry.npm ?? entry.repo}`;
		}
		/** Progress polling cadence while an install is in flight. */
		const PROGRESS_POLL_MS = 500;
		/** Extract a displayable reason from an install/uninstall rejection. */
		function messageOf(reason) {
			return reason instanceof Error ? reason.message : String(reason);
		}
		/**
		* Localized entry copy read through the card's `t`. Falls back to the raw
		* entry field when the key is missing — the dictionary only carries the
		* generated registry, so injected test entries land on the fallback.
		*/
		function entryCopy(t, key, fallback) {
			const value = t(key);
			return value === key ? fallback : value;
		}
		/** Maps a category id onto its locale dictionary key (kept in the generated union). */
		const CATEGORY_KEY = {
			ui: "category.ui",
			agent: "category.agent",
			tools: "category.tools",
			knowledge: "category.knowledge",
			integration: "category.integration",
			security: "category.security",
			utility: "category.utility"
		};
		/**
		* Render the community plugin index card.
		* @param props - locale copy, the card snapshot, its form actions, and the
		*   (default-generated) entry list.
		* @returns the card.
		*/
		function CommunityPluginsCard(props) {
			const { t } = props;
			const state = props.useCommunityPluginsCard((snapshot) => snapshot);
			const plugins = (0, react.useMemo)(() => (props.plugins ?? COMMUNITY_PLUGINS).filter(isCommunityPluginEntry), [props.plugins]);
			const [query, setQuery] = (0, react.useState)("");
			const [category, setCategory] = (0, react.useState)(null);
			const [copiedId, setCopiedId] = (0, react.useState)(null);
			const bridge = (0, react.useSyncExternalStore)(subscribePluginManager, getPluginManagerSnapshot);
			const face = props.pluginManager !== void 0 ? props.pluginManager : bridge.face;
			const faceLoopback = face !== null && face.isLoopback;
			const faceLifetime = (0, react.useMemo)(() => ({ active: true }), [face, props.pluginManager !== void 0 ? face : bridge.version]);
			(0, react.useLayoutEffect)(() => {
				faceLifetime.active = true;
				return () => {
					faceLifetime.active = false;
				};
			}, [faceLifetime]);
			const [installed, setInstalled] = (0, react.useState)(null);
			const [pending, setPending] = (0, react.useState)(null);
			const [progress, setProgress] = (0, react.useState)(null);
			const [errors, setErrors] = (0, react.useState)({});
			const [uninstallTarget, setUninstallTarget] = (0, react.useState)(null);
			const listRequestRef = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				setPending(null);
				setProgress(null);
				setErrors({});
				setUninstallTarget(null);
				listRequestRef.current += 1;
				if (face === null || !face.isLoopback) {
					setInstalled(null);
					return;
				}
				let alive = true;
				const refresh = () => {
					const request = ++listRequestRef.current;
					face.list().then((list) => {
						if (alive && faceLifetime.active && request === listRequestRef.current) setInstalled(list);
					}, () => {});
				};
				refresh();
				const unsubscribe = face.onChange(refresh);
				return () => {
					alive = false;
					unsubscribe();
				};
			}, [
				face,
				faceLoopback,
				faceLifetime
			]);
			(0, react.useEffect)(() => {
				if (face === null || pending?.kind !== "install") {
					setProgress(null);
					return;
				}
				let alive = true;
				const poll = () => {
					face.status().then((item) => {
						if (alive && faceLifetime.active) setProgress(item);
					}, () => {});
				};
				poll();
				const timer = setInterval(poll, PROGRESS_POLL_MS);
				return () => {
					alive = false;
					clearInterval(timer);
				};
			}, [
				face,
				faceLifetime,
				pending?.kind === "install"
			]);
			const clearError = (id) => {
				setErrors((previous) => {
					if (!(id in previous)) return previous;
					const next = { ...previous };
					delete next[id];
					return next;
				});
			};
			const onInstall = (entry) => {
				if (face === null || !face.isLoopback || pending !== null) return;
				const lifetime = faceLifetime;
				clearError(entry.id);
				setPending({
					kind: "install",
					id: entry.id
				});
				(async () => {
					try {
						await face.install(installSpec(entry));
						if (!lifetime.active) return;
						const request = ++listRequestRef.current;
						const list = await face.list().catch(() => void 0);
						if (lifetime.active && list !== void 0 && request === listRequestRef.current) setInstalled(list);
					} catch (reason) {
						if (!lifetime.active) return;
						setErrors((previous) => ({
							...previous,
							[entry.id]: t("installFailed", { reason: messageOf(reason) })
						}));
					} finally {
						if (lifetime.active) setPending(null);
					}
				})();
			};
			const onUninstallConfirm = () => {
				const target = uninstallTarget;
				if (face === null || target === null || pending !== null) return;
				const item = entryInstalled(target, installed ?? []);
				clearError(target.id);
				if (item === null) {
					setUninstallTarget(null);
					return;
				}
				const lifetime = faceLifetime;
				setPending({
					kind: "uninstall",
					id: target.id
				});
				face.uninstall(item.id).then((list) => {
					if (!lifetime.active) return;
					listRequestRef.current += 1;
					setInstalled(list);
					setUninstallTarget(null);
				}, (reason) => {
					if (!lifetime.active) return;
					setErrors((previous) => ({
						...previous,
						[target.id]: t("uninstallFailed", { reason: messageOf(reason) })
					}));
					setUninstallTarget(null);
				}).finally(() => {
					if (lifetime.active) setPending(null);
				});
			};
			const copyCommand = (id, command) => {
				const mark = () => {
					setCopiedId(id);
				};
				const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : void 0;
				if (clipboard?.writeText !== void 0) {
					clipboard.writeText(command).then(mark, mark);
					return;
				}
				try {
					const area = document.createElement("textarea");
					area.value = command;
					area.setAttribute("readonly", "");
					area.style.position = "fixed";
					area.style.opacity = "0";
					document.body.append(area);
					area.select();
					document.execCommand("copy");
					area.remove();
				} catch {}
				mark();
			};
			const disabled = !state.writable;
			const mutationsDisabled = disabled || pending !== null;
			const visible = state.enabled.text !== "false";
			const fieldProps = {
				overriddenLabel: t("settings.overridden"),
				resetLabel: t("settings.reset"),
				invalidLabel: t("settings.invalidNumber"),
				disabled
			};
			const categoryCounts = (0, react.useMemo)(() => {
				const counts = /* @__PURE__ */ new Map();
				for (const plugin of plugins) if (plugin.category) counts.set(plugin.category, (counts.get(plugin.category) ?? 0) + 1);
				return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
			}, [plugins]);
			const visiblePlugins = (0, react.useMemo)(() => {
				const needle = query.trim().toLowerCase();
				return plugins.filter((plugin) => {
					if (category !== null && plugin.category !== category) return false;
					if (!needle) return true;
					const categoryLabel = plugin.category ? t(CATEGORY_KEY[plugin.category]) : "";
					return [
						plugin.name,
						plugin.nameEn,
						plugin.author,
						plugin.description,
						plugin.descriptionEn,
						plugin.npm ?? "",
						categoryLabel
					].join(" ").toLowerCase().includes(needle);
				});
			}, [
				plugins,
				query,
				category,
				t
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(PluginSettingsCard, {
				t,
				titleKey: "settings.title",
				descriptionKey: "settings.description",
				state,
				alwaysOpen: true,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BooleanField, {
						id: "settings-community-enabled",
						label: t("settings.enabled"),
						hint: t("settings.enabledHint"),
						inheritLabel: t("settings.inherit"),
						onLabel: t("settings.on"),
						offLabel: t("settings.off"),
						...fieldProps,
						...state.enabled,
						onEdit: (text) => {
							props.edit("enabled", text);
						},
						onReset: () => {
							props.resetField("enabled");
						}
					}),
					visible ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: community_module_css_default.market,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: community_module_css_default.toolbar,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									id: "settings-community-search",
									className: community_module_css_default.search,
									type: "search",
									placeholder: t("search.placeholder"),
									"aria-label": t("search.label"),
									value: query,
									disabled,
									onChange: (event) => {
										setQuery(event.target.value);
									}
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: community_module_css_default.filters,
								role: "group",
								"aria-label": t("filter.all"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: category === null ? `${community_module_css_default.pill} ${community_module_css_default.pillActive}` : community_module_css_default.pill,
									"aria-pressed": category === null,
									disabled,
									onClick: () => {
										setCategory(null);
									},
									children: [
										t("filter.all"),
										" ",
										plugins.length
									]
								}), categoryCounts.map(([id, count]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: category === id ? `${community_module_css_default.pill} ${community_module_css_default.pillActive}` : community_module_css_default.pill,
									"aria-pressed": category === id,
									disabled,
									onClick: () => {
										setCategory(category === id ? null : id);
									},
									children: [
										t(CATEGORY_KEY[id]),
										" ",
										count
									]
								}, id))]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: community_module_css_default.resultCount,
								role: "status",
								children: t("result.count", {
									shown: visiblePlugins.length,
									total: plugins.length
								})
							}),
							plugins.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: community_module_css_default.empty,
								role: "status",
								children: t("empty")
							}) : visiblePlugins.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: community_module_css_default.empty,
								role: "status",
								children: t("noMatch")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: community_module_css_default.grid,
								children: visiblePlugins.map((plugin) => {
									const command = installCommand(plugin);
									const copied = copiedId === plugin.id;
									const name = entryCopy(t, `name.${plugin.id}`, plugin.nameEn || plugin.name);
									const description = entryCopy(t, `desc.${plugin.id}`, plugin.descriptionEn ?? plugin.description ?? "");
									const installedItem = faceLoopback ? entryInstalled(plugin, installed ?? []) : null;
									const isInstalling = pending?.kind === "install" && pending.id === plugin.id;
									const isUninstalling = pending?.kind === "uninstall" && pending.id === plugin.id;
									const error = errors[plugin.id];
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										className: community_module_css_default.card,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: community_module_css_default.cardHead,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: community_module_css_default.cardName,
													title: name,
													children: name
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: community_module_css_default.cardBadges,
													children: [installedItem !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: `${community_module_css_default.badge} ${community_module_css_default.badgeInstalled}`,
														children: t("badge.installed")
													}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: plugin.npm ? `${community_module_css_default.badge} ${community_module_css_default.badgePublished}` : community_module_css_default.badge,
														title: plugin.npm ?? plugin.repo,
														children: plugin.npm ? t("badge.published") : t("badge.source")
													})]
												})]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: community_module_css_default.cardMeta,
												children: [
													plugin.category ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: community_module_css_default.cardCategory,
														children: t(CATEGORY_KEY[plugin.category])
													}) : null,
													plugin.category ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: community_module_css_default.cardDot,
														"aria-hidden": "true",
														children: "·"
													}) : null,
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: community_module_css_default.cardAuthor,
														title: plugin.author,
														children: plugin.author
													})
												]
											}),
											description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: community_module_css_default.cardDescription,
												children: description
											}) : null,
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: community_module_css_default.cardFooter,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: community_module_css_default.cardTop,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
															className: community_module_css_default.cardLink,
															href: plugin.repo,
															target: "_blank",
															rel: "noreferrer",
															children: t("repository")
														}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
															className: community_module_css_default.cardActions,
															children: [
																/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																	type: "button",
																	className: copied ? `${community_module_css_default.installButton} ${community_module_css_default.installButtonCopied}` : faceLoopback ? `${community_module_css_default.installButton} ${community_module_css_default.installButtonSecondary}` : community_module_css_default.installButton,
																	title: command,
																	onClick: () => {
																		copyCommand(plugin.id, command);
																	},
																	children: copied ? t("copied") : t("install")
																}),
																faceLoopback && installedItem === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																	type: "button",
																	className: community_module_css_default.installButton,
																	disabled: mutationsDisabled,
																	onClick: () => {
																		onInstall(plugin);
																	},
																	children: isInstalling ? t("installing") : t("installNow")
																}) : null,
																faceLoopback && installedItem !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																	type: "button",
																	className: `${community_module_css_default.installButton} ${community_module_css_default.installButtonSecondary}`,
																	disabled: mutationsDisabled,
																	onClick: () => {
																		setUninstallTarget(plugin);
																	},
																	children: isUninstalling ? t("uninstalling") : t("uninstall")
																}) : null
															]
														})]
													}),
													isInstalling ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
														className: community_module_css_default.progress,
														role: "status",
														children: progress !== null && progress.kind !== "idle" ? t(`progress.${progress.stage}`) : t("installing")
													}) : null,
													error !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
														className: community_module_css_default.error,
														role: "alert",
														children: error
													}) : null,
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
														className: community_module_css_default.cardCommand,
														title: command,
														children: command
													})
												]
											})
										]
									}, plugin.id);
								})
							})
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: community_module_css_default.off,
						role: "status",
						children: t("off")
					}),
					face === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: community_module_css_default.installNote,
						role: "note",
						children: t("managerHint")
					}) : face.isLoopback ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: community_module_css_default.installNote,
						role: "note",
						children: t("remoteHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: community_module_css_default.installNote,
						role: "note",
						children: t("installHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: community_module_css_default.notice,
						role: "note",
						children: t("notice")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: uninstallTarget !== null,
						onClose: () => {
							if (pending === null) setUninstallTarget(null);
						},
						title: t("uninstallConfirm.title"),
						closeLabel: t("cancel"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: community_module_css_default.confirmBody,
							children: t("uninstallConfirm.body", { name: uninstallTarget === null ? "" : entryCopy(t, `name.${uninstallTarget.id}`, uninstallTarget.nameEn || uninstallTarget.name) })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: community_module_css_default.modalActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: pending !== null,
								onClick: () => {
									setUninstallTarget(null);
								},
								children: t("cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								className: community_module_css_default.dangerButton,
								disabled: pending !== null,
								onClick: onUninstallConfirm,
								children: pending?.kind === "uninstall" ? t("uninstalling") : t("uninstallConfirm.confirm")
							})]
						})]
					})
				]
			});
		}
		/** Render the community plugin index as a first-level settings page. */
		function CommunityPluginsSection(props) {
			const { t, useCommunityPluginsCard, save, discard, edit, resetField, plugins, pluginManager } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: community_module_css_default.sectionList,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommunityPluginsCard, {
					t,
					useCommunityPluginsCard,
					save,
					discard,
					edit,
					resetField,
					plugins,
					pluginManager
				})
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* The community-plugins locale dictionaries for the index card. Static copy
		* for the card chrome plus one localized name/description pair per index
		* entry (`name.<id>` / `desc.<id>`), so the card localizes data-driven text
		* through the same `t` the rest of the settings UI uses — the document
		* `<html lang>` attribute is not a reliable locale signal in the GUI.
		*/
		/** Simplified Chinese copy for the card chrome (the key-set source of truth). */
		const STATIC_ZH = {
			"settings.title": "社区插件",
			"settings.description": "社区贡献者开发与维护的插件，链接指向作者自己的仓库。",
			"settings.enabled": "启用社区插件索引",
			"settings.enabledHint": "此开关只控制索引列表的显示与否，关闭后在这里重新打开。",
			"settings.inherit": "继承",
			"settings.on": "开",
			"settings.off": "关",
			"settings.overridden": "已覆盖",
			"settings.reset": "恢复默认",
			"settings.notExposed": "当前 DSH 版本未向设置页暴露本插件的配置命名空间，表单不可用。可编辑 ~/.dsh/settings.yaml 直接配置，或为 dsh-host-apiproxy 的 WEB_SETTINGS_NAMESPACES 白名单补充本命名空间后重启。",
			"settings.readOnly": "当前部署的设置只读。",
			"settings.expand": "展开设置",
			"settings.collapse": "收起设置",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.discard": "放弃",
			"settings.unsaved": "未保存",
			"settings.saveFailed": "部署未接受这些值，已保留供你修改。",
			"settings.invalidNumber": "请输入数字，留空则使用默认值。",
			"author": "作者",
			"repository": "仓库",
			"copy": "复制",
			"copied": "已复制",
			"install": "复制安装命令",
			"installNow": "安装",
			"installing": "安装中…",
			"uninstall": "卸载",
			"uninstalling": "卸载中…",
			"cancel": "取消",
			"badge.installed": "已安装 · 重启后生效",
			"progress.fetch": "获取插件信息",
			"progress.download": "下载中",
			"progress.extract": "解压中",
			"progress.write": "写入中",
			"uninstallConfirm.title": "卸载插件",
			"uninstallConfirm.body": "确定要卸载 {name} 吗？移除将在重启 dsh web 后完全生效。",
			"uninstallConfirm.confirm": "确认卸载",
			"installFailed": "安装失败：{reason}",
			"uninstallFailed": "卸载失败：{reason}",
			"managerHint": "未检测到「插件管理器」插件：安装 @linxin666/dsh-client-ui-plugin-manager 后，可在本机浏览器中直接从这里安装与卸载。",
			"remoteHint": "当前是远程浏览器，界面内安装不可用；请在宿主机器的终端执行安装命令。",
			"noMatch": "没有匹配的社区插件。",
			"search.placeholder": "搜索名称、作者或简介",
			"search.label": "搜索社区插件",
			"filter.all": "全部",
			"result.count": "显示 {shown} / {total} 个",
			"badge.published": "npm 已发布",
			"badge.source": "仓库安装",
			"category.ui": "界面与体验",
			"category.agent": "Agent 与自动化",
			"category.tools": "开发者工具",
			"category.knowledge": "记忆与知识",
			"category.integration": "集成与分享",
			"category.security": "安全与运维",
			"category.utility": "实用工具",
			"installHint": "在本机浏览器且已安装「插件管理器」插件时，可直接点击卡片上的「安装 / 卸载」；否则复制安装命令到终端执行。安装与卸载在重启 dsh web 后生效，插件自带的开关与配置（若有）会出现在插件配置里。",
			"empty": "暂无社区插件登记。",
			"off": "社区插件索引已关闭。",
			"notice": "条目由贡献者自行登记，与 dsh-web-ui 的发布内容无关；使用前请自行评估。"
		};
		/** English copy for the card chrome, checked complete against the zh key set. */
		const STATIC_EN = {
			"settings.title": "Community Plugins",
			"settings.description": "Plugins developed and maintained by community contributors, linking to each author's own repository.",
			"settings.enabled": "Enable the community plugin index",
			"settings.enabledHint": "This switch only controls whether the index list is shown; turn it back on here.",
			"settings.inherit": "Inherit",
			"settings.on": "On",
			"settings.off": "Off",
			"settings.overridden": "Overridden",
			"settings.reset": "Reset to default",
			"settings.notExposed": "This DSH version does not expose this plugin's settings namespace to the configuration page, so the form is unavailable. Edit ~/.dsh/settings.yaml directly, or add the namespace to dsh-host-apiproxy's WEB_SETTINGS_NAMESPACES allowlist and restart.",
			"settings.readOnly": "This deployment stores settings read-only.",
			"settings.expand": "Show settings",
			"settings.collapse": "Hide settings",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.discard": "Discard",
			"settings.unsaved": "Unsaved",
			"settings.saveFailed": "The deployment did not accept these values; they were left for you to correct.",
			"settings.invalidNumber": "Enter a number, or leave blank to use the default.",
			"author": "Author",
			"repository": "Repository",
			"copy": "Copy",
			"copied": "Copied",
			"install": "Copy install command",
			"installNow": "Install",
			"installing": "Installing…",
			"uninstall": "Uninstall",
			"uninstalling": "Uninstalling…",
			"cancel": "Cancel",
			"badge.installed": "Installed · restart to take effect",
			"progress.fetch": "Fetching plugin info",
			"progress.download": "Downloading",
			"progress.extract": "Extracting",
			"progress.write": "Writing",
			"uninstallConfirm.title": "Uninstall plugin",
			"uninstallConfirm.body": "Uninstall {name}? The removal fully takes effect after restarting dsh web.",
			"uninstallConfirm.confirm": "Confirm uninstall",
			"installFailed": "Install failed: {reason}",
			"uninstallFailed": "Uninstall failed: {reason}",
			"managerHint": "The Plugin manager plugin is not detected: install @linxin666/dsh-client-ui-plugin-manager to install and uninstall entries directly from here in a local browser.",
			"remoteHint": "This is a remote browser, so in-GUI install is unavailable; run the install command in a terminal on the host machine.",
			"noMatch": "No matching community plugin found.",
			"search.placeholder": "Search name, author or description",
			"search.label": "Search community plugins",
			"filter.all": "All",
			"result.count": "Showing {shown} / {total}",
			"badge.published": "Published on npm",
			"badge.source": "Install from repo",
			"category.ui": "UI & Experience",
			"category.agent": "Agents & Automation",
			"category.tools": "Developer Tools",
			"category.knowledge": "Memory & Knowledge",
			"category.integration": "Integration & Sharing",
			"category.security": "Security & Ops",
			"category.utility": "Utilities",
			"installHint": "With the Plugin manager plugin present and a local browser, use the Install / Uninstall buttons on each card; otherwise copy the install command into a terminal. Installs and uninstalls take effect after restarting dsh web; once installed, the plugin provides its own switch and config (if any) in the plugin configuration section.",
			"empty": "No community plugins registered yet.",
			"off": "The community plugin index is turned off.",
			"notice": "Entries are contributed by their authors and are separate from dsh-web-ui releases; evaluate before use."
		};
		/** Build the runtime dictionary: static copy plus one localized name/description pair per index entry. */
		function build(base, lang) {
			const dict = { ...base };
			for (const entry of COMMUNITY_PLUGINS) {
				dict[`name.${entry.id}`] = lang === "zh" ? entry.name : entry.nameEn;
				dict[`desc.${entry.id}`] = lang === "zh" ? entry.description ?? entry.descriptionEn ?? "" : entry.descriptionEn ?? entry.description ?? "";
			}
			return dict;
		}
		/** Simplified Chinese dictionary for the index card (chrome + per-entry copy). */
		const zh = build(STATIC_ZH, "zh");
		/** English dictionary, built from the same key set. */
		const en = build(STATIC_EN, "en");
		//#endregion
		//#region src/client/index.ts
		/** Settings namespace the card's enable switch edits (the Host plugin registers it). */
		const COMMUNITY_PLUGINS_NS = "community-plugins";
		/** Required services. */
		const inject = [
			"slots",
			"locale",
			"connection",
			"settingsScope",
			"remote"
		];
		/**
		* Register the community plugin index as a first-level settings section, with
		* its own enable switch over the community-plugins settings namespace.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("community-plugins", {
				zh,
				en
			}), "community-plugins: dictionaries");
			bridgePluginManager(ctx);
			const controller = new CommunityPluginsCardController((ctx.get("webUiSettings") ?? ctx.settingsScope).bind({ namespace: COMMUNITY_PLUGINS_NS }));
			ctx.slots.inject("settings.section", () => {
				const unregister = ctx.slots.register({
					name: "settings.section",
					id: "community-plugins",
					order: 140,
					label: () => ctx.locale.bind("community-plugins")("settings.title"),
					locale: "community-plugins",
					inject: () => controller.inject()
				}, CommunityPluginsSection);
				return () => {
					controller.dispose();
					unregister();
				};
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map