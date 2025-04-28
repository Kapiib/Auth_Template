const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// Apply rate limiters to auth endpoints
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);

module.exports = router;