import { Request } from "express";
import jwt from "jsonwebtoken";
import { UserFromTokenDto } from "../models/user.model";

// Surcharge de l'interface Request pour ajouter l'attribut auth
export interface AuthRequest extends Request {
  auth?: string | jwt.JwtPayload | UserFromTokenDto;
}
