import express, { Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user-routes";
import { corsOptions, rateLimitConfig } from "./middlewares/security";
import walletRoutes from "./routes/wallet-routes";
import authRoutes from "./routes/auth-routes";
import Moralis from "moralis";

const app = express();

const PORT: number = 3005;

//Middleware
app.use(helmet());
app.use(rateLimitConfig);
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

const startMoralis = async (): Promise<void> => {
  try {
    console.log("Démarrage de Moralis...");
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });

    console.log("Moralis démarré avec succès...");

    app.listen(PORT, () => {
      console.log(`Le serveur a démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors de la connexion: ", error);
    process.exit(1);
  }
};

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);

startMoralis();
