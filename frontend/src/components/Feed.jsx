import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Postcard from './Postcard';
import { TrendingUp, Sparkles, Zap, Users, Search } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get('/posts/all');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, []);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const getFilteredPosts = () => {
    switch (filter) {
      case 'trending':
        return [...posts].sort((a, b) => {
          const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
          const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
          return scoreB - scoreA;
        });
      case 'popular':
        return [...posts].sort((a, b) =>
          (b.comments?.length || 0) - (a.comments?.length || 0)
        );
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="spinner"></div>
        <p>Loading amazing content...</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* Header */}
      <div className="feed-header">
        <div className="feed-title-section">
          <h1 className="feed-title">Your Feed</h1>
          <p className="feed-subtitle">
            <Users size={16} /> {posts.length} posts from your network
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="feed-tabs">
          <button
            onClick={() => setFilter('latest')}
            className={`feed-tab-btn ${filter === 'latest' ? 'active' : ''}`}
          >
            <Zap size={16} /> Latest
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`feed-tab-btn ${filter === 'trending' ? 'active' : ''}`}
          >
            <TrendingUp size={16} /> Trending
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`feed-tab-btn ${filter === 'popular' ? 'active' : ''}`}
          >
            <Sparkles size={16} /> Popular
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="feed-posts">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Postcard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDelete}
            />
          ))
        ) : (
          <div className="feed-empty card">
            <Search size={48} className="empty-icon font-tertiary" style={{ color: 'var(--text-tertiary)' }} />
            <h3>No Posts Yet</h3>
            <p>Be the first to share something amazing! Click the Create button to start your journey.</p>
            <button onClick={() => navigate('/create')} className="btn-primary flex-center gap-sm mt-4">
              <Sparkles size={18} /> Create Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
