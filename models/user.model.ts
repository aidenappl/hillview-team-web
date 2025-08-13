import { GeneralNSM } from "./generalNSM.model";

export const UserType = {
	Unauthorized: 1,
	Student: 2,
	Admin: 3,
	Deleted: 9,
};

export const UserTypes: GeneralNSM[] = [
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
		hidden: true,
	},
];
