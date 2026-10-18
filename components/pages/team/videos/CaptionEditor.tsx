import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import MuxPlayer, { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import Spinner from "../../../general/Spinner";
import {
	EditCue,
	parseEditCues,
	serializeCues,
	cleanupCues,
	usedSpeakers,
	formatVttTime,
	parseTimeInput,
} from "../../../../utils/vtt";
import {
	reqSaveVideoCaption,
	reqRegenerateVideoCaption,
} from "../../../../services/api/captions.service";
import { extractMuxPlaybackIdFromUrl } from "../../../../utils/mux";


// Editable time field — keeps a local string while focused, commits on blur/Enter.
const TimeField = ({
	seconds,
	onCommit,
}: {
	seconds: number;
	onCommit: (s: number) => void;
}) => {
	const [text, setText] = useState(formatVttTime(seconds));
	const [editing, setEditing] = useState(false);
	useEffect(() => {
		if (!editing) setText(formatVttTime(seconds));
	}, [seconds, editing]);
	const commit = () => {
		setEditing(false);
		const v = parseTimeInput(text);
		if (v == null) setText(formatVttTime(seconds));
		else onCommit(v);
	};
	return (
		<input
			type="text"
			value={text}
			onFocus={() => setEditing(true)}
			onChange={(e) => setText(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Enter") (e.target as HTMLInputElement).blur();
			}}
			onClick={(e) => e.stopPropagation()}
			className="w-[92px] rounded-sm border border-slate-200 px-1.5 py-0.5 text-center font-mono text-[0.7rem] tabular-nums text-slate-600 focus:border-blue-400 focus:outline-hidden"
		/>
	);
};

const InsertDivider = ({ onClick }: { onClick: () => void }) => (
	<div className="group/ins flex h-3 items-center justify-center">
		<button
			type="button"
			onClick={onClick}
			className="rounded-full bg-blue-600/0 px-2 text-[0.65rem] font-semibold text-blue-600 opacity-0 transition-opacity group-hover/ins:opacity-100"
			title="Insert a cue here"
		>
			+ insert
		</button>
	</div>
);

type Props = {
	uuid: string;
	url: string;
	initialVtt: string;
	onClose: () => void;
	onSaved: (vtt: string) => void;
};

const CaptionEditor = ({ uuid, url, initialVtt, onClose, onSaved }: Props) => {
	const playbackId = useMemo(() => extractMuxPlaybackIdFromUrl(url), [url]);
	const [cues, setCues] = useState<EditCue[]>(() => parseEditCues(initialVtt));
	const [selected, setSelected] = useState(0);
	const [activeCue, setActiveCue] = useState(-1);
	const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
	const [regenerating, setRegenerating] = useState(false);
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [overIndex, setOverIndex] = useState<number | null>(null);

	const playerRef = useRef<MuxPlayerRefAttributes | null>(null);
	const savedSnapshot = useRef(serializeCues(parseEditCues(initialVtt)));
	const activeRef = useRef<HTMLLIElement | null>(null);

	const dirty = serializeCues(cues) !== savedSnapshot.current;
	const speakers = useMemo(() => usedSpeakers(cues), [cues]);

	const cuesRef = useRef(cues);
	useEffect(() => {
		cuesRef.current = cues;
	}, [cues]);

	// Highlight the cue under the playhead.
	const onTimeUpdate = () => {
		const p = playerRef.current;
		if (!p) return;
		const t = p.currentTime;
		const cs = cuesRef.current;
		let idx = -1;
		for (let i = 0; i < cs.length; i++) {
			if (cs[i].start <= t && t < cs[i].end) {
				idx = i;
				break;
			}
		}
		setActiveCue((prev) => (prev === idx ? prev : idx));
	};

	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest" });
	}, [activeCue]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	const patchCue = (i: number, patch: Partial<EditCue>) =>
		setCues((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

	const insertAt = (index: number) =>
		setCues((cs) => {
			const prev = cs[index - 1];
			const next = cs[index];
			const start = prev ? prev.end : next ? Math.max(0, next.start - 2) : 0;
			const end = next ? Math.max(start + 1, next.start) : start + 2;
			const nc: EditCue = { start, end, body: "" };
			const out = [...cs.slice(0, index), nc, ...cs.slice(index)];
			return out;
		});

	const removeCue = (i: number) => setCues((cs) => cs.filter((_, idx) => idx !== i));

	const reorder = (from: number, to: number) => {
		if (from === to) return;
		setCues((cs) => {
			const a = [...cs];
			const [moved] = a.splice(from, 1);
			a.splice(to, 0, moved);
			return a;
		});
	};

	const seekTo = (sec: number) => {
		const p = playerRef.current;
		if (!p) return;
		p.currentTime = sec;
		void p.play();
	};

	const setStartToPlayhead = () => {
		const p = playerRef.current;
		if (!p) return;
		patchCue(selected, { start: Math.round(p.currentTime * 1000) / 1000 });
	};
	const setEndToPlayhead = () => {
		const p = playerRef.current;
		if (!p) return;
		patchCue(selected, { end: Math.round(p.currentTime * 1000) / 1000 });
	};

	const cleanup = () => {
		setCues((cs) => cleanupCues(cs));
		toast.success("Cleaned up & sorted captions");
	};

	const save = async () => {
		if (saveState === "saving") return;
		const vtt = serializeCues(cues);
		setSaveState("saving");
		const res = await reqSaveVideoCaption(uuid, vtt);
		if (res.success) {
			savedSnapshot.current = vtt;
			setSaveState("saved");
			onSaved(vtt);
			window.setTimeout(() => setSaveState("idle"), 1800);
		} else {
			setSaveState("idle");
			toast.error(res.error_message || "Failed to save captions");
		}
	};

	const regenerate = async () => {
		if (regenerating) return;
		if (
			!window.confirm(
				"Regenerate captions with Mux AI? This replaces the current captions.",
			)
		)
			return;
		setRegenerating(true);
		const res = await reqRegenerateVideoCaption(uuid);
		setRegenerating(false);
		if (res.success) {
			toast.success("Regeneration started — reopen in a few minutes.");
			onClose();
		} else {
			toast.error(res.error_message || "Failed to regenerate");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-white">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
				<div>
					<h2 className="text-sm font-semibold text-slate-900 sm:text-base">
						Caption Editor
					</h2>
					<p className="text-xs text-slate-500">
						{cues.length} cues{dirty ? " · unsaved changes" : ""}
					</p>
				</div>
				<button
					onClick={onClose}
					className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
				>
					Close
				</button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				{/* Left — player + controls */}
				<div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 p-5 lg:w-[44%] lg:border-b-0 lg:border-r">
					{playbackId ? (
						<div className="overflow-hidden rounded-xl bg-black">
							<MuxPlayer
								ref={playerRef}
								playbackId={playbackId}
								streamType="on-demand"
								accentColor="#2563eb"
								onTimeUpdate={onTimeUpdate}
								style={{ aspectRatio: "16 / 9", width: "100%", display: "block" }}
							/>
						</div>
					) : (
						<div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
							No Mux player for this video
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={setStartToPlayhead}
							disabled={!playbackId || !cues[selected]}
							className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						>
							Set start to playhead
						</button>
						<button
							type="button"
							onClick={setEndToPlayhead}
							disabled={!playbackId || !cues[selected]}
							className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						>
							Set end to playhead
						</button>
					</div>

					{/* Sticky action bar */}
					<div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
						<button
							type="button"
							onClick={save}
							disabled={!dirty || saveState === "saving"}
							className={
								"flex h-9 min-w-[110px] items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50 " +
								(saveState === "saved"
									? "bg-emerald-500"
									: "bg-blue-600 hover:bg-blue-700")
							}
						>
							{saveState === "saving" ? (
								<Spinner style="light" size={16} />
							) : saveState === "saved" ? (
								"Saved ✓"
							) : dirty ? (
								"Save"
							) : (
								"Saved"
							)}
						</button>
						<button
							type="button"
							onClick={cleanup}
							className="h-9 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						>
							Clean up
						</button>
						<button
							type="button"
							onClick={regenerate}
							disabled={regenerating}
							className="ml-auto h-9 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
						>
							{regenerating ? <Spinner style="default" size={16} /> : "Regenerate"}
						</button>
					</div>
				</div>

				{/* Right — cue list */}
				<div className="min-h-0 flex-1 overflow-y-auto p-5">
					<InsertDivider onClick={() => insertAt(0)} />
					{cues.length === 0 && (
						<div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-slate-400">
							No cues yet.
							<button
								type="button"
								onClick={() => insertAt(0)}
								className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
							>
								Add first cue
							</button>
						</div>
					)}
					<ol>
						{cues.map((cue, i) => {
							const isActive = i === activeCue;
							const isSelected = i === selected;
							const isOver = i === overIndex && dragIndex !== null && dragIndex !== i;
							return (
								<li key={i} ref={isActive ? activeRef : undefined}>
									<div
										onClick={() => setSelected(i)}
										onDragOver={(e) => {
											if (dragIndex === null) return;
											e.preventDefault();
											setOverIndex(i);
										}}
										onDrop={(e) => {
											e.preventDefault();
											if (dragIndex !== null) reorder(dragIndex, i);
											setDragIndex(null);
											setOverIndex(null);
										}}
										className={
											"rounded-lg border p-2.5 transition-colors " +
											(isOver ? "border-blue-400 ring-2 ring-blue-200 " : "") +
											(isActive
												? "border-blue-600 bg-blue-600/5"
												: isSelected
													? "border-slate-300 bg-slate-50"
													: "border-slate-200 bg-white")
										}
									>
										<div className="flex flex-wrap items-center gap-2">
											{/* Drag handle + caption number */}
											<span
												draggable
												onDragStart={() => setDragIndex(i)}
												onDragEnd={() => {
													setDragIndex(null);
													setOverIndex(null);
												}}
												className="flex cursor-grab items-center gap-1 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-500 active:cursor-grabbing"
												title="Drag to reorder"
											>
												<span aria-hidden>⠿</span>
												{i + 1}
											</span>

											{/* Start / end time fields */}
											<TimeField
												seconds={cue.start}
												onCommit={(s) => patchCue(i, { start: s })}
											/>
											<span className="text-[0.7rem] text-slate-300">→</span>
											<TimeField
												seconds={cue.end}
												onCommit={(s) => patchCue(i, { end: s })}
											/>

											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													seekTo(cue.start);
												}}
												className="rounded-sm px-1.5 py-0.5 text-[0.65rem] font-semibold text-blue-600 hover:bg-blue-600/10"
												title="Jump to this cue"
											>
												▸ play
											</button>

											<input
												type="text"
												value={cue.speaker ?? ""}
												onClick={(e) => e.stopPropagation()}
												onChange={(e) =>
													patchCue(i, { speaker: e.target.value || undefined })
												}
												list="caption-speakers"
												placeholder="Speaker"
												className="h-7 w-28 rounded-sm border border-slate-200 px-2 text-xs text-slate-700 focus:border-blue-400 focus:outline-hidden"
											/>

											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													removeCue(i);
												}}
												className="ml-auto rounded-sm px-1.5 py-0.5 text-xs font-semibold text-red-500 hover:bg-red-50"
												title="Delete cue"
											>
												✕
											</button>
										</div>
										<textarea
											value={cue.body}
											onClick={(e) => e.stopPropagation()}
											onChange={(e) => patchCue(i, { body: e.target.value })}
											rows={2}
											placeholder="Caption text…"
											className="mt-2 w-full resize-y rounded-sm border border-slate-200 px-2 py-1.5 text-sm leading-relaxed text-slate-700 focus:border-blue-400 focus:outline-hidden"
										/>
									</div>
									<InsertDivider onClick={() => insertAt(i + 1)} />
								</li>
							);
						})}
					</ol>
				</div>
			</div>

			<datalist id="caption-speakers">
				{speakers.map((sp) => (
					<option key={sp} value={sp} />
				))}
			</datalist>
		</div>
	);
};

export default CaptionEditor;
