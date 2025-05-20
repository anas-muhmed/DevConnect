const mongoose=require('mongoose')

const ProfileSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        unique: true,
    },
    bio:{
        type:String
    },
    skills:{
        type:[String],
        default:[]
    },
    github:{
      type:String,
    },
    linkedin: {
        type: String,
      },
      website: {
        type: String,
      },
      location: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

module.exports=mongoose.model('Profile',ProfileSchema)