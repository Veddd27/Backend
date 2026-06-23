import rateLimit from "express-rate-limit";

// Login limiter
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Upload limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        message: "Upload limit exceeded. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Comment limiter
export const commentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: "Too many comments. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});