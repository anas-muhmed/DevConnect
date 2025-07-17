const Post=require('../models/Post')
const Users=require('../models/Users')


//for creating post
  const createPost=async (req,res)=>{
    console.log(req.body); // Check if the title and username are correctly passed
    console.log(req.file); // Check if the file is being received by multer
    try{
        const {title,content,profilePic}=req.body;
        const image = req.file ? `/uploads/${req.file.filename.replace(/\\/g, '/')}` : null;


        if(!title||!content||!image){
            return res.status(400).json({message:'title,content, images are required'})
        }

        const user = await Users.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

        const newPost=new Post({
            user: req.userId, // we'll extract this from middleware (JWT)
            title,
            content,
            image:'/uploads/' + req.file.filename,
            profilePic,
            username:user.username,
        });

        const savedPost=await newPost.save();

        res.status(201).json(savedPost);
    }catch(error){
        console.error('Error creating post:', error.message, error.stack);  
        res.status(500).json({ message: 'Something went wrong creating post' });
    }
    
}
//for deleting post

const DeletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        console.log("[DEBUG] Delete Request - Auth Info:", {
            userIdFromAuth: req.userId,  // From your auth middleware
            userObject: req.user         // Might be undefined
        });

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // FIX: Use req.userId instead of req.user.id
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ 
                message: "Unauthorized to delete this post",
                details: {
                    postOwner: post.user.toString(),
                    requestingUser: req.userId
                }
            });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};



//for fetching all posts 
const getAllPost = async(req,res) => {
    try {
      const posts = await Post.find()
        .populate('user', 'username profilePic _id') 
        .sort({createdAt:-1})
        .lean(); // Convert to plain JS objects
      
     
      const enhancedPosts = posts.map(post => ({
        ...post,
        userId: post.user?._id || null // Add userId while keeping user object
      }));
  
      res.status(200).json(enhancedPosts);
    } catch(error) {
      console.error(error.message);
      res.status(500).json({message:'server error while fetching'});
    }
  }

  //upvote and downvote
       const votePost=async(req,res)=>{
        

        const{postId}=req.params;
        const{action}=req.body; //'upvote' or 'downvote'
        const userId=req.userId;

        try{
            const post=await Post.findById(postId);
            


            if(!post) return res.status(404).json({message:'Post not Found'});

             // 🛡️ Defensive checks
  if (!post.upvotes) post.upvotes = [];
  if (!post.downvotes) post.downvotes = [];

            //remove user from both arrays first
            post.upvotes.pull(userId);
            post.downvotes.pull(userId);

            if(action==='upvote'){
                post.upvotes.push(userId);
            }else if(action==='downvote'){
                post.downvotes.push(userId);
            }
            await post.save();
            res.status(200).json({upvotes:post.upvotes.length,downvotes:post.downvotes.length})
        }catch(err){
            console.error('vote error:',err)
            res.status(500).json({message:'Server error'})
        }
       }
module.exports={createPost,getAllPost,DeletePost,votePost};