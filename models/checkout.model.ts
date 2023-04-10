import { Asset } from "./asset.model";
import { GeneralNSM } from "./generalNSM.model";

export interface Checkout {
	id: number;
	user: AssetUser;
	associated_user: number;
	asset: Asset;
	asset_id: number;
	offsite: number;
	checkout_status: GeneralNSM;
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
	status: GeneralNSM;
	profile_image_url: string;
	inserted_at: string;
}
