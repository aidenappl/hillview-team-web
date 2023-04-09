import {
  getCookie,
  setCookie,
  removeCookies,
  CookieValueTypes,
} from "cookies-next";

import { TokenTypes } from "./tokenHandler";
import { GeneralResponse } from "../models/generalResponse.model";

// Storing token in cookies
const StoreToken = async (
  type: TokenTypes,
  token: string,
  maxAge: number
): Promise<GeneralResponse> => {
  try {
    await setCookie(type, token, { maxAge, secure: true, sameSite: "none" });
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
const RetrieveToken = async (type: TokenTypes): Promise<string | null> => {
  try {
    const token = await getCookie(type, { secure: true, sameSite: "none" });
    return token as string | null;
  } catch (error: any) {
    return null;
  }
};

// Removing token from cookies
const RemoveToken = async (type: TokenTypes): Promise<GeneralResponse> => {
  try {
    await removeCookies(type, { secure: true, sameSite: "none" });
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
