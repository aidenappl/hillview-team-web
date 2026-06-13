import { useMemo } from "react";
import { parseVtt, formatTimestamp, VttNode } from "../../../../utils/vtt";

// Render a parsed cue payload tree to safe React elements (no dangerouslySetInnerHTML).
const renderNodes = (nodes: VttNode[]): React.ReactNode =>
	nodes.map((node, i) => {
		if (node.type === "text") return node.value;
		const children = renderNodes(node.children);
		switch (node.tag) {
			case "b":
				return <b key={i}>{children}</b>;
			case "i":
				return <i key={i}>{children}</i>;
			case "u":
				return <u key={i}>{children}</u>;
			case "lang":
				return (
					<span key={i} lang={node.annotation}>
						{children}
					</span>
				);
			case "c":
				return (
					<span key={i} className={node.classes.map((c) => `vtt-${c}`).join(" ")}>
						{children}
					</span>
				);
			case "ruby":
				return <ruby key={i}>{children}</ruby>;
			case "rt":
				return <rt key={i}>{children}</rt>;
			default:
				return <span key={i}>{children}</span>;
		}
	});

const CaptionPreview = ({ vtt }: { vtt: string }) => {
	const cues = useMemo(() => parseVtt(vtt), [vtt]);

	if (cues.length === 0) {
		return (
			<div className="flex h-48 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
				Nothing to preview yet.
			</div>
		);
	}

	return (
		<div className="h-48 space-y-0.5 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2">
			{cues.map((cue, i) => {
				const showSpeaker = cue.voice && cue.voice !== cues[i - 1]?.voice;
				return (
					<div key={i} className="flex gap-3 px-1 py-1">
						<span className="shrink-0 pt-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-slate-400">
							{formatTimestamp(cue.start)}
						</span>
						<span className="text-sm leading-relaxed text-slate-700">
							{showSpeaker && (
								<span className="mr-1 font-semibold text-slate-900">
									{cue.voice}:
								</span>
							)}
							{renderNodes(cue.nodes)}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default CaptionPreview;
