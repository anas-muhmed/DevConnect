import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateProfile } from "../redux/authSlice";
import axiosInstance from "../api/axios";
import { getAvatarUrl, getInitials, getAvatarColor } from "../utils/avatarUrl";
import { updateMyProfile, getMyProfile } from "../api/profile";
import { Edit, Globe, Github, Linkedin, MapPin, User, Loader2, Camera, Check, X } from "lucide-react";

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
        console.error("Profile fetch error:", err);
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    const formDataObj = new FormData();
    formDataObj.append("profilePicture", file);

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await axiosInstance.put("/profile/upload/profile-picture", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      // Clear avatar error and update profile
      setAvatarError(false);
      
      // Refresh profile data to get new avatar
      const freshProfile = await getMyProfile(token);
      setProfile(freshProfile);

      toast.success("Profile picture updated! 🎉");
    } catch (err) {
      console.error("Upload error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to upload image");
      
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername || newUsername === profile.user?.username) {
      setEditingUsername(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axiosInstance.put("/user/update-username", { username: newUsername }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const freshProfile = await getMyProfile(token);
      setProfile(freshProfile);
      setEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update username");
      setNewUsername(profile.user?.username || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      toast.error("Please login again.");
      return navigate("/login");
    }

    try {
      setIsLoading(true);
      const normalizedData = {
        ...formData,
        skills: formData.skills.split(",").map(skill => skill.trim()).filter(s => s),
        github: ensureValidUrl(formData.github),
        linkedin: ensureValidUrl(formData.linkedin),
        website: ensureValidUrl(formData.website),
      };

      await updateMyProfile(normalizedData, token);
      const freshData = await getMyProfile(token);
      setProfile(freshData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex items-end gap-4">
                {/* Avatar - Always clickable! */}
                <div 
                  className="relative group h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  
                  {!avatarError && (profile?.avatar || profile.user?.profilePicture) ? (
                    <img
                      src={getAvatarUrl(profile.avatar || profile.user?.profilePicture)}
                      alt="Profile"
                      className="rounded-full h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div 
                      className="h-full w-full rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: getAvatarColor(profile?.user?.username || profile?.user?.email) }}
                    >
                      {getInitials(profile?.user?.displayName || profile?.user?.username || profile?.user?.email)}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  
                  {/* Hover overlay - Always visible */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="mb-2">
                  {/* Username with inline editing */}
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none px-2"
                        autoFocus
                      />
                      <button onClick={handleUsernameUpdate} className="text-green-600 hover:text-green-700">
                        <Check className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setEditingUsername(false); setNewUsername(profile.user?.username || ""); }} className="text-red-600 hover:text-red-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {profile.user?.username || "No Username"}
                      </h1>
                      <button 
                        onClick={() => setEditingUsername(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {profile.user?.displayName && (
                    <p className="text-gray-600 mt-1">{profile.user.displayName}</p>
                  )}
                  {profile.user?.email && (
                    <p className="text-sm text-gray-500">{profile.user.email}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-4">
              {profile.github && (
                <a
                  href={ensureValidUrl(profile.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={ensureValidUrl(profile.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.website && (
                <a
                  href={ensureValidUrl(profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {profile.location && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {isEditing ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Bio", name: "bio", type: "textarea", icon: null },
                  {
                    label: "Skills (comma separated)",
                    name: "skills",
                    type: "text",
                    placeholder: "JavaScript, React, Node.js",
                  },
                  {
                    label: "GitHub URL",
                    name: "github",
                    type: "url",
                    icon: <Github className="h-5 w-5 text-gray-400" />,
                  },
                  {
                    label: "LinkedIn URL",
                    name: "linkedin",
                    type: "url",
                    icon: <Linkedin className="h-5 w-5 text-gray-400" />,
                  },
                  {
                    label: "Website",
                    name: "website",
                    type: "url",
                    icon: <Globe className="h-5 w-5 text-gray-400" />,
                  },
                  {
                    label: "Location",
                    name: "location",
                    type: "text",
                    icon: <MapPin className="h-5 w-5 text-gray-400" />,
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      {field.icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {field.icon}
                        </div>
                      )}
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className={`block w-full ${field.icon ? 'pl-10' : ''} px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bio</h3>
                  <p className="text-gray-800 mt-2 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}
              {profile.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {!profile.bio && !profile.skills?.length && (
                <div className="text-center py-8 text-gray-500">
                  <p>No profile information yet.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your bio and skills
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
