import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  MessageCircle,
  User,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products/${id}`);
      console.log('=== PRODUCT DETAIL DEBUG ===');
      console.log('Product data:', response.data);
      console.log('Image URLs:', response.data.image_urls);
      console.log('Image URLs type:', typeof response.data.image_urls);
      setProduct(response.data);
    } catch (error) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setChatLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/chats/create`, {
        productId: product.id
      });
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imageUrls, index = 0) => {
    console.log('Getting image URL for index:', index, 'from:', imageUrls);

    let urls = imageUrls;
    if (typeof imageUrls === 'string') {
      try {
        urls = JSON.parse(imageUrls);
      } catch (e) {
        console.error('Failed to parse image URLs:', e);
        return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=800';
      }
    }

    if (urls && Array.isArray(urls) && urls.length > index && urls[index]) {
      return urls[index];
    }

    return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
                  src={getImageUrl(product.image_urls, 0)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
              </div>
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.image_urls.slice(1, 5).map((_, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(product.image_urls, index + 1)}
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{product.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(product.created_at)}</span>
                    </div>
                  </div>
                </div>
                {product.is_sold && (
                  <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    SOLD
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-4xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3 overflow-hidden">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3 overflow-hidden">
  <img
    src={product.seller?.profile_image || '/default-profile.png'}
    alt={`${product.seller?.name}'s profile`}
    className="h-8 w-8 object-cover rounded-full"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/default-profile.png'; // fallback image if broken
    }}
  />
</div>

                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.seller?.name}</p>
                    <p className="text-sm text-gray-600">{product.seller?.email}</p>
                    <p className="text-sm text-gray-600">Phone: {product.seller?.phone}</p>
                    <p className="text-sm text-gray-600">season: {product.seller?.season}</p>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              {user && user.id !== product.seller_id && !product.is_sold && (
                <button
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {chatLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting Chat...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Seller
                    </div>
                  )}
                </button>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Login to Contact Seller
                </button>
              )}

              {user && user.id === product.seller_id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800 font-medium">This is your listing</p>
                </div>
              )}

              {product.is_sold && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-gray-600 font-medium">This item has been sold</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
