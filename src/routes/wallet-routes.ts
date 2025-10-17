import express from "express";
import { requireAuth } from "../middlewares/authCheck";
import { addWallet, deleteWallet, getWallet, getWallets } from "../controllers/wallet-controller";

const router = express.Router();

router.get("/", requireAuth, getWallets);

router.post("/", requireAuth, addWallet);

router.post("/details", requireAuth, getWallet);

router.delete("/:id", requireAuth, deleteWallet);

export default router;