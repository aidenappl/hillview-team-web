import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalList from "../TeamModalList";
import Spinner from "../../../general/Spinner";
import ValidPlaylist from "../../../../validators/playlist.validator";
import { GenerateGeneralNSM } from "../../../../models/generalNSM.model";
import { reqCreatePlaylist } from "../../../../services/api/playlist.service";
import { reqGetVideos } from "../../../../services/api/video.service";
import { Video, PlaylistInput } from "../../../../types";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
		aria-hidden="true"
	>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_BANNER = "https://content.hillview.tv/thumbnails/default.jpg";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	cancelHit?: () => void;
	saveDone?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CreatePlaylistModal = ({
	cancelHit = () => {},
	saveDone = () => {},
}: Props) => {
	const [playlist, setPlaylist] = useState<
		Partial<Omit<PlaylistInput, "videos">> & { videos?: Video[] }
	>({ banner_image: DEFAULT_BANNER });
	const [saving, setSaving] = useState(false);
	const [saveActive, setSaveActive] = useState(false);
	const [showImageLoader, setShowImageLoader] = useState(false);
	const [searchResults, setSearchResults] = useState<Video[] | null>(null);
	const [searchLoading, setSearchLoading] = useState(false);

	// ── Helpers ──────────────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setPlaylist((prev) => applyChange(prev, modifier) as typeof prev);
	};

	const deleteChange = (key: string) => {
		setPlaylist((prev) => (removeChange(prev, key) ?? {}) as typeof prev);
	};

	const parsePlaylist = (given: any) => {
		if (given?.videos) {
			given.videos = given.videos.map((v: any) => v.id);
		}
		return given;
	};

	// Stable ref so the keydown listener never needs to be re-registered on re-renders
	const cancelHitRef = useRef(cancelHit);
	useEffect(() => { cancelHitRef.current = cancelHit; });

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") cancelHitRef.current();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Validation ───────────────────────────────────────────────────────────

	useEffect(() => {
		const { error } = ValidPlaylist(parsePlaylist({ ...playlist }));
		setSaveActive(!error);
	}, [playlist]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setShowImageLoader(true);
		try {
			const result = await UploadImage({ image: file, route: "thumbnails/", id: 0 });
			if (result.success) {
				inputChange({ banner_image: result.data.data.url });
			} else {
				toast.error("Failed to upload image");
			}
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setShowImageLoader(false);
		}
	};

	const handleAddVideo = (item: any) => {
		setSearchResults(null);
		if (playlist.videos?.find((v) => v.id === item.id)) {
			toast.error("Video already added");
			return;
		}
		setPlaylist((prev) => ({
			...prev,
			videos: [item, ...(prev.videos || [])],
		}));
	};

	const handleRemoveVideo = (item: any) => {
		setPlaylist((prev) => ({
			...prev,
			videos: (prev.videos || []).filter((v) => v.id !== item.id),
		}));
	};

	const runCreatePlaylist = async () => {
		if (saving) return;
		const parsed = parsePlaylist({ ...playlist });
		const { error, value } = ValidPlaylist(parsed);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		try {
			const response = await reqCreatePlaylist(value);
			if (response.success) {
				toast.success("Playlist created");
				saveDone();
			} else {
				toast.error(response.error_message || "Failed to create playlist");
			}
		} finally {
			setSaving(false);
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={!saving ? cancelHit : undefined}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[760px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Create Playlist"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Create Playlist
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								Fill in the details below to create a new playlist
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

				{/* Scrollable content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					<div className="flex flex-col gap-5">
						{/* Title */}
						<TeamModalInput
							title="Title"
							placeholder="Enter the title of the playlist..."
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ name: value });
								else deleteChange("name");
							}}
						/>

						{/* Route */}
						<TeamModalInput
							title="Route"
							placeholder="playlist-route (e.g. hillview-show)"
							value={playlist.route || ""}
							required
							setValue={(value) => {
								if (value.length > 0) {
									inputChange({ route: value.replaceAll(" ", "-").replaceAll("/", "") });
								} else {
									deleteChange("route");
								}
							}}
						/>

						{/* Description */}
						<TeamModalTextarea
							title="Description"
							placeholder="Enter a description for this playlist..."
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ description: value });
								else deleteChange("description");
							}}
						/>

						{/* Banner Image */}
						<div className="flex flex-col gap-2">
							<TeamModalInput
								title="Banner Image URL"
								placeholder="Banner image URL..."
								value={playlist.banner_image || ""}
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ banner_image: value });
									else deleteChange("banner_image");
								}}
							/>
							<TeamModalUploader
								imageSource={playlist.banner_image || DEFAULT_BANNER}
								altText="Playlist banner"
								showImageLoader={showImageLoader}
								onChange={handleThumbnailUpload as any}
							/>
						</div>

						{/* Video Search */}
						<TeamModalInput
							title="Add Videos"
							placeholder="Search for a video to add..."
							value=""
							loading={searchLoading}
							dropdown={searchResults ? GenerateGeneralNSM(searchResults) : undefined}
							dropdownClick={handleAddVideo}
							setDelayedValue={async (value) => {
								if (value.length < 3) {
									setSearchResults(null);
									return;
								}
								setSearchLoading(true);
								try {
									const response = await reqGetVideos({ search: value, limit: 8, offset: 0 });
									if (response.success) {
										const filtered = response.data.filter(
											(v: Video) => !(playlist.videos || []).find((pv) => pv.id === v.id)
										);
										setSearchResults(filtered);
									} else {
										setSearchResults(null);
									}
								} finally {
									setSearchLoading(false);
								}
							}}
							setValue={(value) => {
								if (value.length === 0) setSearchResults(null);
							}}
						/>

						{/* Video List */}
						{(playlist.videos || []).length > 0 ? (
							<TeamModalList
								title={`Added Videos (${playlist.videos!.length})`}
								list={GenerateGeneralNSM(playlist.videos ?? [])}
								destructiveClick={handleRemoveVideo}
								itemClick={(item) =>
									window.open("https://hillview.tv/watch?v=" + item.id, "_blank")
								}
							/>
						) : (
							<div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
								<p className="text-sm font-medium text-slate-400">No videos added yet</p>
								<p className="mt-1 text-xs text-slate-300">Search above to add videos</p>
							</div>
						)}
					</div>
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
							onClick={runCreatePlaylist}
							disabled={!saveActive || saving}
							className={[
								"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
								saveActive && !saving
									? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-300",
							].join(" ")}
						>
							{saving ? (
								<>
									<Spinner style="light" size={16} />
									<span>Creating…</span>
								</>
							) : (
								<span>Create Playlist</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreatePlaylistModal;
