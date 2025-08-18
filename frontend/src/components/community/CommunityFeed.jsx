import React, { useEffect, useState } from "react";
import axios from "axios";

const CommunityFeed = ({ posts: initialPosts, fetchPosts }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(true);

  const fetchAllPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/community", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = JSON.parse(localStorage.getItem("user"));

      const postsWithFlags = res.data.map((post) => ({
        ...post,
        likedByUser: post.likes?.some((like) => like.userId === currentUser?.id),
        likesCount: post.likes?.length || 0,
      }));

      setPosts(postsWithFlags);
      setLoading(false);
    } catch (err) {
      console.error("Fetch posts error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3001/api/community/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: res.data.liked
                  ? post.likesCount + 1
                  : post.likesCount - 1,
                likedByUser: res.data.liked,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Like post error:", err.response?.data || err.message);
    }
  };

  const handleShare = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/community/${postId}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Post shared!");
    } catch (err) {
      console.error("Share post error:", err.response?.data || err);
      alert(err.response?.data?.message || "Error sharing post");
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3001/api/community/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, res.data] } : p
        )
      );
    } catch (err) {
      console.error("Add comment error:", err.response?.data || err);
      alert(err.response?.data?.message || "Error adding comment");
    }
  };

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow rounded-2xl p-4 border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <p className="font-semibold text-gray-800">{post.author?.name}</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
          <p className="text-gray-700 mb-3">{post.description}</p>

          {post.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="post"
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{post.likesCount} Likes</span>
            <span>{post.shares?.length || 0} Shares</span>
          </div>

          <hr />

          {/* Actions */}
          <div className="flex justify-around text-gray-600 text-sm font-medium mt-2">
            <button
              className={`flex-1 py-2 hover:bg-gray-100 rounded-lg ${
                post.likedByUser ? "text-blue-600 font-semibold" : ""
              }`}
              onClick={() => handleLike(post.id)}
            >
              👍 {post.likedByUser ? "Unlike" : "Like"}
            </button>
            <button
              className="flex-1 py-2 hover:bg-gray-100 rounded-lg"
              onClick={() => document.getElementById(`cmt-${post.id}`).focus()}
            >
              💬 Comment
            </button>
            <button
              className="flex-1 py-2 hover:bg-gray-100 rounded-lg"
              onClick={() => handleShare(post.id)}
            >
              ↗️ Share
            </button>
          </div>

          <hr className="mt-2" />

          {/* Comment Box */}
          <div className="mt-3">
            <input
              id={`cmt-${post.id}`}
              type="text"
              placeholder="Write a comment..."
              className="w-full border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              onKeyDown={async (e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  await handleComment(post.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <div className="mt-2 space-y-1">
              {post.comments?.map((c) => (
                <p key={c.id} className="text-sm">
                  <span className="font-semibold">{c.author?.name}</span>: {c.content}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed;
