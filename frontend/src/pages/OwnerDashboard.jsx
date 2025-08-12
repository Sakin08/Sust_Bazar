import React, { useEffect, useState } from 'react';
import api, { updateBookingStatus } from '../services/accommodationService';

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/owner');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await updateBookingStatus(id, { status: action });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Incoming Booking Requests</h2>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="p-3 border rounded bg-white flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.accommodation?.title}</div>
              <div className="text-sm text-gray-500">From: {b.renter?.name} • {b.message}</div>
            </div>
            <div className="flex gap-2">
              {b.status === 'pending' ? (
                <>
                  <button onClick={() => handleAction(b.id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => handleAction(b.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </>
              ) : (
                <div className="text-sm text-gray-500">{b.status}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}