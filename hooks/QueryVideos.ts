
import { FetchAPI } from "../services/http/requestHandler";
import { Video } from "../types";

export const QueryVideos = (params: {
	search?: string;
	limit: number;
	offset: number;
}) => {
	return FetchAPI<Video[]>(
		{
			method: "GET",
			url: "/core/v1.1/admin/videos",
			params,
		},
		{ auth: true }
	);
};
