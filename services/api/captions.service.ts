import { FetchAPI } from "../http/requestHandler";
import { VideoCaption } from "../../types";

// Captions are keyed by the video's uuid and proxied through videoAPI, which
// owns the Cloudflare Stream integration.

export const reqGetVideoCaption = (uuid: string) =>
	FetchAPI<VideoCaption>(
		{ method: "GET", url: `/video/v1.1/captions/${uuid}` },
		{ auth: true },
	);

export const reqSaveVideoCaption = (uuid: string, vtt: string) =>
	FetchAPI<VideoCaption>(
		{ method: "PUT", url: `/video/v1.1/captions/${uuid}`, data: { vtt } },
		{ auth: true },
	);

export const reqRegenerateVideoCaption = (uuid: string) =>
	FetchAPI<VideoCaption>(
		{ method: "POST", url: `/video/v1.1/captions/${uuid}/regenerate` },
		{ auth: true },
	);
