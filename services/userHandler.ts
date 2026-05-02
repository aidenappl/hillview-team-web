import { reqGetSelf } from "./api/user.service";
import { User } from "../types";

type GetTeamUserRequest = {
	withToken?: string;
};

const GetTeamUser = async (req: GetTeamUserRequest): Promise<User | null> => {
	try {
		const response = await reqGetSelf(req.withToken);
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
