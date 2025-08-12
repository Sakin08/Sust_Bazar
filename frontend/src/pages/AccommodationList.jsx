import React, { useEffect, useState } from 'react';
import { getAccommodations } from '../services/accommodationService';
import { Link } from 'react-router-dom';

export default function AccommodationList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', gender: '', q: '' });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getAccommodations(params);
      console.log('Accommodations API response:', res.data);

      // If API returns an object with 'rows' property containing the array:
      if (res.data && Array.isArray(res.data.rows)) {
        setListings(res.data.rows);
      } 
      // If API directly returns an array:
      else if (Array.isArray(res.data)) {
        setListings(res.data);
      } 
      else {
        setListings([]);
        console.warn('Accommodations data is not an array:', res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.gender) params.gender_preference = filters.gender;
    if (filters.q) params.q = filters.q;
    fetchListings(params);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Accommodations</h1>
        <Link to="/accommodations/create" className="px-4 py-2 bg-blue-600 text-white rounded">Post a Listing</Link>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select name="type" value={filters.type} onChange={handleFilter} className="p-2 border rounded">
            <option value="">All types</option>
            <option value="Flat">Flat</option>
            <option value="Room">Room</option>
            <option value="Seat">Seat</option>
          </select>
          <select name="gender" value={filters.gender} onChange={handleFilter} className="p-2 border rounded">
            <option value="">Any gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Any">Any</option>
          </select>
          <input name="q" value={filters.q} onChange={handleFilter} placeholder="Search..." className="p-2 border rounded" />
          <button onClick={applyFilters} className="px-4 py-2 bg-green-600 text-white rounded">Apply</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.length === 0 && <div className="text-gray-600">No listings found.</div>}
          {listings.map(item => (
            <div key={item.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.type} • {item.location}</p>
                  <p className="mt-2">{item.description?.slice(0, 120)}{item.description?.length > 120 ? '...' : ''}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">৳{item.price}</div>
                  <div className="text-sm text-gray-500">{item.gender_preference}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Link to={`/accommodations/${item.id}`} className="text-blue-600">View</Link>
                <div className="text-sm text-gray-500">Posted by: {item.owner?.name || 'Unknown'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
