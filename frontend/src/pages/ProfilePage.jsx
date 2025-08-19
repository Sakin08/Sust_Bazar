import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProfilePage = () => {
  const { id: userId } = useParams(); // match route "/profile/:id"
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return <p>User not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Profile Info */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={profile.profile_image || "/default-avatar.png"}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-gray-500">
            Joined: {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Posts */}
      <h3 className="text-lg font-semibold mb-2">Posts</h3>
      {!profile.posts || profile.posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {profile.posts.map((post) => (
            <div key={post.id} className="p-3 border rounded-lg bg-white shadow">
              <h4 className="font-bold">{post.title}</h4>
              <p className="text-gray-700">{post.description}</p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="post"
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
