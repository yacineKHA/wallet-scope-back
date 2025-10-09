import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt-services";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response-helpers";
import { logError, logInfo } from "../config/logger";
import { AuthRequest } from "../types/auth-request";

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    logInfo("Auth check start", { path: req.path, ip: req.ip });

    const authHeader = req.headers.authorization;
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = bearer ?? req.cookies?.["a_token"];
    if (!token) {
      logError("Auth check failed", { path: req.path, ip: req.ip });
      return sendError(res, "Unauthorized", [], 401);
    }

    const decoded: string | jwt.JwtPayload = verifyToken(token, false);
    const payload = typeof decoded === "string" ? {} : decoded;
    req.auth = decoded;
    console.log("decoded: ", decoded);
    console.log("req.auth: ", req.auth);
    logInfo("Auth check success", { path: req.path, ip: req.ip, payload });
    next();
  } catch {
    logError("Auth check failed", { path: req.path, ip: req.ip });
    return sendError(res, "Invalid or expired token", [], 401);
  }
}
