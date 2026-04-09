import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import FeedCard from './FeedCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axiosInstance.get('http://localhost:5000/api/posts/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full pl-4 pr-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Feed</h1>

      <div className="grid grid-cols-1 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedCard key={post._id} post={post} />
          ))
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300">No posts found. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;