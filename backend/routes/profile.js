const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optimizeImage = require('../middleware/imageOptimization');
const upload = require('../middleware/uploadMiddleware');


const {
  getMyProfile,
  createOrUpdateProfile,
  UsersProfile,
  uploadProfilePicture
} = require('../controllers/ProfileController.js');

const router = express.Router();

console.log("🔧 Profile router being set up");

// ✅ GET my profile
router.get('/me', authMiddleware, getMyProfile);
console.log("✅ Registered route: GET /me");

// ✅ Create or update profile
router.post('/', authMiddleware, createOrUpdateProfile);

router.get('/:username',UsersProfile);

// PUT upload profile picture (with image optimization)
router.put('/upload/profile-picture', authMiddleware, upload.single('profilePicture'), optimizeImage, uploadProfilePicture)

module.exports = router;
