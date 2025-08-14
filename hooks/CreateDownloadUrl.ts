import { FetchAPI } from "../services/http/requestHandler";

export const CreateDownloadUrl = (id: number | string) => {
	return FetchAPI<any>(
		{
			method: "POST",
			url: `/video/v1.1/upload/cf/${id}/generateDownload`,
		},
		{ auth: true }
	);
};
