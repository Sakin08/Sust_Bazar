import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PostItemPage from './pages/PostItemPage';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostProduct from './pages/PostProduct';
import ProductDetail from './pages/ProductDetail';
import MyProducts from './pages/MyItems';
import Chats from './pages/Chats';
import ChatRoom from './pages/ChatRoom';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// Accommodation pages (import these)
import AccommodationList from './pages/AccommodationList';
import CreateAccommodation from './pages/CreateAccommodation';
import AccommodationDetail from './pages/AccommodationDetail';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import MyItems from './pages/MyItems';

// rest of your code ...


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
            {/* <Route path="/accommodations" element={<AccommodationList />} /> */}
            {/* <Route path="/accommodations/create" element={<CreateAccommodation />} /> */}
            {/* <Route path="/accommodations/:id" element={<AccommodationDetail />} /> */}
            <Route path="/accommodations/bookings/my" element={<MyBookings />} />
            <Route path="/accommodations/bookings/owner" element={<OwnerDashboard />} />

            {/* Private Routes */}
            <Route path="/post" element={
              <PrivateRoute>
                <PostItemPage />
              </PrivateRoute>
            } />




            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/my-products" element={
              <PrivateRoute>
                <MyItems />
              </PrivateRoute>
            } />
            <Route path="/chats" element={
              <PrivateRoute>
                <Chats />
              </PrivateRoute>
            } />
            <Route path="/chat/:chatId" element={
              <PrivateRoute>
                <ChatRoom />
              </PrivateRoute>
            } />

            {/* Admin Route */}
            <Route path="/admin" element={
              <PrivateRoute adminOnly={true}>
                <Admin />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;