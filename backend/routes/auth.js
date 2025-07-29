const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const{validateRegistration,handleValidationErrors}=require('../middleware/inputValidation');
const rateLimit=require('express-rate-limit');

const authLimiter=rateLimit({
    windowMs:15*60*1000, //15 minutes
    max:5, //5 attempts per 15 minutes per IP
   message:'Too many login attempts, please try again in 15 minutes',
   standardHeaders:true,
   legacyHeaders:false,
});

// Register route
router.post('/register',validateRegistration,handleValidationErrors, authController.register);

// Login route
router.post('/login',authLimiter, authController.login);

//refresh token 
router.get('/refresh', authController.refreshToken);

//logout
router.post('/logout',authController.logout)



module.exports = router;
