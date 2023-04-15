import { ClearStoreUser, UpdateStoreUser } from "../redux/user/update";
import { RemoveToken, RetrieveToken, StoreToken } from "./cookieHandler";
import { GeneralResponse } from "../models/generalResponse.model";
import {
	AccessTokenExpiration,
	ParseToken,
	RefreshTokenExpiration,
} from "./tokenHandler";
import { GetTeamUser } from "./userHandler";
import { User } from "../models/user.model";

var sessionActive = false;
var sessionAccessToken: string | null = null;
var hasLoadedSession = false;

// Launch session from cookies
type LoadSessionRequest = {
	dispatch: any;
};
const LoadSessionFromStore = async (
	req: LoadSessionRequest
): Promise<GeneralResponse | null> => {
	try {
		if (hasLoadedSession) {
			return null;
		}
		hasLoadedSession = true;

		const access = await RetrieveToken("access");
		const refresh = await RetrieveToken("refresh");

		if (access && refresh) {
			const token: any = await ParseToken(String(access));
			if (token && typeof token !== undefined) {
				let tokenExpiresIn = token.exp - Math.floor(Date.now() / 1000);
				if (tokenExpiresIn < 0) {
					// Need new AT
					return {
						status: 300,
						message: "Access token reissue not implemented",
						data: null,
						success: false,
					};
				} else {
					// Use existing AT
					sessionActive = true;
					sessionAccessToken = access;
					const user = await GetTeamUser({});
					if (user == null) {
						return {
							status: 400,
							message: "Failed to retrieve user",
							data: null,
							success: false,
						};
					}
					await UpdateStoreUser(user!, req.dispatch);
					return {
						status: 200,
						message: "Successfully launched session",
						data: user,
						success: true,
					};
				}
			} else {
				return {
					status: 400,
					message: "Failed to parse access token",
					data: null,
					success: false,
				};
			}
		} else {
			return {
				status: 401,
				message: "Failed to launch session, missing tokens",
				data: null,
				success: false,
			};
		}
	} catch (error: any) {
		hasLoadedSession = false;
		KillSession({
			dispatch: req.dispatch,
		});
		return {
			status: error.code,
			message: "Failed to launch session: " + error.message,
			data: error,
			success: false,
		};
	}
};

// Start Session
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
		// Kill session and roll back changes if it fails to initialize
		await KillSession({
			dispatch: req.dispatch,
		});
		return {
			status: error.code,
			message: "Failed to initialize session: " + error.message,
			data: error,
			success: false,
		};
	}
};

// End Session
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

// Check session state
const SessionInService = async (): Promise<boolean> => {
	const access = await RetrieveToken("access");
	const refresh = await RetrieveToken("refresh");
	if (access && refresh) {
		return sessionActive;
	} else {
		return false;
	}
};

// Get session access token
const GetSessionAccessToken = (): string | null => {
	return sessionAccessToken;
};

export {
	KillSession,
	InitializeSession,
	LoadSessionFromStore,
	SessionInService,
	GetSessionAccessToken,
};
