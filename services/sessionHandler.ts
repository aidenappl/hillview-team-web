import { ClearStoreUser, UpdateStoreUser } from "../redux/user/update";
import { RemoveToken, RetrieveToken, StoreToken } from "./cookieHandler";
import { GeneralResponse } from "../models/generalResponse.model";
import {
	AccessTokenExpiration,
	ParseToken,
	RefreshTokenExpiration,
} from "./tokenHandler";
import { GetTeamUser } from "./userHandler";
import { FetchAPI } from "./http/requestHandler";
import { User } from "../types";

var sessionActive = false;
var sessionAccessToken: string | null = null;

// Launch session from stored cookies.
// Checks the access token, refreshes it if expired, then fetches the current user.
// Returns null only if there are no tokens at all (unauthenticated state).
type LoadSessionRequest = {
	dispatch: any;
};

const LoadSessionFromStore = async (
	req: LoadSessionRequest
): Promise<GeneralResponse | null> => {
	try {
		const access = RetrieveToken("access");
		const refresh = RetrieveToken("refresh");

		if (!access || !refresh) {
			return {
				status: 401,
				message: "No session tokens found",
				data: null,
				success: false,
			};
		}

		const token: any = await ParseToken(String(access));
		if (!token) {
			return {
				status: 400,
				message: "Failed to parse access token",
				data: null,
				success: false,
			};
		}

		const tokenExpiresIn = token.exp - Math.floor(Date.now() / 1000);
		if (tokenExpiresIn < 0) {
			// Access token expired — use the refresh token to get a new one
			const tokenResp = await RefreshSession();
			if (!tokenResp.success) {
				return {
					status: 401,
					message: "Failed to refresh session",
					data: null,
					success: false,
				};
			}
			sessionActive = true;
			sessionAccessToken = tokenResp.data!.access_token;
		} else {
			// Access token still valid
			sessionActive = true;
			sessionAccessToken = access;
		}

		const user = await GetTeamUser({});
		if (!user) {
			return {
				status: 400,
				message: "Failed to retrieve user",
				data: null,
				success: false,
			};
		}

		await UpdateStoreUser(user, req.dispatch);
		return {
			status: 200,
			message: "Successfully launched session",
			data: user,
			success: true,
		};
	} catch (error: any) {
		await KillSession({ dispatch: req.dispatch });
		return {
			status: error.code ?? 500,
			message: "Failed to launch session: " + error.message,
			data: error,
			success: false,
		};
	}
};

// Start a new session after login
type RequestInitializeSession = {
	accessToken: string;
	refreshToken: string;
	user: User;
	dispatch: any;
};

const InitializeSession = async (
	req: RequestInitializeSession
): Promise<GeneralResponse> => {
	try {
		await StoreToken("access", req.accessToken, AccessTokenExpiration);
		await StoreToken("refresh", req.refreshToken, RefreshTokenExpiration);
		await UpdateStoreUser(req.user, req.dispatch);
		sessionActive = true;
		sessionAccessToken = req.accessToken;
		return {
			status: 200,
			message: "Successfully initialized session",
			data: req.user,
			success: true,
		};
	} catch (error: any) {
		await KillSession({ dispatch: req.dispatch });
		return {
			status: error.code,
			message: "Failed to initialize session: " + error.message,
			data: error,
			success: false,
		};
	}
};

// Clear session state and cookies
type RequestEndSession = {
	dispatch: any;
	router?: any;
	navigate?: boolean;
};

const KillSession = async (
	req: RequestEndSession
): Promise<GeneralResponse> => {
	try {
		await RemoveToken("access");
		await RemoveToken("refresh");
		await ClearStoreUser(req.dispatch);
		sessionActive = false;
		sessionAccessToken = null;
		if (req.router && req.navigate) {
			req.router.push("/");
		}
		return {
			status: 200,
			message: "Successfully killed session",
			data: null,
			success: true,
		};
	} catch (error: any) {
		return {
			status: error.code,
			message: "Failed to kill session: " + error.message,
			data: error,
			success: false,
		};
	}
};

type TokenResponse = {
	access_token: string;
};

// Exchange the stored refresh token for a new access token
const RefreshSession = async (): Promise<GeneralResponse> => {
	const refresh = RetrieveToken("refresh");
	if (!refresh) {
		await RemoveToken("access");
		sessionActive = false;
		sessionAccessToken = null;
		return {
			status: 401,
			message: "No refresh token found",
			data: null,
			success: false,
		};
	}

	const tokenRequest = await FetchAPI<TokenResponse>({
		method: "POST",
		url: "/auth/v1.1/token",
		data: { refreshToken: refresh },
	});

	if (tokenRequest.success && tokenRequest.data?.access_token) {
		await StoreToken("access", tokenRequest.data.access_token, AccessTokenExpiration);
		sessionActive = true;
		sessionAccessToken = tokenRequest.data.access_token;
		return {
			status: 200,
			message: "Successfully refreshed session",
			data: tokenRequest.data,
			success: true,
		};
	}

	// Refresh failed — clear both tokens
	await RemoveToken("access");
	await RemoveToken("refresh");
	sessionActive = false;
	sessionAccessToken = null;
	return {
		status: 401,
		message: "Failed to refresh session",
		data: null,
		success: false,
	};
};

// Returns true if there is an active in-memory session
const SessionInService = (): boolean => {
	return sessionActive && RetrieveToken("access") !== null;
};

// Returns the current access token (reads from cookie as source of truth)
const GetSessionAccessToken = (): string | null => {
	return RetrieveToken("access");
};

export {
	KillSession,
	InitializeSession,
	LoadSessionFromStore,
	RefreshSession,
	SessionInService,
	GetSessionAccessToken,
};
