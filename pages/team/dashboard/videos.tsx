import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useCallback, useEffect, useState } from "react";
import { Video } from "../../../models/video.model";
import Image from "next/image";
import { NewRequest } from "../../../services/http/requestHandler";
import Link from "next/link";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import { VideoStatus, VideoStatuses } from "../../../models/videoStatus.model";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import CreateVideoModal from "../../../components/pages/team/video/CreateVideoModal";
import TeamModalCheckbox from "../../../components/pages/team/TeamModalCheckbox";
import TeamModalUploader from "../../../components/pages/team/TeamModalUploader";
import UploadImage from "../../../services/uploadHandler";
import imageCompression from "browser-image-compression";
import { FrameGrabber } from "../../../components/pages/team/video/FrameGrabber";
import SpotlightedVideosModal from "../../../components/pages/team/video/SpotlightedVideosModal";

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
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);

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
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/spotlight",
			params: {
				limit: 20,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setSpotlightedVideos(data);
		}
	};

	const initialize = async () => {
		setVideos(null);
		setOffset(0);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/videos",
			params: {
				limit: 20,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
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
				const response = await NewRequest({
					method: "POST",
					route: `/video/v1.1/upload/cf/${id}/generateDownload`,
					auth: true,
				});
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
					toast.error(response.message);
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
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/videos",
			params: {
				limit: 20,
				offset: newOffset,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
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
			const response = await NewRequest({
				method: "PUT",
				route: "/core/v1.1/admin/video/" + selectedVideo!.id,
				body: {
					id: selectedVideo!.id,
					changes: changes,
				},
				auth: true,
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
		} else {
			setSelectedVideo(null);
		}
	};

	const archiveVideo = async () => {
		const response = await NewRequest({
			method: "PUT",
			route: "/core/v1.1/admin/video/" + selectedVideo!.id,
			body: {
				changes: {
					status: VideoStatus.Archived,
				},
			},
			auth: true,
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
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={changes && Object.keys(changes).length > 0}
					cancelHit={() => cancelVideoInspection()}
					saveHit={() => saveVideoInspection()}
					deleteHit={() => setShowConfirmDeleteVideo(true)}
					destructiveText="Archive"
				>
					<TeamModalInput
						title="Title"
						placeholder="Video Title"
						value={selectedVideo.title}
						setValue={(value: string) => {
							if (value != selectedVideo.title) {
								inputChange({ title: value });
							} else {
								deleteChange("title");
							}
						}}
					/>
					<TeamModalTextarea
						title="Description"
						placeholder="Video Description"
						value={selectedVideo.description}
						className="h-[150px]"
						setValue={(value: string) => {
							if (value != selectedVideo.description) {
								inputChange({ description: value });
							} else {
								deleteChange("description");
							}
						}}
					/>
					<TeamModalSelect
						title="Status"
						values={VideoStatuses}
						value={selectedVideo.status}
						setValue={(value) => {
							if (value.id != selectedVideo.status.id) {
								inputChange({ status: value.id });
							} else {
								deleteChange("status");
							}
						}}
					/>
					<TeamModalInput
						title="Source URL"
						placeholder="Video Source URL"
						value={selectedVideo.url}
						setValue={(value: string) => {
							if (value != selectedVideo.url) {
								inputChange({ url: value });
							} else {
								deleteChange("url");
							}
						}}
					/>
					<FrameGrabber
						show={showThumbnailSelector}
						url={selectedVideo.download_url}
						onCloseHit={() => {
							setShowThumbnailSelector(false);
						}}
						onSelectFrame={(timestamp: number) => {
							setShowThumbnailSelector(false);
							let baseURL = selectedVideo.download_url.replaceAll(
								"/downloads/default.mp4",
								""
							);
							let newURL =
								baseURL +
								"/thumbnails/thumbnail.jpg?time=" +
								timestamp +
								"s&width=1280&height=720";
							console.log(newURL);
							inputChange({ thumbnail: newURL });
						}}
					/>
					<TeamModalInput
						title="Thumbnail URL"
						placeholder="Video Thumbnail URL"
						showActionButton={
							selectedVideo.download_url &&
							selectedVideo.download_url.includes(
								"https://customer-nakrsdfbtn3mdz5z.cloudflarestream.com/"
							)
								? true
								: false
						}
						actionButtonText="Video Grab"
						actionButtonClick={() => {
							setShowThumbnailSelector(true);
						}}
						value={changes?.thumbnail || selectedVideo.thumbnail}
						setValue={(value: string) => {
							if (value != selectedVideo.thumbnail) {
								inputChange({ thumbnail: value });
							} else {
								deleteChange("thumbnail");
							}
						}}
					/>
					<TeamModalUploader
						imageSource={
							changes?.thumbnail || selectedVideo.thumbnail
						}
						altText={selectedVideo.title}
						showImageLoader={showImageLoader}
						onChange={async (e: any): Promise<void> => {
							if (e.target.files && e.target.files.length > 0) {
								if (e.target.files.length != 1) {
									toast.error("Please only upload one image");
									return;
								}
								const file = e.target.files[0];
								// check max size 1mb
								if (file.size > 1000000) {
									// alert and ask if they want to compress
									let response = window.confirm(
										"Image is larger than 1MB. Would you like to compress it?"
									);
									if (response) {
										// toggle loader
										setShowImageLoader(true);

										// compress image
										const options = {
											maxSizeMB: 1,
											useWebWorker: true,
										};
										const compressedFile =
											await imageCompression(
												file,
												options
											);

										// upload image
										let result = await UploadImage({
											image: compressedFile,
											route: "thumbnails/",
											id: selectedVideo.id,
										});
										if (result.success) {
											setShowImageLoader(false);
											console.log(result.data.data.url);
											inputChange({
												thumbnail: result.data.data.url,
											});
										} else {
											console.error(result);
											toast.error(
												"Failed to upload image",
												{
													position: "top-center",
												}
											);
											setShowImageLoader(false);
										}
									} else {
										toast.error(
											"Please upload an image smaller than 1MB"
										);
									}
									return;
								} else {
									// check file type
									if (!file.type.includes("image")) {
										toast.error("Please upload an image");
										return;
									}

									// toggle loader
									setShowImageLoader(true);

									// upload image
									let result = await UploadImage({
										image: file,
										route: "thumbnails/",
										id: selectedVideo.id,
									});
									if (result.success) {
										setShowImageLoader(false);
										console.log(result.data.data.url);
										inputChange({
											thumbnail: result.data.data.url,
										});
									} else {
										console.error(result);
										toast.error("Failed to upload image", {
											position: "top-center",
										});
										setShowImageLoader(false);
									}
								}
							}
						}}
					/>
					<TeamModalInput
						title="Download URL"
						placeholder="Video Download URL"
						value={
							changes && changes.download_url
								? changes.download_url
								: selectedVideo.download_url
						}
						setValue={(value: string) => {
							if (value != selectedVideo.download_url) {
								inputChange({ download_url: value });
							} else {
								deleteChange("download_url");
							}
						}}
						showActionButton={
							selectedVideo.url &&
							selectedVideo.url.includes("cloudflarestream") &&
							!selectedVideo.download_url
								? true
								: false
						}
						actionButtonText={downloadButtonParams.text}
						actionButtonLoading={downloadButtonParams.loading}
						actionButtonClick={() => {
							generateCloudflareDownload();
						}}
					/>
					<TeamModalCheckbox
						title="Allow Downloads"
						runner="Do you want to allow video downloads for this video?"
						value={selectedVideo.allow_downloads}
						setValue={(value: boolean) => {
							if (value != selectedVideo.allow_downloads) {
								inputChange({ allow_downloads: value });
							} else {
								deleteChange("allow_downloads");
							}
						}}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System Videos">
				<button
					className="px-5 text-sm py-2 bg-slate-500 hover:bg-slate-700 transition text-white rounded-md font-medium"
					onClick={() => {
						setSpotlightControls(true);
					}}
				>
					Spotlight
				</button>
				<button
					className="px-5 text-sm py-2 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md font-medium"
					onClick={() => {
						setShowUploadVideo(true);
					}}
				>
					Upload Video
				</button>
			</TeamHeader>
			{/* Data Body */}
			<div className="text-sm lg:text-base flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="hidden md:block w-[200px] xl:w-[250px]" />
				<p className="w-[calc(50%)] md:w-[calc(33%-100px)] xl:w-[calc(25%-125px)] font-semibold">
					Title
				</p>
				<p className="hidden xl:block xl:w-[calc(25%-125px)] font-semibold">
					UUID
				</p>
				<p className="w-[calc(50%)] md:w-[calc(33%-100px)] xl:w-[calc(25%-125px)] font-semibold">
					Views
				</p>
				<p className="hidden md:block w-[calc(33%-100px)] xl:w-[calc(25%-125px)] font-semibold">
					Status
				</p>
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{videos && videos.length > 0 ? (
							videos.map((video, index) => {
								return (
									<div
										key={index}
										className="text-sm lg:text-base relative flex items-center w-full h-[100px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="px-2 hidden md:block w-[200px] xl:w-[250px] flex items-center justify-center shrink-0">
											<div
												className="relative w-[130px] h-[75px] rounded-md overflow-hidden shadow-md border cursor-pointer"
												onClick={() => {
													document
														.getElementById(
															"watch-video-" +
																video.uuid
														)
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
										<p className="w-[calc(50%)] md:w-[calc(33%-100px)] xl:w-[calc(25%-125px)] pr-2">
											{video.title}
										</p>
										<p className="hidden xl:block xl:w-[calc(25%-125px)] pr-2">
											{video.uuid}
										</p>
										<p className="w-[calc(50%)] md:w-[calc(33%-100px)] xl:w-[calc(25%-125px)] pr-2">
											{video.views} views
										</p>
										<p className="hidden md:block  w-[calc(33%-100px)] xl:w-[calc(25%-125px)]">
											<a
												className={
													"px-3 py-1.5 text-xs lg:text-sm rounded-md  " +
													(video.status.short_name ==
													"public"
														? "text-white bg-green-500"
														: video.status
																.short_name ==
														  "unlisted"
														? "text-white bg-green-700"
														: "text-white bg-slate-500")
												}
											>
												{video.status.name}
											</a>
										</p>
										<div className="flex gap-2 justify-end pr-2 absolute right-0">
											<button
												className="px-4 text-xs lg:text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedVideo(video);
												}}
											>
												Inspect
											</button>
											{video.status.short_name !=
												"draft" && (
												<Link
													href={
														"https://hillview.tv/watch?v=" +
														video.uuid
													}
													target="_blank"
													className="hidden lg:block "
													id={
														"watch-video-" +
														video.uuid
													}
												>
													<button className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md">
														Watch
													</button>
												</Link>
											)}
											{video.status.short_name !=
												"public" && (
												<button
													onClick={async () => {
														const response =
															await NewRequest({
																method: "PUT",
																route:
																	"/core/v1.1/admin/video/" +
																	video.id,
																body: {
																	id: video.id,
																	changes: {
																		status: VideoStatus.Public,
																	},
																},
																auth: true,
															});
														if (response.success) {
															initialize();
														} else {
															console.error(
																response
															);
															setSaving(false);
															toast.error(
																"Failed to save changes",
																{
																	position:
																		"top-center",
																}
															);
														}
													}}
													className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												>
													Publish
												</button>
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
						{videos && videos.length > 0 ? (
							<div className="w-full h-[150px] flex items-center justify-center">
								<button
									onClick={loadMore}
									className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
								>
									Load More
								</button>
							</div>
						) : null}
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
