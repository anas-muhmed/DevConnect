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

const unfollowUser=async(req,res)=>{
    try{
        const userIdToUnfollow=req.params.id;
        const currentUserId=req.user.id;

        //prevent unfollowing yourself
        if(userIdToUnfollow===currentUserId.toString()){
            return res.status(400).json({message:'You cant unfollow yourself'});
        }

        const userToUnFollow=await User.findById(userIdToUnfollow);
        const currentUser=await User.findById(currentUserId);

        //check if these users exist
        if(!userToUnFollow||!currentUser){
            return res.status(404).json({message:'user not found'});
        }

        //check if not following already
        if(!currentUser.following.includes(userIdToUnfollow)){
            return res.status(400).json({message:'you are not following this user'})
        }

        //remove from the following and followers
        currentUser.following=currentUser.following.filter(
            (id)=>id.toString()!==userIdToUnfollow
        );

        userToUnFollow.followers=userToUnFollow.followers.filter(
            (id)=>id.toString()!==currentUserId.toString()
        );

        await currentUser.save();
        await userToUnFollow.save();

        res.status(200).json({message:'User unfollowed successfully'});
}catch(error){
    console.error("Error in unfollowUser:", error.message);
    res.status(500).json({ message: "Server error while trying to unfollow user" });

}
}

module.exports={
    followUser,
    unfollowUser
}