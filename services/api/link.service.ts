import { FetchAPI } from "../http/requestHandler";
import { Link, LinkInput, LinkChanges, LinkQueryParams } from "../../types";

export const reqGetLinks = (params: LinkQueryParams) =>
    FetchAPI<Link[]>({ method: "GET", url: "/core/v1.1/admin/links", params }, { auth: true });

export const reqCreateLink = (data: LinkInput) =>
    FetchAPI<Link>({ method: "POST", url: "/core/v1.1/admin/link", data }, { auth: true });

export const reqUpdateLink = (id: number, changes: LinkChanges) =>
    FetchAPI<Link>({ method: "PUT", url: `/core/v1.1/admin/link/${id}`, data: { id, changes } }, { auth: true });
