import { FetchAPI } from "../services/http/requestHandler";

export const UpdateCheckout = async (id: number, changes: any) => {
	return FetchAPI(
		{
			method: "PUT",
			url: `/core/v1.1/admin/checkout/${id}`,
			data: {
				changes,
			},
		},
		{ auth: true }
	);
};
