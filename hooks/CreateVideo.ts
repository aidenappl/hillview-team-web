import { FetchAPI } from "../services/http/requestHandler";

export const CreateVideo = async (data: any) => {
	return FetchAPI(
		{
			method: "POST",
			url: "/core/v1.1/admin/video",
			data,
		},
		{ auth: true }
	);
};
