import Moralis from "moralis";
import { logError, logInfo } from "../config/logger";
import { CryptoToken, WalletPortfolio } from "../models/crypto.model";

/**
 * Méthode de validation de wallet
 * @param address Adresse du wallet
 * @returns boolean
 */
export const validateWallet = async (address: string): Promise<boolean> => {
  try {
    const response = await Moralis.EvmApi.wallets.getWalletActiveChains({
      address,
    });
    return response.raw.active_chains.length > 0;
  } catch (error) {
    logError("Erreur validation wallet Moralis", error, { address });
    throw new Error("Impossible de valider l'adresse wallet");
  }
};

export const getWalletComplete = async (address: string): Promise<any> => {
  try {
    const [tokens] = await Promise.all([
      Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({ address }),
      //Moralis.EvmApi.nft.getWalletNFTs({ address, limit: 10 }),
      //Moralis.EvmApi.wallets.getWalletNetWorth({ address }),
    ]);

    const tokensResult: CryptoToken[] = tokens.result.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      logo: token.logo || null,
      balance: token.balanceFormatted,
      price: token.usdPrice,
      value: token.usdValue,
      change24h: token.usdPrice24hrPercentChange,
    }));

    // Calcul du total des valeurs des tokens
    const totalTokensValue = tokensResult.reduce(
      (acc, token) => acc + token.value,
      0
    );
    logInfo("Total des valeurs des tokens: ", { totalTokensValue });
    logInfo("Tokens: ", { tokensResult });

    const resultObject: WalletPortfolio = {
      tokens: tokensResult,
      totalValue: totalTokensValue,
    };

    return resultObject;
  } catch (error) {
    logError("Erreur récupération portfolio Moralis", error, { address });
    throw new Error("Impossible de récupérer le portfolio");
  }
};
