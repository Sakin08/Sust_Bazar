import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, User, Calendar } from 'lucide-react';

const Chats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/chats');
      setChats(response.data);
    } catch (error) {
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (chat) => {
    return chat.user1_id === user.id ? chat.user2 : chat.user1;
  };

  const getImageUrl = (imageUrls) => {
  if (imageUrls && imageUrls.length > 0) {
    // Assuming imageUrls is already an array of full URLs from backend
    return imageUrls[0]; // Use directly, no prefixing
  }
  return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
};


  const formatDate = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return messageDate.toLocaleDateString('en-BD');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Chats</h1>
          <p className="text-gray-600">Conversations with buyers and sellers</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {chats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-4">
              Start a conversation by contacting a seller on a product page.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {chats.map(chat => {
                const otherUser = getOtherUser(chat);
                const lastMessage = chat.messages?.[0];
                
                return (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getImageUrl(chat.product?.image_urls)}
                          alt={chat.product?.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                {otherUser?.name}
                              </p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              {chat.product?.title}
                            </p>
                            <p className="text-sm font-medium text-blue-600 mb-2">
                              ৳{chat.product?.price}
                            </p>
                            
                            {lastMessage && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>
                                  {lastMessage.sender?.id === user.id ? 'You: ' : ''}
                                  {lastMessage.text.length > 50 
                                    ? `${lastMessage.text.substring(0, 50)}...`
                                    : lastMessage.text
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end text-xs text-gray-400">
                            {lastMessage && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(lastMessage.created_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;