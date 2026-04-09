const User = require('../models/Users');
const Profile = require('../models/Profile');

// Search developers by username, skills, or location
const searchDevelopers = async (req, res) => {
  try {
    const { q, skills, location } = req.query;

    let query = {};

    // Build search query
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ];
    }

    // Find matching users
    const users = await User.find(query)
      .select('-password')
      .limit(20);

    const userIds = users.map(u => u._id);

    // Get their profiles
    let profileQuery = { user: { $in: userIds } };

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      profileQuery.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    if (location) {
      profileQuery.location = { $regex: location, $options: 'i' };
    }

    const profiles = await Profile.find(profileQuery)
      .populate('user', 'username displayName email profilePicture')
      .limit(20);

    res.status(200).json({
      results: profiles.map(p => ({
        _id: p.user._id,
        username: p.user.username,
        displayName: p.user.displayName,
        email: p.user.email,
        profilePicture: p.user.profilePicture,
        bio: p.bio,
        skills: p.skills,
        location: p.location,
        github: p.github,
        linkedin: p.linkedin
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = { searchDevelopers };
