import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { reqGetSpotlight, reqReorderSpotlight, reqUpdateSpotlight } from "../../services/api/spotlight.service";
import { Spotlight, SpotlightChanges } from "../../types";

export const useSpotlight = () => {
	const [spotlightedVideos, setSpotlightedVideos] = useState<
		Spotlight[] | null
	>(null);

	const hydrateSpotlight = useCallback(async () => {
		try {
			const response = await reqGetSpotlight({ limit: 20, offset: 0 });
			if (response.success) {
				setSpotlightedVideos(response.data);
			} else {
				toast.error("Failed to load spotlight videos");
			}
		} catch {
			toast.error("Failed to load spotlight videos");
		}
	}, []);

	const updateSpotlight = useCallback(async (spotlight: Spotlight) => {
		try {
			const response = await reqUpdateSpotlight(spotlight.position, spotlight.video_id);
			if (response.success) {
				setSpotlightedVideos(
					(prev) =>
						prev?.map((s) => (s.position === spotlight.position ? response.data : s)) || null
				);
			} else {
				toast.error("Failed to update spotlight");
			}
		} catch {
			toast.error("Failed to update spotlight");
		}
	}, []);

	const reorderSpotlights = useCallback(async (items: SpotlightChanges[]) => {
		try {
			const response = await reqReorderSpotlight(items);
			if (response.success) setSpotlightedVideos(response.data);
			return response;
		} catch {
			toast.error("Failed to reorder spotlight");
			return { success: false, error: "request_failed", error_message: "Unexpected error", error_code: -1 } as const;
		}
	}, []);

	const clearSpotlight = useCallback(() => setSpotlightedVideos(null), []);

	return {
		spotlightedVideos,
		hydrateSpotlight,
		clearSpotlight,
		updateSpotlight,
		reorderSpotlights,
	};
};
