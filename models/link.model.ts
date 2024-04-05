export interface Link {
	id: number;
	route: string;
	destination: string;
	active: boolean;
	clicks: number;
	creator: LinkCreator;
	inserted_at: string;
}

export interface LinkCreator {
	id: number;
	name: string;
	email: string;
	profile_image_url: string;
}
