import React, { useState, } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {                          
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate=useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !image) {
      setError("Title,Content,Image are required");
      return;
    }

    
  const token = localStorage.getItem("token")||sessionStorage.getItem('token');
  if (!token) {
    setError("Please login first");
    navigate('/login');
    return;
  }


    setLoading(true);
    setError(null);

    const formData = new FormData(); //multipart upload (files + text together)
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);

    try {
      
      console.log("Token:", localStorage.getItem("token"));

      const response = await axiosInstance.post(
        "http://localhost:5000/api/posts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("post created:", response.data);
      // Reset form
      setTitle("");
      setContent("");
      setImage(null);

      navigate('/');
    }catch(err) {
      console.error("Full error:", err);
      alert(err?.response?.data?.message || "Unknown error");
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
    <div className="p-6 max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 h-8">Create Post</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Post Title"
          className="w-full text-2xl font-semibold p-2 border-b border-gray-300 mb-4 focus:outline-none"
         required
        />

        <div className="flex items-center gap-4 mb-4">
          <button type="button" className="font-bold text-xl">
            B
          </button>
          <button type="button" className="italic text-xl">
            I
          </button>
          <label className="cursor-pointer text-xl">
            🖼️
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              
            />
          </label>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your content here..."
          className="w-full h-80 p-4 border border-gray-300 rounded-md resize-none focus:outline-none"
        ></textarea>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
