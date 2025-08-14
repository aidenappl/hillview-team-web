import { FetchAPI } from "../services/http/requestHandler";

export const UpdateLink = async (id: number, changes: any) => {
	const response = await FetchAPI(
		{
			method: "PUT",
			url: `/core/v1.1/admin/link/${id}`,
			data: {
				id,
				changes,
			},
		},
		{ auth: true }
	);
	return response;
};
