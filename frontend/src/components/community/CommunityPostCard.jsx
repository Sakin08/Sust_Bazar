import React, { useState } from "react";
import axios from "axios";
import CommentModal from "./CommentModal";

const CommunityPostCard = ({ post }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likedByUser, setLikedByUser] = useState(post.likedByUser);
  const [comments, setComments] = useState(post.comments || []);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3001/api/community/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const liked = res.data.liked;
      setLikesCount(liked ? likesCount + 1 : likesCount - 1);
      setLikedByUser(liked);
    } catch (err) {
      console.error("Like post error:", err.response?.data || err.message);
    }
  };

  const previewComments = comments.slice(0, 2);

  return (
    <div className="bg-white shadow rounded-2xl p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <img
            src={post.author?.profile_image || "/default-avatar.png"}
            alt={post.author?.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{post.author?.name || "Anonymous"}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
      <p className="text-gray-700 mb-3">{post.description}</p>

      {post.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {post.images.map((img, idx) => (
            <img key={idx} src={img} alt="post" className="w-full rounded-lg object-cover" />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{likesCount} Likes</span>
        <span>{post.shares?.length || 0} Shares</span>
      </div>

      <hr />

      {/* Actions */}
      <div className="flex justify-around text-gray-600 text-sm font-medium mt-2">
        <button
          className={`flex-1 py-2 hover:bg-gray-100 rounded-lg ${
            likedByUser ? "text-blue-600 font-semibold" : ""
          }`}
          onClick={handleLike}
        >
          👍 {likedByUser ? "Unlike" : "Like"}
        </button>
        <button
          className="flex-1 py-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setModalOpen(true)}
        >
          💬 Comment
        </button>
        <button className="flex-1 py-2 hover:bg-gray-100 rounded-lg">↗️ Share</button>
      </div>

      <hr className="mt-2" />

      {/* Preview Comments */}
      <div className="mt-3 space-y-1">
        {previewComments.map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-semibold">{c.user?.name}</span>: {c.text}
          </p>
        ))}

        {comments.length > 2 && (
          <button
            onClick={() => setModalOpen(true)}
            className="text-blue-600 text-sm font-medium mt-1"
          >
            Show all comments
          </button>
        )}
      </div>

      {/* Comment Modal */}
      {modalOpen && (
        <CommentModal
          post={post}
          comments={comments}
          setComments={setComments}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CommunityPostCard;
