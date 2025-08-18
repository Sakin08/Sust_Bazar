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
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => setOpen(!open);

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/community/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell size={24} />
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-md z-50">
          <h3 className="font-bold p-2 border-b">Notifications</h3>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-2 text-gray-500">No notifications</li>
            )}
            {notifications.map(n => (
              <li
                key={n.id}
                className={`p-2 border-b cursor-pointer ${n.isRead ? "bg-white" : "bg-gray-100"}`}
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
