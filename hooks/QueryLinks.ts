import { Link } from "../models/link.model";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryLinks = (params: { limit: number; offset: number }) => {
	return FetchAPI<Link[]>(
		{
			method: "GET",
			url: "/core/v1.1/admin/links",
			params,
		},
		{ auth: true }
	);
};
