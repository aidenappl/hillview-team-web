import { FetchAPI } from "../services/http/requestHandler";

export const UpdateUser = async (userId: number, data: any) => {
	return FetchAPI(
		{
			url: `/core/v1.1/admin/user/${userId}`,
			method: "PUT",
			data: {
				changes: data,
			},
		},
		{ auth: true }
	);
};
