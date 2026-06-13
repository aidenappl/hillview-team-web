// Minimal WebVTT parser for the admin caption preview. Mirrors the transcript
// parser on hillview-tv-web: it models the payload markup relevant to a
// transcript (voice / class / b,i,u / lang / entities) and skips on-video-only
// features (positioning, regions, ::cue STYLE).

export type VttNode =
	| { type: "text"; value: string }
	| {
			type: "tag";
			tag: string;
			classes: string[];
			annotation?: string;
			children: VttNode[];
	  };

export interface Cue {
	start: number;
	end: number;
	voice?: string;
	nodes: VttNode[];
	text: string;
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	lrm: "‎",
	rlm: "‏",
};

const decodeEntities = (s: string): string =>
	s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e: string) => {
		if (e[0] === "#") {
			const code =
				e[1] === "x" || e[1] === "X"
					? parseInt(e.slice(2), 16)
					: parseInt(e.slice(1), 10);
			return Number.isNaN(code) ? m : String.fromCodePoint(code);
		}
		return NAMED_ENTITIES[e] ?? m;
	});

export const formatTimestamp = (seconds: number): string => {
	const total = Math.max(0, Math.round(seconds));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const parseTimestamp = (ts: string): number => {
	const parts = ts.trim().split(":");
	if (parts.length < 2) return 0;
	const secs = parseFloat(parts[parts.length - 1]) || 0;
	const mins = parseInt(parts[parts.length - 2], 10) || 0;
	const hours = parts.length >= 3 ? parseInt(parts[parts.length - 3], 10) || 0 : 0;
	return hours * 3600 + mins * 60 + secs;
};

const tokenizePayload = (payload: string): VttNode[] => {
	const root: Extract<VttNode, { type: "tag" }> = {
		type: "tag",
		tag: "root",
		classes: [],
		children: [],
	};
	const stack: Extract<VttNode, { type: "tag" }>[] = [root];
	const top = () => stack[stack.length - 1];
	const pushText = (t: string) => {
		if (t) top().children.push({ type: "text", value: decodeEntities(t) });
	};

	const re = /<([^>]*)>/g;
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(payload))) {
		pushText(payload.slice(last, m.index));
		last = re.lastIndex;
		const raw = m[1].trim();
		if (raw === "") continue;
		if (raw.startsWith("/")) {
			if (stack.length > 1) stack.pop();
			continue;
		}
		if (/^\d{1,2}:\d{2}/.test(raw) || /^\d+(\.\d+)?$/.test(raw)) continue;
		const spaceIdx = raw.indexOf(" ");
		const namePart = spaceIdx === -1 ? raw : raw.slice(0, spaceIdx);
		const annotation = spaceIdx === -1 ? undefined : raw.slice(spaceIdx + 1).trim();
		const dotParts = namePart.split(".");
		const node: Extract<VttNode, { type: "tag" }> = {
			type: "tag",
			tag: dotParts[0].toLowerCase(),
			classes: dotParts.slice(1),
			annotation,
			children: [],
		};
		top().children.push(node);
		stack.push(node);
	}
	pushText(payload.slice(last));
	return root.children;
};

const collectText = (nodes: VttNode[]): string =>
	nodes
		.map((n) => (n.type === "text" ? n.value : collectText(n.children)))
		.join("");

const findVoice = (nodes: VttNode[]): string | undefined => {
	for (const n of nodes) {
		if (n.type === "tag") {
			if (n.tag === "v" && n.annotation) return n.annotation;
			const nested = findVoice(n.children);
			if (nested) return nested;
		}
	}
	return undefined;
};

// ── Structured editing model ────────────────────────────────────────────────
// A flat, editable cue: start/end seconds, optional speaker (<v Name>), and the
// raw payload body (inline markup like <b> kept as editable text).
export interface EditCue {
	start: number;
	end: number;
	speaker?: string;
	body: string;
}

// Seconds -> WebVTT timestamp "HH:MM:SS.mmm".
export const formatVttTime = (seconds: number): string => {
	const s = Math.max(0, seconds);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = Math.floor(s % 60);
	const ms = Math.round((s - Math.floor(s)) * 1000);
	const p = (n: number, l = 2) => String(n).padStart(l, "0");
	return `${p(h)}:${p(m)}:${p(sec)}.${p(ms, 3)}`;
};

// Parse a user-typed time into seconds. Accepts "SS", "SS.mmm", "MM:SS(.mmm)",
// or "HH:MM:SS(.mmm)". Returns null if unparseable.
export const parseTimeInput = (value: string): number | null => {
	const v = value.trim();
	if (!v) return null;
	if (/^\d+(\.\d+)?$/.test(v)) return parseFloat(v);
	const parts = v.split(":");
	if (parts.length < 2 || parts.length > 3) return null;
	const sec = parseFloat(parts[parts.length - 1]);
	const min = parseInt(parts[parts.length - 2], 10);
	const hr = parts.length === 3 ? parseInt(parts[parts.length - 3], 10) : 0;
	if ([sec, min, hr].some((n) => Number.isNaN(n))) return null;
	return hr * 3600 + min * 60 + sec;
};

// Parse WebVTT into flat editable cues (speaker split out from the payload).
export const parseEditCues = (vtt: string | null | undefined): EditCue[] => {
	if (!vtt) return [];
	const blocks = vtt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(/\n\n+/);
	const out: EditCue[] = [];
	for (const block of blocks) {
		const lines = block.split("\n");
		const head = (lines[0] ?? "").trim();
		if (
			head.startsWith("WEBVTT") ||
			head.startsWith("NOTE") ||
			head.startsWith("STYLE") ||
			head.startsWith("REGION")
		) {
			continue;
		}
		const ti = lines.findIndex((l) => l.includes("-->"));
		if (ti === -1) continue;
		const [startRaw, restRaw = ""] = lines[ti].split("-->");
		const endRaw = restRaw.trim().split(/\s+/)[0];
		let payload = lines.slice(ti + 1).join(" ").trim();
		if (!payload) continue;
		let speaker: string | undefined;
		const vm = payload.match(/^<v\s+([^>]+)>/i);
		if (vm) {
			speaker = vm[1].trim();
			payload = payload.slice(vm[0].length);
		}
		payload = payload.replace(/<\/v>\s*$/i, "").trim();
		out.push({
			start: parseTimestamp(startRaw),
			end: parseTimestamp(endRaw),
			speaker,
			body: payload,
		});
	}
	return out;
};

// Serialize editable cues back to a WebVTT document. Cue identifiers are emitted
// from the array index, so numbering is always sequential and continuous and
// re-shifts automatically whenever cues are added, removed, or reordered.
export const serializeCues = (cues: EditCue[]): string => {
	const body = cues
		.map((c, i) => {
			const text = c.speaker ? `<v ${c.speaker}>${c.body}` : c.body;
			return `${i + 1}\n${formatVttTime(c.start)} --> ${formatVttTime(c.end)}\n${text}`;
		})
		.join("\n\n");
	return `WEBVTT\n\n${body}\n`;
};

// Normalize: trim, collapse internal whitespace, drop empties, sort by start,
// guarantee end > start.
export const cleanupCues = (cues: EditCue[]): EditCue[] =>
	cues
		.map((c) => ({
			start: c.start,
			end: c.end,
			speaker: c.speaker?.trim() || undefined,
			body: c.body.replace(/\s+/g, " ").trim(),
		}))
		.filter((c) => c.body.length > 0)
		.sort((a, b) => a.start - b.start)
		.map((c) => ({ ...c, end: c.end > c.start ? c.end : c.start + 2 }));

// Distinct speakers already used, for the remembered quick-pick.
export const usedSpeakers = (cues: EditCue[]): string[] =>
	Array.from(
		new Set(cues.map((c) => c.speaker?.trim()).filter((v): v is string => !!v)),
	).sort();

export const parseVtt = (vtt: string | null | undefined): Cue[] => {
	if (!vtt) return [];
	const blocks = vtt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(/\n\n+/);
	const cues: Cue[] = [];
	let lastText = "";
	for (const block of blocks) {
		const lines = block.split("\n");
		const head = (lines[0] ?? "").trim();
		if (
			head.startsWith("WEBVTT") ||
			head.startsWith("NOTE") ||
			head.startsWith("STYLE") ||
			head.startsWith("REGION")
		) {
			continue;
		}
		const timingIdx = lines.findIndex((l) => l.includes("-->"));
		if (timingIdx === -1) continue;
		const [startRaw, restRaw = ""] = lines[timingIdx].split("-->");
		const endRaw = restRaw.trim().split(/\s+/)[0];
		const payload = lines
			.slice(timingIdx + 1)
			.join("\n")
			.trim();
		if (!payload) continue;
		const nodes = tokenizePayload(payload);
		const text = collectText(nodes).replace(/\s+/g, " ").trim();
		if (!text || text === lastText) continue;
		cues.push({
			start: parseTimestamp(startRaw),
			end: parseTimestamp(endRaw),
			voice: findVoice(nodes),
			nodes,
			text,
		});
		lastText = text;
	}
	return cues;
};
