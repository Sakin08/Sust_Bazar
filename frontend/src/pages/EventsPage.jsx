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
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/events', { headers: { Authorization: `Bearer ${token}` } });
      // Filter out past events
      const upcoming = res.data.filter(ev => new Date(ev.event_date) > new Date());
      setEvents(upcoming);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, [token]);

  // Create event
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
      await axios.post('http://localhost:3001/api/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setNewEvent({ title: '', description: '', event_date: '', media: null });
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>

      {/* Post Event */}
      {user && (
        <form onSubmit={handleCreateEvent} className="p-4 border rounded bg-white space-y-2">
          <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required className="border p-2 rounded w-full" />
          <textarea placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="border p-2 rounded w-full"></textarea>
          <input type="datetime-local" value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} required className="border p-2 rounded w-full" />
          <input type="file" accept="image/*" onChange={e => setNewEvent({ ...newEvent, media: e.target.files[0] })} className="w-full" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Post Event</button>
        </form>
      )}

      {/* Event Timeline */}
      <div className="space-y-4">
        <h2 className="font-semibold mb-2">Event Timeline</h2>
        {events.map(event => (
          <div key={event.id} className="p-4 border rounded bg-white flex flex-col gap-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p>{event.description}</p>

            {/* Event Media */}
            {event.media_url && <img src={event.media_url} alt={event.title} className="w-full max-h-60 object-cover rounded" />}

            {/* Creator */}
            {event.creator && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                {event.creator.profile_image ? (
                  <img src={event.creator.profile_image} alt={event.creator.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">{event.creator.name[0]}</div>
                )}
                <span>{event.creator.name} ({event.creator.email})</span>
              </div>
            )}

            <div className="text-gray-700 mt-1">Event Date: {new Date(event.event_date).toLocaleString()}</div>
            <div className="text-gray-700">Countdown: <Countdown eventDate={event.event_date} /></div>

            {/* Delete button */}
            {(user.id === event.created_by || user.role === 'admin') && (
              <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-600 text-white px-3 py-1 rounded mt-2 hover:bg-red-700 w-32">
                Delete Event
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
