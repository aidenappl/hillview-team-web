import { GeneralNSN } from "./GeneralNSN.model";

export interface User {
	id: number;
	username: string;
	name: string;
	email: string;
	profile_image_url: string;
	authentication: GeneralNSN;
	inserted_at: string;
	last_active: string;
	strategies: Strategies;
}

export interface Strategies {
	google_id: string;
	password: any;
}

export const UserTypes: GeneralNSN[] = [
	{
		id: 1,
		name: "Unauthorized",
		short_name: "unauthorized",
	},
	{
		id: 2,
		name: "Student",
		short_name: "student",
	},
	{
		id: 3,
		name: "Admin",
		short_name: "admin",
	},
	{
		id: 9,
		name: "Deleted",
		short_name: "deleted",
	},
];
