import { FetchAPI } from "../http/requestHandler";
import { User, UserChanges, UserQueryParams, MobileUser, MobileUserInput, MobileUserChanges, MobileUserQueryParams } from "../../types";

export const reqGetUsers = (params: UserQueryParams) =>
    FetchAPI<User[]>({ url: "/core/v1.1/admin/users", method: "GET", params }, { auth: true });

export const reqGetSelf = (token?: string) =>
    FetchAPI<User>({ url: "/auth/v1.1/self", method: "GET" }, { auth: true, authToken: token });

export const reqUpdateSelf = (changes: UserChanges) =>
    FetchAPI<User>({ url: "/auth/v1.1/self", method: "PUT", data: { changes } }, { auth: true });

export const reqUpdateUser = (userId: number, changes: UserChanges) =>
    FetchAPI<User>({ url: `/core/v1.1/admin/user/${userId}`, method: "PUT", data: { changes } }, { auth: true });

export const reqGetMobileUsers = (params: MobileUserQueryParams) =>
    FetchAPI<MobileUser[]>({ url: "/core/v1.1/admin/mobileUsers", method: "GET", params }, { auth: true });

export const reqCreateMobileUser = (data: MobileUserInput) =>
    FetchAPI<MobileUser>({ method: "POST", url: "/core/v1.1/admin/mobileUser", data }, { auth: true });

export const reqUpdateMobileUser = (userId: number, changes: MobileUserChanges) =>
    FetchAPI<MobileUser>({ url: `/core/v1.1/admin/mobileUser/${userId}`, method: "PUT", data: { changes } }, { auth: true });
