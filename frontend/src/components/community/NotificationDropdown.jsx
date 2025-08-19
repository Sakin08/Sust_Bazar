import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

const NotificationDropdown = ({ setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/community/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
      setNotifications(data);

      // Update unread count for navbar badge
      if (setUnreadCount) {
        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
  };

  // Mark all notifications as read
const toggleDropdown = () => {
  setOpen(!open);

  // If opening the dropdown, mark all unread notifications as read
  if (!open) markAllAsRead();
};

const markAllAsRead = async () => {
  try {
    // Send API requests to mark unread notifications as read
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) =>
          axios.post(`http://localhost:3001/api/community/notifications/${n.id}/read`)
        )
    );

    // Update local state to reflect that all notifications are read
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);

    // Update the unread badge count in Navbar
    if (setUnreadCount) setUnreadCount(0);
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="relative">
        <Bell size={24} />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
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
