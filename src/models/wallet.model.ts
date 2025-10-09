export interface Wallet {
    id: string;
    userId: string;
    walletAddress: string;
    walletName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWalletDto {
    userId: string;
    walletAddress: string;
    walletName: string;
}
