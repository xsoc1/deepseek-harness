//#region lib/types/git.js
/**
* Pure, dependency-free logic for @dsh-selfuse/git-workflow.
*
* Everything in this module is a pure function over strings/objects so it can
* be unit-tested without a git repository (see test/git.test.mjs). The Host
* consumer runs Git through the native DSH shell and session sandbox policy.
*
* @module @dsh-selfuse/git-workflow/git
*/
/** Maximum commit-message length in characters. */
const MAX_MESSAGE_LENGTH = 2e3;
/** Maximum log entries a single git_log call may request. */
const MAX_LOG_COUNT = 50;
/** Default log entry count. */
const DEFAULT_LOG_COUNT = 10;
/** Maximum diff lines returned before truncation. */
const MAX_DIFF_LINES = 500;
/** Cap on requested diff lines (clamped, never exceeds the constant). */
const MAX_REQUESTED_DIFF_LINES = 2e3;
/**
* Validate a commit message.
* @param message - user-provided commit message.
* @returns an error string, or null when the message is acceptable.
*/
function validateCommitMessage(message) {
	if (typeof message !== "string" || message.trim().length === 0) return "commit message must be a non-empty string";
	if (message.length > 2e3) return `commit message too long (${message.length} > ${MAX_MESSAGE_LENGTH} chars)`;
	if (message.includes("\0")) return "commit message must not contain NUL bytes";
	return null;
}
/**
* Validate user-supplied repository-relative paths.
*
* Rejects absolute paths and `..` traversal after normalizing backslashes.
* These are lexical checks; the native sandbox enforces filesystem access.
* Non-existent paths are left to Git to report.
* @param paths - model-supplied path list, or omission.
* @returns an error string or null.
*/
function validatePaths(paths) {
	if (paths === void 0 || paths === null) return null;
	if (!Array.isArray(paths)) return "paths must be an array of strings";
	if (paths.length === 0) return "paths must not be empty";
	for (const p of paths) {
		if (typeof p !== "string" || p.length === 0) return "each path must be a non-empty string";
		if (p.includes("\0")) return "paths must not contain NUL bytes";
		const norm = p.replace(/\\/g, "/");
		if (norm.startsWith("/") || /^[A-Za-z]:\//.test(norm) || norm === ".." || norm.startsWith("../") || norm.includes("/../") || norm.endsWith("/..")) return `path must stay inside the repository: ${JSON.stringify(p)}`;
	}
	return null;
}
/**
* Parse `git status --porcelain -b` output into a structured state.
* @param output - raw stdout from `git status --porcelain -b`.
* @returns a plain state record (branch, upstream, ahead/behind, staged/unstaged/untracked/conflicts).
*/
function parsePorcelainStatus(output) {
	const state = {
		branch: null,
		upstream: null,
		ahead: 0,
		behind: 0,
		staged: [],
		unstaged: [],
		untracked: [],
		conflicts: []
	};
	const lines = output.split(/\r?\n/).filter((line) => line.length > 0);
	for (const line of lines) {
		if (line.startsWith("## ")) {
			parseBranchLine(state, line.slice(3));
			continue;
		}
		if (line.startsWith("?? ")) {
			state.untracked.push(parseEntry(line.slice(3)));
			continue;
		}
		const x = line[0];
		const y = line[1];
		const rawPath = line.slice(3);
		if (x === "U" || y === "U") {
			state.conflicts.push(parseEntry(rawPath));
			continue;
		}
		if (x !== void 0 && x !== " " && x !== "?") state.staged.push({
			status: x,
			...parseEntry(rawPath)
		});
		if (y !== void 0 && y !== " " && y !== "?") state.unstaged.push({
			status: y,
			...parseEntry(rawPath)
		});
	}
	return state;
}
/**
* Parse the `## branch...upstream [ahead N, behind M]` header line.
* @param state - the status record being built.
* @param rest - the line content after the `## ` prefix.
*/
function parseBranchLine(state, rest) {
	const bracket = rest.indexOf(" [");
	const head = bracket === -1 ? rest : rest.slice(0, bracket);
	const meta = bracket === -1 ? "" : rest.slice(bracket + 2, rest.length - 1);
	const dots = head.indexOf("...");
	state.branch = dots === -1 ? head : head.slice(0, dots);
	state.upstream = dots === -1 ? null : head.slice(dots + 3);
	const ahead = meta.match(/(?:^|, )ahead (\d+)/);
	const behind = meta.match(/(?:^|, )behind (\d+)/);
	state.ahead = ahead ? Number(ahead[1]) : 0;
	state.behind = behind ? Number(behind[1]) : 0;
}
/**
* Parse one porcelain path field, splitting rename/copy arrows.
* @param raw - path portion of a porcelain line (`old -> new` for R/C).
* @returns `{ path, from? }`.
*/
function parseEntry(raw) {
	const arrow = raw.indexOf(" -> ");
	if (arrow !== -1) return {
		path: raw.slice(arrow + 4),
		from: raw.slice(0, arrow)
	};
	return { path: raw };
}
/**
* Parse `git diff --stat`/`--shortstat` tail (e.g. "1 file changed, 3 insertions(+), 1 deletion(-)").
* @param output - raw diff output.
* @returns `{ files, insertions, deletions }` (nulls when the stat line is absent).
*/
function parseDiffStat(output) {
	const match = output.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
	if (!match) return {
		files: null,
		insertions: null,
		deletions: null
	};
	return {
		files: Number(match[1]),
		insertions: match[2] === void 0 ? null : Number(match[2]),
		deletions: match[3] === void 0 ? null : Number(match[3])
	};
}
/**
* Parse `git log --pretty=format:%h%x09%ad%x09%s [--name-status]` output.
* @param output - raw git log stdout.
* @param files - whether `--name-status` was requested (file lines follow each commit until a blank line).
* @returns an array of `{ hash, date, subject, files? }`.
*/
function parseLog(output, files = false) {
	const lines = output.split(/\r?\n/);
	const commits = [];
	let current = null;
	for (const line of lines) {
		if (line === "") continue;
		const fields = line.split("	");
		if (fields.length >= 3 && fields[0] !== void 0 && fields[1] !== void 0 && /^[0-9a-f]{4,40}$/.test(fields[0])) {
			current = {
				hash: fields[0],
				date: fields[1],
				subject: fields.slice(2).join("	")
			};
			if (files) current.files = [];
			commits.push(current);
			continue;
		}
		if (current?.files !== void 0 && files) {
			const tab = line.indexOf("	");
			const rest = tab === -1 ? line : line.slice(tab + 1);
			current.files.push(rest.includes("	") ? rest.split("	").join(" -> ") : rest);
		}
	}
	return commits;
}
/**
* Parse `git branch --format=%(HEAD)%(refname:short)` output.
* @param output - raw git branch stdout.
* @returns `{ branches: [{ current, name }] }`.
*/
function parseBranches(output) {
	return { branches: output.split(/\r?\n/).filter((line) => line.length > 0).map((line) => ({
		current: line[0] === "*",
		name: line.slice(2)
	})) };
}
/**
* Clamp and validate a log count.
* @param count - requested entry count.
* @returns a clamped integer in [1, MAX_LOG_COUNT].
*/
function clampLogCount(count) {
	if (count === void 0 || !Number.isFinite(count)) return 10;
	const n = Math.trunc(count);
	if (n < 1) return 1;
	return Math.min(n, 50);
}
/**
* Clamp a diff maxLines request.
* @param maxLines - requested line budget.
* @returns a clamped integer in [10, MAX_REQUESTED_DIFF_LINES].
*/
function clampMaxLines(maxLines) {
	if (maxLines === void 0 || !Number.isFinite(maxLines)) return 500;
	const n = Math.trunc(maxLines);
	if (n < 10) return 10;
	return Math.min(n, MAX_REQUESTED_DIFF_LINES);
}
/**
* Truncate raw tool output to a line budget, appending a marker.
* @param text - raw output.
* @param maxLines - line budget.
* @returns `{ text, truncated }`.
*/
function truncateLines(text, maxLines) {
	const lines = text.split(/\r?\n/);
	if (lines.length <= maxLines) return {
		text,
		truncated: false
	};
	return {
		text: lines.slice(0, maxLines).join("\n") + `\n… (truncated ${lines.length - maxLines} lines)`,
		truncated: true
	};
}
/**
* Render a status record into readable markdown.
* @param state - the parsed status record.
* @returns a text block.
*/
function renderStatus(state) {
	const lines = [];
	const branch = state.branch ?? "(detached HEAD)";
	const upstream = state.upstream === null ? "" : ` (upstream ${state.upstream})`;
	const aheadBehind = state.ahead > 0 || state.behind > 0 ? ` [ahead ${state.ahead}, behind ${state.behind}]` : "";
	lines.push(`branch: ${branch}${upstream}${aheadBehind}`);
	const renderEntry = (e) => `${e.status}  ${e.path}${e.from ? ` (from ${e.from})` : ""}`;
	lines.push(`staged (${state.staged.length}):${state.staged.length === 0 ? " none" : ""}`);
	for (const e of state.staged) lines.push(`  ${renderEntry(e)}`);
	lines.push(`unstaged (${state.unstaged.length}):${state.unstaged.length === 0 ? " none" : ""}`);
	for (const e of state.unstaged) lines.push(`  ${renderEntry(e)}`);
	lines.push(`untracked (${state.untracked.length}):${state.untracked.length === 0 ? " none" : ""}`);
	for (const e of state.untracked) lines.push(`  ??  ${e.path}`);
	lines.push(`conflicts (${state.conflicts.length}):${state.conflicts.length === 0 ? " none" : ""}`);
	for (const e of state.conflicts) lines.push(`  UU  ${e.path}`);
	return lines.join("\n");
}
/**
* Render a git tool failure into a text block.
* @param result - `{ ok: false, exitCode, message }`.
* @param tool - tool name for the header.
* @returns a text block.
*/
function renderFailure(result, tool) {
	return `${tool} failed${result.exitCode === null || result.exitCode === void 0 ? "" : ` (exit ${result.exitCode})`}: ${result.message}`;
}
//#endregion
export { DEFAULT_LOG_COUNT, MAX_DIFF_LINES, MAX_LOG_COUNT, MAX_MESSAGE_LENGTH, MAX_REQUESTED_DIFF_LINES, clampLogCount, clampMaxLines, parseBranches, parseDiffStat, parseEntry, parseLog, parsePorcelainStatus, renderFailure, renderStatus, truncateLines, validateCommitMessage, validatePaths };
