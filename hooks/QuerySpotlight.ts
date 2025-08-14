import { FetchAPI } from "../services/http/requestHandler";

export const QuerySpotlight = (params: { limit: number; offset: number }) => {
	return FetchAPI<any>(
		{
			method: "GET",
			url: "/core/v1.1/admin/spotlight",
			params,
		},
		{ auth: true }
	);
};
