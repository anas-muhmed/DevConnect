import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Bold, Italic, Image as ImageIcon, Sparkles } from "lucide-react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !image) {
      setError("Title, Content, and Image are required for a complete post.");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem('token');
    if (!token) {
      setError("Please login first");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);

    try {
      await axiosInstance.post("/posts/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle("");
      setContent("");
      setImage(null);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card card">
        <h1 className="create-post-title">Create Post</h1>

        <form onSubmit={handleSubmit} className="create-post-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New Post Title"
            className="create-post-title-input"
            required
          />

          <div className="create-post-toolbar">
            <button type="button" className="toolbar-btn"><Bold size={18} /></button>
            <button type="button" className="toolbar-btn"><Italic size={18} /></button>
            <label className="toolbar-btn" style={{ cursor: 'pointer' }}>
              <ImageIcon size={18} />
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {image && <span className="image-attached-badge">Image attached!</span>}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your brilliant content here..."
            className="create-post-textarea"
          ></textarea>

          {error && <p className="text-error" style={{ marginTop: '8px', fontSize: '14px' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" disabled={loading} className="btn-primary flex-center gap-sm" style={{ padding: '12px 24px', fontSize: '16px' }}>
              <Sparkles size={20} />
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
