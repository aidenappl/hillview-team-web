import { useCallback, useState } from "react";
import { reqGetSpotlight, reqUpdateSpotlight } from "../../services/api/spotlight.service";
import { Spotlight } from "../../types";

export const useSpotlight = () => {
	const [spotlightedVideos, setSpotlightedVideos] = useState<
		Spotlight[] | null
	>(null);

	const hydrateSpotlight = useCallback(async () => {
		const response = await reqGetSpotlight({ limit: 20, offset: 0 });
		if (response.success) setSpotlightedVideos(response.data);
	}, []);

	const updateSpotlight = useCallback(async (spotlight: Spotlight) => {
		const response = await reqUpdateSpotlight(spotlight.rank, spotlight.video_id);
		if (response.success) {
			setSpotlightedVideos(
				(prev) =>
					prev?.map((s) => (s.rank === spotlight.rank ? spotlight : s)) || null
			);
		}
	}, []);

	const clearSpotlight = useCallback(() => setSpotlightedVideos(null), []);

	return {
		spotlightedVideos,
		hydrateSpotlight,
		clearSpotlight,
		updateSpotlight,
	};
};
