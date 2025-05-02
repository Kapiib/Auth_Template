const rateLimit = require('express-rate-limit');

// Basic rate limiters for auth endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per windowMs
    message: 'Too many registration attempts from this IP, please try again after an hour'
});

const resetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per windowMs
    message: 'Too many password reset attempts from this IP, please try again after an hour'
});

module.exports = {
    loginLimiter,
    registerLimiter,
    resetRequestLimiter
};