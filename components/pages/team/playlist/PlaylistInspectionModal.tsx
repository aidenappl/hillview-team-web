import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalUploader from "../TeamModalUploader";
import Spinner from "../../../general/Spinner";
import UploadImage from "../../../../services/uploadHandler";
import { GenerateGeneralNSM } from "../../../../models/generalNSM.model";
import { reqGetVideos } from "../../../../services/api/video.service";
import { PlaylistStatuses } from "../../../../models/playlistStatus.model";
import { Video, PlaylistChanges } from "../../../../types";
import { Playlist } from "../../../../models/playlist.model";

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const VideoPlaceholderIcon = () => (
	<svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
	</svg>
);

// ─── Video item ───────────────────────────────────────────────────────────────

function VideoItem({
	video,
	onRemove,
}: {
	video: Video;
	onRemove: () => void;
}) {
	return (
		<div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 sm:gap-3 sm:p-3">
			{video.thumbnail ? (
				<div className="relative h-[40px] w-[70px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-[44px] sm:w-[78px]">
					<Image src={video.thumbnail} alt={video.title} fill sizes="78px" style={{ objectFit: "cover" }} />
				</div>
			) : (
				<div className="flex h-[40px] w-[70px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 sm:h-[44px] sm:w-[78px]">
					<VideoPlaceholderIcon />
				</div>
			)}
			<div className="flex min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-slate-800">{video.title}</p>
			</div>
			<button
				onClick={onRemove}
				className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
			>
				Remove
			</button>
		</div>
	);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "general" | "videos";

interface PlaylistInspectionModalProps {
	playlist: Playlist;
	changes: PlaylistChanges | null;
	saving: boolean;
	inputChange: (modifier: Record<string, any>) => void;
	deleteChange: (key: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onArchive: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const PlaylistInspectionModal = ({
	playlist,
	changes,
	saving,
	inputChange,
	deleteChange,
	onCancel,
	onSave,
	onArchive,
}: PlaylistInspectionModalProps) => {
	const [activeTab, setActiveTab] = useState<Tab>("general");
	const [searchResults, setSearchResults] = useState<Video[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [showImageLoader, setShowImageLoader] = useState(false);
	const [localVideos, setLocalVideos] = useState<Video[]>((playlist.videos as Video[]) || []);

	const isDirty = changes && Object.keys(changes).length > 0;
	const changeCount = isDirty ? Object.keys(changes).length : 0;

	// Stable ref so the keydown listener never needs to be re-registered on re-renders
	const onCancelRef = useRef(onCancel);
	useEffect(() => { onCancelRef.current = onCancel; });

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancelRef.current();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Scroll add-video section into view when it opens
	const addSectionRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (!showSearch) return;
		const timer = setTimeout(() => {
			addSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 50);
		return () => clearTimeout(timer);
	}, [showSearch]);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setShowImageLoader(true);
		try {
			const result = await UploadImage({ image: file, route: "thumbnails/", id: playlist.id });
			if (result.success) inputChange({ banner_image: result.data.data.url });
			else toast.error("Failed to upload image");
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setShowImageLoader(false);
		}
	};

	const handleAddVideo = (video: Video) => {
		if (localVideos.find((v) => v.id === video.id)) {
			toast.error("Video already in playlist");
			return;
		}
		setLocalVideos((prev) => [video, ...prev]);
		setSearchResults([]);
		inputChange({ add_videos: [...(changes?.add_videos || []), video.id] });
	};

	const handleRemoveVideo = (video: Video) => {
		setLocalVideos((prev) => prev.filter((v) => v.id !== video.id));
		if ((changes?.add_videos || []).includes(video.id)) {
			const arr = (changes?.add_videos || []).filter((id) => id !== video.id);
			if (arr.length === 0) deleteChange("add_videos");
			else inputChange({ add_videos: arr });
		} else {
			inputChange({ remove_videos: [...(changes?.remove_videos || []), video.id] });
		}
	};

	const closeSearch = () => {
		setShowSearch(false);
		setSearchResults([]);
		setSearchLoading(false);
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]" onClick={onCancel} aria-hidden="true" />

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[760px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Edit Playlist"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
								{playlist.name}
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								{isDirty
									? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
									: "Edit playlist details"}
							</p>
						</div>
						<button
							onClick={onCancel}
							className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							aria-label="Close"
						>
							<XIcon />
						</button>
					</div>

					{/* Tabs */}
					<div className="mt-4 flex gap-1">
						{(["general", "videos"] as Tab[]).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={[
									"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
									activeTab === tab
										? "bg-blue-50 text-blue-700"
										: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
								].join(" ")}
							>
								{tab === "general"
									? "General"
									: `Videos${localVideos.length > 0 ? ` (${localVideos.length})` : ""}`}
							</button>
						))}
					</div>
				</div>

				{/* Scrollable content */}
				<div className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-4 ${activeTab === "videos" && showSearch ? "pb-72" : ""}`}>
					{/* ── General tab ── */}
					{activeTab === "general" && (
						<div className="flex flex-col gap-5 px-2 py-2">
							<TeamModalInput
								title="Title"
								placeholder="Playlist title"
								value={playlist.name}
								setValue={(value) => {
									if (value !== playlist.name) inputChange({ name: value });
									else deleteChange("name");
								}}
							/>
							<TeamModalTextarea
								title="Description"
								placeholder="Playlist description"
								value={playlist.description}
								className="h-[120px]"
								setValue={(value) => {
									if (value !== playlist.description) inputChange({ description: value });
									else deleteChange("description");
								}}
							/>
							<TeamModalInput
								title="Route"
								placeholder="playlist-route"
								value={playlist.route}
								setValue={(value) => {
									if (value !== playlist.route) inputChange({ route: value });
									else deleteChange("route");
								}}
							/>
							<TeamModalSelect
								title="Status"
								values={PlaylistStatuses}
								value={playlist.status}
								setValue={(value) => {
									if (value.id !== playlist.status.id) inputChange({ status: value.id });
									else deleteChange("status");
								}}
							/>
							<div className="flex flex-col gap-2">
								<TeamModalInput
									title="Banner Image URL"
									placeholder="Banner image URL"
									value={changes?.banner_image || playlist.banner_image}
									setValue={(value) => {
										if (value !== playlist.banner_image) inputChange({ banner_image: value });
										else deleteChange("banner_image");
									}}
								/>
								<TeamModalUploader
									imageSource={changes?.banner_image || playlist.banner_image}
									altText="Playlist banner"
									showImageLoader={showImageLoader}
									onChange={handleThumbnailUpload as any}
								/>
							</div>
						</div>
					)}

					{/* ── Videos tab ── */}
					{activeTab === "videos" && (
						<div className="flex flex-col gap-1">
							{/* Add video toggle row */}
							<div
								ref={addSectionRef}
								className={`rounded-xl border transition-all ${showSearch ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-white"}`}
							>
								<div className="flex items-center justify-between gap-3 p-3">
									<p className="text-sm font-medium text-slate-600">
										{localVideos.length > 0
											? `${localVideos.length} video${localVideos.length !== 1 ? "s" : ""} in playlist`
											: "No videos added yet"}
									</p>
									<button
										onClick={() => (showSearch ? closeSearch() : setShowSearch(true))}
										className={[
											"shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
											showSearch
												? "border-blue-200 bg-blue-50 text-blue-600"
												: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
										].join(" ")}
									>
										{showSearch ? "Done" : "Add Video"}
									</button>
								</div>

								{/* Inline search — expands like spotlight's Replace section */}
								{showSearch && (
									<div className="border-t border-slate-100 px-3 pb-3 pt-2.5">
										<TeamModalInput
											value=""
											placeholder="Search to add a video…"
											delay={250}
											loading={searchLoading}
											dropdown={searchResults.length > 0 ? GenerateGeneralNSM(searchResults) : undefined}
											setValue={(v) => { if (v.length === 0) setSearchResults([]); }}
											setDelayedValue={async (v) => {
												if (v.length < 2) { setSearchResults([]); setSearchLoading(false); return; }
												setSearchLoading(true);
												try {
													const response = await reqGetVideos({ search: v, limit: 8, offset: 0 });
													if (response.success) {
														setSearchResults(
															response.data.filter(
																(vid: Video) => !localVideos.find((lv) => lv.id === vid.id)
															)
														);
													} else {
														setSearchResults([]);
													}
												} finally {
													setSearchLoading(false);
												}
											}}
											dropdownClick={(dropItem) => {
												const found = searchResults.find((v) => v.id === dropItem.id);
												if (found) handleAddVideo(found);
											}}
										/>
									</div>
								)}
							</div>

							{/* Video list */}
							{localVideos.length > 0 ? (
								<div className="mt-1 flex flex-col gap-1">
									{localVideos.map((video) => (
										<VideoItem
											key={video.id}
											video={video}
											onRemove={() => handleRemoveVideo(video)}
										/>
									))}
								</div>
							) : !showSearch ? (
								<div className="mt-1 rounded-xl border border-dashed border-slate-200 py-10 text-center">
									<p className="text-sm font-medium text-slate-400">No videos in this playlist</p>
									<p className="mt-1 text-xs text-slate-300">Use "Add Video" above to add videos</p>
								</div>
							) : null}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={onArchive}
							className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							Archive
						</button>
						<div className="flex items-center gap-2">
							<button
								onClick={onCancel}
								className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
							>
								Cancel
							</button>
							<button
								onClick={onSave}
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
			</div>
		</>
	);
};

export default PlaylistInspectionModal;
