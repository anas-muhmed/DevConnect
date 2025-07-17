import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { votePost } from '../api/post';

const FeedCard = ({ post }) => {
  const [upvotes, setUpvotes] = useState(post.upvotes?.length || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes?.length || 0);

  const handleVote = async (action) => {
    try {
      const data = await votePost(post._id, action);
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    } catch (err) {
      console.error('Voting failed', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
      
      {/* ✅ Wrap only this top block in Link */}
      <Link to={`/posts/${post._id}`} className="block cursor-pointer">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{post.title}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Posted by <span className="font-semibold">{post.username || 'Anonymous'}</span> · {moment(post.createdAt).fromNow()}
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {post.content?.slice(0, 180)}{post.content?.length > 180 && '...'}
        </p>
      </Link>

      {/* ✅ Buttons outside of <Link> */}
      <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // not strictly needed anymore
            handleVote('upvote');
          }}
          className="flex items-center gap-1 hover:text-blue-500"
        >
          <ArrowUp size={20} />
          <span>{upvotes}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote('downvote');
          }}
          className="flex items-center gap-1 hover:text-red-500"
        >
          <ArrowDown size={20} />
          <span>{downvotes}</span>
        </button>

        <div className="flex items-center gap-1 hover:text-green-500">
          <MessageCircle size={20} />
          <span>{post.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
