import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Postcard from '../components/Postcard';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/'); // Redirect if post not found
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!post) return <div className="p-4 text-red-500">Post not found</div>;

  return (
    <div className="layout-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '16px' }}>
      <Postcard post={post} isDetailedView={true} />
    </div>
  );
};

export default PostDetail;