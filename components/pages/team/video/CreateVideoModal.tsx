import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import { NewRequest } from "../../../../services/http/requestHandler";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalTextarea from "../TeamModalTextarea";
import ValidVideo from "../../../../validators/video.validator";
import TeamModalDropzone, { DropzoneStates } from "../TeamModalDropzone";
import UploadVideo from "../../../../services/uploadVideo";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import SelectThumbnailModal from "./SelectThumbnailModal";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreateVideoModal = (props: Props) => {
	const [video, setVideo] = useState<any>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);
	const [dropzoneState, setDropzoneState] =
		useState<DropzoneStates>("default");
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [uploadStatus, setUploadStatus] = useState<"progress" | "label">(
		"progress"
	);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);
	// Thumbnail Selector
	const [showThumbnailSelector, setShowThumbnailSelector] =
		useState<boolean>(false);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = async (modifier: Object) => {
		setVideo({ ...video, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...video };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setVideo(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	const runCreateVideo = async () => {
		if (saving) return;
		let validator = ValidVideo(video);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await NewRequest({
			method: "POST",
			route: "/core/v1.1/admin/video",
			body: validator.value,
			auth: true,
		});
		if (response.success) {
			console.log(response.data);
			toast.success("Video Created");
			setSaving(false);
			saveDone();
		} else {
			console.error(response);
			setSaving(false);
			toast.error(response.message);
		}
	};

	useEffect(() => {
		setVideo({
			thumbnail: "https://content.hillview.tv/thumbnails/default.jpg",
		});
	}, []);

	useEffect(() => {
		let validator = ValidVideo(video);
		if (validator.error) {
			setSaveActive(false);
		} else {
			setSaveActive(true);
		}
	}, [video]);

	return (
		<>
			<SelectThumbnailModal
				url={video ? video!.download_url : ""}
				show={showThumbnailSelector}
				exit={() => {
					setShowThumbnailSelector(false);
				}}
				success={(url: string) => {
					if (url.length > 0) {
						inputChange({
							thumbnail: url,
						});
					} else {
						deleteChange("thumbnail");
					}
				}}
			/>
			<TeamModal
				className="gap-6"
				showDestructive={false}
				loader={saving}
				saveActive={saveActive}
				cancelHit={() => {
					cancelHit();
				}}
				saveHit={() => {
					runCreateVideo();
					saveHit();
				}}
			>
				<TeamModalInput
					title="Title"
					placeholder="Enter the Title of the video..."
					value={video.title}
					required
					setValue={(value: string): void => {
						if (value.length > 0) {
							inputChange({
								title: value,
							});
						} else {
							deleteChange("title");
						}
					}}
				/>
				<TeamModalTextarea
					title="Description"
					className="h-[200px]"
					placeholder="Enter the Description of the video..."
					value={video.description}
					required
					setValue={(value: string): void => {
						if (value.length > 0) {
							inputChange({
								description: value,
							});
						} else {
							deleteChange("description");
						}
					}}
				/>
				<TeamModalInput
					title="Source URL"
					placeholder="Enter the Source URL of the video..."
					value={video.url}
					required
					setValue={(value: string): void => {
						if (value.length > 0) {
							inputChange({
								url: value,
							});
						} else {
							deleteChange("url");
						}
					}}
				/>
				<TeamModalDropzone
					state={dropzoneState}
					progress={uploadProgress}
					uploadStatus={uploadStatus}
					progressLabel={
						uploadStatus == "progress"
							? "Uploading..."
							: "100% Processing..."
					}
					onChange={async (e) => {
						if (e.target.files && e.target.files.length > 0) {
							let file = e.target.files[0];
							// check if file type is mp4
							console.log(file.name);
							if (
								file.type !== "video/mp4" ||
								(!file.name.endsWith(".mp4") &&
									!file.name.endsWith(".m4v"))
							) {
								toast.error("File must be an mp4 or m4v");
								return;
							}
							setDropzoneState("loading");
							// set the file name to be video title if empty
							if (!video.title || video.title?.length == 0) {
								inputChange({
									title: file.name.replace(/\.[^/.]+$/, ""),
								});
							}

							// upload the file
							const response = await UploadVideo({
								upload: file,
								uploadProgress: (progress: number) => {
									setUploadProgress(progress);
									if (progress === 100) {
										setUploadStatus("label");
									}
								},
							});
							if (response.success) {
								if (!video.title || video.title?.length == 0) {
									inputChange({
										url: response.data.data.url,
										download_url: response.data.data.s3_url,
										thumbnail: response.data.data.thumbnail,
										title: file.name.replace(
											/\.[^/.]+$/,
											""
										),
									});
								} else {
									inputChange({
										url: response.data.data.url,
										thumbnail: response.data.data.thumbnail,
										download_url: response.data.data.s3_url,
									});
								}
							} else {
								toast.error(response.message);
							}
							setDropzoneState("default");
							setUploadProgress(0);
							setUploadStatus("progress");
						}
					}}
				/>
				<TeamModalInput
					title="Thumbnail URL"
					placeholder="Video Thumbnail URL"
					value={video.thumbnail}
					showActionButton={video.download_url ? true : false}
					actionButtonText="Grab Thumbnail"
					actionButtonClick={() => {
						setShowThumbnailSelector(true);
					}}
					setValue={(value: string) => {
						if (value != video.thumbnail) {
							inputChange({ thumbnail: value });
						} else {
							deleteChange("thumbnail");
						}
					}}
				/>
				<TeamModalUploader
					imageSource={video.thumbnail}
					altText={video.title}
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
								id: 100,
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
				<TeamModalInput
					title="Download URL"
					placeholder="Enter the Download URL of the video..."
					disabled
					value={video.download_url}
					setValue={(value: string): void => {
						if (value.length > 0) {
							inputChange({
								download_url: value,
							});
						} else {
							deleteChange("download_url");
						}
					}}
				/>
			</TeamModal>
		</>
	);
};

export default CreateVideoModal;
