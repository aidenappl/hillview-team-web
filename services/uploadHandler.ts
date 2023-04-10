import axios from "axios";
import { GeneralResponse } from "../models/generalResponse.model";
import { GetSessionAccessToken } from "./sessionHandler";

interface UploadImageReq {
	id: string | number;
	route: string;
	image: any;
}

const UploadImage = async (req: UploadImageReq): Promise<GeneralResponse> => {
	try {
		var formData = new FormData();
		formData.append("image", req.image);
		formData.append("id", req.id.toString());
		formData.append("route", req.route);
		let response = await axios.post(
			"https://api.hillview.tv/core/v1.1/admin/upload",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: "Bearer " + GetSessionAccessToken(),
				},
			}
		);
		return {
			success: true,
			status: response.status,
			message: "success",
			data: response.data,
		};
	} catch (error: any) {
		console.error(error);
		return {
			status: 500,
			message: error.message,
			success: false,
			data: error,
		};
	}
};

export default UploadImage;
