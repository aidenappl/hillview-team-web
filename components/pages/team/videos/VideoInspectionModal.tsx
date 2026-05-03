import { useState } from "react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { VideoStatuses } from "../../../../models/videoStatus.model";
import UploadImage from "../../../../services/uploadHandler";
import TeamModalCheckbox from "../TeamModalCheckbox";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalUploader from "../TeamModalUploader";
import { FrameGrabber } from "../video/FrameGrabber";
import Spinner from "../../../general/Spinner";
import { Video } from "../../../../types";

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
		aria-hidden="true"
	>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

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
	const [showImageLoader, setShowImageLoader] = useState(false);

	const isDirty = changes && Object.keys(changes).length > 0;
	const changeCount = isDirty ? Object.keys(changes).length : 0;

	const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		setShowImageLoader(true);
		try {
			let uploadFile: File | Blob = file;

			if (file.size > 1_000_000) {
				try {
					uploadFile = await imageCompression(file, {
						maxSizeMB: 1,
						useWebWorker: true,
					});
				} catch (compressErr) {
					toast.error("Failed to compress image — try a smaller file");
					return;
				}
			}

			const result = await UploadImage({
				image: uploadFile,
				route: "thumbnails/",
				id: selectedVideo.id,
			});

			if (result.success) {
				inputChange({ thumbnail: result.data.data.url });
			} else {
				toast.error("Failed to upload thumbnail");
			}
		} catch (err) {
			toast.error("An unexpected error occurred while uploading the thumbnail");
		} finally {
			setShowImageLoader(false);
		}
	};

	const isCloudflareThumbnailAvailable =
		!!selectedVideo.download_url &&
		selectedVideo.download_url.includes(
			"https://customer-nakrsdfbtn3mdz5z.cloudflarestream.com/"
		);

	return (
		<>
			<FrameGrabber
				show={showThumbnailSelector}
				url={selectedVideo.download_url}
				onCloseHit={() => setShowThumbnailSelector(false)}
				onSelectFrame={(timestamp: number) => {
					setShowThumbnailSelector(false);
					const baseURL = selectedVideo.download_url.replaceAll(
						"/downloads/default.mp4",
						""
					);
					inputChange({
						thumbnail:
							baseURL +
							"/thumbnails/thumbnail.jpg?time=" +
							timestamp +
							"s&width=1280&height=720",
					});
				}}
			/>

			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={cancelVideoInspection}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[760px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Edit Video"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
								{selectedVideo.title}
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								{isDirty
									? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
									: "Edit video details"}
							</p>
						</div>
						<button
							onClick={cancelVideoInspection}
							className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							aria-label="Close"
						>
							<XIcon />
						</button>
					</div>
				</div>

				{/* Scrollable content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					<div className="flex flex-col gap-5">
						{/* Title */}
						<TeamModalInput
							title="Title"
							placeholder="Video title"
							value={selectedVideo.title}
							setValue={(value) => {
								if (value !== selectedVideo.title) inputChange({ title: value });
								else deleteChange("title");
							}}
						/>

						{/* Description */}
						<TeamModalTextarea
							title="Description"
							placeholder="Video description"
							value={selectedVideo.description}
							className="h-[120px]"
							setValue={(value) => {
								if (value !== selectedVideo.description) inputChange({ description: value });
								else deleteChange("description");
							}}
						/>

						{/* Status */}
						<TeamModalSelect
							title="Status"
							values={VideoStatuses}
							value={selectedVideo.status}
							setValue={(value) => {
								if (value.id !== selectedVideo.status.id) inputChange({ status: value.id });
								else deleteChange("status");
							}}
						/>

						{/* Source URL */}
						<div className="flex flex-col gap-2">
							<TeamModalInput
								title="Source URL"
								placeholder="Video source URL"
								value={selectedVideo.url}
								setValue={(value) => {
									if (value !== selectedVideo.url) inputChange({ url: value });
									else deleteChange("url");
								}}
							/>
							{changes?.url !== undefined && (
								<div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
									<svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
									</svg>
									<p className="text-xs text-amber-700">
										Changing the source URL will replace the video stream. If the new URL is invalid or incompatible, the video will break for viewers.
									</p>
								</div>
							)}
						</div>

						{/* Thumbnail */}
						<div className="flex flex-col gap-2">
							<TeamModalInput
								title="Thumbnail URL"
								placeholder="Thumbnail image URL"
								showActionButton={isCloudflareThumbnailAvailable}
								actionButtonText="Grab Frame"
								actionButtonClick={() => setShowThumbnailSelector(true)}
								value={changes?.thumbnail ?? selectedVideo.thumbnail}
								setValue={(value) => {
									if (value !== selectedVideo.thumbnail) inputChange({ thumbnail: value });
									else deleteChange("thumbnail");
								}}
							/>
							<TeamModalUploader
								imageSource={changes?.thumbnail ?? selectedVideo.thumbnail}
								altText={selectedVideo.title}
								showImageLoader={showImageLoader}
								onChange={handleThumbnailUpload as any}
							/>
						</div>

						{/* Download URL */}
						<TeamModalInput
							title="Download URL"
							placeholder="Video download URL"
							value={changes?.download_url ?? selectedVideo.download_url ?? ""}
							setValue={(value) => {
								if (value !== selectedVideo.download_url) inputChange({ download_url: value });
								else deleteChange("download_url");
							}}
							showActionButton={
								!!selectedVideo.url &&
								selectedVideo.url.includes("cloudflarestream") &&
								!selectedVideo.download_url
							}
							actionButtonText={downloadButtonParams.text}
							actionButtonLoading={downloadButtonParams.loading}
							actionButtonClick={generateCloudflareDownload}
						/>

						{/* Allow Downloads */}
						<TeamModalCheckbox
							title="Allow Downloads"
							runner="Allow viewers to download this video"
							value={selectedVideo.allow_downloads}
							setValue={(value) => {
								if (value !== selectedVideo.allow_downloads) inputChange({ allow_downloads: value });
								else deleteChange("allow_downloads");
							}}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={() => setShowConfirmDeleteVideo(true)}
							className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							Archive
						</button>
						<div className="flex items-center gap-2">
							<button
								onClick={cancelVideoInspection}
								className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
							>
								Cancel
							</button>
							<button
								onClick={saveVideoInspection}
								disabled={saving || !isDirty}
								className={[
									"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
									isDirty && !saving
										? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
										: "cursor-not-allowed bg-slate-300",
								].join(" ")}
							>
								{saving ? (
									<Spinner style="light" size={16} />
								) : (
									<>
										Save
										{changeCount > 0 && (
											<span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
												{changeCount}
											</span>
										)}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default VideoInspectionModal;
