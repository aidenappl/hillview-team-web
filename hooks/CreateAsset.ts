import { Asset } from "../models/asset.model";
import { FetchAPI } from "../services/http/requestHandler";

export const CreateAsset = (data: any) => {
	return FetchAPI<Asset>(
		{
			method: "POST",
			url: "/core/v1.1/admin/asset",
			data,
		},
		{ auth: true }
	);
};
