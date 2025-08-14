import { FetchAPI } from "../services/http/requestHandler";
import { User } from "../types";

export const QuerySelf = (token?: string) => {
	return FetchAPI<User>(
		{
			url: "/auth/v1.1/self",
			method: "GET",
		},
		{ auth: true, authToken: token }
	);
};
