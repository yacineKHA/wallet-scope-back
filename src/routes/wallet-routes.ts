import express from "express";
import { requireAuth } from "../middlewares/authCheck";
import { addWallet, deleteWallet, getWallet, getWallets, setPrimaryWallet } from "../controllers/wallet-controller";

const router = express.Router();

router.get("/", requireAuth, getWallets);

router.post("/", requireAuth, addWallet);

router.post("/details", requireAuth, getWallet);

router.delete("/:id", requireAuth, deleteWallet);

router.patch("/:id/primary", requireAuth, setPrimaryWallet);

export default router;