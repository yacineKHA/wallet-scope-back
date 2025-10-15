import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response-helpers";
import Moralis from "moralis";
import { logError, logInfo } from "../config/logger";
import { PrismaClient } from "../generated/prisma";
import { AuthRequest } from "../types/auth-request";
import { Wallet } from "../models/wallet.model";
import { UserFromTokenDto } from "../models/user.model";
import { getWalletComplete } from "../services/moralis-services";
import { WalletPortfolio } from "../models/crypto.model";
const prisma = new PrismaClient();

/**
 * Méthode d'ajout d'un portefeuille
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON
 */
export const addWallet = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { walletAddress, walletName } = req.body;
  const { userId } = req.auth as UserFromTokenDto;
  //const validationResult = addWalletSchema.safeParse(req.body);

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return sendError(res, "Format d'adresse invalide", [], 400);
  }

  logInfo("Tentative d'ajout du portefeuille: ", { walletAddress });
  try {
    //Verifier que le wallet existe bien
    const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
      address: walletAddress,
    });
    logInfo("wallet active chains: ", { response });
    await prisma.wallet.create({
      data: {
        userId: userId,
        walletAddress: walletAddress,
        walletName: walletName,
      },
    });

    logInfo("Wallet ajouté avec succès: ", { walletAddress });
    return sendSuccess(res, [], "Wallet ajouté avec succès", 201);
  } catch (error) {
    logError("Erreur lors de l'ajout du portefeuille: ", error);
    return sendError(res, "Erreur lors de l'ajout du portefeuille", [], 500);
  }
};

/**
 * Méthode de récupération de tous les portefeuilles d'un utilisateur
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON
 */
export const getWallets = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { userId } = req.auth as UserFromTokenDto;

  if (!userId) {
    return sendError(res, "User ID is required ", [], 400);
  }

  try {
    const wallets: Wallet[] | null = await prisma.wallet.findMany({
      where: {
        userId: userId,
      },
    });

    logInfo("Wallets récupérées: ", { wallets });

    if (!wallets || wallets.length === 0) {
      return sendError(res, "Aucun wallet trouvé", [], 404);
    }

    logInfo("Wallets récupérées avec succès: ", { wallets });
    return sendSuccess(res, { wallets }, "Wallets récupérés avec succès", 200);
  } catch (error) {
    logError("Erreur lors de la récupération des portefeuilles: ", error, {
      userId: userId,
    });
    return sendError(
      res,
      "Erreur lors de la récupération des portefeuilles",
      [],
      500
    );
  }
};


/**
 * Méthode de recup d'un portefeuille avec tous ses tokens, nfts...
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON
 */
export const getWallet = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { walletAddress } = req.body;
  const { userId } = req.auth as UserFromTokenDto;

  if (!walletAddress) {
    return sendError(res, "L'adresse du wallet est requise", [], 400);
  }
  try {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userId,
        walletAddress: walletAddress,
      },
    });

    if (!wallet) {
      logError("Wallet non trouvé: ", { walletAddress });
      return sendError(res, "Wallet non trouvé", [], 404);
    }

    const result: WalletPortfolio = await getWalletComplete(walletAddress);
    logInfo("Wallet complet récupéré: ", result);

    return sendSuccess(res, { wallet, result }, "Wallet trouvé", 200);
  } catch (error) {
    logError("Erreur lors de la récupération du wallet: ", error, {
      walletAddress: walletAddress,
      userId: userId,
    });
    return sendError(res, "Erreur lors de la récupération du wallet", [], 500);
  }
};

/**
 * Méthode de suppression d'un portefeuille
 * @param req Request - Objet Express
 * @param res Response - Objet Express
 * @returns Réponse JSON
 */
export const deleteWallet = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { walletId } = req.body;
  const { userId } = req.auth as UserFromTokenDto;

  if (!walletId) {
    return sendError(res, "Wallet ID est requis", [], 400);
  }

  try {
    await prisma.wallet.delete({
      where: { id: walletId, userId: userId },
    });

    logInfo("Wallet supprimé avec succès: ", { walletId });
    return sendSuccess(res, [], "Wallet supprimé avec succès", 200);
  } catch (error) {
    logError("Erreur lors de la suppression du portefeuille: ", error, {
      walletId: walletId,
    });
    return sendError(
      res,
      "Erreur lors de la suppression du portefeuille",
      [],
      500
    );
  }
};
