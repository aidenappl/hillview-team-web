import { User } from "../types";
import { FetchAPI } from "./http/requestHandler";

type GetTeamUserRequest = {
	withToken?: string;
};

const GetTeamUser = async (req: GetTeamUserRequest): Promise<User | null> => {
	try {
		const response = await FetchAPI<User>(
			{
				url: "/auth/v1.1/self",
				method: "GET",
			},
			{ auth: true, authToken: req.withToken }
		);
		if (response.success) {
			return response.data;
		} else {
			return null;
		}
	} catch (error: any) {
		throw error;
	}
};

export { GetTeamUser };
