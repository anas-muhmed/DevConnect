const express=require('express');
const router=express.Router();
const{followUser,unfollowUser}=require('../controllers/userController');
const authMiddleware=require('../middleware/authMiddleware');


// PUT /api/users/:id/follow
router.put('/:id/follow',authMiddleware,followUser);
//PUT /api/users/:id/unfollow
router.put('/:id/unfollow',authMiddleware,unfollowUser)

module.exports=router;