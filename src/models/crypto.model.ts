export interface CryptoToken {
  symbol: string;
  name: string;
  logo: string | null;
  balance: string;
  price: number;
  value: number;
  change24h: number;
}

export interface WalletPortfolio {
  tokens: CryptoToken[];
  totalValue: number;
}
