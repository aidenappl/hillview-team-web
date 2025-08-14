import { Playlist } from "../models/playlist.model";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryPlaylists = (params: { limit: number; offset: number }) => {
	return FetchAPI<Playlist[]>({
		method: "GET",
		url: "/core/v1.1/admin/playlists",
		params,
	}, { auth: true });
};
