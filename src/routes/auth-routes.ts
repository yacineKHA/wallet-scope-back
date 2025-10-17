import express from "express";
import { login, signup, refreshAccessToken, logout } from "../controllers/user-controller";


const router = express.Router();


router.post("/register" ,signup);

router.post("/login" ,login);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logout);

export default router;