import { FetchAPI } from "../services/http/requestHandler";
import { User } from "../types";

export const QueryUsers = (params: { limit: number; offset: number }) => {
	return FetchAPI<User[]>(
		{
			url: "/core/v1.1/admin/users",
			method: "GET",
			params,
		},
		{ auth: true }
	);
};
