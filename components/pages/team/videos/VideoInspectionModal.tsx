import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { VideoStatuses } from "../../../../models/videoStatus.model";
import UploadImage from "../../../../services/uploadHandler";
import TeamModal from "../TeamModal";
import TeamModalCheckbox from "../TeamModalCheckbox";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalUploader from "../TeamModalUploader";
import { FrameGrabber } from "../video/FrameGrabber";
import { useState } from "react";
import { Video } from "../../../../types";

interface VideoInspectionModalProps {
	changes: any;
	saving: boolean;
	selectedVideo: Video;
	inputChange: (changes: any) => void;
	cancelVideoInspection: () => void;
	saveVideoInspection: () => void;
	setShowConfirmDeleteVideo: (show: boolean) => void;
	deleteChange: (key: string) => void;
	generateCloudflareDownload: () => void;
	showThumbnailSelector: boolean;
	setShowThumbnailSelector: (show: boolean) => void;
	downloadButtonParams: any;
}

const VideoInspectionModal = ({
	changes,
	saving,
	selectedVideo,
	inputChange,
	cancelVideoInspection,
	saveVideoInspection,
	setShowConfirmDeleteVideo,
	deleteChange,
	generateCloudflareDownload,
	showThumbnailSelector,
	setShowThumbnailSelector,
	downloadButtonParams,
}: VideoInspectionModalProps) => {
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);

	return (
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
				imageSource={changes?.thumbnail || selectedVideo.thumbnail}
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
								const compressedFile = await imageCompression(file, options);

								// upload image
								let result = await UploadImage({
									image: compressedFile,
									route: "thumbnails/",
									id: selectedVideo.id,
								});
								if (result.success) {
									setShowImageLoader(false);
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
							} else {
								toast.error("Please upload an image smaller than 1MB");
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
	);
};

export default VideoInspectionModal;
