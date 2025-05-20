const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // Used for login and feed @username display
  },
  email: {
    type: String,
    required: true,
    unique: true, // Used for login/register
  },
  password: {
    type: String,
    required: true, // Hashed and stored
  },
  profilePicture: {
    type: String,
    default: "https://via.placeholder.com/40", // Shown in Feed, comments, etc.
  },
  bio: {
    type: String,
    default: "", // Short intro in user profile page
  },
  displayName: {
    type: String,
    default: "", // Shown next to username like "Anas Muhammad (@anas)"
  },
  // createdAt, updatedAt auto from timestamps below
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
