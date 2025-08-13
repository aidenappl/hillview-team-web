import { User } from "../models/user.model";
import { FetchAPI } from "./http/requestHandler";

type GetTeamUserRequest = {
	withToken?: string;
};

const GetTeamUser = async (req: GetTeamUserRequest): Promise<User | null> => {
	try {
		const response = await FetchAPI(
			{
				url: "/auth/v1.1/self",
				method: "GET",
			},
			{ auth: true, authToken: req.withToken }
		);
		if (response.success) {
			return response.data as User;
		} else {
			return null;
		}
	} catch (error: any) {
		throw error;
	}
};

export { GetTeamUser };
