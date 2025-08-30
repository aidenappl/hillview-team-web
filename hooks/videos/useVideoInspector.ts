import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Video } from "../../models/video.model";
import { UpdateVideo } from "../UpdateVideo";
import { CreateDownloadUrl } from "../CreateDownloadUrl";
import { extractCloudflareIdFromUrl } from "../../utils/cloudflare";

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
			const response = await UpdateVideo(selectedVideo.id, changes);
			if (response.success) {
				cancelVideoInspection();
				onSaved();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", { position: "top-center" });
			}
		} else {
			setSelectedVideo(null);
		}
	};

	const generateCloudflareDownload = async () => {
		if (!selectedVideo?.url) {
			toast.error("Please enter a source URL first");
			return;
		}
		const id = extractCloudflareIdFromUrl(selectedVideo.url);
		if (!id) {
			toast.error("Please enter a valid source URL first");
			return;
		}
		if (selectedVideo.download_url) {
			toast.error("A download URL already exists for this video");
			return;
		}
		setDownloadButtonParams({
			loading: true,
			text: "Generating...",
			disabled: false,
		});
		const response = await CreateDownloadUrl(id);
		if (response.success) {
			const url = response.data.result?.default?.url;
			await inputChange({ download_url: url });
			setDownloadButtonParams({ loading: false, text: "Done", disabled: true });
		} else {
			console.error(response);
			toast.error(response.error_message);
			setDownloadButtonParams({
				loading: false,
				text: "Failed",
				disabled: false,
			});
		}
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
		generateCloudflareDownload,
		resetDownloadBtn,
	};
}
