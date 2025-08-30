import { FetchAPI } from "../services/http/requestHandler";
import { Spotlight } from "../types";

export const QuerySpotlight = (params: { limit: number; offset: number }) => {
	return FetchAPI<Spotlight[]>(
		{
			method: "GET",
			url: "/core/v1.1/admin/spotlight",
			params,
		},
		{ auth: true }
	);
};
