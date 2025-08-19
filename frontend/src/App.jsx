import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import MyItems from './pages/MyItems';
import Chats from './pages/Chats';
import ChatRoom from './pages/ChatRoom';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import PostItemPage from './pages/PostItemPage';
import CommunityPage from './pages/CommunityPage';
import CommunityPostDetail from './pages/CommunityPostDetail';
import EventsPage from './pages/EventsPage';

// Accommodation Pages
import AccommodationList from './pages/AccommodationList';
import AccommodationDetail from './pages/AccommodationDetail';
import MyBookings from './pages/MyBookings';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/accommodations" element={<AccommodationList />} />
            <Route path="/accommodation/:id" element={<AccommodationDetail />} />
            <Route path="/accommodations/bookings/my" element={<MyBookings />} />

            {/* Private Routes */}
            <Route
              path="/post"
              element={
                <PrivateRoute>
                  <PostItemPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community"
              element={
                <PrivateRoute>
                  <CommunityPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community/:id"
              element={
                <PrivateRoute>
                  <CommunityPostDetail />
                </PrivateRoute>
              }
            />
            {/* Profile Routes */}
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>
<Route
  path="/profile/:id"
  element={
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  }
/>

            <Route
              path="/my-products"
              element={
                <PrivateRoute>
                  <MyItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <PrivateRoute>
                  <Chats />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <PrivateRoute>
                  <ChatRoom />
                </PrivateRoute>
              }
            />

            {/* Events */}
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <EventsPage />
                </PrivateRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly={true}>
                  <Admin />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
