import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { GetSessionAccessToken, RefreshSession } from "../sessionHandler";

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

// Track refresh state to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
};

// Axios instance for API requests
const axios_api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	validateStatus: () => true,
	timeout: 10000,
});

// Response interceptor for handling expired token errors and token refresh
axios_api.interceptors.response.use(
	(response) => {
		const isTokenExpired = response.data?.error_message === "token is expired";

		// If not expired token or request is already a retry, return as-is
		if (!isTokenExpired || (response.config as any)._retry) {
			return response;
		}

		// Only retry if this was an authenticated request
		if (!response.config.headers?.Authorization) {
			return response;
		}

		const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };

		if (isRefreshing) {
			// Queue this request until refresh completes
			return new Promise((resolve, reject) => {
				failedQueue.push({
					resolve: (token: string) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						resolve(axios_api.request(originalRequest));
					},
					reject: (err: any) => {
						reject(err);
					},
				});
			});
		}

		originalRequest._retry = true;
		isRefreshing = true;

		return new Promise((resolve, reject) => {
			RefreshSession()
				.then((refreshResult) => {
					if (refreshResult.success && refreshResult.data?.access_token) {
						const newToken = refreshResult.data.access_token;
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						processQueue(null, newToken);
						resolve(axios_api.request(originalRequest));
					} else {
						// Refresh failed - don't auto-kill session here, let the caller handle it
						processQueue(new Error("Token refresh failed"), null);
						resolve(response); // Return original 401 response
					}
				})
				.catch((err) => {
					processQueue(err, null);
					reject(err);
				})
				.finally(() => {
					isRefreshing = false;
				});
		});
	},
	(error) => {
		return Promise.reject(error);
	}
);

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
