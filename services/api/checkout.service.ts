import { FetchAPI } from "../http/requestHandler";
import { Checkout, CheckoutChanges, CheckoutQueryParams } from "../../types";

export const reqGetCheckouts = (params: CheckoutQueryParams) =>
    FetchAPI<Checkout[]>({ method: "GET", url: "/core/v1.1/admin/checkouts", params }, { auth: true });

export const reqUpdateCheckout = (id: number, changes: CheckoutChanges) =>
    FetchAPI<Checkout>({ method: "PUT", url: `/core/v1.1/admin/checkout/${id}`, data: { changes } }, { auth: true });
