import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CommunityPostCard from '../components/CommunityPostCard';
import { fetchCommunityPosts, createCommunityPost, deleteCommunityPost } from '../api/community';
import axios from 'axios';

const PRIORITY_COLORS = {
    normal: 'bg-gray-200 text-gray-800',
    high: 'bg-red-200 text-red-800',
    low: 'bg-green-200 text-green-800',
};

const Community = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for errors
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Update initial state
    const [newPost, setNewPost] = useState({
        title: '',
        description: '',
        category: 'Lost & Found',
        type: 'lost', // Add this field
        priority: 'normal',
        location: '',
        tags: [],
        images: [],
        tagInput: '',
    });

    const categories = ['Lost & Found', 'Borrow Books']; // Removed Events, General Discussion, and Requests

    useEffect(() => {
        loadPosts();
    }, [searchQuery, categoryFilter]);

    const loadPosts = async () => {
        setLoading(true);
        setError(null); // Reset error state
        try {
            const data = await fetchCommunityPosts(searchQuery, categoryFilter);
            setPosts(data);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError('Failed to load posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!user) return alert('Login required');

        try {
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('description', newPost.description);
            formData.append('category', newPost.category);
            formData.append('priority', newPost.priority);
            formData.append('location', newPost.location);
            formData.append('tags', JSON.stringify(newPost.tags));

            // Append each image file
            newPost.images.forEach(image => {
                formData.append('images', image);
            });

            const response = await axios.post('http://localhost:3001/api/community', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setPosts([response.data, ...posts]);
            setNewPost({
                title: '',
                description: '',
                category: 'Lost & Found',
                type: 'lost',
                priority: 'normal',
                location: '',
                tags: [],
                images: [],
                tagInput: '',
            });
        } catch (err) {
            console.error('Error creating post:', err);
            alert('Failed to create post. Please try again.');
        }
    };

    const handleAddTag = () => {
        if (newPost.tagInput.trim()) {
            setNewPost({
                ...newPost,
                tags: [...newPost.tags, newPost.tagInput.trim()],
                tagInput: '',
            });
        }
    };

    const handleDeletePost = async (id) => {
        if (!user) return;
        try {
            await deleteCommunityPost(id, token);
            setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post. Please try again.');
        }
    };

    // Add this function to handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setNewPost(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    // Add this function to remove selected images
    const handleRemoveImage = (index) => {
        setNewPost(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Community</h1>

            {/* Create Post Form */}
            {user && (
                <form
                    onSubmit={handleCreatePost}
                    className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-3"
                >
                    <h2 className="text-lg font-semibold mb-2">Create Post</h2>

                    <input
                        type="text"
                        placeholder="Title"
                        value={newPost.title}
                        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />

                    <textarea
                        placeholder="Description"
                        value={newPost.description}
                        onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        rows={4}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Location"
                        value={newPost.location}
                        onChange={e => setNewPost({ ...newPost, location: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />

                    {/* Tags Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add tag"
                            value={newPost.tagInput}
                            onChange={e => setNewPost({ ...newPost, tagInput: e.target.value })}
                            className="flex-1 border border-gray-300 rounded px-3 py-2"
                        />
                        <button type="button" onClick={handleAddTag} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Add Tag
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {newPost.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Images Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Images (Max 5)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="w-full p-2 border rounded"
                            max="5"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {newPost.images.map((file, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview ${idx + 1}`}
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <select
                        value={newPost.category}
                        onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Add this conditional field for Lost & Found posts */}
                    {newPost.category === 'Lost & Found' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={newPost.type}
                                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="lost">I Lost Something</option>
                                <option value="found">I Found Something</option>
                            </select>
                        </div>
                    )}

                    <select
                        value={newPost.priority}
                        onChange={e => setNewPost({ ...newPost, priority: e.target.value })}
                        className={`w-full border border-gray-300 rounded px-3 py-2 ${PRIORITY_COLORS[newPost.priority]}`}
                    >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
                    >
                        Post
                    </button>
                </form>
            )}

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
                {['All', ...categories].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded ${categoryFilter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Posts List */}
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : loading ? (
                <p>Loading...</p>
            ) : posts.length === 0 ? (
                <p className="text-gray-500">No posts found.</p>
            ) : (
                posts.map(post => (
                    <CommunityPostCard key={post.id} post={post} currentUser={user} onDelete={handleDeletePost} />
                ))
            )}
        </div>
    );
};

export default Community;