import { MobileUser } from "../components/pages/team/users/UsersPagePlatformUsers";
import { FetchAPI } from "../services/http/requestHandler";

export const UpdateMobileUser = async (userId: number, data: any) => {
	const response = await FetchAPI<MobileUser>(
		{
			url: `/core/v1.1/admin/mobileUser/${userId}`,
			method: "PUT",
			data: {
				changes: data,
			},
		},
		{ auth: true }
	);
	return response;
};
