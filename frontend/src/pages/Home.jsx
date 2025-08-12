import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Home as HomeIcon, Building } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'all',
    'Electronics',
    'Books',
    'Clothing',
    'Furniture',
    'Sports',
    'Others',
    'Accommodation'  // add this so user can filter accommodations if needed
  ];

  // Helper to parse and get first image url safely (used for both product and accommodation images)
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

  // Combine and sort products + accommodations by creation date descending
  const combinedItems = React.useMemo(() => {
    // Filter items based on category if not "all"
    let filteredProducts = products;
    let filteredAccommodations = accommodations;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'Accommodation') {
        filteredProducts = [];
      } else {
        filteredAccommodations = [];
        filteredProducts = products.filter(p => p.category === selectedCategory);
      }
    }

    const combined = [
      ...filteredProducts.map(p => ({ ...p, type: 'product' })),
      ...filteredAccommodations.map(a => ({ ...a, type: 'accommodation' })),
    ];

    return combined.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      return dateB - dateA;
    });
  }, [products, accommodations, selectedCategory]);

  // Pagination for combinedItems
  const itemsPerPage = 12;
  const paginatedItems = React.useMemo(() => {
    setTotalPages(Math.ceil(combinedItems.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    return combinedItems.slice(start, start + itemsPerPage);
  }, [combinedItems, currentPage]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const [productsRes, accommodationsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/products', {
          params: {
            search: searchTerm,
            category: selectedCategory !== 'Accommodation' ? selectedCategory : 'all', // accommodations filtered separately
            page: 1, // fetch all for now; you can improve with server pagination later
            limit: 1000,
          },
        }),
        axios.get('http://localhost:3001/api/accommodations', {
          params: {
            search: searchTerm,
            // you can add filtering params here if your backend supports
          },
        }),
      ]);

      setProducts(productsRes.data.products || []);
      setAccommodations(accommodationsRes.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to SUSTBazaar
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Buy and sell with your fellow SUST students
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : combinedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedItems.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(item.images || item.image_urls)}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={e => {
                        e.target.src = 'https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {item.type === 'product' ? (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.is_sold ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          }`}
                        >
                          {item.is_sold ? 'SOLD' : 'ACTIVE'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
                          AVAILABLE
                        </span>
                      )}
                    </div>
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white ${
                        item.type === 'product' ? 'bg-blue-500' : 'bg-purple-600'
                      }`}
                    >
                      {item.type === 'product' ? item.category : item.type}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-xl font-bold ${
                        item.type === 'product' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <HomeIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(item.created_at || item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={item.type === 'product' ? `/product/${item.id}` : `/accommodation/${item.id}`}
                        className={`flex-1 px-3 py-2 text-center text-sm font-medium rounded-md transition-colors ${
                          item.type === 'product'
                            ? 'text-blue-600 border border-blue-600 hover:bg-blue-50'
                            : 'text-purple-600 border border-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
