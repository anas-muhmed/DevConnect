import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateProfile } from "../redux/authSlice";
import axiosInstance from "../api/axios";
import { getAvatarUrl, getInitials, getAvatarColor } from "../utils/avatarUrl";
import { updateMyProfile, getMyProfile } from "../api/profile";
import {
  Edit, Globe, Github, Linkedin, MapPin, User, Loader2, Camera, Check, X,
  Mail, Calendar, Code2, Star, TrendingUp, MessageCircle, Zap
} from "lucide-react";
import moment from "moment";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
    website: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const ensureValidUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your profile");
        navigate("/");
        return;
      }

      try {
        const profileData = await getMyProfile(token);
        setProfile(profileData);
        setFormData({
          bio: profileData.bio || "",
          skills: profileData.skills?.join(", ") || "",
          github: profileData.github || "",
          linkedin: profileData.linkedin || "",
          website: profileData.website || "",
          location: profileData.location || "",
        });
        setNewUsername(profileData.user?.username || "");
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("profilePicture", file);
    setUploadingAvatar(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axiosInstance.put("/profile/upload/profile-picture", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedAvatarPath = response.data.avatar || response.data.profilePicture;
      setProfile(prev => ({ ...prev, avatar: updatedAvatarPath }));
      setAvatarError(false);
      toast.success("✨ Profile picture updated!");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === profile?.user?.username) {
      setEditingUsername(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axiosInstance.put("/user/update-username", { username: newUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, username: response.data.user.username },
      }));

      const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, username: response.data.user.username };
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      dispatch(updateProfile({ username: response.data.user.username }));
      setEditingUsername(false);
      toast.success("✅ Username updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update username");
      setNewUsername(profile?.user?.username || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const skillsArray = formData.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updatedData = {
        bio: formData.bio,
        skills: skillsArray,
        github: formData.github,
        linkedin: formData.linkedin,
        website: formData.website,
        location: formData.location,
      };

      await updateMyProfile(token, updatedData);
      setProfile(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="feed-loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const avatarPath = profile?.avatar || profile?.user?.profilePicture;
  const username = profile?.user?.username || "User";
  const email = profile?.user?.email || "";
  const initials = getInitials(username);
  const avatarColor = getAvatarColor(username);
  const skillsArray = profile?.skills || [];
  const joinedDate = profile?.user?.createdAt ? moment(profile.user.createdAt).format("MMMM YYYY") : "Recently";

  return (
    <div className="profile-container">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        {/* Cover Background */}
        <div className="profile-cover"></div>

        {/* Profile Info */}
        <div className="profile-info-section">
          {/* Avatar */}
          <div className="profile-avatar-wrapper group">
            <div className="relative">
              {avatarPath && !avatarError ? (
                <img
                  src={getAvatarUrl(avatarPath)}
                  alt={username}
                  className="profile-avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="profile-avatar placeholder"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}

              {/* Camera overlay */}
              <div
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                className="camera-overlay"
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <>
                    <Camera size={32} />
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Change Photo</span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="profile-top-row">
            <div>
              {/* Username */}
              {editingUsername ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="search-input"
                    style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '8px 16px', borderRadius: '8px' }}
                  />
                  <button onClick={handleUpdateUsername} className="btn-primary flex-center" style={{ padding: '8px', borderRadius: '8px' }}>
                    <Check size={20} />
                  </button>
                  <button onClick={() => { setEditingUsername(false); setNewUsername(profile?.user?.username || ""); }} className="btn-outline flex-center" style={{ padding: '8px', borderRadius: '8px' }}>
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <h1 className="profile-name">{username}</h1>
                  <button onClick={() => setEditingUsername(true)} style={{ color: 'var(--text-tertiary)', padding: '4px' }}>
                    <Edit size={18} />
                  </button>
                </div>
              )}

              <div className="profile-meta">
                <div className="profile-meta-item">
                  <Mail size={16} />
                  <span>{email}</span>
                </div>
                <div className="profile-meta-item">
                  <Calendar size={16} />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Edit/Logout Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn-primary flex-center gap-sm">
                    <Edit size={16} /> Edit Profile
                  </button>
                  <button onClick={handleLogout} className="btn-outline">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(false)} className="btn-outline flex-center gap-sm">
                  <X size={16} /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column - About & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bio Section */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">
              <User size={20} className="text-secondary" /> About
            </h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="search-input"
                style={{ borderRadius: '8px', padding: '12px 16px', minHeight: '100px', resize: 'vertical' }}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {profile?.bio || "No bio yet. Click Edit Profile to add one!"}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">
              <Code2 size={20} className="text-secondary" /> Skills
            </h2>
            {isEditing ? (
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="search-input"
                style={{ borderRadius: '8px' }}
                placeholder="React, Node.js, Python (comma separated)"
              />
            ) : (
              <div className="skills-container">
                {skillsArray.length > 0 ? (
                  skillsArray.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-tertiary)' }}>No skills added yet</p>
                )}
              </div>
            )}
          </div>

          {/* Save Button (when editing) */}
          {isEditing && (
            <button onClick={handleSubmit} className="btn-primary flex-center gap-sm" style={{ padding: '16px', fontSize: '16px', borderRadius: '12px' }}>
              <Check size={20} /> Save Changes
            </button>
          )}
        </div>

        {/* Right Column - Social Links & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Social Links */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">
              <Globe size={20} className="text-secondary" /> Links
            </h2>
            <div className="links-list">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input type="text" name="github" value={formData.github} onChange={handleChange} className="search-input" style={{ borderRadius: '8px' }} placeholder="github.com/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="search-input" style={{ borderRadius: '8px' }} placeholder="linkedin.com/in/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input type="text" name="website" value={formData.website} onChange={handleChange} className="search-input" style={{ borderRadius: '8px' }} placeholder="yourwebsite.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="search-input" style={{ borderRadius: '8px' }} placeholder="City, Country" />
                  </div>
                </>
              ) : (
                <>
                  {profile?.github && (
                    <a href={ensureValidUrl(profile.github)} target="_blank" rel="noopener noreferrer" className="link-item">
                      <Github size={20} /> GitHub
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={ensureValidUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="link-item">
                      <Linkedin size={20} /> LinkedIn
                    </a>
                  )}
                  {profile?.website && (
                    <a href={ensureValidUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="link-item">
                      <Globe size={20} /> Website
                    </a>
                  )}
                  {profile?.location && (
                    <div className="link-item">
                      <MapPin size={20} /> {profile.location}
                    </div>
                  )}
                  {!profile?.github && !profile?.linkedin && !profile?.website && !profile?.location && (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No links added yet</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="profile-section-card" style={{ backgroundColor: 'var(--bg-main)', border: 'none', boxShadow: 'none' }}>
            <h2 className="profile-section-title">
              <TrendingUp size={20} style={{ color: 'var(--accent-color)' }} /> Activity
            </h2>
            <div className="stats-list">
              <div className="stat-item">
                <div className="stat-label">
                  <MessageCircle size={18} /> Posts
                </div>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  <Star size={18} /> Reputation
                </div>
                <span className="stat-value">100</span>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  <Zap size={18} /> Contributions
                </div>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
