import { User } from "../models/user.model";
import { NewRequest } from "./http/requestHandler";

type GetTeamUserRequest = {
    withToken?: string
}

const GetTeamUser = async (req: GetTeamUserRequest): Promise<User | null> => {
    try {
        const response = await NewRequest({
            route: "/team/v1.1/user",
            method: "GET",
            auth: true,
            authToken: req.withToken,
        });
        if (response.success) {
            return response.data as User;
        } else {
            return null
        }
    } catch (error: any) {
        throw error;
    }
}

export {GetTeamUser}