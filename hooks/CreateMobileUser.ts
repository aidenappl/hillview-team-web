import { FetchAPI } from "../services/http/requestHandler";

export const CreateMobileUser = (data: any) => {
    return FetchAPI<any>(
        {
            method: "POST",
            url: "/core/v1.1/admin/mobileUser",
            data,
        },
        { auth: true }
    );
}