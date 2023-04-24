import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useEffect, useState } from "react";
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

const VideosPage = () => {
	const router = useRouter();
	const [videos, setVideos] = useState<Video[] | null>(null);
	const [showConfirmDeleteVideo, setShowConfirmDeleteVideo] =
		useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);

	// Video Inspector
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);

	// Video Uploader
	const [showUploadVideo, setShowUploadVideo] = useState<boolean>(false);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setVideos(null);
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
		<TeamContainer pageTitle="videos" router={router}>
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
					<TeamModalInput
						title="Thumbnail URL"
						placeholder="Video Thumbnail URL"
						value={selectedVideo.thumbnail}
						setValue={(value: string) => {
							if (value != selectedVideo.thumbnail) {
								inputChange({ thumbnail: value });
							} else {
								deleteChange("thumbnail");
							}
						}}
					/>
					<TeamModalInput
						title="Download URL"
						placeholder="Video Download URL"
						value={selectedVideo.download_url}
						setValue={(value: string) => {
							if (value != selectedVideo.download_url) {
								inputChange({ download_url: value });
							} else {
								deleteChange("download_url");
							}
						}}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System videos">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => {
						setShowUploadVideo(true);
					}}
				>
					Upload Video
				</button>
			</TeamHeader>
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[300px]" />
				<p className="w-[calc(25%-125px)] font-semibold">Title</p>
				<p className="w-[calc(25%-125px)] font-semibold">UUID</p>
				<p className="w-[calc(25%-125px)] font-semibold">Views</p>
				<p className="w-[calc(25%-125px)] font-semibold">Status</p>
				<div className="w-[200px]" />
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
										className="flex items-center w-full h-[100px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="w-[300px] flex items-center justify-center">
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
										<p className="w-[calc(25%-125px)] pr-2">
											{video.title}
										</p>
										<p className="w-[calc(25%-125px)] pr-2">
											{video.uuid}
										</p>
										<p className="w-[calc(25%-125px)] pr-2">
											{video.views}
										</p>
										<p className="w-[calc(25%-125px)]">
											<a
												className={
													"px-3 py-1.5 text-sm rounded-md " +
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
										<div className="w-[200px] flex gap-2 pr-10">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedVideo(video);
												}}
											>
												Inspect
											</button>
											<Link
												href={
													"https://hillview.tv/watch?v=" +
													video.uuid
												}
												target="_blank"
												id={"watch-video-" + video.uuid}
											>
												<button className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md">
													Watch
												</button>
											</Link>
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
