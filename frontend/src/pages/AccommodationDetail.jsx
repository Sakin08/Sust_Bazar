import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  MessageCircle,
  User,
  DollarSign,
  Tag,
  ArrowLeft,
  MapPin
} from 'lucide-react';


const AccommodationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/accommodations/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
        setError('Accommodation not found');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, backendUrl]);

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setChatLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/chats/create`, {
        accommodationId: listing.id,
      });
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(price);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accommodation Not Found</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => navigate('/accommodations')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to List
        </button>
      </div>
    </div>
  );

  const images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images || [];

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
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={images[0] || '/default-image.png'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = '/default-image.png'}
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={src || '/default-image.png'}
                        alt={`${listing.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/default-image.png'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Info */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>{listing.type}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{listing.gender_preference}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  {/* <DollarSign className="h-6 w-6 text-green-600 mr-2" /> */}
                  <span className="text-4xl font-bold text-green-600">{formatPrice(listing.price)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Owner Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 overflow-hidden">
                    <img
                      src={listing.owner?.profile_image || '/default-profile.png'}
                      alt={listing.owner?.name}
                      className="h-10 w-10 object-cover rounded-full"
                      onError={(e) => e.target.src = '/default-profile.png'}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{listing.owner?.name}</p>
                    <p className="text-sm text-gray-600">Email: {listing.owner?.email}</p>
                    <p className="text-sm text-gray-600">Phone: {listing.owner?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              {user && listing.userId && (
                user.id !== listing.userId ? (
                  <button
                    onClick={handleStartChat}
                    disabled={chatLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    {chatLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Starting Chat...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contact Owner
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-yellow-50 border border-yellow-200 py-3 px-4 rounded-md font-medium cursor-not-allowed"
                  >
                    This is your listing
                  </button>
                )
              )}


              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-yellow-800 font-medium bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Login to Contact Owner
                </button>
              )}

              {user && user.id === listing.owner_id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-2">
                  <p className="text-yellow-800 font-medium">This is your listing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetail;
