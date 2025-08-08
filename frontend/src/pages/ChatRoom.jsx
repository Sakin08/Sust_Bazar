import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socketService from '../utils/socket';
import { Send, ArrowLeft, User } from 'lucide-react';

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatMessages();
    
    // Connect socket and join chat room
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      socketService.joinChat(chatId);
      
      socketService.onReceiveMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
    }

    return () => {
      socketService.offReceiveMessage();
      socketService.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/chats/${chatId}/messages`);
      setMessages(response.data);
      
      // Fetch chat details if we don't have them
      if (!chat) {
        const chatResponse = await axios.get(`http://localhost:3001/api/chats`);
        const currentChat = chatResponse.data.find(c => c.id.toString() === chatId);
        setChat(currentChat);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      navigate('/chats');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      socketService.sendMessage(chatId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = () => {
    if (!chat) return null;
    return chat.user1_id === user.id ? chat.user2 : chat.user1;
  };

  const getImageUrl = (imageUrls) => {
  if (imageUrls && imageUrls.length > 0) {
    // Assuming imageUrls is already an array of full URLs from backend
    return imageUrls[0]; // Use directly, no prefixing
  }
  return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
};
  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
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

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chats')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              {chat && (
                <div className="flex items-center space-x-3">
                  <img
                    src={getImageUrl(chat.product?.image_urls)}
                    alt={chat.product?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {chat.product?.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{otherUser?.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {chat && (
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  ৳{chat.product?.price}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user.id;
              const showDate = index === 0 || 
                formatMessageDate(messages[index - 1].created_at) !== formatMessageDate(message.created_at);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center py-2">
                      <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {formatMessageDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}>
                      <p className="break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;