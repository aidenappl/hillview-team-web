export interface Asset {
	id: number;
	name: string;
	image_url: string;
	identifier: string;
	description: string;
	category: Category;
	status: Status;
	metadata: Metadata;
	active_tab: ActiveTab;
	inserted_at: string;
}

export interface Category {
	id: number;
	name: string;
	short_name: string;
}

export interface Status {
	id: number;
	name: string;
	short_name: string;
}

export interface Metadata {
	serial_number: string;
	manufacturer: string;
	model: string;
	notes: string;
}

export interface ActiveTab {
	id: number;
	associated_user: number;
}
