import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateProfile } from "../redux/authSlice";
import axiosInstance from "../api/axios";
import { getAvatarUrl } from "../utils/avatarUrl";
import { updateMyProfile, getMyProfile } from "../api/profile";
import { Edit, Globe, Github, Linkedin, MapPin, User, Loader2 } from "lucide-react";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //const user = useSelector(selectUser);
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
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again");
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
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
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("Uploading file:", file.name, file.size, file.type);

      const res = await axiosInstance.put("/profile/upload/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      console.log("Upload response:", res.data);

      const imageUrl = res.data.avatar;
      if (!imageUrl) {
        throw new Error("Server response missing image URL");
      }

      // Construct full URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const fullImageUrl = imageUrl.startsWith("http") 
        ? imageUrl 
        : `${baseUrl.replace(/\/api$/, "")}${imageUrl}`;

      // Add timestamp to force cache refresh
      const timestampedUrl = `${fullImageUrl}?t=${Date.now()}`;

      // Update both Redux and local state
      dispatch(updateProfile({ avatar: timestampedUrl }));
      setProfile(prev => ({ 
        ...prev, 
        avatar: timestampedUrl,
        user: {
          ...prev.user,
          profilePicture: timestampedUrl
        }
      }));

      toast.success("Profile picture updated successfully");
    } catch (err) {
      console.error("Upload error:", {
        error: err,
        response: err.response?.data
      });
      toast.error(err.response?.data?.message || "Failed to update profile picture");
      
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
      }
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
        skills: formData.skills.split(",").map(skill => skill.trim()),
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
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex justify-between items-end">
              <div className="flex items-end">
                <div 
                  className="relative group h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-md overflow-hidden cursor-pointer"
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                {profile?.avatar || profile.user?.profilePicture ? (
                  <img
                    src={getAvatarUrl(profile.avatar || profile.user?.profilePicture)}
                    alt="Profile"
                    className="rounded-full h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.jpg';
                      console.error(
                        'Failed to load avatar:',
                        profile.avatar || profile.user?.profilePicture
                      );
                    }}
                    key={profile.avatar || profile.user?.profilePicture}
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}

                  {isEditing && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="absolute bottom-0 bg-black bg-opacity-50 text-white text-xs w-full text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Change Photo
                      </div>
                    </>
                  )}
                </div>

                <div className="ml-6 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {profile.user?.username || "No Username"}
                  </h1>
                  {profile.title && (
                    <p className="text-gray-600">{profile.title}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              {profile.github && (
                <a
                  href={ensureValidUrl(profile.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={ensureValidUrl(profile.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.website && (
                <a
                  href={ensureValidUrl(profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Website"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {[
                    { label: "Bio", name: "bio", type: "textarea", icon: null },
                    {
                      label: "Skills (comma separated)",
                      name: "skills",
                      type: "text",
                      placeholder: "JavaScript, React, Node.js",
                      icon: null,
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
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        {field.icon && (
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {field.icon}
                          </div>
                        )}
                        {field.type === "textarea" ? (
                          <textarea
                            id={field.name}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            rows={4}
                            className={`block w-full ${field.icon ? 'pl-10' : ''} sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          />
                        ) : (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className={`block w-full ${field.icon ? 'pl-10' : ''} sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Bio</h3>
                    <p className="text-gray-800 mt-1 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}
                {profile.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                    <p className="text-gray-800 mt-1">{profile.location}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;