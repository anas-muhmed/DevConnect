const User=require('../models/Users');



const followUser=async(req,res)=>{
    try{
        const userToFollowId=req.params.id; //ID of the user you want to follow
        const currentUserId=req.user._id;  //ID of the logged in user

        if (userToFollowId===currentUSerId.toString()){
            return res.status(400).json({message:'you cant follow yourself'});
        }

        const userToFollow= await User.findById(userToFollowId);
        const currentUser=await  User.findById(currentUserId)  
    
    if (!userToFollow|| !currentUser){
        return res.status(404).json({message:"User not found "});
    }
    
    //already following checks
    if(userToFollow.followers.includes(currentUserId)){
        return res.status(400).json({message:'you already follow this user'});
    }

    //add to followers and following
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userToFollowId);

    await userToFollow.save();
    await currentUser.save();

    res.status(200).json({message:`you followed ${userToFollow.username}`});
 }catch(error){
    console.error('Follow Error:',error);
    res.status(500).json({message:'Server error while following'})
 }
}

module.exports={
    followUser,
}