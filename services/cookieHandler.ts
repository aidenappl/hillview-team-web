import { getCookie, setCookie, deleteCookie } from "cookies-next";

import { TokenTypes } from "./tokenHandler";
import { GeneralResponse } from "../models/generalResponse.model";

// Use strict cookie security only in production (HTTPS).
// In development (HTTP localhost), secure:true + sameSite:"none" prevents cookies from being set.
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
	// httpOnly is false because the frontend reads tokens from cookies to attach
	// to API requests via Authorization header. To enable httpOnly, the backend
	// would need to accept auth directly from cookies instead.
	httpOnly: false,
	secure: isProduction,
	sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
	path: "/",
};

// Storing token in cookies
const StoreToken = async (
	type: TokenTypes,
	token: string,
	maxAge: number
): Promise<GeneralResponse> => {
	try {
		setCookie(type, token, { ...cookieOptions, maxAge });
		return {
			status: 200,
			message: "Successfully stored token",
			data: null,
			success: true,
		};
	} catch (error: any) {
		return {
			status: error.code,
			message: "Failed to store token: " + error.message,
			data: error,
			success: false,
		};
	}
};

// Retrieving token from cookies
const RetrieveToken = (type: TokenTypes): string | null => {
	try {
		const token = getCookie(type);
		return (token as string) ?? null;
	} catch {
		return null;
	}
};

// Removing token from cookies
const RemoveToken = async (type: TokenTypes): Promise<GeneralResponse> => {
	try {
		deleteCookie(type, cookieOptions);
		return {
			status: 200,
			message: "Successfully removed token",
			data: null,
			success: true,
		};
	} catch (error: any) {
		return {
			status: error.code,
			message: "Failed to remove token: " + error.message,
			data: error,
			success: false,
		};
	}
};

export { StoreToken, RemoveToken, RetrieveToken };
