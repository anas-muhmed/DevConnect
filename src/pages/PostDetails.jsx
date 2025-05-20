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
        const response = await axiosInstance.get(`http://localhost:5000/api/posts/${id}`);
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
    <div className="p-4 max-w-4xl mx-auto">
      <Postcard post={post} isDetailedView={true} />
    </div>
  );
};

export default PostDetail;