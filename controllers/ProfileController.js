const Profile=require('../models/Profile');
const User=require('../models/Users')

//to fetch users profile
const getMyProfile=async(req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.userId}).populate('user', 'username profilePicture');
        if(!profile){
            res.status(404).json({message:'profile not found'})
        }

         // Combine profile data with user's profile picture {now changed}
        const response = {
            ...profile._doc,
            avatar: profile.user.profilePicture || null
        };

        res.status(200).json(response)
    }
    catch(error){
        console.error('error',error)
        res.status(500).json({message:'server error while fetching profile'})
    }
}

//create and updating profile
const createOrUpdateProfile=async(req,res)=>{
    const { bio, skills, github, linkedin, website, location } = req.body;

     // Handle skills input - accepts both string and array
    let processedSkills = [];
    if (typeof skills === 'string') {
        processedSkills = skills.split(',').map(s => s.trim()).filter(s => s);
    } else if (Array.isArray(skills)) {
        processedSkills = skills.map(skill => typeof skill === 'string' ? skill.trim() : skill).filter(s => s);
    }

    const profileData = {
        user: req.userId,
        bio,
        skills: processedSkills,
        github,
        linkedin,
        website,
        location
    };
    try{

        let profile = await Profile.findOne({ user: req.userId });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
              { user: req.userId },
              { $set: profileData },
              { new: true }
            );
            return res.json(profile);
          }

        profile=new Profile(profileData)
        await profile.save();
         res.status(201).json(profile)
}catch (error) {
    console.error('Error saving profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

//for viewing users profile
const UsersProfile=async(req,res)=>{
    try{
        const {username}=req.params;

        const user=await User.findOne({username}).select('-password');//??

        if(!user){
            return res.status(404).json({message:'user not found'});

        }
        res.status(200).json(user);
    }catch(err){
        console.error('Error in GET /users/:username:', err)
        res.status(500).json({message:'server error',err})
    }
};
const uploadProfilePicture=async(req,res)=>{
    try{
        const user=await User.findByIdAndUpdate(
            req.userId,
            {profilePicture:`/uploads/${req.file.filename}`},
            {new:true}
        );
        res.status(200).json({
            message:'Profile picture updated',
            avatar:user.profilePicture
        });
    }catch(err){
        console.error('error upload profile picture:',err)
        res.status(500).json({ message: 'Server error during profile picture upload',err})
    }
}
module.exports={
    getMyProfile,
    createOrUpdateProfile,
    UsersProfile,
    uploadProfilePicture
}