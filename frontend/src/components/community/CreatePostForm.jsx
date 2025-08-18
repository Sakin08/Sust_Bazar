import React, { useState } from "react";
import { createCommunityPost } from "../../api/communityApi";

const CreatePostForm = ({ onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); // store File objects
    setPreviewUrls(files.map((file) => URL.createObjectURL(file))); // for preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("tags", tags.split(",").map((tag) => tag.trim()).join(","));
      images.forEach((file) => formData.append("images", file)); // append files

      await createCommunityPost(formData, token);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
      setImages([]);
      setPreviewUrls([]);

      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 shadow-md mb-4">
      <h2 className="font-bold mb-2">Create a Post</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded w-full px-2 py-1 mb-2"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded w-full px-2 py-1 mb-2"
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded w-full px-2 py-1 mb-2"
        required
      />

      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="border rounded w-full px-2 py-1 mb-2"
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="mb-2"
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previewUrls.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="preview"
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Post
      </button>
    </form>
  );
};

export default CreatePostForm;
