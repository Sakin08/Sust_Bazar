import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

 const fetchNotifications = async () => {
  try {
    const res = await axios.get("/api/community/notifications");
    // Ensure you get an array
    const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
    setNotifications(data);
  } catch (err) {
    console.error(err);
    setNotifications([]); // fallback to empty array
  }
};

  const toggleDropdown = () => setOpen(!open);

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/community/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-md z-50">
          <h3 className="font-bold p-2 border-b">Notifications</h3>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-2 text-gray-500">No notifications</li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-2 border-b cursor-pointer ${
                  n.isRead ? "bg-white" : "bg-gray-100"
                }`}
                onClick={() => markAsRead(n.id)}
              >
                <p>{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
