import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { Link } from "react-router-dom";


const Postcard = ({ post, isDetailedView }) => {
  // User data
  const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const currentUserId = currentUser?._id || currentUser?.id || null;

  // Debug
  console.log("[OWNERSHIP DEBUG] Current User ID:", currentUserId);
  console.log("[OWNERSHIP DEBUG] Post Object:", JSON.parse(JSON.stringify(post)));

  // States
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postData, setPostData] = useState(post);
//render dynaamically {comments+post}
  useEffect(() => {
    setPostData(post);
  }, [post]);

 // Unified ID access
  const getPostOwnerId = () => {
    if (postData.userId) return postData.userId;
    if (postData.user?._id) return postData.user._id;
    if (typeof postData.user === "string") return postData.user; // Direct ID string
    return null;
  };

  const postOwnerId = getPostOwnerId();
  const isOwner = currentUserId && postOwnerId 
    ? currentUserId.toString() === postOwnerId.toString() 
    : false;

  console.log("[OWNERSHIP VERIFICATION]", {
    isOwner,
    currentUserId,
    postOwnerId,
    equality: currentUserId === postOwnerId,
    types: {
      current: typeof currentUserId,
      post: typeof postOwnerId
    }
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      setDeleting(true);
      await axiosInstance.delete(`http://localhost:5000/api/posts/${postData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post deleted!");
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `http://localhost:5000/api/posts/${postData._id}/comment`,
        {
          username: currentUser?.username || "anonymous",
          text: commentText,
        },
        { headers: { Authorization: `Bearer ${token}` },
        
      }
      );
      setPostData(response.data);
      toast.success("Comment added!");
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md mb-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {postData.title}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Posted by <Link to={`/profile/${postData.username}`} className="font-semibold text-blue-600 hover:underline">
  {postData.username}
</Link>{" "}·{" "}
            {moment(postData.createdAt).fromNow()}
            <div className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-1 rounded">
              <span className="font-mono">UserID: {postOwnerId || "Not detected"}</span>
              {postOwnerId && (
                <span className={`ml-2 ${isOwner ? "text-green-500" : "text-red-500"}`}>
                  ({isOwner ? "YOU OWN THIS" : "NOT YOUR POST"})
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm transition"
          >
            {deleting ? "Deleting..." : "Delete Post"}
          </button>
        )}
      </div>

      {postData.image && (
        <img
          src={`http://localhost:5000${postData.image}`}
          alt="Post"
          className="w-full h-auto rounded mb-4 max-h-96 object-contain"
          onError={(e) => {
            console.error("Image failed to load:", e.target.src);
            e.target.style.display = "none";
          }}
        />
      )}

      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
        {postData.content}
      </p>

      {isDetailedView && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Comments ({postData.comments?.length || 0})
          </h3>
          
          {postData.comments?.length > 0 ? (
            <div className="space-y-4 mb-6">
              {postData.comments.map((comment, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {comment.username}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {moment(comment.createdAt).fromNow()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No comments yet</p>
          )}

          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows="3"
              placeholder="Write a comment..."
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">↻</span>
                  Posting...
                </span>
              ) : (
                "Post Comment"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Postcard;