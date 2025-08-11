import React, { useState, useEffect, useContext } from 'react';
import { useAuth, AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Users,
  Package,
  MessageCircle,
  BarChart3,
  Ban,
  CheckCircle,
  Trash2,
  Calendar
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { backendUrl } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes, productsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/stats`),
        axios.get(`${backendUrl}/api/admin/users`),
        axios.get(`${backendUrl}/api/admin/products`)
      ]);


      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      await axios.put(`${backendUrl}/api/admin/users/${userId}/ban`, {
        banned: !isBanned
      });

      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_banned: !isBanned } : u
      ));
    } catch (error) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${backendUrl}/api/admin/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD');
  };

  const getImageUrl = (imageUrls) => {
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const firstUrl = imageUrls[0];
      // Check if firstUrl starts with "http" (full URL)
      if (firstUrl.startsWith('http')) {
        return firstUrl; // full URL, return as is
      } else {
        // relative path, prepend backendUrl
        return `${backendUrl}${firstUrl}`;
      }
    }
    // fallback image
    return 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and monitor platform activity</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <BarChart3 className="inline h-5 w-5 mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users className="inline h-5 w-5 mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Package className="inline h-5 w-5 mr-2" />
              Products ({products.length})
            </button>
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.profile_image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                            <div className="text-sm text-gray-500">{user.season}</div>
                          </div>
                        </div>

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_banned
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {user.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleBanUser(user.id, user.is_banned)}
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${user.is_banned
                              ? 'text-green-700 bg-green-100 hover:bg-green-200'
                              : 'text-red-700 bg-red-100 hover:bg-red-200'
                              }`}
                          >
                            {user.is_banned ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Ban
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getImageUrl(product.image_urls)}
                            alt={product.title}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{product.seller?.name}</div>
                        <div className="text-sm text-gray-500">📧 {product.seller?.email}</div>
                        <div className="text-sm text-gray-500">📞 {product.seller?.phone}</div>
                        <div className="text-sm text-gray-500">🎓 {product.seller?.season}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_sold
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {product.is_sold ? 'Sold' : 'Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="inline-flex items-center px-3 py-1 rounded text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;