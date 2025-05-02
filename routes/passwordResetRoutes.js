const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const { resetRequestLimiter } = require('../middleware/rateLimiter');

// Request password reset
router.get('/request', passwordResetController.showRequestForm);
router.post('/request', resetRequestLimiter, passwordResetController.requestReset);

// Reset password with token
router.get('/:token', passwordResetController.showResetForm);
router.post('/:token', passwordResetController.resetPassword);

module.exports = router;