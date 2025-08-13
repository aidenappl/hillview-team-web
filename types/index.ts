type GoogleAuthResponse = {
	access_token: string;
	refresh_token: string;
	user: User;
};

type User = {
	id: number;
	username: string;
	name: string;
	email: string;
	profile_image_url: string;
	authentication: GeneralNSM;
	inserted_at: string;
	last_active: string;
	strategies: Strategies;
};

type Strategies = {
	google_id: string;
	password: any;
};

type GeneralNSM = {
	id: number;
	name: string;
	short_name: string;
};

export type { GoogleAuthResponse, User };
