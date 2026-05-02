import { FetchAPI } from "../http/requestHandler";
import { Asset, AssetInput, AssetChanges, AssetQueryParams } from "../../types";

export const reqGetAssets = (params: AssetQueryParams) =>
    FetchAPI<Asset[]>({ method: "GET", url: "/core/v1.1/admin/assets", params }, { auth: true });

export const reqCreateAsset = (data: AssetInput) =>
    FetchAPI<Asset>({ method: "POST", url: "/core/v1.1/admin/asset", data }, { auth: true });

export const reqUpdateAsset = (id: number, changes: AssetChanges) =>
    FetchAPI<Asset>({ method: "PUT", url: `/core/v1.1/admin/asset/${id}`, data: { id, changes } }, { auth: true });
