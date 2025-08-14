import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useCallback, useEffect, useState } from "react";
import { Video } from "../../../models/video.model";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import { VideoStatus } from "../../../models/videoStatus.model";
import CreateVideoModal from "../../../components/pages/team/video/CreateVideoModal";
import SpotlightedVideosModal from "../../../components/pages/team/video/SpotlightedVideosModal";
import VideoInspectionModal from "../../../components/pages/team/videos/VideoInspectionModal";
import Button from "../../../components/general/Button";
import { UpdateVideo } from "../../../hooks/UpdateVideo";
import { QueryVideos } from "../../../hooks/QueryVideos";
import { CreateDownloadUrl } from "../../../hooks/CreateDownloadUrl";
import { QuerySpotlight } from "../../../hooks/QuerySpotlight";

const VideosPage = () => {
	const router = useRouter();
	const [videos, setVideos] = useState<Video[] | null>(null);
	const [spotlightedVideos, setSpotlightedVideos] = useState<Video[] | null>(
		null
	);
	const [showConfirmDeleteVideo, setShowConfirmDeleteVideo] =
		useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);

	// Video Inspector
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);

	// Video Uploader
	const [showUploadVideo, setShowUploadVideo] = useState<boolean>(false);

	// Spotlight
	const [spotlightControls, setSpotlightControls] = useState<boolean>(false);

	// Video Inspector DownloadButton
	const [downloadButtonParams, setDownloadButtonParams] = useState<any>({
		loading: false,
		text: "Generate Download",
		disabled: false,
	});

	// Thumbnail Selector
	const [showThumbnailSelector, setShowThumbnailSelector] =
		useState<boolean>(false);

	// Escape Handlers
	const escFunction = useCallback((e: any) => {
		if (e.key === "Escape") {
			cancelVideoInspection();
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", escFunction, false);

		return () => {
			document.removeEventListener("keydown", escFunction, false);
		};
	}, [escFunction]);

	useEffect(() => {
		if (spotlightControls) {
			hydrateSpotlight();
		} else {
			setSpotlightedVideos(null);
		}
	}, [spotlightControls]);

	useEffect(() => {
		initialize();
	}, []);

	const hydrateSpotlight = async () => {
		const response = await QuerySpotlight({
			limit: 20,
			offset: 0,
		});
		if (response.success) {
			let data = response.data;
			console.log(data);
			setSpotlightedVideos(data);
		}
	};

	const initialize = async () => {
		setVideos(null);
		setOffset(0);
		const response = await QueryVideos({
			limit: 20,
			offset: 0,
		});
		if (response.success) {
			let data = response.data;
			console.log(data);
			setVideos(data);
		}
	};

	const generateCloudflareDownload = async () => {
		if (
			selectedVideo &&
			selectedVideo.url &&
			selectedVideo.url.includes(
				"https://customer-nakrsdfbtn3mdz5z.cloudflarestream.com"
			) &&
			!selectedVideo.download_url &&
			selectedVideo.url.endsWith("video.m3u8")
		) {
			setDownloadButtonParams({
				loading: true,
				text: "Generating...",
				disabled: false,
			});
			let id = selectedVideo.url.match(
				`cloudflarestream\.com\/([a-zA-Z0-9]+)\/manifest`
			)?.[1];
			if (id && id.length > 0) {
				const response = await CreateDownloadUrl(id);
				if (response.success) {
					console.log(response.data.result.default.url);
					inputChange({
						download_url: response.data.result.default.url,
					});
					setDownloadButtonParams({
						loading: false,
						disabled: true,
						text: "Done",
					});
				} else {
					console.error(response);
					toast.error(response.error_message);
					setDownloadButtonParams({
						loading: false,
						disabled: false,
						text: "Failed",
					});
				}
			} else {
				toast.error("Please enter a valid source URL first");
			}
		} else {
			toast.error("Please enter a source URL first");
		}
	};

	const loadMore = async () => {
		let newOffset = offset + 20;
		setOffset(newOffset);
		const response = await QueryVideos({
			limit: 20,
			offset: newOffset,
		});
		if (response.success) {
			let data = response.data;
			console.log(data);
			setVideos([...videos!, ...data]);
		}
	};

	const cancelVideoInspection = async () => {
		setSelectedVideo(null);
		setChanges(null);
		setSaving(false);
		setDownloadButtonParams({
			loading: false,
			text: "Generate Download",
			disabled: false,
		});
		setShowThumbnailSelector(false);
	};

	const inputChange = async (modifier: Object) => {
		setChanges({ ...changes, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...changes };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setChanges(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	const saveVideoInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await UpdateVideo(selectedVideo!.id, changes);
			if (response.success) {
				setSelectedVideo(null);
				setChanges(null);
				setSaving(false);
				initialize();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", {
					position: "top-center",
				});
			}
		} else {
			setSelectedVideo(null);
		}
	};

	const archiveVideo = async () => {
		const response = await UpdateVideo(selectedVideo!.id, {
			status: VideoStatus.Archived,
		});
		if (response.success) {
			setSelectedVideo(null);
			setChanges(null);
			setSaving(false);
			initialize();
		} else {
			console.error(response);
			setSaving(false);
			toast.error("Failed to save changes", {
				position: "top-center",
			});
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
				setShow={setShowConfirmDeleteVideo}
				show={showConfirmDeleteVideo}
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
					setShowConfirmDeleteVideo={setShowConfirmDeleteVideo}
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
			{/* Data Header */}
			<div className="text-sm grid grid-cols-[1fr_80px] sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-6 items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="hidden md:block w-[200px] xl:w-[250px]" />
				<p className="font-semibold">Title</p>
				<p className="hidden xl:block font-semibold">Downloads</p>
				<p className="font-semibold hidden md:block">Views</p>
				<p className="hidden md:block font-semibold">Status</p>
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>

			{/* Table Body */}
			<div className="w-full h-[calc(100%-100px)] md:h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{videos && videos.length > 0 ? (
							videos.map((video, index) => {
								return (
									<div
										key={index}
										className="text-sm relative grid grid-cols-[1fr_80px] sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-6 items-center w-full h-[50px] sm:h-[100px] flex-shrink-0 hover:bg-slate-50 cursor-pointer"
										onClick={() => {
											setDownloadButtonParams({
												loading: false,
												text: "Generate Download",
												disabled: false,
											});
											setSelectedVideo(video);
										}}
									>
										{/* Thumbnail */}
										<div className="px-2 hidden md:flex items-center justify-center">
											<div
												className="relative w-[130px] h-[75px] rounded-md overflow-hidden shadow-md border cursor-pointer"
												onClick={() => {
													document
														.getElementById("watch-video-" + video.uuid)
														?.click();
												}}
											>
												<Image
													fill
													style={{
														objectFit: "cover",
													}}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
													src={video.thumbnail}
													alt={"video " + video.title}
												/>
											</div>
										</div>

										{/* Title */}
										<p className="pr-2">{video.title}</p>

										{/* Downloads */}
										<p className="hidden xl:block pr-2">
											{video.downloads}{" "}
											{video.downloads > 1 || video.downloads == 0
												? "downloads"
												: "download"}
										</p>

										{/* Views */}
										<p className="pr-2 hidden md:block">{video.views} views</p>

										{/* Status */}
										<p className="">
											<a
												className={
													"sm:px-3 sm:py-1.5 sm:text-sm sm:rounded-md px-2 py-1 rounded text-xs " +
													(video.status.short_name == "public"
														? "text-white bg-green-500"
														: video.status.short_name == "unlisted"
														? "text-white bg-green-700"
														: "text-white bg-slate-500")
												}
											>
												{video.status.name}
											</a>
										</p>

										{/* Actions */}
										<div className="gap-2 justify-end pr-2 absolute right-0 hidden sm:flex">
											<Button
												onClick={() => {
													setDownloadButtonParams({
														loading: false,
														text: "Generate Download",
														disabled: false,
													});
													setSelectedVideo(video);
												}}
											>
												Inspect
											</Button>
											{video.status.short_name != "draft" && (
												<Link
													href={"https://hillview.tv/watch?v=" + video.uuid}
													target="_blank"
													className="hidden lg:block"
													id={"watch-video-" + video.uuid}
												>
													<Button variant="secondary">Watch</Button>
												</Link>
											)}
											{video.status.short_name != "public" && (
												<Button
													onClick={async () => {
														const response = await UpdateVideo(video.id, {
															status: VideoStatus.Public,
														});
														if (response.success) {
															initialize();
														} else {
															console.error(response);
															setSaving(false);
															toast.error("Failed to save changes", {
																position: "top-center",
															});
														}
													}}
												>
													Publish
												</Button>
											)}
										</div>
									</div>
								);
							})
						) : (
							<div className="w-full h-[100px] flex items-center justify-center">
								<Spinner />
							</div>
						)}
						{videos && videos.length > 0 && (
							<div className="w-full h-[80px] sm:h-[150px] flex items-center justify-center">
								<Button onClick={loadMore}>Load More</Button>
							</div>
						)}
					</>
				</div>
			</div>
		</TeamContainer>
	);
};

export default VideosPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Videos",
		},
	};
};
