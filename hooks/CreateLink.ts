import { Link } from "../models/link.model";
import { FetchAPI } from "../services/http/requestHandler";

export const CreateLink = (data: any) => {
	return FetchAPI<Link>(
		{
			method: "POST",
			url: "/core/v1.1/admin/link",
			data,
		},
		{ auth: true }
	);
};
