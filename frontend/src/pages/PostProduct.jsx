import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { id: userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!profile) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <img
          src={profile.profile_image || "/default-avatar.png"}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-gray-700">{profile.email}</p>
          <p className="text-gray-700">Dept: {profile.department}</p>
          <p className="text-gray-500 text-sm mt-1">
            Joined: {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* User Posts */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Posts</h3>
      {!profile.posts || profile.posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-5">
          {profile.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/community/${post.id}`)} // navigate to post in feed
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h4>
              <p className="text-gray-700 mb-3">{post.description}</p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="post"
                      className="w-full h-28 sm:h-32 object-cover rounded-xl border border-gray-200"
                    />
                  ))}
                </div>
              )}
              <div className="flex justify-between text-gray-500 text-sm">
                <span>{post.comments?.length || 0} Comments</span>
                <span>{post.images?.length || 0} Images</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
