import express from "express";
import { login, signup, refreshAccessToken, logout, getMe } from "../controllers/user-controller";
import { requireAuth } from "../middlewares/authCheck";

const router = express.Router();


router.post("/signup" ,signup);

router.post("/login" ,login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", requireAuth, logout);

router.get("/me", requireAuth, getMe);

export default router;