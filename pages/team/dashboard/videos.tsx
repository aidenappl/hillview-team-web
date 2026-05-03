import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import { VideoStatus } from "../../../models/videoStatus.model";
import CreateVideoModal from "../../../components/pages/team/video/CreateVideoModal";
import SpotlightedVideosModal from "../../../components/pages/team/video/SpotlightedVideosModal";
import VideoInspectionModal from "../../../components/pages/team/videos/VideoInspectionModal";
import Button from "../../../components/general/Button";
import FilterSortBar, { SortOption, StatusOption } from "../../../components/pages/team/FilterSortBar";
import { reqUpdateVideo } from "../../../services/api/video.service";
import { reqGetUsers } from "../../../services/api/user.service";
import { GetStaticProps } from "next";
import { VideosTable } from "../../../components/pages/team/video/VideosTable";
import { useVideos } from "../../../hooks/videos/useVideos";
import { useSpotlight } from "../../../hooks/videos/useSpotlight";
import { useVideoInspector } from "../../../hooks/videos/useVideoInspector";
import { User, Video } from "../../../types";

// ─── Filter config ────────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
	{ value: "date_desc",      label: "Newest first" },
	{ value: "date_asc",       label: "Oldest first" },
	{ value: "views_desc",     label: "Most views" },
	{ value: "downloads_desc", label: "Most downloads" },
];

const STATUS_OPTIONS: StatusOption[] = [
	{ id: 1, label: "Public",   activeClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
	{ id: 2, label: "Draft",    activeClass: "border-amber-200 bg-amber-50 text-amber-700" },
	{ id: 3, label: "Unlisted", activeClass: "border-blue-200 bg-blue-50 text-blue-700" },
	{ id: 4, label: "Archived", activeClass: "border-red-200 bg-red-50 text-red-600" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const VideosPage = () => {
	const router = useRouter();

	// Modals & toggles
	const [showUploadVideo, setShowUploadVideo] = useState(false);
	const [spotlightControls, setSpotlightControls] = useState(false);
	const [showConfirmArchive, setShowConfirmArchive] = useState(false);

	// Users list for creator filter
	const [users, setUsers] = useState<User[]>([]);
	useEffect(() => {
		reqGetUsers({ limit: 100, offset: 0 }).then((res) => {
			if (res.success) setUsers(res.data);
		}).catch(() => {
			// Non-critical — creator filter just won't populate
		});
	}, []);

	// Data + filter state from hook
	const {
		videos,
		initialize,
		loadMore,
		loadingMore,
		searchVideos,
		search,
		setSearch,
		sortBy,
		setSortBy,
		sortDir,
		setSortDir,
		activeStatuses,
		setActiveStatuses,
		creatorUserId,
		setCreatorUserId,
	} = useVideos();

	// Derived sort UI value (e.g. "views_desc")
	const sortValue = `${sortBy}_${sortDir}`;
	const handleSort = (v: string) => {
		const [col, dir] = v.split("_") as [typeof sortBy, typeof sortDir];
		setSortBy(col);
		setSortDir(dir);
	};

	const handleStatusToggle = (id: number) => {
		setActiveStatuses((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const { spotlightedVideos, hydrateSpotlight, clearSpotlight } = useSpotlight();

	// Inspector
	const {
		selectedVideo,
		setSelectedVideo,
		saving,
		changes,
		inputChange,
		deleteChange,
		cancelVideoInspection,
		saveVideoInspection,
		showThumbnailSelector,
		setShowThumbnailSelector,
		downloadButtonParams,
		generateCloudflareDownload,
		resetDownloadBtn,
	} = useVideoInspector({ onSaved: initialize });

	// Spotlight hydrate when opened
	useEffect(() => {
		if (spotlightControls) hydrateSpotlight();
		else clearSpotlight();
	}, [spotlightControls, hydrateSpotlight, clearSpotlight]);

	// Escape closes inspector
	const escHandler = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				cancelVideoInspection();
				setSpotlightControls(false);
			}
		},
		[cancelVideoInspection]
	);

	useEffect(() => {
		document.addEventListener("keydown", escHandler);
		return () => document.removeEventListener("keydown", escHandler);
	}, [escHandler]);

	// Fetch — re-runs when initialize changes (i.e. when sort/filter state changes)
	useEffect(() => {
		initialize();
	}, [initialize]);

	const archiveVideo = async () => {
		if (!selectedVideo) return;
		const response = await reqUpdateVideo(selectedVideo.id, {
			status: VideoStatus.Archived,
		});
		if (response.success) {
			cancelVideoInspection();
			initialize();
		} else {
			console.error(response);
			toast.error("Failed to save changes", { position: "top-center" });
		}
	};

	return (
		<TeamContainer pageTitle="Videos" router={router}>
			<PageModal
				titleText="Archive Video"
				bodyText="Are you sure you want to archive this video? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={archiveVideo}
				setShow={setShowConfirmArchive}
				show={showConfirmArchive}
			/>
			{showUploadVideo ? (
				<CreateVideoModal
					saveDone={() => {
						setShowUploadVideo(false);
						initialize();
					}}
					cancelHit={() => setShowUploadVideo(false)}
				/>
			) : null}
			{spotlightControls ? (
				<SpotlightedVideosModal
					spotlightedVideos={spotlightedVideos}
					onSearchVideos={searchVideos}
					saveDone={() => setSpotlightControls(false)}
					cancelHit={() => setSpotlightControls(false)}
				/>
			) : null}
			{selectedVideo ? (
				<VideoInspectionModal
					changes={changes}
					saving={saving}
					selectedVideo={selectedVideo}
					inputChange={inputChange}
					deleteChange={deleteChange}
					cancelVideoInspection={cancelVideoInspection}
					saveVideoInspection={saveVideoInspection}
					setShowConfirmDeleteVideo={setShowConfirmArchive}
					generateCloudflareDownload={generateCloudflareDownload}
					showThumbnailSelector={showThumbnailSelector}
					setShowThumbnailSelector={setShowThumbnailSelector}
					downloadButtonParams={downloadButtonParams}
				/>
			) : null}

			<TeamHeader title="Platform Videos">
				<Button variant="secondary" onClick={() => setSpotlightControls(true)}>
					Manage Spotlight
				</Button>
				<Button variant="primary" onClick={() => setShowUploadVideo(true)}>
					Upload Video
				</Button>
			</TeamHeader>

			<FilterSortBar
				search={search}
				onSearch={setSearch}
				searchPlaceholder="Search videos…"
				sortValue={sortValue}
				onSort={handleSort}
				sortOptions={SORT_OPTIONS}
				statusOptions={STATUS_OPTIONS}
				activeStatuses={activeStatuses}
				onStatusToggle={handleStatusToggle}
			>
				{users.length > 0 && (
					<select
						value={creatorUserId ?? ""}
						onChange={(e) => setCreatorUserId(e.target.value ? Number(e.target.value) : null)}
						className="h-9 rounded-lg border border-slate-200 bg-white px-3 pr-7 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none cursor-pointer"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "14px" }}
					>
						<option value="">All creators</option>
						{users.map((u) => (
							<option key={u.id} value={u.id}>{u.name}</option>
						))}
					</select>
				)}
			</FilterSortBar>

			<VideosTable
				videos={videos}
				onInspect={(v: Video) => {
					resetDownloadBtn();
					setSelectedVideo(v);
				}}
				onPublish={async (v: Video) => {
					const res = await reqUpdateVideo(v.id, { status: VideoStatus.Public });
					if (res.success) initialize();
					else {
						console.error(res);
						toast.error("Failed to save changes", { position: "top-center" });
					}
				}}
				onLoadMore={loadMore}
				loadingMore={loadingMore}
				hasActiveFilters={!!search.trim() || activeStatuses.length > 0 || creatorUserId !== null}
				onClearFilters={() => {
					setSearch("");
					setActiveStatuses([]);
					setCreatorUserId(null);
				}}
			/>
		</TeamContainer>
	);
};

export default VideosPage;

export const getStaticProps: GetStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Videos",
		},
	};
};
