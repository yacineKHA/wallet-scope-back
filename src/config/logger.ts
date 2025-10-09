import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"; // Va créer automatiquement des fichiers de logs journaliers
import path from "path";

// Permet de créer le dossier logs sil n'existe pas
const logDir = path.join(process.cwd(), "logs");

// Configu des formats de logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration pour les logs d'erreurs (rotation quotidienne)
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m", // Taille max par fichier
  maxFiles: "14d", // Durée de conservation (ici 14 jours)
  format: logFormat,
});

// Configuration pour tous les logs (rotation quotidienne)
const combinedTransport = new DailyRotateFile({
  filename: path.join(logDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d", // Durée de conservation (30 jours)
  format: logFormat,
});

// Configuration pour la console, si en dev, pour afficher les logs
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
});

// Création du logger principal
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    errorTransport,
    combinedTransport,
    ...(process.env.NODE_ENV !== "production" ? [consoleTransport] : []),
  ],
  // Gestion des exceptions non capturées
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
  // Gestion des rejections de promesses non capturées
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

export default logger;

// Helpers pour utiliser les logs
export const logError = (message: string, error?: any, meta?: object) => {
  logger.error(message, { error: error?.stack || error, ...meta });
};

export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};
