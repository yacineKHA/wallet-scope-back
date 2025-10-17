-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Wallet" ("createdAt", "id", "updatedAt", "userId", "walletAddress", "walletName") SELECT "createdAt", "id", "updatedAt", "userId", "walletAddress", "walletName" FROM "Wallet";
DROP TABLE "Wallet";
ALTER TABLE "new_Wallet" RENAME TO "Wallet";
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");
CREATE INDEX "Wallet_walletAddress_idx" ON "Wallet"("walletAddress");
CREATE UNIQUE INDEX "Wallet_userId_walletAddress_key" ON "Wallet"("userId", "walletAddress");
CREATE UNIQUE INDEX "Wallet_walletAddress_walletName_key" ON "Wallet"("walletAddress", "walletName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
