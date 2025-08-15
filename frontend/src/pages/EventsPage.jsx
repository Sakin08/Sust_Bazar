import { useEffect, useState } from 'react';
import axios from 'axios';
import Countdown from '../components/Countdown';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    media: null
  });

  // Fetch events
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/events', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [token]);

  // Post new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!user) return alert('Login required');

    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('description', newEvent.description);
    formData.append('event_date', newEvent.event_date);
    formData.append('created_by', user.id);
    if (newEvent.media) formData.append('media', newEvent.media);

    try {
      const res = await axios.post('http://localhost:3001/api/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setEvents([res.data, ...events]);
      setNewEvent({ title: '', description: '', event_date: '', media: null });
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    }
  };

  // Sort nearest events
  const nearestEvents = [...events]
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>

      {/* Post Event Section */}
      {user && (
        <form onSubmit={handleCreateEvent} className="p-4 border rounded bg-white space-y-2">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            required
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
            className="border p-2 rounded w-full"
          ></textarea>
          <input
            type="datetime-local"
            value={newEvent.event_date}
            onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setNewEvent({ ...newEvent, media: e.target.files[0] })}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Event
          </button>
        </form>
      )}

      {/* Nearest Events Countdown */}
      <div className="p-4 border rounded bg-yellow-50">
        <h2 className="font-semibold mb-2">Upcoming Events</h2>
        {nearestEvents.map(event => (
          <div key={event.id} className="flex justify-between mb-1">
            <span>{event.title}</span>
            <Countdown eventDate={event.event_date} />
          </div>
        ))}
      </div>

      {/* Event Timeline */}
      <div className="space-y-4">
        <h2 className="font-semibold mb-2">Event Timeline</h2>
        {events.map(event => (
          <div key={event.id} className="p-4 border rounded bg-white flex flex-col gap-2">
            {/* Event Title */}
            <h3 className="font-semibold text-lg">{event.title}</h3>

            {/* Event Description */}
            <p>{event.description}</p>

            {/* Event Media */}
            {event.media_url && (
              <img
                src={event.media_url} // Cloudinary URL
                alt={event.title}
                className="w-full max-h-60 object-cover rounded"
              />
            )}

            {/* Creator Info */}
            {event.creator && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                {event.creator.profile_image ? (
                  <img
                    src={event.creator.profile_image} // Cloudinary profile image URL
                    alt={event.creator.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {event.creator.name[0]}
                  </div>
                )}
                <span>{event.creator.name} ({event.creator.email})</span>
              </div>
            )}

            {/* Event Date & Countdown */}
            <div className="text-gray-700 mt-1">
              Event Date: {new Date(event.event_date).toLocaleString()}
            </div>
            <div className="text-gray-700">
              Countdown: <Countdown eventDate={event.event_date} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
