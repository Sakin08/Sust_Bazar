import React, { useEffect, useState } from "react";
import CreatePostForm from "../components/community/CreatePostForm";
import CommunityFeed from "../components/community/CommunityFeed";
import { fetchCommunityPosts } from "../api/communityApi";
import { useSocket } from "../context/SocketContext";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const socket = useSocket();

  const getPosts = async () => {
    try {
      const data = await fetchCommunityPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newPost", (post) => setPosts((prev) => [post, ...prev]));
    socket.on("deletePost", ({ postId }) =>
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    );
    socket.on("updateLikes", ({ postId, likesCount }) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likesCount } : p
        )
      )
    );
    socket.on("updateShares", ({ postId, sharesCount }) =>
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, shares: Array(sharesCount) } : p))
      )
    );
    socket.on("newComment", ({ postId, comment }) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        )
      )
    );

    return () => {
      socket.off("newPost");
      socket.off("deletePost");
      socket.off("updateLikes");
      socket.off("updateShares");
      socket.off("newComment");
    };
  }, [socket]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Community</h1>
      <CreatePostForm onPostCreated={getPosts} />
      <CommunityFeed posts={posts} fetchPosts={getPosts} />
    </div>
  );
};

export default CommunityPage;
