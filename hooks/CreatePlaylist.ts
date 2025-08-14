import { Playlist } from "../models/playlist.model";
import { FetchAPI } from "../services/http/requestHandler";

export const CreatePlaylist = (data: any) => {
	return FetchAPI<Playlist>(
		{
			method: "POST",
			url: "/core/v1.1/admin/playlist",
			data,
		},
		{ auth: true }
	);
};
