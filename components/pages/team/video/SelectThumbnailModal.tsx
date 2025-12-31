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

	return (
		<>
			{show ? (
				<div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-30">
					<div className="w-2/3 max-w-3xl bg-white p-8 shadow-md border rounded-md flex flex-col gap-6">
						<div>
							<h1 className="font-semibold text-lg">
								Grab a Thumbnail
							</h1>
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
							className="w-full py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 font-semibold"
							onClick={(e: any) => {
								e.target.innerHTML = "Uploading...";

								// get the video element
								const video = document.getElementById(
									"thumbnail-selector"
								)! as HTMLVideoElement;

								// create a canvas element
								const canvas = document.createElement("canvas");
								canvas.width = video.videoWidth;
								canvas.height = video.videoHeight;

								// get the current frame
								const context = canvas.getContext("2d")!;
								context.drawImage(
									video,
									0,
									0,
									canvas.width,
									canvas.height
								);

								let filename = "thumbnail.jpg";

								canvas.toBlob(
									async (blob) => {
										// convert blob to file
										const file = new File(
											[blob!],
											filename,
											{
												type: "image/jpeg",
												lastModified: Date.now(),
											}
										);

										const url = URL.createObjectURL(
											blob as Blob
										);

										const options = {
											maxSizeMB: 1,
											maxWidthOrHeight: 1920,
											useWebWorker: true,
										};
										try {
											const compressedFile =
												await imageCompression(
													file,
													options
												);

											let result = await UploadImage({
												image: file,
												route: "thumbnails/",
												id: 100,
											});
											if (result.success) {
												e.target.innerHTML = "Done";
												toast.success(
													"Thumbnail uploaded successfully",
													{
														position: "top-center",
													}
												);
												success(result.data.data.url);
												exit();
											} else {
												e.target.innerHTML = "Select";
												console.error(result);
												toast.error(
													"Failed to upload image",
													{
														position: "top-center",
													}
												);
											}
										} catch (error) {
											console.error(error);
										}
									},
									"image/jpeg",
									0.95
								); // 0.95 is the JPEG quality (0-1 range)
							}}
						>
							Select
						</button>
					</div>
				</div>
			) : null}
		</>
	);
};

export default SelectThumbnailModal;
