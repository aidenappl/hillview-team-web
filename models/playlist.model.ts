import { GeneralNSN } from "./GeneralNSN.model";
import { PlaylistStatus, PlaylistStatuses } from "./playlistStatus.model";
export interface Playlist {
	id: number;
	name: string;
	description: string;
	banner_image: string;
	status: GeneralNSN;
	route: string;
	inserted_at: string;
	videos: any;
}
