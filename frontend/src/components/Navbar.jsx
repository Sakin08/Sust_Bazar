import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ShoppingBag,
  User,
  LogOut,
  Plus,
  MessageCircle,
  Settings,
  ChevronDown,
  UserCircle,
  Bell,
} from 'lucide-react';

// ---------------- NavLinks Component ----------------
const NavLinks = ({ isActive, unreadCount }) => {
  const links = [
    { to: '/', label: 'Browse' },
    { to: '/post', label: 'Post Item', icon: Plus },
    { to: '/chats', label: 'Chats', icon: MessageCircle, badge: unreadCount },
    { to: '/community', label: 'Community' },
    { to: '/events', label: 'Events' },
  ];

  return (
    <>
      {links.map(({ to, label, icon: Icon, badge }) => (
        <Link
          key={to}
          to={to}
          className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive(to)
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {Icon && <Icon className="inline h-4 w-4 mr-1" />}
          {label}
          {badge > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {badge}
            </span>
          )}
        </Link>
      ))}
    </>
  );
};

// ---------------- UserMenu Component ----------------
const UserMenu = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt="Profile"
              className="h-8 w-8 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.png';
              }}
            />
          ) : (
            <User className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <span className="hidden sm:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>

          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="h-4 w-4 mr-3" />
            Profile
          </Link>

          <Link
            to="/my-bookings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="h-4 w-4 mr-3" />
            My Bookings
          </Link>

          <Link
            to="/my-products"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Plus className="h-4 w-4 mr-3" />
            My Items
          </Link>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------- AuthLinks Component ----------------
const AuthLinks = () => (
  <div className="flex items-center space-x-4">
    <Link
      to="/login"
      className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
    >
      Login
    </Link>
    <Link
      to="/register"
      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
    >
      Register
    </Link>
  </div>
);

// ---------------- NotificationDropdown Component ----------------
const NotificationDropdown = ({ setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/community/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
      setNotifications(data);

      if (setUnreadCount) {
        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
  };

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) markAllAsRead(); // mark all as read when opening
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.isRead).map((n) =>
          axios.post(`http://localhost:3001/api/community/notifications/${n.id}/read`)
        )
      );
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
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
                  n.isRead ? 'bg-white' : 'bg-gray-100'
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

// ---------------- Navbar Component ----------------
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  // Fetch unread messages
  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        let count = 0;
        response.data.forEach(chat => {
          chat.messages?.forEach(msg => {
            if (!msg.is_read && msg.sender_id !== user.id) count++;
          });
        });

        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread messages:', err);
      }
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SUSTBazaar</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user && <NavLinks isActive={isActive} unreadCount={unreadCount} />}
          </div>

          {/* User Menu & Notifications */}
          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                <NotificationDropdown setUnreadCount={setUnreadCount} />
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}
                <UserMenu user={user} logout={logout} />
              </>
            ) : (
              <AuthLinks />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
