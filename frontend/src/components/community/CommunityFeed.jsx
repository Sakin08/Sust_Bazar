import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CommunityFeed = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState({});
  const navigate = useNavigate();

  // Fetch all posts
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

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // -------------------- Actions --------------------
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
                likesCount: res.data.liked ? post.likesCount + 1 : post.likesCount - 1,
                likedByUser: res.data.liked,
              }
            : post
        )
      );
    } catch (err) {
      console.error(err);
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
      console.error(err);
      alert("Error sharing post");
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
      console.error(err);
      alert("Error adding comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3001/api/community/${postId}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error deleting comment");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/community/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting post");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const commentsToShow = showAllComments[post.id]
          ? post.comments
          : post.comments?.slice(0, 2);

        return (
          <div
            key={post.id}
            className="bg-white shadow rounded-2xl p-4 border border-gray-200"
          >
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                onClick={() => navigate(`/profile/${post.author?.id}`)}
              >
                <img
                  src={post.author?.profile_image || "/default-avatar.png"}
                  alt={post.author?.name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/profile/${post.author?.id}`)}
              >
                <p className="font-semibold text-gray-800">{post.author?.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              {(post.author?.id === currentUser?.id || currentUser?.role === "admin") && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-auto text-red-500 text-sm font-medium"
                >
                  Delete Post
                </button>
              )}
            </div>

            {/* Post Content */}
            <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
            <p className="text-gray-700 mb-3">{post.description}</p>

            {post.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {post.images.map((img, index) => (
                  <img
                    key={index}
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
              <span>{post.comments?.length || 0} Comments</span>
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

            {/* Comments */}
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
              <div className="mt-2 space-y-2">
                {commentsToShow?.map((c) => (
                  <div
                    key={c.id || `${post.id}-cmt-${Math.random()}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                        onClick={() => navigate(`/profile/${c.author?.id}`)}
                      >
                        <img
                          src={c.author?.profile_image || "/default-avatar.png"}
                          alt={c.author?.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p>
                        <span
                          className="font-semibold cursor-pointer"
                          onClick={() => navigate(`/profile/${c.author?.id}`)}
                        >
                          {c.author?.name}
                        </span>
                        : {c.content}
                      </p>
                    </div>
                    {(c.author?.id === currentUser?.id || currentUser?.role === "admin") && (
                      <button
                        onClick={() => handleDeleteComment(post.id, c.id)}
                        className="text-red-500 text-xs ml-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {post.comments?.length > 2 && !showAllComments[post.id] && (
                  <button
                    className="text-blue-600 text-sm mt-1"
                    onClick={() =>
                      setShowAllComments((prev) => ({ ...prev, [post.id]: true }))
                    }
                  >
                    View all comments ({post.comments.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunityFeed;
