import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Spotlight, SpotlightChanges, Video } from "../../../../types";
import TeamModalInput from "../TeamModalInput";
import { GenerateGeneralNSM } from "../../../../models/generalNSM.model";
import { reqReorderSpotlight } from "../../../../services/api/spotlight.service";
import Spinner from "../../../general/Spinner";
import toast from "react-hot-toast";

interface Props {
	cancelHit?: () => void;
	saveDone?: () => void;
	spotlightedVideos: Spotlight[] | null;
	onSearchVideos: (search: string) => Promise<Video[]>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const GripIcon = () => (
	<svg
		className="h-4 w-4"
		viewBox="0 0 16 16"
		fill="currentColor"
		aria-hidden="true"
	>
		<circle cx="5.5" cy="4" r="1.1" />
		<circle cx="10.5" cy="4" r="1.1" />
		<circle cx="5.5" cy="8" r="1.1" />
		<circle cx="10.5" cy="8" r="1.1" />
		<circle cx="5.5" cy="12" r="1.1" />
		<circle cx="10.5" cy="12" r="1.1" />
	</svg>
);

const ChevronUpIcon = () => (
	<svg
		className="h-3.5 w-3.5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2.5}
		aria-hidden="true"
	>
		<path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg
		className="h-3.5 w-3.5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2.5}
		aria-hidden="true"
	>
		<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
	</svg>
);

const XIcon = () => (
	<svg
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

const VideoPlaceholderIcon = () => (
	<svg
		className="h-5 w-5 text-slate-300"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
		/>
	</svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const SpotlightedVideosModal = ({
	cancelHit,
	saveDone,
	spotlightedVideos,
	onSearchVideos,
}: Props) => {
	// Current visual order of slots (originalRank is the stable identifier)
	const [items, setItems] = useState<Spotlight[]>([]);
	// Per-originalRank pending video replacements
	const [videoChanges, setVideoChanges] = useState<Map<number, Video>>(
		new Map(),
	);
	// Which rank has search expanded
	const [expandedRank, setExpandedRank] = useState<number | null>(null);
	const [searchValue, setSearchValue] = useState("");
	const [searchResults, setSearchResults] = useState<Video[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	// Drag state
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	// Save
	const [saving, setSaving] = useState(false);

	// Initialise items once data loads
	useEffect(() => {
		if (spotlightedVideos && items.length === 0) {
			setItems([...spotlightedVideos].sort((a, b) => a.rank - b.rank));
		}
	}, [spotlightedVideos, items.length]);

	// ── Dirty tracking ──────────────────────────────────────────────────────

	const hasPositionChange = items.some((item, i) => item.rank !== i + 1);
	const isDirty = videoChanges.size > 0 || hasPositionChange;

	// Count of visually modified slots (for the Save badge)
	const modifiedRanks = new Set<number>();
	items.forEach((item, i) => {
		if (item.rank !== i + 1) modifiedRanks.add(item.rank);
		if (videoChanges.has(item.rank)) modifiedRanks.add(item.rank);
	});
	const changeCount = modifiedRanks.size;

	// ── Helpers ─────────────────────────────────────────────────────────────

	const effectiveVideoId = (item: Spotlight) =>
		videoChanges.get(item.rank)?.id ?? item.video_id;

	const effectiveVideo = (item: Spotlight): Video | undefined =>
		videoChanges.get(item.rank) ?? item.video ?? undefined;

	// ── Handlers ────────────────────────────────────────────────────────────

	const handleVideoSelect = (originalRank: number, video: Video) => {
		const conflict = items.find(
			(s) => s.rank !== originalRank && effectiveVideoId(s) === video.id,
		);
		if (conflict) {
			const conflictPos = items.findIndex((s) => s.rank === conflict.rank) + 1;
			toast.error(`Already assigned to slot ${conflictPos}.`);
			return;
		}
		setVideoChanges((prev) => new Map(prev).set(originalRank, video));
		setExpandedRank(null);
		setSearchValue("");
		setSearchResults([]);
		setSearchLoading(false);
	};

	const moveItem = (index: number, dir: "up" | "down") => {
		const target = dir === "up" ? index - 1 : index + 1;
		if (target < 0 || target >= items.length) return;
		const next = [...items];
		[next[index], next[target]] = [next[target], next[index]];
		setItems(next);
	};

	const handleDrop = (toIndex: number) => {
		if (dragIndex === null || dragIndex === toIndex) return;
		const next = [...items];
		const [moved] = next.splice(dragIndex, 1);
		next.splice(toIndex, 0, moved);
		setItems(next);
		setDragIndex(null);
		setDragOverIndex(null);
	};

	const runSave = async () => {
		if (!isDirty) {
			saveDone?.();
			return;
		}
		setSaving(true);
		const payload: SpotlightChanges[] = items.map((item, i) => ({
			rank: i + 1,
			video_id: videoChanges.get(item.rank)?.id ?? item.video_id,
		}));
		const response = await reqReorderSpotlight(payload);
		setSaving(false);
		if (response.success) {
			saveDone?.();
		} else {
			toast.error("Failed to save spotlight changes");
		}
	};

	// Scroll expanded slot into view so its dropdown fits below it
	const expandedItemRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (expandedRank === null) return;
		const timer = setTimeout(() => {
			expandedItemRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 50);
		return () => clearTimeout(timer);
	}, [expandedRank]);

	// ── Render ──────────────────────────────────────────────────────────────

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={cancelHit}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[560px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Spotlighted Videos"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Spotlighted Videos
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								{isDirty
									? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
									: "Drag to reorder · Replace to swap a video"}
							</p>
						</div>
						<button
							onClick={cancelHit}
							className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							aria-label="Close"
						>
							<XIcon />
						</button>
					</div>
				</div>

				{/* Scrollable content — overflow lives here, not on the outer modal */}
				{/* min-h-0 lets the flex child respect the parent max-height constraint */}
				<div className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-4 ${expandedRank !== null ? "pb-72" : ""}`}>
					{items.length === 0 ? (
						<div className="flex justify-center py-14">
							<Spinner />
						</div>
					) : (
						<div className="flex flex-col gap-1">
							{items.map((item, index) => {
								const video = effectiveVideo(item);
								const isModified = modifiedRanks.has(item.rank);
								const isDragging = dragIndex === index;
								const showDropAbove =
									dragIndex !== null &&
									dragOverIndex === index &&
									dragIndex > index;
								const showDropBelow =
									dragIndex !== null &&
									dragOverIndex === index &&
									dragIndex < index;
								const isExpanded = expandedRank === item.rank;

								return (
									<div key={item.rank} ref={isExpanded ? expandedItemRef : null}>
										{/* Drop indicator — above */}
										{showDropAbove && (
											<div className="mx-3 mb-1 h-0.5 rounded-full bg-blue-500" />
										)}

										<div
											draggable
											onDragStart={(e) => {
												setDragIndex(index);
												e.dataTransfer.effectAllowed = "move";
											}}
											onDragOver={(e) => {
												e.preventDefault();
												e.dataTransfer.dropEffect = "move";
												if (dragOverIndex !== index) setDragOverIndex(index);
											}}
											onDragLeave={(e) => {
												if (
													!e.currentTarget.contains(e.relatedTarget as Node)
												) {
													setDragOverIndex(null);
												}
											}}
											onDrop={(e) => {
												e.preventDefault();
												handleDrop(index);
											}}
											onDragEnd={() => {
												setDragIndex(null);
												setDragOverIndex(null);
											}}
											className={[
												"select-none rounded-xl border transition-all duration-150",
												isDragging
													? "scale-[0.98] opacity-40 cursor-grabbing"
													: "cursor-grab",
												isModified
													? "border-amber-200 bg-amber-50/40"
													: "border-slate-200 bg-white",
												!isDragging && dragOverIndex === index
													? "border-blue-300 bg-blue-50/30"
													: "",
											]
												.filter(Boolean)
												.join(" ")}
										>
											{/* Main row */}
											<div className="flex items-center gap-2.5 p-2.5 sm:gap-3 sm:p-3">
												{/* Drag handle — desktop only */}
												<div className="hidden shrink-0 cursor-grab text-slate-300 hover:text-slate-400 sm:flex">
													<GripIcon />
												</div>

												{/* ▲ ▼ buttons — mobile only */}
												<div className="flex shrink-0 flex-col gap-px sm:hidden">
													<button
														onClick={() => moveItem(index, "up")}
														disabled={index === 0}
														className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-25"
														aria-label="Move up"
													>
														<ChevronUpIcon />
													</button>
													<button
														onClick={() => moveItem(index, "down")}
														disabled={index === items.length - 1}
														className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-25"
														aria-label="Move down"
													>
														<ChevronDownIcon />
													</button>
												</div>

												{/* Rank badge */}
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
													{index + 1}
												</span>

												{/* Thumbnail */}
												{video ? (
													<div className="relative h-[40px] w-[70px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-[44px] sm:w-[78px]">
														<Image
															src={video.thumbnail}
															alt={video.title}
															fill
															sizes="78px"
															style={{ objectFit: "cover" }}
														/>
													</div>
												) : (
													<div className="flex h-[40px] w-[70px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 sm:h-[44px] sm:w-[78px]">
														<VideoPlaceholderIcon />
													</div>
												)}

												{/* Title */}
												<div className="flex min-w-0 flex-1 flex-col">
													{video ? (
														<p className="truncate text-sm font-medium text-slate-800">
															{video.title}
														</p>
													) : (
														<p className="text-sm italic text-slate-400">
															Empty slot
														</p>
													)}
													{isModified && (
														<span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-amber-500">
															Modified
														</span>
													)}
												</div>

												{/* Replace toggle */}
												<button
													onClick={(e) => {
														e.stopPropagation();
														if (isExpanded) {
															setExpandedRank(null);
															setSearchValue("");
															setSearchResults([]);
															setSearchLoading(false);
														} else {
															setExpandedRank(item.rank);
															setSearchValue("");
															setSearchResults([]);
															setSearchLoading(false);
														}
													}}
													className={[
														"shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
														isExpanded
															? "border-blue-200 bg-blue-50 text-blue-600"
															: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
													].join(" ")}
												>
													{isExpanded ? "Done" : "Replace"}
												</button>
											</div>

											{/* Expanded search */}
											{isExpanded && (
												<div className="border-t border-slate-100 px-3 pb-3 pt-2.5 sm:px-4">
													<TeamModalInput
														value={searchValue}
														placeholder={
															video
																? "Search to replace this video…"
																: "Search to assign a video…"
														}
														delay={250}
														setValue={(v) => {
															setSearchValue(v);
															if (v.length === 0) {
																setSearchResults([]);
																setSearchLoading(false);
															}
														}}
														setDelayedValue={async (v) => {
															if (v.length === 0) {
																setSearchResults([]);
																setSearchLoading(false);
																return;
															}
															setSearchLoading(true);
															const results = await onSearchVideos(v);
															setSearchResults(results);
															setSearchLoading(false);
														}}
														loading={searchLoading}
														dropdownClick={(dropItem) => {
															const found = searchResults.find(
																(v) => v.id === dropItem.id,
															);
															if (found) handleVideoSelect(item.rank, found);
														}}
														dropdown={GenerateGeneralNSM(searchResults)}
													/>
												</div>
											)}
										</div>

										{/* Drop indicator — below */}
										{showDropBelow && (
											<div className="mx-3 mt-1 h-0.5 rounded-full bg-blue-500" />
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={cancelHit}
							className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
						>
							Cancel
						</button>
						<button
							onClick={runSave}
							disabled={saving || !isDirty}
							className={[
								"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
								isDirty && !saving
									? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-300",
							].join(" ")}
						>
							{saving ? (
								<Spinner style="light" size={16} />
							) : (
								<>
									Save
									{changeCount > 0 && (
										<span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
											{changeCount}
										</span>
									)}
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default SpotlightedVideosModal;
