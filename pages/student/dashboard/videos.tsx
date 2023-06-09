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
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import CreateVideoModal from "../../../components/pages/team/video/CreateVideoModal";
import TeamModalUploader from "../../../components/pages/team/TeamModalUploader";
import UploadImage from "../../../services/uploadHandler";
import SelectThumbnailModal from "../../../components/pages/team/video/SelectThumbnailModal";

const VideosPage = () => {
	const router = useRouter();
	const [videos, setVideos] = useState<Video[] | null>(null);
	const [offset, setOffset] = useState<number>(0);

	// Video Inspector
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);

	// Video Uploader
	const [showUploadVideo, setShowUploadVideo] = useState<boolean>(false);

	// Escape Handlers
	const escFunction = useCallback((e: any) => {
		if (e.key === "Escape") {
			cancelVideoInspection();
			setShowUploadVideo(false);
		}
	}, []);

	// Thumbnail Selector
	const [showThumbnailSelector, setShowThumbnailSelector] =
		useState<boolean>(false);

	useEffect(() => {
		document.addEventListener("keydown", escFunction, false);

		return () => {
			document.removeEventListener("keydown", escFunction, false);
		};
	}, [escFunction]);

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

	return (
		<TeamContainer pageTitle="Videos" router={router}>
			<SelectThumbnailModal
				url={selectedVideo ? selectedVideo!.download_url : ""}
				show={showThumbnailSelector}
				exit={() => {
					setShowThumbnailSelector(false);
				}}
				success={(url: string) => {
					inputChange({ thumbnail: url });
				}}
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
					showDestructive={false}
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
					<TeamModalInput
						title="Thumbnail URL"
						placeholder="Video Thumbnail URL"
						showActionButton={true}
						actionButtonText="Grab"
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
								console.log(file);
								// check max size 1mb
								if (file.size > 1000000) {
									toast.error(
										"Please upload an image smaller than 1MB"
									);
									return;
								}

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
						}}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System Videos">
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
				<p className="w-[calc(33%-167px)] font-semibold">Title</p>
				<p className="w-[calc(33%-167px)] font-semibold">Views</p>
				<p className="w-[calc(33%-167px)] font-semibold">Status</p>
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
										<p className="w-[calc(33%-167px)] pr-2">
											{video.title}
										</p>
										<p className="w-[calc(33%-167px)] pr-2">
											{video.views} views
										</p>
										<p className="w-[calc(33%-167px)]">
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
										<div className="w-[200px] flex gap-2 pr-10 justify-end">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedVideo(video);
												}}
											>
												Inspect
											</button>
											{video.status.short_name !=
											"draft" ? (
												<Link
													href={
														"https://hillview.tv/watch?v=" +
														video.uuid
													}
													target="_blank"
													id={
														"watch-video-" +
														video.uuid
													}
												>
													<button className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md">
														Watch
													</button>
												</Link>
											) : null}
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
			requireAccountStatus: "student",
			title: "Hillview Team - Videos",
		},
	};
};
