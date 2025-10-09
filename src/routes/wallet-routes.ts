import express from "express";
import { requireAuth } from "../middlewares/authCheck";
import { addWallet, deleteWallet, getWallets } from "../controllers/wallet-controller";

const router = express.Router();


router.post("/add-wallet", requireAuth, addWallet);

router.get("/get-wallets", requireAuth, getWallets);

router.delete("/delete-wallet", requireAuth, deleteWallet);

export default router;