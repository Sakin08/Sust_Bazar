import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Edit3, Save, X, Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    season: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data from backend
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token from localStorage - check multiple possible keys
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token');
      
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('Please log in to view your profile');
      }

      // Use correct endpoint - note it's /api/user/profile not /api/users/profile
      const endpoint = userId ? `/api/users/${userId}` : '/api/users/profile';
      
      console.log('Fetching from endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('token');
          throw new Error('Your session has expired. Please log in again.');
        }
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      console.log('User data received:', userData);
      
      setUser(userData);
      
      // Initialize form data with current user data
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || '',
        season: userData.season || '',
        address: userData.address || ''
      });
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setError(null);
    setSuccessMessage('');
    // Reset form data to current user values
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      season: user.season || '',
      address: user.address || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      season: user.season || '',
      address: user.address || ''
    });
    setErrors({});
    setError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation (2-50 characters)
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      newErrors.name = "Name must be between 2-50 characters";
    }

    // Email validation (must end with @student.sust.edu)
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.trim().endsWith('@student.sust.edu')) {
      newErrors.email = "Only SUST student emails are allowed (@student.sust.edu)";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (10-15 digits)
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be 10-15 digits only";
    }

    // Department validation
    if (!formData.department?.trim()) {
      newErrors.department = "Department is required";
    }

    // Season validation
    if (!formData.season?.trim()) {
      newErrors.season = "Academic season is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      // Get auth token - check multiple possible keys
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please log in to update your profile');
      }

      const endpoint = userId ? `/api/users/${userId}` : '/api/users/profile';
      
      console.log('Updating profile at endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department.trim(),
          season: formData.season.trim(),
          address: formData.address.trim(),
        }),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('token');
          throw new Error('Your session has expired. Please log in again.');
        }
        
        let errorMessage = `Failed to update profile: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      
      setUser(updatedUser);
      setIsEditing(false);
      setErrors({});
      setSuccessMessage('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating user data:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (when user data couldn't be fetched)
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchUserData}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              {error.includes('log in') && (
                <button
                  onClick={() => {
                    // Redirect to login or trigger login modal
                    console.log('Redirect to login');
                    // window.location.href = '/login'; // Uncomment if you have a login route
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No user data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-green-100 flex items-center mt-1">
                    <GraduationCap size={16} className="mr-2" />
                    SUST Student
                  </p>
                  {user.role === 'admin' && (
                    <div className="flex items-center mt-2">
                      <Shield size={16} className="mr-2" />
                      <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                        Admin
                      </span>
                    </div>
                  )}
                  {user.is_banned && (
                    <div className="mt-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Banned
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">ID: {user.id}</p>
                <p className="text-xs text-green-200 mt-1">
                  Joined: {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Success message */}
          {successMessage && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error message */}
          {error && user && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="mr-2 text-gray-500" />
                Full Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{user.name || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="mr-2 text-gray-500" />
                SUST Email *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.name@student.sust.edu"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{user.email || 'Not provided'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="mr-2 text-gray-500" />
                Phone Number *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="01712345678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{user.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={16} className="mr-2 text-gray-500" />
                Department *
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Civil & Environmental Engineering">Civil & Environmental Engineering</option>
                    <option value="Chemical Engineering & Polymer Science">Chemical Engineering & Polymer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Statistics">Statistics</option>
                    <option value="Economics">Economics</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{user.department || 'Not provided'}</p>
              )}
            </div>

            {/* Season */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="mr-2 text-gray-500" />
                Academic Season *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => handleInputChange('season', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.season ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Spring 2025"
                  />
                  {errors.season && <p className="text-red-500 text-sm mt-1">{errors.season}</p>}
                </div>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{user.season || 'Not provided'}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="mr-2 text-gray-500" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address (optional)"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {user.address || 'No address provided'}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Account Created:</strong> {formatDate(user.created_at)}
              </div>
              <div>
                <strong>Last Updated:</strong> {formatDate(user.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;