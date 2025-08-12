import React, { useEffect, useState } from 'react';
import api from '../services/accommodationService';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">My Booking Requests</h2>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="p-3 border rounded bg-white flex justify-between">
            <div>
              <div className="font-semibold">{b.accommodation?.title}</div>
              <div className="text-sm text-gray-500">Status: {b.status}</div>
            </div>
            <div className="text-sm text-gray-500">Requested on: {new Date(b.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
