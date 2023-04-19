import axios from "axios";
import { GeneralResponse } from "../models/generalResponse.model";
import { GetSessionAccessToken } from "./sessionHandler";

interface UploadImageReq {
	upload: any;
	uploadProgress: (progress: number) => void;
}

const UploadVideo = async (req: UploadImageReq): Promise<GeneralResponse> => {
	try {
		var formData = new FormData();
		formData.append("upload", req.upload);
		let response = await axios.post(
			"https://api.hillview.tv/video/v1.1/upload/video",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: "Bearer " + GetSessionAccessToken(),
				},
				onUploadProgress: (progressEvent) => {
					let percentage = Math.floor(progressEvent.progress! * 100);
					req.uploadProgress(percentage);
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

export default UploadVideo;
