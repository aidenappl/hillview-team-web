import { Video } from "./video.model";
import { GeneralNSM } from "./generalNSM.model";
export interface Playlist {
	id: number;
	name: string;
	description: string;
	banner_image: string;
	status: GeneralNSM;
	route: string;
	inserted_at: string;
	videos?: Video[];
}
