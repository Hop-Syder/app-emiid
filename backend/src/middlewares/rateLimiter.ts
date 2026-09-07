import rateLimit from 'express-rate-limit';

// Rate limiter pour la vérification PIN - 5 tentatives/15min
export const pinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de vérification PIN' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour la vérification téléphone - 3 demandes/heure
export const phoneVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Trop de demandes de vérification téléphone' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour la validation d'OTP téléphone - 5 tentatives/15min (brute force OTP)
export const phoneVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de vérification OTP' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour l'authentification - 10 tentatives/15min
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives d\'authentification' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour la demande de réinitialisation du PIN - 3 demandes/heure
export const pinResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Trop de demandes de réinitialisation du PIN' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour la validation de l'OTP de réinitialisation du PIN - 5 tentatives/15min (brute force OTP)
export const pinResetVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de réinitialisation du PIN' },
    standardHeaders: true,
    legacyHeaders: false,
});
