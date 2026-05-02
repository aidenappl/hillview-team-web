import { FetchAPI } from "../http/requestHandler";
import { Spotlight, SpotlightQueryParams } from "../../types";

export const reqGetSpotlight = (params: SpotlightQueryParams) =>
    FetchAPI<Spotlight[]>({ method: "GET", url: "/core/v1.1/admin/spotlight", params }, { auth: true });

export const reqUpdateSpotlight = (rank: number, video_id: number) =>
    FetchAPI<Spotlight[]>({ method: "PUT", url: `/core/v1.1/admin/spotlight/${rank}`, data: { video_id, rank } }, { auth: true });
