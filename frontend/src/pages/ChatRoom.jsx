import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socketService from '../utils/socket';
import { Send, ArrowLeft, User, MapPin, Tag, DollarSign } from 'lucide-react';

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
    const fetchChatMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/chats/${chatId}/messages`);
        setMessages(response.data);

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

    fetchChatMessages();

    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      socketService.joinChat(chatId);
      socketService.onReceiveMessage((message) => setMessages(prev => [...prev, message]));
    }

    return () => {
      socketService.offReceiveMessage();
      socketService.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const getOtherUser = () => chat?.user1_id === user.id ? chat.user2 : chat.user1;
  const getItem = () => chat?.product || chat?.accommodation;
  const getImageUrl = (images) => {
    if (!images) return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
    if (typeof images === 'string') return JSON.parse(images)[0] || '';
    return images[0];
  };
  const formatMessageTime = (date) => new Date(date).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === today.toDateString()) return 'Today';
    if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return messageDate.toLocaleDateString('en-BD');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
    </div>
  );

  const otherUser = getOtherUser();
  const item = getItem();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
{/* Header */}
<div className="bg-white shadow sticky top-0 z-10 border-b">
  <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
    {/* Left: Image + User Info */}
    <div className="flex items-center space-x-3">
      <img
        src={getImageUrl(item.images || item.image_urls)}
        alt={item.title || item.name}
        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
      />
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{item.title || item.name}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <User className="h-4 w-4" />
          <span>{otherUser?.name}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400 text-xs">{otherUser?.email}</span>
        </div>
      </div>
    </div>

    {/* Right: Price */}
    <div className="text-right">
      <p className="text-lg font-bold text-blue-600">
        {item.price ? `৳${item.price}` : '-'}
      </p>
    </div>
  </div>
</div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => {
            const isOwn = msg.sender_id === user.id;
            const showDate = idx === 0 || formatMessageDate(messages[idx - 1].created_at) !== formatMessageDate(msg.created_at);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center py-2">
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {formatMessageDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-xs lg:max-w-md break-words shadow ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-3 shadow-inner">
        <div className="max-w-3xl mx-auto flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 px-5 py-2 rounded-r-xl text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
