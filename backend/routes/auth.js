const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const{validateRegistration,handleValidationErrors}=require('../middleware/inputValidation');
const rateLimit=require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again in 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // max 10 accounts per IP per hour
    message: 'Too many accounts created, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Register route
router.post('/register', registerLimiter, validateRegistration, handleValidationErrors, authController.register);

// Login route
router.post('/login', authLimiter, authController.login);

//refresh token 
router.get('/refresh', authController.refreshToken);

//logout
router.post('/logout',authController.logout)



module.exports = router;
