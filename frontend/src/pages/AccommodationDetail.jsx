import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAccommodationById, bookAccommodation } from '../services/accommodationService';

export default function AccommodationDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getAccommodationById(id);
        setListing(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load listing');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBook = async () => {
    if (!message) {
      if (!confirm('Send booking request without a message?')) return;
    }
    try {
      await bookAccommodation(id, { message });
      alert('Booking request sent');
    } catch (err) {
      console.error(err);
      alert('Failed to send booking request');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!listing) return <div className="p-4">Listing not found</div>;

  const images = listing.images ? JSON.parse(listing.images) : [];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-sm text-gray-600">{listing.type} • {listing.location} • {listing.gender_preference}</p>
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {images.length ? images.slice(0,3).map((src, i) => (
            <img key={i} src={src} alt="img" className="w-full h-40 object-cover rounded" />
          )) : (
            <div className="bg-gray-100 h-40 flex items-center justify-center rounded text-gray-400">No images</div>
          )}
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <p>{listing.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">৳{listing.price}</div>
            <div className="text-sm text-gray-500">Posted by: {listing.owner?.name} • {listing.owner?.phone}</div>
          </div>
          <div className="w-1/3">
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Add a message (optional)" className="w-full p-2 border rounded" />
            <button onClick={handleBook} className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded">Send Booking Request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
