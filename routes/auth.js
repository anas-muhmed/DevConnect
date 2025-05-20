const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

//refresh token 
router.get('/refresh', authController.refreshToken);

//logout
router.post('/logout',authController.logout)



module.exports = router;
