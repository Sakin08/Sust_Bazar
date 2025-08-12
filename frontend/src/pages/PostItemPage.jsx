import React, { useState } from 'react';
import PostProduct from './PostProduct'; // your existing product form
import CreateAccommodation from './CreateAccommodation'; // your existing accommodation form

export default function PostItemPage() {
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'accommodation'

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Post New Listing</h1>

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('product')}
          className={`px-5 py-2 rounded-md font-semibold ${
            activeTab === 'product' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Sell Product
        </button>
        <button
          onClick={() => setActiveTab('accommodation')}
          className={`px-5 py-2 rounded-md font-semibold ${
            activeTab === 'accommodation' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Post Accommodation
        </button>
      </div>

      {/* Conditionally Render Form */}
      {activeTab === 'product' && <PostProduct />}
      {activeTab === 'accommodation' && <CreateAccommodation />}
    </div>
  );
}
