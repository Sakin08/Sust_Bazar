import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar,
} from 'lucide-react';

const MyItems = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError('');
      const [productsRes, accommodationsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/products/my-products', { withCredentials: true }),
        axios.get('http://localhost:3001/api/accommodations/my-accommodations', { withCredentials: true }),
      ]);
      setProducts(productsRes.data || []);
      setAccommodations(accommodationsRes.data || []);
    } catch (error) {
      console.error('Fetch My Items error:', error);
      setError('Failed to fetch your items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSold = async (productId, currentStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/products/${productId}`, {
        is_sold: !currentStatus,
      }, { withCredentials: true });
      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_sold: !currentStatus } : p
      ));
    } catch (err) {
      console.error('Toggle Sold error:', err);
      setError('Failed to update product status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/products/${productId}`, { withCredentials: true });
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Delete product error:', err);
      setError('Failed to delete product');
    }
  };

  const handleDeleteAccommodation = async (accommodationId) => {
    if (!window.confirm('Are you sure you want to delete this accommodation?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/accommodations/${accommodationId}`, { withCredentials: true });
      setAccommodations(accommodations.filter(a => a.id !== accommodationId));
    } catch (err) {
      console.error('Delete accommodation error:', err);
      setError('Failed to delete accommodation');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD');
  };

  const getImageUrl = (imageUrls) => {
    if (!imageUrls) return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';

    let urls = imageUrls;
    if (typeof imageUrls === 'string') {
      try {
        urls = JSON.parse(imageUrls);
      } catch {
        return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
      }
    }
    if (Array.isArray(urls) && urls.length > 0) return urls[0];
    return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
            <p className="text-gray-600">Manage your products and accommodations</p>
          </div>
          <Link
            to="/post"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Item
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* PRODUCTS */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 mb-8">No products posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={getImageUrl(product.image_urls)}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                      onError={e => {
                        e.target.src = 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.is_sold ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {product.is_sold ? 'SOLD' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(product.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 px-3 py-2 text-center text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleToggleSold(product.id, product.is_sold)}
                        className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                          product.is_sold
                            ? 'text-green-600 border border-green-600 hover:bg-green-50'
                            : 'text-red-600 border border-red-600 hover:bg-red-50'
                        }`}
                      >
                        {product.is_sold ? (
                          <>
                            <XCircle className="inline h-3 w-3 mr-1" />
                            Mark Available
                          </>
                        ) : (
                          <>
                            <CheckCircle className="inline h-3 w-3 mr-1" />
                            Mark Sold
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-2 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ACCOMMODATIONS */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Accommodations</h2>
          {accommodations.length === 0 ? (
            <p className="text-gray-500">No accommodations posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accommodations.map(acc => (
                <div key={acc.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={getImageUrl(acc.images)}
                      alt={acc.title}
                      className="w-full h-48 object-cover"
                      onError={e => {
                        e.target.src = 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
                        AVAILABLE
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {acc.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {acc.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{acc.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-blue-600">{formatPrice(acc.price)}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(acc.createdAt || acc.created_at)}</span>
                      </div>
                    </div>
                                        <div className="flex space-x-2">
                      <Link
                        to={`/accommodation/${acc.id}`}
                        className="flex-1 px-3 py-2 text-center text-sm font-medium text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteAccommodation(acc.id)}
                        className="px-3 py-2 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyItems;

