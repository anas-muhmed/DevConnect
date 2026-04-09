import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";
import moment from "moment";
import { Link } from "react-router-dom";
import {
  Edit2, Trash2, X, Check, MoreVertical, Heart, MessageCircle,
  Share2, Bookmark, TrendingUp, ArrowUp, ArrowDown, Send, Sparkles
} from "lucide-react";
import { getAvatarUrl, getInitials, getAvatarColor } from "../utils/avatarUrl";

const getPostImageUrl = (imagePath) => {
  if (!imagePath) return null;

  let normalizedPath = imagePath.replace(/\\/g, '/');

  if (normalizedPath.startsWith('http://127.0.0.1:5000') || normalizedPath.startsWith('http://localhost:5000')) {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api').replace('/api', '');
    return normalizedPath.replace('http://127.0.0.1:5000', apiBase).replace('http://localhost:5000', apiBase);
  }
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;

  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api').replace('/api', '');

  normalizedPath = normalizedPath.replace(/^\//, '');
  normalizedPath = normalizedPath.replace(/^uploads\//, '');

  return `${apiBase}/uploads/${normalizedPath}`;
};

const Postcard = ({ post, isDetailedView, onUpdate, onDelete }) => {
  const currentUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id || null;

  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postData, setPostData] = useState(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post?.title || "");
  const [editContent, setEditContent] = useState(post?.content || "");
  const [showMenu, setShowMenu] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setPostData(post);
    setEditTitle(post?.title || "");
    setEditContent(post?.content || "");
  }, [post]);

  if (!postData) return null;

  const getPostOwnerId = () => {
    if (postData.userId) return postData.userId;
    if (postData.user?._id) return postData.user._id;
    if (typeof postData.user === "string") return postData.user;
    return null;
  };

  const postOwnerId = getPostOwnerId();
  const isOwner = currentUserId && postOwnerId ? currentUserId.toString() === postOwnerId.toString() : false;

  const handleVote = async (action) => {
    if (isVoting) return;
    try {
      setIsVoting(true);
      await axiosInstance.post(`/posts/${postData._id}/vote`, { action });
      setPostData(prev => ({
        ...prev,
        upvotes: action === 'upvote' ? [...(prev.upvotes || []), currentUserId] : (prev.upvotes || []).filter(id => id !== currentUserId),
        downvotes: action === 'downvote' ? [...(prev.downvotes || []), currentUserId] : (prev.downvotes || []).filter(id => id !== currentUserId)
      }));
      toast.success(action === 'upvote' ? '👍 Upvoted!' : '👎 Downvoted!');
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const hasUpvoted = postData.upvotes?.includes(currentUserId);
  const hasDownvoted = postData.downvotes?.includes(currentUserId);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/posts/${postData._id}`);
      toast.success("✅ Post deleted!");
      if (onDelete) onDelete(postData._id);
      else window.location.reload();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content required");
      return;
    }
    try {
      const response = await axiosInstance.put(`/posts/${postData._id}`, {
        title: editTitle,
        content: editContent
      });
      setPostData(response.data.post);
      setIsEditing(false);
      toast.success("✅ Post updated!");
      if (onUpdate) onUpdate(response.data.post);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/posts/${postData._id}/comment`, { text: commentText });
      setPostData(prev => ({ ...prev, comments: response.data.post.comments }));
      setCommentText("");
      toast.success("💬 Comment added!");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const username = postData.username || postData.user?.username || "Unknown";
  const profilePic = postData.user?.profilePicture || postData.profilePic;
  const resolvedProfilePic = getAvatarUrl(profilePic);
  const initials = getInitials(username);
  const avatarColor = getAvatarColor(username);
  const voteScore = (postData.upvotes?.length || 0) - (postData.downvotes?.length || 0);

  return (
    <article className="card">
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${username}`} className="post-author">
          {resolvedProfilePic ? (
            <img src={resolvedProfilePic} alt={username} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder" style={{ backgroundColor: avatarColor }}>{initials}</div>
          )}
          <div className="post-author-info">
            <h3>{username} {isOwner && <span className="post-badge">You</span>}</h3>
            <span className="time">{moment(postData.createdAt).fromNow()}</span>
          </div>
        </Link>

        {isOwner && !isEditing && (
          <div className="profile-dropdown-container">
            <button onClick={() => setShowMenu(!showMenu)} className="post-menu-btn">
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="dropdown-menu" style={{ zIndex: 10 }}>
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => { handleDelete(); setShowMenu(false); }} className="text-error flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                  <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '16px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="search-input"
            rows="4"
            style={{ paddingLeft: '16px', resize: 'vertical', minHeight: '100px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}
          />
          <div className="action-group">
            <button onClick={handleEdit} className="btn-primary flex-center gap-sm">
              <Check size={16} /> Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-outline flex-center gap-sm">
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <Link to={`/posts/${postData._id}`} style={{ display: 'block' }}>
          <h2 className="post-title">{postData.title}</h2>
          <p className="post-body">{postData.content}</p>
        </Link>
      )}

      {/* Image */}
      {postData.image && !isEditing && (
        <Link to={`/posts/${postData._id}`}>
          <img src={getPostImageUrl(postData.image)} alt="Post attachment" className="post-image" />
        </Link>
      )}

      {/* Actions Bar */}
      <div className="post-actions">
        <div className="action-group">
          <div className="vote-group">
            <button onClick={() => handleVote('upvote')} className={`vote-btn ${hasUpvoted ? 'upvoted' : ''}`}>
              <ArrowUp size={18} />
            </button>
            <span className="vote-score" style={{ color: voteScore > 0 ? 'var(--accent-color)' : voteScore < 0 ? 'var(--error)' : 'var(--text-tertiary)' }}>
              {voteScore}
            </span>
            <button onClick={() => handleVote('downvote')} className={`vote-btn ${hasDownvoted ? 'downvoted' : ''}`}>
              <ArrowDown size={18} />
            </button>
          </div>
          {voteScore >= 10 && (
            <span className="post-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <TrendingUp size={12} /> Trending
            </span>
          )}
        </div>

        <div className="action-group">
          <Link to={`/posts/${postData._id}`} className="action-btn">
            <MessageCircle size={18} /> {postData.comments?.length || 0} Comments
          </Link>
          <button className="action-btn"><Share2 size={18} /></button>
          <button className="action-btn"><Bookmark size={18} /></button>
        </div>
      </div>

      {/* Detailed Comments Section */}
      {isDetailedView && (
        <div className="comments-section">
          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="comment-form">
            <div className="avatar-placeholder" style={{ backgroundColor: getAvatarColor(currentUser?.username || 'User') }}>
              {getInitials(currentUser?.username || 'User')}
            </div>
            <div className="comment-input-area">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
              />
              <button disabled={loading || !commentText.trim()} className="btn-primary flex-center gap-sm mt-4" type="submit" style={{ float: 'right' }}>
                <Send size={16} /> {loading ? 'Posting...' : 'Comment'}
              </button>
              <div style={{ clear: 'both' }}></div>
            </div>
          </form>

          {/* Comments List */}
          <div className="comment-list">
            {postData.comments && postData.comments.length > 0 ? (
              postData.comments.map((comment) => {
                const isCommentOwner = currentUserId && comment.user ? currentUserId.toString() === comment.user.toString() : false;
                const commentUsername = comment.username || "Unknown";

                return (
                  <div key={comment._id} className="comment-item">
                    <div className="avatar-placeholder" style={{ backgroundColor: getAvatarColor(commentUsername), width: '32px', height: '32px', fontSize: '12px' }}>
                      {getInitials(commentUsername)}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <div className="post-author-info">
                          <h3 style={{ fontSize: '13px' }}>{commentUsername} {isCommentOwner && <span className="post-badge text-xs">You</span>}</h3>
                          <span className="time">{moment(comment.createdAt).fromNow()}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{comment.text}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px 0' }}>No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default Postcard;
