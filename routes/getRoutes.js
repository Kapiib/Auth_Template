const express = require("express");
const router = express.Router();
const { checkAuth } = require('../middleware/checkAuth');
const authController = require("../controllers/authController");

// Home route
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Profile route (protected)
router.get('/profile', checkAuth, (req, res) => {
    res.render('profile', { 
        title: 'Profile',
        user: req.user
    });
});

// Auth page routes
router.get("/auth/register", (req, res) => {
    res.render('register', { title: 'Register' });
});

router.get("/auth/login", (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get("/auth/logout", authController.logout);

module.exports = router;