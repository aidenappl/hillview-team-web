import { FetchAPI } from "../http/requestHandler";
import { Playlist, PlaylistInput, PlaylistChanges, PlaylistQueryParams } from "../../types";

export const reqGetPlaylists = (params: PlaylistQueryParams) =>
    FetchAPI<Playlist[]>({ method: "GET", url: "/core/v1.1/admin/playlists", params }, { auth: true });

export const reqCreatePlaylist = (data: PlaylistInput) =>
    FetchAPI<Playlist>({ method: "POST", url: "/core/v1.1/admin/playlist", data }, { auth: true });

export const reqUpdatePlaylist = (id: number, changes: PlaylistChanges) =>
    FetchAPI<Playlist>({ method: "PUT", url: `/core/v1.1/admin/playlist/${id}`, data: { id, changes } }, { auth: true });
