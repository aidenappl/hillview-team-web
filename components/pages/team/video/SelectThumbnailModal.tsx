import { useState } from "react";
import imageCompression from "browser-image-compression";
import UploadImage from "../../../../services/uploadHandler";
import toast from "react-hot-toast";

const SelectThumbnailModal = (props: {
	url: string;
	show?: boolean;
	exit?: () => void;
	success?: (url: string) => void;
}) => {
	const {
		url,
		show = true,
		exit = () => {},
		success = (url: string) => {},
	} = props;

	const [uploadState, setUploadState] = useState<
		"idle" | "uploading" | "done"
	>("idle");

	const buttonText =
		uploadState === "uploading"
			? "Uploading..."
			: uploadState === "done"
			? "Done"
			: "Select";

	const handleSelect = () => {
		// get the video element
		const video = document.getElementById(
			"thumbnail-selector"
		) as HTMLVideoElement | null;
		if (!video) {
			toast.error("Video element not found");
			return;
		}

		setUploadState("uploading");

		// create a canvas element
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// get the current frame
		const context = canvas.getContext("2d");
		if (!context) {
			toast.error("Failed to create canvas context");
			setUploadState("idle");
			return;
		}
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		const filename = "thumbnail.jpg";

		canvas.toBlob(
			async (blob) => {
				// convert blob to file
				if (!blob) {
					setUploadState("idle");
					toast.error("Failed to capture frame");
					return;
				}
				const file = new File([blob], filename, {
					type: "image/jpeg",
					lastModified: Date.now(),
				});

				const options = {
					maxSizeMB: 1,
					maxWidthOrHeight: 1920,
					useWebWorker: true,
				};
				try {
					const compressedFile = await imageCompression(
						file,
						options
					);

					const result = await UploadImage({
						image: compressedFile,
						route: "thumbnails/",
						id: 100,
					});
					if (result.success) {
						setUploadState("done");
						toast.success("Thumbnail uploaded successfully", {
							position: "top-center",
						});
						success(result.data.data.url);
						exit();
					} else {
						setUploadState("idle");
						toast.error("Failed to upload image", {
							position: "top-center",
						});
					}
				} catch {
					setUploadState("idle");
					toast.error("An unexpected error occurred while uploading the image", { position: "top-center" });
				}
			},
			"image/jpeg",
			0.95
		); // 0.95 is the JPEG quality (0-1 range)
	};

	return (
		<>
			{show ? (
				<div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-30">
					<div className="w-2/3 max-w-3xl bg-white p-8 shadow-md border rounded-md flex flex-col gap-6">
						<div>
							<h1 className="font-semibold text-lg">Grab a Thumbnail</h1>
							<p className="text-slate-700 text-sm">
								Drag the playhead to the perfect moment!
							</p>
						</div>
						<video
							id={"thumbnail-selector"}
							crossOrigin="anonymous"
							src={url}
							controls
						></video>
						<button
							className="w-full py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 font-semibold disabled:opacity-50"
							disabled={uploadState === "uploading"}
							onClick={handleSelect}
						>
							{buttonText}
						</button>
					</div>
				</div>
			) : null}
		</>
	);
};

export default SelectThumbnailModal;
