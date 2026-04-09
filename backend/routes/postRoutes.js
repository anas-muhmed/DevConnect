const express = require('express');
const { createPost, getAllPost,DeletePost,updatePost,votePost} = require('../controllers/postController');
const { createNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const optimizeImage = require('../middleware/imageOptimization');
const upload = require('../middleware/uploadMiddleware');
const Post=require('../models/Post')

const router = express.Router();

// Protect the route with auth middleware + image optimization
router.post('/create', authMiddleware, upload.single('image'), optimizeImage, createPost);

router.delete("/:postId",authMiddleware,DeletePost)//handling delete function

router.put("/:postId",authMiddleware,updatePost)//handling edit function

// Comments CRUD
router.post('/:postId/comment', authMiddleware, async(req,res)=>{
    const{postId}=req.params;
    const{text}=req.body;
    const userId = req.userId;

    if(!text){
        return res.status(400).json({message:'Comment text is required'});
    }
    try{
        const user = await require('../models/Users').findById(userId);
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'})
        }
        const newComment={
            user: userId,
            username: user.username,
            text,
            createdAt: new Date(),
        };
        post.comments.push(newComment);
        const updatedPost = await post.save();
        
        // Create notification for post owner
        await createNotification({
            recipient: post.user,
            sender: userId,
            type: 'comment',
            message: `commented on your post: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            post: postId
        });
    
        res.status(201).json({
          message: 'Comment added successfully',
          comment: newComment,
          post: updatedPost
        });
    }catch(err){
        console.error('Error adding comment',err)
        res.status(500).json({message:'Server error occurred!'});
    }
});

// Edit comment
router.put('/:postId/comment/:commentId', authMiddleware, async(req,res)=>{
    const{postId, commentId}=req.params;
    const{text}=req.body;
    const userId = req.userId;

    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'})
        }
        
        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(404).json({message:'Comment not found'})
        }
        
        // Check ownership
        if(comment.user.toString() !== userId){
            return res.status(403).json({message:'Unauthorized to edit this comment'})
        }
        
        comment.text = text;
        await post.save();
    
        res.status(200).json({
          message: 'Comment updated successfully',
          comment
        });
    }catch(err){
        console.error('Error updating comment',err)
        res.status(500).json({message:'Server error occurred!'});
    }
});

// Delete comment
router.delete('/:postId/comment/:commentId', authMiddleware, async(req,res)=>{
    const{postId, commentId}=req.params;
    const userId = req.userId;

    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'})
        }
        
        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(404).json({message:'Comment not found'})
        }
        
        // Check ownership
        if(comment.user.toString() !== userId){
            return res.status(403).json({message:'Unauthorized to delete this comment'})
        }
        
        comment.deleteOne();
        await post.save();
    
        res.status(200).json({
          message: 'Comment deleted successfully'
        });
    }catch(err){
        console.error('Error deleting comment',err)
        res.status(500).json({message:'Server error occurred!'});
    }
});

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
 //upvote/downvote
  router.post('/:postId/vote',authMiddleware,votePost)

module.exports = router;


                    

