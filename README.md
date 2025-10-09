# 🔧 Wallet Scope Backend API (projet en cours)

> **API sécurisée** pour le tracking de portefeuilles blockchain - Backend Node.js/Express avec authentification JWT et base de données Prisma.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-black?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [🛠️ Technologies](#️-technologies)
- [🚀 Installation](#-installation)
- [🧪 Comptes de démo](#-comptes-de-démonstration)
- [🔒 Sécurité](#-sécurité)


## 🎯 À propos

L'API **Wallet Scope Backend** est une solution sécurisée (un minimum) pour gérer l'authentification des utilisateurs et le tracking de portefeuilles blockchain. Construite avec Express.js en TypeScript.

### 🏗️ Architecture

- **API** avec Express.js 5.1.0
- **Base de données** SQLite avec Prisma ORM
- **Authentification JWT** avec refresh tokens
- **Validation** des données avec Zod
- **Logging** Winston
- **Sécurité** Helmet, CORS, Rate Limiting...

## 🛠️ Technologies

### Core
- **Node.js** 18+
- **Express.js** 5.1.0
- **TypeScript** 5.x
- **Prisma ORM** 6.16.2

### Authentification & Sécurité
- **JWT** (jsonwebtoken 9.0.2)
- **bcrypt** 6.0.0 pour le hachage des mots de passe
- **Helmet** 8.1.0 pour les headers de sécurité
- **CORS** 2.8.5 pour la gestion des origines
- **express-rate-limit** 8.1.0 pour la limitation des requêtes

### Validation & Logging
- **Zod** 4.1.11 pour la validation des schémas
- **Winston** 3.17.0 pour le logging
- **winston-daily-rotate-file** 5.0.0 pour la rotation des logs

### Utilitaires
- **UUID** 13.0.0 pour les identifiants uniques
- **cookie-parser** 1.4.7 pour la gestion des cookies

## 🚀 Installation

### Prérequis
- Node.js 18 ou supérieur
- npm
- SQLite

Configuration du fichier `.env` :
```env
# Base de données
DATABASE_URL="file:./dev.db"

# JWT Secrets
JWT_SECRET="secret-jwt"
REFRESH_TOKEN_SECRET="secret-jwt"

# Environnement
NODE_ENV="development"
PORT=3005

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Gestion des sessions

Les sessions sont stockées en base avec :
- Informations sur l'appareil
- Adresse IP
- User Agent
- Date d'expiration

## 🧪 Comptes de démonstration

Pour tester l'API rapidement, vous pouvez utiliser ces comptes pré-configurés :

### Utilisateur 1 -
- **Email :** `bob@demo.com`
- **Mot de passe :** `demo12345`

## 🔒 Sécurité

### Mesures implémentées

- **Rate Limiting** : 100 requêtes par 15 minutes par IP
- **Helmet** : Headers de sécurité HTTP
- **CORS** : Origines autorisées configurables
- **Validation** : Schémas Zod stricts
- **Hachage** : bcrypt avec 12 rounds de salt
- **JWT** : Tokens signés avec secrets forts
- **Sessions** : Gestion des sessions

## 📁 Structure du projet

```
wallet-scope-back/
├── src/
│   ├── config/           # Configuration (logger, etc.)
│   ├── controllers/      # Logique métier des routes
│   ├── middlewares/      # Middlewares Express
│   ├── models/          # Modèles et types de données
│   ├── routes/          # Définition des routes
│   ├── schemas/         # Schémas de validation Zod
│   ├── services/        # Services (JWT, etc.)
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires et helpers
│   └── index.ts         # Point d'entrée de l'application
├── prisma/
│   ├── migrations/      # Migrations de base de données
│   └── schema.prisma    # Schéma Prisma
├── logs/               # Logs de l'application
├── dist/               # Code compilé
└── package.json
```

<div align="center">
  <p>🔧 API Backend développée avec Node.js, Express.js et TypeScript</p>
</div>
