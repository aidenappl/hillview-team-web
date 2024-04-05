import { GeneralNSM } from "./generalNSM.model";

export interface Video {
	id: number;
	uuid: string;
	title: string;
	description: string;
	thumbnail: string;
	url: string;
	download_url: string;
	allow_downloads: boolean;
	views: number;
	status: GeneralNSM;
	inserted_at: string;
}
