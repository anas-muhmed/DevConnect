// models/Post.js

const mongoose = require('mongoose');

// Create a separate schema for comments
const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // link to User
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: "https://via.placeholder.com/40"
  },
  title: {
    type: String,
    required: true
  },
  content:{
    type:String,
    required:true
  },
  image: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

