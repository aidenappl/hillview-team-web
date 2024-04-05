import { GeneralNSM } from "./generalNSM.model";

export const PlaylistStatus = {
	Active: 1,
	Archived: 2,
	Hidden: 3,
};

export const PlaylistStatuses: GeneralNSM[] = [
	{
		id: PlaylistStatus.Active,
		name: "Active",
		short_name: "active",
	},
	{
		id: PlaylistStatus.Archived,
		name: "Archived",
		short_name: "archived",
	},
	{
		id: PlaylistStatus.Hidden,
		name: "Hidden",
		short_name: "hidden",
	},
];
