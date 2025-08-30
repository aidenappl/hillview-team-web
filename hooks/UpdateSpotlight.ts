import { FetchAPI } from "../services/http/requestHandler";
import { Spotlight, Video } from "../types";

export const UpdateSpotlight = (rank: number, video_id: number) => {
	return FetchAPI<Spotlight[]>(
		{
			method: "PUT",
			url: `/core/v1.1/admin/spotlight/${rank}`,
			data: { video_id: video_id, rank: rank },
		},
		{ auth: true }
	);
};
