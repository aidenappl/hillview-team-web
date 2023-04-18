import { GeneralNSM } from "./generalNSM.model";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profile_image_url: string;
  authentication: GeneralNSM;
  inserted_at: string;
  last_active: string;
  strategies: Strategies;
}

export interface Strategies {
  google_id: string;
  password: any;
}