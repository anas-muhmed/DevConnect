import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';

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
        console.error('Failed to fetch profile', err);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <p>Loading profile...</p>;
  if (!profileData) return <p>User not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <img
          src={profileData.profilePicture || '/default-avatar.png'}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{profileData.username}</h1>
          <p className="text-gray-600">{profileData.bio || 'No bio available'}</p>
        </div>
      </div>

      {/* Posts section (optional) */}
      {profileData.posts?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Posts by {profileData.username}</h2>
          {profileData.posts.map((post) => (
            <div key={post._id} className="border rounded p-3 mb-2">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-700">{post.content.slice(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
