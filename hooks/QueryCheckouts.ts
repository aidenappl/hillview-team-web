import { Checkout } from "../models/checkout.model";
import { FetchAPI } from "../services/http/requestHandler";

export const QueryCheckouts = (params: { limit: number; offset: number }) => {
	return FetchAPI<Checkout[]>(
		{
			method: "GET",
			url: "/core/v1.1/admin/checkouts",
			params,
		},
		{ auth: true }
	);
};
