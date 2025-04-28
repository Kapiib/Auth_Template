const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// Auth routes
router.get("/register", (req, res) => {
    res.render('register', { title: 'Register' });
});

router.get("/login", (req, res) => {
    res.render('login', { title: 'Login' });
});

// Apply rate limiters to auth endpoints
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.get("/logout", authController.logout);

module.exports = router;