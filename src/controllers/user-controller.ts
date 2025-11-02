import { PrismaClient } from "@prisma/client";
import { CreateUserDto, User, UserFromTokenDto } from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  createUserSchema,
  LoginUserSchema,
  loginUserSchema,
} from "../schemas/user-schemas";
import jwt from "jsonwebtoken";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "../utils/response-helpers";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwt-services";
import { v4 as uuidv4 } from "uuid";
import { logError, logInfo, logWarn } from "../config/logger";
import { AuthRequest } from "../types/auth-request";
import { clearTokens } from "../utils/tokens";
const prisma = new PrismaClient();

/**
 * Méthode de connexion d'un utilisateur via email et mot de passe
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON contenant le message de succès ou d'échec de la connexion de l'utilisateur et les données de l'utilisateur si la connexion est réussie
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    logInfo("Tentative de connexion: ", { email: req.body?.email });
    const validationResult = loginUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      logWarn("Échec de validation lors de la connexion: ", {
        errors: validationResult.error.issues,
      });
      return sendValidationError(res, validationResult.error);
    }
    const userData: LoginUserSchema = validationResult.data;
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      logWarn("Tentative de connexion avec email inexistant: ", {
        email: userData.email,
      });
      return sendError(
        res,
        "L'email ou le mot de passe est incorrect",
        [],
        401
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      userData.password,
      user.password
    );

    if (!isPasswordMatch) {
      logWarn("Tentative de connexion avec mot de passe incorrect: ", {
        email: userData.email,
      });
      return sendError(
        res,
        "L'email ou le mot de passe est incorrect",
        [],
        401
      );
    }

    const sessionId = uuidv4(); // Génération d'un sessionId unique

    const accessToken: string = generateAccessToken({
      userId: user.id,
      username: user.username || "",
      email: user.email,
    });

    const refreshToken: string = generateRefreshToken({
      userId: user.id.toString(),
      sessionId: sessionId,
    });

    // Hash du refreshToken
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    // ajout du refreshToken hashé dans la db
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        sessionId: sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo:
          `${req.headers["sec-ch-ua-platform"]} - ${req.headers["sec-ch-ua"]}` ||
          "Unknown",
        ipAddress: req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
      },
    });

    res.cookie("r_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.cookie("a_token", accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 15 minutes
    });

    const { password, ...userDataToSend } = user; // Suppression du mot de passe de la réponse

    logInfo("Connexion réussie: ", { userId: user.id, email: user.email });
    return sendSuccess(
      res,
      {
        user: userDataToSend,
      },
      "Connexion réussie",
      200
    );
  } catch (error) {
    logError("Erreur lors de la connexion: ", error);
    return sendError(res, "Erreur interne du serveur", [], 500);
  }
};

/**
 * Méthode de création d'un utilisateur
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON contenant le succès ou l'échec de la création de l'utilisateur
 */
export const signup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    logInfo("Tentative de création de compte", {
      email: req.body?.email,
      username: req.body?.username,
    });
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      logWarn("Échec de validation lors de l'inscription", {
        errors: validationResult.error.issues,
      });
      return sendValidationError(res, validationResult.error);
    }
    const userData: CreateUserDto = validationResult.data;

    const userExists =
      (await prisma.user.findFirst({
        where: {
          OR: [{ email: userData.email }, { username: userData.username }],
        },
      })) !== null;

    if (!userExists) {
      const hashedPassword: string = await bcrypt.hash(userData.password, 12);
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
        },
      });

      const { password, ...userDataToSend } = newUser; // Suppression du mot de passe de la réponse

      logInfo("Utilisateur créé avec succès: ", { user: userDataToSend });
      return sendSuccess(
        res,
        userDataToSend,
        "Utilisateur créé avec succès",
        201
      );
    } else {
      logWarn(
        "Tentative de création de compte avec email/username existant: ",
        { email: userData.email, username: userData.username }
      );
      return sendError(res, "L'utilisateur existe déjà", [], 409);
    }
  } catch (error) {
    logError("Erreur lors de la création de l'utilisateur: ", error, {
      email: req.body?.email,
    });
    return sendError(res, "Erreur interne du serveur", [], 500);
  }
};

/**
 * Méthode de déconnexion de l'utilisateur
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON contenant le succès ou l'échec de la requete
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
  // Supprimer cookies
  res.clearCookie("r_token");
  res.clearCookie("a_token");

  try {
    const refreshToken = req.cookies?.["r_token"];
    if (!refreshToken) {
      return sendSuccess(res, null, "Déconnexion réussie", 200);
    }

    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    if (!decodedToken.userId || !decodedToken.sessionId) {
      return sendSuccess(res, null, "Déconnexion réussie", 200);
    }

    await prisma.session.deleteMany({
      where: {
        userId: decodedToken.userId,
        sessionId: decodedToken.sessionId,
      },
    });

    logInfo("Session supprimée", { sessionId: decodedToken.sessionId });
    return sendSuccess(res, null, "Déconnexion réussie", 200);

  } catch (error) {
    logError("Erreur logout", error);
    return sendSuccess(res, null, "Déconnexion réussie", 200);
  }
};

/**
 * Méthode de refresh du token d'accès
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON contenant le succès ou l'échec de la requete
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies?.["r_token"];
  logInfo("Tentative de refresh du token d'accès");

  if (!refreshToken) {
    logWarn("Aucun refresh token trouvé");
    clearTokens(res);
    return sendError(res, "Aucun refresh token trouvé", [], 401);
  }
  try {
    // Vérifie et décode le refresh token
    const decodedToken: jwt.JwtPayload | string = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    if (typeof decodedToken === "string" || !decodedToken.userId) {
      logWarn("Token invalide - structure incorrecte");
      clearTokens(res);
      return sendError(res, "Token invalide", [], 401);
    }

    // Récupérer l'utilisateur et sa session active pour vérifier si le refresh token est bien valide en bdd aussi
    const userSession = await prisma.session.findUnique({
      where: {
        userId: decodedToken.userId,
        sessionId: decodedToken.sessionId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    if (!userSession) {
      logWarn("Session non trouvée", { userId: decodedToken.userId });
      clearTokens(res);
      return sendError(res, "Session non trouvée", [], 401);
    }

    // Compare le refresh token bdd avec le refresh token de la session pour vérifier si ils sont bien identique
    const isRefreshTokenValid: boolean = await bcrypt.compare(
      refreshToken,
      userSession.refreshToken
    );
    if (!isRefreshTokenValid) {
      // Supprimer la session si le refresh token est invalide en cas de vol de token
      await prisma.session.delete({ where: { id: userSession.id } });
      logWarn("Refresh token invalide", { userId: decodedToken.userId });
      clearTokens(res);
      return sendError(res, "Refresh token invalide", [], 401);
    }

    const newSessionId = uuidv4();
    const newAccessToken = generateAccessToken({
      userId: userSession.userId,
      email: userSession.user.email,
      username: userSession.user.username || "",
    });
    const newRefreshToken = generateRefreshToken({
      userId: userSession.userId,
      sessionId: newSessionId,
    });
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

    await prisma.session.update({
      where: { id: userSession.id },
      data: {
        refreshToken: newRefreshTokenHash,
        sessionId: newSessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });
    res.cookie("r_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
    res.cookie("a_token", newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const { password, ...userDataToSend } = userSession.user; // Suppression du mot de passe de user
    logInfo("Refresh du token d'accès réussie: ", { userId: userSession.id });
    return sendSuccess(
      res,
      {
        user: userDataToSend,
      },
      "Refresh du token d'accès réussie",
      200
    );
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logWarn("Token JWT invalide", { error: error.message });
      return sendError(res, "Token invalide", [], 401);
    }
    logError("Erreur lors du refresh du token d'accès: ", error);
    return sendError(res, "Erreur interne du serveur", [], 500);
  }
};

/**
 * Méthode de récupération de l'utilisateur connecté
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON contenant l'utilisateur connecté
 */
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { userId } = req.auth as UserFromTokenDto;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return sendError(res, "Utilisateur non trouvé", [], 404);
    }
    const { password, createdAt, updatedAt, ...userDataToSend } = user;
    return sendSuccess(res, userDataToSend, "Utilisateur trouvé", 200);
  } catch (error) {
    logError("Erreur lors de la récupération de l'utilisateur: ", error, {
      userId: userId,
    });
    return sendError(res, "Erreur interne du serveur", [], 500);
  }
};
