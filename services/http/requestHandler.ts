import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { GetSessionAccessToken } from "../sessionHandler";

// Generic success response
type ApiSuccess<T> = {
	success: true;
	message: string;
	data: T;
};

// Generic error response
type ApiError = {
	success?: false;
	error: string;
	error_message: string;
	error_code: number;
};

// Union type for API responses
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Axios instance for API requests
const axios_api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	validateStatus: () => true,
	timeout: 10000,
});

// Basic fetch instance for non-API requests
const fetch = axios.create({
	headers: {
		"Content-Type": "application/json",
	},
	validateStatus: () => true,
	timeout: 10000,
});

// Fetch API instance for making API requests
const FetchAPI = async <T>(
	config: AxiosRequestConfig,
	req: { auth?: boolean; authToken?: string } = {}
): Promise<ApiResponse<T>> => {
	try {
		if (req.auth) {
			config.headers = config.headers || {};
			config.headers["Authorization"] =
				"Bearer " + GetSessionAccessToken();
		}

		if (req.authToken) {
			config.headers = config.headers || {};
			config.headers["Authorization"] = "Bearer " + req.authToken;
		}
		const response = await axios_api.request(config);

		if (response.status === 204) {
			return {
				success: true,
				message: "No Content",
				data: {} as T,
			};
		}

		if (response.data && response.data.success) {
			return {
				success: true,
				message: response.data.message,
				data: response.data.data as T,
			};
		}

		return {
			success: false,
			error: response.data?.error ?? "Unknown error",
			error_message:
				response.data?.error_message ?? "Unexpected error occurred",
			error_code: response.data?.error_code ?? 0,
		};
	} catch (err: unknown) {
		const axiosError = err as AxiosError;
		return {
			success: false,
			error: "request_failed",
			error_message: axiosError.message ?? "Request failed unexpectedly",
			error_code: -1,
		};
	}
};

export { FetchAPI, fetch };
