import React from 'react';
import { User, Trash, Tag, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CommunityPostCard = ({ post, currentUser, onDelete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = currentUser?.id === post.userId;

    const handleContact = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Navigate to chat with the post owner
        navigate(`/chats?with=${post.userId}&about=${post.title}`);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
            <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => navigate(`/community/${post.id}`)}
            >
                {/* Post Info */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{post.description}</p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap mt-2 gap-1">
                            {post.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
                                >
                                    <Tag className="h-3 w-3" /> {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        {post.author?.name && (
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" /> {post.author.name}
                            </div>
                        )}

                        {post.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {post.location}
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {(post.priority || 'Normal').charAt(0).toUpperCase() + (post.priority || 'Normal').slice(1)}
                        </div>

                        {post.category && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {post.category}
                            </span>
                        )}
                    </div>

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="flex flex-wrap mt-2 gap-2">
                            {post.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={`http://localhost:3001/uploads/${img}`}
                                    alt="post"
                                    className="h-20 w-20 object-cover rounded"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Button */}
                {isOwner && (
                    <button onClick={() => onDelete(post.id)} className="text-red-500 hover:text-red-700 ml-4">
                        <Trash />
                    </button>
                )}
            </div>

            {/* Move contact buttons outside the clickable area */}
            <div onClick={e => e.stopPropagation()}>
                {/* Contact Button - Add this before the closing div */}
                {!isOwner && user && (
                    <div className="mt-4 border-t pt-4">
                        <button
                            onClick={handleContact}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {post.category === 'Lost & Found'
                                ? post.type === 'lost'
                                    ? "I Found This!"
                                    : "I Lost This!"
                                : "Contact Owner"
                            }
                        </button>
                    </div>
                )}

                {!user && (
                    <div className="mt-4 border-t pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:underline"
                        >
                            Login to contact the {post.type === 'lost' ? 'owner' : 'finder'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPostCard;
