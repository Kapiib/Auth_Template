const rateLimit = require('express-rate-limit');

// Login rate limiter - 5 attempts per minute
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).render('login', {
            title: 'Login',
            error: 'Too many login attempts. Please try again in a minute.'
        });
    }
});

// Register rate limiter - 3 attempts per minute
const registerLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).render('register', {
            title: 'Register',
            error: 'Too many registration attempts. Please try again in a minute.'
        });
    }
});

module.exports = {
    loginLimiter,
    registerLimiter
};