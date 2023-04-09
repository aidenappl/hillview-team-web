import jwt, { JwtPayload } from 'jwt-decode';

// Global Token Types
export type TokenTypes = 'access' | 'refresh';

export var RefreshTokenExpiration = 60 * 60 * 24 * 90; // 90 days
export var AccessTokenExpiration = 60 * 60 * 24 * 1; // 1 days

const ParseToken = async (token: string): Promise<JwtPayload | null> => {
	try {
		const parsedToken = jwt(token);
		return parsedToken as JwtPayload;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export { ParseToken };
