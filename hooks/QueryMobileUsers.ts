import { MobileUser } from "../components/pages/team/users/UsersPagePlatformUsers";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryMobileUsers = (params: { limit: number; offset: number }) => {
	return FetchAPI<MobileUser[]>(
		{
			url: "/core/v1.1/admin/mobileUsers",
			method: "GET",
			params,
		},
		{ auth: true }
	);
};
