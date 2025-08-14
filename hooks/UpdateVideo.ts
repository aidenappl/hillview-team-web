import { FetchAPI } from "../services/http/requestHandler";

export const UpdateVideo = (id: number, changes: any) => {
	return FetchAPI(
		{
			method: "PUT",
			url: `/core/v1.1/admin/video/${id}`,
			data: {
				id,
				changes,
			},
		},
		{ auth: true }
	);
};
