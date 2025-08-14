import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { useEffect, useState } from "react";
import { Video } from "../../../models/video.model";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import { VideoStatus } from "../../../models/videoStatus.model";
import CreateVideoModal from "../../../components/pages/team/video/CreateVideoModal";
import SpotlightedVideosModal from "../../../components/pages/team/video/SpotlightedVideosModal";
import VideoInspectionModal from "../../../components/pages/team/videos/VideoInspectionModal";
import Button from "../../../components/general/Button";
import { UpdateVideo } from "../../../hooks/UpdateVideo";
import { GetStaticProps } from "next";
import { VideosTable } from "../../../components/pages/team/video/VideosTable";
import { useVideos } from "../../../hooks/videos/useVideos";
import { useSpotlight } from "../../../hooks/videos/useSpotlight";
import { useVideoInspector } from "../../../hooks/videos/useVideoInspector";

const VideosPage = () => {
	const router = useRouter();
	// Modals & toggles
	const [showUploadVideo, setShowUploadVideo] = useState(false);
	const [spotlightControls, setSpotlightControls] = useState(false);
	const [showConfirmArchive, setShowConfirmArchive] = useState(false);

	// Data
	const { videos, initialize, loadMore, loadingMore } = useVideos();
	const { spotlightedVideos, hydrateSpotlight, clearSpotlight } =
		useSpotlight();

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

	// Initial load
	useEffect(() => {
		initialize();
	}, [initialize]);

	const archiveVideo = async () => {
		if (!selectedVideo) return;
		const response = await UpdateVideo(selectedVideo.id, {
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
				cancelHit={() => {
					// do nothing
				}}
				actionHit={() => {
					archiveVideo();
				}}
				setShow={setShowConfirmArchive}
				show={showConfirmArchive}
			/>
			{showUploadVideo ? (
				<CreateVideoModal
					saveDone={() => {
						setShowUploadVideo(false);
						initialize();
					}}
					cancelHit={() => {
						setShowUploadVideo(false);
					}}
				/>
			) : null}
			{spotlightControls ? (
				<SpotlightedVideosModal
					spotlightedVideos={spotlightedVideos}
					saveDone={() => {
						setSpotlightControls(false);
					}}
					cancelHit={() => {
						setSpotlightControls(false);
					}}
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
			{/* Team Heading */}
			<TeamHeader title="System Videos">
				<Button
					size="medium"
					variant="secondary"
					onClick={() => setSpotlightControls(true)}
				>
					Spotlight
				</Button>
				<Button
					size="medium"
					variant="primary"
					onClick={() => {
						setShowUploadVideo(true);
					}}
				>
					Upload Video
				</Button>
			</TeamHeader>
			<VideosTable
				videos={videos}
				onInspect={(v: Video) => {
					resetDownloadBtn();
					setSelectedVideo(v);
				}}
				onPublish={async (v: Video) => {
					const res = await UpdateVideo(v.id, { status: VideoStatus.Public });
					if (res.success) initialize();
					else {
						console.error(res);
						toast.error("Failed to save changes", { position: "top-center" });
					}
				}}
				onLoadMore={loadMore}
				loadingMore={loadingMore}
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
