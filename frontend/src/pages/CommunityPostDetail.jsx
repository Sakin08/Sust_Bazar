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
    Calendar
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

    const handleContact = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Create or get existing chat
            const response = await axios.post('http://localhost:3001/api/chats', {
                communityPostId: post.id,
                userId: post.userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setChatId(response.data.id);
            setShowChat(true);

            // Fetch existing messages
            const messagesResponse = await axios.get(`http://localhost:3001/api/chats/${response.data.id}/messages`);
            setChatMessages(messagesResponse.data);
        } catch (error) {
            console.error('Error initiating chat:', error);
        }
    };

    const renderChat = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            <img
                                src={post.author?.profile_image || '/default-avatar.png'}
                                alt={post.author?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold">{post.author?.name}</h3>
                            <p className="text-sm text-gray-600">{post.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowChat(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {/* Chat Messages */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {chatMessages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender_id === user.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-4">Loading...</div>;
    if (!post) return <div className="p-4">Post not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 mb-4 hover:text-gray-900"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
            </button>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {post.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={`http://localhost:3001/uploads/${img}`}
                                alt={`Post image ${idx + 1}`}
                                className="rounded-lg w-full object-cover h-64"
                            />
                        ))}
                    </div>
                )}

                {/* Post Details */}
                <div className="space-y-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {post.location || 'No location specified'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Author Information - Replace the existing author section */}
                    <div className="border-t pt-4 mt-6">
                        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-start space-x-4">
                                {/* Profile Image */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img
                                        src={post.author?.profile_image || '/default-avatar.png'}
                                        alt={post.author?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Contact Details */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-medium text-gray-900">
                                        {post.author?.name}
                                    </h3>
                                    <div className="space-y-1 text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {post.author?.phone || 'No phone number provided'}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {post.author?.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Button */}
                                {user && user.id !== post.userId && (
                                    <button
                                        onClick={handleContact}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Contact Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Button */}
                    {user && user.id !== post.userId && (
                        <div className="mt-6">
                            <button
                                onClick={handleContact}
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Contact {post.category === 'Lost & Found'
                                    ? post.type === 'lost' ? 'Owner' : 'Finder'
                                    : 'Owner'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showChat && renderChat()}
        </div>
    );
};

export default CommunityPostDetail;