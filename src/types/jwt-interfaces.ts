import jwt from "jsonwebtoken";

export interface AccessTokenPayload extends jwt.JwtPayload {
    userId: string;
    sessionId?: string;
    email?: string;
    username?: string;
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
    sessionId?: string;
}