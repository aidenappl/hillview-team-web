import { Asset } from "../models/asset.model";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryAssets = (params: {
	limit: number;
	sort: "ASC" | "DESC";
	offset: number;
	search?: string;
}) => {
	return FetchAPI<Asset[]>(
		{
			method: "GET",
			url: "/core/v1.1/admin/assets",
			params,
		},
		{ auth: true }
	);
};
