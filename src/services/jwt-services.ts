import jwt, { SignOptions } from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt-interfaces";



export const generateAccessToken = (payload: AccessTokenPayload): string => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || "15m";

    if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET n\'est pas défini dans les variables d\'environnement');
    }
    
    return jwt.sign(payload, secret, { 
        expiresIn
    } as SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET n\'est pas défini dans les variables d\'environnement');
    }
    return jwt.sign(payload, secret, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" 
    } as SignOptions);
};

export const verifyToken = (token: string, isRefreshToken = false): jwt.JwtPayload | string => {
    try {
        const secret = isRefreshToken ? 
            process.env.REFRESH_TOKEN_SECRET! : 
            process.env.ACCESS_TOKEN_SECRET!;
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
