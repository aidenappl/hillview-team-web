import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalDropzone, { DropzoneStates } from "../TeamModalDropzone";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import SelectThumbnailModal from "./SelectThumbnailModal";
import UploadComponent from "./UploadComponent";
import ValidVideo from "../../../../validators/video.validator";
import Spinner from "../../../general/Spinner";

import { reqCreateVideo } from "../../../../services/api/video.service";
import { reqCreateDownloadUrl } from "../../../../services/api/cloudflare.service";
import { applyChange, removeChange } from "../../../../utils/changeTracking";
import { VideoInput } from "../../../../types";
import { CloudflareStatus } from "../../../../models/cloudflareStatus.model";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_THUMBNAIL = "https://content.hillview.tv/thumbnails/default.jpg";

const FIELD_LABELS: Record<string, string> = {
	title: "Title",
	url: "Source URL",
	thumbnail: "Thumbnail",
	description: "Description",
};

const UPLOADING_STATES: DropzoneStates[] = [
	"dna",
	"in-progress",
	"finishing-up",
	"status-checks",
	"status-rolling",
];

// ─── Icons ─────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

const CheckIcon = () => (
	<svg
		className="h-3.5 w-3.5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2.5}
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M4.5 12.75l6 6 9-13.5"
		/>
	</svg>
);

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
	cancelHit?: () => void;
	saveDone?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

const CreateVideoModal = ({
	cancelHit = () => {},
	saveDone = () => {},
}: Props) => {
	const [video, setVideo] = useState<Partial<VideoInput>>({
		thumbnail: DEFAULT_THUMBNAIL,
	});
	const [saving, setSaving] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [dropzoneState, setDropzoneState] = useState<DropzoneStates>("none");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [encodeProgress, setEncodingProgress] = useState(0);
	const [showImageLoader, setShowImageLoader] = useState(false);
	const [generatingDownload, setGeneratingDownload] = useState(false);
	const [downloadGenerated, setDownloadGenerated] = useState(false);
	const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);

	// ── Derived ──────────────────────────────────────────────────────────────

	const isUploading = UPLOADING_STATES.includes(dropzoneState);
	const { error: validationError } = ValidVideo(video);
	const canSave = !saving && !isUploading && !validationError;

	const isCloudflarUrl =
		typeof video.url === "string" && video.url.includes("cloudflarestream.com");
	const showGenerateDownload =
		isCloudflarUrl && !video.download_url && !downloadGenerated;

	// Keep a stable ref so the listener doesn't need cancelHit in its deps
	// and never gets torn down/re-registered on parent re-renders.
	const cancelHitRef = useRef(cancelHit);
	useEffect(() => { cancelHitRef.current = cancelHit; });

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") cancelHitRef.current();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Field helpers ────────────────────────────────────────────────────────

	const setField = (key: string, value: string) => {
		setVideo((prev) =>
			value.trim().length > 0
				? (applyChange(prev, { [key]: value }) as Partial<VideoInput>)
				: ((removeChange(prev, key) ?? {}) as Partial<VideoInput>),
		);
		if (fieldErrors[key]) {
			setFieldErrors((prev) => {
				const next = { ...prev };
				delete next[key];
				return next;
			});
		}
	};

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleThumbnailUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (e.target.files && e.target.files.length > 1) {
			toast.error("Please select only one image");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 1_000_000) {
			toast.error("Image must be smaller than 1 MB");
			return;
		}

		setShowImageLoader(true);
		try {
			const result = await UploadImage({
				image: file,
				route: "thumbnails/",
				id: 100,
			});
			if (result.success) {
				setField("thumbnail", result.data.data.url);
			} else {
				toast.error("Failed to upload thumbnail");
				console.error("[CreateVideoModal] thumbnail upload failed:", result);
			}
		} catch (err) {
			console.error("[CreateVideoModal] thumbnail upload error:", err);
			toast.error("An unexpected error occurred while uploading the thumbnail");
		} finally {
			setShowImageLoader(false);
		}
	};

	const handleGenerateDownload = async () => {
		if (!video.url) return;
		const match = video.url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
		const id = match?.[1];
		if (!id) {
			toast.error("Could not extract a video ID from the source URL");
			return;
		}
		setGeneratingDownload(true);
		try {
			const response = await reqCreateDownloadUrl(id);
			if (response.success) {
				setField("download_url", response.data.result.default.url);
				setDownloadGenerated(true);
			} else {
				toast.error(
					response.error_message || "Failed to generate download link",
				);
				console.error(
					"[CreateVideoModal] generateDownload API error:",
					response,
				);
			}
		} catch (err) {
			console.error("[CreateVideoModal] generateDownload error:", err);
			toast.error(
				"An unexpected error occurred while generating the download link",
			);
		} finally {
			setGeneratingDownload(false);
		}
	};

	const runCreateVideo = async () => {
		if (!canSave) return;
		const { error, value } = ValidVideo(video);
		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((d) => {
				const field = String(d.path[0]);
				errors[field] = `${FIELD_LABELS[field] ?? field} is required`;
			});
			setFieldErrors(errors);
			toast.error("Please fill in all required fields");
			return;
		}
		setSaving(true);
		try {
			const response = await reqCreateVideo(value);
			if (response.success) {
				toast.success("Video created");
				saveDone();
			} else {
				toast.error(response.error_message || "Failed to create video");
				console.error("[CreateVideoModal] createVideo API error:", response);
			}
		} catch (err) {
			console.error("[CreateVideoModal] createVideo error:", err);
			toast.error("An unexpected error occurred");
		} finally {
			setSaving(false);
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<SelectThumbnailModal
				url={video?.download_url ?? ""}
				show={showThumbnailSelector}
				exit={() => setShowThumbnailSelector(false)}
				success={(url: string) => {
					if (url.length > 0) {
						setField("thumbnail", url);
					} else {
						setField("thumbnail", DEFAULT_THUMBNAIL);
					}
				}}
			/>

			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={canSave || !isUploading ? cancelHit : undefined}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[760px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Upload Video"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Upload Video
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								{isUploading
									? "Upload in progress — save will be available once complete"
									: dropzoneState === "done"
										? "Upload complete — fill in any remaining details and save"
										: "Fill in the details and upload a video file"}
							</p>
						</div>
						<button
							onClick={cancelHit}
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
						<div className="flex flex-col gap-1">
							<TeamModalInput
								title="Title"
								placeholder="Enter the title of the video..."
								value={video.title || ""}
								required
								setValue={(v) => setField("title", v)}
							/>
							{fieldErrors.title && (
								<p className="text-xs text-red-500">{fieldErrors.title}</p>
							)}
						</div>

						{/* Description */}
						<div className="flex flex-col gap-1">
							<TeamModalTextarea
								title="Description"
								placeholder="Enter a description for the video..."
								value={video.description || ""}
								required
								setValue={(v) => setField("description", v)}
							/>
							{fieldErrors.description && (
								<p className="text-xs text-red-500">
									{fieldErrors.description}
								</p>
							)}
						</div>

						{/* Video file upload */}
						<div className="flex flex-col gap-2">
							<label className="font-medium text-[#101827] text-sm">
								Video File
							</label>
							{/* Hidden uppy handler */}
							<UploadComponent
								hidden
								id="file-upload"
								onUppyState={(state) => setDropzoneState(state)}
								onProgress={(p) => setUploadProgress(p)}
								onEncodingProgress={(p) => setEncodingProgress(p)}
								onStatusBody={(status: CloudflareStatus | null) => {
									if (status?.result) {
										setField(
											"url",
											status.result.playback?.hls ?? video.url ?? "",
										);
										if (!video.title) {
											const filename = status.result.meta?.filename ?? "";
											const name =
												filename.substring(0, filename.lastIndexOf(".")) ||
												filename;
											if (name) setField("title", name);
										}
									}
								}}
							/>
							<TeamModalDropzone
								onClick={() => document.getElementById("file-upload")?.click()}
								encodingProgress={encodeProgress}
								state={dropzoneState}
								progress={uploadProgress}
							/>
							{dropzoneState === "failed" && (
								<p className="text-xs text-red-500">
									Upload failed. Please try again or enter the source URL
									manually.
								</p>
							)}
						</div>

						{/* Source URL */}
						<div className="flex flex-col gap-1.5">
							<TeamModalInput
								title="Source URL"
								subTitle="URL of an existing raw upload"
								placeholder="Enter the source URL of the video..."
								value={video.url || ""}
								required
								setValue={(v) => {
									setField("url", v);
									// Reset download state if URL changes
									if (downloadGenerated) setDownloadGenerated(false);
								}}
							/>
							{fieldErrors.url && (
								<p className="text-xs text-red-500">{fieldErrors.url}</p>
							)}
							{showGenerateDownload && (
								<div className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
									<p className="text-xs text-blue-700">
										Cloudflare URL detected — generate a download link for this
										video.
									</p>
									<button
										onClick={handleGenerateDownload}
										disabled={generatingDownload}
										className="flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{generatingDownload ? (
											<>
												<Spinner style="light" size={12} />
												<span>Generating…</span>
											</>
										) : (
											<span>Generate</span>
										)}
									</button>
								</div>
							)}
							{downloadGenerated && video.download_url && (
								<div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2">
									<CheckIcon />
									<p className="text-xs text-green-700">
										Download link generated successfully
									</p>
								</div>
							)}
						</div>

						{/* Download URL — read-only, shown once generated */}
						{video.download_url && (
							<div className="flex flex-col gap-1">
								<TeamModalInput
									title="Download URL"
									placeholder=""
									value={video.download_url}
									disabled
									setValue={() => {}}
								/>
								<p className="text-xs text-slate-400">
									Auto-generated — this field is read-only.
								</p>
							</div>
						)}

						{/* Thumbnail */}
						<div className="flex flex-col gap-2">
							<TeamModalInput
								title="Thumbnail URL"
								placeholder="Thumbnail image URL..."
								value={video.thumbnail || ""}
								setValue={(v) => setField("thumbnail", v || DEFAULT_THUMBNAIL)}
							/>
							{fieldErrors.thumbnail && (
								<p className="text-xs text-red-500">{fieldErrors.thumbnail}</p>
							)}
							<TeamModalUploader
								imageSource={video.thumbnail || DEFAULT_THUMBNAIL}
								altText={video.title || ""}
								showImageLoader={showImageLoader}
								onChange={handleThumbnailUpload as any}
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={cancelHit}
							className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
						>
							Cancel
						</button>
						<button
							onClick={runCreateVideo}
							disabled={!canSave}
							title={
								isUploading
									? "Wait for the upload to finish"
									: validationError
										? "Fill in all required fields"
										: undefined
							}
							className={[
								"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
								canSave
									? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-300",
							].join(" ")}
						>
							{saving ? (
								<Spinner style="light" size={16} />
							) : isUploading ? (
								<>
									<Spinner style="light" size={16} />
									<span>Uploading…</span>
								</>
							) : (
								<span>Save</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreateVideoModal;
