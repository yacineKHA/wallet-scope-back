import express from "express";
import { login, signup, refreshAccessToken, logout, getMe } from "../controllers/user-controller";
import { requireAuth } from "../middlewares/authCheck";

const router = express.Router();

router.get("/me", requireAuth, getMe);

export default router;