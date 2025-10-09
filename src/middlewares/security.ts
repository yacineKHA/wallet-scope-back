import rateLimit from 'express-rate-limit';

export const rateLimitConfig = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 150, // 200 req/IP
    message: {
        success: false,
        message: 'Trop de requêtes, réessayez plus tard'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 5, // Max 5 tentatives par IP
    skipSuccessfulRequests: true
});

export const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['domaineprod'] 
        : ['http://localhost:3000', 'http://localhost:5173'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With'
    ],
    optionsSuccessStatus: 200 // Pour vieux navigateurs
};
