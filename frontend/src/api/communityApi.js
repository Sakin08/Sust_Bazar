import axios from "axios";

const API_URL = "http://localhost:3001/api/community";

export const fetchCommunityPosts = async (search = "", category = "All") => {
  try {
    const response = await axios.get(API_URL, {
      params: { search, category },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error.response?.data || error.message);
    throw error;
  }
};

export const createCommunityPost = async (postData, token) => {
  const response = await axios.post(API_URL, postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteCommunityPost = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const likeCommunityPost = async (postId, token) => {
  const response = await axios.post(
    `${API_URL}/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const shareCommunityPost = async (postId, token) => {
  const response = await axios.post(
    `${API_URL}/${postId}/share`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const commentCommunityPost = async (postId, comment, token) => {
  const response = await axios.post(
    `${API_URL}/${postId}/comment`,
    { content: comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
