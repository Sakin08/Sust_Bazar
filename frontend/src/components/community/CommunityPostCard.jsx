import React, { useState } from "react";

const CommunityPostCard = ({ post, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState("");

  const handleEnterComment = async (e) => {
    if (e.key === "Enter" && commentText.trim()) {
      await onComment(post.id, commentText);
      setCommentText("");
    }
  };

  return (
    <div className="border rounded-lg shadow mb-4 bg-white">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <img
          src={post.author?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="font-semibold">{post.author?.name}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-3 pb-3">
        <p className="mb-2">{post.description}</p>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="post"
                className="w-full object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-3 pb-3 flex justify-between text-gray-600 border-t border-gray-200">
        <button
          className={`flex-1 py-2 text-center ${
            post.likedByUser ? "text-blue-600 font-semibold" : ""
          }`}
          onClick={() => onLike(post.id)}
        >
          {post.likedByUser ? "Liked" : "Like"} ({post.likesCount || 0})
        </button>
        <button className="flex-1 py-2 text-center" onClick={() => onShare(post.id)}>
          Share ({post.shares?.length || 0})
        </button>
      </div>

      {/* Comments */}
      <div className="px-3 pb-3 border-t border-gray-200">
        <input
          type="text"
          placeholder="Write a comment..."
          className="w-full border rounded px-2 py-1 mb-2"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleEnterComment}
        />
        <div>
          {post.comments?.map((c) => (
            <p key={c.id} className="mb-1">
              <strong>{c.author?.name}:</strong> {c.content}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
