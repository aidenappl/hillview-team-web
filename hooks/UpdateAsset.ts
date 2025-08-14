import { FetchAPI } from "../services/http/requestHandler";

export const UpdateAsset = (id: number, changes: any) => {
	return FetchAPI(
		{
			method: "PUT",
			url: `/core/v1.1/admin/asset/${id}`,
			data: {
				id,
				changes,
			},
		},
		{ auth: true }
	);
};
