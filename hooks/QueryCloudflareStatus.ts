import { CloudflareStatus } from "../models/cloudflareStatus.model";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryCloudflareStatus = (id: number | string) => {
	return FetchAPI<CloudflareStatus>(
		{
			method: "GET",
			url: `/video/v1.1/upload/cf/${id}`,
		},
		{ auth: true }
	);
};
