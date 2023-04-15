import { GeneralResponse } from "../models/generalResponse.model";
import { KillSession } from "./sessionHandler";

type RequestLogout = {
	dispatch: any;
	router: any;
};
const Logout = async (req: RequestLogout): Promise<GeneralResponse> => {
	try {
		const response = await KillSession({
			dispatch: req.dispatch,
		});
		req.router.replace("/");
		return {
			status: 200,
			message: "Successfully logged out",
			data: null,
			success: true,
		};
	} catch (error: any) {
		console.error(error);
		req.router.replace("/");
		return {
			status: 200,
			message: "Successfully logged out",
			data: null,
			success: true,
		};
	}
};

export { Logout };
