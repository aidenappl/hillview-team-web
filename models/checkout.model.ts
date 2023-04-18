import { Asset } from "./asset.model";
import { GeneralNSN } from "./GeneralNSN.model";

export interface Checkout {
	id: number;
	user: AssetUser;
	associated_user: number;
	asset: Asset;
	asset_id: number;
	offsite: number;
	checkout_status: GeneralNSN;
	checkout_notes: string;
	time_out: string;
	time_in: string;
	expected_in: any;
}

export interface AssetUser {
	id: number;
	name: string;
	email: string;
	identifier: string;
	status: GeneralNSN;
	profile_image_url: string;
	inserted_at: string;
}
