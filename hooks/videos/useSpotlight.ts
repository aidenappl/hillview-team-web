import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { reqGetSpotlight, reqReorderSpotlight, reqUpdateSpotlight } from "../../services/api/spotlight.service";
import { Spotlight, SpotlightChanges } from "../../types";

export const useSpotlight = () => {
	const [spotlightedVideos, setSpotlightedVideos] = useState<
		Spotlight[] | null
	>(null);

	const hydrateSpotlight = useCallback(async () => {
		const response = await reqGetSpotlight({ limit: 20, offset: 0 });
		if (response.success) {
			setSpotlightedVideos(response.data);
		} else {
			toast.error("Failed to load spotlight videos");
		}
	}, []);

	const updateSpotlight = useCallback(async (spotlight: Spotlight) => {
		const response = await reqUpdateSpotlight(spotlight.rank, spotlight.video_id);
		if (response.success) {
			setSpotlightedVideos(
				(prev) =>
					prev?.map((s) => (s.rank === spotlight.rank ? response.data : s)) || null
			);
		} else {
			toast.error("Failed to update spotlight");
		}
	}, []);

	const reorderSpotlights = useCallback(async (items: SpotlightChanges[]) => {
		const response = await reqReorderSpotlight(items);
		if (response.success) setSpotlightedVideos(response.data);
		return response;
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
