import { FetchAPI } from "../http/requestHandler";
import { Video, VideoInput, VideoChanges, VideoQueryParams } from "../../types";

export const reqGetVideos = (params: VideoQueryParams) =>
    FetchAPI<Video[]>({ method: "GET", url: "/core/v1.1/admin/videos", params }, { auth: true });

export const reqCreateVideo = (data: VideoInput) =>
    FetchAPI<Video>({ method: "POST", url: "/core/v1.1/admin/video", data }, { auth: true });

export const reqUpdateVideo = (id: number, changes: VideoChanges) =>
    FetchAPI<Video>({ method: "PUT", url: `/core/v1.1/admin/video/${id}`, data: { id, changes } }, { auth: true });
