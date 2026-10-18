import { FetchAPI } from "../http/requestHandler";
import { MuxUpload, MuxUploadStatus } from "../../types";

// New uploads go to Mux through videoAPI, which holds the Mux credentials.

export const reqCreateMuxUpload = () =>
	FetchAPI<MuxUpload>({ method: "POST", url: "/video/v1.1/upload/mux/upload" }, { auth: true });

export const reqGetMuxUploadStatus = (uploadID: string) =>
	FetchAPI<MuxUploadStatus>({ method: "GET", url: `/video/v1.1/upload/mux/${uploadID}` }, { auth: true });
