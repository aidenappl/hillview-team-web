import { useState } from "react";
import toast from "react-hot-toast";
import { reqUpdateVideo } from "../../services/api/video.service";
import { extractMuxPlaybackIdFromUrl, muxDownloadUrl } from "../../utils/mux";
import { Video } from "../../types";

type Params = {
	onSaved: () => void;
};

export function useVideoInspector({ onSaved }: Params) {
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [saving, setSaving] = useState(false);
	const [changes, setChanges] = useState<any>(null);

	const [downloadButtonParams, setDownloadButtonParams] = useState({
		loading: false,
		text: "Generate Download",
		disabled: false,
	});

	const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);

	const resetDownloadBtn = () =>
		setDownloadButtonParams({
			loading: false,
			text: "Generate Download",
			disabled: false,
		});

	const inputChange = async (modifier: Record<string, unknown>) => {
		setChanges((prev: any) => ({ ...(prev ?? {}), ...modifier }));
	};

	const deleteChange = async (key: string, forcedObj?: any) => {
		// non-recursive simplification of your original logic
		const obj = forcedObj ? { ...forcedObj } : { ...(changes ?? {}) };
		if (key in obj) {
			delete obj[key];
			setChanges(obj);
			return;
		}
		const [head, ...rest] = key.split(".");
		if (typeof obj[head] === "object" && obj[head] !== null) {
			deleteChange(rest.join("."), obj[head]);
			setChanges({ ...obj, [head]: obj[head] });
		}
	};

	const cancelVideoInspection = () => {
		setSelectedVideo(null);
		setChanges(null);
		setSaving(false);
		resetDownloadBtn();
		setShowThumbnailSelector(false);
	};

	const saveVideoInspection = async () => {
		if (changes && Object.keys(changes).length > 0 && selectedVideo) {
			setSaving(true);
			try {
				const response = await reqUpdateVideo(selectedVideo.id, changes);
				if (response.success) {
					cancelVideoInspection();
					onSaved();
				} else {
					setSaving(false);
					toast.error("Failed to save changes", { position: "top-center" });
				}
			} catch {
				setSaving(false);
				toast.error("An unexpected error occurred", { position: "top-center" });
			}
		} else {
			setSelectedVideo(null);
		}
	};

	const generateMuxDownload = async () => {
		if (!selectedVideo?.url) {
			toast.error("Please enter a source URL first");
			return;
		}
		if (selectedVideo.download_url) {
			toast.error("A download URL already exists for this video");
			return;
		}
		// Every Mux asset is created with an MP4; its url follows from the
		// playback id.
		const playbackId = extractMuxPlaybackIdFromUrl(selectedVideo.url);
		if (playbackId) {
			await inputChange({ download_url: muxDownloadUrl(playbackId) });
			setDownloadButtonParams({ loading: false, text: "Done", disabled: true });
			return;
		}
		toast.error("Please enter a valid Mux source URL first");
	};

	return {
		selectedVideo,
		setSelectedVideo,
		saving,
		changes,
		inputChange,
		deleteChange,
		cancelVideoInspection,
		saveVideoInspection,
		showThumbnailSelector,
		setShowThumbnailSelector,
		downloadButtonParams,
		generateMuxDownload,
		resetDownloadBtn,
	};
}
