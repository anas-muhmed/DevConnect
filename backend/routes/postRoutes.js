const express = require('express');
const { createPost, getAllPost,DeletePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Use the multer configuration from postController
const Post=require('../models/Post')

const router = express.Router();

// Protect the route with auth middleware
router.post('/create', authMiddleware, upload.single('image'), createPost);

router.delete("/:postId",authMiddleware,DeletePost)//handling delete function

router.post('/:postId/comment',async(req,res)=>{
    const{postId}=req.params;
    const{username,text}=req.body;

    if(!username||!text){
        return res.status(400).json({messsage:'username and text are required'});
    }
    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'post not found'})
        }
        const newComment={
            username,
            text,
            createdAt: new Date(),
        
        };
        console.log("newComment:", newComment);
        post.comments.push(newComment)
        const updatedPost = await post.save();
    
        res.status(201).json({
          message: 'Comment added successfully',
          post: updatedPost
        });
    }catch(err){
        console.error('error adding comment',err)
        res.status(500).json({message:'server error occured!'});
    }
})

router.get('/all', getAllPost);

  router.get('/:id', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;


                    

