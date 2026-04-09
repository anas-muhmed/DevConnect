import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import moment from "moment";
import { Link } from "react-router-dom";
import { Edit2, Trash2, X, Check, MoreVertical } from "lucide-react";

const Postcard = ({ post, isDetailedView, onUpdate, onDelete }) => {
  // User data
  const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id || null;

  // States
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postData, setPostData] = useState(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setPostData(post);
  }, [post]);

  // Get post owner ID
  const getPostOwnerId = () => {
    if (postData.userId) return postData.userId;
    if (postData.user?._id) return postData.user._id;
    if (typeof postData.user === "string") return postData.user;
    return null;
  };

  const postOwnerId = getPostOwnerId();
  const isOwner = currentUserId && postOwnerId 
    ? currentUserId.toString() === postOwnerId.toString() 
    : false;

  // Delete post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      setDeleting(true);
      await axiosInstance.delete(`/posts/${postData._id}`);
      toast.success("Post deleted! 🗑️");
      if (onDelete) onDelete(postData._id);
      else window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Edit post
  const handleEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.put(`/posts/${postData._id}`, {
        title: editTitle,
        content: editContent
      });
      setPostData(response.data);
      setIsEditing(false);
      toast.success("Post updated! ✅");
      if (onUpdate) onUpdate(response.data);
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  // Add comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/posts/${postData._id}/comment`, {
        text: commentText,
      });
      setPostData(response.data.post);
      toast.success("Comment added! 💬");
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put(`/posts/${postData._id}/comment/${commentId}`, {
        text: editCommentText
      });
      
      // Update local state
      const updatedComments = postData.comments.map(c => 
        c._id === commentId ? { ...c, text: editCommentText } : c
      );
      setPostData({ ...postData, comments: updatedComments });
      setEditingCommentId(null);
      toast.success("Comment updated! ✅");
    } catch (error) {
      console.error("Edit comment error:", error);
      toast.error("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axiosInstance.delete(`/posts/${postData._id}/comment/${commentId}`);
      
      // Update local state
      const updatedComments = postData.comments.filter(c => c._id !== commentId);
      setPostData({ ...postData, comments: updatedComments });
      toast.success("Comment deleted! 🗑️");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none mb-2"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {postData.title}
              </h2>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Posted by{" "}
              <Link
                to={`/profile/${postData.username}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {postData.username}
              </Link>{" "}
              · {moment(postData.createdAt).fromNow()}
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Post
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    disabled={deleting}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Image */}
        {postData.image && (
          <img
            src={`http://127.0.0.1:5000${postData.image}`}
            alt="Post"
            className="w-full h-auto rounded-lg mb-4 max-h-96 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Post Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditPost}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(postData.title);
                  setEditContent(postData.content);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {postData.content}
          </p>
        )}
      </div>

      {/* Comments Section (only in detailed view) */}
      {isDetailedView && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            💬 Comments ({postData.comments?.length || 0})
          </h3>

          {/* Comments List */}
          {postData.comments?.length > 0 ? (
            <div className="space-y-3 mb-6">
              {postData.comments.map((comment) => {
                const isCommentOwner = currentUserId && comment.user 
                  ? currentUserId.toString() === comment.user.toString() 
                  : false;
                const isEditingThis = editingCommentId === comment._id;

                return (
                  <div
                    key={comment._id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {comment.username}
                        <span className="text-xs text-gray-500 ml-2">
                          {moment(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      {isCommentOwner && !isEditingThis && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditCommentText(comment.text);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingThis ? (
                      <div className="space-y-2">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-sm rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {comment.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mb-6 text-center py-4">
              No comments yet. Be the first to comment! 🎉
            </p>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              rows="3"
              placeholder="Write a comment..."
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">↻</span>
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
