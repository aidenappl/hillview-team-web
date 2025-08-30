import { useCallback, useEffect, useState } from "react";
import { Video } from "../../models/video.model";
import { QuerySpotlight } from "../QuerySpotlight";

export const useSpotlight = () => {
	const [spotlightedVideos, setSpotlightedVideos] = useState<Video[] | null>(
		null
	);

	const hydrateSpotlight = useCallback(async () => {
		const response = await QuerySpotlight({ limit: 20, offset: 0 });
		if (response.success) setSpotlightedVideos(response.data);
	}, []);

	const clearSpotlight = useCallback(() => setSpotlightedVideos(null), []);

	return { spotlightedVideos, hydrateSpotlight, clearSpotlight };
};
