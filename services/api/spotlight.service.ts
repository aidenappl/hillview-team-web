import { FetchAPI } from "../http/requestHandler";
import { Spotlight, SpotlightChanges, SpotlightQueryParams } from "../../types";

export const reqGetSpotlight = (params: SpotlightQueryParams) =>
    FetchAPI<Spotlight[]>({ method: "GET", url: "/core/v1.1/admin/spotlight", params }, { auth: true });

export const reqUpdateSpotlight = (position: number, video_id: number) =>
    FetchAPI<Spotlight>({ method: "PUT", url: `/core/v1.1/admin/spotlight/${position}`, data: { video_id, position } }, { auth: true });

export const reqReorderSpotlight = (items: SpotlightChanges[]) =>
    FetchAPI<Spotlight[]>({ method: "PUT", url: "/core/v1.1/admin/spotlight/reorder", data: items }, { auth: true });
