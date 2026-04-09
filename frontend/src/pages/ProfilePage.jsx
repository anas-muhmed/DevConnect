import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { getAvatarUrl, getInitials, getAvatarColor } from '../utils/avatarUrl';
import Postcard from '../components/Postcard';

const ProfilePage = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance(`/profile/${username}`);
        setProfileData(res.data);
      } catch (err) {
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="feed-loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="feed-empty card mt-8">
        <h3>User not found</h3>
        <p>This profile doesn't exist or may have been deleted.</p>
      </div>
    );
  }

  const avatarPath = profileData.user?.profilePicture || profileData.avatar;
  const initials = getInitials(profileData.username);
  const avatarColor = getAvatarColor(profileData.username);

  return (
    <div className="profile-container">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>

        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            {avatarPath ? (
              <img
                src={getAvatarUrl(avatarPath)}
                alt={profileData.username}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar placeholder" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            )}
          </div>

          <div className="profile-top-row">
            <div>
              <h1 className="profile-name">{profileData.username}</h1>
              <div className="profile-meta">
                <span className="profile-meta-item">
                  {profileData.bio || 'No bio available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts section */}
      <div className="feed-posts" style={{ maxWidth: '768px' }}>
        <h2 className="profile-section-title" style={{ marginBottom: '16px' }}>
          Posts by {profileData.username}
        </h2>

        {profileData.posts?.length > 0 ? (
          <div className="feed-posts">
            {profileData.posts.map((post) => (
              <Postcard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="feed-empty card">
            <p>{profileData.username} hasn't posted anything yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
