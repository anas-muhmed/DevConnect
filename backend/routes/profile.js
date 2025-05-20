const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 


const {
  getMyProfile,
  createOrUpdateProfile,
  UsersProfile,
  uploadProfilePicture
} = require('../controllers/ProfileController.js');

const router = express.Router();

// ✅ GET my profile
router.get('/me', authMiddleware, getMyProfile);

// ✅ Create or update profile
router.post('/', authMiddleware, createOrUpdateProfile);

router.get('/:username',UsersProfile);

// PUT upload profile picture
router.put('/upload/profile-picture', authMiddleware, upload.single('profilePicture'), uploadProfilePicture)

module.exports = router;
