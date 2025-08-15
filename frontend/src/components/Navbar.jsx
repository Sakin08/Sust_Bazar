import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  User,
  LogOut,
  Plus,
  MessageCircle,
  Settings,
  ChevronDown,
  UserCircle,
} from 'lucide-react';

const NavLinks = ({ isActive }) => {
  const links = [
    { to: '/', label: 'Browse' },
    { to: '/post', label: 'Post Item', icon: Plus },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    // { to: '/accommodations', label: 'Accommodations' },
    // { to: '/my-bookings', label: 'My Bookings' },
    // // { to: '/owner-dashboard', label: 'Accommodation Dashboard' },
    // { to: '/my-products', label: 'My Items' },
    // in NavLinks
    { to: '/community', label: 'Community' },
     { to: '/events', label: 'Events' },  
    

  ];

  return (
    <>
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive(to)
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {Icon && <Icon className="inline h-4 w-4 mr-1" />}
          {label}
        </Link>
      ))}
    </>
  );
};

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
            {/* <p className="text-sm text-gray-500">{user.email}</p> */}
          </div>

          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="h-4 w-4 mr-3" />
            Profile
          </Link>

          {/* My Bookings */}
          <Link
            to="/my-bookings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="h-4 w-4 mr-3" />
            My Bookings
          </Link>

          {/* My Items */}
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SUSTBazaar</span>
          </Link>

          {/* Navigation Links (only show if user logged in) */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? <NavLinks isActive={isActive} /> : null}
          </div>

          {/* User Menu or Auth Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
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
