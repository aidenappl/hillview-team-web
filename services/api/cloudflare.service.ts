import { FetchAPI } from "../http/requestHandler";
import { CloudflareStatus } from "../../types";

export const reqGetCloudflareStatus = (id: number | string) =>
    FetchAPI<CloudflareStatus>({ method: "GET", url: `/video/v1.1/upload/cf/${id}` }, { auth: true });

export const reqCreateDownloadUrl = (id: number | string) =>
    FetchAPI<{ result: { default: { url: string } } }>({ method: "POST", url: `/video/v1.1/upload/cf/${id}/generateDownload` }, { auth: true });
