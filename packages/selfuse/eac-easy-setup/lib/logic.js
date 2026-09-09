/**
 * dsh-easy-setup — pure logic (no framework imports; unit-tested directly).
 *
 * resolvePersonaPath answers "which soul.md does the persona editor edit":
 * the user's settings.yaml override (written when the soul-md settings
 * section is edited in the Web UI) wins, then the composition layer in the
 * web profile's cordis.patch.yml, then the plain default `<home>/soul.md`.
 */

/** Unquote a YAML scalar ('x', "x", x). */
function scalar(value) {
	const text = String(value).trim();
	if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
		return text.slice(1, -1);
	}
	return text;
}

/** Read `<ns>.<key>` from a flat settings.yaml (two-level: namespace + key). */
function settingsValue(text, ns, key) {
	if (!text) return undefined;
	let inNs = false;
	for (const line of text.split(/\r?\n/)) {
		if (/^\s*#/.test(line) || line.trim() === '') continue;
		if (!/^\s/.test(line)) inNs = line.trim() === `${ns}:`;
		else if (inNs) {
			const match = line.match(new RegExp(`^\\s+${key}\\s*:\\s*(.+?)\\s*$`));
			if (match) return scalar(match[1]);
		}
	}
	return undefined;
}

/** Read `config.<key>` from the cordis.patch.yml insert block whose id is `id`. */
function patchConfigValue(text, id, key) {
	if (!text) return undefined;
	const lines = text.split(/\r?\n/);
	// Split into `- insert:` blocks; blocks start at column 0 with "- insert:".
	const blocks = [];
	let current = null;
	for (const line of lines) {
		if (/^- insert:\s*$/.test(line)) {
			current = [line];
			blocks.push(current);
		} else if (current !== null) {
			// Stop collecting at the next top-level array item (any "- " at column 0).
			if (/^- /.test(line)) current = null;
			else current.push(line);
		}
	}
	for (const block of blocks) {
		const joined = block.join('\n');
		if (!new RegExp(`(^|\\n)\\s*- id:\\s*${id}\\s*(\\n|$)`).test(joined)) continue;
		const match = joined.match(new RegExp(`^\\s+${key}\\s*:\\s*(.+?)\\s*$`, 'm'));
		if (match) return scalar(match[1]);
	}
	return undefined;
}

/** True for Windows drive / POSIX absolute paths. */
function isAbsolute(p) {
	return /^([A-Za-z]:[\\/]|\/|\\\\)/.test(p);
}

/** Normalize separators to forward slashes and join onto the home. */
function under(home, p) {
	return `${String(home).replace(/[\\/]+$/, '')}/${String(p).replace(/[\\/]+/g, '/')}`;
}

/**
 * Resolve the soul.md path the persona editor should edit.
 * @param {{home: string, settingsText?: string, patchText?: string}} input
 * @returns the absolute persona file path (forward slashes).
 */
export function resolvePersonaPath({ home, settingsText = '', patchText = '' }) {
	const fromSettings = settingsValue(settingsText, 'soul-md', 'path');
	const fromPatch = patchConfigValue(patchText, 'soul-md', 'path');
	const configured = fromSettings ?? fromPatch ?? 'soul.md';
	return isAbsolute(configured) ? configured.replace(/\\/g, '/') : under(home, configured);
}
