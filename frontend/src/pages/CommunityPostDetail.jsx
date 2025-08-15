import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    MapPin,
    Clock,
    MessageCircle,
    ArrowLeft,
    Send,
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socketService from '../utils/socket';

const CommunityPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/community/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        if (chatId && token) {
            socketService.connect(token);
            socketService.joinChat(chatId);
            socketService.onReceiveMessage((message) => {
                setChatMessages(prev => [...prev, message]);
            });

            return () => {
                socketService.offReceiveMessage();
                socketService.disconnect();
            };
        }
    }, [chatId, token]);

    const handleSendMessage = async () => {
        if (!message.trim() || !user || !chatId) return;

        try {
            socketService.sendMessage(chatId, message.trim());
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/chats/create', {
                communityPostId: post.id,
                userId: post.author.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/chat/${response.data.id}`);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const renderChatSection = () => (
        <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Contact Options</h2>
            <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                            src={post.author?.profile_image || '/default-avatar.png'}
                            alt={post.author?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">{post.author?.name}</h3>
                        <p className="text-sm text-gray-500">{post.author?.email}</p>
                    </div>
                </div>

                {user ? (
                    user.id !== post.userId ? (
                        <button
                            onClick={handleStartChat}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Start Chat with {post.type === 'lost' ? 'Owner' : 'Finder'}
                        </button>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 font-medium">This is your post</p>
                        </div>
                    )
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Login to Start Chat
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) return <div className="p-4">Loading...</div>;
    if (!post) return <div className="p-4">Post not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Gallery */}
                        <div className="p-6">
                            {post.images && post.images.length > 0 && (
                                <>
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                                        <img
                                            src={`http://localhost:3001/uploads/${post.images[0]}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {post.images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {post.images.slice(1).map((img, idx) => (
                                                <div key={idx} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                                                    <img
                                                        src={`http://localhost:3001/uploads/${img}`}
                                                        alt={`${post.title} ${idx + 2}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Post Info */}
                        <div className="p-6">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        <span>{post.category}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {post.location && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>{post.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.description}
                                </p>
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3 overflow-hidden">
                                        <img
                                            src={post.author?.profile_image || '/default-avatar.png'}
                                            alt={`${post.author?.name}'s profile`}
                                            className="h-10 w-10 object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{post.author?.name}</p>
                                        <p className="text-sm text-gray-600">{post.author?.email}</p>
                                        <p className="text-sm text-gray-600">Phone: {post.author?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Button */}
                            {user && user.id !== post.userId && (
                                <button
                                    onClick={handleStartChat}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Contact {post.type === 'lost' ? 'Owner' : 'Finder'}
                                </button>
                            )}

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Login to Contact {post.type === 'lost' ? 'Owner' : 'Finder'}
                                </button>
                            )}

                            {user && user.id === post.userId && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 font-medium">This is your post</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPostDetail;