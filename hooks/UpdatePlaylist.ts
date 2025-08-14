import { FetchAPI } from "../services/http/requestHandler";

export const UpdatePlaylist = (id: number, changes: any) => {
	return FetchAPI(
		{
			method: "PUT",
			url: `/core/v1.1/admin/playlist/${id}`,
			data: {
				id,
				changes,
			},
		},
		{ auth: true }
	);
};
