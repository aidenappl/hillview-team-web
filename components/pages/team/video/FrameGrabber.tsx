import { useCallback, useEffect, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	const cs = Math.floor((seconds % 1) * 100); // centiseconds
	return `${m}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const StepBackIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
	</svg>
);

const StepForwardIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
	</svg>
);

const CameraIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
	</svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	url: string;
	show?: boolean;
	onCloseHit?: () => void;
	onSelectFrame?: (time: number) => void;
	/** @deprecated — use onSelectFrame */
	onCurrentTime?: (time: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const FrameGrabber = ({
	url,
	show = false,
	onCloseHit = () => {},
	onSelectFrame = () => {},
}: Props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [hasCapture, setHasCapture] = useState(false);
	const [captureError, setCaptureError] = useState(false);

	// Escape to close
	useEffect(() => {
		if (!show) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseHit(); };
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [show, onCloseHit]);

	// Reset capture preview when modal opens
	useEffect(() => {
		if (show) {
			setHasCapture(false);
			setCaptureError(false);
			setCurrentTime(0);
		}
	}, [show]);

	const captureFrame = useCallback(() => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas) return;
		try {
			canvas.width = video.videoWidth || 1280;
			canvas.height = video.videoHeight || 720;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			setHasCapture(true);
			setCaptureError(false);
		} catch {
			// Cross-origin restriction — canvas preview unavailable
			setCaptureError(true);
		}
	}, []);

	// Step one frame forward or backward (~30fps)
	const stepFrame = (direction: 1 | -1) => {
		const video = videoRef.current;
		if (!video) return;
		video.currentTime = Math.max(
			0,
			Math.min(video.duration || 0, video.currentTime + direction / 30)
		);
	};

	if (!show) return null;

	return (
		<div className="fixed inset-0 z-[60] flex flex-col" aria-modal="true" role="dialog" aria-label="Grab Thumbnail">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/75 backdrop-blur-sm"
				onClick={onCloseHit}
				aria-hidden="true"
			/>

			{/* Panel — full screen on mobile, windowed on sm+ */}
			<div className="relative z-10 flex flex-col bg-white w-full h-full sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl overflow-hidden">

				{/* Header */}
				<div className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
					<div>
						<h2 className="text-base font-semibold text-slate-900">Grab Thumbnail</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Seek to the frame you want, then capture it
						</p>
					</div>
					<button
						onClick={onCloseHit}
						className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
						aria-label="Close"
					>
						<XIcon />
					</button>
				</div>

				{/* Video */}
				<div className="shrink-0 bg-black">
					<video
						ref={videoRef}
						src={url}
						controls
						className="w-full max-h-[50dvh] sm:max-h-[55vh] object-contain"
						onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
						onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
					/>
				</div>

				{/* Controls */}
				<div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4">
					<div className="flex items-center gap-4">
						{/* Canvas preview — always in DOM so ref is always available */}
						<div className="relative h-14 w-24 shrink-0">
							<canvas
								ref={canvasRef}
								className={`absolute inset-0 h-full w-full rounded-lg border border-slate-200 bg-slate-100 ${hasCapture && !captureError ? "" : "hidden"}`}
							/>
							{(!hasCapture || captureError) && (
								<div
									className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-100 transition-colors hover:border-slate-300"
									onClick={captureFrame}
									title="Capture preview"
								>
									<CameraIcon />
								</div>
							)}
						</div>

						{/* Time + step buttons */}
						<div className="flex flex-col gap-1.5 min-w-0">
							<span className="font-mono text-sm font-medium text-slate-700 tabular-nums">
								{formatTime(currentTime)}
								{duration > 0 && (
									<span className="text-slate-400"> / {formatTime(duration)}</span>
								)}
							</span>
							<div className="flex items-center gap-1">
								<button
									onClick={() => stepFrame(-1)}
									className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
									title="Step back one frame"
								>
									<StepBackIcon />
								</button>
								<button
									onClick={() => stepFrame(1)}
									className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
									title="Step forward one frame"
								>
									<StepForwardIcon />
								</button>
								<button
									onClick={captureFrame}
									className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
									title="Capture current frame preview"
								>
									<CameraIcon />
									<span className="hidden sm:inline">Preview</span>
								</button>
							</div>
						</div>

						{/* Action buttons — pushed to the right */}
						<div className="ml-auto flex items-center gap-2">
							<button
								onClick={onCloseHit}
								className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
							>
								Cancel
							</button>
							<button
								onClick={() => onSelectFrame(currentTime)}
								className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
							>
								Use Frame
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
